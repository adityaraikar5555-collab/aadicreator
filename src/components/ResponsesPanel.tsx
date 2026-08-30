import { useEffect, useState, useCallback } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import {
  getResponses,
  getMessages,
  type ResponseRow,
  type MessageRow,
} from "../utils/backend";

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function hasBackend(): boolean {
  return Boolean(
    P.backend.enabled && P.backend.supabaseUrl && P.backend.supabaseAnonKey,
  );
}

export default function ResponsesPanel() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasBackend()) return;
    setLoading(true);
    const [r, m] = await Promise.all([getResponses(), getMessages()]);
    // Newest first.
    setResponses(
      [...r].sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      ),
    );
    setMessages(
      [...m].sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      ),
    );
    setLoaded(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!hasBackend()) {
    return (
      <div
        style={{
          width: "min(420px, 90vw)",
          padding: "1.4rem",
          borderRadius: "20px",
          background: "rgba(26,10,15,0.7)",
          border: "1px solid rgba(200,151,58,0.3)",
          color: "rgba(255,245,240,0.6)",
          textAlign: "center",
          fontFamily: "'Cormorant Garamond',serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
        }}
      >
        Backend not configured yet — see README "Backend setup" to start
        receiving her answer and message here.
      </div>
    );
  }

  const yesCount = responses.filter((r) => r.type === "yes").length;
  const noCount = responses.filter((r) => r.type === "no").length;

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
          marginBottom: "0.8rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.1rem",
          }}
        >
          Collected Responses
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          style={{
            background: "none",
            border: "1px solid rgba(232,55,90,0.4)",
            color: "rgba(255,107,138,0.9)",
            borderRadius: "999px",
            padding: "0.25rem 0.7rem",
            fontFamily: "'Cormorant Garamond',serif",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <Stat label="Yes" value={yesCount} color="#ff6b8a" />
        <Stat label="No" value={noCount} color="#c8973a" />
        <Stat label="Messages" value={messages.length} color="#fff5f0" />
      </div>

      {/* Messages */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "0.95rem",
            color: "rgba(200,151,58,0.9)",
            marginBottom: "0.4rem",
          }}
        >
          💌 Messages
        </div>
        {messages.length === 0 ? (
          <Empty text="No messages yet." />
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(200,151,58,0.2)",
                borderRadius: "12px",
                padding: "0.7rem 0.8rem",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.95rem",
                  color: "#fff5f0",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.7rem",
                  color: "rgba(200,151,58,0.6)",
                  marginTop: "0.3rem",
                }}
              >
                {m.recipient ? `${m.recipient} · ` : ""}
                {formatTime(m.created_at)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yes/No answers + events timeline */}
      <div>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "0.95rem",
            color: "rgba(200,151,58,0.9)",
            marginBottom: "0.4rem",
          }}
        >
          💘 Answers &amp; Activity
        </div>
        {responses.length === 0 ? (
          <Empty text={loaded ? "No activity yet." : "Loading…"} />
        ) : (
          responses.slice(0, 40).map((r) => (
            <div
              key={r.id ?? r.created_at}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.6rem",
                padding: "0.35rem 0",
                borderBottom: "1px solid rgba(200,151,58,0.12)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.88rem",
                  color: "#fff5f0",
                }}
              >
                {formatAnswer(r)}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.72rem",
                  color: "rgba(255,245,240,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(r.created_at)}
              </span>
            </div>
          ))
        )}
      </div>

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
        Read directly from your Supabase database. Only you (the creator) can
        see this page in production — keep the link private.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 auto",
        textAlign: "center",
        padding: "0.5rem",
        borderRadius: "10px",
        background: "rgba(0,0,0,0.25)",
        border: "1px solid rgba(200,151,58,0.2)",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.3rem",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255,245,240,0.55)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function formatAnswer(r: ResponseRow): string {
  const type = r.type ?? "";
  if (type === "yes" || type === "no") {
    const after = (r.metadata?.noClicksBeforeYes as number | undefined) ?? 0;
    return type === "yes"
      ? `Said YES${after ? ` (after ${after} No's)` : ""}`
      : "Clicked No";
  }
  if (type === "event") {
    const map: Record<string, string> = {
      ENVELOPE_OPENED: "Opened envelope",
      LETTER_VIEWED: "Read letter",
      YES_PAGE_OPENED: "Reached the Yes page",
      CELEBRATION_STARTED: "Reached celebration",
      LOVEBOOK_OPENED: "Opened LoveBook",
      MUSIC_STARTED: "Started music",
    };
    return map[r.value ?? ""] ?? (r.value ?? type);
  }
  return type;
}

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontStyle: "italic",
        fontSize: "0.85rem",
        color: "rgba(255,245,240,0.45)",
        padding: "0.4rem 0",
      }}
    >
      {text}
    </div>
  );
}
