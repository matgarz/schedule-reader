import type { PipelineResult, ScheduleResult, TimeBlock } from "../types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_TO_INDEX: Record<string, number> = {
  mon: 0,
  monday: 0,
  tue: 1,
  tues: 1,
  tuesday: 1,
  wed: 2,
  wednesday: 2,
  thu: 3,
  thur: 3,
  thurs: 3,
  thursday: 3,
  fri: 4,
  friday: 4,
  sat: 5,
  saturday: 5,
  sun: 6,
  sunday: 6,
};

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 22 * 60;

interface RawBlock {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
}

function normalizeDayToIndex(day: string): number | null {
  const key = day.trim().toLowerCase();
  const index = DAY_TO_INDEX[key];
  return typeof index === "number" ? index : null;
}

function parseTimeToken(token: string): number | null {
  const cleaned = token.trim().toLowerCase().replace(/\./g, "");
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const suffix = match[3];

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;

  if (suffix === "am") {
    if (hour === 12) hour = 0;
  } else if (suffix === "pm") {
    if (hour < 12) hour += 12;
  }

  if (hour > 23) return null;
  return hour * 60 + minute;
}

function parseTimeRange(range: string): { start: number; end: number } | null {
  const normalized = range
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+to\s+/gi, "-")
    .trim();

  const parts = normalized.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 2) return null;

  const start = parseTimeToken(parts[0]);
  const end = parseTimeToken(parts[1]);

  if (start === null || end === null || end <= start) return null;
  return { start, end };
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toDisplayBlock(raw: RawBlock): TimeBlock {
  return {
    day: DAYS[raw.dayIndex],
    start: formatTime(raw.startMinutes),
    end: formatTime(raw.endMinutes),
    startMinutes: raw.startMinutes,
    endMinutes: raw.endMinutes,
  };
}

function mergeBlocks(blocks: RawBlock[]): RawBlock[] {
  if (blocks.length === 0) return [];

  const sorted = [...blocks].sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return a.startMinutes - b.startMinutes;
  });

  const merged: RawBlock[] = [];
  for (const block of sorted) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.dayIndex === block.dayIndex &&
      block.startMinutes <= last.endMinutes
    ) {
      last.endMinutes = Math.max(last.endMinutes, block.endMinutes);
    } else {
      merged.push({ ...block });
    }
  }

  return merged;
}

function invertToAvailability(busyBlocks: RawBlock[]): RawBlock[] {
  const mergedBusy = mergeBlocks(
    busyBlocks
      .map((b) => ({
        dayIndex: b.dayIndex,
        startMinutes: Math.max(DAY_START_MINUTES, b.startMinutes),
        endMinutes: Math.min(DAY_END_MINUTES, b.endMinutes),
      }))
      .filter((b) => b.endMinutes > b.startMinutes)
  );

  const availability: RawBlock[] = [];

  for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex += 1) {
    const dayBusy = mergedBusy.filter((b) => b.dayIndex === dayIndex);
    let cursor = DAY_START_MINUTES;

    for (const block of dayBusy) {
      if (block.startMinutes > cursor) {
        availability.push({
          dayIndex,
          startMinutes: cursor,
          endMinutes: block.startMinutes,
        });
      }
      cursor = Math.max(cursor, block.endMinutes);
    }

    if (cursor < DAY_END_MINUTES) {
      availability.push({ dayIndex, startMinutes: cursor, endMinutes: DAY_END_MINUTES });
    }
  }

  return availability;
}

function intersectTwo(a: RawBlock[], b: RawBlock[]): RawBlock[] {
  const intersections: RawBlock[] = [];

  for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex += 1) {
    const aDay = a.filter((x) => x.dayIndex === dayIndex).sort((x, y) => x.startMinutes - y.startMinutes);
    const bDay = b.filter((x) => x.dayIndex === dayIndex).sort((x, y) => x.startMinutes - y.startMinutes);

    let i = 0;
    let j = 0;

    while (i < aDay.length && j < bDay.length) {
      const start = Math.max(aDay[i].startMinutes, bDay[j].startMinutes);
      const end = Math.min(aDay[i].endMinutes, bDay[j].endMinutes);

      if (end > start) {
        intersections.push({ dayIndex, startMinutes: start, endMinutes: end });
      }

      if (aDay[i].endMinutes < bDay[j].endMinutes) {
        i += 1;
      } else {
        j += 1;
      }
    }
  }

  return mergeBlocks(intersections);
}

function chooseBestTimes(blocks: RawBlock[], maxCount = 3): RawBlock[] {
  const scored = blocks
    .filter((b) => b.endMinutes - b.startMinutes >= 30)
    .map((b) => {
      const duration = b.endMinutes - b.startMinutes;
      const midpoint = (b.startMinutes + b.endMinutes) / 2;
      const proximityToNoon = Math.abs(midpoint - 12 * 60);
      const timeOfDayBonus = Math.max(0, 240 - proximityToNoon);
      const score = duration * 2 + timeOfDayBonus;
      return { block: b, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, maxCount)
    .map((x) => x.block);

  return scored;
}

function extractBusyBlocks(schedule: ScheduleResult): RawBlock[] {
  const blocks: RawBlock[] = [];

  for (const course of schedule.courses) {
    for (const session of course.sessions) {
      const range = parseTimeRange(session.time);
      if (!range) continue;

      for (const dayRaw of session.days) {
        const dayIndex = normalizeDayToIndex(dayRaw);
        if (dayIndex === null) continue;

        blocks.push({
          dayIndex,
          startMinutes: range.start,
          endMinutes: range.end,
        });
      }
    }
  }

  return mergeBlocks(blocks);
}

/**
 * Issue 5 pipeline:
 * schedule -> busy blocks -> user availability -> team availability -> best time
 */
export function buildPipeline(schedules: ScheduleResult[]): PipelineResult {
  if (schedules.length === 0) {
    return {
      busyBlocks: [],
      userAvailability: [],
      teamAvailability: [],
      bestTimes: [],
    };
  }

  const userBusy = extractBusyBlocks(schedules[0]);
  const userAvailability = invertToAvailability(userBusy);

  const allAvailabilities = schedules.map((schedule) =>
    invertToAvailability(extractBusyBlocks(schedule))
  );

  const teamAvailability = allAvailabilities.slice(1).reduce(
    (acc, current) => intersectTwo(acc, current),
    allAvailabilities[0]
  );

  const bestTimes = chooseBestTimes(teamAvailability);

  return {
    busyBlocks: userBusy.map(toDisplayBlock),
    userAvailability: userAvailability.map(toDisplayBlock),
    teamAvailability: teamAvailability.map(toDisplayBlock),
    bestTimes: bestTimes.map(toDisplayBlock),
  };
}
