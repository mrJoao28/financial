export class DatabaseConfigurationError extends Error {
    name = "DatabaseConfigurationError";
}

export function getMongoDBURI(env: NodeJS.ProcessEnv = process.env): string {
    const uri = env.MONGODB_URI?.trim() || env.DATABASE_URL?.trim();

    if (!uri) {
        throw new DatabaseConfigurationError("Set MONGODB_URI (or DATABASE_URL) in the deployment environment.");
    }
    if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
        throw new DatabaseConfigurationError("MONGODB_URI / DATABASE_URL must be a MongoDB connection string.");
    }

    return uri;
}
