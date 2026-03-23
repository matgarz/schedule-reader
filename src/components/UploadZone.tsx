import { useRef } from "react";

interface Props {
  previewSrc: string | null;
  dragging: boolean;
  onFile: (file: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onReset: () => void;
}

export default function UploadZone({
  previewSrc,
  dragging,
  onFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onReset,
}: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Hidden inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {previewSrc ? (
        /* Preview */
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 12,
            position: "relative",
          }}
        >
          <img
            src={previewSrc}
            alt="Schedule preview"
            style={{
              width: "100%",
              maxHeight: 280,
              objectFit: "contain",
              borderRadius: 10,
              display: "block",
            }}
          />
          <button
            onClick={onReset}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(17,24,39,0.85)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent" as never,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          {/* Drag-and-drop / tap zone */}
          <div
            onClick={() => galleryRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              border: `1.5px dashed ${dragging ? "#111827" : "#d1d5db"}`,
              borderRadius: 16,
              background: dragging ? "#f0fdf4" : "#fafaf9",
              padding: "32px 24px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 12,
              WebkitTapHighlightColor: "transparent" as never,
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <p
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#374151",
                marginBottom: 3,
              }}
            >
              Tap to choose from gallery
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>
              or drag and drop — JPG, PNG, HEIC
            </p>
          </div>

          {/* Mobile shortcut row */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="upload-option-btn"
              onClick={() => galleryRef.current?.click()}
            >
              <span style={{ fontSize: 26 }}>📁</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                Browse files
              </span>
            </button>
            <button
              className="upload-option-btn"
              onClick={() => cameraRef.current?.click()}
            >
              <span style={{ fontSize: 26 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
                Take photo
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
