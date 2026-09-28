import express from "express";
import { queryAll, queryOne, execute } from "../database/database.js";

const router = express.Router();

// POST /api/tests/submit - Submit simulation attempt and evaluate
router.post("/submit", async (req, res) => {
    try {
        const { userId = 1, courseId, difficultyId = 1, answers = [] } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const course = await queryOne("SELECT * FROM courses WHERE id = ?", [courseId]);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Fetch official questions for the attempted test
        let questions;
        if (answers.length > 0) {
            const questionIds = answers.map((a) => a.questionId);
            const placeholders = questionIds.map(() => "?").join(",");
            questions = await queryAll(
                `SELECT id, question, correct_answer, explanation, marks FROM questions WHERE id IN (${placeholders})`,
                questionIds
            );
        } else {
            questions = await queryAll(
                "SELECT id, question, correct_answer, explanation, marks FROM questions WHERE course_id = ? AND difficulty_id = ? ORDER BY id ASC",
                [courseId, Number(difficultyId) || 1]
            );
        }

        let totalMarks = 0;
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        const evaluationDetails = [];

        for (const q of questions) {
            const qMarks = q.marks || 1;
            totalMarks += qMarks;
            const submitted = answers.find((a) => a.questionId === q.id);
            const selectedAnswer = submitted ? submitted.selectedAnswer : null;
            const isCorrect = selectedAnswer && selectedAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

            if (isCorrect) {
                score += qMarks;
                correctCount += 1;
            } else {
                wrongCount += 1;
            }

            evaluationDetails.push({
                questionId: q.id,
                question: q.question,
                selectedAnswer,
                correctAnswer: q.correct_answer,
                isCorrect: Boolean(isCorrect),
                explanation: q.explanation
            });
        }

        const accuracy = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
        const percentageScore = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

        // Insert into test_attempts
        const attemptInsert = await execute(
            `INSERT INTO test_attempts
            (user_id, course_id, difficulty_id, score, total_marks, correct_answers, wrong_answers, accuracy, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            RETURNING id`,
            [userId, courseId, Number(difficultyId) || 1, percentageScore, totalMarks || 100, correctCount, wrongCount, accuracy]
        );

        let attemptId = attemptInsert.rows?.[0]?.id;
        if (!attemptId) {
            const last = await queryOne("SELECT last_insert_rowid() as id");
            attemptId = last ? last.id : 1;
        }

        // Insert into attempt_answers
        for (const item of evaluationDetails) {
            await execute(
                `INSERT INTO attempt_answers
                (attempt_id, question_id, selected_answer, correct, marks_awarded)
                VALUES (?, ?, ?, ?, ?)`,
                [attemptId, item.questionId, item.selectedAnswer || "", item.isCorrect ? 1 : 0, item.isCorrect ? 1 : 0]
            );
        }

        // Derive Strengths and Areas of Improvement
        const strengths = percentageScore >= 70
            ? ["Structured technical reasoning across multi-step scenarios", "Attention to system context and assumptions", "Logical decision making"]
            : ["Engagement with scenario", "Willingness to explore unfamiliar domains"];

        const areasToImprove = percentageScore >= 70
            ? ["Refining deep domain heuristics", "Practicing edge-case handling in distributed environments"]
            : ["Deepening core fundamentals", "Validating system assumptions before acting", "Reviewing domain terminology"];

        const recommendedSkills = [
            "Analytical Thinking",
            "Technical Problem Solving",
            "Industry Best Practices",
            `${course.name} Core Tooling`
        ];

        // Insert into career_fit_results
        await execute(
            `INSERT INTO career_fit_results
            (user_id, attempt_id, career_name, fit_percentage, strengths, areas_to_improve, recommended_skills)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                attemptId,
                course.name,
                percentageScore,
                JSON.stringify(strengths),
                JSON.stringify(areasToImprove),
                JSON.stringify(recommendedSkills)
            ]
        );

        return res.json({
            success: true,
            attemptId,
            courseName: course.name,
            score: percentageScore,
            totalMarks,
            correctCount,
            wrongCount,
            accuracy,
            strengths,
            areasToImprove,
            recommendedSkills,
            evaluations: evaluationDetails
        });

    } catch (error) {
        console.error("Submit test error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit simulation"
        });
    }
});

// GET /api/tests/user/:userId - Past simulation attempts for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const attempts = await queryAll(
            `SELECT t.id, t.score, t.total_marks, t.correct_answers, t.wrong_answers,
                    t.accuracy, t.completed_at, c.name as career_name, c.category, c.icon
             FROM test_attempts t
             JOIN courses c ON t.course_id = c.id
             WHERE t.user_id = ?
             ORDER BY t.completed_at DESC`,
            [Number(userId)]
        );

        return res.json({
            success: true,
            attempts
        });
    } catch (error) {
        console.error("GET user attempts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user attempts"
        });
    }
});

// GET /api/tests/stats/:userId - User dashboard stats
router.get("/stats/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = Number(userId);

        const totalAttempts = (await queryOne(
            "SELECT COUNT(*) as count FROM test_attempts WHERE user_id = ?",
            [uid]
        ))?.count || 0;

        const distinctCareers = (await queryOne(
            "SELECT COUNT(DISTINCT course_id) as count FROM test_attempts WHERE user_id = ?",
            [uid]
        ))?.count || 0;

        const avgScore = (await queryOne(
            "SELECT ROUND(AVG(score), 1) as avg FROM test_attempts WHERE user_id = ?",
            [uid]
        ))?.avg || 0;

        return res.json({
            success: true,
            stats: {
                simulationsCompleted: Number(totalAttempts),
                careersExplored: Number(distinctCareers),
                averageScore: Number(avgScore) || 0,
                skillsPracticed: Number(distinctCareers) * 3
            }
        });
    } catch (error) {
        console.error("GET user stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats"
        });
    }
});

export default router;
