import mongoose from "mongoose";
import { getMongoDBURI } from "./config";

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;


if (!cached){
    cached = global.mongooseCache = {conn:null , promise:null};
}

export const connectToDatabase = async ()=>{
    const uri = getMongoDBURI();

    if (cached.conn) return cached.conn;

    if (!cached.promise){
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });
    }

    try{
        cached.conn = await cached.promise


    }catch(err){
        cached.promise = null;
        throw err;
    }

    console.log("Connect to database");
    return cached.conn;
}

