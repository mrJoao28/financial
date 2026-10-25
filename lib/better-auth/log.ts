import { DatabaseConfigurationError } from "@/database/config";
import { AuthConfigurationError } from "./config";

export function logAuthError(context: string, error: unknown) {
    // Only our fixed configuration messages are safe to log verbatim. Driver
    // messages may contain connection credentials, so log their type instead.
    const detail = error instanceof DatabaseConfigurationError || error instanceof AuthConfigurationError
        ? error.message
        : error instanceof Error ? error.name : "UnknownError";
    console.error(`[auth] ${context}:`, detail);
}
