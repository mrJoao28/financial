import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

const SCRIPT_BASE = "https://s3.tradingview.com/external-embedding/embed-widget-";

type StockDetailsPageProps = {
    params: Promise<{ symbol: string }>;
};

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const session = await auth.api.getSession({ headers: await headers() });
    const userEmail = session?.user?.email ?? "";

    const [searchResults, watchlistSymbols] = await Promise.all([
        searchStocks(upperSymbol),
        userEmail ? getWatchlistSymbolsByEmail(userEmail) : Promise.resolve([]),
    ]);

    const companyName =
        searchResults.find((r) => r.symbol === upperSymbol)?.description ?? upperSymbol;
    const initialIsInWatchlist = watchlistSymbols.includes(upperSymbol);

    return (
        <div className="stock-details-container">
            <div className="flex flex-col gap-5 xl:col-span-2">
                <TradingViewWidget
                    scriptUrl={`${SCRIPT_BASE}symbol-info.js`}
                    config={SYMBOL_INFO_WIDGET_CONFIG(upperSymbol)}
                    height={170}
                />
                <TradingViewWidget
                    scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                    config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)}
                    className="custom-chart"
                    height={600}
                />
                <TradingViewWidget
                    scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                    config={BASELINE_WIDGET_CONFIG(upperSymbol)}
                    className="custom-chart"
                    height={600}
                />
            </div>

            <div className="flex flex-col gap-5 xl:col-span-1">
                {userEmail && (
                    <WatchlistButton
                        symbol={upperSymbol}
                        company={companyName}
                        userEmail={userEmail}
                        initialIsInWatchlist={initialIsInWatchlist}
                    />
                )}
                <TradingViewWidget
                    title={`Technical Analysis for ${upperSymbol}`}
                    scriptUrl={`${SCRIPT_BASE}technical-analysis.js`}
                    config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)}
                    height={400}
                />
                <TradingViewWidget
                    title={`${upperSymbol} Profile`}
                    scriptUrl={`${SCRIPT_BASE}symbol-profile.js`}
                    config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)}
                    height={440}
                />
                <TradingViewWidget
                    title={`${upperSymbol} Financials`}
                    scriptUrl={`${SCRIPT_BASE}financials.js`}
                    config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)}
                    height={464}
                />
            </div>
        </div>
    );
}