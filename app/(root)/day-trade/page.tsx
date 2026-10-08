import TradingViewWidget from '@/components/TradingViewWidget';
import TerminalPanel from '@/components/terminal/TerminalPanel';
import LiveStreamPanel from '@/components/terminal/LiveStreamPanel';
import HeadlinesList from '@/components/terminal/HeadlinesList';
import WorldEquityTable from '@/components/terminal/WorldEquityTable';
import SectorBreakdown from '@/components/terminal/SectorBreakdown';
import { getHeadlines, getSectorPerformance, getWorldIndices } from '@/lib/actions/market.actions';
import { HOTLIST_WIDGET_CONFIG, INTRADAY_CHART_WIDGET_CONFIG } from '@/lib/constants';

const SCRIPT_BASE = 'https://s3.tradingview.com/external-embedding/embed-widget-';

export const metadata = { title: 'Day Trade Focus' };

export default async function DayTradePage() {
    const [headlines, indices, sectors] = await Promise.all([
        getHeadlines(12, 'general').catch(() => []),
        getWorldIndices().catch(() => []),
        getSectorPerformance().catch(() => []),
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="terminal-page-title">Day Trade Focus</h1>
                <p className="terminal-page-subtitle">
                    Live market analysis, breaking headlines and intraday tools in a single screen.
                </p>
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left column: live stream + breaking news */}
                <TerminalPanel code="LIVE" title="Análise de mercado global ao vivo" className="xl:col-span-5">
                    <LiveStreamPanel />
                    <div className="px-4 py-3 bg-gray-700 border-y border-gray-600">
                        <p className="font-semibold uppercase text-gray-100 text-sm">Notícias de última hora</p>
                        <p className="text-xs text-gray-500">(Estilo Terminal)</p>
                    </div>
                    <div className="max-h-[560px] overflow-y-auto scrollbar-hide-default">
                        <HeadlinesList initial={headlines} />
                    </div>
                </TerminalPanel>

                {/* Right column: world indices + intraday tools */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    <TerminalPanel code="WEI" title="World equity indices">
                        <WorldEquityTable initial={indices} />
                    </TerminalPanel>
                    <TerminalPanel code="GP" title="Intraday chart · 5 min" bodyClassName="p-0">
                        <TradingViewWidget
                            scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                            config={INTRADAY_CHART_WIDGET_CONFIG}
                            height={560}
                            className="custom-chart"
                        />
                    </TerminalPanel>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TerminalPanel code="MOST" title="Top gainers · losers · most active">
                    <TradingViewWidget
                        scriptUrl={`${SCRIPT_BASE}hotlist.js`}
                        config={HOTLIST_WIDGET_CONFIG}
                        height={640}
                    />
                </TerminalPanel>
                <TerminalPanel code="SECT" title="Index sector breakdown">
                    <SectorBreakdown initial={sectors} />
                </TerminalPanel>
            </section>
        </div>
    );
}
