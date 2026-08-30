import { useMemo } from "react";
import { getStoredEvents, clearStoredEvents, type TrackEvent } from "../utils/analytics";
import { LOVE_BOOK_CONTENT } from "../config/loveContent";

/** Ordered steps shown in the timeline (friendly labels, no raw logs). */
const STEP_ORDER: string[] = [
  "APP_OPENED",
  "HERO_VIEWED",
  "ENVELOPE_OPENED",
  "LETTER_VIEWED",
  "NO_CLICKED",
  "YES_CLICKED",
  "CELEBRATION_STARTED",
  "YES_PAGE_OPENED",
  "LOVEBOOK_OPENED",
  "LOVEBOOK_PAGE_VIEWED",
  "MUSIC_STARTED",
  "MUSIC_PAUSED",
  "FINAL_RESPONSE_SUBMITTED",
];

const LABELS: Record<string, string> = {
  APP_OPENED: "Session Started",
  HERO_VIEWED: "Saw the Hero",
  ENVELOPE_OPENED: "Opened Envelope",
  LETTER_VIEWED: "Read Letter",
  NO_CLICKED: "Clicked No",
  YES_CLICKED: "Clicked Yes",
  CELEBRATION_STARTED: "Reached Celebration",
  YES_PAGE_OPENED: "Reached the Yes page",
  LOVEBOOK_OPENED: "Opened LoveBook",
  LOVEBOOK_PAGE_VIEWED: "Viewed a page",
  MUSIC_STARTED: "Started Music",
  MUSIC_PAUSED: "Paused Music",
  FINAL_RESPONSE_SUBMITTED: "Submitted Final Response",
};

function describeEvent(e: TrackEvent): string {
  if (e.event === "NO_CLICKED") {
    const n = (e.metadata?.clickNumber as number | undefined) ?? 1;
    return `Clicked No (${n}×)`;
  }
  if (e.event === "LOVEBOOK_PAGE_VIEWED") {
    const p = (e.metadata?.page as number | undefined) ?? 0;
    return `Viewed page ${p}`;
  }
  if (e.event === "YES_CLICKED") {
    const n = (e.metadata?.noClicksBeforeYes as number | undefined) ?? 0;
    return `Clicked Yes (after ${n} No's)`;
  }
  return LABELS[e.event] ?? e.event;
}

export default function JourneyTimeline() {
  const events = useMemo(() => getStoredEvents(), []);
  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "rgba(255,245,240,0.5)", maxWidth: "420px", margin: "0 auto" }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>
          No journey recorded on this device yet.
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.8rem",
            color: "rgba(200,151,58,0.7)",
            marginTop: "0.4rem",
          }}
        >
          It only appears here after someone interacts on this same device.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "min(420px, 90vw)",
        padding: "1.4rem",
        borderRadius: "20px",
        background: "rgba(26,10,15,0.7)",
        border: "1px solid rgba(200,151,58,0.3)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        color: "#fff5f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.1rem",
          }}
        >
          Journey Timeline
        </span>
        <button
          type="button"
          onClick={clearStoredEvents}
          style={{
            background: "none",
            border: "1px solid rgba(232,55,90,0.4)",
            color: "rgba(255,107,138,0.9)",
            borderRadius: "999px",
            padding: "0.25rem 0.7rem",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      <ul style={{ display: "flex", flexDirection: "column", gap: 0, listStyle: "none", padding: 0, margin: 0 }}>
        {STEP_ORDER.filter((name) => events.some((e) => e.event === name)).map((name, idx, arr) => {
          const last = idx === arr.length - 1;
          const matching = events.filter((e) => e.event === name);
          const label =
            name === "NO_CLICKED"
              ? `Clicked No ${matching.length}×`
              : name === "LOVEBOOK_PAGE_VIEWED"
                ? `Viewed ${matching.length}/${LOVE_BOOK_CONTENT.length} pages`
                : name === "YES_CLICKED"
                  ? `Clicked Yes (after ${
                      (matching[0]?.metadata?.noClicksBeforeYes as number | undefined) ?? 0
                    } No's)`
                  : describeEvent(matching[0]!);
          return (
            <li key={name} style={{ display: "flex", gap: "0.7rem", minHeight: "2rem", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: last ? "#e8375a" : "#c8973a",
                    boxShadow: last ? "0 0 8px rgba(232,55,90,0.8)" : "none",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                {!last && <div style={{ width: 1, flex: 1, background: "rgba(200,151,58,0.25)" }} />}
              </div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.92rem",
                  color: last ? "#ff6b8a" : "rgba(255,245,240,0.85)",
                  paddingBottom: "0.6rem",
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <p
        style={{
          marginTop: "0.75rem",
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.72rem",
          fontStyle: "italic",
          color: "rgba(200,151,58,0.55)",
          lineHeight: 1.5,
        }}
      >
        Recorded only on this device (local storage). No data is shared or sent
        anywhere.
      </p>
    </div>
  );
}
