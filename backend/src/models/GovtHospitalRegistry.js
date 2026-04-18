import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Mock Government Hospital Registry
 *
 * Simulates a national health authority DB. The only field the platform
 * cares about for verification is `registrationNumber`. Extra fields make
 * the mock realistic enough for demos / super-admin lookups.
 */
const govtHospitalRegistrySchema = new Schema(
    {
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        hospitalName: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        issuedYear: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "govt_hospital_registry",
    }
);

govtHospitalRegistrySchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const GovtHospitalRegistry = mongoose.model(
    "GovtHospitalRegistry",
    govtHospitalRegistrySchema
);

export default GovtHospitalRegistry;
