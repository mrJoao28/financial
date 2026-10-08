'use client';

import Link from 'next/link';
import usePolling from '@/hooks/usePolling';
import { getWorldIndices, type WorldIndexGroup } from '@/lib/actions/market.actions';
import { changeColor, fmtClock, fmtNumber, fmtPercent, fmtSigned } from './format';

export default function WorldEquityTable({ initial }: { initial: WorldIndexGroup[] }) {
    const { data, updatedAt, failed } = usePolling(getWorldIndices, 60_000, initial);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                    <thead>
                        <tr className="bg-gray-700 text-yellow-500 text-xs uppercase">
                            <th className="text-left px-3 py-2 font-medium">Name</th>
                            <th className="text-right px-3 py-2 font-medium">Price</th>
                            <th className="text-right px-3 py-2 font-medium">Net Chg</th>
                            <th className="text-right px-3 py-2 font-medium">% Chg</th>
                            <th className="text-right px-3 py-2 font-medium">Time</th>
                            <th className="text-right px-3 py-2 font-medium">% YTD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((group) => (
                            <GroupRows key={group.label} group={group} />
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="px-3 py-2 text-[11px] text-gray-500 border-t border-gray-600">
                {failed
                    ? 'Update failed — showing last known values. '
                    : updatedAt
                      ? 'Auto-refresh every 60s. '
                      : ''}
                Prices are liquid ETF proxies for each market (free data feed).
            </p>
        </div>
    );
}

function GroupRows({ group }: { group: WorldIndexGroup }) {
    return (
        <>
            <tr className="bg-gray-700/60">
                <td colSpan={6} className="px-3 py-1.5 text-gray-100 font-semibold text-xs">
                    <span className="text-yellow-500 mr-2">{group.code}</span>
                    {group.label}
                </td>
            </tr>
            {group.rows.map((row) => (
                <tr
                    key={row.symbol}
                    className="border-b border-gray-600/60 hover:bg-gray-700/50 transition-colors"
                >
                    <td className="px-3 py-1.5">
                        <Link
                            href={`/stocks/${row.symbol}`}
                            className="text-gray-100 hover:text-yellow-500"
                        >
                            {row.name}
                        </Link>
                        <span className="ml-2 text-gray-500 text-xs">{row.symbol}</span>
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-100">{fmtNumber(row.price)}</td>
                    <td className={`px-3 py-1.5 text-right ${changeColor(row.change)}`}>
                        {fmtSigned(row.change)}
                    </td>
                    <td className={`px-3 py-1.5 text-right ${changeColor(row.changePercent)}`}>
                        {fmtPercent(row.changePercent)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-500" suppressHydrationWarning>
                        {fmtClock(row.time)}
                    </td>
                    <td className={`px-3 py-1.5 text-right ${changeColor(row.ytd)}`}>
                        {fmtPercent(row.ytd)}
                    </td>
                </tr>
            ))}
        </>
    );
}
