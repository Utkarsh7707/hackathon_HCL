import { uploadHospitalDocuments, fetchMyStatus } from "./hospital-admin.service.js";
import {
    getInventory, addToInventory, updateInventory,
    removeFromInventory, getMasterCatalog, createCatalogVaccine,
} from "./inventory.service.js";
import {
    getSlotsForDate, getSlotsForRange, upsertSlotDay, deleteSlotDay,
} from "./slots.service.js";
import { getHospitalBookings } from "./bookings.service.js";
import Hospital from "../../models/Hospital.js";
import { AppError } from "../../utils/appError.js";

/* ─── resolve hospitalId from authenticated admin ─── */
async function resolveHospitalId(userId) {
    const hospital = await Hospital.findOne({ adminId: userId, onboardingStatus: "approved" });
    if (!hospital) throw new AppError("Approved hospital not found for this admin", 403);
    return hospital._id;
}

/* ─── document upload ─── */
export async function uploadDocuments(req, res) {
    const adminIdProof            = req.files?.adminIdProof?.[0];
    const registrationCertificate = req.files?.registrationCertificate?.[0];

    if (!adminIdProof || !registrationCertificate) {
        return res.status(400).json({
            success: false,
            message: "Both adminIdProof and registrationCertificate files are required.",
        });
    }

    const result = await uploadHospitalDocuments(req.user.id, {
        adminIdProofFile: {
            buffer:       adminIdProof.buffer,
            mimeType:     adminIdProof.mimetype,
            originalName: adminIdProof.originalname,
        },
        registrationCertificateFile: {
            buffer:       registrationCertificate.buffer,
            mimeType:     registrationCertificate.mimetype,
            originalName: registrationCertificate.originalname,
        },
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

/* ─── inventory ─── */
export async function listInventory(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const data = await getInventory(hospitalId);
    return res.status(200).json({ success: true, data });
}

export async function addInventory(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const { vaccineId, totalStock, pricePerDose } = req.body;
    if (!vaccineId || !totalStock || !pricePerDose) {
        throw new AppError("vaccineId, totalStock and pricePerDose are required", 400);
    }
    const data = await addToInventory(hospitalId, { vaccineId, totalStock: Number(totalStock), pricePerDose: Number(pricePerDose) });
    return res.status(201).json({ success: true, data });
}

export async function patchInventory(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const data = await updateInventory(req.params.id, hospitalId, req.body);
    return res.status(200).json({ success: true, data });
}

export async function deactivateInventory(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    await removeFromInventory(req.params.id, hospitalId);
    return res.status(200).json({ success: true, message: "Vaccine removed from inventory." });
}

export async function listCatalog(_req, res) {
    const data = await getMasterCatalog();
    return res.status(200).json({ success: true, data });
}

export async function addCatalogVaccine(req, res) {
    const { name, type, manufacturer, description, dosesRequired } = req.body;
    if (!name || !type) throw new AppError("name and type are required", 400);

    const data = await createCatalogVaccine({
        name,
        type,
        manufacturer,
        description,
        dosesRequired,
    });

    return res.status(201).json({ success: true, data });
}

/* ─── slots ─── */
export async function listSlotsForDate(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new AppError("Query param ?date=YYYY-MM-DD is required", 400);
    }
    const data = await getSlotsForDate(hospitalId, date);
    return res.status(200).json({ success: true, data });
}

export async function listSlotsRange(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new AppError("startDate and endDate are required", 400);
    const data = await getSlotsForRange(hospitalId, startDate, endDate);
    return res.status(200).json({ success: true, data });
}

export async function saveSlotDay(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const { vaccineId, date, sessions, priceAtDate } = req.body;
    if (!vaccineId || !date || !sessions || priceAtDate === undefined) {
        throw new AppError("vaccineId, date, sessions and priceAtDate are required", 400);
    }
    const data = await upsertSlotDay(hospitalId, { vaccineId, date, sessions, priceAtDate: Number(priceAtDate) });
    return res.status(200).json({ success: true, data });
}

export async function removeSlotDay(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    await deleteSlotDay(req.params.id, hospitalId);
    return res.status(200).json({ success: true, message: "Slot day removed." });
}

/* ─── bookings ─── */
export async function listHospitalBookings(req, res) {
    const hospitalId = await resolveHospitalId(req.user.id);
    const { date, startDate, endDate, sessionName, status } = req.query;

    const today = new Date().toISOString().split("T")[0];
    const normalizedDate = date === "today" ? today : date;

    if (normalizedDate && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        throw new AppError("date must be YYYY-MM-DD or 'today'", 400);
    }
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        throw new AppError("startDate must be YYYY-MM-DD", 400);
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        throw new AppError("endDate must be YYYY-MM-DD", 400);
    }

    const data = await getHospitalBookings(hospitalId, {
        date: normalizedDate,
        startDate,
        endDate,
        sessionName,
        status,
    });

    return res.status(200).json({ success: true, data });
}
