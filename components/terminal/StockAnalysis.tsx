import Link from 'next/link';
import TerminalPanel from './TerminalPanel';
import { getStockAnalysis, type StockAnalysisData } from '@/lib/actions/market.actions';
import { changeColor, fmtNumber, fmtPercent } from './format';

type Stat = { label: string; value: string };

function buildStats(m: NonNullable<StockAnalysisData['metrics']>): Stat[] {
    const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(2)}%`);
    return [
        { label: '52W High', value: m.high52 === null ? '—' : `$${fmtNumber(m.high52)}` },
        { label: '52W Low', value: m.low52 === null ? '—' : `$${fmtNumber(m.low52)}` },
        { label: 'P/E (TTM)', value: fmtNumber(m.pe) },
        { label: 'EPS (TTM)', value: fmtNumber(m.eps) },
        { label: 'P/S (TTM)', value: fmtNumber(m.priceToSales) },
        { label: 'P/B', value: fmtNumber(m.priceToBook) },
        { label: 'Beta', value: fmtNumber(m.beta) },
        { label: 'Div. Yield', value: pct(m.dividendYield) },
        { label: 'Net Margin', value: pct(m.netMargin) },
        { label: 'ROE', value: pct(m.roe) },
        { label: 'Revenue Growth', value: pct(m.revenueGrowth) },
        { label: 'Avg Vol (10d)', value: m.avgVolume10d === null ? '—' : `${fmtNumber(m.avgVolume10d)}M` },
    ];
}

const REC_SEGMENTS = [
    { key: 'strongBuy', label: 'Strong Buy', color: 'bg-teal-400' },
    { key: 'buy', label: 'Buy', color: 'bg-teal-400/60' },
    { key: 'hold', label: 'Hold', color: 'bg-yellow-500' },
    { key: 'sell', label: 'Sell', color: 'bg-orange-500' },
    { key: 'strongSell', label: 'Strong Sell', color: 'bg-red-500' },
] as const;

function consensusLabel(r: NonNullable<StockAnalysisData['recommendation']>) {
    const total = r.strongBuy + r.buy + r.hold + r.sell + r.strongSell;
    if (total === 0) return null;
    const score = (2 * r.strongBuy + r.buy - r.sell - 2 * r.strongSell) / total; // -2..+2
    if (score >= 1.0) return 'Strong Buy';
    if (score >= 0.35) return 'Buy';
    if (score > -0.35) return 'Hold';
    if (score > -1.0) return 'Sell';
    return 'Strong Sell';
}

export default async function StockAnalysis({ symbol }: { symbol: string }) {
    const data = await getStockAnalysis(symbol);
    const { metrics, recommendation, earnings, peers } = data;

    const hasAnything = metrics || recommendation || earnings.length > 0 || peers.length > 0;
    if (!hasAnything) return null;

    const recTotal = recommendation
        ? recommendation.strongBuy + recommendation.buy + recommendation.hold + recommendation.sell + recommendation.strongSell
        : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics && (
                <TerminalPanel code="KEY" title={`${symbol} · Key statistics`} className="lg:col-span-2">
                    <dl className="grid grid-cols-2 md:grid-cols-4">
                        {buildStats(metrics).map((s) => (
                            <div key={s.label} className="px-4 py-3 border-b border-r border-gray-600/60">
                                <dt className="text-[11px] uppercase text-gray-500">{s.label}</dt>
                                <dd className="font-mono text-gray-100 mt-0.5">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex flex-wrap gap-x-8 gap-y-1 px-4 py-3 font-mono text-sm">
                        <span className="text-gray-500">
                            YTD{' '}
                            <span className={changeColor(metrics.ytdReturn)}>{fmtPercent(metrics.ytdReturn)}</span>
                        </span>
                        <span className="text-gray-500">
                            52W return{' '}
                            <span className={changeColor(metrics.return52w)}>{fmtPercent(metrics.return52w)}</span>
                        </span>
                    </div>
                </TerminalPanel>
            )}

            {recommendation && recTotal > 0 && (
                <TerminalPanel code="ANR" title="Analyst recommendations" right={recommendation.period}>
                    <div className="p-4 space-y-4">
                        <div className="flex h-3 w-full overflow-hidden rounded bg-gray-700">
                            {REC_SEGMENTS.map((seg) => {
                                const count = recommendation[seg.key];
                                if (!count) return null;
                                return (
                                    <div
                                        key={seg.key}
                                        className={seg.color}
                                        style={{ width: `${(count / recTotal) * 100}%` }}
                                        title={`${seg.label}: ${count}`}
                                    />
                                );
                            })}
                        </div>
                        <ul className="grid grid-cols-5 gap-2 text-center">
                            {REC_SEGMENTS.map((seg) => (
                                <li key={seg.key}>
                                    <p className="font-mono text-lg text-gray-100">{recommendation[seg.key]}</p>
                                    <p className="text-[11px] text-gray-500">{seg.label}</p>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500">
                            Consensus (calculated from the counts above):{' '}
                            <span className="text-yellow-500 font-semibold">{consensusLabel(recommendation)}</span>
                        </p>
                    </div>
                </TerminalPanel>
            )}

            {earnings.length > 0 && (
                <TerminalPanel code="EE" title="Earnings surprises (EPS)">
                    <table className="w-full text-sm font-mono">
                        <thead>
                            <tr className="text-yellow-500 text-xs uppercase bg-gray-700/60">
                                <th className="text-left px-4 py-2 font-medium">Period</th>
                                <th className="text-right px-4 py-2 font-medium">Est.</th>
                                <th className="text-right px-4 py-2 font-medium">Actual</th>
                                <th className="text-right px-4 py-2 font-medium">Surprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.map((e) => (
                                <tr key={e.period} className="border-b border-gray-600/60">
                                    <td className="px-4 py-2 text-gray-400">{e.period}</td>
                                    <td className="px-4 py-2 text-right text-gray-100">{fmtNumber(e.estimate)}</td>
                                    <td className="px-4 py-2 text-right text-gray-100">{fmtNumber(e.actual)}</td>
                                    <td className={`px-4 py-2 text-right ${changeColor(e.surprisePercent)}`}>
                                        {fmtPercent(e.surprisePercent)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TerminalPanel>
            )}

            {peers.length > 0 && (
                <TerminalPanel code="RV" title="Relative value · peers" className="lg:col-span-2">
                    <table className="w-full text-sm font-mono">
                        <thead>
                            <tr className="text-yellow-500 text-xs uppercase bg-gray-700/60">
                                <th className="text-left px-4 py-2 font-medium">Symbol</th>
                                <th className="text-right px-4 py-2 font-medium">Price</th>
                                <th className="text-right px-4 py-2 font-medium">Net Chg</th>
                                <th className="text-right px-4 py-2 font-medium">% Chg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {peers.map((p) => (
                                <tr key={p.symbol} className="border-b border-gray-600/60 hover:bg-gray-700/50">
                                    <td className="px-4 py-2">
                                        <Link href={`/stocks/${p.symbol}`} className="text-gray-100 hover:text-yellow-500">
                                            {p.symbol}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-100">{fmtNumber(p.price)}</td>
                                    <td className={`px-4 py-2 text-right ${changeColor(p.change)}`}>
                                        {p.change === null ? '—' : `${p.change > 0 ? '+' : ''}${fmtNumber(p.change)}`}
                                    </td>
                                    <td className={`px-4 py-2 text-right ${changeColor(p.changePercent)}`}>
                                        {fmtPercent(p.changePercent)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TerminalPanel>
            )}
        </div>
    );
}
