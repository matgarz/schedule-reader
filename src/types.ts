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

export interface TimeBlock {
  day: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
}

export interface PipelineResult {
  busyBlocks: TimeBlock[];
  userAvailability: TimeBlock[];
  teamAvailability: TimeBlock[];
  bestTimes: TimeBlock[];
}
