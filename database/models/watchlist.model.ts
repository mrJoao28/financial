import { Schema, model, models, type Document, type Model } from "mongoose";

export interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent a user from adding the same symbol to their watchlist twice.
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Watchlist: Model<WatchlistItem> =
    (models?.Watchlist as Model<WatchlistItem>) ||
    model<WatchlistItem>("Watchlist", WatchlistSchema);

export default Watchlist;

