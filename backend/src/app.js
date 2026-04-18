import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// allow images/PDFs served from /uploads to load in the browser
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

// Backward compatibility for clients that build URLs as /uploads/<absolute-cloudinary-url>.
app.get(/^\/uploads\/https?:\/\/.+/, (req, res) => {
    const rawTarget = req.path.replace("/uploads/", "");

    try {
        const target = new URL(rawTarget);
        if (target.hostname !== "res.cloudinary.com") {
            return res.status(400).json({
                success: false,
                message: "Unsupported upload URL host.",
            });
        }

        return res.redirect(302, target.toString());
    } catch {
        return res.status(400).json({
            success: false,
            message: "Invalid upload URL.",
        });
    }
});

// Keep local uploads path for old records created before cloud upload migration.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
