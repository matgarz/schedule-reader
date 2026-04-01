const SESSION_STYLES: Record<string, { bg: string; text: string }> = {
  LEC: { bg: "#e6ebf4", text: "#32386c" },
  TUT: { bg: "#cbd5fe", text: "#32386c" },
  LAB: { bg: "#a8b1eb", text: "#27293b" },
};

const DEFAULT = { bg: "#e6ebf4", text: "#32386c" };

interface Props {
  type: string;
}

export default function SessionBadge({ type }: Props) {
  const s = SESSION_STYLES[type] ?? DEFAULT;
  return (
    <span
      className="session-badge"
      style={{
        background: s.bg,
        color: s.text,
      }}
    >
      {type}
    </span>
  );
}
