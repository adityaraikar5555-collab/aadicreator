import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Envelope from "./components/Envelope";
import HeartScene from "./components/HeartScene";
import HeroSection from "./components/HeroSection";
import MusicPlayer from "./components/MusicPlayer";
import CreatorBadge from "./components/CreatorBadge";
import PasswordGate from "./components/PasswordGate";
import YesPage from "./pages/YesPage";
import CreatorPage from "./pages/CreatorPage";
import { PERSONALIZATION as P } from "./config/personalization";
import { trackEvent, EVENTS } from "./utils/analytics";
// Home Page
const FLOATING_HINTS = [
  { text: "Don't miss the LoveBook 💝", left: "6%", delay: "0s", duration: "9s" },
  { text: "Say Yes ♥", left: "26%", delay: "2.5s", duration: "11s" },
  { text: "Go for it ✨", left: "58%", delay: "1.2s", duration: "10s" },
  { text: "Psst... the book awaits 📖", left: "74%", delay: "4s", duration: "12s" },
];

function FloatingHints() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: 0,
        right: 0,
        height: "0",
        zIndex: 3,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {FLOATING_HINTS.map((h) => (
        <span
          key={h.text}
          style={{
            position: "absolute",
            left: h.left,
            bottom: "-30px",
            whiteSpace: "nowrap",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(0.78rem, 1.5vw, 1rem)",
            fontStyle: "italic",
            color: "rgba(240,200,120,0.85)",
            background: "rgba(26,10,15,0.6)",
            backdropFilter: "blur(2px)",
            padding: "0.35rem 0.8rem",
            borderRadius: "999px",
            border: "1px solid rgba(232,55,90,0.3)",
            animation: `sparkleFloat ${h.duration} ease-in-out ${h.delay} infinite`,
          }}
        >
          {h.text}
        </span>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <>
      <HeartScene />
      <HeroSection />
      <Envelope />
      <FloatingHints />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "1rem 1.5rem 4rem",
        }}
      >
        <CreatorBadge />
      </div>
    </>
  );
}
function App() {
  // Record app open (once per session page load).
  useEffect(() => {
    trackEvent(EVENTS.APP_OPENED);
  }, []);

  return (
    <BrowserRouter>
      <PasswordGate>
        {/* Music Player outside routes - stays on all pages*/}
        <MusicPlayer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/yes" element={<YesPage />} />
          {P.enableCreatorPage && (
            <Route path="/creator" element={<CreatorPage />} />
          )}
        </Routes>
      </PasswordGate>
    </BrowserRouter>
  );
}

export default App;
