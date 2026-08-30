import { useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import ShareButton from "../components/ShareButton";
import CreatorBadge from "../components/CreatorBadge";
import JourneyTimeline from "../components/JourneyTimeline";
import ResponsesPanel from "../components/ResponsesPanel";
import HeartScene from "../components/HeartScene";

/**
 * Creator-only page to generate a personalized shareable link.
 * Kept deliberately simple and client-side. No analytics/recipient data is
 * exposed publicly here beyond what the creator already configured.
 */
export default function CreatorPage() {
  const [name, setName] = useState(P.recipientName);

  return (
    <div style={{ minHeight: "100vh", position: "relative", padding: "3rem 1.5rem 6rem" }}>
      <HeartScene />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.8rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(200,151,58,0.6)",
              marginBottom: "0.6rem",
            }}
          >
            — creator mode —
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
              color: "#fff5f0",
            }}
          >
            Generate a personalized link
          </h1>
        </div>

        <div
          style={{
            width: "min(360px, 90vw)",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            padding: "1.4rem",
            borderRadius: "20px",
            background: "rgba(26,10,15,0.7)",
            border: "1px solid rgba(200,151,58,0.3)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <label
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.85rem",
              color: "rgba(200,151,58,0.85)",
            }}
            htmlFor="creator-recipient"
          >
            Recipient Name
          </label>
          <input
            id="creator-recipient"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ananya"
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "10px",
              border: "1px solid rgba(200,151,58,0.3)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff5f0",
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "1rem",
              outline: "none",
            }}
          />
        </div>

        <ShareButton recipientName={name} expanded />

        <ResponsesPanel />

        <JourneyTimeline />

        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.8rem",
            fontStyle: "italic",
            color: "rgba(255,245,240,0.45)",
            maxWidth: "400px",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Copy the link and send it through WhatsApp or Instagram DM. The
          recipient will see {name ? `"${name}"` : "their name"} personalized
          throughout the experience — no other data is ever put into the URL.
        </p>

        <CreatorBadge />
      </div>
    </div>
  );
}
