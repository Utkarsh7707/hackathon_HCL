import dotenv from "dotenv";

dotenv.config();

const env = {
    port: Number(process.env.PORT || 4000),
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
    superAdminSetupKey: process.env.SUPER_ADMIN_SETUP_KEY,
};

export default env;
