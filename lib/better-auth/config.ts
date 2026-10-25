export class AuthConfigurationError extends Error {
    name = "AuthConfigurationError";
}

export function getAuthConfig(env: NodeJS.ProcessEnv = process.env) {
    const secret = env.BETTER_AUTH_SECRET?.trim();
    if (!secret || secret.length < 32) {
        throw new AuthConfigurationError("Set BETTER_AUTH_SECRET to a random secret of at least 32 characters.");
    }

    let baseURL = env.BETTER_AUTH_URL?.trim();
    // A copied local .env must not send production auth requests to localhost.
    if (env.VERCEL === "1" && baseURL && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseURL)) {
        baseURL = undefined;
    }
    const deploymentHost = env.VERCEL_ENV === "production"
        ? env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
        : env.VERCEL_URL;
    baseURL ||= deploymentHost ? `https://${deploymentHost}` : undefined;
    baseURL ||= env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined;

    if (!baseURL || !/^https?:\/\//.test(baseURL)) {
        throw new AuthConfigurationError("Set BETTER_AUTH_URL to the public application URL.");
    }

    try {
        return { secret, baseURL: new URL(baseURL).origin };
    } catch {
        throw new AuthConfigurationError("BETTER_AUTH_URL must be a valid public application URL.");
    }
}
