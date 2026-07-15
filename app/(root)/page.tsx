import React from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG,
} from '@/lib/constants';

const Home = () => {
    const scriptUrl =
        'https://s3.tradingview.com/external-embedding/embed-widget-';

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Primeira linha */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                    <TradingViewWidget
                        title="Market Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        height={500}
                    />
                </div>

                <div className="xl:col-span-2">
                    <TradingViewWidget
                        title="Stock Heatmap"
                        scriptUrl={`${scriptUrl}stock-heatmap.js`}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
            </section>

            {/* Segunda linha */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                    <TradingViewWidget
                        title="Top Stories"
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={500}
                    />
                </div>

                <div className="xl:col-span-2">
                    <TradingViewWidget
                        title="Market Data"
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={500}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;