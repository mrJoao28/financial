import assert from "node:assert/strict";
import test from "node:test";
import { getMongoDBURI } from "../database/config.ts";
import { getAuthConfig } from "../lib/better-auth/config.ts";

const secret = "test-only-secret-at-least-32-characters-long";

test("MongoDB supports the existing DATABASE_URL name and explicit MONGODB_URI precedence", () => {
    const uri = "mongodb://127.0.0.1:27017/financial";
    assert.equal(getMongoDBURI({ DATABASE_URL: uri }), uri);
    assert.equal(getMongoDBURI({ MONGODB_URI: ` ${uri} `, DATABASE_URL: "ignored" }), uri);
    assert.throws(() => getMongoDBURI({}), /Set MONGODB_URI/);
    assert.throws(() => getMongoDBURI({ DATABASE_URL: "postgresql://private-credentials" }), /MongoDB connection string/);
});

test("auth requires a real secret without inventing a production fallback", () => {
    assert.throws(() => getAuthConfig({}), /BETTER_AUTH_SECRET/);
    assert.throws(() => getAuthConfig({ BETTER_AUTH_SECRET: "short" }), /BETTER_AUTH_SECRET/);
    assert.throws(() => getAuthConfig({ BETTER_AUTH_SECRET: secret, NODE_ENV: "production" }), /BETTER_AUTH_URL/);
});

test("Vercel production corrects a copied localhost URL and uses the stable production domain", () => {
    const config = getAuthConfig({
        NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "production",
        BETTER_AUTH_SECRET: secret, BETTER_AUTH_URL: "http://localhost:3000",
        VERCEL_PROJECT_PRODUCTION_URL: "financial-8in8.vercel.app",
        VERCEL_URL: "financial-build-hash.vercel.app",
    });
    assert.equal(config.baseURL, "https://financial-8in8.vercel.app");
});

test("an explicit domain wins and preview deployments use their own URL", () => {
    assert.equal(getAuthConfig({
        BETTER_AUTH_SECRET: secret, BETTER_AUTH_URL: "https://example.com/",
        VERCEL_URL: "preview.vercel.app",
    }).baseURL, "https://example.com");
    assert.equal(getAuthConfig({
        BETTER_AUTH_SECRET: secret, VERCEL_ENV: "preview",
        VERCEL_URL: "preview.vercel.app", VERCEL_PROJECT_PRODUCTION_URL: "production.vercel.app",
    }).baseURL, "https://preview.vercel.app");
});
