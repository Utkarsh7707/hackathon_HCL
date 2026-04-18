import { getVerifications, reviewVerification } from "./super-admin.service.js";
import { AppError } from "../../utils/appError.js";

export async function listVerifications(req, res) {
    const status = req.query.status ?? "pending";
    const data   = await getVerifications(status);

    return res.status(200).json({ success: true, data });
}

export async function decideVerification(req, res) {
    const { id }      = req.params;
    const { decision, notes } = req.body;

    if (!["approve", "reject"].includes(decision)) {
        throw new AppError("decision must be 'approve' or 'reject'", 400);
    }

    const result = await reviewVerification(id, req.user.id, decision, notes ?? "");

    return res.status(200).json({
        success: true,
        message: `Hospital ${decision}d successfully.`,
        data: result,
    });
}
