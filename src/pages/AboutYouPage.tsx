import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeartScene from "../components/HeartScene";
import CreatorBadge from "../components/CreatorBadge";
import { PERSONALIZATION as P } from "../config/personalization";
import { getRecipientName } from "../utils/personalization";
import { trackEvent, EVENTS } from "../utils/analytics";
import { submitMessage } from "../utils/backend";

type BookAnswers = {
  favouriteColour: string;
  favouriteFood: string;
  ourSong: string;
  dreamDestination: string;
  bucketList: string;
  favouriteSeason: string;
  hobby: string;
  dayRhythm: string;
  loveLanguage: string;
  favouriteMemory: string;
  ourSomething: string;
};

const EMPTY_ANSWERS: BookAnswers = {
  favouriteColour: "",
  favouriteFood: "",
  ourSong: "",
  dreamDestination: "",
  bucketList: "",
  favouriteSeason: "",
  hobby: "",
  dayRhythm: "",
  loveLanguage: "",
  favouriteMemory: "",
  ourSomething: "",
};

type Section = {
  id: keyof BookAnswers;
  label: string;
  emoji: string;
  placeholder: string;
  kind?: "text" | "select";
  options?: string[];
};

const SECTIONS: Array<{ title: string; emoji: string; fields: Section[] }> = [
  {
    title: "The colours of you",
    emoji: "🌈",
    fields: [
      {
        id: "favouriteColour",
        label: "Favourite colour",
        emoji: "🎨",
        placeholder: "The colour that instantly makes you smile...",
      },
      {
        id: "favouriteFood",
        label: "Favourite food",
        emoji: "🍜",
        placeholder: "The dish I must learn to make perfectly...",
      },
      {
        id: "ourSong",
        label: "A song that feels like us",
        emoji: "🎶",
        placeholder: "Hum it, I dare you...",
      },
    ],
  },
  {
    title: "The dreams you carry",
    emoji: "☁️",
    fields: [
      {
        id: "dreamDestination",
        label: "Dream destination",
        emoji: "✈️",
        placeholder: "Where should we run away to first?",
      },
      {
        id: "bucketList",
        label: "One wild dream of yours",
        emoji: "🌟",
        placeholder: "The thing you'd do if nothing could stop you...",
      },
      {
        id: "favouriteSeason",
        label: "Favourite season",
        emoji: "🌸",
        placeholder: "The one that feels like warm hugs...",
      },
    ],
  },
  {
    title: "The little things",
    emoji: "🕰️",
    fields: [
      {
        id: "hobby",
        label: "A hobby you love (or want to try)",
        emoji: "🎨",
        placeholder: "Something that makes time disappear...",
      },
      {
        id: "dayRhythm",
        label: "Morning person or night owl?",
        emoji: "🌙",
        kind: "select",
        options: [
          "Morning person ☀️",
          "Night owl 🌙",
          "In love with both 💫",
          "Depends on the day 😅",
        ],
        placeholder: "Choose one...",
      },
      {
        id: "loveLanguage",
        label: "Your love language",
        emoji: "💝",
        kind: "select",
        options: [
          "Words of affirmation 💬",
          "Quality time 🌿",
          "Receiving gifts 🎁",
          "Acts of service 🤲",
          "Physical touch 🤍",
        ],
        placeholder: "How your heart feels loved...",
      },
    ],
  },
  {
    title: "Us",
    emoji: "💍",
    fields: [
      {
        id: "favouriteMemory",
        label: "Your favourite memory with me",
        emoji: "📸",
        placeholder: "The one you replay when you miss me...",
      },
      {
        id: "ourSomething",
        label: "One thing you want us to do together",
        emoji: "💫",
        placeholder: "A promise I'll hold on to...",
      },
    ],
  },
];

const SAMPLE_STEPPER = ["🌈", "☁️", "🕰️", "💍"];

const MINIMUM_ANSWERS = 5;

const FUNNY_JOKES: Array<(left: number) => string> = [
  () =>
    "Real talk: I Googled \"how to be less obvious about loving someone\" — the first result was this website. Finish the book, it's the only way out. 😉",
  () =>
    "Fun fact: I finished writing these questions and forgot the one about how beautiful you are. Complete all 11 and I'll add it to the next edition. 💁",
  () =>
    "Interviewer: \"What's your biggest weakness?\" Me: \"Leaving an answer box empty in the Book of You.\" — that's the joke. It also tests your weakness for me. 😂",
  (left) =>
    `A wise man once said the best way to know someone's favourite food is to ask. The wise man was lazy — but you're only ${left} page${left === 1 ? "" : "s"} from done. Let's get there together. 🚀`,
  () =>
    "Scientists discovered a new planet and named it \"Book of You\". It was only 6 pages full, so they're demanding 11. It's for science, obviously. 🌍",
  () =>
    "Breaking news: local heart skips a beat with every filled page. Headlines tomorrow: \"Unofficial survey suggests 100% of answers make someone very happy.\" 📰",
];

