import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Hybrid Session model — one document per (hospital, vaccine, date).
 * Stores both sessions in a single document for fast date-range queries.
 */
const sessionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            enum: ["Morning", "Afternoon"],
        },
        startTime: { type: String, default: "" },
        endTime:   { type: String, default: "" },
        limit:     { type: Number, required: true, min: 0 },
        booked:    { type: Number, default: 0,     min: 0 },
    },
    { _id: false }
);

const vaccineSlotDaySchema = new Schema(
    {
        hospitalId: {
            type: Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true,
        },
        vaccineId: {
            type: Schema.Types.ObjectId,
            ref: "Vaccine",
            required: true,
        },
        /* ISO date string YYYY-MM-DD — kept as string for cheap equality queries */
        date: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
            index: true,
        },
        sessions: {
            type: [sessionSchema],
            default: [],
        },
        priceAtDate: {
            type: Number,
            required: true,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// primary lookup key
vaccineSlotDaySchema.index({ hospitalId: 1, date: 1 });
vaccineSlotDaySchema.index({ hospitalId: 1, vaccineId: 1, date: 1 }, { unique: true });

vaccineSlotDaySchema.virtual("totalLimit").get(function () {
    return this.sessions.reduce((s, se) => s + se.limit, 0);
});

vaccineSlotDaySchema.virtual("totalBooked").get(function () {
    return this.sessions.reduce((s, se) => s + se.booked, 0);
});

vaccineSlotDaySchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const VaccineSlotDay = mongoose.model("VaccineSlotDay", vaccineSlotDaySchema);
export default VaccineSlotDay;
