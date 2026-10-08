"use server";

import {
    SECTOR_ETFS,
    WORLD_EQUITY_GROUPS,
    type Instrument,
} from "@/lib/market-data";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

type CachedInit = RequestInit & { next?: { revalidate?: number } };

// Cached fetch: identical URLs are shared between users/pages for `revalidate` seconds,
// which keeps us far below Finnhub's free limit (60 calls/min).
async function finnhub<T>(path: string, revalidate: number): Promise<T> {
    const init: CachedInit = { cache: "force-cache", next: { revalidate } };
    const res = await fetch(`${FINNHUB_BASE_URL}${path}&token=${API_KEY}`, init);
    if (!res.ok) throw new Error(`Finnhub ${res.status} on ${path.split("?")[0]}`);
    return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Quotes: World Equity Indices (WEI) and sector breakdown             */
/* ------------------------------------------------------------------ */

export type QuoteRow = {
    symbol: string;
    name: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    ytd: number | null; // % year-to-date
    time: number | null; // unix seconds of last trade
};

type RawQuote = { c: number; d: number | null; dp: number | null; t: number };
type RawMetric = { metric?: Record<string, number | string | null> };

async function getQuoteRow(inst: Instrument, withYtd: boolean): Promise<QuoteRow> {
    const [quote, metric] = await Promise.all([
        finnhub<RawQuote>(`/quote?symbol=${inst.symbol}`, 30).catch(() => null),
        withYtd
            ? finnhub<RawMetric>(`/stock/metric?symbol=${inst.symbol}&metric=all`, 3600).catch(
                  () => null
              )
            : Promise.resolve(null),
    ]);

    const ok = quote && quote.c > 0;
    const ytdRaw = metric?.metric?.yearToDatePriceReturnDaily;

    return {
        symbol: inst.symbol,
        name: inst.name,
        price: ok ? quote.c : null,
        change: ok ? quote.d : null,
        changePercent: ok ? quote.dp : null,
        ytd: typeof ytdRaw === "number" ? ytdRaw : null,
        time: ok && quote.t ? quote.t : null,
    };
}

export type WorldIndexGroup = { code: string; label: string; rows: QuoteRow[] };

export async function getWorldIndices(): Promise<WorldIndexGroup[]> {
    return Promise.all(
        WORLD_EQUITY_GROUPS.map(async (group) => ({
            code: group.code,
            label: group.label,
            rows: await Promise.all(group.items.map((i) => getQuoteRow(i, true))),
        }))
    );
}

export async function getSectorPerformance(): Promise<QuoteRow[]> {
    const rows = await Promise.all(SECTOR_ETFS.map((i) => getQuoteRow(i, false)));
    return rows.sort((a, b) => (b.changePercent ?? -Infinity) - (a.changePercent ?? -Infinity));
}

/* ------------------------------------------------------------------ */
/* Headlines (terminal-style news ticker)                              */
/* ------------------------------------------------------------------ */

export type Headline = {
    id: number;
    headline: string;
    source: string;
    url: string;
    datetime: number; // unix seconds
};

const HEADLINE_CATEGORIES = ["general", "forex", "crypto", "merger"] as const;
export type HeadlineCategory = (typeof HEADLINE_CATEGORIES)[number];

export async function getHeadlines(
    limit = 12,
    category: HeadlineCategory = "general"
): Promise<Headline[]> {
    const safeLimit = Math.min(Math.max(Math.floor(limit) || 12, 1), 30);
    const safeCategory = HEADLINE_CATEGORIES.includes(category) ? category : "general";

    const raw = await finnhub<RawNewsArticle[]>(`/news?category=${safeCategory}`, 60);

    const seen = new Set<string>();
    const out: Headline[] = [];

    for (const a of [...raw].sort((x, y) => (y.datetime ?? 0) - (x.datetime ?? 0))) {
        if (!a.headline || !a.url || !a.datetime) continue;
        const key = a.headline.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
            id: a.id,
            headline: a.headline.trim(),
            source: a.source ?? "",
            url: a.url,
            datetime: a.datetime,
        });
        if (out.length >= safeLimit) break;
    }
    return out;
}

