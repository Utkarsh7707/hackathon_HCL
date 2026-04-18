import app from "./app.js";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";

if (!env.mongoUri) {
    console.error("MONGODB_URI is missing. Configure it in .env before starting the server.");
    process.exit(1);
}

if (!env.jwtSecret) {
    console.error("JWT_SECRET is missing. Configure it in .env before starting the server.");
    process.exit(1);
}

let server;

async function startServer() {
    await connectDB();

    server = app.listen(env.port, () => {
        console.log(`Backend listening on port ${env.port}`);
    });
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down...`);

    if (server) {
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
        return;
    }

    await disconnectDB();
    process.exit(0);
}

process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
        console.error("Shutdown error:", error);
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
        console.error("Shutdown error:", error);
        process.exit(1);
    });
});

process.on("unhandledRejection", async (error) => {
    console.error("Unhandled Promise Rejection:", error);
    await disconnectDB();
    process.exit(1);
});

process.on("uncaughtException", async (error) => {
    console.error("Uncaught Exception:", error);
    await disconnectDB();
    process.exit(1);
});

startServer().catch(async (error) => {
    console.error("Failed to start server:", error);
    await disconnectDB();
    process.exit(1);
});
