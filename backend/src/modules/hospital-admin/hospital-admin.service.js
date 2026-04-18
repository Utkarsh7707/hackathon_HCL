import HospitalAdminVerification from "../../models/HospitalAdminVerification.js";
import Hospital from "../../models/Hospital.js";
import { AppError } from "../../utils/appError.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";

export async function uploadHospitalDocuments(
    adminId,
    { adminIdProofFile, registrationCertificateFile }
) {
    const verification = await HospitalAdminVerification.findOne({ hospitalAdminId: adminId });

    if (!verification) {
        throw new AppError("Verification record not found", 404);
    }

    if (verification.status === "approved") {
        throw new AppError("Hospital is already approved", 400);
    }

    const [adminIdProofUpload, registrationCertificateUpload] = await Promise.all([
        uploadBufferToCloudinary({
            buffer: adminIdProofFile.buffer,
            mimeType: adminIdProofFile.mimeType,
            folder: `hospital-verification/${adminId}`,
            publicIdPrefix: "admin-id-proof",
        }),
        uploadBufferToCloudinary({
            buffer: registrationCertificateFile.buffer,
            mimeType: registrationCertificateFile.mimeType,
            folder: `hospital-verification/${adminId}`,
            publicIdPrefix: "registration-certificate",
        }),
    ]);

    verification.adminIdProofUrl = adminIdProofUpload.url;
    verification.registrationCertificateUrl = registrationCertificateUpload.url;
    verification.documentsSubmitted = true;
    // reset to pending if re-submitting after rejection
    verification.status = "pending";
    verification.reviewNotes = "";
    await verification.save();

    return {
        id: verification.id,
        status: verification.status,
        documentsSubmitted: verification.documentsSubmitted,
        adminIdProofUrl: verification.adminIdProofUrl,
        registrationCertificateUrl: verification.registrationCertificateUrl,
    };
}

export async function fetchMyStatus(adminId) {
    const verification = await HospitalAdminVerification.findOne({ hospitalAdminId: adminId });
    const hospital = await Hospital.findOne({ adminId });

    if (!verification || !hospital) {
        throw new AppError("Record not found", 404);
    }

    return {
        hospital: hospital.toJSON(),
        verification: {
            id: verification.id,
            status: verification.status,
            documentsSubmitted: verification.documentsSubmitted,
            reviewNotes: verification.reviewNotes,
            adminIdProofUrl: verification.adminIdProofUrl,
            registrationCertificateUrl: verification.registrationCertificateUrl,
        },
    };
}
