import HospitalVaccine from "../../models/HospitalVaccine.js";
import Vaccine from "../../models/Vaccine.js";
import { AppError } from "../../utils/appError.js";

export async function getInventory(hospitalId) {
    const items = await HospitalVaccine.find({ hospitalId })
        .populate("vaccineId", "name type manufacturer dosesRequired")
        .sort({ createdAt: -1 });

    return items.map((item) => ({
        id:             item.id,
        vaccine:        item.vaccineId,
        totalStock:     item.totalStock,
        availableStock: item.availableStock,
        usedStock:      item.totalStock - item.availableStock,
        pricePerDose:   item.pricePerDose,
        isActive:       item.isActive,
        updatedAt:      item.updatedAt,
    }));
}

export async function addToInventory(hospitalId, { vaccineId, totalStock, pricePerDose }) {
    const vaccine = await Vaccine.findById(vaccineId);
    if (!vaccine) throw new AppError("Vaccine not found in master catalog", 404);

    const existing = await HospitalVaccine.findOne({ hospitalId, vaccineId });
    if (existing) {
        // reactivate and top-up stock instead of blocking
        existing.totalStock     += totalStock;
        existing.availableStock += totalStock;
        existing.pricePerDose    = pricePerDose;
        existing.isActive        = true;
        await existing.save();
        return existing.populate("vaccineId", "name type manufacturer dosesRequired");
    }

    const item = await HospitalVaccine.create({
        hospitalId,
        vaccineId,
        totalStock,
        availableStock: totalStock,
        pricePerDose,
        isActive: true,
    });

    return item.populate("vaccineId", "name type manufacturer dosesRequired");
}

export async function updateInventory(id, hospitalId, updates) {
    const item = await HospitalVaccine.findOne({ _id: id, hospitalId });
    if (!item) throw new AppError("Inventory item not found", 404);

    if (updates.addStock !== undefined) {
        item.totalStock     += updates.addStock;
        item.availableStock += updates.addStock;
    }
    if (updates.pricePerDose !== undefined) item.pricePerDose = updates.pricePerDose;
    if (updates.isActive     !== undefined) item.isActive     = updates.isActive;

    await item.save();
    return item.populate("vaccineId", "name type manufacturer dosesRequired");
}

export async function removeFromInventory(id, hospitalId) {
    const item = await HospitalVaccine.findOne({ _id: id, hospitalId });
    if (!item) throw new AppError("Inventory item not found", 404);
    item.isActive = false;
    await item.save();
    return { success: true };
}

export async function getMasterCatalog() {
    return Vaccine.find({ isActive: true }).sort({ name: 1 });
}

export async function createCatalogVaccine({ name, type, manufacturer, description, dosesRequired }) {
    const normalizedName = String(name).trim();
    const exists = await Vaccine.findOne({ name: new RegExp(`^${normalizedName}$`, "i") });
    if (exists) throw new AppError("Vaccine with this name already exists", 409);

    const vaccine = await Vaccine.create({
        name: normalizedName,
        type,
        manufacturer: manufacturer?.trim() ?? "",
        description: description?.trim() ?? "",
        dosesRequired: Number(dosesRequired) || 1,
        isActive: true,
    });

    return vaccine;
}
