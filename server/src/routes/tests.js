import express from "express";
import jwt from "jsonwebtoken";
import { queryAll, queryOne, execute } from "../database/database.js";

const router = express.Router();

function getJwtSecret() {
    return process.env.JWT_SECRET?.trim() || "pathpilot-development-secret-change-this";
}

function resolveUserId(req, bodyUserId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, getJwtSecret());
            if (decoded && decoded.id) {
                return Number(decoded.id);
            }
        } catch (_) {}
    }

    if (bodyUserId) {
        const idNum = Number(bodyUserId);
        if (Number.isInteger(idNum) && idNum > 0) {
            return idNum;
        }
    }

    return null;
}

// =========================================================================
// 1. POST /api/tests/start - Start a formal task attempt with randomization
// =========================================================================
router.post("/start", async (req, res) => {
    try {
        const { courseId, difficultyId = 1, taskNumber = 1, cameraVerified = false } = req.body;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const cid = Number(courseId);
        const did = Number(difficultyId);
        const tnum = Number(taskNumber);
        const validUserId = resolveUserId(req, req.body.userId);

        const course = await queryOne("SELECT * FROM courses WHERE id = ?", [cid]);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Fetch task details
        let task = await queryOne(
            "SELECT * FROM tasks WHERE course_id = ? AND difficulty_id = ? AND task_number = ?",
            [cid, did, tnum]
        );

        if (!task) {
            // Fallback task if not yet in database
            task = {
                course_id: cid,
                difficulty_id: did,
                task_number: tnum,
                title: `${course.name} Level ${did} Task ${tnum}`,
                topic: "Practical Assessment",
                task_type: "conceptual",
                description: `Complete task ${tnum} in ${course.name}.`,
                instructions: "Analyze the scenario and provide the correct solution.",
                marks: 10,
                passing_score: 60
            };
        }

        // Progression validation: check if level is unlocked
        if (did > 1 && validUserId) {
            const progress = await queryOne(
                "SELECT is_unlocked, completed_tasks FROM student_progress WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                [validUserId, cid, did]
            );

            if (!progress || !progress.is_unlocked) {
                return res.status(403).json({
                    success: false,
                    isLocked: true,
                    message: `Level ${did} is locked. You must complete the previous level tasks first.`
                });
            }

            // Sequential task constraint
            if (tnum > (progress.completed_tasks || 0) + 1) {
                return res.status(403).json({
                    success: false,
                    isLocked: true,
                    message: `Task ${tnum} is locked. Please complete Task ${(progress.completed_tasks || 0) + 1} first.`
                });
            }
        }

        // Hard & Expert Exam Monitoring: Camera Permission Requirement
        if ((did === 3 || did === 4) && !cameraVerified) {
            return res.status(400).json({
                success: false,
                requiresCamera: true,
                message: "Camera permission and preview verification is mandatory before starting Hard and Expert assessments."
            });
        }

        // Fetch questions for this task
        let questions = await queryAll(
            "SELECT id, question, option_a, option_b, option_c, option_d, marks, question_type, code_language, starter_code, test_cases, topic FROM questions WHERE course_id = ? AND difficulty_id = ? AND task_number = ?",
            [cid, did, tnum]
        );

        if (questions.length === 0) {
            // Fallback to general course & level questions
            questions = await queryAll(
                "SELECT id, question, option_a, option_b, option_c, option_d, marks, question_type, code_language, starter_code, test_cases, topic FROM questions WHERE course_id = ? AND difficulty_id = ? LIMIT 3",
                [cid, did]
            );
        }

        // Randomize questions for this attempt (Fisher-Yates shuffle)
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        const assignedQuestionIds = questions.map((q) => q.id);

        let attemptId = null;
        if (validUserId) {
            const result = await execute(
                `INSERT INTO test_attempts
                 (user_id, course_id, difficulty_id, task_number, score, total_marks, is_cancelled, violation_count, camera_verified, assigned_questions, started_at)
                 VALUES (?, ?, ?, ?, 0, ?, 0, 0, ?, ?, CURRENT_TIMESTAMP)
                 RETURNING id`,
                [validUserId, cid, did, tnum, task.marks || 10, cameraVerified ? 1 : 0, JSON.stringify(assignedQuestionIds)]
            );

            attemptId = result.rows?.[0]?.id;
            if (!attemptId) {
                const last = await queryOne("SELECT last_insert_rowid() as id");
                attemptId = last ? last.id : null;
            }
        }

        // Return task and sanitized questions (WITHOUT correct_answer or explanation)
        return res.json({
            success: true,
            attemptId,
            courseId: cid,
            courseName: course.name,
            difficultyId: did,
            taskNumber: tnum,
            task: {
                ...task,
                test_cases: typeof task.test_cases === "string" ? JSON.parse(task.test_cases || "[]") : (task.test_cases || [])
            },
            questions: questions.map((q) => ({
                id: q.id,
                question: q.question,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                marks: q.marks,
                topic: q.topic,
                question_type: q.question_type,
                code_language: q.code_language,
                starter_code: q.starter_code,
                test_cases: typeof q.test_cases === "string" ? JSON.parse(q.test_cases || "[]") : (q.test_cases || [])
            }))
        });

    } catch (error) {
        console.error("Test start error:", error);
        return res.status(500).json({ success: false, message: "Failed to initialize assessment attempt." });
    }
});