function BookField({
  field,
  value,
  onChange,
}: {
  field: Section;
  value: string;
  onChange: (v: string) => void;
}) {
  const base = {
    width: "100%",
    padding: "0.65rem 0.8rem",
    borderRadius: "10px",
    border: "1px solid rgba(200,151,58,0.3)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff5f0",
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <label style={{ display: "block", textAlign: "left" }}>
      <span
        style={{
          display: "block",
          fontFamily: "'Playfair Display',serif",
          fontSize: "0.85rem",
          color: "#ff6b8a",
          marginBottom: "0.3rem",
        }}
      >
        {field.emoji} {field.label}
      </span>
      {field.kind === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...base,
            cursor: "pointer",
            appearance: "auto",
          }}
        >
          <option value="" disabled style={{ color: "rgba(255,245,240,0.4)" }}>
            {field.placeholder}
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt} style={{ color: "#fff5f0", background: "#2a0f14" }}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={80}
          style={base}
        />
      )}
    </label>
  );
}

export default function AboutYouPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<BookAnswers>(EMPTY_ANSWERS);
  const [submitted, setSubmitted] = useState(false);
  const [storedLocally, setStoredLocally] = useState(false);
  const [sentRemotely, setSentRemotely] = useState(false);

  useEffect(() => {
    trackEvent(EVENTS.ABOUT_YOU_OPENED);
  }, []);

  if (!P.enableAboutYouPage) return null;

  const recipientName = getRecipientName();
  const set = (key: keyof BookAnswers) => (value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0)
    .length;
  const totalFields = SECTIONS.reduce((n, s) => n + s.fields.length, 0);
  const progress = Math.round((answeredCount / totalFields) * 100);
  const leftToMinimum = MINIMUM_ANSWERS - answeredCount;
  const missingForFullBook = totalFields - answeredCount;

  let hint: { text: string; tone: "lock" | "joke" | "full" };
  if (answeredCount < MINIMUM_ANSWERS) {
    hint = {
      text: `At least ${MINIMUM_ANSWERS} little pages before I can seal it — only ${leftToMinimum} more... 🌙`,
      tone: "lock",
    };
  } else if (answeredCount < totalFields) {
    hint = {
      text: FUNNY_JOKES[
        (answeredCount - MINIMUM_ANSWERS) % FUNNY_JOKES.length
      ](missingForFullBook),
      tone: "joke",
    };
  } else {
    hint = {
      text: "Every page is written — a whole book about you. And I'll treasure it like I do your laugh. 💝",
      tone: "full",
    };
  }

  const buildSummary = () => {
    const lines: string[] = [];
    SECTIONS.forEach((section) => {
      const filled = section.fields
        .map((f) => {
          const value = answers[f.id].trim();
          return value ? `${f.emoji} ${f.label}: ${value}` : null;
        })
        .filter(Boolean);
      if (filled.length > 0) {
        lines.push(`${section.emoji} ${section.title}`);
        lines.push(...(filled as string[]));
      }
    });
    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < MINIMUM_ANSWERS) return;
    const summary = buildSummary();
    const hasAnything = answeredCount > 0;

    let localOk: boolean;
    try {
      window.sessionStorage.setItem(
        "surprise_about_you",
        JSON.stringify({ ...answers, at: new Date().toISOString() }),
      );
      localOk = true;
    } catch {
      localOk = false;
    }

    if (hasAnything) {
      submitMessage(
        `📖 The Book of You — ${recipientName}\n\n${summary}`,
        { type: "about_you" },
      ).then((res) => setSentRemotely(res.ok));
    }

    trackEvent(EVENTS.ABOUT_YOU_SUBMITTED, {
      metadata: { answeredCount, hasAnything },
    });

    setStoredLocally(localOk);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", position: "relative" }}>
        <HeartScene />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "4rem 2rem",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              width: "min(420px, 90vw)",
              textAlign: "center",
              padding: "2rem 1.4rem",
              borderRadius: "20px",
              background: "rgba(26,10,15,0.55)",
              border: "1px solid rgba(200,151,58,0.25)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              animation: "fadeInUp 0.4s ease-out",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>🦋</p>
            <p
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.1rem",
                color: "#ff6b8a",
                marginBottom: "0.6rem",
              }}
            >
              The Book of You is complete, {recipientName}!
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.95rem",
                fontStyle: "italic",
                color: "rgba(255,245,240,0.7)",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              Every tiny answer turned into a page — and now it lives in a little
              corner reserved only for you. 🌙
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
              {sentRemotely
                ? "Your pages reached Aditya Raikar 💌"
                : storedLocally
                  ? `Saved on this device for ${P.creatorName} to read.`
                  : "Your pages were noted. Thank you for being part of this little world."}
            </p>
            <button
              onClick={() => navigate("/yes")}
              style={{
                padding: "0.6rem 1.4rem",
                borderRadius: "999px",
                background: "linear-gradient(135deg,#e8375a,#b01840)",
                border: "none",
                color: "#fff5f0",
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              ↢ Back to our story 💕
            </button>
          </div>
          <CreatorBadge />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <HeartScene />

      {/* Lord Krishna background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <img
          src="/Lord/kanha.png"
          alt=""
          style={{
            height: "85vh",
            maxWidth: "90vw",
            objectFit: "contain",
            opacity: 0.07,
            filter: "blur(1px) drop-shadow(0 0 60px rgba(200,151,58,0.15))",
            userSelect: "none",
          }}
        />
      </div>

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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4rem 2rem 8rem",
          gap: "1.6rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "560px" }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "0.9rem",
              letterSpacing: "0.25em",
              color: "#c8973a",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            — the last page of the LoveBook —
          </p>
          <h1
            style={{
              fontFamily: "'Great Vibes', 'Playfair Display', serif",
              fontSize: "clamp(2rem, 6vw, 3.4rem)",
              color: "#ffd98a",
              lineHeight: 1.2,
              textShadow: "0 2px 18px rgba(232,55,90,0.35)",
              marginBottom: "0.8rem",
            }}
          >
            {P.aboutYouTitle}
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#ff6b8a",
              fontStyle: "italic",
            }}
          >
            {P.aboutYouSubtitle.replace(/\{recipientName\}/g, recipientName)}
          </p>
        </div>

        {/* Progress */}
        <div style={{ width: "min(420px, 90vw)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "rgba(240,200,120,0.7)",
              fontFamily: "'Cormorant Garamond',serif",
              marginBottom: "0.35rem",
            }}
          >
            <span>
              {SAMPLE_STEPPER.slice(0, Math.max(1, Math.ceil(progress / 25)))
                .join(" ")}
            </span>
            <span>{answeredCount}/{totalFields} answered</span>
          </div>
          <div
            style={{
              height: "5px",
              borderRadius: "999px",
              background: "rgba(200,151,58,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: "999px",
                background: "linear-gradient(90deg,#c8973a,#e8375a)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.2rem",
          }}
        >
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              style={{
                width: "min(420px, 90vw)",
                padding: "1.4rem 1.2rem",
                borderRadius: "20px",
                background: "rgba(26,10,15,0.55)",
                border: "1px solid rgba(200,151,58,0.25)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1rem",
                  color: "#fff5f0",
                  marginBottom: "1rem",
                }}
              >
                {section.emoji} {section.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {section.fields.map((field) => (
                  <BookField
                    key={field.id}
                    field={field}
                    value={answers[field.id]}
                    onChange={set(field.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              width: "min(420px, 90vw)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <button
              type="submit"
              disabled={answeredCount < MINIMUM_ANSWERS}
              onMouseEnter={(e) => {
                if (answeredCount >= MINIMUM_ANSWERS) {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 8px 24px rgba(232,55,90,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
              style={{
                padding: "0.75rem 1.8rem",
                borderRadius: "999px",
                background:
                  answeredCount < MINIMUM_ANSWERS
                    ? "rgba(200,151,58,0.12)"
                    : "linear-gradient(135deg,#e8375a,#b01840)",
                border: answeredCount < MINIMUM_ANSWERS
                  ? "1px solid rgba(200,151,58,0.25)"
                  : "none",
                color: answeredCount < MINIMUM_ANSWERS
                  ? "rgba(255,245,240,0.4)"
                  : "#fff5f0",
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "1rem",
                cursor:
                  answeredCount < MINIMUM_ANSWERS ? "not-allowed" : "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              Seal it with a kiss 💋
            </button>
            <p
              key={hint.text.slice(0, 24)}
              style={{
                minHeight: "2.4rem",
                maxWidth: "420px",
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.85rem",
                fontStyle: "italic",
                lineHeight: 1.5,
                color:
                  hint.tone === "lock"
                    ? "rgba(200,151,58,0.85)"
                    : hint.tone === "joke"
                      ? "#ff6b8a"
                      : "#ffd98a",
                animation:
                  hint.tone === "full"
                    ? "hintGlow 2.5s ease-in-out infinite"
                    : "fadeInUp 0.4s ease-out",
              }}
            >
              {hint.text}
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.8rem",
                fontStyle: "italic",
                color: "rgba(200,151,58,0.7)",
                maxWidth: "380px",
                lineHeight: 1.6,
              }}
            >
              {P.aboutYouPrivacyNote.replace(/\{creatorName\}/g, P.creatorName)}
            </p>
          </div>
        </form>

        <CreatorBadge />
      </div>
    </div>
  );
}