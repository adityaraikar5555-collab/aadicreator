# Will You Be My Girlfriend — Complete Repository Analysis

> Generated from a full read of the repository. This file documents every file,
> its purpose, the tech stack, architecture, data flow, configuration, CI/CD,
> git history, and customization points.

- **Repo**: `https://github.com/WIZARDOF-OZ/Will_You_Be_My_Girlfriend.git`
- **Live demo**: https://will-youbemy-wifey.vercel.app/
- **Default branch**: `main`
- **Working tree**: clean at time of analysis
- **Platform note**: analyzed on Windows (win32) with PowerShell shell

---

## 1. What This Project Is

A single-page **romantic interactive web experience** ("Will You Be My Girlfriend",
branded **"For You, Always 💖"**) built with React 19 + TypeScript. It presents an
animated hero, a 3D heart backdrop, an SVG envelope that opens into a personal
letter, a "No" button that runs away, and a full celebration flow ending on a
`/yes` page with a live relationship timer and a six-page flip-book love story.

The entire experience is a personal, made-for-one-person love letter rendered as a
website, deployed on Vercel.

---

## 2. Tech Stack

| Layer | Technology | Version (from `package.json`) |
| ------------------------ | ----------------------------------- | ---------------------------- |
| **Framework**            | React + React DOM                   | `^19.2.5`                    |
| **Language**             | TypeScript                          | `~6.0.0`                     |
| **Build tool**           | Vite                                | `^8.2.1`                     |
| **Routing**              | react-router-dom                    | `^7.18.2`                    |
| **3D graphics**          | three.js (+ `@types/three`)         | `^0.185.1` / `^0.185.4`      |
| **Animation**            | animejs                             | `^4.5.0`                     |
| **Styling**              | Tailwind CSS 4 (`@tailwindcss/vite`) | `^4.3.0` / `^4.3.3`         |
| **Audio**                | YouTube IFrame Player API (external) | —                            |
| **Linting**              | ESLint 10 + typescript-eslint + react-hooks + react-refresh | `^10.8.0` |
| **Deployment**           | Vercel (SPA rewrites + security headers) | —                        |
| **Icons / fonts**        | Google Fonts (Playfair Display, Cormorant Garamond) | —            |

**Notable config:** `.npmrc` contains `legacy-peer-deps=true`, which relaxes peer
dependency resolution for `npm install`.

---

## 3. Project Structure (Full Tree)

```text
will_you_be_my_girlfriend/
├── .github/                     # GitHub automation
│   ├── dependabot.yml           # Weekly dep updates (npm + GitHub Actions), grouped, react/react-dom ignored
│   ├── labeler.yml              # Auto-labels PRs based on changed paths
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   └── workflows/
│       ├── ci.yml               # Lint + build on push/PR to main
│       ├── codeql.yml           # CodeQL Advanced security analysis (JS/TS, weekly + on push/PR)
│       ├── dependabot-auto-merge.yml  # Auto-merges non-major dependabot PRs
│       └── pr-labeler.yml       # Runs actions/labeler on PR events
├── .gitignore
├── .npmrc                      # legacy-peer-deps=true
├── .idea/                      # JetBrains IDE settings (untracked)
├── docs/
│   └── screenshots/            # home.png, intro.png, yes-page.png, love-timer.png
├── public/
│   ├── favicon.ico
│   └── titleIcon.gif
├── src/
│   ├── App.tsx                 # Router setup + global MusicPlayer mount
│   ├── App.css                 # Empty placeholder file
│   ├── main.tsx                # React entry point (createRoot + StrictMode)
│   ├── index.css               # Tailwind import, theme tokens, global styles, keyframes
│   ├── components/
│   │   ├── Envelope.tsx        # Letter interaction, yes/no logic, celebration overlay
│   │   ├── HeartScene.tsx      # Three.js floating-hearts background
│   │   ├── HeroSection.tsx     # Landing hero with per-letter animated title
│   │   ├── LoveBook.tsx        # Six-page flip book ("Our Journey")
│   │   ├── MusicPlayer.tsx     # YouTube player UI + queue (desktop + mobile)
│   │   ├── PhotoCard.tsx       # Memory card component (Tailwind) — NOT yet wired into app
│   │   └── PhotoMemoryWall.tsx # Placeholder "// code to written" — NOT yet wired into app
│   ├── data/
│   │   ├── songs.ts            # FEATURED_SONGS + PLAYLIST_SONGS
│   │   └── memories.ts         # Memory interface + sample memoriesData (5 items)
│   └── pages/
│       ├── YesPage.tsx         # Post-"yes" celebration page
│       └── LoveTimer.tsx       # Relationship duration counter (days/hours/min/sec)
├── eslint.config.js            # Flat ESLint config
├── index.html                  # App shell, fonts, meta
├── package.json / package-lock.json
├── tsconfig.json               # Solution file referencing app + node configs
├── tsconfig.app.json           # App TS config (ES2023, bundler resolution)
├── tsconfig.node.json          # Node/Vite-config TS config
├── vercel.json                 # SPA rewrites + CSP/security headers
└── vite.config.ts              # Vite config: react + tailwindcss plugins
```