// =========================================================================
// 2. POST /api/tests/submit - Submit answers & evaluate authoritative results
// =========================================================================
router.post("/submit", async (req, res) => {
    try {
        const {
            attemptId,
            courseId,
            difficultyId = 1,
            taskNumber = 1,
            answers = [],
            codeSolution = null,
            testExecutionResults = null
        } = req.body;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const cid = Number(courseId);
        const did = Number(difficultyId);
        const tnum = Number(taskNumber);
        const validUserId = resolveUserId(req, req.body.userId);

        const course = await queryOne("SELECT * FROM courses WHERE id = ?", [cid]);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Fetch task configuration
        const task = await queryOne(
            "SELECT * FROM tasks WHERE course_id = ? AND difficulty_id = ? AND task_number = ?",
            [cid, did, tnum]
        );

        // Check if existing attempt was cancelled due to security violations
        if (attemptId) {
            const attempt = await queryOne("SELECT * FROM test_attempts WHERE id = ?", [Number(attemptId)]);
            if (attempt && attempt.is_cancelled) {
                return res.status(403).json({
                    success: false,
                    isCancelled: true,
                    cancellationReason: attempt.cancellation_reason || "Assessment cancelled due to exam policy violations.",
                    score: 0,
                    message: "Assessment attempt was cancelled. Zero marks recorded."
                });
            }
        }

        // Fetch questions to evaluate
        let questions = [];
        if (answers.length > 0) {
            const qIds = answers.map((a) => a.questionId).filter(Boolean);
            if (qIds.length > 0) {
                const placeholders = qIds.map(() => "?").join(",");
                questions = await queryAll(
                    `SELECT id, question, correct_answer, explanation, marks, topic, question_type FROM questions WHERE id IN (${placeholders})`,
                    qIds
                );
            }
        }

        if (questions.length === 0) {
            questions = await queryAll(
                "SELECT id, question, correct_answer, explanation, marks, topic, question_type FROM questions WHERE course_id = ? AND difficulty_id = ? AND task_number = ?",
                [cid, did, tnum]
            );
        }

        if (questions.length === 0) {
            questions = await queryAll(
                "SELECT id, question, correct_answer, explanation, marks, topic, question_type FROM questions WHERE course_id = ? AND difficulty_id = ? LIMIT 1",
                [cid, did]
            );
        }

        let totalMarks = 0;
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        const evaluationDetails = [];

        // Evaluate MCQ / Scenario Questions
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
                topic: q.topic || "General",
                question: q.question,
                selectedAnswer,
                correctAnswer: q.correct_answer,
                isCorrect: Boolean(isCorrect),
                marksAwarded: isCorrect ? qMarks : 0,
                explanation: q.explanation
            });
        }

        // Evaluate Coding Challenge (if applicable)
        let codingResult = null;
        if (task && (task.task_type === "coding" || task.task_type === "code")) {
            const codeMarks = task.marks || 20;
            totalMarks += codeMarks;

            let passedAll = false;
            let passedCases = 0;
            let totalCases = 1;

            if (testExecutionResults) {
                passedAll = Boolean(testExecutionResults.allPassed);
                passedCases = testExecutionResults.results?.filter((r) => r.passed).length || 0;
                totalCases = testExecutionResults.results?.length || 1;
            }

            const codeScoreAwarded = Math.round((passedCases / totalCases) * codeMarks);
            score += codeScoreAwarded;
            if (passedAll) correctCount += 1;
            else wrongCount += 1;

            codingResult = {
                taskTitle: task.title,
                allPassed: passedAll,
                passedCases,
                totalCases,
                marksAwarded: codeScoreAwarded,
                maxMarks: codeMarks
            };
        }

        const percentageScore = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
        const passingScore = task?.passing_score || 60;
        const isPassed = percentageScore >= passingScore;

        let finalAttemptId = attemptId ? Number(attemptId) : null;

        // Persist attempt evaluation
        if (validUserId) {
            if (finalAttemptId) {
                await execute(
                    `UPDATE test_attempts
                     SET score = ?, total_marks = ?, correct_answers = ?, wrong_answers = ?, accuracy = ?, completed_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [percentageScore, totalMarks, correctCount, wrongCount, percentageScore, finalAttemptId]
                );
            } else {
                const insertRes = await execute(
                    `INSERT INTO test_attempts
                     (user_id, course_id, difficulty_id, task_number, score, total_marks, correct_answers, wrong_answers, accuracy, completed_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                     RETURNING id`,
                    [validUserId, cid, did, tnum, percentageScore, totalMarks, correctCount, wrongCount, percentageScore]
                );
                finalAttemptId = insertRes.rows?.[0]?.id;
                if (!finalAttemptId) {
                    const last = await queryOne("SELECT last_insert_rowid() as id");
                    finalAttemptId = last ? last.id : null;
                }
            }

            // Save individual answer records
            if (finalAttemptId) {
                for (const item of evaluationDetails) {
                    await execute(
                        `INSERT INTO attempt_answers
                         (attempt_id, question_id, task_number, selected_answer, correct, marks_awarded)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [finalAttemptId, item.questionId, tnum, item.selectedAnswer || "", item.isCorrect ? 1 : 0, item.marksAwarded]
                    );
                }
            }

            // =====================================================================
            // PROGRESSION, LEVEL UNLOCKING & BADGE AWARDING
            // =====================================================================
            let nextLevelUnlocked = false;
            let badgeAwarded = null;

            if (isPassed) {
                // 1. Fetch current progress
                let progress = await queryOne(
                    "SELECT * FROM student_progress WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                    [validUserId, cid, did]
                );

                const totalTasksForLevel = did === 1 ? 10 : did === 2 ? 16 : did === 3 ? 20 : 26;

                if (!progress) {
                    await execute(
                        `INSERT INTO student_progress
                         (user_id, course_id, difficulty_id, completed_tasks, total_tasks, is_unlocked, is_completed, best_score)
                         VALUES (?, ?, ?, 1, ?, 1, 0, ?)`,
                        [validUserId, cid, did, totalTasksForLevel, percentageScore]
                    );
                    progress = { completed_tasks: 1, total_tasks: totalTasksForLevel, is_completed: 0, best_score: percentageScore };
                } else {
                    const updatedCompleted = Math.max(progress.completed_tasks || 0, tnum);
                    const isLevelDone = updatedCompleted >= totalTasksForLevel ? 1 : 0;
                    const newBest = Math.max(progress.best_score || 0, percentageScore);

                    await execute(
                        `UPDATE student_progress
                         SET completed_tasks = ?, is_completed = ?, best_score = ?, updated_at = CURRENT_TIMESTAMP
                         WHERE user_id = ? AND course_id = ? AND difficulty_id = ?`,
                        [updatedCompleted, isLevelDone, newBest, validUserId, cid, did]
                    );
                    progress.completed_tasks = updatedCompleted;
                    progress.is_completed = isLevelDone;
                }

                // If entire level completed, unlock the next level and award permanent badge!
                if (progress.completed_tasks >= totalTasksForLevel) {
                    nextLevelUnlocked = true;
                    const nextDifficultyId = did + 1;

                    if (nextDifficultyId <= 4) {
                        const nextLevelTotalTasks = nextDifficultyId === 2 ? 16 : nextDifficultyId === 3 ? 20 : 26;
                        const existingNext = await queryOne(
                            "SELECT * FROM student_progress WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                            [validUserId, cid, nextDifficultyId]
                        );

                        if (!existingNext) {
                            await execute(
                                `INSERT INTO student_progress
                                 (user_id, course_id, difficulty_id, completed_tasks, total_tasks, is_unlocked, is_completed, best_score)
                                 VALUES (?, ?, ?, 0, ?, 1, 0, 0)`,
                                [validUserId, cid, nextDifficultyId, nextLevelTotalTasks]
                            );
                        } else {
                            await execute(
                                `UPDATE student_progress SET is_unlocked = 1 WHERE user_id = ? AND course_id = ? AND difficulty_id = ?`,
                                [validUserId, cid, nextDifficultyId]
                            );
                        }
                    }

                    // Award level-specific badges
                    let badgeName = null;
                    let levelTitle = null;

                    if (did === 2) {
                        badgeName = "PathPilot Skill Builder";
                        levelTitle = "Intermediate";
                    } else if (did === 3) {
                        badgeName = "PathPilot Problem Solver";
                        levelTitle = "Hard";
                    } else if (did === 4) {
                        badgeName = "PathPilot Expert Achiever";
                        levelTitle = "Expert";
                    }

                    if (badgeName) {
                        const existingBadge = await queryOne(
                            "SELECT * FROM badges WHERE user_id = ? AND course_id = ? AND difficulty_id = ?",
                            [validUserId, cid, did]
                        );

                        if (!existingBadge) {
                            await execute(
                                `INSERT INTO badges (user_id, course_id, difficulty_id, badge_name, level_name, score)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [validUserId, cid, did, badgeName, levelTitle, percentageScore]
                            );
                        }

                        badgeAwarded = {
                            badgeName,
                            levelName: levelTitle,
                            score: percentageScore,
                            courseName: course.name,
                            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        };
                    }
                }
            }

            // Save Career Fit Results with mandatory disclaimer
            const strengths = percentageScore >= 70
                ? ["Analytical reasoning under constraints", "System boundary verification", "Structured problem resolution"]
                : ["Willingness to explore technical challenges", "Foundational domain interest"];

            const areasToImprove = percentageScore >= 70
                ? ["Practicing edge cases and boundary limits", "Optimizing execution performance"]
                : ["Reinforcing core syntax and basic concepts", "Reviewing technical terminology before assessment"];

            const recommendedSkills = [
                `${course.name} Foundations`,
                "Practical Problem Solving",
                "Systems Debugging",
                "Algorithmic Thinking"
            ];

            if (finalAttemptId) {
                await execute(
                    `INSERT INTO career_fit_results
                     (user_id, attempt_id, career_name, fit_percentage, strengths, areas_to_improve, recommended_skills)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        validUserId,
                        finalAttemptId,
                        course.name,
                        percentageScore,
                        JSON.stringify(strengths),
                        JSON.stringify(areasToImprove),
                        JSON.stringify(recommendedSkills)
                    ]
                );
            }

            return res.json({
                success: true,
                isGuest: false,
                userId: validUserId,
                attemptId: finalAttemptId,
                courseName: course.name,
                difficultyId: did,
                taskNumber: tnum,
                score: percentageScore,
                totalMarks,
                correctCount,
                wrongCount,
                accuracy: percentageScore,
                isPassed,
                passingScore,
                badgeAwarded,
                nextLevelUnlocked,
                codingResult,
                evaluations: evaluationDetails,
                strengths,
                areasToImprove,
                disclaimer: "Demo Career-Fit Insight — Not a professional assessment",
                message: isPassed
                    ? `🎉 Task ${tnum} Passed successfully with ${percentageScore}%!`
                    : `Score: ${percentageScore}%. Passing requirement is ${passingScore}%. You can review the explanation and try again.`
            });
        }

        // Guest / Unauthenticated flow
        return res.json({
            success: true,
            isGuest: true,
            score: percentageScore,
            totalMarks,
            correctCount,
            wrongCount,
            accuracy: percentageScore,
            isPassed,
            passingScore,
            codingResult,
            evaluations: evaluationDetails,
            disclaimer: "Demo Career-Fit Insight — Not a professional assessment",
            message: "Assessment evaluation complete. Sign in to permanently track level progress and earn completion badges."
        });

    } catch (error) {
        console.error("Submit test error:", error);
        return res.status(500).json({ success: false, message: "Failed to evaluate assessment submission." });
    }
});

