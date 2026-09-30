import React from "react";
import { PlayCircle, ExternalLink, VideoOff, BookOpen } from "lucide-react";

export default function LearningVideo({ videoUrl, title, topic }) {
  // Convert standard YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        const v = parsed.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      } else if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.slice(1);
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch (_) {}
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!videoUrl || !embedUrl) {
    return (
      <div className="learning-video-section">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "#475569", fontWeight: 700, fontSize: 14 }}>
          <BookOpen size={16} style={{ color: "#2563eb" }} />
          <span>Technical Topic Preparation: {topic || "Core Principles"}</span>
        </div>
        <div className="video-unavailable-box">
          <VideoOff size={28} style={{ color: "#94a3b8", marginBottom: 6 }} />
          <p style={{ margin: "4px 0", fontSize: 13, fontWeight: 600 }}>Learning video not available for this task</p>
          <span style={{ fontSize: 12 }}>You can proceed directly with the instructions and unit test requirements below.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-video-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1e293b", fontWeight: 700, fontSize: 14 }}>
          <PlayCircle size={18} style={{ color: "#ef4444" }} />
          <span>Recommended Video Lecture: {topic || title}</span>
        </div>

        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
        >
          <span>Watch on YouTube</span>
          <ExternalLink size={13} />
        </a>
      </div>

      <div className="video-embed-responsive">
        <iframe
          src={embedUrl}
          title={title || "Learning Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
        💡 <em>Review this conceptual lecture prior to constructing your algorithmic implementation.</em>
      </div>
    </div>
  );
}