Source code totals: **15 source files, ~3,317 lines** across `src/`.

---

## 4. Entry Points & App Shell

### `index.html`
- Standard Vite entry. Loads Google Fonts (`Playfair Display` 400/700/italic and
  `Cormorant Garamond` 300/400/italic) with `preconnect`.
- `<title>` is **"For You, Always"**; favicon is `/favicon.ico`
  (`public/titleIcon.gif` also exists but is not referenced).
- `#root` mounted by `/src/main.tsx`.

### `src/main.tsx`
Wraps `<App />` in `<StrictMode>` and mounts to `#root`.

### `src/App.tsx`
- Renders **`<BrowserRouter>`** from `react-router-dom`.
- Mounts **`<MusicPlayer />` outside the `<Routes>`**, so YouTube playback
  persists across route changes.
- Routes:
  - `/` → `<HomePage />` (in-file component: `HeartScene` + `HeroSection` + `Envelope`)
  - `/yes` → `<YesPage />`
- Comment notes: "More pages to be added here soon".

---

## 5. Components Breakdown

### 5.1 `HeartScene.tsx` (142 lines) — 3D background
- Builds a `THREE.Shape` heart via Beziers and extrudes it
  (`depth 0.2`, bevel enabled).
- Renders **25 hearts** in a palette
  (`#e8375a, #ff6b8a, #c8973a, #b01840, #ff9eb5`) with
  `MeshStandardMaterial` (metalness 0.3, roughness 0.4, opacity 0.8).
- Lighting: `AmbientLight` (0.6) + `PointLight` (2 intensity).
- Animation loop: continuous slow rotation + sine-wave vertical bob;
  camera parallax follows the mouse (lerp factor 0.03).
- Resize-aware; cleanup disposes geometry/materials, cancels RAF, removes
  listeners and the canvas.
- Rendered as a `position: fixed; inset: 0; z-index: 0; pointer-events: none` layer.

### 5.2 `HeroSection.tsx` (123 lines) — landing hero
- "For My Favourite Person 🌹" headline with **per-letter** anime.js reveal
  (`stagger(60)`), emoji animates after (~1400ms delay).
- Sub copy lines in Cormorant Garamond italic (cream + gold).

### 5.3 `Envelope.tsx` (495 lines) — the core interaction
- **Letter reveal:** tapping the SVG envelope fades the hint, flips the flap
  (`rotateX -180`), then fades/scales in the letter popup.
- **Yes/No game:**
  - `MESSAGES` array (10 entries) escalates after each "No" click:
    "Will you be my girlfriend? 💕" → "Are you sure? 🥺" → ... → "The No button
    has left the chat 🤭".
  - After the 1st "No", the button becomes `position: fixed` and randomly
    teleports (`getRandomPos` clamps to viewport with 24px padding).
  - On the 5th "No" the button is hidden **behind** the popup (z-index 1019);
    otherwise it floats above (z-index 1030).
  - On the 9th+ "No" click the button **disappears** (`noGone`), the message
    area shows "Resistance is futile 💕", and Yes expands to full width.
- **Yes → Celebration overlay:**
  - Full-screen dark overlay (z-index 1040) with 30 randomized confetti pieces
    and 8 floating balloon emojis (CSS `floatUp` keyframe).
  - "She said Yes! 💕" + gold italic line + `CountdownRedirect` (3→0) which
    `navigate("/yes")`.
- **z-index layering** (carefully documented in code comments):
  - Music player ~1015, blur overlay 1010, letter popup 1020,
    flying No button 1019/1030, celebration 1040.

