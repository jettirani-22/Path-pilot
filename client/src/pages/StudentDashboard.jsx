import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Award,
  Compass,
  Bookmark,
  ArrowRight,
  Laptop,
  Lock,
  Sparkles,
  BarChart3,
  ShieldAlert
} from "lucide-react";

export default function StudentDashboard({ currentUser, showToast }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("pathpilot_token");

  useEffect(() => {
    fetchDashboardProgress();
  }, [token]);

  const fetchDashboardProgress = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/progress", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = currentUser?.name || dashboardData?.user?.name || "Student Explorer";
  const stats = dashboardData?.stats || {
    simulationsCompleted: 0,
    averageScore: 0,
    careersExplored: 0,
    badgesEarned: 0
  };

  const courseList = dashboardData?.courses || [];
  const badgesList = dashboardData?.badges || [];
  const recentAttempts = dashboardData?.recentAttempts || [];

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">AUTHENTICATED STUDENT DASHBOARD</span>
          <h1>
            Welcome back, {displayName} <span>👋</span>
          </h1>
          <p>
            Track your multi-level career simulations, view verified mastery badges, and resume learning.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="primary" to="/simulation">
            Explore Simulation Labs
            <ArrowRight />
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon">
            <CheckCircle2 />
          </div>
          <div>
            <strong>{stats.simulationsCompleted}</strong>
            <span>Tasks Completed</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon">
            <Award />
          </div>
          <div>
            <strong>{stats.averageScore}%</strong>
            <span>Average Score</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon">
            <Sparkles />
          </div>
          <div>
            <strong>{stats.badgesEarned}</strong>
            <span>Certifications Earned</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon">
            <Compass />
          </div>
          <div>
            <strong>{stats.careersExplored}</strong>
            <span>Active Tracks</span>
          </div>
        </div>
      </div>

      {/* Career Track Progress Cards */}
      <div style={{ margin: "24px 0 16px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Career Track Mastery & Progression</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
          Complete all tasks sequentially in each level to unlock higher tiers (Beginner $\rightarrow$ Intermediate $\rightarrow$ Hard $\rightarrow$ Expert).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        {courseList.map((course) => {
          const courseSlug = course.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <div key={course.id} className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span className="eyebrow" style={{ color: "#2563eb" }}>{course.category || "CAREER TRACK"}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 12 }}>
                    Level {course.currentLevel}: {course.currentLevelName}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{course.name}</h3>

                {/* Progress Bar */}
                <div style={{ margin: "12px 0 8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#64748b" }}>Level Tasks:</span>
                    <strong>{course.completedTasks} / {course.totalTasks} ({course.progressPercent}%)</strong>
                  </div>
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${course.progressPercent}%`, background: "#2563eb", borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {/* Level Lock Pills */}
                <div style={{ display: "flex", gap: 4, margin: "12px 0 16px", flexWrap: "wrap" }}>
                  {course.levels?.map((lvl) => (
                    <span
                      key={lvl.id}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 6px",
                        borderRadius: 6,
                        background: lvl.isCompleted ? "#ecfdf5" : lvl.isUnlocked ? "#eff6ff" : "#f1f5f9",
                        color: lvl.isCompleted ? "#065f46" : lvl.isUnlocked ? "#1d4ed8" : "#94a3b8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        border: lvl.isCompleted ? "1px solid #a7f3d0" : lvl.isUnlocked ? "1px solid #bfdbfe" : "1px solid #e2e8f0"
                      }}
                    >
                      {lvl.name} ({lvl.totalTasks})
                      {!lvl.isUnlocked && <Lock size={9} />}
                    </span>
                  ))}
                </div>
              </div>

              <Link className="primary" to={`/simulation/${courseSlug}`} style={{ width: "100%", justifyContent: "center" }}>
                <span>Continue Track</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Earned Badges Showcase */}
      <div className="panel" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Verified Mastery Badges</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Official certifications awarded upon successfully completing all tasks within a difficulty tier.
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: 12 }}>
            {badgesList.length} Badges Earned
          </span>
        </div>

        {badgesList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
            <Award size={36} style={{ color: "#94a3b8", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>No Badges Earned Yet</div>
            <p style={{ fontSize: 12, color: "#64748b", maxWidth: 420, margin: "4px auto 0" }}>
              Complete all 16 Intermediate tasks to earn <strong>"PathPilot Skill Builder"</strong>, 20 Hard tasks for <strong>"PathPilot Problem Solver"</strong>, or 26 Expert tasks for <strong>"PathPilot Expert Achiever"</strong>.
            </p>
          </div>
        ) : (
          <div className="badge-grid">
            {badgesList.map((b) => {
              const lvlClass = b.level_name?.toLowerCase().includes("intermediate")
                ? "intermediate"
                : b.level_name?.toLowerCase().includes("hard")
                ? "hard"
                : "expert";

              return (
                <div key={b.id} className={`badge-card ${lvlClass}`}>
                  <div className="badge-icon-bubble">
                    {lvlClass === "intermediate" ? "🔵" : lvlClass === "hard" ? "🟡" : "🏆"}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                    {b.course_name}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: "4px 0 6px" }}>{b.badge_name}</h3>
                  <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>
                    Passing Score: {b.score}%
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Earned: {new Date(b.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real Assessment History */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Recent Assessment Activity</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Live attempt logs recorded securely in your database.
            </p>
          </div>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 14 }}>
            <Laptop size={32} style={{ color: "#94a3b8", marginBottom: 8 }} />
            <p>You haven't completed any assessments yet.</p>
            <Link className="primary small" to="/simulation">
              Start Your First Simulation
            </Link>
          </div>
        ) : (
          <div className="activity-list">
            {recentAttempts.map((attempt) => (
              <div className="activity-row" key={attempt.id}>
                <div className="activity-icon" style={{
                  background: attempt.is_cancelled ? "#fef2f2" : attempt.accuracy >= 60 ? "#ecfdf5" : "#fef2f2",
                  color: attempt.is_cancelled ? "#dc2626" : attempt.accuracy >= 60 ? "#16a34a" : "#dc2626"
                }}>
                  {attempt.is_cancelled ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                </div>

                <div>
                  <strong>{attempt.career_name} • {attempt.level_name} (Task #{attempt.task_number || 1})</strong>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {attempt.is_cancelled
                      ? `Cancelled: ${attempt.cancellation_reason || "Security violations"}`
                      : `Completed ${new Date(attempt.completed_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <b className={`score-badge ${attempt.accuracy >= 70 ? "high" : attempt.accuracy >= 60 ? "medium" : "low"}`}>
                    {attempt.is_cancelled ? "0%" : `${attempt.score}%`}
                  </b>
                  <Link
                    to="/report"
                    onClick={() => {
                      localStorage.setItem("pathpilot-last-result", JSON.stringify({
                        career: attempt.career_name,
                        score: attempt.score,
                        correctCount: attempt.accuracy >= 60 ? 1 : 0,
                        totalQuestions: 1,
                        date: new Date(attempt.completed_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      }));
                    }}
                    className="text-btn"
                    style={{ fontSize: "12px" }}
                  >
                    Report →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
