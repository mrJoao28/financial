import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import { Db } from "mongodb";
import { getAuthConfig } from "./config";

function createAuthInstance(db: Db) {
    return betterAuth({
        database: mongodbAdapter(db),
        ...getAuthConfig(),
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()],
    });
}

let authInstance: ReturnType<typeof createAuthInstance> | null = null;

export const getAuth = async () => {
    if (authInstance) return authInstance;

    getAuthConfig();
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Mongodb connection not found");

    authInstance = createAuthInstance(db as Db);

    return authInstance;
};
