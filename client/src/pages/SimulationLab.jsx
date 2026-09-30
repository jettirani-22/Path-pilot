import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  CheckCircle2,
  X,
  RotateCcw,
  HelpCircle,
  Lock,
  ShieldAlert,
  Sparkles,
  Terminal,
  Compass,
  Code2,
  Award
} from "lucide-react";
import CameraModal from "../components/CameraModal.jsx";
import ExamSecurityBar from "../components/ExamSecurityBar.jsx";
import TaskStepper from "../components/TaskStepper.jsx";
import LearningVideo from "../components/LearningVideo.jsx";

export default function SimulationLab({ currentUser, showToast, careers, DIFFICULTY_LEVELS }) {
  const { id } = useParams();
  const career = careers.find((item) => item.id === id) || careers[0];
  const courseId = career.courseId || 1;

  // Selected Difficulty (1: Beginner, 2: Intermediate, 3: Hard, 4: Expert)
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [levelInfoList, setLevelInfoList] = useState([]);

  // Progressive Tasks for Selected Level
  const [tasks, setTasks] = useState([]);
  const [currentTaskNumber, setCurrentTaskNumber] = useState(1);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [isLevelUnlocked, setIsLevelUnlocked] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Active Assessment Attempt State
  const [attemptId, setAttemptId] = useState(null);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [newBadge, setNewBadge] = useState(null);

  // Coding Lab State
  const [userCode, setUserCode] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Hard & Expert Exam Monitoring State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [isExamCancelled, setIsExamCancelled] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const token = localStorage.getItem("pathpilot_token");

  // Fetch Level Summary & Unlock Status
  const fetchLevels = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/levels`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        setLevelInfoList(data.levels || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchLevels();
  }, [courseId, token]);

  // Fetch Tasks for the selected difficulty level
  const fetchTasksForLevel = async (diffId) => {
    setIsLoadingTasks(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/tasks/${diffId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        const fetchedTasks = data.tasks || [];
        setTasks(fetchedTasks);
        setCompletedTasksCount(data.completedTasksCount || 0);
        setIsLevelUnlocked(data.isLevelUnlocked);

        // Pick next unfinished task or task 1
        const nextTask = Math.min((data.completedTasksCount || 0) + 1, fetchedTasks.length || 1);
        setCurrentTaskNumber(nextTask);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasksForLevel(selectedDifficulty);
  }, [courseId, selectedDifficulty, token]);

  // Current active task object
  const currentTask = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    return tasks.find((t) => t.task_number === currentTaskNumber) || tasks[0];
  }, [tasks, currentTaskNumber]);

  const isCodingTask = currentTask?.task_type === "coding" || currentTask?.task_type === "code";
  const isReassessment = currentTask?.task_type === "reassessment" || (selectedDifficulty === 2 && currentTaskNumber === 1);
  const activeLevelConfig = (DIFFICULTY_LEVELS && DIFFICULTY_LEVELS[selectedDifficulty - 1]) || { name: "Beginner", desc: "Core concepts" };

  // Start a formal task attempt with randomized questions
  const startTaskAttempt = async (cId, dId, tNum, cameraOk = false) => {
    setSubmitted(false);
    setEvaluation(null);
    setAnswers({});
    setExecutionResult(null);
    setNewBadge(null);
    setIsExamCancelled(false);
    setCancellationReason("");

    try {
      const res = await fetch("/api/tests/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          courseId: cId,
          difficultyId: dId,
          taskNumber: tNum,
          cameraVerified: cameraOk || cameraVerified
        })
      });

      const data = await res.json();
      if (data.success) {
        setAttemptId(data.attemptId);
        setAssignedQuestions(data.questions || []);

        if (data.task?.starter_code) {
          setUserCode(data.task.starter_code);
        } else if (data.questions?.[0]?.starter_code) {
          setUserCode(data.questions[0].starter_code);
        } else {
          setUserCode(`function solution() {\n  // Write your implementation here\n}`);
        }
      } else if (data.requiresCamera) {
        setShowCameraModal(true);
      } else {
        showToast(data.message || "Failed to start assessment");
      }
    } catch (err) {
      console.error("Start attempt error:", err);
    }
  };

  // Launch attempt whenever task or level changes
  useEffect(() => {
    if (selectedDifficulty >= 3 && !cameraVerified) {
      setShowCameraModal(true);
    } else if (tasks.length > 0) {
      startTaskAttempt(courseId, selectedDifficulty, currentTaskNumber, cameraVerified);
    }
  }, [courseId, selectedDifficulty, currentTaskNumber, tasks.length]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // =========================================================================
  // STRICT EXAM MONITORING (Hard & Expert)
  // Detects tab switch, window blur, copy, paste
  // =========================================================================
  const recordViolation = async (violationType, details) => {
    if (!attemptId || isExamCancelled || submitted) return;

    try {
      const res = await fetch("/api/tests/violation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          attemptId,
          violationType,
          details
        })
      });

      const data = await res.json();
      if (data.success) {
        setViolationCount(data.violationCount);
        if (data.isCancelled) {
          setIsExamCancelled(true);
          setCancellationReason(data.cancellationReason || "Exceeded maximum permitted exam violations.");
          if (cameraStream) {
            cameraStream.getTracks().forEach((t) => t.stop());
            setCameraStream(null);
          }
          showToast("Assessment cancelled: Maximum security violations reached.");
        } else {
          showToast(`⚠️ Security Warning (${data.violationCount}/3): ${violationType} detected.`);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (selectedDifficulty < 3 || !attemptId || submitted || isExamCancelled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("tab_switch", "Student navigated away from assessment tab");
      }
    };

    const handleWindowBlur = () => {
      recordViolation("window_blur", "Assessment window lost operating system focus");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation("copy_attempt", "Copying exam questions or code is prohibited");
    };

    const handlePaste = (e) => {
      if (e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")) {
        e.preventDefault();
        recordViolation("paste_attempt", "Pasting external code or text is restricted during exams");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [selectedDifficulty, attemptId, submitted, isExamCancelled]);

  // Handle switching level
  const handleSelectDifficulty = (levelId) => {
    const lvlMeta = levelInfoList.find((l) => l.id === levelId);
    if (levelId > 1 && lvlMeta && !lvlMeta.isUnlocked) {
      showToast(`Level ${levelId} is locked. Complete all previous level tasks first.`);
      return;
    }

    setSelectedDifficulty(levelId);
    setCameraVerified(false);
    setViolationCount(0);
    setIsExamCancelled(false);
    showToast(`Switched to Level ${levelId}: ${DIFFICULTY_LEVELS[levelId - 1].name}`);
  };

  const handleSelectTask = (taskNum) => {
    if (taskNum > completedTasksCount + 1) {
      showToast(`Task ${taskNum} is locked. Complete Task ${completedTasksCount + 1} first.`);
      return;
    }
    setCurrentTaskNumber(taskNum);
  };

  const handleCameraVerified = (stream) => {
    setCameraStream(stream);
    setCameraVerified(true);
    setShowCameraModal(false);
    showToast("Camera verified! Starting proctored assessment.");
    startTaskAttempt(courseId, selectedDifficulty, currentTaskNumber, true);
  };

  // Run Code in Live Sandbox
  const handleRunCode = async () => {
    if (!userCode.trim()) {
      showToast("Please write code before running tests.");
      return;
    }

    setIsRunningCode(true);
    setExecutionResult(null);

    try {
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: currentTask?.code_language || "javascript",
          code: userCode,
          testCases: currentTask?.test_cases || []
        })
      });

      const data = await res.json();
      setExecutionResult(data);

      if (data.allPassed) {
        showToast(`🎉 Perfect! All unit tests passed in ${data.durationMs}ms!`);
      } else if (data.success) {
        showToast("Some unit tests failed. Inspect the console output.");
      } else {
        showToast(`Error: ${data.error || "Execution failed"}`);
      }
    } catch (err) {
      showToast("Code execution request failed: " + err.message);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Authoritative Task Submission
  const handleSubmitTask = async () => {
    if (isExamCancelled) {
      showToast("Assessment attempt was cancelled.");
      return;
    }

    if (isCodingTask && !executionResult) {
      showToast("Please test your code by clicking 'Run Tests' first before submitting.");
      return;
    }

    if (!isCodingTask) {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount === 0 && assignedQuestions.length > 0) {
        showToast("Please select an answer before submitting.");
        return;
      }
    }

    const formattedAnswers = Object.entries(answers).map(([qId, selected]) => ({
      questionId: Number(qId),
      selectedAnswer: selected
    }));

    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          attemptId,
          userId: currentUser?.id || null,
          courseId,
          difficultyId: selectedDifficulty,
          taskNumber: currentTaskNumber,
          answers: formattedAnswers,
          codeSolution: isCodingTask ? userCode : null,
          testExecutionResults: isCodingTask ? executionResult : null
        })
      });

      const data = await res.json();

      if (data.isCancelled) {
        setIsExamCancelled(true);
        setCancellationReason(data.cancellationReason);
        showToast("Assessment cancelled.");
        return;
      }

      setEvaluation(data);
      setSubmitted(true);

      if (data.badgeAwarded) {
        setNewBadge(data.badgeAwarded);
        showToast(`🏆 Badge Awarded: "${data.badgeAwarded.badgeName}"!`);
      }

      if (data.isPassed) {
        const nextCompleted = Math.max(completedTasksCount, currentTaskNumber);
        setCompletedTasksCount(nextCompleted);
        fetchLevels();
        showToast(`🎉 Task ${currentTaskNumber} Passed! (${data.score}%)`);
      } else {
        showToast(`Score: ${data.score}%. Passing threshold is ${data.passingScore || 60}%.`);
      }

      // Save last result in localStorage for PerformanceReport
      localStorage.setItem("pathpilot-last-result", JSON.stringify({
        career: career.title,
        careerId: career.id,
        difficultyLevel: selectedDifficulty,
        difficultyName: activeLevelConfig.name,
        score: data.score,
        correctCount: data.correctCount,
        totalQuestions: data.totalMarks,
        details: data.evaluations || [],
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        badgeAwarded: data.badgeAwarded || null
      }));

    } catch (err) {
      showToast("Submission failed: " + err.message);
    }
  };

  const handleNextTask = () => {
    if (currentTaskNumber < tasks.length) {
      setCurrentTaskNumber(currentTaskNumber + 1);
    } else if (selectedDifficulty < 4) {
      setSelectedDifficulty(selectedDifficulty + 1);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="back-link" to="/simulation">
          ← Back to Simulations
        </Link>
      </div>

      <div style={{ margin: "16px 0 20px" }}>
        <span className="eyebrow">{career.title.toUpperCase()} • CAREER SIMULATION LAB</span>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0" }}>
          {currentTask ? `Task ${currentTaskNumber}: ${currentTask.title}` : `Career Simulation: ${career.title}`}
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
          {currentTask?.description || career.description}
        </p>
      </div>

      {/* 1. 4-LEVEL DIFFICULTY SELECTOR */}
      <div className="difficulty-pill-bar">
        <span className="difficulty-label">Difficulty Level:</span>
        {DIFFICULTY_LEVELS.map((lvl) => {
          const lvlMeta = levelInfoList.find((l) => l.id === lvl.id);
          const isUnlocked = lvl.id === 1 ? true : Boolean(lvlMeta?.isUnlocked);

          return (
            <button
              key={lvl.id}
              className={`diff-btn ${lvl.color} ${selectedDifficulty === lvl.id ? "active" : ""} ${!isUnlocked ? "locked-btn" : ""}`}
              onClick={() => handleSelectDifficulty(lvl.id)}
              title={isUnlocked ? lvl.desc : `Locked. Complete previous level tasks first.`}
            >
              <span>{lvl.badge}</span>
              {!isUnlocked && <Lock size={12} style={{ marginLeft: 4 }} />}
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          {activeLevelConfig.desc}
        </div>
      </div>

      {/* 2. STRICT EXAM MONITORING BAR (Hard & Expert) */}
      {selectedDifficulty >= 3 && (
        <ExamSecurityBar
          levelName={activeLevelConfig.name}
          violationCount={violationCount}
          maxViolations={3}
          cameraActive={cameraVerified}
          cameraStream={cameraStream}
        />
      )}

      {/* 3. PROGRESSIVE TASK STEPPER (10, 16, 20, 26 Tasks) */}
      <TaskStepper
        tasks={tasks}
        currentTaskNumber={currentTaskNumber}
        completedTasksCount={completedTasksCount}
        onSelectTask={handleSelectTask}
        levelName={activeLevelConfig.name}
        totalTasks={tasks.length || (selectedDifficulty === 1 ? 10 : selectedDifficulty === 2 ? 16 : selectedDifficulty === 3 ? 20 : 26)}
      />

      {/* 4. REASSESSMENT BANNER (Intermediate Task 1) */}
      {isReassessment && (
        <div className="reassessment-banner">
          <div className="reassessment-icon-box">
            <RotateCcw size={22} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1e3a8a" }}>
              Task 1: Beginner Knowledge Reassessment
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#3b82f6", lineHeight: 1.5 }}>
              This task reassesses core concepts from the Beginner level in a reworded format to test your memory and foundational concept retention before intermediate challenges begin.
            </p>
          </div>
        </div>
      )}

      {/* 5. LEARNING VIDEO EMBED (Hard & Expert Coding Tasks) */}
      {selectedDifficulty >= 3 && isCodingTask && currentTask && (
        <LearningVideo
          videoUrl={currentTask.video_url}
          title={currentTask.title}
          topic={currentTask.topic}
        />
      )}

      {/* 6. EXAM CANCELLATION OVERLAY */}
      {isExamCancelled && (
        <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 14, padding: 24, margin: "20px 0", textAlign: "center" }}>
          <ShieldAlert size={48} style={{ color: "#dc2626", margin: "0 auto 10px" }} />
          <h2 style={{ color: "#991b1b", margin: "0 0 8px" }}>Assessment Attempt Cancelled</h2>
          <p style={{ color: "#b91c1c", fontSize: 14, maxWidth: 500, margin: "0 auto 16px" }}>
            {cancellationReason || "You exceeded the maximum allowed security violations (3). Leaving the assessment tab or losing window focus is strictly monitored."}
          </p>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7f1d1d", marginBottom: 16 }}>
            Score Awarded: 0 / 100 (Violation Policy Enforced)
          </div>
          <button
            onClick={() => {
              setCameraVerified(false);
              startTaskAttempt(courseId, selectedDifficulty, currentTaskNumber, false);
            }}
            style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            Restart Assessment Attempt
          </button>
        </div>
      )}

      {/* 7. MAIN TASK INTERFACE */}
      {!isExamCancelled && (
        <div className="simulation-layout">
          {/* LEFT: Task & Questions or Code Editor */}
          <div className="scenario-card panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="eyebrow" style={{ color: isCodingTask ? "#6366f1" : "#2563eb" }}>
                {isCodingTask ? "LIVE CODING CHALLENGE" : isReassessment ? "REASSESSMENT QUESTION" : "TECHNICAL SCENARIO"}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                Topic: {currentTask?.topic || "General"}
              </span>
            </div>

            <h2 style={{ fontSize: 18, margin: "0 0 10px" }}>{currentTask?.title}</h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 18 }}>
              {currentTask?.instructions || currentTask?.description}
            </p>

            {/* CODING LAB VIEW */}
            {isCodingTask ? (
              <div className="coding-lab-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Solution Editor ({currentTask?.code_language || "JavaScript"}):
                  </span>
                  <button
                    onClick={() => {
                      if (currentTask?.starter_code) setUserCode(currentTask.starter_code);
                      setExecutionResult(null);
                    }}
                    style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset Starter Code</span>
                  </button>
                </div>

                <textarea
                  className="code-editor-textarea"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  disabled={submitted}
                  rows={10}
                  spellCheck="false"
                  style={{
                    width: "100%",
                    fontFamily: "Consolas, Menlo, Monaco, monospace",
                    fontSize: 13,
                    background: "#0f172a",
                    color: "#f8fafc",
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid #334155",
                    lineHeight: 1.5,
                    resize: "vertical"
                  }}
                />

                {/* Run & Submit Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    className="run-btn"
                    onClick={handleRunCode}
                    disabled={isRunningCode || submitted}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
                  >
                    <Play size={15} />
                    {isRunningCode ? "Running Tests..." : "Run Tests (Sandbox)"}
                  </button>

                  {!submitted ? (
                    <button
                      className="primary"
                      onClick={handleSubmitTask}
                      disabled={!executionResult}
                      style={{ padding: "10px 22px", borderRadius: 8, fontWeight: 700 }}
                    >
                      Submit Challenge
                    </button>
                  ) : (
                    <button
                      onClick={handleNextTask}
                      style={{ padding: "10px 22px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                    >
                      Next Task →
                    </button>
                  )}
                </div>

                {/* Execution Results Console */}
                {executionResult && (
                  <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 14, color: "white", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: 8, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700 }}>
                        {executionResult.allPassed ? "✅ All Unit Tests Passed!" : "❌ Some Unit Tests Failed"}
                      </span>
                      <span style={{ color: "#94a3b8" }}>Execution Time: {executionResult.durationMs}ms</span>
                    </div>

                    {executionResult.results?.map((res, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: res.passed ? "#4ade80" : "#f87171" }}>
                        <span>Test Case {res.testIndex}: {res.description || res.call}</span>
                        <span>{res.passed ? "PASSED" : "FAILED"}</span>
                      </div>
                    ))}

                    {executionResult.stdout && (
                      <div className="stdout-box" style={{ marginTop: 8 }}>
                        {executionResult.stdout}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* MCQ / SCENARIO QUESTIONS VIEW */
              <div className="scenario-questions-flow">
                {assignedQuestions.map((q, qIdx) => {
                  const selectedOpt = answers[q.id];
                  const evalItem = evaluation?.evaluations?.find((e) => e.questionId === q.id);

                  return (
                    <div key={q.id} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>
                        {assignedQuestions.length > 1 ? `Question ${qIdx + 1}: ` : ""}{q.question}
                      </div>

                      <div className="options-stack">
                        {["option_a", "option_b", "option_c", "option_d"].map((optKey, oIdx) => {
                          const optText = q[optKey];
                          if (!optText) return null;

                          const isSelected = selectedOpt === optText;
                          const isCorrect = evalItem && evalItem.correctAnswer === optText;
                          const isWrongSelection = evalItem && isSelected && !evalItem.isCorrect;

                          return (
                            <button
                              key={optKey}
                              className={`scenario-option ${isSelected ? "selected" : ""} ${isCorrect ? "correct-answer-reveal" : ""} ${isWrongSelection ? "wrong-answer-reveal" : ""}`}
                              onClick={() => {
                                if (!submitted) {
                                  setAnswers((prev) => ({ ...prev, [q.id]: optText }));
                                }
                              }}
                              disabled={submitted}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                textAlign: "left",
                                padding: "12px 16px",
                                margin: "6px 0",
                                width: "100%",
                                borderRadius: 10,
                                border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                background: isSelected ? "#eff6ff" : "white",
                                cursor: submitted ? "default" : "pointer"
                              }}
                            >
                              <span style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: isSelected ? "#2563eb" : "#f1f5f9",
                                color: isSelected ? "white" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700
                              }}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ fontSize: 13, color: "#1e293b", flex: 1 }}>{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal on submission */}
                      {evalItem && evalItem.explanation && (
                        <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderLeft: "4px solid #3b82f6", borderRadius: 6, fontSize: 12, color: "#334155" }}>
                          <strong>Explanation: </strong> {evalItem.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  {!submitted ? (
                    <button
                      className="primary"
                      onClick={handleSubmitTask}
                      style={{ padding: "10px 24px", borderRadius: 8, fontWeight: 700 }}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextTask}
                      style={{ padding: "10px 24px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                    >
                      Next Task →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Submission Result / Celebration Card */}
            {evaluation && (
              <div style={{
                marginTop: 20,
                padding: 18,
                borderRadius: 12,
                background: evaluation.isPassed ? "#ecfdf5" : "#fef2f2",
                border: evaluation.isPassed ? "1px solid #a7f3d0" : "1px solid #fecaca"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, color: evaluation.isPassed ? "#065f46" : "#991b1b" }}>
                      {evaluation.isPassed ? `🎉 Task ${currentTaskNumber} Passed!` : `Task ${currentTaskNumber} Not Passed`}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: evaluation.isPassed ? "#047857" : "#b91c1c" }}>
                      {evaluation.message}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: evaluation.isPassed ? "#16a34a" : "#dc2626" }}>
                      {evaluation.score}%
                    </span>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Required: {evaluation.passingScore || 60}%</div>
                  </div>
                </div>

                {/* Badge Award Celebration */}
                {newBadge && (
                  <div style={{ marginTop: 14, padding: 14, background: "white", borderRadius: 10, border: "1.5px solid #fbbf24", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 32 }}>🏆</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>Certification Earned!</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{newBadge.badgeName}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Level: {newBadge.levelName} • Score: {newBadge.score}%</div>
                    </div>
                  </div>
                )}

                {/* Mandatory Career-Fit Disclaimer */}
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#854d0e" }}>
                  <Sparkles size={16} style={{ color: "#d97706", flexShrink: 0 }} />
                  <div>
                    <strong>Demo Career-Fit Insight — Not a professional assessment</strong>
                    <div style={{ fontSize: 11, color: "#a16207", marginTop: 2 }}>
                      Performance marks reflect scenario exploration to guide self-directed career development.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Task Info & Level Requirements */}
          <aside className="simulation-sidebar">
            <div className="panel" style={{ marginBottom: 16 }}>
              <span className="eyebrow">CAREER CONTEXT</span>
              <h3 style={{ fontSize: 16, margin: "6px 0 10px" }}>{career.title}</h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{career.short}</p>

              <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Active Level:</span>
                  <strong>{activeLevelConfig.name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Task Type:</span>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{currentTask?.task_type || "conceptual"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#64748b" }}>Passing Mark:</span>
                  <strong>{currentTask?.passing_score || 60}%</strong>
                </div>
              </div>
            </div>

            <div className="panel">
              <span className="eyebrow">LEVEL REWARDS</span>
              <div style={{ fontSize: 13, fontWeight: 700, margin: "8px 0 4px" }}>
                {selectedDifficulty === 1
                  ? "Unlocks Intermediate Level"
                  : selectedDifficulty === 2
                  ? "Awards 'PathPilot Skill Builder' Badge"
                  : selectedDifficulty === 3
                  ? "Awards 'PathPilot Problem Solver' Badge"
                  : "Awards 'PathPilot Expert Achiever' Badge"}
              </div>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                {selectedDifficulty === 1
                  ? "Pass all 10 Beginner tasks to unlock Intermediate."
                  : selectedDifficulty === 2
                  ? "Pass all 16 Intermediate tasks to earn your badge and unlock Hard."
                  : selectedDifficulty === 3
                  ? "Pass all 20 Hard tasks to earn your Problem Solver badge and unlock Expert."
                  : "Pass all 26 Expert tasks to achieve the master career certification."}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Camera Permission Modal */}
      <CameraModal
        isOpen={showCameraModal}
        levelName={activeLevelConfig.name}
        onClose={() => {
          setShowCameraModal(false);
          setSelectedDifficulty(1); // Return to Beginner
        }}
        onVerified={handleCameraVerified}
      />
    </>
  );
}
