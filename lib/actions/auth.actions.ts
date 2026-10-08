'use server'

import { getAuth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWIthEmail = async (data: SignUpFormData) => {
    try {
        const auth = await getAuth();
        const response = await auth.api.signUpEmail({
            body: { email: data.email, password: data.password, name: data.fullName }
        });

        if (response) {
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
        }

        return { success: true, data: response };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Sign up failed" };
    }
};

export const signOut = async () => {
    try {
        const auth = await getAuth();
        await auth.api.signOut({ headers: await headers() });
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Sign out failed" };
    }
};

export const signInWIthEmail = async (data: SignInFormData) => {
    try {
        const auth = await getAuth();
        const response = await auth.api.signInEmail({
            body: { email: data.email, password: data.password }
        });

        return { success: true, data: response };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Sign in failed" };
    }
};