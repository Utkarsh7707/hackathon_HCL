import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";
import { AppError } from "../utils/appError.js";

const hasCloudinaryConfig =
    Boolean(env.cloudinaryCloudName) &&
    Boolean(env.cloudinaryApiKey) &&
    Boolean(env.cloudinaryApiSecret);

if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: env.cloudinaryCloudName,
        api_key: env.cloudinaryApiKey,
        api_secret: env.cloudinaryApiSecret,
    });
}

export function assertCloudinaryConfigured() {
    if (!hasCloudinaryConfig) {
        throw new AppError(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
            500
        );
    }
}

export async function uploadBufferToCloudinary({ buffer, mimeType, folder, publicIdPrefix }) {
    assertCloudinaryConfigured();

    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        public_id: `${publicIdPrefix}-${Date.now()}`,
        resource_type: "auto",
        overwrite: true,
        unique_filename: false,
        use_filename: false,
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
    };
}
