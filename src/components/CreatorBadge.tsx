import { useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";

/**
 * A small, elegant creator watermark — a circular avatar + name.
 * Clicking the avatar (when a photo exists) opens a medium circular
 * popup of the photo, just like tapping an Instagram profile picture.
 */
export default function CreatorBadge() {
  const [imgError, setImgError] = useState(false);
  const [viewing, setViewing] = useState(false);

  if (!P.enableCreatorBadge) return null;

  const showImage = P.creatorPhoto && !imgError;
  const hasPhoto = Boolean(P.creatorPhoto);
  const initial = (P.creatorName || P.creatorFullName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <div
        role="contentinfo"
        aria-label={`Made by ${P.creatorName}`}
        onClick={() => {
          if (showImage) setViewing(true);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.7rem",
          padding: "0.55rem 1rem 0.55rem 0.55rem",
          borderRadius: "999px",
          background: "rgba(26,10,15,0.55)",
          border: "1px solid rgba(200,151,58,0.25)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          maxWidth: "100%",
          cursor: showImage ? "pointer" : "default",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          if (!showImage) return;
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 6px 24px rgba(0,0,0,0.35)";
        }}
      >
        {/* Circular avatar (falls back to initial on missing image) */}
        {showImage ? (
          <img
            src={P.creatorPhoto as string}
            alt={`Photo of ${P.creatorName} — tap to view`}
            onError={() => setImgError(true)}
            loading="lazy"
            width={34}
            height={34}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid rgba(200,151,58,0.4)",
              flexShrink: 0,
              background: "rgba(200,151,58,0.15)",
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#e8375a,#b01840)",
              color: "#fff5f0",
              fontFamily: "'Playfair Display',serif",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: "1px solid rgba(200,151,58,0.45)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}

        <div style={{ lineHeight: 1.2, textAlign: "left" }}>
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(200,151,58,0.75)",
              fontFamily: "'Cormorant Garamond',serif",
            }}
          >
            {hasPhoto ? "Made by" : "Created with ❤️ by"}
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              color: "#fff5f0",
              fontFamily: "'Playfair Display',serif",
              whiteSpace: "nowrap",
            }}
          >
            {P.creatorName}
          </div>
        </div>
      </div>

      {/* Medium circular popup — like tapping an Instagram profile picture */}
      {viewing && showImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${P.creatorName}`}
          onClick={() => setViewing(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            cursor: "pointer",
            animation: "badgeFade 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.9rem",
              animation: "badgeZoom 0.25s ease",
            }}
          >
            <img
              src={P.creatorPhoto as string}
              alt={P.creatorName}
              width={220}
              height={220}
              style={{
                width: "min(42vw, 220px)",
                height: "min(42vw, 220px)",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(200,151,58,0.6)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                background: "rgba(200,151,58,0.15)",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#fff5f0",
                }}
              >
                {P.creatorName}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(200,151,58,0.8)",
                  marginTop: "0.2rem",
                }}
              >
                {P.creatorRole}
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
        </div>
      )}

      <style>{`
        @keyframes badgeFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes badgeZoom {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
