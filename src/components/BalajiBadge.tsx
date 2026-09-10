import { useState } from "react";
import { createPortal } from "react-dom";

type Badge = {
  src: string;
  alt: string;
  name: string;
  initial: string;
};

const BADGES: Badge[] = [
  {
    src: "/Lord/guru.jpg",
    alt: "Guru",
    name: "Guru",
    initial: "G",
  },
  {
    src: "/creator/balaji-padmavathi13sq.png",
    alt: "Balaji Padmavathi",
    name: "Balaji Padmavathi",
    initial: "B",
  },
];

function BadgeAvatar({ badge }: { badge: Badge }) {
  const [imgError, setImgError] = useState(false);
  const [viewing, setViewing] = useState(false);

  return (
    <>
      <div
        onClick={() => setViewing(true)}
        role="img"
        aria-label={`Made by ${badge.name}`}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer wrapper for the ring + pulse + sparkles */}
        <div style={{ position: "relative", width: 42, height: 42 }}>
          {/* Spinning gradient ring */}
          <div
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, #e8375a, #c8973a, #ffd98a, #e8375a)",
              animation: "balajiSpin 3s linear infinite",
            }}
          />
          {/* Inner mask */}
          <div
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: "50%",
              background: "rgba(26,10,15,0.9)",
            }}
          />
          {/* Pulse glow */}
          <div
            style={{
              position: "absolute",
              inset: -7,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(232,55,90,0.3) 0%, transparent 70%)",
              animation: "balajiPulse 2.5s ease-in-out infinite",
            }}
          />
          {/* Photo */}
          {!imgError ? (
            <img
              src={badge.src}
              alt={badge.alt}
              onError={() => setImgError(true)}
              loading="lazy"
              width={42}
              height={42}
              style={{
                position: "relative",
                width: 42,
                height: 42,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(200,151,58,0.55)",
                zIndex: 1,
                background: "rgba(200,151,58,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                position: "relative",
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#e8375a,#b01840)",
                color: "#fff5f0",
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                border: "2px solid rgba(200,151,58,0.55)",
                zIndex: 1,
              }}
            >
              {badge.initial}
            </div>
          )}
          {/* Sparkle dots */}
          <span className="balaji-sparkle bs1" />
          <span className="balaji-sparkle bs2" />
          <span className="balaji-sparkle bs3" />
        </div>
      </div>

{/* Tap-to-view popup — portaled to <body> so it is truly viewport-fixed */}
      {viewing &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Photo of ${badge.name}`}
            onClick={() => setViewing(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              cursor: "pointer",
              animation: "balajiFade 0.25s ease",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.9rem",
                animation: "balajiZoom 0.25s ease",
              }}
            >
              <div
                style={{
                  width: "min(42vw, 220px)",
                  height: "min(42vw, 220px)",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid rgba(200,151,58,0.6)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  background: "rgba(200,151,58,0.15)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={badge.src}
                  alt={badge.name}
                  width={220}
                  height={220}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#fff5f0",
                  }}
                >
                  {badge.name}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(255,245,240,0.5)",
                  marginTop: "0.2rem",
                }}
              >
                tap anywhere to close
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * Small circular creator badges pinned to the top of every page.
 * No text — just perfectly round photos with animated ring, pulse, and sparkle.
 * Each can be tapped to view a larger version (Instagram-story style).
 */
export default function BalajiBadge() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
        }}
      >
        {BADGES.map((badge) => (
          <BadgeAvatar key={badge.name} badge={badge} />
        ))}
      </div>

      <style>{`
        @keyframes balajiSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes balajiPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
        @keyframes balajiFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes balajiZoom {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes balajiSparkle {
          0%, 100% { opacity: 0; transform: scale(0) translate(0,0); }
          50% { opacity: 1; transform: scale(1) translate(var(--tx), var(--ty)); }
        }
        .balaji-sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 2;
        }
        .balaji-sparkle.bs1 {
          top: -2px; right: -2px;
          background: #ffd98a;
          --tx: 3px; --ty: -5px;
          animation: balajiSparkle 2s ease-in-out 0s infinite;
        }
        .balaji-sparkle.bs2 {
          bottom: 2px; left: -3px;
          background: #e8375a;
          --tx: -4px; --ty: 3px;
          animation: balajiSparkle 2s ease-in-out 0.7s infinite;
        }
        .balaji-sparkle.bs3 {
          top: 50%; right: -4px;
          background: #c8973a;
          --tx: 5px; --ty: -2px;
          animation: balajiSparkle 2s ease-in-out 1.3s infinite;
        }
      `}</style>
    </>
  );
}