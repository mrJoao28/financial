import TradingViewWidget from '@/components/TradingViewWidget';
import TerminalPanel from '@/components/terminal/TerminalPanel';
import WorldEquityTable from '@/components/terminal/WorldEquityTable';
import SectorBreakdown from '@/components/terminal/SectorBreakdown';
import { getSectorPerformance, getWorldIndices } from '@/lib/actions/market.actions';
import {
    ECONOMIC_CALENDAR_WIDGET_CONFIG,
    FOREX_CROSS_RATES_WIDGET_CONFIG,
    GP_CHART_WIDGET_CONFIG,
    HOTLIST_WIDGET_CONFIG,
    SCREENER_WIDGET_CONFIG,
    TICKER_TAPE_WIDGET_CONFIG,
} from '@/lib/constants';

const SCRIPT_BASE = 'https://s3.tradingview.com/external-embedding/embed-widget-';

export const metadata = { title: 'Terminal' };

export default async function TerminalPage() {
    const [indices, sectors] = await Promise.all([
        getWorldIndices().catch(() => []),
        getSectorPerformance().catch(() => []),
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="terminal-page-title">Terminal</h1>
                <p className="terminal-page-subtitle">
                    Advanced market analysis screens, inspired by the Bloomberg Terminal. All data sources are free.
                </p>
            </div>

            <TradingViewWidget
                scriptUrl={`${SCRIPT_BASE}ticker-tape.js`}
                config={TICKER_TAPE_WIDGET_CONFIG}
                height={78}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <TerminalPanel code="WEI" title="World equity indices" className="xl:col-span-2">
                    <WorldEquityTable initial={indices} />
                </TerminalPanel>
                <TerminalPanel code="SECT" title="Index sector breakdown">
                    <SectorBreakdown initial={sectors} />
                </TerminalPanel>
            </section>

            <TerminalPanel code="GP" title="Price chart · volume · MA · RSI" bodyClassName="p-0">
                <TradingViewWidget
                    scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
                    config={GP_CHART_WIDGET_CONFIG}
                    height={640}
                    className="custom-chart"
                />
            </TerminalPanel>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <TerminalPanel code="MOST" title="Top gainers · losers · most active">
                    <TradingViewWidget
                        scriptUrl={`${SCRIPT_BASE}hotlist.js`}
                        config={HOTLIST_WIDGET_CONFIG}
                        height={640}
                    />
                </TerminalPanel>
                <TerminalPanel code="EQS" title="Equity screener" className="xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${SCRIPT_BASE}screener.js`}
                        config={SCREENER_WIDGET_CONFIG}
                        height={640}
                    />
                </TerminalPanel>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <TerminalPanel code="ECO" title="Economic calendar" className="xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${SCRIPT_BASE}events.js`}
                        config={ECONOMIC_CALENDAR_WIDGET_CONFIG}
                        height={600}
                    />
                </TerminalPanel>
                <TerminalPanel code="FXC" title="Currency cross rates">
                    <TradingViewWidget
                        scriptUrl={`${SCRIPT_BASE}forex-cross-rates.js`}
                        config={FOREX_CROSS_RATES_WIDGET_CONFIG}
                        height={600}
                    />
                </TerminalPanel>
            </section>
        </div>
    );
}
