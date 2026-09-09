import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import { trackEvent, EVENTS } from "../utils/analytics";
import { submitMessage } from "../utils/backend";

const ROMANTIC_MESSAGES: Record<number, { text: string; emoji: string }> = {
  1: { text: "It's a start... maybe next time I'll do better 💭", emoji: "💭" },
  2: { text: "Sweet, but I know we can do better together 💫", emoji: "💫" },
  3: { text: "A lovely little story, just like ours ✨", emoji: "✨" },
  4: { text: "Almost perfect — just like you 🌙", emoji: "🌙" },
  5: { text: "A fairytale forever, my love 💖", emoji: "💖" },
};

const HEART_PATH =
  "M256 448l-30.164-27.211C118.718 322.927 48 258.636 48 179.834 48 114.545 98.545 64 163.834 64c36.805 0 72.187 17.188 92.166 43.818C275.979 81.188 311.361 64 348.166 64 413.455 64 464 114.545 464 179.834c0 78.802-70.718 143.093-177.836 241.113L256 448z";

function HeartStar({
  active,
  preview,
  onClick,
  onHover,
  onLeave,
}: {
  active: boolean;
  preview: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const filled = active || preview;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label="Rate our love story"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        position: "relative",
        transition: "transform 0.2s ease",
        transform: active ? "scale(1.15)" : "scale(1)",
      }}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 512 512"
        style={{
          filter: filled
            ? "drop-shadow(0 0 12px rgba(232,55,90,0.7)) drop-shadow(0 0 24px rgba(200,151,58,0.4))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          transition: "filter 0.3s ease, transform 0.3s ease",
          transform: filled ? "translateY(-4px)" : "translateY(0)",
        }}
      >
        <path
          d={HEART_PATH}
          fill={filled ? "url(#heartGradFilled)" : "url(#heartGradInactive)"}
          style={{
            transition: "all 0.3s ease",
          }}
        />
        {/* Dim golden overlay marks a hover preview (not yet a selection). */}
        {preview && !active && (
          <path
            d={HEART_PATH}
            fill="rgba(200,151,58,0.35)"
            style={{ transition: "all 0.3s ease" }}
          />
        )}
      </svg>
    </button>
  );
}

function SparkleParticle({
  x,
  y,
  delay,
}: {
  x: number;
  y: number;
  delay: number;
}) {
  return (
    <span
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffd98a, #e8375a 70%, transparent)",
        boxShadow: "0 0 8px rgba(232,55,90,0.7)",
        pointerEvents: "none",
        animation: `sparkleFloat 1s ${delay}s ease-out forwards`,
      }}
    />
  );
}

