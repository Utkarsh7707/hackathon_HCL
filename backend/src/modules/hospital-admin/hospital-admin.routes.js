import express from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { AppError } from "../../utils/appError.js";
import { uploadDocuments, getMyStatus } from "./hospital-admin.controller.js";

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new AppError("Only images and PDFs are allowed", 400));
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.use(requireAuth, requireRole("hospital_admin"));

router.post(
    "/upload-documents",
    upload.fields([
        { name: "adminIdProof", maxCount: 1 },
        { name: "registrationCertificate", maxCount: 1 },
    ]),
    asyncHandler(uploadDocuments)
);

router.get("/my-status", asyncHandler(getMyStatus));

export default router;
