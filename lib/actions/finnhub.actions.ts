"use server";

import {
    getDateRange,
    calculateNewsDistribution,
    validateArticle,
    formatArticle,
} from "@/lib/utils";

// `RawNewsArticle` and `Alert` are treated as ambient/global types here,
// the same way /lib/utils.ts consumes them (no import there either) —
// they're assumed to live in a shared d.ts (e.g. /types/global.d.ts).

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY =
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

// The exact shape returned by utils' formatArticle().
export type MarketNewsArticle = ReturnType<typeof formatArticle>;

type FetchOptionsWithRevalidate = RequestInit & {
    next?: { revalidate?: number };
};

async function fetchJSON<T>(
    url: string,
    revalidateSeconds?: number
): Promise<T> {
    const options: FetchOptionsWithRevalidate = revalidateSeconds
        ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
        : { cache: "no-store" };

    const res = await fetch(url, options);

    if (!res.ok) {
        throw new Error(
            `Finnhub request failed with status ${res.status}: ${res.statusText}`
        );
    }

    return (await res.json()) as T;
}

/**
 * Fetches recent market news.
 *
 * With `symbols`: round-robins through the user's (cleaned/uppercased)
 * symbols for up to 6 rounds, pulling one not-yet-used valid article per
 * round per symbol, capped per-symbol by `calculateNewsDistribution` and
 * capped overall at its `targetNewsCount` (6).
 *
 * Without `symbols`: falls back to general market news, deduplicated by
 * id/url/headline, capped at 6.
 *
 * Never throws for a single symbol's failure — only a total failure
 * raises "Failed to fetch news".
 */
export async function getNews(
    symbols?: string[]
): Promise<MarketNewsArticle[]> {
    try {
        const { from, to } = getDateRange(5);

        if (symbols && symbols.length > 0) {
            const cleanSymbols = Array.from(
                new Set(
                    symbols
                        .map((symbol) => symbol.trim().toUpperCase())
                        .filter((symbol) => symbol.length > 0)
                )
            );

            if (cleanSymbols.length === 0) {
                return getNews();
            }

            const { itemsPerSymbol, targetNewsCount } = calculateNewsDistribution(
                cleanSymbols.length
            );

            // Pre-fetch each symbol's company news once, filtering to valid
            // articles up front so the round-robin loop just pulls the next one.
            const articlesBySymbol = new Map<string, RawNewsArticle[]>();

            await Promise.all(
                cleanSymbols.map(async (symbol) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(
                            symbol
                        )}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;

                        const articles = await fetchJSON<RawNewsArticle[]>(url);
                        articlesBySymbol.set(
                            symbol,
                            articles.filter((article) => validateArticle(article))
                        );
                    } catch (err) {
                        console.error(
                            `getNews: failed to fetch company news for ${symbol}`,
                            err
                        );
                        articlesBySymbol.set(symbol, []);
                    }
                })
            );

            const usedCountBySymbol = new Map<string, number>();
            const collected: MarketNewsArticle[] = [];
            const maxRounds = 6;

            for (
                let round = 0;
                round < maxRounds && collected.length < targetNewsCount;
                round++
            ) {
                const symbol = cleanSymbols[round % cleanSymbols.length];
                const usedCount = usedCountBySymbol.get(symbol) ?? 0;

                if (usedCount >= itemsPerSymbol) continue;

                const available = articlesBySymbol.get(symbol) ?? [];
                const nextArticle = available[usedCount];

                if (!nextArticle) continue;

                collected.push(formatArticle(nextArticle, true, symbol, usedCount));
                usedCountBySymbol.set(symbol, usedCount + 1);
            }

            return collected
                .sort((a, b) => b.datetime - a.datetime)
                .slice(0, targetNewsCount);
        }

        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
        const generalArticles = await fetchJSON<RawNewsArticle[]>(
            generalUrl,
            300
        );

        const seen = new Set<string>();
        const deduped: RawNewsArticle[] = [];

        for (const article of generalArticles) {
            if (!validateArticle(article)) continue;

            const dedupeKey = String(
                article.id ?? article.url ?? article.headline ?? ""
            );
            if (!dedupeKey || seen.has(dedupeKey)) continue;

            seen.add(dedupeKey);
            deduped.push(article);

            if (deduped.length >= 6) break;
        }

        return deduped.map((article, index) =>
            formatArticle(article, false, undefined, index)
        );
    } catch (err) {
        console.error("getNews error:", err);
        throw new Error("Failed to fetch news");
    }
}


export type StockSearchResult = {
    symbol: string;
    description: string;
    displaySymbol: string;
    type: string;
};

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    const res = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
    );

    if (!res.ok) {
        throw new Error(`Finnhub search failed: ${res.status}`);
    }

    const data = await res.json();

    return (data.result || [])
        .filter((item: any) => item.type === "Common Stock")
        .slice(0, 10);
}

export type StockQuoteData = {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number | null;
    peRatio: number | null;
};

export async function getQuoteData(symbol: string): Promise<StockQuoteData> {
    const token = NEXT_PUBLIC_FINNHUB_API_KEY;

    const [quote, profile, metric] = await Promise.all([
        fetchJSON<{ c: number; d: number; dp: number }>(
            `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${token}`
        ),
        fetchJSON<{ marketCapitalization?: number }>(
            `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${token}`
        ).catch(() => ({ marketCapitalization: undefined } as { marketCapitalization?: number })),
        fetchJSON<{ metric?: { peBasicExclExtraTTM?: number } }>(
            `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${token}`
        ).catch(() => ({ metric: undefined } as { metric?: { peBasicExclExtraTTM?: number } })),
    ]);

    return {
        symbol,
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        marketCap: profile.marketCapitalization ?? null,
        peRatio: metric.metric?.peBasicExclExtraTTM ?? null,
    };
}