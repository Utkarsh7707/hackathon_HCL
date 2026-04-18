import HospitalAdminVerification from "../../models/HospitalAdminVerification.js";
import Hospital from "../../models/Hospital.js";
import HospitalVaccine from "../../models/HospitalVaccine.js";
import Vaccine from "../../models/Vaccine.js";
import { AppError } from "../../utils/appError.js";

export async function getVerifications(statusFilter) {
    const query = { documentsSubmitted: true };
    if (statusFilter !== "all") query.status = statusFilter;

    const verifications = await HospitalAdminVerification.find(query)
        .populate("hospitalAdminId", "name email phone")
        .populate("hospitalId",      "name city pincode registrationNumber address")
        .sort({ createdAt: -1 });

    return verifications.map((v) => ({
        id:                          v.id,
        status:                      v.status,
        documentsSubmitted:          v.documentsSubmitted,
        adminIdProofUrl:             v.adminIdProofUrl,
        registrationCertificateUrl:  v.registrationCertificateUrl,
        hospitalRegistrationNumber:  v.hospitalRegistrationNumber,
        reviewNotes:                 v.reviewNotes,
        submittedAt:                 v.updatedAt,
        admin: {
            id:    v.hospitalAdminId?._id,
            name:  v.hospitalAdminId?.name,
            email: v.hospitalAdminId?.email,
            phone: v.hospitalAdminId?.phone,
        },
        hospital: v.hospitalId ? {
            id:                 v.hospitalId._id,
            name:               v.hospitalId.name,
            city:               v.hospitalId.city,
            pincode:            v.hospitalId.pincode,
            registrationNumber: v.hospitalId.registrationNumber,
            address:            v.hospitalId.address,
        } : null,
    }));
}

export async function reviewVerification(verificationId, reviewerAdminId, decision, notes) {
    const verification = await HospitalAdminVerification.findById(verificationId);

    if (!verification) {
        throw new AppError("Verification record not found", 404);
    }

    if (!["pending"].includes(verification.status)) {
        throw new AppError(`Cannot review a verification that is already '${verification.status}'`, 400);
    }

    const newStatus  = decision === "approve" ? "approved" : "rejected";
    verification.status      = newStatus;
    verification.reviewedBy  = reviewerAdminId;
    verification.reviewNotes = notes;
    await verification.save();

    // mirror the status on the Hospital document
    const hospital = await Hospital.findById(verification.hospitalId);
    if (hospital) {
        hospital.onboardingStatus = newStatus;
        hospital.isLive           = newStatus === "approved";
        await hospital.save();
    }

    return {
        id:          verification.id,
        status:      verification.status,
        reviewNotes: verification.reviewNotes,
        hospital:    hospital?.toJSON() ?? null,
    };
}

export async function setHospitalAccessState(verificationId, reviewerAdminId, action, notes = "") {
    const verification = await HospitalAdminVerification.findById(verificationId);

    if (!verification) {
        throw new AppError("Verification record not found", 404);
    }

    const isBlacklist = action === "blacklist";
    const newStatus = isBlacklist ? "suspended" : "approved";

    verification.status = newStatus;
    verification.reviewedBy = reviewerAdminId;
    verification.reviewNotes = notes;
    await verification.save();

    const hospital = await Hospital.findById(verification.hospitalId);
    if (hospital) {
        hospital.onboardingStatus = newStatus;
        hospital.isLive = !isBlacklist;
        await hospital.save();
    }

    return {
        id: verification.id,
        status: verification.status,
        reviewNotes: verification.reviewNotes,
        hospital: hospital?.toJSON() ?? null,
    };
}

export async function getVaccineCoverage() {
    const [vaccines, inventoryRows] = await Promise.all([
        Vaccine.find({ isActive: true }).sort({ name: 1 }).lean(),
        HospitalVaccine.find({ isActive: true })
            .populate("hospitalId", "name city pincode onboardingStatus isLive")
            .populate("vaccineId", "name type")
            .lean(),
    ]);

    const coverageByVaccineId = new Map();

    for (const row of inventoryRows) {
        if (!row.vaccineId || !row.hospitalId) continue;

        const vaccineId = String(row.vaccineId._id);
        if (!coverageByVaccineId.has(vaccineId)) coverageByVaccineId.set(vaccineId, []);

        coverageByVaccineId.get(vaccineId).push({
            hospitalId: String(row.hospitalId._id),
            hospitalName: row.hospitalId.name,
            city: row.hospitalId.city,
            pincode: row.hospitalId.pincode,
            onboardingStatus: row.hospitalId.onboardingStatus,
            isLive: row.hospitalId.isLive,
            totalStock: row.totalStock,
            availableStock: row.availableStock,
            pricePerDose: row.pricePerDose,
        });
    }

    return vaccines.map((v) => {
        const providers = coverageByVaccineId.get(String(v._id)) ?? [];
        return {
            id: String(v._id),
            name: v.name,
            type: v.type,
            manufacturer: v.manufacturer,
            providersCount: providers.length,
            providers,
        };
    });
}
