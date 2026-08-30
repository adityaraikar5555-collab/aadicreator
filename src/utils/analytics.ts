/**
 * ============================================================
 *  LOCAL-FIRST, PRIVACY-CONSCIOUS WORKFLOW TRACKING
 * ============================================================
 *
 * This is a passive, anonymous event tracker. It records ONLY the
 * interactions with this website that are necessary for the experience
 * (envelope opened, no clicked, yes clicked, etc.).
 *
 * It must NEVER collect:
 *   - IP addresses
 *   - precise location
 *   - browser fingerprints
 *   - passwords / contacts / private messages
 *   - unrelated browsing history
 *
 * For now events are stored locally in sessionStorage so the recipient's
 * journey can be understood after a refresh on the SAME device. Nothing is
 * transmitted anywhere.
 *
 * The abstraction is written so a RemoteAnalyticsProvider (Supabase,
 * Firebase, or a Vercel serverless `/api/events` endpoint) can be added later
 * by implementing the same interface — WITHOUT rewriting any component.
 */

import { PERSONALIZATION } from "../config/personalization";

const DEFAULT_TRACKING_ENABLED = PERSONALIZATION.enableWorkflowTracking;

export type AnalyticsEventName =
  | "APP_OPENED"
  | "HERO_VIEWED"
  | "ENVELOPE_OPENED"
  | "LETTER_VIEWED"
  | "NO_CLICKED"
  | "YES_CLICKED"
  | "CELEBRATION_STARTED"
  | "YES_PAGE_OPENED"
  | "LOVEBOOK_OPENED"
  | "LOVEBOOK_PAGE_VIEWED"
  | "MUSIC_STARTED"
  | "MUSIC_PAUSED"
  | "FINAL_RESPONSE_SUBMITTED";
// Lowercase aliases are kept for callers who prefer that style.
export const EVENTS = {
  APP_OPENED: "APP_OPENED" as const,
  HERO_VIEWED: "HERO_VIEWED" as const,
  ENVELOPE_OPENED: "ENVELOPE_OPENED" as const,
  LETTER_VIEWED: "LETTER_VIEWED" as const,
  NO_CLICKED: "NO_CLICKED" as const,
  YES_CLICKED: "YES_CLICKED" as const,
  CELEBRATION_STARTED: "CELEBRATION_STARTED" as const,
  YES_PAGE_OPENED: "YES_PAGE_OPENED" as const,
  LOVEBOOK_OPENED: "LOVEBOOK_OPENED" as const,
  LOVEBOOK_PAGE_VIEWED: "LOVEBOOK_PAGE_VIEWED" as const,
  MUSIC_STARTED: "MUSIC_STARTED" as const,
  MUSIC_PAUSED: "MUSIC_PAUSED" as const,
  FINAL_RESPONSE_SUBMITTED: "FINAL_RESPONSE_SUBMITTED" as const,
} as const;

export interface TrackEvent {
  id: string;
  sessionId: string;
  event: AnalyticsEventName;
  timestamp: string; // ISO 8601
  metadata: Record<string, unknown>;
}

/** Abstraction a future remote provider can implement. */
export interface AnalyticsProvider {
  track(event: Omit<TrackEvent, "id" | "sessionId" | "timestamp">): void;
  getEvents(): TrackEvent[];
  clear(): void;
}

const STORAGE_KEY = "surprise_session_events";
const SESSION_KEY = "surprise_session_id";
const TRACKING_KEY = "surprise_tracking_enabled";

const MAX_STORED_EVENTS = 500;

function safeGetItem(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable — never crash */
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateSessionId(): string {
  const existing = safeGetItem(SESSION_KEY);
  if (existing) return existing;
  const id = randomId();
  safeSetItem(SESSION_KEY, id);
  return id;
}

class LocalStorageAnalyticsProvider implements AnalyticsProvider {
  private enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
    // Persist the toggle so it survives a refresh.
    safeSetItem(TRACKING_KEY, enabled ? "on" : "off");
  }

  track(
    event: Omit<TrackEvent, "id" | "sessionId" | "timestamp">,
  ): void {
    if (!this.enabled) return;

    const sessionId = getOrCreateSessionId();
    const record: TrackEvent = {
      id: randomId(),
      sessionId,
      event: event.event,
      timestamp: new Date().toISOString(),
      metadata: event.metadata ?? {},
    };

    try {
      const raw = safeGetItem(STORAGE_KEY);
      const parsed: TrackEvent[] = raw ? (JSON.parse(raw) as TrackEvent[]) : [];
      parsed.push(record);
      // Keep the timeline bounded.
      const trimmed = parsed.slice(-MAX_STORED_EVENTS);
      safeSetItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* storage failure is non-fatal */
    }
  }

  getEvents(): TrackEvent[] {
    try {
      const raw = safeGetItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TrackEvent[]) : [];
    } catch {
      return [];
    }
  }

  clear(): void {
    safeRemoveItem(STORAGE_KEY);
  }
}

class NoopAnalyticsProvider implements AnalyticsProvider {
  track(): void {}
  getEvents(): TrackEvent[] {
    return [];
  }
  clear(): void {}
}

let enabled: boolean;
let provider: AnalyticsProvider;

/** Initialize tracking once. Safe to call multiple times. */
function init(): AnalyticsProvider {
  if (provider) return provider;

  // Respect the runtime toggle (persisted) but default to the config value.
  const storedFlag = safeGetItem(TRACKING_KEY);
  const configEnabled = DEFAULT_TRACKING_ENABLED;
  const flag =
    storedFlag === null ? configEnabled : storedFlag === "on";

  enabled = flag;
  provider = enabled
    ? new LocalStorageAnalyticsProvider(enabled)
    : new NoopAnalyticsProvider();
  return provider;
}

export interface TrackOptions {
  /** Metadata included with the event (must NOT contain private message content). */
  metadata?: Record<string, unknown>;
}

/**
 * Central tracking entry point. Every component should go through this.
 *
 *   trackEvent(EVENTS.NO_CLICKED, { clickNumber: 3 });
 */
export function trackEvent(
  event: AnalyticsEventName,
  options?: TrackOptions,
): void {
  const p = init();
  p.track({
    event,
    metadata: options?.metadata ?? {},
  });
}

/** Return the full local event timeline for the current session. */
export function getStoredEvents(): TrackEvent[] {
  return init().getEvents();
}

/** Clear all locally stored events. */
export function clearStoredEvents(): void {
  init().clear();
}

/** Get the anonymous session id used for tracking. */
export function getSessionId(): string {
  return getOrCreateSessionId();
}

/** Enable/disable tracking at runtime (persisted for the session). */
export function setTrackingEnabled(enabledFlag: boolean): void {
  enabled = enabledFlag;
  safeSetItem(TRACKING_KEY, enabledFlag ? "on" : "off");
  provider = enabledFlag
    ? new LocalStorageAnalyticsProvider(enabledFlag)
    : new NoopAnalyticsProvider();
}
