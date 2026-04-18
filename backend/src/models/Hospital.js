import mongoose from "mongoose";

const { Schema } = mongoose;

const hospitalSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 200,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        registrationNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        onboardingStatus: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "pending",
            index: true,
        },
        isLive: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

hospitalSchema.index({ name: "text" });

hospitalSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
