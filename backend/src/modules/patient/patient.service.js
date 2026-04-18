import Hospital from "../../models/Hospital.js";
import HospitalVaccine from "../../models/HospitalVaccine.js";
import VaccineSlotDay from "../../models/VaccineSlotDay.js";
import Booking from "../../models/Booking.js";
import mongoose from "mongoose";
import { AppError } from "../../utils/appError.js";

/* ── hospital search ── */
export async function searchHospitals({ city, pincode, vaccineType }) {
    const hospitalQuery = { onboardingStatus: "approved", isLive: true };
    if (city)    hospitalQuery.city    = { $regex: city,    $options: "i" };
    if (pincode) hospitalQuery.pincode = { $regex: pincode, $options: "i" };

    const hospitals = await Hospital.find(hospitalQuery).lean();
    if (!hospitals.length) return [];

    const hospitalIds = hospitals.map((h) => h._id);

    // get active inventory for these hospitals
    const invQuery = { hospitalId: { $in: hospitalIds }, isActive: true, availableStock: { $gt: 0 } };
    const inventory = await HospitalVaccine.find(invQuery)
        .populate({ path: "vaccineId", match: vaccineType ? { type: vaccineType } : {} })
        .lean();

    // group inventory by hospital
    const invMap = {};
    for (const item of inventory) {
        if (!item.vaccineId) continue; // filtered out by vaccineType match
        const hid = item.hospitalId.toString();
        if (!invMap[hid]) invMap[hid] = [];
        invMap[hid].push({
            id:             item._id,
            vaccine:        { id: item.vaccineId._id, name: item.vaccineId.name, type: item.vaccineId.type, manufacturer: item.vaccineId.manufacturer },
            availableStock: item.availableStock,
            pricePerDose:   item.pricePerDose,
        });
    }

    return hospitals
        .filter((h) => invMap[h._id.toString()]?.length)
        .map((h) => ({
            id:               h._id,
            name:             h.name,
            city:             h.city,
            pincode:          h.pincode,
            address:          h.address,
            availableVaccines: invMap[h._id.toString()],
        }));
}

/* ── slots for a date ── */
export async function getHospitalSlots(hospitalId, date) {
    const slots = await VaccineSlotDay.find({ hospitalId, date, isActive: true })
        .populate("vaccineId", "name type manufacturer")
        .lean();

    return slots.map((s) => ({
        id:          s._id,
        vaccine:     s.vaccineId,
        date:        s.date,
        priceAtDate: s.priceAtDate,
        sessions:    s.sessions.map((se) => ({
            name:       se.name,
            startTime:  se.startTime,
            endTime:    se.endTime,
            limit:      se.limit,
            booked:     se.booked,
            remaining:  Math.max(0, se.limit - se.booked),
            isSoldOut:  se.booked >= se.limit,
        })),
    }));
}

/* ── create booking (atomic) ── */
export async function createBooking(patientId, { hospitalId, vaccineId, slotDayId, sessionName, date }) {
    const session = await mongoose.startSession();
    let booking;

    try {
        await session.withTransaction(async () => {
            // Prevent duplicate booking for the same vaccine on the same date.
            const existingBooking = await Booking.findOne(
                {
                    patientId,
                    vaccineId,
                    date,
                    status: { $in: ["confirmed", "completed"] },
                },
                null,
                { session }
            );

            if (existingBooking) {
                throw new AppError("You already have a booking for this vaccine on this date", 409);
            }

            const slotDay = await VaccineSlotDay.findOne(
                { _id: slotDayId, hospitalId, vaccineId, date, isActive: true },
                null, { session }
            );
            if (!slotDay) throw new AppError("Slot day not found", 404);

            const sessionEntry = slotDay.sessions.find((s) => s.name === sessionName);
            if (!sessionEntry)           throw new AppError("Session not found", 404);
            if (sessionEntry.booked >= sessionEntry.limit) throw new AppError("This session is fully booked", 409);

            // Reserve one dose from hospital inventory.
            const invUpdate = await HospitalVaccine.updateOne(
                { hospitalId, vaccineId, isActive: true, availableStock: { $gt: 0 } },
                { $inc: { availableStock: -1 } },
                { session }
            );
            if (!invUpdate.modifiedCount) {
                throw new AppError("Selected vaccine is out of stock", 409);
            }

            // increment booked count atomically
            await VaccineSlotDay.updateOne(
                { _id: slotDayId, "sessions.name": sessionName },
                { $inc: { "sessions.$.booked": 1 } },
                { session }
            );

            booking = (await Booking.create([{
                patientId, hospitalId, vaccineId, slotDayId,
                sessionName, date,
                priceAtBooking: slotDay.priceAtDate,
                status: "confirmed",
            }], { session }))[0];
        });
    } finally {
        await session.endSession();
    }

    return booking
        .populate([
            { path: "hospitalId", select: "name city pincode" },
            { path: "vaccineId",  select: "name type" },
        ])
        .then((b) => b.toJSON());
}

/* ── patient's bookings ── */
export async function getMyBookings(patientId) {
    const bookings = await Booking.find({ patientId })
        .populate("hospitalId", "name city pincode")
        .populate("vaccineId",  "name type")
        .sort({ createdAt: -1 });

    return bookings.map((b) => b.toJSON());
}

/* ── cancel booking (atomic) ── */
export async function cancelMyBooking(patientId, bookingId) {
    const session = await mongoose.startSession();
    let cancelled;

    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findOne({ _id: bookingId, patientId }, null, { session });
            if (!booking) throw new AppError("Booking not found", 404);
            if (booking.status !== "confirmed") {
                throw new AppError("Only confirmed bookings can be cancelled", 400);
            }

            booking.status = "cancelled";
            await booking.save({ session });

            await VaccineSlotDay.updateOne(
                { _id: booking.slotDayId, "sessions.name": booking.sessionName },
                { $inc: { "sessions.$.booked": -1 } },
                { session }
            );

            // Return one dose back to inventory.
            await HospitalVaccine.updateOne(
                { hospitalId: booking.hospitalId, vaccineId: booking.vaccineId, isActive: true },
                { $inc: { availableStock: 1 } },
                { session }
            );

            cancelled = booking;
        });
    } finally {
        await session.endSession();
    }

    return cancelled
        .populate([
            { path: "hospitalId", select: "name city pincode" },
            { path: "vaccineId",  select: "name type" },
        ])
        .then((b) => b.toJSON());
}
