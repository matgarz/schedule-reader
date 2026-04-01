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
    // Allow selecting the same image again (notably needed on iOS file picker).
    e.currentTarget.value = "";
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Hidden inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,.heic,.heif"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {previewSrc ? (
        /* Preview */
        <div className="upload-frame" style={{ position: "relative" }}>
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
            type="button"
            aria-label="Remove selected image"
            onClick={onReset}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(79,88,170,0.92)",
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
            className={`upload-dropzone ${dragging ? "dragging" : ""}`}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <p className="upload-title">
              Tap to choose from gallery
            </p>
            <p className="upload-hint">
              or drag and drop — JPG, PNG, HEIC
            </p>
          </div>

          {/* Mobile shortcut row */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="upload-option-btn"
              type="button"
              onClick={() => galleryRef.current?.click()}
            >
              <span style={{ fontSize: 26 }}>📁</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1f275f" }}>
                Browse files
              </span>
            </button>
            <button
              className="upload-option-btn"
              type="button"
              onClick={() => cameraRef.current?.click()}
            >
              <span style={{ fontSize: 26 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1f275f" }}>
                Take photo
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
