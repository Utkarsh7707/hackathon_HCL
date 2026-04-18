import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { listHospitals, listSlots, bookSlot, myBookings, cancelBooking } from "./patient.controller.js";

const router = express.Router();

/* public — no auth */
router.get("/hospitals",                   asyncHandler(listHospitals));
router.get("/hospitals/:hospitalId/slots", asyncHandler(listSlots));

/* patient auth required */
router.post("/bookings",  requireAuth, requireRole("patient"), asyncHandler(bookSlot));
router.get("/bookings",   requireAuth, requireRole("patient"), asyncHandler(myBookings));
router.patch("/bookings/:bookingId/cancel", requireAuth, requireRole("patient"), asyncHandler(cancelBooking));

export default router;
