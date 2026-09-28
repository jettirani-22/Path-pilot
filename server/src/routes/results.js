import express from "express";
import { queryAll, queryOne } from "../database/database.js";

const router = express.Router();

// GET /api/results/attempt/:id - Detailed report for an attempt
router.get("/attempt/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const attempt = await queryOne(
            `SELECT t.*, c.name as career_name, c.category, c.icon, c.description as career_description
             FROM test_attempts t
             JOIN courses c ON t.course_id = c.id
             WHERE t.id = ?`,
            [Number(id)]
        );

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }

        const answers = await queryAll(
            `SELECT a.*, q.question, q.correct_answer, q.explanation
             FROM attempt_answers a
             JOIN questions q ON a.question_id = q.id
             WHERE a.attempt_id = ?`,
            [attempt.id]
        );

        const fit = await queryOne(
            "SELECT * FROM career_fit_results WHERE attempt_id = ?",
            [attempt.id]
        );

        return res.json({
            success: true,
            attempt: {
                ...attempt,
                answers,
                fit: fit ? {
                    ...fit,
                    strengths: JSON.parse(fit.strengths || "[]"),
                    areasToImprove: JSON.parse(fit.areas_to_improve || "[]"),
                    recommendedSkills: JSON.parse(fit.recommended_skills || "[]")
                } : null
            }
        });
    } catch (error) {
        console.error("GET attempt result error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch attempt results"
        });
    }
});

// GET /api/results/fit/:userId - Overall career fit synthesis
router.get("/fit/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const fitResults = await queryAll(
            `SELECT cfr.*, c.category, c.icon
             FROM career_fit_results cfr
             JOIN test_attempts ta ON cfr.attempt_id = ta.id
             JOIN courses c ON ta.course_id = c.id
             WHERE cfr.user_id = ?
             ORDER BY cfr.fit_percentage DESC`,
            [Number(userId)]
        );

        return res.json({
            success: true,
            fits: fitResults.map((fit) => ({
                ...fit,
                strengths: JSON.parse(fit.strengths || "[]"),
                areasToImprove: JSON.parse(fit.areas_to_improve || "[]"),
                recommendedSkills: JSON.parse(fit.recommended_skills || "[]")
            }))
        });
    } catch (error) {
        console.error("GET fit results error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch fit results"
        });
    }
});

export default router;
