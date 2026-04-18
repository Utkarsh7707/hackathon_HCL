import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
	listVerifications,
	decideVerification,
	blacklistHospital,
	unblacklistHospital,
	listVaccineCoverage,
} from "./super-admin.controller.js";

const router = express.Router();

router.use(requireAuth, requireRole("super_admin"));

router.get("/verifications",          asyncHandler(listVerifications));
router.get("/vaccines-coverage", asyncHandler(listVaccineCoverage));
router.patch("/verifications/:id/decision", asyncHandler(decideVerification));
router.patch("/verifications/:id/blacklist", asyncHandler(blacklistHospital));
router.patch("/verifications/:id/unblacklist", asyncHandler(unblacklistHospital));

export default router;
