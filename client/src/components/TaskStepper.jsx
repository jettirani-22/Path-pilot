import React from "react";
import { Check, Lock, Code2, RotateCcw } from "lucide-react";

export default function TaskStepper({
  tasks = [],
  currentTaskNumber = 1,
  completedTasksCount = 0,
  onSelectTask,
  levelName = "Beginner",
  totalTasks = 10
}) {
  const effectiveTotal = tasks.length > 0 ? tasks.length : totalTasks;

  return (
    <div className="task-stepper-wrapper">
      <div className="task-stepper-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#0f172a", fontWeight: 700 }}>
            {levelName} Level Progression
          </span>
          <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
            Task {currentTaskNumber} of {effectiveTotal}
          </span>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>
          Completed: <strong>{completedTasksCount}</strong> / {effectiveTotal} ({Math.round((completedTasksCount / effectiveTotal) * 100)}%)
        </div>
      </div>

      <div className="task-stepper-track">
        {Array.from({ length: effectiveTotal }, (_, idx) => {
          const tNum = idx + 1;
          const taskObj = tasks.find((t) => t.task_number === tNum);
          const isCompleted = tNum <= completedTasksCount;
          const isActive = tNum === currentTaskNumber;
          const isLocked = tNum > completedTasksCount + 1;
          const isCoding = taskObj?.task_type === "coding" || taskObj?.task_type === "code";
          const isReassessment = taskObj?.task_type === "reassessment" || (levelName.toLowerCase() === "intermediate" && tNum === 1);

          return (
            <button
              key={tNum}
              className={`task-step-btn ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
              onClick={() => {
                if (!isLocked) onSelectTask(tNum);
              }}
              disabled={isLocked}
              title={`Task #${tNum}: ${taskObj?.title || `Task ${tNum}`}${isLocked ? " (Complete previous tasks first)" : ""}`}
            >
              {isCompleted ? (
                <Check size={16} strokeWidth={3} />
              ) : isLocked ? (
                <Lock size={14} />
              ) : isReassessment ? (
                <RotateCcw size={15} />
              ) : (
                <span>{tNum}</span>
              )}

              {isCoding && (
                <span className="code-badge-sub" title="Coding Challenge">
                  <Code2 size={8} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
