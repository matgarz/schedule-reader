import type { Course, Session } from "../types";
import SessionBadge from "./SessionBadge";

interface Props {
  course: Course;
  session: Session;
}

export default function CourseCard({ course, session }: Props) {
  return (
    <div className="course-card" style={{ WebkitTapHighlightColor: "transparent" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <span className="course-code">
          {course.code}
        </span>
        <SessionBadge type={session.type} />
      </div>

      <div className="course-meta">
        <div>{session.days.join(" · ")}</div>
        <div className="session-time">{session.time}</div>
      </div>
    </div>
  );
}
