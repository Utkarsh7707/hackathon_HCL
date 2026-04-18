import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "User",          required: true, index: true },
        hospitalId:{ type: Schema.Types.ObjectId, ref: "Hospital",      required: true, index: true },
        vaccineId: { type: Schema.Types.ObjectId, ref: "Vaccine",       required: true },
        slotDayId: { type: Schema.Types.ObjectId, ref: "VaccineSlotDay",required: true },
        sessionName: { type: String, enum: ["Morning","Afternoon"],     required: true },
        date:        { type: String, required: true, index: true },
        priceAtBooking: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["confirmed","cancelled","completed"],
            default: "confirmed",
            index: true,
        },
    },
    { timestamps: true }
);

bookingSchema.set("toJSON", {
    transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; },
});

export default mongoose.model("Booking", bookingSchema);