// =========================================================================
// 3. POST /api/tests/violation - Record exam monitoring violations (Hard/Expert)
// =========================================================================
router.post("/violation", async (req, res) => {
    try {
        const { attemptId, violationType, details } = req.body;

        if (!attemptId) {
            return res.status(400).json({ success: false, message: "Attempt ID required" });
        }

        const attempt = await queryOne("SELECT * FROM test_attempts WHERE id = ?", [Number(attemptId)]);
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found" });
        }

        if (attempt.is_cancelled) {
            return res.json({
                success: true,
                isCancelled: true,
                violationCount: attempt.violation_count,
                cancellationReason: attempt.cancellation_reason
            });
        }

        // Insert violation event
        await execute(
            "INSERT INTO exam_violations (attempt_id, user_id, violation_type, details) VALUES (?, ?, ?, ?)",
            [attempt.id, attempt.user_id, violationType || "tab_switch", details || "Security event detected"]
        );

        // Fetch max violations allowed from settings (default 3)
        const setting = await queryOne("SELECT value FROM system_settings WHERE key = 'max_violations_allowed'");
        const maxAllowed = setting ? parseInt(setting.value, 10) : 3;

        const newCount = (attempt.violation_count || 0) + 1;

        if (newCount >= maxAllowed) {
            // Auto-cancel assessment attempt with zero marks
            const cancelReason = `Exceeded maximum permitted exam violations (${maxAllowed}). Detected: ${violationType}`;
            await execute(
                `UPDATE test_attempts 
                 SET is_cancelled = 1, cancellation_reason = ?, violation_count = ?, score = 0, accuracy = 0, completed_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [cancelReason, newCount, attempt.id]
            );

            return res.json({
                success: true,
                isCancelled: true,
                violationCount: newCount,
                maxAllowed,
                cancellationReason: cancelReason,
                message: "Exam cancelled due to security policy violations. Zero marks awarded."
            });
        } else {
            await execute(
                "UPDATE test_attempts SET violation_count = ? WHERE id = ?",
                [newCount, attempt.id]
            );

            return res.json({
                success: true,
                isCancelled: false,
                violationCount: newCount,
                maxAllowed,
                remainingViolations: maxAllowed - newCount,
                warning: `Security warning ${newCount}/${maxAllowed}: ${violationType} detected. Leaving the assessment window is monitored.`
            });
        }
    } catch (error) {
        console.error("Record violation error:", error);
        return res.status(500).json({ success: false, message: "Failed to record violation" });
    }
});

// =========================================================================
// 4. POST /api/tests/cancel - Explicitly cancel attempt
// =========================================================================
router.post("/cancel", async (req, res) => {
    try {
        const { attemptId, reason } = req.body;
        if (!attemptId) return res.status(400).json({ success: false, message: "Attempt ID required" });

        const cancelReason = reason || "Assessment cancelled by student or hardware verification failure";
        await execute(
            `UPDATE test_attempts 
             SET is_cancelled = 1, cancellation_reason = ?, score = 0, accuracy = 0, completed_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [cancelReason, Number(attemptId)]
        );

        return res.json({
            success: true,
            isCancelled: true,
            cancellationReason: cancelReason
        });
    } catch (error) {
        console.error("Cancel attempt error:", error);
        return res.status(500).json({ success: false, message: "Failed to cancel attempt" });
    }
});

