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
    <div className="page-shell">
      {/* Scrollable content */}
      <div className="page-content">
        {/* Header */}
        <div className="hero">
          <div className="hero-top">
            <div className="hero-icon">
              📅
            </div>
            <h1>Smart Group Scheduler</h1>
          </div>
          <p>
            Upload a schedule screenshot and instantly convert it into busy
            blocks, personal availability, team overlap, and recommended
            meeting windows.
          </p>
          <div className="hero-strip">
            <div className="hero-pill">Parse Schedules</div>
            <div className="hero-pill accent">Find Overlap</div>
            <div className="hero-pill">Recommend Best Time</div>
          </div>
        </div>

        <h2 className="section-title">Upload Your Schedule</h2>

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
          <div className="fade-up error-box">
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
