import { useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import PhotoPopup from "./PhotoPopup";

/**
 * The recipient's photo. Tapping it opens a circular popup with zoom —
 * pinch / double-tap / wheel to zoom in, tap the backdrop or press Escape
 * to close.
 */
export default function RecipientPhoto({
  size = 140,
  eager = false,
}: {
  size?: number;
  eager?: boolean;
}) {
  const [viewing, setViewing] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!P.recipientPhoto || imgError) return null;

  const name = getRecipientName();

  return (
    <>
      <img
        src={P.recipientPhoto}
        alt={`${name} — tap to view`}
        onClick={() => setViewing(true)}
        onError={() => setImgError(true)}
        loading={eager ? "eager" : "lazy"}
        role="button"
        tabIndex={0}
        aria-label={`Open photo of ${name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setViewing(true);
          }
        }}
        style={{
          width: size,
          height: size,
          aspectRatio: "1 / 1",
          flexShrink: 0,
          borderRadius: "50%",
          objectFit: "cover",
          cursor: "pointer",
          border: "3px solid rgba(200,151,58,0.6)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)";
          (e.currentTarget as HTMLImageElement).style.boxShadow =
            "0 12px 40px rgba(0,0,0,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLImageElement).style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.4)";
        }}
      />

      {/* Circular popup with zoom */}
      {viewing && (
        <PhotoPopup
          key={name}
          photo={P.recipientPhoto}
          name={name}
          tagline={P.heroFooter.replace(/\{recipientName\}/g, name)}
          onClose={() => setViewing(false)}
        />
      )}
    </>
  );
}