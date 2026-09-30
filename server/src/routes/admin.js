import express from "express";
import { queryAll, queryOne, execute } from "../database/database.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Middleware: all admin routes require authenticated admin
router.use(authenticateToken);
router.use(requireAdmin);

// =========================================================================
// 1. GET /api/admin/overview - System stats & activity
// =========================================================================
router.get("/overview", async (req, res) => {
    try {
        const totalUsers = (await queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'student'"))?.count || 0;
        const totalAttempts = (await queryOne("SELECT COUNT(*) as count FROM test_attempts"))?.count || 0;
        const totalCompleted = (await queryOne("SELECT COUNT(*) as count FROM test_attempts WHERE accuracy >= 60 AND is_cancelled = 0"))?.count || 0;
        const totalViolations = (await queryOne("SELECT COUNT(*) as count FROM exam_violations"))?.count || 0;
        const totalBadges = (await queryOne("SELECT COUNT(*) as count FROM badges"))?.count || 0;

        const recentViolations = await queryAll(
            `SELECT v.id, v.violation_type, v.details, v.occurred_at, u.name as student_name, u.email as student_email
             FROM exam_violations v
             JOIN users u ON v.user_id = u.id
             ORDER BY v.occurred_at DESC
             LIMIT 10`
        );

        const settings = await queryAll("SELECT * FROM system_settings");

        return res.json({
            success: true,
            overview: {
                totalUsers: Number(totalUsers),
                totalAttempts: Number(totalAttempts),
                totalPassed: Number(totalCompleted),
                passRate: totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : 0,
                totalViolations: Number(totalViolations),
                totalBadgesAwarded: Number(totalBadges)
            },
            recentViolations,
            settings
        });
    } catch (error) {
        console.error("Admin overview error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch admin overview" });
    }
});

// =========================================================================
// 2. SETTINGS MANAGEMENT
// =========================================================================
router.get("/settings", async (req, res) => {
    try {
        const settings = await queryAll("SELECT * FROM system_settings");
        return res.json({ success: true, settings });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
});

router.put("/settings/:key", async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (value === undefined) {
            return res.status(400).json({ success: false, message: "Value is required" });
        }

        await execute(
            "UPDATE system_settings SET value = ?, description = COALESCE(?, description) WHERE key = ?",
            [String(value), description || null, key]
        );

        return res.json({ success: true, message: `Setting '${key}' updated successfully to '${value}'` });
    } catch (error) {
        console.error("Update setting error:", error);
        return res.status(500).json({ success: false, message: "Failed to update setting" });
    }
});

// =========================================================================
// 3. TASK & VIDEO URL MANAGEMENT
// =========================================================================
router.get("/tasks", async (req, res) => {
    try {
        const { courseId, difficultyId } = req.query;
        let sql = `
            SELECT t.*, c.name as course_name, d.name as level_name
            FROM tasks t
            JOIN courses c ON t.course_id = c.id
            JOIN difficulty_levels d ON t.difficulty_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (courseId) {
            sql += " AND t.course_id = ?";
            params.push(Number(courseId));
        }

        if (difficultyId) {
            sql += " AND t.difficulty_id = ?";
            params.push(Number(difficultyId));
        }

        sql += " ORDER BY t.course_id ASC, t.difficulty_id ASC, t.task_number ASC";

        const tasks = await queryAll(sql, params);

        return res.json({ success: true, tasks });
    } catch (error) {
        console.error("Admin tasks error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
    }
});

router.put("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, topic, video_url, marks, passing_score, instructions, description } = req.body;

        const task = await queryOne("SELECT * FROM tasks WHERE id = ?", [Number(id)]);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        await execute(
            `UPDATE tasks
             SET title = COALESCE(?, title),
                 topic = COALESCE(?, topic),
                 video_url = ?,
                 marks = COALESCE(?, marks),
                 passing_score = COALESCE(?, passing_score),
                 instructions = COALESCE(?, instructions),
                 description = COALESCE(?, description)
             WHERE id = ?`,
            [
                title || null,
                topic || null,
                video_url !== undefined ? video_url : task.video_url,
                marks !== undefined ? Number(marks) : null,
                passing_score !== undefined ? Number(passing_score) : null,
                instructions || null,
                description || null,
                Number(id)
            ]
        );

        return res.json({ success: true, message: `Task #${id} updated successfully` });
    } catch (error) {
        console.error("Admin task update error:", error);
        return res.status(500).json({ success: false, message: "Failed to update task" });
    }
});

export default router;
