import { useState } from "react";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import { trackEvent, EVENTS } from "../utils/analytics";
import { submitMessage } from "../utils/backend";

/**
 * Optional final message form shown near the end of the experience.
 *
 * Privacy note: the message itself is stored ONLY locally (and marked as
 * such), and is additionally sent to the creator's Supabase backend ONLY when
 * `backend.enabled` is true and configured. It is never placed into analytics
 * events.
 */
export default function FinalResponse() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [storedLocally, setStoredLocally] = useState(false);
  const [sentRemotely, setSentRemotely] = useState(false);

  if (!P.enableFinalResponse) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasMessage = message.trim().length > 0;

    // Store locally only — explicitly labeled, never silently transmitted.
    let localOk = false;
    if (hasMessage) {
      try {
        window.sessionStorage.setItem(
          "surprise_final_message",
          JSON.stringify({ text: message.trim(), at: new Date().toISOString() }),
        );
        localOk = true;
      } catch {
        localOk = false;
      }
      // Also deliver it to the creator's backend when configured.
      submitMessage(message.trim()).then((res) => {
        setSentRemotely(res.ok);
      });
    }

    trackEvent(EVENTS.FINAL_RESPONSE_SUBMITTED, {
      metadata: { hasMessage },
    });

    setStoredLocally(localOk && hasMessage);
    setSubmitted(true);
    if (hasMessage) setMessage("");
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", maxWidth: "420px", width: "100%" }}>
        <p
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.1rem",
            color: "#ff6b8a",
            marginBottom: "0.5rem",
          }}
        >
          Thank you, {getRecipientName()} 💖
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: "rgba(255,245,240,0.6)",
            lineHeight: 1.6,
          }}
        >
          {sentRemotely
            ? "Your message reached {creatorName} 💌"
            : storedLocally
              ? "Your message was saved on this device for {creatorName} to read."
                  .replace("{creatorName}", P.creatorName)
              : "Your response was noted. Thank you for being part of this little world."}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "min(420px, 90vw)",
        textAlign: "center",
        padding: "1.6rem 1.4rem",
        borderRadius: "20px",
        background: "rgba(26,10,15,0.55)",
        border: "1px solid rgba(200,151,58,0.25)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.05rem",
          color: "#fff5f0",
          marginBottom: "0.4rem",
        }}
      >
        Want to leave me a little message? 💌
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: "rgba(200,151,58,0.7)",
          marginBottom: "1rem",
        }}
      >
        It will stay private — visible only to {P.creatorName} once a personal
        backend is enabled. Nothing leaves your device silently.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something..."
          rows={3}
          maxLength={500}
          aria-label="Leave a message"
          style={{
            padding: "0.7rem 0.8rem",
            borderRadius: "10px",
            border: "1px solid rgba(200,151,58,0.3)",
            background: "rgba(0,0,0,0.25)",
            color: "#fff5f0",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.95rem",
            resize: "vertical",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg,#e8375a,#b01840)",
            border: "none",
            color: "#fff5f0",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.95rem",
            cursor: "pointer",
            alignSelf: "center",
          }}
        >
          Send ❤️
        </button>
      </form>
    </div>
  );
}
