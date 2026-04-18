import Booking from "../../models/Booking.js";

export async function getHospitalBookings(hospitalId, filters = {}) {
    const query = { hospitalId };

    if (filters.date) query.date = filters.date;
    if (filters.startDate || filters.endDate) {
        query.date = {
            ...(filters.startDate ? { $gte: filters.startDate } : {}),
            ...(filters.endDate ? { $lte: filters.endDate } : {}),
        };
    }
    if (filters.sessionName) query.sessionName = filters.sessionName;
    if (filters.status) query.status = filters.status;

    const bookings = await Booking.find(query)
        .populate("patientId", "name email phone")
        .populate("vaccineId", "name type")
        .sort({ createdAt: -1 });

    return bookings.map((b) => b.toJSON());
}