import express from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { AppError } from "../../utils/appError.js";
import {
    uploadDocuments, getMyStatus,
    listInventory, addInventory, patchInventory, deactivateInventory, listCatalog, addCatalogVaccine,
    listSlotsForDate, listSlotsRange, saveSlotDay, removeSlotDay,
    listHospitalBookings,
} from "./hospital-admin.controller.js";

/* ─── multer (memory storage → Cloudinary) ─── */
const fileFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new AppError("Only images and PDFs are allowed", 400));
};
const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

/* public (no auth) ─── vaccine master catalog */
router.get("/catalog", asyncHandler(listCatalog));

/* all routes below require an authenticated hospital_admin */
router.use(requireAuth, requireRole("hospital_admin"));

/* vaccine master catalog (create) */
router.post("/catalog", asyncHandler(addCatalogVaccine));

/* document upload */
router.post(
    "/upload-documents",
    upload.fields([
        { name: "adminIdProof",            maxCount: 1 },
        { name: "registrationCertificate", maxCount: 1 },
    ]),
    asyncHandler(uploadDocuments)
);
router.get("/my-status", asyncHandler(getMyStatus));

/* inventory */
router.get("/inventory",        asyncHandler(listInventory));
router.post("/inventory",       asyncHandler(addInventory));
router.patch("/inventory/:id",  asyncHandler(patchInventory));
router.delete("/inventory/:id", asyncHandler(deactivateInventory));

/* slots */
router.get("/slots",        asyncHandler(listSlotsForDate));   // ?date=YYYY-MM-DD
router.get("/slots/range",  asyncHandler(listSlotsRange));     // ?startDate=&endDate=
router.put("/slots",        asyncHandler(saveSlotDay));        // upsert
router.delete("/slots/:id", asyncHandler(removeSlotDay));

/* bookings */
router.get("/bookings", asyncHandler(listHospitalBookings));

export default router;
