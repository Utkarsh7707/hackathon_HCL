import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "../../config/env.js";
import User from "../../models/User.js";
import Hospital from "../../models/Hospital.js";
import HospitalAdminVerification from "../../models/HospitalAdminVerification.js";
import { verifyHospitalRegistrationNumber } from "../../services/govt-registry.service.js";
import { AppError } from "../../utils/appError.js";
import { signAccessToken } from "../../utils/jwt.js";

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function authPayload(userDoc) {
    return {
        token: signAccessToken(userDoc),
        user: userDoc.toJSON(),
    };
}

export async function signupPatient(payload) {
    const email = normalizeEmail(payload.email);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
    const user = await User.create({
        name: payload.name,
        email,
        passwordHash,
        role: "patient",
        phone: payload.phone,
    });

    return authPayload(user);
}

export async function signupSuperAdmin(payload) {
    if (!env.superAdminSetupKey) {
        throw new AppError("SUPER_ADMIN_SETUP_KEY is not configured", 500);
    }

    if (payload.setupKey !== env.superAdminSetupKey) {
        throw new AppError("Invalid super admin setup key", 403);
    }

    const email = normalizeEmail(payload.email);
    const [existingByEmail, existingSuperAdmin] = await Promise.all([
        User.findOne({ email }),
        User.findOne({ role: "super_admin" }),
    ]);

    if (existingByEmail) {
        throw new AppError("Email is already registered", 409);
    }

    if (existingSuperAdmin) {
        throw new AppError("Super admin already exists", 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
    const user = await User.create({
        name: payload.name,
        email,
        passwordHash,
        role: "super_admin",
        phone: payload.phone,
    });

    return authPayload(user);
}

export async function signupHospitalAdmin(payload) {
    const email = normalizeEmail(payload.email);
    const registrationVerification = await verifyHospitalRegistrationNumber(
        payload.hospitalRegistrationNumber
    );
    const normalizedRegistrationNumber = registrationVerification.registrationNumber;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("Email is already registered", 409);
    }

    const existingRegistration = await Hospital.findOne({
        registrationNumber: normalizedRegistrationNumber,
    });

    if (existingRegistration) {
        throw new AppError("Hospital registration number already exists", 409);
    }

    const session = await mongoose.startSession();
    let user;
    let hospital;
    let verification;

    try {
        await session.withTransaction(async () => {
            const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

            user = (
                await User.create(
                    [{ name: payload.name, email, passwordHash, role: "hospital_admin", phone: payload.phone }],
                    { session }
                )
            )[0];

            hospital = (
                await Hospital.create(
                    [{
                        name: payload.hospitalName,
                        city: payload.city,
                        pincode: payload.pincode,
                        address: payload.address || "",
                        registrationNumber: normalizedRegistrationNumber,
                        adminId: user._id,
                        onboardingStatus: "pending",
                        isLive: false,
                    }],
                    { session }
                )
            )[0];

            // documents are uploaded in a separate step — start with empty URLs
            verification = (
                await HospitalAdminVerification.create(
                    [{
                        hospitalAdminId: user._id,
                        hospitalId: hospital._id,
                        hospitalRegistrationNumber: normalizedRegistrationNumber,
                        documentsSubmitted: false,
                        status: "pending",
                    }],
                    { session }
                )
            )[0];

            user.hospitalId = hospital._id;
            await user.save({ session });
        });
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError("Duplicate value detected while creating account", 409);
        }
        throw error;
    } finally {
        await session.endSession();
    }

    return {
        ...authPayload(user),
        hospital: hospital.toJSON(),
        verification: {
            id: verification.id,
            status: verification.status,
            documentsSubmitted: verification.documentsSubmitted,
            reviewNotes: verification.reviewNotes,
        },
    };
}

export async function login(payload) {
    const email = normalizeEmail(payload.email);
    const user = await User.findOne({ email, isActive: true }).populate("hospitalId");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const result = {
        ...authPayload(user),
        hospital: user.hospitalId ? user.hospitalId.toJSON() : null,
    };

    // attach verification state for hospital admins so the frontend knows
    // whether to show the document upload step or the dashboard
    if (user.role === "hospital_admin") {
        const verification = await HospitalAdminVerification.findOne({
            hospitalAdminId: user._id,
        });
        if (verification) {
            result.verification = {
                id: verification.id,
                status: verification.status,
                documentsSubmitted: verification.documentsSubmitted,
                reviewNotes: verification.reviewNotes,
            };
        }
    }

    return result;
}

export async function getMyProfile(userId) {
    const user = await User.findById(userId).populate("hospitalId");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const result = user.toJSON();

    if (user.hospitalId) {
        result.hospital = user.hospitalId.toJSON();
    }

    return result;
}
