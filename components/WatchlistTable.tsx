"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import CreateAlertDialog from "@/components/CreateAlertDialog";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import type { WatchlistTableRow } from "@/lib/actions/watchlist.actions";

type WatchlistTableProps = {
    rows: WatchlistTableRow[];
    userEmail: string;
};

export default function WatchlistTable({ rows, userEmail }: WatchlistTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRemove = (symbol: string) => {
        startTransition(async () => {
            const result = await removeFromWatchlist(userEmail, symbol);
            if (result.success) router.refresh();
        });
    };

    if (rows.length === 0) {
        return (
            <div className="watchlist-empty-container">
                <div className="watchlist-empty">
                    <Star className="watchlist-star" />
                    <h3 className="empty-title">Your watchlist is empty</h3>
                    <p className="empty-description">
                        Search for a stock and add it to your watchlist to track it here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <table className="watchlist-table">
            <thead>
            <tr className="table-header-row">
                {WATCHLIST_TABLE_HEADER.map((header) => (
                    <th key={header} className="table-header px-3 py-3 text-left text-sm">
                        {header}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {rows.map((row) => {
                const isPositive = row.change >= 0;
                return (
                    <tr key={row.symbol} className="table-row">
                        <td className="table-cell pl-4 py-3">
                            <button
                                onClick={() => handleRemove(row.symbol)}
                                disabled={isPending}
                                className="watchlist-icon-btn"
                                aria-label={`Remove ${row.symbol} from watchlist`}
                            >
                                <Star className="star-icon fill-yellow-500 text-yellow-500" />
                            </button>
                        </td>
                        <td className="table-cell py-3">{row.company}</td>
                        <td className="table-cell py-3">{row.symbol}</td>
                        <td className="table-cell py-3">${row.price.toFixed(2)}</td>
                        <td
                            className={`table-cell py-3 ${
                                isPositive ? "text-teal-400" : "text-red-500"
                            }`}
                        >
                            {isPositive ? "+" : ""}
                            {row.changePercent.toFixed(2)}%
                        </td>
                        <td className="table-cell py-3">
                            {row.marketCap ? `$${(row.marketCap / 1000).toFixed(2)}T` : "—"}
                        </td>
                        <td className="table-cell py-3">{row.peRatio?.toFixed(1) ?? "—"}</td>
                        <td className="table-cell py-3">
                            <CreateAlertDialog
                                userEmail={userEmail}
                                watchlist={rows}
                                presetSymbol={row.symbol}
                                presetCompany={row.company}
                                trigger={<button className="add-alert">Add Alert</button>}
                            />
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}