### 5.4 `LoveBook.tsx` (670 lines) — "Our Journey" flip book
- **`PAGES` array** (6 pages): A Letter to You 💌, The Beginning 🌱,
  My Favourite Memories 🎞️, What I Love About You 🌹, My Promises to You 🕊️,
  Our Forever ✨. Each page has `title`, `emoji`, and `content` paragraphs.
- **Animated candle** above the book (flicker via anime.js on flame + glow;
  pure SVG/AI-free inline SVG flame with gradient).
- **3D book:** fixed `320×420` container, `perspective: 1400px`. Cover flips
  open on click (`rotateY -160`, `transformOrigin: left center`) with an
  "✨ Click the book to open" pill hint. Spine has a leather gradient.
- **Page turning:** slide + fade animation (in/out via anime.js), disabled
  while flipping; reactivity dots track the current page; Prev/Next buttons.
- Ruled "notebook" paper texture + red margin line + page-curl corner.
- Content area is scrollable (`.book-content`) with custom scrollbar styling.

### 5.5 `MusicPlayer.tsx` (1122 lines) — persistent YouTube player
- **Queue logic:**
  ```ts
  const _openerIdx = Math.floor(Math.random() * FEATURED_SONGS.length);
  const _initialQ = [_opener, ...PLAYLIST_SONGS];
  ```
  A random featured song opens. After the opener `ENDED`, remaining featured
  songs are spliced into the queue (`featuredAddedRef` guard), then playback
  continues through the playlist.
- **YouTube IFrame API** loaded lazily; player lives in a hidden 1×1 off-screen
  container (`position: fixed; top:-9999px…`).
- **State:** ready / playing / index / progress / duration / shuffle /
  showPlaylist / autoplayPending / volume / muted, plus refs mirroring
  (`indexRef`, `shuffleRef`, `songsRef`, function refs).
- **Autoplay policy workaround:** a full-screen "Tap to play music" overlay
  (z-index 9999). `startAutoplay()` calls `playVideo()` synchronously in the
  click handler (required by browsers); if the player isn't ready yet,
  `pendingPlayRef` queues the play call for `onReady`.
- **Controls:** shuffle (repeats the last-2-tracks exclusion in `getNextIndex`),
  prev/next, play/pause, seek via clickable progress bar, volume slider
  (custom CSS `.mp-vol`), mute with remembered previous volume
  (`prevVolRef`), 250ms progress ticker.
- **UI variants:**
  - **Mobile** (`innerWidth < 600`): slim fixed bottom bar with vinyl disc,
    progress bar, prev/play/next/list, volume row, and a slide-up playlist panel
    (`maxHeight 45vh`), with `env(safe-area-inset-bottom)` padding.
  - **Desktop:** floating card (bottom-right, `z-index 1015`) with vinyl disc
    that spins while playing (`mpSpinDisc` 4s), shuffle/prev/play/next/list,
    volume row, "Now Playing" header, index/total counter.
- Custom keyframes (`mpSpinDisc`, `mpPulse`, `mpOverlayPulse`) injected via an
  inline `<style>` tag in the component.
- `window.YT` types are declared globally (`.d.ts` style `declare global`).

### 5.6 `PhotoCard.tsx` (50 lines) — memory card (unused)
- Renders a `Memory` (`src/data/memories.ts`) as a glassmorphism card
  (Tailwind classes: `bg-white/10 backdrop-blur-md`, pink tag pills,
  contributor + formatted date footer).
- **⚠ Unused:** not imported anywhere in the app yet.

### 5.7 `PhotoMemoryWall.tsx` (1 line) — placeholder (unused)
- Contains only `// code to written`. Intended to be a photo memory wall,
  presumably using `PhotoCard` + `memoriesData`. **Not wired into the app.**

---

## 6. Pages

### 6.1 `YesPage.tsx` (156 lines) — `/yes`
- "My Girlfriend 💝" per-letter title reveal (`stagger(60)`), gold overline
  "— she said yes —", italic subtitle "And so our story begins... ♥".
- Rendered with `HeartScene` + a radial vignette overlay.
- Composes `<LoveTimer />` then `<LoveBook />`.

### 6.2 `LoveTimer.tsx` (267 lines) — relationship counter
- **`START_DATE = new Date("2025-05-14T00:00:00")`** (hardcoded, customisable).
- Computes elapsed `days / hours / minutes / seconds` in `getElapsed()`.
- Each digit is animated with an **imperative roll/flip** — tens/ones kept in
  empty `<span>` refs, animate out (translateY -20), swap text, animate in
  (+20). Only changed digits animate.
