import express from "express";
import { queryAll, queryOne } from "../database/database.js";

const router = express.Router();

// GET /api/courses - List all available careers/courses
router.get("/", async (req, res) => {
    try {
        const { category, search } = req.query;

        let sql = `
            SELECT c.*,
                   (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id) as question_count
            FROM courses c
            WHERE 1=1
        `;
        const params = [];

        if (category && category !== "All") {
            sql += " AND c.category = ?";
            params.push(category);
        }

        if (search) {
            sql += " AND (c.name LIKE ? OR c.description LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += " ORDER BY c.id ASC";

        const courses = await queryAll(sql, params);

        return res.json({
            success: true,
            courses
        });
    } catch (error) {
        console.error("GET courses error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses"
        });
    }
});

// GET /api/courses/:id - Course detail
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let course = null;

        if (/^\d+$/.test(id)) {
            course = await queryOne("SELECT * FROM courses WHERE id = ?", [Number(id)]);
        } else {
            const formatted = id.replace(/-/g, " ");
            course = await queryOne("SELECT * FROM courses WHERE LOWER(name) = LOWER(?)", [formatted]);
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Career not found"
            });
        }

        const questions = await queryAll(
            "SELECT id, question, option_a, option_b, option_c, option_d, marks, question_type FROM questions WHERE course_id = ? ORDER BY id ASC",
            [course.id]
        );

        return res.json({
            success: true,
            course: {
                ...course,
                questions
            }
        });
    } catch (error) {
        console.error("GET course by id error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course details"
        });
    }
});

// GET /api/courses/:id/questions - Simulation questions
router.get("/:id/questions", async (req, res) => {
    try {
        const { id } = req.params;
        let courseId = Number(id);

        if (Number.isNaN(courseId)) {
            const formatted = id.replace(/-/g, " ");
            const course = await queryOne("SELECT id FROM courses WHERE LOWER(name) = LOWER(?)", [formatted]);
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            courseId = course.id;
        }

        const { difficultyId, type } = req.query;

        let sql = `
            SELECT id, course_id, difficulty_id, question,
                   option_a, option_b, option_c, option_d,
                   explanation, marks, question_type, code_language, starter_code, test_cases, expected_output
            FROM questions
            WHERE course_id = ?
        `;
        const params = [courseId];

        if (difficultyId) {
            sql += " AND difficulty_id = ?";
            params.push(Number(difficultyId));
        }

        if (type) {
            sql += " AND question_type = ?";
            params.push(type);
        }

        sql += " ORDER BY difficulty_id ASC, id ASC";

        const questions = await queryAll(sql, params);

        return res.json({
            success: true,
            questions: questions.map(q => ({
                ...q,
                test_cases: typeof q.test_cases === "string" ? JSON.parse(q.test_cases || "[]") : (q.test_cases || [])
            }))
        });
    } catch (error) {
        console.error("GET course questions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions"
        });
    }
});

export default router;
