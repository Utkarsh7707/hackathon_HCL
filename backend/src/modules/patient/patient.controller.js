import { searchHospitals, getHospitalSlots, createBooking, getMyBookings } from "./patient.service.js";
import { AppError } from "../../utils/appError.js";

export async function listHospitals(req, res) {
    const { city, pincode, vaccineType } = req.query;
    const data = await searchHospitals({ city, pincode, vaccineType });
    return res.status(200).json({ success: true, data });
}

export async function listSlots(req, res) {
    const { hospitalId } = req.params;
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError("Query param ?date=YYYY-MM-DD is required", 400);
    const data = await getHospitalSlots(hospitalId, date);
    return res.status(200).json({ success: true, data });
}

export async function bookSlot(req, res) {
    const { hospitalId, vaccineId, slotDayId, sessionName, date } = req.body;
    if (!hospitalId || !vaccineId || !slotDayId || !sessionName || !date)
        throw new AppError("hospitalId, vaccineId, slotDayId, sessionName and date are all required", 400);
    const data = await createBooking(req.user.id, { hospitalId, vaccineId, slotDayId, sessionName, date });
    return res.status(201).json({ success: true, message: "Slot booked successfully!", data });
}

export async function myBookings(req, res) {
    const data = await getMyBookings(req.user.id);
    return res.status(200).json({ success: true, data });
}
