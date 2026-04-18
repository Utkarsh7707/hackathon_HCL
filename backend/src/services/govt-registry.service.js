import GovtHospitalRegistry from "../models/GovtHospitalRegistry.js";
import { AppError } from "../utils/appError.js";

function normalizeRegistrationNumber(registrationNumber) {
    return registrationNumber.trim().toUpperCase();
}

async function verifyAgainstLocalRegistry(normalizedRegistrationNumber) {
    const entry = await GovtHospitalRegistry.findOne({
        registrationNumber: normalizedRegistrationNumber,
        isActive: true,
    });

    return {
        exists: Boolean(entry),
        source: "local-govt-registry",
        payload: entry ? entry.toJSON() : null,
    };
}

export async function verifyHospitalRegistrationNumber(registrationNumber) {
    const normalizedRegistrationNumber = normalizeRegistrationNumber(registrationNumber);

    const result = await verifyAgainstLocalRegistry(normalizedRegistrationNumber);

    if (!result.exists) {
        throw new AppError(
            "Hospital registration number was not found in the government hospital registry.",
            400
        );
    }

    return {
        registrationNumber: normalizedRegistrationNumber,
        source: result.source,
        data: result.payload,
    };
}
