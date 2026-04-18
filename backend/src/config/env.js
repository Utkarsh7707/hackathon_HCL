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
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export default env;
