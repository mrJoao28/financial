"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Alert } from "@/database/models/alert.model";

interface BetterAuthUserDoc {
    _id?: unknown;
    id?: string;
    email?: string;
}

async function getUserIdByEmail(email: string): Promise<string | null> {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return null;

    const user = await db.collection<BetterAuthUserDoc>("user").findOne({ email });
    if (!user) return null;

    const fallbackId = String(user._id ?? "");
    return user.id ?? (fallbackId.length > 0 ? fallbackId : null);
}

export type CreateAlertInput = {
    symbol: string;
    company: string;
    alertType: "upper" | "lower";
    condition: "greater" | "less";
    threshold: number;
    frequency: "once_per_minute" | "once_per_hour" | "once_per_day";
};

export async function createAlert(email: string, input: CreateAlertInput) {
    try {
        const userId = await getUserIdByEmail(email);
        if (!userId) return { success: false, error: "User not found" };

        await connectToDatabase();
        await Alert.create({ userId, ...input, symbol: input.symbol.toUpperCase() });

        return { success: true };
    } catch (err) {
        console.error("createAlert error:", err);
        return { success: false, error: "Failed to create alert" };
    }
}

export async function getAlertsByEmail(email: string) {
    if (!email) return [];

    try {
        const userId = await getUserIdByEmail(email);
        if (!userId) return [];

        await connectToDatabase();
        const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).lean();

        return JSON.parse(JSON.stringify(alerts));
    } catch (err) {
        console.error("getAlertsByEmail error:", err);
        return [];
    }
}

export async function deleteAlert(email: string, alertId: string) {
    try {
        const userId = await getUserIdByEmail(email);
        if (!userId) return { success: false, error: "User not found" };

        await connectToDatabase();
        await Alert.deleteOne({ _id: alertId, userId });

        return { success: true };
    } catch (err) {
        console.error("deleteAlert error:", err);
        return { success: false, error: "Failed to delete alert" };
    }
}