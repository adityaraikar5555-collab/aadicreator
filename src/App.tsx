import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Envelope from "./components/Envelope";
import HeartScene from "./components/HeartScene";
import HeroSection from "./components/HeroSection";
import MusicPlayer from "./components/MusicPlayer";
import CreatorBadge from "./components/CreatorBadge";
import YesPage from "./pages/YesPage";
import CreatorPage from "./pages/CreatorPage";
import { PERSONALIZATION as P } from "./config/personalization";
import { trackEvent, EVENTS } from "./utils/analytics";
// Home Page
function HomePage() {
  return (
    <>
      <HeartScene />
      <HeroSection />
      <Envelope />
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
      {/* Music Player outside routes - stays on all pages*/}
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/yes" element={<YesPage />} />
        {P.enableCreatorPage && (
          <Route path="/creator" element={<CreatorPage />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
