import express from "express";
import {
    hospitalAdminSignup,
    loginController,
    me,
    patientSignup,
    superAdminSignup,
} from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/signup/patient", asyncHandler(patientSignup));
authRouter.post("/signup/hospital-admin", asyncHandler(hospitalAdminSignup));
authRouter.post("/signup/super-admin", asyncHandler(superAdminSignup));
authRouter.post("/login", asyncHandler(loginController));
authRouter.get("/me", requireAuth, asyncHandler(me));

export default authRouter;
