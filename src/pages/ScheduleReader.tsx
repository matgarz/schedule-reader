import { useState, useCallback } from "react";
import type { ScheduleResult } from "../types";
import { parseScheduleImage } from "../lib/api";
import UploadZone from "../components/UploadZone";
import ResultsPanel from "../components/ResultsPanel";
import Spinner from "../components/Spinner";

export default function ScheduleReader() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewSrc(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setImageType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = () => {
    setImageBase64(null);
    setPreviewSrc(null);
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await parseScheduleImage(imageBase64, imageType);
      setResult(data);
    } catch {
      setError("Could not parse the schedule. Please try a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f8f7f4",
        display: "flex",
        flexDirection: "column",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 16px 16px",
          maxWidth: 680,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "#111827",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              📅
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              Schedule Reader
            </h1>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                background: "#111827",
                color: "#fff",
                padding: "3px 8px",
                borderRadius: 20,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              AI
            </span>
          </div>
          <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>
            Upload or photograph your class schedule — Claude extracts every
            course, session type, day, and time.
          </p>
        </div>

        {/* Upload */}
        <UploadZone
          previewSrc={previewSrc}
          dragging={dragging}
          onFile={handleFile}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onReset={reset}
        />

        {/* Error */}
        {error && (
          <div
            className="fade-up"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#b91c1c",
              fontSize: 13,
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && <ResultsPanel result={result} />}
      </div>

      {/* Sticky CTA */}
      <div className="cta-bar">
        <button
          className="primary-btn"
          disabled={!imageBase64 || loading}
          onClick={analyze}
        >
          {loading ? <Spinner /> : <span>✦</span>}
          {loading ? "Reading…" : "Read schedule"}
        </button>

        {previewSrc && !loading && (
          <button className="secondary-btn" onClick={reset}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
