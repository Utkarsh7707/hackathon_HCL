import {
    hospitalAdminSignupSchema,
    loginSchema,
    patientSignupSchema,
    superAdminSignupSchema,
} from "./auth.validation.js";
import {
    getMyProfile,
    login,
    signupHospitalAdmin,
    signupPatient,
    signupSuperAdmin,
} from "./auth.service.js";
import { AppError } from "../../utils/appError.js";

function validate(schema, body) {
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
        throw new AppError("Validation failed", 400, parsed.error.flatten());
    }

    return parsed.data;
}

export async function patientSignup(req, res) {
    const payload = validate(patientSignupSchema, req.body);
    const result = await signupPatient(payload);

    return res.status(201).json({
        success: true,
        message: "Patient signup successful",
        data: result,
    });
}

export async function hospitalAdminSignup(req, res) {
    const payload = validate(hospitalAdminSignupSchema, req.body);
    const result = await signupHospitalAdmin(payload);

    return res.status(201).json({
        success: true,
        message: "Hospital admin signup successful. Awaiting super admin approval.",
        data: result,
    });
}

export async function superAdminSignup(req, res) {
    const payload = validate(superAdminSignupSchema, req.body);
    const result = await signupSuperAdmin(payload);

    return res.status(201).json({
        success: true,
        message: "Super admin signup successful",
        data: result,
    });
}

export async function loginController(req, res) {
    const payload = validate(loginSchema, req.body);
    const result = await login(payload);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
    });
}

export async function me(req, res) {
    const profile = await getMyProfile(req.user.id);

    return res.status(200).json({
        success: true,
        data: profile,
    });
}
