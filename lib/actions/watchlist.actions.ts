"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

interface BetterAuthUserDoc {
    _id?: unknown;
    id?: string;
    email?: string;
}

/**
 * Returns the list of stock symbols a user (identified by email) has
 * added to their watchlist. Fails gracefully — any error, or a missing
 * user, resolves to an empty array rather than throwing.
 */
export async function getWatchlistSymbolsByEmail(
    email: string
): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            console.error("getWatchlistSymbolsByEmail: database connection not available");
            return [];
        }

        // Better Auth stores users in the "user" collection.
        const user = await db
            .collection<BetterAuthUserDoc>("user")
            .findOne({ email });

        if (!user) return [];

        const userId = user.id ?? String(user._id ?? "");
        if (!userId) return [];

        const items = await Watchlist.find(
            { userId },
            { symbol: 1, _id: 0 }
        ).lean<{ symbol: string }[]>();

        return items.map((item) => item.symbol);
    } catch (err) {
        console.error("getWatchlistSymbolsByEmail error:", err);
        return [];
    }
}