// =========================================================================
// 5. GET /api/tests/review/:attemptId - Detailed review of an attempt
// =========================================================================
router.get("/review/:attemptId", async (req, res) => {
    try {
        const { attemptId } = req.params;
        const attempt = await queryOne(
            `SELECT t.*, c.name as course_name, d.name as level_name
             FROM test_attempts t
             JOIN courses c ON t.course_id = c.id
             JOIN difficulty_levels d ON t.difficulty_id = d.id
             WHERE t.id = ?`,
            [Number(attemptId)]
        );

        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

        const answers = await queryAll(
            `SELECT a.*, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.topic
             FROM attempt_answers a
             JOIN questions q ON a.question_id = q.id
             WHERE a.attempt_id = ?`,
            [Number(attemptId)]
        );

        const violations = await queryAll(
            "SELECT * FROM exam_violations WHERE attempt_id = ? ORDER BY occurred_at ASC",
            [Number(attemptId)]
        );

        return res.json({
            success: true,
            attempt,
            answers,
            violations
        });
    } catch (error) {
        console.error("GET review error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch review" });
    }
});

// =========================================================================
// 6. GET /api/tests/user/:userId - Past simulation attempts for a user
// =========================================================================
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const attempts = await queryAll(
            `SELECT t.id, t.score, t.total_marks, t.correct_answers, t.wrong_answers,
                    t.accuracy, t.completed_at, t.is_cancelled, t.cancellation_reason,
                    c.name as career_name, c.category, c.icon, d.name as level_name
             FROM test_attempts t
             JOIN courses c ON t.course_id = c.id
             JOIN difficulty_levels d ON t.difficulty_id = d.id
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

// =========================================================================
// 7. GET /api/tests/stats/:userId - User dashboard stats
// =========================================================================
router.get("/stats/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = Number(userId);

        const totalAttempts = (await queryOne(
            "SELECT COUNT(*) as count FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [uid]
        ))?.count || 0;

        const distinctCareers = (await queryOne(
            "SELECT COUNT(DISTINCT course_id) as count FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [uid]
        ))?.count || 0;

        const avgScore = (await queryOne(
            "SELECT ROUND(AVG(score), 1) as avg FROM test_attempts WHERE user_id = ? AND is_cancelled = 0",
            [uid]
        ))?.avg || 0;

        const badgesCount = (await queryOne(
            "SELECT COUNT(*) as count FROM badges WHERE user_id = ?",
            [uid]
        ))?.count || 0;

        return res.json({
            success: true,
            stats: {
                simulationsCompleted: Number(totalAttempts),
                careersExplored: Number(distinctCareers),
                averageScore: Number(avgScore) || 0,
                badgesEarned: Number(badgesCount)
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
