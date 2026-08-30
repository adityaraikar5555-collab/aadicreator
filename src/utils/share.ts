/**
 * Sharing utilities — used on the creator-side to generate and copy a
 * personalized link, plus WhatsApp / native share flows.
 */

import { PERSONALIZATION } from "../config/personalization";
import { buildShareLink } from "./personalization";

export function defaultWhatsAppText(link: string): string {
  return `Hey ❤️ I made something for you. Open this when you're ready: ${link}`;
}

export function defaultInstagramText(link: string): string {
  return `A little surprise for you ✨ ${link}`;
}

/**
 * Copy a link to the clipboard. Returns true on success.
 * Falls back to a legacy textarea approach for older mobile browsers.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Open WhatsApp share with a pre-filled message. */
export function shareWhatsApp(link: string): void {
  const text = encodeURIComponent(defaultWhatsAppText(link));
  const url = `https://wa.me/?text=${text}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Use the native Web Share API when available (works on WhatsApp/Instagram
 * in-app browsers and most mobile platforms).
 */
export async function nativeShare(link: string): Promise<boolean> {
  const nav = navigator as Navigator & {
    share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
  };
  if (typeof nav.share === "function") {
    try {
      await nav.share({
        title: `For you, ${PERSONALIZATION.recipientName} 💖`,
        text: defaultInstagramText(link),
        url: link,
      });
      return true;
    } catch {
      return false; // user cancelled or share failed
    }
  }
  return false;
}

/** Build a personalized link destined for a recipient. */
export function makeRecipientLink(recipientName: string): string {
  return buildShareLink(recipientName);
}
