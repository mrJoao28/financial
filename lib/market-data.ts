// Static definitions for the Bloomberg-style screens.
// Finnhub's free tier has no index feeds, so we use liquid ETFs as proxies.

export type Instrument = { symbol: string; name: string };

export type IndexGroup = { label: string; code: string; items: Instrument[] };

export const WORLD_EQUITY_GROUPS: IndexGroup[] = [
    {
        code: '1)',
        label: 'Americas',
        items: [
            { symbol: 'SPY', name: 'S&P 500' },
            { symbol: 'DIA', name: 'Dow Jones' },
            { symbol: 'QQQ', name: 'Nasdaq 100' },
            { symbol: 'IWM', name: 'Russell 2000' },
            { symbol: 'EWZ', name: 'Brazil (MSCI)' },
            { symbol: 'EWC', name: 'Canada (MSCI)' },
            { symbol: 'EWW', name: 'Mexico (MSCI)' },
        ],
    },
    {
        code: '2)',
        label: 'EMEA',
        items: [
            { symbol: 'EZU', name: 'Eurozone' },
            { symbol: 'EWU', name: 'United Kingdom' },
            { symbol: 'EWG', name: 'Germany' },
            { symbol: 'EWQ', name: 'France' },
            { symbol: 'EWL', name: 'Switzerland' },
        ],
    },
    {
        code: '3)',
        label: 'Asia/Pacific',
        items: [
            { symbol: 'EWJ', name: 'Japan' },
            { symbol: 'FXI', name: 'China Large-Cap' },
            { symbol: 'EWH', name: 'Hong Kong' },
            { symbol: 'EWA', name: 'Australia' },
            { symbol: 'INDA', name: 'India' },
            { symbol: 'EWY', name: 'South Korea' },
        ],
    },
];

// SPDR select-sector ETFs = "Index Sector Breakdown" of the S&P 500
export const SECTOR_ETFS: Instrument[] = [
    { symbol: 'XLK', name: 'Technology' },
    { symbol: 'XLF', name: 'Financials' },
    { symbol: 'XLV', name: 'Health Care' },
    { symbol: 'XLY', name: 'Consumer Discretionary' },
    { symbol: 'XLC', name: 'Communication Services' },
    { symbol: 'XLI', name: 'Industrials' },
    { symbol: 'XLP', name: 'Consumer Staples' },
    { symbol: 'XLE', name: 'Energy' },
    { symbol: 'XLU', name: 'Utilities' },
    { symbol: 'XLRE', name: 'Real Estate' },
    { symbol: 'XLB', name: 'Materials' },
];

// Day Trade Focus: YouTube live stream (change the ID to switch streams)
export const DAY_TRADE_LIVE_VIDEO_ID = 'QB5BNdBFujE';
export const DAY_TRADE_LIVE_WATCH_URL = `https://www.youtube.com/watch?v=${DAY_TRADE_LIVE_VIDEO_ID}`;
export const DAY_TRADE_LIVE_EMBED_URL = `https://www.youtube.com/embed/${DAY_TRADE_LIVE_VIDEO_ID}?autoplay=1&mute=1&rel=0&modestbranding=1`;