- Entrance animation: label stagger, units scale/slide in
  (`stagger(100, { start: 400 })`), caption at delay 900.
- Updates via `setInterval` every second.

---

## 7. Data

### `data/songs.ts` (145 lines)
- `FEATURED_SONGS` — **14 tracks** (opener pool; one picked randomly).
  Bollywood-ish + indie (e.g. Udi Udi, I Wanna Be Yours, Rang Jo Lagyo,
  Sahiba, Paro, Ordinary, Kamariya, Made in Japan, HUSN, O Meri Laila,
  Kalank, Honey Pie, Closer, Aaoge Tum Kabhi).
- `PLAYLIST_SONGS` — **14 tracks** (Love Story, Love Me Like You Do, Perfect,
  Her, Tera Rastaa Chhodoon Na, Fairy Tale, Suroor, There's Nothing Holdin' Me
  Back, I WANNA BE YOUR SLAVE, Samjho Na X Wishes Mashup, Someone You Loved,
  JO TUM MERE HO, Tu Jaane Na, Матушка).
- Each entry: `{ id: YouTubeId, title, artist }`.

### `data/memories.ts` (51 lines)
- `interface Memory { id, imageUrl, caption, contributor, date, tags[] }`.
- `memoriesData`: 5 Unsplash-sourced sample memories.
- **Currently only used by the unused `PhotoCard`.**

---

## 8. Styling & Theme

### `src/index.css`
- `@import "tailwindcss";` (Tailwind v4 via Vite plugin).
- Global reset (`box-sizing`, zero margins/padding).
- Theme tokens on `:root`:
  ```css
  --rose: #e8375a;      --rose-deep: #b01840;  --rose-light: #ff6b8a;
  --cream: #fff5f0;     --gold: #c8973a;       --gold-light: #f0c878;
  --ink: #1a0a0f;
  ```
- Body: dark burgundy background (`#1a0a0f`), cream text, Cormorant Garamond.
- `floatUp` keyframe (celebrations), scrollbar styling for `.book-content`.

### `src/App.css`
- Empty (0 lines). Likely legacy; main styling lives in `index.css` and inline
  styles.

### Tailwind usage
- Only `PhotoCard.tsx` currently uses Tailwind utility classes. All other
  components use inline `style={{...}}` objects. Tailwind v4 is configured via
  the Vite plugin (`@tailwindcss/vite`) — no `tailwind.config.js` file present.

---

## 9. Configuration Files

### `vite.config.ts`
```ts
plugins: [react(), tailwindcss()]
```

### `vercel.json`
- **Rewrites:** all routes (`/(.*)`) → `/index.html` (SPA fallback so `/yes`
  resolves).
- **Security headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options:
  nosniff`, HSTS (2y, preload), `Referrer-Policy`, `Permissions-Policy`
  (camera/mic/geolocation blocked), and a **CSP** allowing:
  - `script-src 'self' https://www.youtube.com`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src https://fonts.gstatic.com`
  - `frame-src https://www.youtube.com`
  - `img-src 'self' data:`, `connect-src 'self'`
  - ⚠ Comment in README: swapping the music service (Spotify/SoundCloud/etc.)
    requires updating `frame-src`/`script-src`, or the browser blocks it.

### TSConfigs
- `tsconfig.json` — solution file referencing `tsconfig.app.json` +
  `tsconfig.node.json`.
- `tsconfig.app.json` — ES2023, DOM libs, `moduleResolution: bundler`,
  `allowImportingTsExtensions`, `verbatimModuleSyntax`, `noEmit`,
  `jsx: react-jsx`, strict-ish (`noUnusedLocals/Parameters`,
  `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`). Note: **`strict` is not
  enabled** in either config.
- `tsconfig.node.json` — same rules, `types: ["node"]`, includes `vite.config.ts`.

### `eslint.config.js`
- Flat config: `globalIgnores(['dist'])`, extends
  `js.recommended`, `tseslint.recommended`, `reactHooks.flat.recommended`,
  `reactRefresh.vite`. Browser globals.

---

## 10. CI/CD & GitHub Automation

### Workflows
| File | Trigger | Purpose |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `ci.yml` | push/PR to `main` | `npm ci` → `npm run lint` → `npm run build` (Node 20, npm cache) |
| `codeql.yml` | push/PR to `main` + weekly cron | CodeQL Advanced, `javascript-typescript`, `security-extended` + `security-and-quality` |
| `dependabot-auto-merge.yml` | PR from `dependabot[bot]` | Auto-merges non-major updates with `gh pr merge --auto --merge` |
| `pr-labeler.yml` | `pull_request_target` (opened/synchronize/reopened) | Runs `actions/labeler@v4` |

