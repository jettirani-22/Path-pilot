import React, { useState, useEffect, useRef } from "react";
import { Camera, Video, VideoOff, CheckCircle2, AlertTriangle, X, Shield } from "lucide-react";

export default function CameraModal({ isOpen, onClose, onVerified, levelName = "Hard" }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsVerified(false);
      requestCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCamera = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access API.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      setStream(mediaStream);
      setIsVerified(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera request error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Please allow camera access in your browser site settings to start this assessment.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera hardware detected. A functional front camera is required for Hard and Expert levels.");
      } else {
        setError(`Camera initialization failed: ${err.message}`);
      }
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleConfirm = () => {
    if (isVerified) {
      onVerified(stream);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-backdrop">
      <div className="camera-modal-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#eff6ff", color: "#2563eb", padding: 8, borderRadius: 8 }}>
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Exam Monitoring Setup</h2>
              <span style={{ fontSize: 12, color: "#64748b" }}>{levelName} Level Exam Integrity Verification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "8px 0 16px" }}>
          Hard and Expert assessments require camera verification to confirm student identity and ensure strict examination standards.
          <strong> PathPilot does not record, stream, or store your video on external servers.</strong> Your camera feed is previewed locally in your browser session.
        </p>

        {/* Live Camera Preview Box */}
        <div className="camera-preview-container">
          {stream ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video-feed"
              />
              <div className="camera-live-badge">
                <div className="camera-pulse-dot" />
                <span>LIVE PREVIEW ACTIVE</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>
              {isLoading ? (
                <>
                  <Camera size={40} style={{ animation: "spin 2s linear infinite" }} />
                  <p style={{ marginTop: 10, fontSize: 14 }}>Connecting to camera hardware...</p>
                </>
              ) : (
                <>
                  <VideoOff size={40} style={{ color: "#ef4444", marginBottom: 8 }} />
                  <p style={{ fontSize: 14, color: "#cbd5e1" }}>Camera Preview Not Connected</p>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#991b1b", fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Verification Requirement:</strong>
              <div style={{ marginTop: 2 }}>{error}</div>
            </div>
          </div>
        )}

        {isVerified && !error && (
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", color: "#065f46", fontSize: 13, display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0 }} />
            <span>Hardware verified successfully! Front camera preview is functional.</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Cancel & Return
          </button>

          {!isVerified ? (
            <button
              onClick={requestCamera}
              disabled={isLoading}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Camera size={16} />
              {isLoading ? "Checking..." : "Retry Camera Check"}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <CheckCircle2 size={16} />
              Confirm & Start Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
