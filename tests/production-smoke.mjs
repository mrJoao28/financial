import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";

async function freePort() {
    const listener = createServer();
    listener.listen(0, "127.0.0.1");
    await once(listener, "listening");
    const { port } = listener.address();
    await new Promise((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
    return port;
}

async function checkProduction(name, overrides) {
    const port = await freePort();
    const origin = `http://127.0.0.1:${port}`;
    const server = spawn(process.execPath, [
        "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port),
    ], {
        env: {
            ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
            MONGODB_URI: "", DATABASE_URL: "", BETTER_AUTH_SECRET: "",
            BETTER_AUTH_URL: origin, VERCEL: "", VERCEL_URL: "", VERCEL_PROJECT_PRODUCTION_URL: "",
            INNGEST_EVENT_KEY: "", INNGEST_SIGNING_KEY: "", INNGEST_DEV: "0", ...overrides,
        },
        stdio: ["ignore", "pipe", "pipe"],
    });
    let logs = "";
    server.stdout.on("data", data => { logs += data; });
    server.stderr.on("data", data => { logs += data; });
    const exited = once(server, "exit");
    try {
        for (let attempt = 0; !logs.includes("Ready in"); attempt++) {
            assert.equal(server.exitCode, null, "Production server exited before becoming ready");
            assert.ok(attempt < 100, "Production server did not become ready");
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const request = (path, options = {}) => fetch(`${origin}${path}`, {
            redirect: "manual", signal: AbortSignal.timeout(15000), ...options,
        });
        const home = await request("/");
        assert.equal(home.status, 307, "Guests must be redirected instead of receiving HTTP 500");
        assert.equal(new URL(home.headers.get("location"), origin).pathname, "/sign-in");
        await home.text();

        for (const [path, label] of [["/sign-in", "Login In Your Account"], ["/sign-up", "Sign Up &amp; Personalize"]]) {
            const response = await request(path);
            assert.equal(response.status, 200, path);
            assert.ok((await response.text()).includes(label), `${path} must contain the form`);
        }
        assert.ok(!logs.includes("[auth]"), "Guest page requests must not initialize authentication/database");

        for (const cookie of ["better-auth.session_token=stale-session", "__Secure-better-auth.session_token=stale-session"]) {
            const response = await request("/", { headers: { cookie } });
            assert.equal(response.status, 307, "Unverified sessions must never grant dashboard access");
            assert.equal(new URL(response.headers.get("location"), origin).pathname, "/sign-in");
            await response.text();
            const login = await request("/sign-in", { headers: { cookie } });
            assert.equal(login.status, 200, "Stale cookies must not break the login page");
            await login.text();
        }

        for (const options of [{}, {
            method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
            body: JSON.stringify({ email: "smoke@example.invalid", password: "not-a-real-account" }),
        }]) {
            const response = await request(options.method ? "/api/auth/sign-in/email" : "/api/auth/get-session", options);
            assert.equal(response.status, 503, "Unavailable authentication must return a controlled response");
            assert.equal(response.headers.get("cache-control"), "no-store");
            const body = await response.text();
            assert.ok(body.includes("temporarily unavailable"));
            assert.ok(!body.includes("mongodb://") && !body.includes("BETTER_AUTH_SECRET"), "No config/credentials may leak");
        }
        console.log(`PASS: ${name} — guest redirect, both forms, stale cookies, auth API, repeated failed connections`);
    } finally {
        server.kill("SIGTERM");
        await exited;
    }
}

await checkProduction("missing configuration", {});
// Loopback only: never use a real database or credentials in this test.
await checkProduction("database offline via DATABASE_URL", {
    DATABASE_URL: "mongodb://127.0.0.1:1/financial_smoke?directConnection=true",
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
});
