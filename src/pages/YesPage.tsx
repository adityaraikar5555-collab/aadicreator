import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import HeartScene from "../components/HeartScene";
import LoveTimer from "./LoveTimer";
import LoveBook, { type LoveBookHandle } from "../components/LoveBook";
import CreatorBadge from "../components/CreatorBadge";
import FinalResponse from "../components/FinalResponse";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import { trackEvent, EVENTS } from "../utils/analytics";

export default function YesPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const emojiRef = useRef<HTMLSpanElement>(null);
  const bookRef = useRef<LoveBookHandle>(null);
  const bookSectionRef = useRef<HTMLDivElement>(null);

  const openNotebook = () => {
    bookRef.current?.open();
    // Gently scroll the notebook into view so she can see it open.
    requestAnimationFrame(() => {
      bookSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
  const recipientName = getRecipientName();
  const titleText = P.yesTitle.replace(/\{recipientName\}/g, recipientName);

  useEffect(() => {
    trackEvent(EVENTS.YES_PAGE_OPENED);

    // Animate the title letters

    if (titleRef.current) {
      const titleAnim = animate(titleRef.current.querySelectorAll("span"), {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(60),
        ease: "outExpo",
        duration: 800,
      });
      let subtitleAnim: ReturnType<typeof animate> | undefined;
      let emojiAnim: ReturnType<typeof animate> | undefined;
      if (subtitleRef.current) {
        subtitleAnim = animate(subtitleRef.current, {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: 1200,
          duration: 800,
          ease: "outExpo",
        });
      }
      if (emojiRef.current)
        emojiAnim = animate(emojiRef.current, {
          opacity: [0, 1],
          translateY: [30, 0],
          delay: 1800,
          duration: 800,
          ease: "outExpo",
        });
      return () => {
        titleAnim.pause();
        if (subtitleAnim) subtitleAnim.pause();
        if (emojiAnim) emojiAnim.pause();
      };
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <HeartScene />

      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(8,2,5,0.55) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4rem 2rem 8rem",
          gap: "2rem",
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.9rem",
              letterSpacing: "0.25em",
              color: "#c8973a",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            — she said yes —
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <h1
              ref={titleRef}
              style={{
                fontFamily: "'Great Vibes', 'Playfair Display', serif",
                fontSize: "clamp(2rem, 8vw, 5.5rem)",
                color: "#ffd98a",
                lineHeight: 1.15,
                letterSpacing: "0.02em",
                fontStyle: "italic",
                textShadow: "0 2px 18px rgba(232,55,90,0.35)",
                marginBottom: "1rem",
              }}
            >
              {titleText.split("").map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: 0,
                    background:
                      "linear-gradient(120deg, #f5c15c 0%, #fff0c4 45%, #e8a84f 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </h1>
            {/* Emoji animated separately */}
            <span
              ref={emojiRef}
              style={{
                fontSize: "clamp(1.8em, 4vw, 4.5rem)",
                opacity: 0,
                display: "inline-block",
                wordBreak: "keep-all",
                whiteSpace: "nowrap",
              }}
            >
              💝
            </span>
          </div>

          <p
            ref={subtitleRef}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1rem, 2vw, 1.3rem)",
              color: "#ff6b8a",
              fontStyle: "italic",
              opacity: 0,
            }}
          >
            {P.yesSubtitle}
          </p>
        </div>

        {/* Love Timer */}
        <LoveTimer />

        {/* Book Section */}
        <div
          ref={bookSectionRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
          }}
        >
          <button
            onClick={openNotebook}
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1rem,2.4vw,1.2rem)",
              color: "#fff5f0",
              padding: "0.85rem 2rem",
              borderRadius: "999px",
              border: "1px solid rgba(200,151,58,0.5)",
              background:
                "linear-gradient(135deg,rgba(124,45,18,0.9),rgba(92,26,26,0.9))",
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              cursor: "pointer",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 14px 36px rgba(0,0,0,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 10px 30px rgba(0,0,0,0.45)";
            }}
          >
            📖 Open our Notebook
          </button>
          <LoveBook ref={bookRef} />
        </div>

        {/* Final message form */}
        <FinalResponse />

        {/* Creator signature + badge */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.2rem",
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(0.9rem, 2.2vw, 1.05rem)",
              fontStyle: "italic",
              color: "rgba(200,151,58,0.8)",
              textAlign: "center",
              maxWidth: "420px",
              lineHeight: 1.6,
            }}
          >
            {P.creatorSignature.replace(/\{recipientName\}/g, recipientName)}
          </p>
          <CreatorBadge />
        </div>
      </div>
    </div>
  );
}
