import { z } from "zod";

const baseUserSchema = {
    name: z.string().min(2, "Name must be at least 2 characters").max(120),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be at most 72 characters"),
    phone: z.string().min(7).max(20).optional(),
};

export const patientSignupSchema = z.object(baseUserSchema);

export const hospitalAdminSignupSchema = z.object({
    ...baseUserSchema,
    hospitalName: z.string().min(2, "Hospital name is required").max(200),
    city: z.string().min(2, "City is required").max(100),
    pincode: z.string().min(4, "Pincode is required").max(10),
    address: z.string().max(300).optional(),
    hospitalRegistrationNumber: z
        .string()
        .min(3, "Hospital registration number is required")
        .max(120),
    // documents are uploaded separately after signup via /hospital-admin/upload-documents
});

export const superAdminSignupSchema = z.object({
    ...baseUserSchema,
    setupKey: z.string().min(6, "Setup key is required"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});
