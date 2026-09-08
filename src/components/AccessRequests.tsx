import { useEffect, useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import { getResponses, type ResponseRow } from "../utils/backend";

interface AccessRequest {
  id: string;
  name: string;
  note: string;
  at: string;
}

/**
 * Creator-only panel listing "request access" submissions from the password
 * gate. Each shows who asked and why — so the creator can DM them the secret
 * key if he wants to let them in.
 */
export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getResponses(500).then((rows) => {
      if (!active) return;
      const list = (rows as ResponseRow[])
        .filter((r) => r.type === "access-request")
        .map((r) => ({
          id: r.id ?? String(Math.random()),
          name: (r.metadata?.name as string) || r.recipient || "Someone",
          note: (r.metadata?.note as string) || "",
          at: r.created_at ?? "",
        }));
      setRequests(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div
      style={{
        width: "min(460px, 92vw)",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        padding: "1.4rem",
        borderRadius: "20px",
        background: "rgba(26,10,15,0.7)",
        border: "1px solid rgba(200,151,58,0.3)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.05rem",
            color: "#fff5f0",
          }}
        >
          Access requests 💌
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.78rem",
            fontStyle: "italic",
            color: "rgba(200,151,58,0.7)",
            marginTop: "0.3rem",
            lineHeight: 1.5,
          }}
        >
          {requests.length} person{requests.length > 1 ? "s" : ""} asked to
          open the surprise. Send the secret key to anyone you want to let in.
        </p>
      </div>

      {requests.map((r) => (
        <div
          key={r.id}
          style={{
            padding: "0.9rem 1rem",
            borderRadius: "14px",
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(200,151,58,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#ffd98a",
              }}
            >
              {r.name}
            </span>
            {r.at && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.72rem",
                  color: "rgba(255,245,240,0.4)",
                }}
              >
                {new Date(r.at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {r.note && (
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "rgba(255,245,240,0.8)",
                marginTop: "0.4rem",
                lineHeight: 1.5,
              }}
            >
              “{r.note}”
            </p>
          )}
        </div>
      ))}

      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.78rem",
          fontStyle: "italic",
          color: "rgba(255,245,240,0.45)",
          textAlign: "center",
          marginTop: "0.2rem",
        }}
      >
        Tip: the password is “{P.appPassword}” — share it in {P.creatorName}’s
        DMs.
      </p>
    </div>
  );
}