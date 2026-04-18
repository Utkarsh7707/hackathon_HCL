import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { listVerifications, decideVerification } from "./super-admin.controller.js";

const router = express.Router();

router.use(requireAuth, requireRole("super_admin"));

router.get("/verifications",          asyncHandler(listVerifications));
router.patch("/verifications/:id/decision", asyncHandler(decideVerification));

export default router;
