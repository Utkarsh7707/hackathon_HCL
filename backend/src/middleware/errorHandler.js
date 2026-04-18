import { AppError } from "../utils/appError.js";
import env from "../config/env.js";

export function notFoundHandler(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
    void next;
    const isOperational = err instanceof AppError;
    const statusCode = isOperational ? err.statusCode : 500;

    const response = {
        success: false,
        message: err.message || "Internal server error",
    };

    if (isOperational && err.details) {
        response.details = err.details;
    }

    if (!isOperational && env.nodeEnv !== "production") {
        response.stack = err.stack;
    }

    if (!isOperational) {
        console.error("Unhandled error:", err);
    }

    res.status(statusCode).json(response);
}
