import { useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import PhotoPopup from "./PhotoPopup";

/**
 * A badge for her — an exact replica of the creator badge. A small circular
 * avatar + name. Clicking it opens a circular popup of the photo (with zoom),
 * just like tapping an Instagram profile picture.
 */
export default function RecipientBadge() {
  const [imgError, setImgError] = useState(false);
  const [viewing, setViewing] = useState(false);

  const name = getRecipientName();

  if (!P.recipientPhoto) return null;

  const showImage = P.recipientPhoto && !imgError;
  const hasPhoto = Boolean(P.recipientPhoto);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div
        role="contentinfo"
        aria-label={`Made for ${name}`}
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
            src={P.recipientPhoto as string}
            alt={`Photo of ${name} — tap to view`}
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
            {hasPhoto ? "Made for" : "Made with ❤️ for"}
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
            {name}
          </div>
        </div>
      </div>

      {viewing && showImage && (
        <PhotoPopup
          key={name}
          photo={P.recipientPhoto as string}
          name={name}
          tagline={P.heroFooter.replace(/\{recipientName\}/g, name)}
          onClose={() => setViewing(false)}
        />
      )}
    </>
  );
}