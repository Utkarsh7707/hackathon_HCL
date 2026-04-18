import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Hospital's vaccine inventory.
 * One document per (hospital, vaccine) pair.
 */
const hospitalVaccineSchema = new Schema(
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
        totalStock: {
            type: Number,
            required: true,
            min: 0,
        },
        availableStock: {
            type: Number,
            required: true,
            min: 0,
        },
        pricePerDose: {
            type: Number,
            required: true,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

// one vaccine per hospital
hospitalVaccineSchema.index({ hospitalId: 1, vaccineId: 1 }, { unique: true });

hospitalVaccineSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const HospitalVaccine = mongoose.model("HospitalVaccine", hospitalVaccineSchema);
export default HospitalVaccine;
