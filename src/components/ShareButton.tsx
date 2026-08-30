import { useCallback, useState } from "react";
import { makeRecipientLink, copyText, shareWhatsApp, nativeShare } from "../utils/share";
import { PERSONALIZATION as P } from "../config/personalization";

interface ShareButtonProps {
  /** Optional specific recipient; defaults to configured recipientName. */
  recipientName?: string;
  /** If true, renders a labeled panel (used on /creator). If false, compact chip. */
  expanded?: boolean;
}

/**
 * A small "share this surprise" control. Designed for the creator's own use
 * when building a personalized link; deliberately unobtrusive so recipients
 * don't see analytics/tracking controls.
 */
export default function ShareButton({ recipientName, expanded = false }: ShareButtonProps) {
  const name = recipientName ?? P.recipientName;
  const [link, setLink] = useState<string>(() => (typeof window === "undefined" ? "" : makeRecipientLink(name)));
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    setLink(makeRecipientLink(name));
    setCopied(false);
  }, [name]);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [link]);

  const handleWhatsApp = useCallback(() => {
    shareWhatsApp(link);
  }, [link]);

  const handleNative = useCallback(async () => {
    const ok = await nativeShare(link);
    if (ok) setCopied(false);
  }, [link]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title="Copy personalized link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.45rem 0.9rem",
          borderRadius: "999px",
          background: "rgba(200,151,58,0.12)",
          border: "1px solid rgba(200,151,58,0.35)",
          color: "#f0c878",
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.8rem",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        {copied ? "Copied ✓" : "🔗 Share"}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
        width: "min(360px, 90vw)",
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
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.1rem",
          color: "#fff5f0",
        }}
      >
        Share this surprise ✨
      </div>

      <label style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.85rem", color: "rgba(200,151,58,0.85)" }}>
        Recipient name
      </label>
      <input
        value={name}
        onChange={() => {/* link rebuilds from the name passed in */}}
        readOnly
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
        aria-label="Recipient name"
      />

      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.85rem", color: "rgba(200,151,58,0.85)", marginBottom: "0.4rem" }}>
          Generated link
        </div>
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: "10px",
            border: "1px solid rgba(200,151,58,0.2)",
            background: "rgba(0,0,0,0.25)",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.75rem",
            color: "rgba(255,245,240,0.8)",
            wordBreak: "break-all",
            lineHeight: 1.5,
          }}
        >
          {link}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg,#e8375a,#b01840)",
            border: "none",
            color: "#fff5f0",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.9rem",
            cursor: "pointer",
            flex: "1 1 auto",
          }}
        >
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "999px",
            background: "rgba(37,211,102,0.15)",
            border: "1px solid rgba(37,211,102,0.4)",
            color: "#4cd97f",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.9rem",
            cursor: "pointer",
            flex: "1 1 auto",
          }}
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleNative}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#f0c878",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.9rem",
            cursor: "pointer",
            flex: "1 1 auto",
          }}
        >
          Share…
        </button>
        <button
          type="button"
          onClick={regenerate}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "999px",
            background: "transparent",
            border: "1px solid rgba(200,151,58,0.3)",
            color: "rgba(255,245,240,0.7)",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "0.9rem",
            cursor: "pointer",
            flex: "1 1 auto",
          }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