export default function StarFeedback() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(-1);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const [storedLocally, setStoredLocally] = useState(false);
  const [sentRemotely, setSentRemotely] = useState(false);
  const starRowRef = useRef<HTMLDivElement>(null);
  const sparkleIdRef = useRef(0);
  const navigate = useNavigate();

  const spawnSparkles = useCallback(() => {
    const rect = starRowRef.current?.getBoundingClientRect();
    const newSparkles: typeof sparkles = [];
    for (let i = 0; i < 10; i++) {
      sparkleIdRef.current++;
      newSparkles.push({
        id: sparkleIdRef.current,
        x: rect ? Math.random() * rect.width : 50,
        y: rect ? Math.random() * rect.height : 0,
        delay: Math.random() * 0.35,
      });
    }
    setSparkles((prev) => [...prev.slice(-20), ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) =>
        prev.filter((s) => !newSparkles.some((n) => n.id === s.id)),
      );
    }, 1600);
  }, []);

  if (!P.enableFeedback) return null;

  const displayRating = hoveredStar >= 0 ? hoveredStar + 1 : rating;
  const messageData = displayRating > 0 ? ROMANTIC_MESSAGES[displayRating] : null;

  const handleStarClick = (index: number) => {
    const newRating = index + 1;
    setRating(newRating);
    spawnSparkles();
    trackEvent(EVENTS.FEEDBACK_SUBMITTED, {
      metadata: { rating: newRating, hasMessage: false },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    const hasMessage = message.trim().length > 0;
    const feedbackText = hasMessage
      ? `[${rating}/5] ${message.trim()}`
      : `[${rating}/5]`;

    let localOk: boolean;
    try {
      window.sessionStorage.setItem(
        "surprise_feedback",
        JSON.stringify({
          rating,
          text: hasMessage ? message.trim() : "",
          at: new Date().toISOString(),
        }),
      );
      localOk = true;
    } catch {
      localOk = false;
    }

    submitMessage(feedbackText).then((res) => {
      setSentRemotely(res.ok);
    });

    trackEvent(EVENTS.FEEDBACK_SUBMITTED, {
      metadata: { rating, hasMessage },
    });

    setStoredLocally(localOk);
    setSubmitted(true);
  };

  if (submitted) {
    const thankMsg = ROMANTIC_MESSAGES[rating];
    return (
      <div
        style={{
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
          padding: "2rem 1.4rem",
          borderRadius: "20px",
          background: "rgba(26,10,15,0.55)",
          border: "1px solid rgba(200,151,58,0.25)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>
          {thankMsg?.emoji ?? "💖"}
        </p>
        <p
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.1rem",
            color: "#ff6b8a",
            marginBottom: "0.5rem",
          }}
        >
          Thank you, {getRecipientName()}!
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
            ? "Your rating reached Aditya Raikar 💌"
            : storedLocally
              ? `Saved on this device for ${P.creatorName} to see.`
              : "Your rating was noted. Thank you for being part of this little world."}
        </p>

        {P.enableAboutYouPage && (
          <button
            type="button"
            onClick={() => navigate("/about-you")}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 24px rgba(232,55,90,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            style={{
              marginTop: "1.2rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              background:
                "linear-gradient(135deg,rgba(124,45,18,0.9),rgba(92,26,26,0.9))",
              border: "1px solid rgba(200,151,58,0.5)",
              color: "#fff5f0",
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {P.aboutYouCtaText}
          </button>
        )}
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shared gradients — defined once so all hearts reference the same ones. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="heartGradFilled" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b8a" />
            <stop offset="50%" stopColor="#e8375a" />
            <stop offset="100%" stopColor="#c8973a" />
          </linearGradient>
          <linearGradient id="heartGradInactive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,245,240,0.15)" />
            <stop offset="100%" stopColor="rgba(200,151,58,0.1)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sparkle particles */}
      {sparkles.map((s) => (
        <SparkleParticle key={s.id} x={s.x} y={s.y} delay={s.delay} />
      ))}

      <p
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.05rem",
          color: "#fff5f0",
          marginBottom: "0.3rem",
        }}
      >
        Rate Our Love Story 🌟
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: "rgba(200,151,58,0.7)",
          marginBottom: "1.2rem",
        }}
      >
        How many hearts does our story deserve?
      </p>

      {/* Star hearts row */}
      <div
        ref={starRowRef}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "1rem",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <HeartStar
            key={i}
            active={i < rating}
            preview={hoveredStar >= 0 && i <= hoveredStar}
            onClick={() => handleStarClick(i)}
            onHover={() => setHoveredStar(i)}
            onLeave={() => setHoveredStar(-1)}
          />
        ))}
      </div>

      {/* Romantic message */}
      <div
        style={{
          minHeight: "2.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.8rem",
        }}
      >
        {messageData && (
          <p
            key={displayRating}
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.95rem",
              fontStyle: "italic",
              color: "#ff6b8a",
              animation: "fadeInUp 0.4s ease-out",
            }}
          >
            {messageData.text}
          </p>
        )}
      </div>

      {rating > 0 && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            animation: "fadeInUp 0.4s ease-out",
          }}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me more... (optional)"
            rows={2}
            maxLength={300}
            aria-label="Additional feedback"
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
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px rgba(232,55,90,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            Submit Rating 💕
          </button>
        </form>
      )}
    </div>
  );
}