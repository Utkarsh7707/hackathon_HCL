import mongoose from "mongoose";
import env from "./env.js";

export async function connectDB() {
    if (!env.mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(env.mongoUri);
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
