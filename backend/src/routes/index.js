import express from "express";
import authRouter         from "../modules/auth/auth.routes.js";
import hospitalAdminRouter from "../modules/hospital-admin/hospital-admin.routes.js";
import superAdminRouter   from "../modules/super-admin/super-admin.routes.js";

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString(),
    });
});

apiRouter.use("/auth",          authRouter);
apiRouter.use("/hospital-admin", hospitalAdminRouter);
apiRouter.use("/super-admin",   superAdminRouter);

export default apiRouter;
