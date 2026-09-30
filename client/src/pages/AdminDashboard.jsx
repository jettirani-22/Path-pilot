import React, { useState, useEffect } from "react";
import { Shield, Settings, BookOpen, AlertTriangle, Users, CheckCircle, Save, Video, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard({ currentUser, showToast }) {
  const [overview, setOverview] = useState(null);
  const [settings, setSettings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState(3); // Hard
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", video_url: "", marks: 10, passing_score: 60 });

  const token = localStorage.getItem("pathpilot_token");

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [selectedCourse, selectedDifficulty, token]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/overview", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setSettings(data.settings || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/admin/tasks?courseId=${selectedCourse}&difficultyId=${selectedDifficulty}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  const handleUpdateSetting = async (key, val) => {
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value: val })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Setting '${key}' updated to ${val}`);
        fetchAdminData();
      } else {
        alert(data.message || "Failed to update setting");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveTask = async (taskId) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast?.("Task updated successfully!");
        setEditingTask(null);
        fetchTasks();
      } else {
        alert(data.message || "Failed to update task");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", padding: 30, background: "white", borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <Shield size={48} style={{ color: "#ef4444", marginBottom: 12 }} />
        <h2>Admin Access Restricted</h2>
        <p style={{ color: "#64748b", margin: "10px 0 20px" }}>
          You must be logged in as an administrator to manage courses, exam violation policies, and video URLs.
        </p>
        <Link className="primary" to="/login">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Link className="back-link" to="/dashboard">
            ← Back to Student Dashboard
          </Link>
          <h1 style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 800 }}>Admin Administration Lab</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Configure course tasks, YouTube educational links, passing thresholds, and exam violation limits.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 24 }}>
        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <Users size={20} />
          </div>
          <div>
            <strong>{overview?.totalUsers ?? 0}</strong>
            <span>Active Students</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <strong>{overview?.totalAttempts ?? 0}</strong>
            <span>Simulation Attempts</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <BookOpen size={20} />
          </div>
          <div>
            <strong>{overview?.passRate ?? 0}%</strong>
            <span>Global Pass Rate</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <strong>{overview?.totalViolations ?? 0}</strong>
            <span>Logged Violations</span>
          </div>
        </div>

        <div className="dashboard-stat panel">
          <div className="dashboard-stat-icon" style={{ background: "#fae8ff", color: "#9333ea" }}>
            <Shield size={20} />
          </div>
          <div>
            <strong>{overview?.totalBadgesAwarded ?? 0}</strong>
            <span>Badges Awarded</span>
          </div>
        </div>
      </div>

      {/* System Settings & Policies */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Settings size={18} style={{ color: "#2563eb" }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Exam Monitoring & Passing Policies</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {settings.map((s) => (
            <div key={s.key} style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                {s.key.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", margin: "4px 0 10px" }}>{s.description}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  defaultValue={s.value}
                  id={`input-${s.key}`}
                  style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById(`input-${s.key}`);
                    if (el) handleUpdateSetting(s.key, el.value);
                  }}
                  style={{ padding: "6px 12px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Tasks & Video URL Management */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Video size={18} style={{ color: "#ef4444" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Task Catalog & YouTube Video Management</h2>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
            >
              <option value={1}>Software Developer</option>
              <option value={2}>Data Analyst</option>
              <option value={3}>UI/UX Designer</option>
              <option value={4}>Digital Marketer</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
            >
              <option value={1}>Beginner (10 Tasks)</option>
              <option value={2}>Intermediate (16 Tasks)</option>
              <option value={3}>Hard (20 Tasks)</option>
              <option value={4}>Expert (26 Tasks)</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "10px 12px" }}>#</th>
                <th style={{ padding: "10px 12px" }}>Task Title</th>
                <th style={{ padding: "10px 12px" }}>Topic</th>
                <th style={{ padding: "10px 12px" }}>Type</th>
                <th style={{ padding: "10px 12px" }}>YouTube Video URL</th>
                <th style={{ padding: "10px 12px" }}>Passing %</th>
                <th style={{ padding: "10px 12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{t.task_number}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {editingTask === t.id ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        style={{ width: "100%", padding: 4, borderRadius: 4, border: "1px solid #cbd5e1" }}
                      />
                    ) : (
                      <strong>{t.title}</strong>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>{t.topic}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      background: t.task_type === "coding" ? "#e0e7ff" : t.task_type === "reassessment" ? "#fef3c7" : "#ecfdf5",
                      color: t.task_type === "coding" ? "#3730a3" : t.task_type === "reassessment" ? "#92400e" : "#065f46"
                    }}>
                      {t.task_type}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", maxWidth: 220 }}>
                    {editingTask === t.id ? (
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={editForm.video_url || ""}
                        onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                        style={{ width: "100%", padding: 4, borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 11 }}
                      />
                    ) : t.video_url ? (
                      <span style={{ fontSize: 11, color: "#2563eb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                        {t.video_url}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>No video</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {editingTask === t.id ? (
                      <input
                        type="number"
                        value={editForm.passing_score}
                        onChange={(e) => setEditForm({ ...editForm, passing_score: Number(e.target.value) })}
                        style={{ width: 60, padding: 4, borderRadius: 4, border: "1px solid #cbd5e1" }}
                      />
                    ) : (
                      <span>{t.passing_score || 60}%</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {editingTask === t.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleSaveTask(t.id)}
                          style={{ padding: "4px 8px", background: "#16a34a", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          style={{ padding: "4px 8px", background: "#94a3b8", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTask(t.id);
                          setEditForm({
                            title: t.title,
                            video_url: t.video_url || "",
                            marks: t.marks || 10,
                            passing_score: t.passing_score || 60,
                            topic: t.topic,
                            instructions: t.instructions,
                            description: t.description
                          });
                        }}
                        style={{ padding: "4px 10px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
