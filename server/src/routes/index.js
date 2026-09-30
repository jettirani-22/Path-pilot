import express from "express";
import authRoutes from "./auth.js";
import coursesRoutes from "./courses.js";
import testsRoutes from "./tests.js";
import resultsRoutes from "./results.js";
import aiRoutes from "./ai.js";
import codingRoutes from "./coding.js";
import userRoutes from "./user.js";
import adminRoutes from "./admin.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/courses", coursesRoutes);
router.use("/tests", testsRoutes);
router.use("/results", resultsRoutes);
router.use("/ai", aiRoutes);
router.use("/coding", codingRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;
