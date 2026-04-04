import type { ScheduleResult } from "../types";
import { useMemo } from "react";
import { buildPipeline } from "../lib/scheduling";
import CourseCard from "./CourseCard";

interface Props {
  results: ScheduleResult[];
}

export default function ResultsPanel({ results }: Props) {
  const allSessions = results.flatMap(r => r.courses).flatMap((c) =>
    c.sessions.map((s) => ({ course: c, session: s }))
  );
  const pipeline = useMemo(() => buildPipeline(results), [results]);
  const topBestTime = pipeline.bestTimes[0];

  const renderBlocks = (label: string, blocks: typeof pipeline.bestTimes) => (
    <div className="panel">
      <p className="panel-title">
        {label} ({blocks.length})
      </p>

      {blocks.length === 0 ? (
        <p className="summary-text">
          No valid blocks yet from the parsed schedule.
        </p>
      ) : (
        <ul className="block-list">
          {blocks.slice(0, 6).map((block, i) => (
            <li
              key={`${label}-${block.day}-${block.start}-${block.end}-${i}`}
              className="block-row"
            >
              <span className="block-day">
                {block.day}
              </span>
              <span className="block-time">
                {block.start} - {block.end}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="fade-up" style={{ marginBottom: 16 }}>
      <p className="results-meta">
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

      <div className="panel">
        <p className="panel-title">
          Summary
        </p>
        <div className="summary-text" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {results.map((r, i) => <p key={i} style={{margin: 0}}>{r.summary}</p>)}
        </div>
      </div>

      <div style={{ height: 12 }} />

      {topBestTime && (
        <div className="best-time-spotlight">
          <p className="panel-title">Top Recommendation</p>
          <p className="best-time-main">
            {topBestTime.day} {topBestTime.start} - {topBestTime.end}
          </p>
          <p className="best-time-sub">
            Highest-ranked overlap window from the current availability model.
          </p>
        </div>
      )}

      <div className="pipeline-banner">
        <p className="panel-title">
          Scheduling Flow
        </p>
        <p className="pipeline-text">
          schedule -&gt; busy block list -&gt; user availability list -&gt; team
          availability list -&gt; best time
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {renderBlocks("Busy blocks", pipeline.busyBlocks)}
        {renderBlocks("User availability", pipeline.userAvailability)}
        {renderBlocks("Team availability", pipeline.teamAvailability)}
        {renderBlocks("Best times", pipeline.bestTimes)}
      </div>
    </div>
  );
}
