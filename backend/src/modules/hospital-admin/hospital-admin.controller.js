import { uploadHospitalDocuments, fetchMyStatus } from "./hospital-admin.service.js";

export async function uploadDocuments(req, res) {
    const adminIdProof           = req.files?.adminIdProof?.[0];
    const registrationCertificate = req.files?.registrationCertificate?.[0];

    if (!adminIdProof || !registrationCertificate) {
        return res.status(400).json({
            success: false,
            message: "Both adminIdProof and registrationCertificate files are required.",
        });
    }

    const result = await uploadHospitalDocuments(req.user.id, {
        adminIdProofPath:            adminIdProof.filename,
        registrationCertificatePath: registrationCertificate.filename,
    });

    return res.status(200).json({
        success: true,
        message: "Documents uploaded successfully. Awaiting super admin review.",
        data: result,
    });
}

export async function getMyStatus(req, res) {
    const result = await fetchMyStatus(req.user.id);

    return res.status(200).json({ success: true, data: result });
}
