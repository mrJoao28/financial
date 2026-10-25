import { cache } from "react";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { getAuth } from "./auth";
import { logAuthError } from "./log";

// Cookie presence is only a fast path for guests. Better Auth still validates
// every supplied session against the database before granting access.
export const getCurrentSession = cache(async () => {
    const requestHeaders = await headers();
    if (!getSessionCookie(requestHeaders)) return null;

    try {
        const auth = await getAuth();
        return await auth.api.getSession({ headers: requestHeaders });
    } catch (error) {
        logAuthError("Session lookup unavailable", error);
        return null;
    }
});
