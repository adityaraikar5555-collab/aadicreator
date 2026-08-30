/**
 * ============================================================
 *  PERSONALIZATION CONFIG — edit this ONE file to make it yours
 * ============================================================
 *
 * This is the single source of truth for the entire experience.
 * You should NOT need to search through React components to change
 * the recipient's name, your name, your photo, or the copy.
 *
 * 1. Open this file.
 * 2. Change `recipientName` (and optionally everything else).
 * 3. Add your photo at public/creator/aditya-raikar.jpg (or set
 *    `creatorPhoto` to null for a graceful letter-avatar fallback).
 * 4. Run `npm run dev`, build, deploy, and share the link.
 *
 * A link can also override the recipient without editing code:
 *   https://your-domain.vercel.app/?to=ANOTHER_NAME
 */

export interface PersonalizationConfig {
  /** The name of the person who made this little world. */
  creatorName: string;
  /** The creator's full name (used for the photo filename reference). */
  creatorFullName: string;
  /** A short role/tagline for the creator. */
  creatorRole: string;
  /** Public path to the creator photo (e.g. "/creator/aditya-raikar.jpg"). */
  creatorPhoto: string | null;
  /**
   * The default recipient name. This can be overridden per-link via
   * the `?to=` query parameter without touching this file.
   */
  recipientName: string;

  /** Landing headline shown on "/". */
  experienceTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroFooter: string;

  /** Hint above the envelope. */
  envelopeHint: string;
  envelopeTitle: string;
  letterIntro: string;

  /** The yes/no question asked inside the letter. */
  relationshipQuestion: string;

  /** Celebration copy shown right after "yes". */
  celebrationTitle: string;
  celebrationSubtitle: string;

  /** Final page copy. */
  yesTitle: string;
  yesSubtitle: string;

  /** Book overline / cover. */
  bookLabel: string;

  /** Final creator signature (end of the /yes page). */
  creatorSignature: string;

  /** Whether to render the little circular creator watermark. */
  enableCreatorBadge: boolean;
  /** Whether local workflow tracking is enabled. */
  enableWorkflowTracking: boolean;
  /** Whether the optional "leave a message" form is enabled. */
  enableFinalResponse: boolean;

  /** Whether the creator-only "/creator" link generator is enabled. */
  enableCreatorPage: boolean;

  /**
   * Remote backend used to actually receive her Yes/No answer and her written
   * message on your own device. Uses Supabase over its plain REST API (no SDK
   * dependency). Leave `enabled` off or the keys blank and the site works as a
   * fully local experience.
   *
   * To turn it on:
   *   1. Create a free project at https://supabase.com
   *   2. In SQL Editor, create the table below (see README "Backend setup").
   *   3. Copy the project URL + anon key into `supabaseUrl` / `supabaseAnonKey`.
   */
  backend: {
    enabled: boolean;
    supabaseUrl: string;
    supabaseAnonKey: string;
    /** Table that stores yes/no answers, events and messages. */
    responsesTable: string;
    /** Table that stores the recipient's written messages. */
    messagesTable: string;
  };
}

export const PERSONALIZATION: PersonalizationConfig = {
  creatorName: "Aadi",
  creatorFullName: "Aditya Raikar",
  creatorRole: "The person who made this little world for you",
  creatorPhoto: "/creator/aditya-raikar.jpg",

  /**
   * Default name used only when someone opens the site WITHOUT a `?to=Name`
   * link. It reads warmly for anyone, so you can send the plain link to any
   * person. To personalize, generate a link from /creator (or append
   * `?to=Name`) — that name overrides this default.
   */
  recipientName: "My Love",

  experienceTitle: "Welcome to Aadi's World",
  heroTitle: "For My Favourite Person ✨",
  heroSubtitle:
    "Because some people deserve their own little universe — and this one is all yours.",
  heroFooter: "Made especially for {recipientName} ♥",

  envelopeHint: "— a letter for you, tap to open —",
  envelopeTitle: "For You Alone",
  letterIntro:
    "There's something I've been meaning to tell you, {recipientName}...",

  relationshipQuestion: "Will you be my girlfriend? 💕",

  celebrationTitle: "She said Yes! 💕",
  celebrationSubtitle: "I knew you would, my love 🌹",

  yesTitle: "My Forever and Always",
  yesSubtitle: "And so our story begins... ♥",

  bookLabel: "Our Journey",

  creatorSignature: "Created with a little too much love by Aadi ❤️",

  enableCreatorBadge: true,
  enableWorkflowTracking: true,
  enableFinalResponse: true,

  enableCreatorPage: true,

  backend: {
    enabled: true,
    // Paste your Supabase project URL here, e.g. "https://xyzcompany.supabase.co"
    supabaseUrl: "https://lgcodufpyngjypkgpzrh.supabase.co",
    // Paste your Supabase anon (public) key here ("sb_publishable_..." / "eyJ...")
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnY29kdWZweW5nanlwa2dwenJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTk0ODUsImV4cCI6MjEwMzY3NTQ4NX0.ptEHKaYvnclWVecJ7zJxEY2DOPXyJtIppTRcdPuUhEY",
    responsesTable: "responses",
    messagesTable: "messages",
  },
};

/** Convenience alias so components read `P` instead of `PERSONALIZATION`. */
export const P = PERSONALIZATION;
