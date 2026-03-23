export interface Session {
  type: "LEC" | "TUT" | "LAB" | string;
  days: string[];
  time: string;
}

export interface Course {
  code: string;
  sessions: Session[];
}

export interface ScheduleResult {
  courses: Course[];
  summary: string;
}

export interface SessionWithCourse {
  course: Course;
  session: Session;
}
