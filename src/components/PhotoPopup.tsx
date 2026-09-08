import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface PhotoPopupProps {
  photo: string;
  name: string;
  tagline: string;
  onClose: () => void;
}

interface Transform {
  s: number; // scale (1..MAX_SCALE)
  x: number; // pan px
  y: number; // pan px
}

const MAX_SCALE = 4;
const BASE_BOX = 220; // resting circular size
const MIN_BOX = 220;
const MAX_BOX = 520;
const DOUBLE_TAP_MS = 300;
const TAP_MAX_MS = 320;
const TAP_MOVE_PX = 12;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function clampT(
  s: number,
  x: number,
  y: number,
  box: number,
): Transform {
  if (s <= 1) return { s: 1, x: 0, y: 0 };
  const m = ((box * (s - 1)) / 2) * 0.9;
  return { s, x: clamp(x, -m, m), y: clamp(y, -m, m) };
}

/**
 * The recipient photo popup with two stages:
 *   1. Resting circle (220px) — tap again to zoom.
 *   2. Big circle — pinch / double-tap / mouse-wheel to zoom into the
 *      high-res photo, drag to pan. Tap once-ish to come back out, tap the
 *      backdrop or press Escape to close entirely.
 */
export default function PhotoPopup({
  photo,
  name,
  tagline,
  onClose,
}: PhotoPopupProps) {
  const [zoomed, setZoomed] = useState(false);
  const [t, setT] = useState<Transform>({ s: 1, x: 0, y: 0 });
  const [hint, setHint] = useState(false);

  const tRef = useRef(t);
  const zoomedRef = useRef(zoomed);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef({
    startT: { s: 1, x: 0, y: 0 },
    startDist: 0,
    startMid: { x: 0, y: 0 },
  });
  const tap = useRef({
    startX: 0,
    startY: 0,
    startAt: 0,
    lastTapAt: 0,
    timer: 0,
  });
  const hintTimer = useRef(0);

  const [box] = useState(() =>
    clamp(
      Math.max(
        Math.min(window.innerWidth * 0.86, window.innerHeight * 0.72),
        MIN_BOX,
      ),
      MIN_BOX,
      MAX_BOX,
    ),
  );

  // Escape closes.
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Keep the latest transform/zoom reachable from the gesture handlers.
  useEffect(() => {
    tRef.current = t;
    zoomedRef.current = zoomed;
  });

  function showHint() {
    setHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(false), 1800);
  }

  // Mouse-wheel zoom on the circle (desktop nicety).
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cur = tRef.current;
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left - r.width / 2;
      const py = e.clientY - r.top - r.height / 2;
      const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
      const s = clamp(cur.s * factor, 1, MAX_SCALE);
      if (s === cur.s) return;
      if (s > 1 && !zoomedRef.current) {
        setZoomed(true);
        showHint();
      }
      const k = s / cur.s;
      const nx = px * (1 - k) + cur.x * k;
      const ny = py * (1 - k) + cur.y * k;
      setT(clampT(s, nx, ny, box));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [box]);

  function center() {
    const el = circleRef.current;
    if (!el) return { cx: 0, cy: 0 };
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  function startPinch() {
    const pts = [...pointers.current.values()];
    const c = center();
    pinch.current.startT = tRef.current;
    pinch.current.startDist = Math.hypot(
      pts[0].x - pts[1].x,
      pts[0].y - pts[1].y,
    );
    pinch.current.startMid = {
      x: (pts[0].x + pts[1].x) / 2 - c.cx,
      y: (pts[0].y + pts[1].y) / 2 - c.cy,
    };
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    circleRef.current?.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      tap.current.startX = e.clientX;
      tap.current.startY = e.clientY;
      tap.current.startAt = e.timeStamp;
    } else if (pointers.current.size === 2) {
      window.clearTimeout(tap.current.timer);
      startPinch();
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const nx = e.clientX;
    const ny = e.clientY;
    pointers.current.set(e.pointerId, { x: nx, y: ny });
    const pts = [...pointers.current.values()];
    const c = center();

    if (pts.length >= 2 && pinch.current.startDist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const s = clamp(
        pinch.current.startT.s * (dist / pinch.current.startDist),
        1,
        MAX_SCALE,
      );
      if (s > 1 && !zoomedRef.current) {
        setZoomed(true);
        showHint();
      }
      const midX = (pts[0].x + pts[1].x) / 2 - c.cx;
      const midY = (pts[0].y + pts[1].y) / 2 - c.cy;
      const dx = midX - pinch.current.startMid.x;
      const dy = midY - pinch.current.startMid.y;
      setT(
        clampT(
          s,
          pinch.current.startT.x + dx,
          pinch.current.startT.y + dy,
          box,
        ),
      );
    } else if (pts.length === 1) {
      const cur = tRef.current;
      setT(clampT(cur.s, cur.x + (nx - prev.x), cur.y + (ny - prev.y), box));
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    circleRef.current?.releasePointerCapture?.(e.pointerId);
    const wasTwo = pointers.current.size === 2;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;

    // Pinch end — collapse stray pan when scale returns to 1.
    setT((cur) => (cur.s <= 1 ? { s: 1, x: 0, y: 0 } : cur));

    const now = e.timeStamp;
    const isQuickTap =
      now - tap.current.startAt < TAP_MAX_MS &&
      Math.hypot(e.clientX - tap.current.startX, e.clientY - tap.current.startY) <
        TAP_MOVE_PX &&
      !wasTwo;

    if (!isQuickTap) return;

    if (now - tap.current.lastTapAt < DOUBLE_TAP_MS) {
      tap.current.lastTapAt = 0;
      window.clearTimeout(tap.current.timer);
      toggleDeepZoom(e.clientX, e.clientY);
      return;
    }
    tap.current.lastTapAt = now;

    // Single tap — delay slightly so a second tap can make a double-tap.
    window.clearTimeout(tap.current.timer);
    tap.current.timer = window.setTimeout(() => {
      const cur = tRef.current;
      if (cur.s > 1) {
        setT({ s: 1, x: 0, y: 0 });
      } else {
        onClose();
      }
    }, DOUBLE_TAP_MS);
  };

  function toggleDeepZoom(px: number, py: number) {
    const cur = tRef.current;
    if (cur.s > 1) {
      setT({ s: 1, x: 0, y: 0 });
      setZoomed(false);
      return;
    }
    const c = center();
    const s = 2.6;
    setT(clampT(s, (px - c.cx) * (1 - s), (py - c.cy) * (1 - s), box));
    setZoomed(true);
    showHint();
  }

  const displayBox = zoomed ? box : BASE_BOX;
  const cursor = zoomed && t.s > 1 ? "grab" : "zoom-in";

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Photo of ${name}`}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          cursor: "zoom-out",
          animation: "photoFade 0.2s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close photo"
          style={{
            position: "fixed",
            top: "1rem",
            right: "1.15rem",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "1px solid rgba(200,151,58,0.4)",
            background: "rgba(0,0,0,0.4)",
            color: "rgba(255,245,240,0.8)",
            fontSize: "0.8rem",
            lineHeight: 1,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10000,
          }}
        >
          ✕
        </button>

        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.9rem",
            animation: "photoIn 0.25s ease",
          }}
        >
          {/* Circle clip — guarantees whatever is on screen stays circular */}
          <div
            ref={circleRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: "relative",
              width: displayBox,
              height: displayBox,
              minWidth: displayBox,
              minHeight: displayBox,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid rgba(200,151,58,0.6)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              background: "rgba(200,151,58,0.15)",
              flexShrink: 0,
              cursor,
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTapHighlightColor: "transparent",
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            <img
              src={photo}
              alt={name}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
                transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`,
                transformOrigin: "center",
                willChange: "transform",
              }}
            />
            {hint && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: "14px",
                  width: "max-content",
                  maxWidth: "86%",
                  textAlign: "center",
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.82rem",
                  fontStyle: "italic",
                  color: "#fff5f0",
                  background: "rgba(0,0,0,0.5)",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  pointerEvents: "none",
                  lineHeight: 1.3,
                }}
              >
                {t.s > 1 ? "double-tap to zoom out ✨" : "pinch or double-tap to zoom ✨"}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#fff5f0",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "0.8rem",
                fontStyle: "italic",
                color: "rgba(200,151,58,0.8)",
                marginTop: "0.2rem",
              }}
            >
              {tagline}
            </div>
            {!zoomed && (
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "0.72rem",
                  fontStyle: "italic",
                  color: "rgba(255,245,240,0.5)",
                  marginTop: "0.3rem",
                }}
              >
                tap the photo to zoom 🔍
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes photoFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes photoIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}