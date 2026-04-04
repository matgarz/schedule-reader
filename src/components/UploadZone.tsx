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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Drag-and-drop / tap zone */}
          <div
            onClick={() => galleryRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              padding: '40px 20px',
              border: dragging ? '1px dashed var(--primary)' : '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              background: dragging ? 'rgba(58, 46, 242, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                 <circle cx="8.5" cy="8.5" r="1.5"></circle>
                 <polyline points="21 15 16 10 5 21"></polyline>
               </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Click to browse or drag image here
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Supports JPG, PNG, HEIC up to 10MB
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#1C1C24',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
              Browse Files
            </button>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#1C1C24',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                 <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Take Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
