import HospitalAdminVerification from "../../models/HospitalAdminVerification.js";
import Hospital from "../../models/Hospital.js";
import { AppError } from "../../utils/appError.js";

export async function uploadHospitalDocuments(adminId, { adminIdProofPath, registrationCertificatePath }) {
    const verification = await HospitalAdminVerification.findOne({ hospitalAdminId: adminId });

    if (!verification) {
        throw new AppError("Verification record not found", 404);
    }

    if (verification.status === "approved") {
        throw new AppError("Hospital is already approved", 400);
    }

    verification.adminIdProofUrl           = adminIdProofPath;
    verification.registrationCertificateUrl = registrationCertificatePath;
    verification.documentsSubmitted         = true;
    // reset to pending if re-submitting after rejection
    verification.status                    = "pending";
    verification.reviewNotes               = "";
    await verification.save();

    return {
        id:                   verification.id,
        status:               verification.status,
        documentsSubmitted:   verification.documentsSubmitted,
    };
}

export async function fetchMyStatus(adminId) {
    const verification = await HospitalAdminVerification.findOne({ hospitalAdminId: adminId });
    const hospital     = await Hospital.findOne({ adminId });

    if (!verification || !hospital) {
        throw new AppError("Record not found", 404);
    }

    return {
        hospital:     hospital.toJSON(),
        verification: {
            id:                   verification.id,
            status:               verification.status,
            documentsSubmitted:   verification.documentsSubmitted,
            reviewNotes:          verification.reviewNotes,
        },
    };
}
