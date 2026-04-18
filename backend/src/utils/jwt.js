import jwt from "jsonwebtoken";
import env from "../config/env.js";

export function signAccessToken(user) {
    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const userId = user.id || user._id?.toString();

    return jwt.sign(
        {
            sub: userId,
            role: user.role,
            email: user.email,
        },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
}

export function verifyAccessToken(token) {
    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.verify(token, env.jwtSecret);
}