### Dependabot (`dependabot.yml`)
- Two ecosystems: `npm` (weekly, 5 open PRs max) and `github-actions` (weekly).
- `react` / `react-dom` are ignored for npm updates (react-router/react-router-dom
  bumps observed in history).
- Both use grouped dependency PRs.

### Issue / PR templates
- Bug report + feature request YAML forms; PR template with checklist
  (style, self-review, comments, `npm run lint`, `npm run build`).

---

## 11. Git History Summary

- **72 commits** on `main`.
- Remote `origin` → `WIZARDOF-OZ/Will_You_Be_My_Girlfriend`.
- Active branches: local `main`; remote `main` + a stale dependabot branch
  (`dependabot/npm_and_yarn/all-npm-updates-25f4290dcb`).
- Recent activity is dominated by **Dependabot** automation:
  - `chore(deps):` CodeQL action bumps (all-action-updates), npm/all-npm-updates
    (15 packages), react-router & react-router-dom.
  - Downgrades: typescript 6.1.0 → 6.0.0, then 6.0.0 (two commits).
  - One functional fix: `fix: update LoveBook content to use placeholders for
    grade levels`.
- Commit style: conventional commits (`chore`, `fix`, merge PR commits) with
  `Merge pull request #N from WIZARDOF-OZ/{branch}`.

---

## 12. Scripts (`package.json`)

| Command | What it does |
| ------- | ----------------------------------------------- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b && vite build` (typecheck + bundle to `dist/`) |
| `npm run lint` | `eslint .` |
| `npm run preview` | Preview the production build |

---

## 13. Notable Observations / Gaps

1. **Incomplete feature — photo memory wall.** `PhotoCard.tsx` and
   `memories.ts` exist and are polished, but `PhotoMemoryWall.tsx` is a stub
   (`// code to written`) and neither card nor memories are imported anywhere.
   This looks like the next planned feature ("More pages to be added here soon").
2. **`strict: true` is NOT set** in the TS configs — only
   `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`,
   `erasableSyntaxOnly` are active. Enabling `strict` would surface more errors.
3. **`public/titleIcon.gif`** is unused; `favicon.ico` is referenced.
4. **`App.css`** is empty (dead file).
5. **Mixed styling:** Tailwind is only used in `PhotoCard.tsx`; the rest uses
   inline styles. No `tailwind.config.js` (Vite-plugin-based v4).
6. **README drift vs. reality:**
   - README structure section omits `PhotoCard.tsx`, `PhotoMemoryWall.tsx`,
     and `src/data/memories.ts`.
   - Badge says Three.js `0.184`, package.json says `^0.185.1`.
7. **Potential robustness notes:**
   - `Envelope.tsx` z-index layering is tightly coupled (1019/1020/1030/1040)
     and fragile to change.
   - `MusicPlayer.tsx` relies on the off-screen hidden YT iframe and draws
     progress from it via a 250ms poll (`getCurrentTime`), not the
     `onProgress`-style event.
   - Envelope's confetti `borderRadius: \`Math.random() > 0.5 ? "50%" : "2px"\``
     is a **string literal**, not an evaluated expression — all confetti pieces
     get the literal string `Math.random() > 0.5 ? "50%" : "2px"` as their
     border-radius (likely unintentional).
8. **Personalization points** (see README "Customization Guide"):
   `START_DATE` in `LoveTimer.tsx`, `MESSAGES` in `Envelope.tsx`, `PAGES` in
   `LoveBook.tsx`, songs in `data/songs.ts`, hero copy in `HeroSection.tsx`,
   palette in `src/index.css`.

---

## 14. How to Run

```bash
npm install        # .npmrc already sets legacy-peer-deps=true
npm run dev        # local dev at http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # preview prod build
npm run lint       # eslint .
```

---

## 15. Deployment Notes

- Vercel with default settings: build command `npm run build`, output `dist`.
- `vercel.json` handles SPA rewrites so `/yes` works client-side.
- CSP must be updated if the embedded music provider changes.
- Other static hosts (Netlify, Cloudflare Pages, GitHub Pages + rewrite) work
  as long as every route falls back to `index.html`.

---

Milestone: created as a complete repository snapshot / analysis document.