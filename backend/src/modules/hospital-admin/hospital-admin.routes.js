import express from "express";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { uploadDocuments, getMyStatus } from "./hospital-admin.controller.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `${req.user.id}-${file.fieldname}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only images and PDFs are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.use(requireAuth, requireRole("hospital_admin"));

router.post(
    "/upload-documents",
    upload.fields([
        { name: "adminIdProof",             maxCount: 1 },
        { name: "registrationCertificate",  maxCount: 1 },
    ]),
    asyncHandler(uploadDocuments)
);

router.get("/my-status", asyncHandler(getMyStatus));

export default router;
