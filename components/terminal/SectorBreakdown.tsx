'use client';

import Link from 'next/link';
import usePolling from '@/hooks/usePolling';
import { getSectorPerformance, type QuoteRow } from '@/lib/actions/market.actions';
import { changeColor, fmtPercent } from './format';

export default function SectorBreakdown({ initial }: { initial: QuoteRow[] }) {
    const { data, failed } = usePolling(getSectorPerformance, 60_000, initial);
    const maxAbs = Math.max(0.01, ...data.map((r) => Math.abs(r.changePercent ?? 0)));

    return (
        <div>
            <ul className="divide-y divide-gray-600/60">
                {data.map((row, index) => {
                    const pct = row.changePercent;
                    const width = pct === null ? 0 : (Math.abs(pct) / maxAbs) * 100;
                    const positive = (pct ?? 0) >= 0;
                    return (
                        <li
                            key={row.symbol}
                            className="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1.2fr)_72px] items-center gap-3 px-3 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-yellow-500 font-mono text-xs">{index + 1})</span>
                            <Link
                                href={`/stocks/${row.symbol}`}
                                className="truncate text-gray-100 hover:text-yellow-500"
                            >
                                {row.name}
                                <span className="ml-2 text-gray-500 font-mono text-xs">{row.symbol}</span>
                            </Link>
                            <div className="h-2 rounded bg-gray-700 overflow-hidden">
                                <div
                                    className={`h-full rounded ${positive ? 'bg-teal-400' : 'bg-red-500'}`}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                            <span className={`text-right font-mono ${changeColor(pct)}`}>
                                {fmtPercent(pct)}
                            </span>
                        </li>
                    );
                })}
            </ul>
            <p className="px-3 py-2 text-[11px] text-gray-500 border-t border-gray-600">
                {failed ? 'Update failed — showing last known values. ' : 'Auto-refresh every 60s. '}
                S&amp;P 500 sectors via SPDR Select Sector ETFs, sorted by daily performance.
            </p>
        </div>
    );
}
