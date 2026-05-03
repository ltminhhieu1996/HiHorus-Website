import React from "react";

const METHOD_VIDEOS = {
  smartsurf:  "3jYw2Ji6vbc",
  femto:      "bjFE56Uj2Z8",
  smartsight: "xq7RKaty1-w",
  clear:      "YbiK7RrRVUI",
};

export default function MethodVideo({ method }) {
  const videoId = METHOD_VIDEOS[method];
  if (!videoId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 16px 6px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
        🎬 Video phẫu thuật
      </div>
      <div style={{ flex: 1, padding: "0 16px 16px", minHeight: 0 }}>
        <iframe
          style={{ width: "100%", height: "100%", minHeight: "200px", borderRadius: "12px", display: "block" }}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Surgery video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}