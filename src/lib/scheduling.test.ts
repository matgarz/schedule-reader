import { describe, expect, it } from "vitest";
import type { ScheduleResult } from "../types";
import { buildPipeline } from "./scheduling";

const scheduleA: ScheduleResult = {
  courses: [
    {
      code: "SOEN 342",
      sessions: [
        { type: "LEC", days: ["Mon"], time: "09:00-11:00" },
        { type: "LAB", days: ["Tue"], time: "13:00-15:00" },
      ],
    },
  ],
  summary: "A",
};

const scheduleB: ScheduleResult = {
  courses: [
    {
      code: "COMP 346",
      sessions: [
        { type: "LEC", days: ["Mon"], time: "10:00-12:00" },
        { type: "TUT", days: ["Tue"], time: "14:00-16:00" },
      ],
    },
  ],
  summary: "B",
};

describe("Issue 5 pipeline", () => {
  it("builds busy blocks from parsed schedule", () => {
    const output = buildPipeline([scheduleA]);

    expect(output.busyBlocks).toEqual([
      {
        day: "Mon",
        start: "09:00",
        end: "11:00",
        startMinutes: 540,
        endMinutes: 660,
      },
      {
        day: "Tue",
        start: "13:00",
        end: "15:00",
        startMinutes: 780,
        endMinutes: 900,
      },
    ]);
  });

  it("creates user availability blocks from busy blocks", () => {
    const output = buildPipeline([scheduleA]);

    const monBlocks = output.userAvailability.filter((b) => b.day === "Mon");
    expect(monBlocks).toEqual([
      {
        day: "Mon",
        start: "08:00",
        end: "09:00",
        startMinutes: 480,
        endMinutes: 540,
      },
      {
        day: "Mon",
        start: "11:00",
        end: "22:00",
        startMinutes: 660,
        endMinutes: 1320,
      },
    ]);
  });

  it("intersects multiple users into team availability", () => {
    const output = buildPipeline([scheduleA, scheduleB]);

    const monTeam = output.teamAvailability.filter((b) => b.day === "Mon");
    const tueTeam = output.teamAvailability.filter((b) => b.day === "Tue");

    expect(monTeam).toEqual([
      {
        day: "Mon",
        start: "08:00",
        end: "09:00",
        startMinutes: 480,
        endMinutes: 540,
      },
      {
        day: "Mon",
        start: "12:00",
        end: "22:00",
        startMinutes: 720,
        endMinutes: 1320,
      },
    ]);

    expect(tueTeam).toEqual([
      {
        day: "Tue",
        start: "08:00",
        end: "13:00",
        startMinutes: 480,
        endMinutes: 780,
      },
      {
        day: "Tue",
        start: "16:00",
        end: "22:00",
        startMinutes: 960,
        endMinutes: 1320,
      },
    ]);
  });

  it("returns top best-time recommendations from team availability", () => {
    const output = buildPipeline([scheduleA, scheduleB]);

    expect(output.bestTimes.length).toBeGreaterThan(0);
    expect(output.bestTimes.length).toBeLessThanOrEqual(3);

    for (const block of output.bestTimes) {
      const existsInTeam = output.teamAvailability.some(
        (t) =>
          t.day === block.day &&
          t.startMinutes === block.startMinutes &&
          t.endMinutes === block.endMinutes
      );
      expect(existsInTeam).toBe(true);
    }
  });
});
