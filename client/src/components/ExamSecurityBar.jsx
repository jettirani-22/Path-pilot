import React, { useState } from "react";
import { Shield, AlertTriangle, Eye, Video, HelpCircle, X } from "lucide-react";

export default function ExamSecurityBar({
  levelName = "Hard",
  violationCount = 0,
  maxViolations = 3,
  cameraActive = false,
  cameraStream = null
}) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <div className="exam-security-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#92400e", fontWeight: 700, fontSize: 13 }}>
            <Shield size={16} style={{ color: "#d97706" }} />
            <span>Strict Exam Security Active ({levelName} Level)</span>
          </div>

          {cameraActive && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
              <Video size={13} style={{ color: "#10b981" }} />
              <span>Camera Monitored</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="violation-pill">
            <AlertTriangle size={13} />
            <span>Violations: {violationCount} / {maxViolations} permitted</span>
          </div>

          <button
            onClick={() => setShowRules(true)}
            style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}
            title="View Security Rules"
          >
            <HelpCircle size={14} />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {showRules && (
        <div className="camera-modal-backdrop" onClick={() => setShowRules(false)}>
          <div className="camera-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={18} style={{ color: "#d97706" }} />
                Exam Monitoring Rules & Policies
              </h3>
              <button onClick={() => setShowRules(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={18} />
              </button>
            </div>

            <ul style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, paddingLeft: 18, margin: "12px 0 18px" }}>
              <li><strong>Tab Switching:</strong> Leaving or minimizing this browser tab is automatically logged as a violation.</li>
              <li><strong>Window Focus:</strong> Clicking outside the assessment window triggers focus detection.</li>
              <li><strong>Copy & Paste:</strong> Copying exam content or pasting external code into input fields is restricted.</li>
              <li><strong>Camera Preview:</strong> Front camera must stay active throughout the test.</li>
              <li><strong>Cancellation Policy:</strong> Accumulating <strong>{maxViolations} violations</strong> automatically cancels the attempt and records zero marks.</li>
            </ul>

            <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <em>Note: Browser monitoring records visibility and focus events to maintain standard lab evaluation integrity.</em>
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button
                onClick={() => setShowRules(false)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
