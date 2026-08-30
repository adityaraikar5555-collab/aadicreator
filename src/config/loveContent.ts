/**
 * LoveBook content — edit the copy here without touching LoveBook.tsx.
 *
 * You can use the tokens {recipientName} and {creatorName} inside the
 * strings. They are replaced automatically with the configured values.
 */

export interface LovePageContent {
  title: string;
  emoji: string;
  content: string[];
}

export const LOVE_BOOK_CONTENT: LovePageContent[] = [
  {
    title: "In My Beginning",
    emoji: "💌",
    content: [
      "Before your name fell softly on my lips, my heart was only a quiet room, {recipientName}.",
      "Then you came — and like dawn, you did not knock. You simply filled every corner with golden light.",
      "Now every beat I own writes itself in your rhythm, and I have forgotten what silence felt like without you.",
    ],
  },
  {
    title: "The Comfort of You",
    emoji: "🌱",
    content: [
      "You are the peace I never knew I was searching for, {recipientName}.",
      "With you, my restless soul found its harbour — no storm too loud, no night too long.",
      "In the hush of your presence, I learned that home is not a place, but the gentle way you stay.",
    ],
  },
  {
    title: "Little Constellations",
    emoji: "🌻",
    content: [
      "You scatter stars in my ordinary days, {recipientName} — a smile, a laugh, a look that says everything.",
      "I gather these small lights like constellations and trace them when the sky turns grey.",
      "Each tiny moment with you outshines the grandest memory I ever carried alone.",
    ],
  },
  {
    title: "A Love I Never Knew",
    emoji: "🌹",
    content: [
      "There is a warmth in me only you can name, {recipientName} — it grows with every breath we share.",
      "You taught me to be seen without fear, to be held without disguise, to be loved without condition.",
      "I never knew a heart could hold this much, until you made your home inside mine.",
    ],
  },
  {
    title: "Forever, Softly",
    emoji: "🌙",
    content: [
      "In every dream I weave, you are the thread that holds it all together, {recipientName}.",
      "So let tomorrow come — through storm or sun, my hand will find yours, again and again.",
      "You are my favourite verse, my gentlest yes. Today, tomorrow, and always — you, forever. 🌙",
    ],
  },
];

/**
 * Replace simple {recipientName} / {creatorName} tokens in a copy string.
 */
export function fillTokens(
  text: string,
  recipientName: string,
  creatorName: string,
): string {
  return text
    .replace(/\{recipientName\}/g, recipientName)
    .replace(/\{creatorName\}/g, creatorName);
}
