import type { Course, Session } from "../types";
import SessionBadge from "./SessionBadge";

interface Props {
  course: Course;
  session: Session;
}

export default function CourseCard({ course, session }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#111827",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {course.code}
        </span>
        <SessionBadge type={session.type} />
      </div>

      <div style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>
        <div>{session.days.join(" · ")}</div>
        <div style={{ fontWeight: 500, color: "#374151" }}>{session.time}</div>
      </div>
    </div>
  );
}
