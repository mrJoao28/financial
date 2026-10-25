'use server'

import { getAuth } from "@/lib/better-auth/auth";
import { logAuthError } from "@/lib/better-auth/log";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWIthEmail = async (data: SignUpFormData) => {
    try {
        const auth = await getAuth();
        const response = await auth.api.signUpEmail({
            headers: await headers(),
            body: { email: data.email, password: data.password, name: data.fullName }
        });

        // Account creation must not fail after the account/session was saved
        // just because optional welcome-email automation is unavailable.
        if (response && (process.env.INNGEST_EVENT_KEY || process.env.INNGEST_DEV === "1")) {
            try {
                await inngest.send({
                    name: "app/user.created",
                    data: {
                        email: data.email,
                        name: data.fullName,
                        country: data.country,
                        investmentGoals: data.investmentGoals,
                        riskTolerance: data.riskTolerance,
                        preferredIndustry: data.preferredIndustry
                    }
                });
            } catch {
                console.error("[auth] Welcome automation could not be queued.");
            }
        }

        return { success: true, data: response };
    } catch (e) {
        logAuthError("Sign up failed", e);
        return { success: false, error: "Could not create an account. Check your details or try again shortly." };
    }
};

export const signOut = async () => {
    try {
        const auth = await getAuth();
        await auth.api.signOut({ headers: await headers() });
        return { success: true };
    } catch (e) {
        logAuthError("Sign out failed", e);
        return { success: false, error: "Sign out failed" };
    }
};

export const signInWIthEmail = async (data: SignInFormData) => {
    try {
        const auth = await getAuth();
        const response = await auth.api.signInEmail({
            headers: await headers(),
            body: { email: data.email, password: data.password }
        });

        return { success: true, data: response };
    } catch (e) {
        logAuthError("Sign in failed", e);
        return { success: false, error: "Could not sign in. Check your credentials or try again shortly." };
    }
};
