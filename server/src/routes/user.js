import express from "express";
import { queryAll, queryOne } from "../database/database.js";
import { optionalAuth, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/user/progress - Full progress, level statuses, badges, and real history
router.get("/progress", optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id ? Number(req.user.id) : null;

        if (!userId) {
            // Guest summary with default Beginner unlocked
            const courses = await queryAll("SELECT id, name, category, icon, requires_coding FROM courses WHERE id <= 4 ORDER BY id ASC");
            return res.json({
                success: true,
                isGuest: true,
                user: null,
                stats: {
                    simulationsCompleted: 0,
                    averageScore: 0,
                    careersExplored: 0,
                    badgesEarned: 0
                },
                courses: courses.map(c => ({
                    id: c.id,
                    name: c.name,
                    category: c.category,
                    icon: c.icon,
                    requiresCoding: Boolean(c.requires_coding),
                    currentLevel: 1,
                    completedTasks: 0,
                    totalTasks: 10,
                    progressPercent: 0,
                    bestScore: 0,
                    isUnlocked: true,
                    levels: [
                        { id: 1, name: "Beginner", isUnlocked: true, isCompleted: false, completedTasks: 0, totalTasks: 10 },
                        { id: 2, name: "Intermediate", isUnlocked: false, isCompleted: false, completedTasks: 0, totalTasks: 16 },
                        { id: 3, name: "Hard", isUnlocked: false, isCompleted: false, completedTasks: 0, totalTasks: 20 },
                        { id: 4, name: "Expert", isUnlocked: false, isCompleted: false, completedTasks: 0, totalTasks: 26 }
                    ]
                })),
                badges: [],
                recentAttempts: []
            });
        }

        const user = await queryOne("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [userId]);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch courses
        const courses = await queryAll("SELECT id, name, category, icon, requires_coding FROM courses WHERE id <= 4 ORDER BY id ASC");

        const courseProgressList = [];

        for (const course of courses) {
            const levelRows = await queryAll(
                "SELECT * FROM student_progress WHERE user_id = ? AND course_id = ? ORDER BY difficulty_id ASC",
                [userId, course.id]
            );

            const levelMap = new Map();
            levelRows.forEach(r => levelMap.set(r.difficulty_id, r));

            const levels = [
                { id: 1, name: "Beginner", totalTasks: 10 },
                { id: 2, name: "Intermediate", totalTasks: 16 },
                { id: 3, name: "Hard", totalTasks: 20 },
                { id: 4, name: "Expert", totalTasks: 26 }
            ].map(lvl => {
                const p = levelMap.get(lvl.id);
                return {
                    id: lvl.id,
                    name: lvl.name,
                    isUnlocked: lvl.id === 1 ? true : Boolean(p?.is_unlocked),
                    isCompleted: Boolean(p?.is_completed),
                    completedTasks: p?.completed_tasks || 0,
                    totalTasks: lvl.totalTasks,
                    bestScore: p?.best_score || 0
                };
            });

            // Find current active level
            let activeLevel = 1;
            for (let i = levels.length - 1; i >= 0; i--) {
                if (levels[i].isUnlocked) {
                    activeLevel = levels[i].id;
                    break;
                }
            }

            const currentLvlConfig = levels.find(l => l.id === activeLevel) || levels[0];
            const progressPercent = Math.round((currentLvlConfig.completedTasks / currentLvlConfig.totalTasks) * 100);

            // Fetch course badge if any
            const courseBadges = await queryAll(
                "SELECT * FROM badges WHERE user_id = ? AND course_id = ? ORDER BY difficulty_id ASC",
                [userId, course.id]
            );

            courseProgressList.push({
                id: course.id,
                name: course.name,
                category: course.category,
                icon: course.icon,
                requiresCoding: Boolean(course.requires_coding),
                currentLevel: activeLevel,
                currentLevelName: currentLvlConfig.name,
                completedTasks: currentLvlConfig.completedTasks,
                totalTasks: currentLvlConfig.totalTasks,
                progressPercent,
                bestScore: currentLvlConfig.bestScore,
                isUnlocked: true,
                levels,
                badges: courseBadges
            });
        }

        // All earned badges
        const allBadges = await queryAll(
            `SELECT b.id, b.badge_name, b.level_name, b.score, b.earned_at, c.name as course_name, c.icon as course_icon
             FROM badges b
             JOIN courses c ON b.course_id = c.id
             WHERE b.user_id = ?
             ORDER BY b.earned_at DESC`,
            [userId]
        );

        // Real assessment history from DB (never fake / demo data)
        const recentAttempts = await queryAll(
            `SELECT t.id, t.course_id, t.difficulty_id, t.task_number, t.score, t.total_marks,
                    t.accuracy, t.completed_at, t.is_cancelled, t.cancellation_reason,
                    c.name as career_name, c.icon as course_icon, d.name as level_name
             FROM test_attempts t
             JOIN courses c ON t.course_id = c.id
             JOIN difficulty_levels d ON t.difficulty_id = d.id
             WHERE t.user_id = ?
             ORDER BY t.started_at DESC
             LIMIT 15`,
            [userId]
        );

        const totalAttempts = (await queryOne(
            "SELECT COUNT(*) as count FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [userId]
        ))?.count || 0;

        const distinctCareers = (await queryOne(
            "SELECT COUNT(DISTINCT course_id) as count FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [userId]
        ))?.count || 0;

        const avgScore = (await queryOne(
            "SELECT ROUND(AVG(score), 1) as avg FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [userId]
        ))?.avg || 0;

        return res.json({
            success: true,
            isGuest: false,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            stats: {
                simulationsCompleted: Number(totalAttempts),
                averageScore: Number(avgScore) || 0,
                careersExplored: Number(distinctCareers),
                badgesEarned: allBadges.length
            },
            courses: courseProgressList,
            badges: allBadges,
            recentAttempts
        });

    } catch (error) {
        console.error("GET user progress error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch student progress." });
    }
});

// GET /api/user/badges - Dedicated endpoint for student badges
router.get("/badges", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const badges = await queryAll(
            `SELECT b.id, b.badge_name, b.level_name, b.score, b.earned_at, c.name as course_name, c.icon
             FROM badges b
             JOIN courses c ON b.course_id = c.id
             WHERE b.user_id = ?
             ORDER BY b.earned_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            badges
        });
    } catch (error) {
        console.error("GET badges error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch badges" });
    }
});

export default router;
