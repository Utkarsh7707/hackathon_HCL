import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Missing or invalid Authorization header", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            role: payload.role,
            email: payload.email,
        };
        return next();
    } catch (error) {
        return next(new AppError("Invalid or expired token", 401));
    }
}

export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("Unauthorized", 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Forbidden", 403));
        }

        return next();
    };
}
