"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { getQuoteData } from "@/lib/actions/finnhub.actions";

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

async function getUserIdByEmail(email: string): Promise<string | null> {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return null;

    const user = await db.collection<BetterAuthUserDoc>("user").findOne({ email });
    if (!user) return null;

    return user.id ?? (String(user._id ?? "") || null);
}

export async function addToWatchlist(email: string, symbol: string, company: string) {
    try {
        const userId = await getUserIdByEmail(email);
        if (!userId) return { success: false, error: "User not found" };

        await connectToDatabase();
        await Watchlist.create({ userId, symbol: symbol.toUpperCase(), company });

        return { success: true };
    } catch (err: any) {
        if (err?.code === 11000) return { success: true }; // já estava na watchlist
        console.error("addToWatchlist error:", err);
        return { success: false, error: "Failed to add to watchlist" };
    }
}

export async function removeFromWatchlist(email: string, symbol: string) {
    try {
        const userId = await getUserIdByEmail(email);
        if (!userId) return { success: false, error: "User not found" };

        await connectToDatabase();
        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

        return { success: true };
    } catch (err) {
        console.error("removeFromWatchlist error:", err);
        return { success: false, error: "Failed to remove from watchlist" };
    }
}



export type WatchlistTableRow = {
    symbol: string;
    company: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number | null;
    peRatio: number | null;
};

export async function getWatchlistWithData(email: string): Promise<WatchlistTableRow[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) return [];

        const user = await db.collection<BetterAuthUserDoc>("user").findOne({ email });
        if (!user) return [];
        const userId = user.id ?? String(user._id ?? "");
        if (!userId) return [];

        const items = (await Watchlist.find({ userId }).lean().exec()) as unknown as {
            symbol: string;
            company: string;
        }[];

        return await Promise.all(
            items.map(async (item) => {
                try {
                    const quote = await getQuoteData(item.symbol);
                    return { ...quote, company: item.company };
                } catch {
                    return {
                        symbol: item.symbol,
                        company: item.company,
                        price: 0,
                        change: 0,
                        changePercent: 0,
                        marketCap: null,
                        peRatio: null,
                    };
                }
            })
        );
    } catch (err) {
        console.error("getWatchlistWithData error:", err);
        return [];
    }
}