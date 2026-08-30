/**
 * ============================================================
 *  REMOTE BACKEND — receive her answer & message on YOUR device
 * ============================================================
 *
 * This is the opt-in bridge that takes the local-only experience and lets you
 * actually collect her response ("yes"/"no"), her journey, and her written
 * message in a Supabase database you own.
 *
 * It talks to Supabase through its plain REST (PostgREST) API using `fetch`,
 * so we don't need to add the Supabase SDK as a dependency.
 *
 * Security / privacy model:
 *   - The anon key is public by design — it is safe to ship in the bundle.
 *     Row Level Security on the tables decides what anyone can do (see README).
 *   - Nothing is sent until you set `backend.enabled = true` AND paste your
 *     project URL + anon key into src/config/personalization.ts.
 *   - If the backend is off/unconfigured, every call here is a silent no-op so
 *     the experience still works perfectly as a local-site.
 */

import { PERSONALIZATION } from "../config/personalization";
import { getSessionId } from "./analytics";
import { getRecipientName } from "./personalization";

const cfg = PERSONALIZATION.backend;

export interface RemoteSubmission {
  ok: boolean;
  error?: string;
}

function isConfigured(): boolean {
  return Boolean(
    cfg.enabled &&
      cfg.supabaseUrl.trim() &&
      cfg.supabaseAnonKey.trim() &&
      cfg.responsesTable.trim(),
  );
}

/** Build the PostgREST endpoint for a table. */
function endpoint(table: string): string {
  return `${cfg.supabaseUrl.replace(/\/+$/, "")}/rest/v1/${table}`;
}

/** Only the ascii/url-safe subset of a value is sent down the wire. */
function safeText(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").slice(0, 2000);
}

async function postRow(
  table: string,
  body: Record<string, unknown>,
): Promise<RemoteSubmission> {
  if (!isConfigured()) return { ok: false, error: "backend-not-configured" };
  try {
    const res = await fetch(endpoint(table), {
      method: "POST",
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, error: `http-${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network-error" };
  }
}

/**
 * Record her Yes/No answer.
 *   answer: "yes" | "no"
 *   noClicksBeforeYes: how many times she hit "No" before picking an answer.
 */
export async function submitAnswer(
  answer: "yes" | "no",
  metadata: { noClicksBeforeYes?: number; clickNumber?: number } = {},
): Promise<RemoteSubmission> {
  return postRow(cfg.responsesTable, {
    type: answer,
    value: answer,
    recipient: safeText(getRecipientName()),
    session_id: getSessionId(),
    metadata: { ...metadata, source: "envelope" },
  });
}

/**
 * Send one event to the timeline (envelope opened, letter viewed, etc.).
 */
export async function submitEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
): Promise<RemoteSubmission> {
  return postRow(cfg.responsesTable, {
    type: "event",
    value: eventName,
    recipient: safeText(getRecipientName()),
    session_id: getSessionId(),
    metadata,
  });
}

/**
 * Send her written message.
 */
export async function submitMessage(
  text: string,
  metadata: Record<string, unknown> = {},
): Promise<RemoteSubmission> {
  if (!isConfigured()) return { ok: false, error: "backend-not-configured" };
  try {
    const res = await fetch(endpoint(cfg.messagesTable), {
      method: "POST",
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        text: safeText(text),
        recipient: safeText(getRecipientName()),
        session_id: getSessionId(),
        ...metadata,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `http-${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network-error" };
  }
}

/** Raw REST helpers (used by the Creator page to read data back). */
async function getRows(
  table: string,
  opts: { select?: string; limit?: number } = {},
): Promise<unknown[]> {
  if (!isConfigured()) return [];
  try {
    const params = new URLSearchParams();
    params.set("select", opts.select ?? "*");
    if (opts.limit) params.set("limit", String(opts.limit));
    const res = await fetch(
      `${endpoint(table)}?${params.toString()}`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as unknown[];
  } catch {
    return [];
  }
}

export interface ResponseRow {
  id?: string;
  created_at?: string;
  type?: string;
  value?: string;
  recipient?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageRow {
  id?: string;
  created_at?: string;
  text?: string;
  recipient?: string;
  session_id?: string;
}

/** Fetch the stored answers/events (newest first). */
export async function getResponses(limit = 500): Promise<ResponseRow[]> {
  return (await getRows(cfg.responsesTable, {
    select: "id,created_at,type,value,recipient,session_id,metadata",
    limit,
  })) as ResponseRow[];
}

/** Fetch the stored messages (newest first). */
export async function getMessages(limit = 200): Promise<MessageRow[]> {
  return (await getRows(cfg.messagesTable, {
    select: "id,created_at,text,recipient,session_id",
    limit,
  })) as MessageRow[];
}
