import { useState, type ReactNode } from "react";
import { PERSONALIZATION as P } from "../config/personalization";

const UNLOCKED_KEY = "wyg_unlocked";

function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCKED_KEY) === "true";
  } catch {
    return false;
  }
}

function setUnlocked() {
  try {
    sessionStorage.setItem(UNLOCKED_KEY, "true");
  } catch {
    /* ignore storage errors */
  }
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlockedState] = useState(isUnlocked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === P.appPassword.toLowerCase()) {
      setUnlocked();
      setUnlockedState(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (P.enablePasswordGate && !unlocked) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background:
            "radial-gradient(ellipse at 50% 35%, #2a0f16 0%, #1a0a0f 60%, #10060a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            textAlign: "center",
            maxWidth: "340px",
            width: "100%",
          }}
        >
          {/* Heart seal icon */}
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.6rem",
              background:
                "linear-gradient(135deg, rgba(232,55,90,0.25), rgba(200,151,58,0.18))",
              border: "1px solid rgba(232,55,90,0.35)",
              boxShadow:
                "0 0 40px rgba(232,55,90,0.25), inset 0 0 25px rgba(232,55,90,0.15)",
            }}
          >
            💝
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                color: "#ffd98a",
                fontStyle: "italic",
                textShadow: "0 2px 18px rgba(232,55,90,0.3)",
              }}
            >
              A Secret Awaits You
            </h1>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.05rem",
                color: "rgba(255,245,240,0.7)",
                fontStyle: "italic",
                lineHeight: 1.7,
              }}
            >
              Enter the password I whispered to you, to step inside ✨
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              width: "100%",
              animation: shake ? "gateShake 0.5s ease" : undefined,
            }}
          >
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
              placeholder="Your secret key..."
              aria-label="Password"
              style={{
                width: "100%",
                padding: "0.85rem 1.1rem",
                borderRadius: "999px",
                border: error
                  ? "1px solid #e8375a"
                  : "1px solid rgba(200,151,58,0.45)",
                background: "rgba(255,245,240,0.06)",
                color: "#fff5f0",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                textAlign: "center",
                outline: "none",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                letterSpacing: "0.15em",
                boxShadow: error
                  ? "0 0 20px rgba(232,55,90,0.25)"
                  : undefined,
              }}
            />

            {error && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.95rem",
                  color: "#ff6b8a",
                  fontStyle: "italic",
                }}
              >
                Hmm, that's not the right key... try again 💕
              </p>
            )}

            <button
              type="submit"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 12px 30px rgba(232,55,90,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 25px rgba(232,55,90,0.35)";
              }}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #e8375a, #b01840)",
                color: "#fff5f0",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.12em",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                boxShadow: "0 8px 25px rgba(232,55,90,0.35)",
              }}
            >
              Unlock 💕
            </button>
          </div>

          <style>{`
            @keyframes gateShake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-10px); }
              40% { transform: translateX(10px); }
              60% { transform: translateX(-6px); }
              80% { transform: translateX(6px); }
            }
          `}</style>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
