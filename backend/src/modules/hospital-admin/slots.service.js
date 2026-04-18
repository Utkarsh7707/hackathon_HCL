import VaccineSlotDay from "../../models/VaccineSlotDay.js";
import HospitalVaccine from "../../models/HospitalVaccine.js";
import { AppError } from "../../utils/appError.js";

const DEFAULT_SESSIONS = [
    { name: "Morning",   startTime: "09:00", endTime: "13:00", limit: 0, booked: 0 },
    { name: "Afternoon", startTime: "14:00", endTime: "18:00", limit: 0, booked: 0 },
];

export async function getSlotsForDate(hospitalId, date) {
    // get all active inventory for this hospital
    const inventory = await HospitalVaccine.find({ hospitalId, isActive: true })
        .populate("vaccineId", "name type manufacturer");

    // get existing slot docs for the date
    const existing = await VaccineSlotDay.find({ hospitalId, date })
        .populate("vaccineId", "name type manufacturer");

    const slotMap = new Map(existing.map((s) => [s.vaccineId._id.toString(), s]));

    // merge: return a slot doc for every active inventory item
    return inventory.map((inv) => {
        const slot = slotMap.get(inv.vaccineId._id.toString());
        if (slot) return slot.toJSON();

        // virtual slot — not yet saved, use default sessions
        return {
            id:           null,
            hospitalId,
            vaccineId:    inv.vaccineId.toJSON(),
            date,
            sessions:     DEFAULT_SESSIONS,
            priceAtDate:  inv.pricePerDose,
            isActive:     false,
            totalLimit:   0,
            totalBooked:  0,
        };
    });
}

export async function getSlotsForRange(hospitalId, startDate, endDate) {
    const slots = await VaccineSlotDay.find({
        hospitalId,
        date: { $gte: startDate, $lte: endDate },
        isActive: true,
    }).populate("vaccineId", "name type");

    return slots.map((s) => s.toJSON());
}

export async function upsertSlotDay(hospitalId, { vaccineId, date, sessions, priceAtDate }) {
    // validate inventory exists
    const inv = await HospitalVaccine.findOne({ hospitalId, vaccineId, isActive: true });
    if (!inv) throw new AppError("Vaccine not in active inventory for this hospital", 400);

    // validate sessions
    const sessionNames = sessions.map((s) => s.name);
    if (!sessionNames.includes("Morning") || !sessionNames.includes("Afternoon")) {
        throw new AppError("Both Morning and Afternoon sessions are required", 400);
    }

    const slot = await VaccineSlotDay.findOneAndUpdate(
        { hospitalId, vaccineId, date },
        {
            $set: {
                sessions: sessions.map((s) => ({
                    name:      s.name,
                    startTime: s.startTime ?? (s.name === "Morning" ? "09:00" : "14:00"),
                    endTime:   s.endTime   ?? (s.name === "Morning" ? "13:00" : "18:00"),
                    limit:     s.limit,
                    booked:    s.booked ?? 0,
                })),
                priceAtDate,
                isActive: true,
            },
            $setOnInsert: { hospitalId, vaccineId, date },
        },
        { upsert: true, new: true }
    ).populate("vaccineId", "name type manufacturer");

    return slot.toJSON();
}

export async function deleteSlotDay(id, hospitalId) {
    const slot = await VaccineSlotDay.findOne({ _id: id, hospitalId });
    if (!slot) throw new AppError("Slot day not found", 404);
    slot.isActive = false;
    await slot.save();
    return { success: true };
}
