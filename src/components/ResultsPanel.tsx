import type { ScheduleResult } from "../types";
import CourseCard from "./CourseCard";

interface Props {
  result: ScheduleResult;
}

export default function ResultsPanel({ result }: Props) {
  const allSessions = result.courses.flatMap((c) =>
    c.sessions.map((s) => ({ course: c, session: s }))
  );

  return (
    <div className="fade-up" style={{ marginBottom: 16 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: 10,
        }}
      >
        Detected — {allSessions.length} sessions
      </p>

      <div className="card-grid" style={{ marginBottom: 14 }}>
        {allSessions.map(({ course, session }, i) => (
          <div
            key={`${course.code}-${session.type}-${i}`}
            className="fade-up"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <CourseCard course={course} session={session} />
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9ca3af",
            marginBottom: 8,
          }}
        >
          Summary
        </p>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
          {result.summary}
        </p>
      </div>
    </div>
  );
}
