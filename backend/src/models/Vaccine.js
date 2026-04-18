import mongoose from "mongoose";

const { Schema } = mongoose;

const vaccineSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["covid19", "influenza", "hepatitisB", "hepatitisA", "typhoid", "hpv", "mmr", "varicella", "rabies", "cholera", "other"],
            index: true,
        },
        manufacturer: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        dosesRequired: {
            type: Number,
            default: 1,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

vaccineSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Vaccine = mongoose.model("Vaccine", vaccineSchema);
export default Vaccine;
