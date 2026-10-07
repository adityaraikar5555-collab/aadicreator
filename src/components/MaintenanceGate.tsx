import { useState, type ReactNode } from "react";
import { PERSONALIZATION as P } from "../config/personalization";

const ADMIN_BYPASS_KEY = "wyg_admin_maintenance_bypass";

function isBypassed(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_BYPASS_KEY) === "true";
  } catch {
    return false;
  }
}

function setBypassed() {
  try {
    sessionStorage.setItem(ADMIN_BYPASS_KEY, "true");
  } catch {
    /* ignore storage errors */
  }
}

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const [bypassed, setBypassedState] = useState(isBypassed);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctKey = P.adminBypassKey || P.appPassword;
    if (adminPass.trim().toLowerCase() === correctKey.toLowerCase()) {
      setBypassed();
      setBypassedState(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // If maintenance mode is disabled or bypassed by admin, render the regular app flow
  if (!P.enableMaintenanceMode || bypassed) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background:
          "radial-gradient(ellipse at 50% 35%, #230b12 0%, #15060b 55%, #0b0306 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        overflowY: "auto",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Background ambient glowing rings */}
      <div
        style={{
          position: "fixed",
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232, 55, 90, 0.12) 0%, rgba(200, 151, 58, 0.05) 50%, transparent 70%)",
          pointerEvents: "none",
          animation: "ambientPulse 6s ease-in-out infinite",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          textAlign: "center",
          maxWidth: "460px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Status Chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1rem",
            borderRadius: "999px",
            background: "rgba(232, 55, 90, 0.12)",
            border: "1px solid rgba(232, 55, 90, 0.35)",
            color: "#ff8fa3",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            boxShadow: "0 0 20px rgba(232, 55, 90, 0.15)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ff4d6d",
              boxShadow: "0 0 8px #ff4d6d",
              animation: "blinkDot 1.8s infinite ease-in-out",
            }}
          />
          Temporarily Stopped
        </div>

        {/* Center Pause / Shield Emblem */}
        <div
          style={{
            position: "relative",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            padding: "6px",
            background:
              "linear-gradient(135deg, #c8973a, #f0c878, #e8375a, #8f122e)",
            boxShadow:
              "0 0 50px rgba(232, 55, 90, 0.35), 0 0 20px rgba(200, 151, 58, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "emblemFloat 4s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "linear-gradient(145deg, #1d070e, #100408)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(240, 200, 120, 0.4)",
              boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                filter: "drop-shadow(0 2px 8px rgba(232, 55, 90, 0.6))",
              }}
            >
              ⏸️
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(38, 14, 22, 0.85), rgba(20, 7, 12, 0.95))",
            border: "1px solid rgba(200, 151, 58, 0.3)",
            borderRadius: "24px",
            padding: "2rem 1.75rem",
            boxShadow:
              "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "1.1rem",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
              color: "#ffd98a",
              margin: 0,
              fontStyle: "italic",
              fontWeight: 700,
              lineHeight: 1.25,
              textShadow: "0 2px 16px rgba(232, 55, 90, 0.35)",
            }}
          >
            {P.maintenanceTitle}
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              color: "#ffe3ea",
              margin: 0,
              fontStyle: "italic",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {P.maintenanceSubtitle}
          </p>

          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(200, 151, 58, 0.4), transparent)",
              margin: "0.25rem 0",
            }}
          />

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem",
              color: "rgba(255, 245, 240, 0.75)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {P.maintenanceNotice}
          </p>

          {/* Punchline Banner */}
          {P.maintenancePunchline && (
            <div
              style={{
                margin: "0.4rem 0",
                padding: "0.75rem 1rem",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, rgba(232, 55, 90, 0.2), rgba(143, 18, 46, 0.35))",
                border: "1px solid rgba(232, 55, 90, 0.45)",
                color: "#ff8fa3",
                fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                fontSize: "clamp(1.2rem, 3.5vw, 1.5rem)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textShadow: "0 0 15px rgba(232, 55, 90, 0.6)",
                boxShadow: "0 4px 20px rgba(232, 55, 90, 0.2)",
              }}
            >
              ✨ {P.maintenancePunchline} ✨
            </div>
          )}

          {/* Admin bypass accordion toggle */}
          <div style={{ marginTop: "0.5rem" }}>
            {!showAdminLogin ? (
              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240, 200, 120, 0.7)",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.95rem",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "0.4rem 0.8rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#ffd98a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(240, 200, 120, 0.7)";
                }}
              >
                🔐 Administrator / Creator Access
              </button>
            ) : (
              <form
                onSubmit={handleAdminLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  marginTop: "0.5rem",
                  paddingTop: "0.8rem",
                  borderTop: "1px dashed rgba(200, 151, 58, 0.25)",
                  animation: shake ? "gateShake 0.5s ease" : undefined,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "0.9rem",
                    color: "rgba(240, 200, 120, 0.9)",
                    fontStyle: "italic",
                  }}
                >
                  Enter Admin Passkey to preview site:
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="password"
                    autoFocus
                    value={adminPass}
                    onChange={(e) => {
                      setAdminPass(e.target.value);
                      setError(false);
                    }}
                    placeholder="Admin secret key..."
                    aria-label="Admin Password"
                    style={{
                      flex: 1,
                      padding: "0.65rem 0.9rem",
                      borderRadius: "999px",
                      border: error
                        ? "1px solid #e8375a"
                        : "1px solid rgba(200, 151, 58, 0.4)",
                      background: "rgba(255, 245, 240, 0.08)",
                      color: "#fff5f0",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.65rem 1.2rem",
                      borderRadius: "999px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #c8973a, #9e6d1c)",
                      color: "#1a080c",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Enter
                  </button>
                </div>

                {error && (
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.9rem",
                      color: "#ff6b8a",
                      margin: 0,
                    }}
                  >
                    Incorrect admin passkey.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setError(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer credits */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.9rem",
            color: "rgba(255, 245, 240, 0.45)",
            fontStyle: "italic",
          }}
        >
          {P.creatorSignature}
        </div>
      </div>

      <style>{`
        @keyframes emblemFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }
        @keyframes blinkDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
        }
        @keyframes ambientPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes gateShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
