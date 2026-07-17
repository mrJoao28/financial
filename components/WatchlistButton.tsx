"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
    symbol: string;
    company: string;
    userEmail: string;
    initialIsInWatchlist: boolean;
};

export default function WatchlistButton({
                                            symbol,
                                            company,
                                            userEmail,
                                            initialIsInWatchlist,
                                        }: WatchlistButtonProps) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        const next = !isInWatchlist;
        setIsInWatchlist(next); // otimista

        startTransition(async () => {
            const result = next
                ? await addToWatchlist(userEmail, symbol, company)
                : await removeFromWatchlist(userEmail, symbol);

            if (!result.success) {
                setIsInWatchlist(!next); // reverte se falhar
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={cn("watchlist-btn", isInWatchlist && "watchlist-remove")}
        >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
    );
}