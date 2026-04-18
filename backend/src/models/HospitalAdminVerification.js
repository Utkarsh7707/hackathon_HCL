import mongoose from "mongoose";

const { Schema } = mongoose;

const hospitalAdminVerificationSchema = new Schema(
    {
        hospitalAdminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        hospitalId: {
            type: Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            unique: true,
        },
        hospitalRegistrationNumber: {
            type: String,
            required: true,
            trim: true,
        },
        adminIdProofUrl: {
            type: String,
            required: true,
            trim: true,
        },
        registrationCertificateUrl: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending",
            index: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewNotes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

hospitalAdminVerificationSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const HospitalAdminVerification = mongoose.model(
    "HospitalAdminVerification",
    hospitalAdminVerificationSchema
);

export default HospitalAdminVerification;
