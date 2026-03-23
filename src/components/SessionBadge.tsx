const SESSION_STYLES: Record<string, { bg: string; text: string }> = {
  LEC: { bg: "#dbeafe", text: "#1e40af" },
  TUT: { bg: "#d1fae5", text: "#065f46" },
  LAB: { bg: "#ede9fe", text: "#5b21b6" },
};

const DEFAULT = { bg: "#f3f4f6", text: "#374151" };

interface Props {
  type: string;
}

export default function SessionBadge({ type }: Props) {
  const s = SESSION_STYLES[type] ?? DEFAULT;
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
}