/* ------------------------------------------------------------------ */
/* Stock analysis (KEY / ANR / EE / RV style panels)                   */
/* ------------------------------------------------------------------ */

export type StockAnalysisData = {
    metrics: {
        high52: number | null;
        low52: number | null;
        beta: number | null;
        pe: number | null;
        eps: number | null;
        priceToSales: number | null;
        priceToBook: number | null;
        dividendYield: number | null;
        netMargin: number | null;
        roe: number | null;
        revenueGrowth: number | null;
        ytdReturn: number | null;
        return52w: number | null;
        avgVolume10d: number | null; // millions
    } | null;
    recommendation: {
        period: string;
        strongBuy: number;
        buy: number;
        hold: number;
        sell: number;
        strongSell: number;
    } | null;
    earnings: {
        period: string;
        actual: number | null;
        estimate: number | null;
        surprisePercent: number | null;
    }[];
    peers: QuoteRow[];
};

type RawRecommendation = {
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
};

type RawEarning = {
    period: string;
    actual: number | null;
    estimate: number | null;
    surprisePercent: number | null;
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function getStockAnalysis(symbol: string): Promise<StockAnalysisData> {
    const sym = symbol.trim().toUpperCase();
    // Server actions are public endpoints: never forward arbitrary input to the API.
    if (!/^[A-Z0-9.\-]{1,12}$/.test(sym)) {
        return { metrics: null, recommendation: null, earnings: [], peers: [] };
    }

    const [metricRes, recs, earnings, peerList] = await Promise.all([
        finnhub<RawMetric>(`/stock/metric?symbol=${sym}&metric=all`, 3600).catch(() => null),
        finnhub<RawRecommendation[]>(`/stock/recommendation?symbol=${sym}`, 3600).catch(() => []),
        finnhub<RawEarning[]>(`/stock/earnings?symbol=${sym}&limit=4`, 3600).catch(() => []),
        finnhub<string[]>(`/stock/peers?symbol=${sym}`, 86400).catch(() => []),
    ]);

    const m = metricRes?.metric;
    const metrics = m
        ? {
              high52: num(m["52WeekHigh"]),
              low52: num(m["52WeekLow"]),
              beta: num(m["beta"]),
              pe: num(m["peTTM"]) ?? num(m["peBasicExclExtraTTM"]),
              eps: num(m["epsTTM"]),
              priceToSales: num(m["psTTM"]),
              priceToBook: num(m["pbQuarterly"]),
              dividendYield: num(m["dividendYieldIndicatedAnnual"]),
              netMargin: num(m["netProfitMarginTTM"]),
              roe: num(m["roeTTM"]),
              revenueGrowth: num(m["revenueGrowthTTMYoy"]),
              ytdReturn: num(m["yearToDatePriceReturnDaily"]),
              return52w: num(m["52WeekPriceReturnDaily"]),
              avgVolume10d: num(m["10DayAverageTradingVolume"]),
          }
        : null;

    const latest = recs[0];
    const peerSymbols = (Array.isArray(peerList) ? peerList : [])
        .filter((p) => p !== sym && /^[A-Z0-9.\-]{1,12}$/.test(p))
        .slice(0, 6);

    const peers = await Promise.all(
        peerSymbols.map((p) => getQuoteRow({ symbol: p, name: p }, false))
    );

    return {
        metrics,
        recommendation: latest
            ? {
                  period: latest.period,
                  strongBuy: latest.strongBuy,
                  buy: latest.buy,
                  hold: latest.hold,
                  sell: latest.sell,
                  strongSell: latest.strongSell,
              }
            : null,
        earnings: (Array.isArray(earnings) ? earnings : []).map((e) => ({
            period: e.period,
            actual: num(e.actual),
            estimate: num(e.estimate),
            surprisePercent: num(e.surprisePercent),
        })),
        peers,
    };
}
