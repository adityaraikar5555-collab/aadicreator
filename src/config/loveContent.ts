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
    title: "The Day I First Saw You",
    emoji: "🔬",
    content: [
      "I still remember the very first time we met.",
      "It was our 1st PUC Chemistry Lab — our very first introduction.",
      "You stood beside me, and for a moment, you looked at me with those beautiful eyes of yours. It was such a simple moment, probably something you may not even remember, but for me, it became a moment I could never forget.",
      "I don't know what happened in those few seconds, but something about the way you looked at me just stayed in my heart.",
      "That was the first time I saw you this closely.",
      "And maybe you didn't realize it then, but somewhere in that Chemistry Lab, something in me quietly changed.",
      "That simple first introduction became the beginning of a feeling I never expected — and before I even knew it… I had started falling for you. ❤️",
    ],
  },
  {
    title: "The 1st PUC Farewell",
    emoji: "🌸",
    content: [
      "And then came your 1st PUC farewell.",
      "You were dressed in traditional attire, wearing a beautiful saree, and honestly… you looked absolutely gorgeous. There are some moments that don't need a photograph because the heart remembers them perfectly.",
      "That day, I didn't just see you.",
      "I saw someone I could never easily forget.",
    ],
  },
  {
    title: "Your Little Stalking",
    emoji: "😜",
    content: [
      "I always loved seeing you around. Your presence had this strange way of making an ordinary day feel a little more special. Even your little stalking moments, your presence, the way you appeared somewhere unexpectedly… somehow, I loved all of it.",
      "And the funniest part? I acted like I didn't.",
      "Maybe I was trying to hide what I felt. Maybe I was scared that if I admitted it, everything would suddenly become real.",
    ],
  },
  {
    title: "Because I Was Waiting For You",
    emoji: "💓",
    content: [
      "But let me be completely honest now.",
      "There have been people who have liked me. There have been people who would probably have chosen me without hesitation. But my heart never moved toward them.",
      "Because I was waiting for you.",
      "I don't want to give my heart just because someone is willing to hold it. My heart is something I want to give only once.",
      "And I want that person to be you.",
    ],
  },
  {
    title: "My Promise To You",
    emoji: "💌",
    content: [
      "So, if you ever choose to accept me, I promise you something — not some perfect fairytale promise, but something real.",
      "I want to build something real with you — a love that lasts, a bond that grows, a story worth telling.",
      "I promise, I'll take care of you like my little princess and cutie pie. I'll stand beside you, support your dreams, celebrate your happiness, and be there on the days when life isn't as beautiful as we imagined.",
    ],
  },
  {
    title: "If Life Goes Elsewhere",
    emoji: "🕊️",
    content: [
      "And if someday life doesn't go the way I planned, if I somehow fail to become the person I promised I'd become, I won't hold you back.",
      "I'd let you go and choose the happiness you deserve.",
      "Because loving you should never mean possessing you. It should mean wanting the best for you — even if the best doesn't happen to be me.",
    ],
  },
  {
    title: "I Will Make It",
    emoji: "🚀",
    content: [
      "But until that day comes, believe me… I will fight for my dreams. I will work for my future. And I will become successful.",
      "Not just because I want to prove something to the world. But because I want to look at you someday and say, \"See? I told you I would make it.\"",
      "And if you ask me what I want after all the success, money, dreams and everything else… my answer will still be the same. You.",

    ],
  },
  {
    title: "It Chose You",
    emoji: "💖",
    content: [
      "There may be countless beautiful people in this world. But my heart doesn't need countless.",
      "It chose one. And somehow… it chose you.",
      "— Aditya ❤️",
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