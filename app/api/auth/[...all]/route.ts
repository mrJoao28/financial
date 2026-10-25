import { getAuth } from "@/lib/better-auth/auth";
import { logAuthError } from "@/lib/better-auth/log";

export const runtime = "nodejs";

async function handler(request: Request) {
    try {
        const auth = await getAuth();
        return await auth.handler(request);
    } catch (error) {
        logAuthError("API unavailable", error);
        return Response.json(
            { message: "Authentication is temporarily unavailable. Please try again shortly." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
}

export { handler as GET, handler as POST };
