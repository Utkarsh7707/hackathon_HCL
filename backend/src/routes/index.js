import express from "express";
import authRouter from "../modules/auth/auth.routes.js";

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString(),
    });
});

apiRouter.use("/auth", authRouter);

export default apiRouter;
