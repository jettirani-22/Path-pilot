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

// GET /api/courses/:id/levels - Get difficulty levels with student unlock status
router.get("/:id/levels", async (req, res) => {
    try {
        const { id } = req.params;
        let courseId = Number(id);

        if (Number.isNaN(courseId)) {
            const formatted = id.replace(/-/g, " ");
            const course = await queryOne("SELECT id FROM courses WHERE LOWER(name) = LOWER(?)", [formatted]);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });
            courseId = course.id;
        }

        // Check if user is logged in
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const jwt = (await import("jsonwebtoken")).default;
                const token = authHeader.split(" ")[1];
                const secret = process.env.JWT_SECRET?.trim() || "pathpilot-development-secret-change-this";
                const decoded = jwt.verify(token, secret);
                if (decoded?.id) userId = Number(decoded.id);
            } catch (_) {}
        }

        const levels = await queryAll("SELECT * FROM difficulty_levels ORDER BY sort_order ASC");

        const levelSummaries = [];

        for (const lvl of levels) {
            const taskStats = await queryOne(
                `SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN task_type IN ('code', 'coding') THEN 1 ELSE 0 END) as coding_tasks
                 FROM tasks 
                 WHERE course_id = ? AND difficulty_id = ?`,
                [courseId, lvl.id]
            );

            let isUnlocked = lvl.id === 1;
            let isCompleted = false;
            let completedTasks = 0;
            let bestScore = 0;
            let badge = null;

            if (userId) {
                const progress = await queryOne(
                    "SELECT * FROM student_progress WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                    [userId, courseId, lvl.id]
                );

                if (progress) {
                    isUnlocked = Boolean(progress.is_unlocked || lvl.id === 1);
                    isCompleted = Boolean(progress.is_completed);
                    completedTasks = progress.completed_tasks || 0;
                    bestScore = progress.best_score || 0;
                }

                badge = await queryOne(
                    "SELECT * FROM badges WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                    [userId, courseId, lvl.id]
                );
            }

            levelSummaries.push({
                id: lvl.id,
                name: lvl.name,
                description: lvl.description,
                sortOrder: lvl.sort_order,
                totalTasks: Number(taskStats?.total_tasks || (lvl.id === 1 ? 10 : lvl.id === 2 ? 16 : lvl.id === 3 ? 20 : 26)),
                codingTasks: Number(taskStats?.coding_tasks || (lvl.id === 1 ? 2 : lvl.id === 2 ? 5 : lvl.id === 3 ? 7 : 10)),
                isUnlocked,
                isCompleted,
                completedTasks,
                bestScore,
                badge
            });
        }

        return res.json({
            success: true,
            courseId,
            levels: levelSummaries
        });
    } catch (error) {
        console.error("GET levels error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch levels" });
    }
});

// GET /api/courses/:id/tasks/:difficultyId - Get tasks for a specific level in sequential order
router.get("/:id/tasks/:difficultyId", async (req, res) => {
    try {
        const { id, difficultyId } = req.params;
        let courseId = Number(id);

        if (Number.isNaN(courseId)) {
            const formatted = id.replace(/-/g, " ");
            const course = await queryOne("SELECT id FROM courses WHERE LOWER(name) = LOWER(?)", [formatted]);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });
            courseId = course.id;
        }

        const diffId = Number(difficultyId);

        // Check user auth
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const jwt = (await import("jsonwebtoken")).default;
                const token = authHeader.split(" ")[1];
                const secret = process.env.JWT_SECRET?.trim() || "pathpilot-development-secret-change-this";
                const decoded = jwt.verify(token, secret);
                if (decoded?.id) userId = Number(decoded.id);
            } catch (_) {}
        }

        let completedTasksCount = 0;
        let isLevelUnlocked = diffId === 1;

        if (userId) {
            const progress = await queryOne(
                "SELECT * FROM student_progress WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                [userId, courseId, diffId]
            );
            if (progress) {
                completedTasksCount = progress.completed_tasks || 0;
                isLevelUnlocked = Boolean(progress.is_unlocked || diffId === 1);
            }
        }

        const tasks = await queryAll(
            "SELECT * FROM tasks WHERE course_id = ? AND difficulty_id = ? ORDER BY task_number ASC",
            [courseId, diffId]
        );

        return res.json({
            success: true,
            courseId,
            difficultyId: diffId,
            isLevelUnlocked,
            completedTasksCount,
            tasks: tasks.map(t => ({
                ...t,
                test_cases: typeof t.test_cases === "string" ? JSON.parse(t.test_cases || "[]") : (t.test_cases || []),
                isCompleted: t.task_number <= completedTasksCount,
                isCurrent: t.task_number === completedTasksCount + 1,
                isLocked: !isLevelUnlocked || (t.task_number > completedTasksCount + 1)
            }))
        });
    } catch (error) {
        console.error("GET tasks error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
    }
});

export default router;
