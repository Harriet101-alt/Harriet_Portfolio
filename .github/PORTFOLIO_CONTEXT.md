
# PORTFOLIO_CONTEXT.md

> Shared context for all Copilot agents working on this repository.
> Read this file in full before taking any action on any component.
> Everything here is derived from the actual codebase. Where a value lives in code, the code is the source of truth — agents must read the named file rather than trusting a summary if there is any doubt.

---

## 1. Owner & Goal

**Harriet Fletcher** — Junior Developer (Pfizer via Jakala), incoming Graduate GIS Consultant at Esri UK. Background: MSc Data Science & AI, BSc Ecology & Conservation. Geospatial-first technical identity.

**Primary goal of the portfolio:** career presence + personal brand + a working demonstration of technical competency. A well-animated, interactive, aesthetically distinctive site is itself the proof of skill. Recruiters and collaborators are the audience.

**Current phase:** bug-fixing and design-system consistency, plus adding a blog. Not a ground-up rebuild.

---

## 2. Tech Stack (as built)

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Build tool | Vite |
| Routing | react-router-dom (`/`, `/contact`) |
| Styling | Tailwind CSS + CSS variables (`App.css`) + inline style objects |
| Icons | lucide-react |
| 3D globe | `globe.gl` (Three.js / WebGL) — used in `HeroGlobe` |
| 3D world background | `three` (raw Three.js) — used in `JungleCanvas` (scroll-driven forest) |
| Custom map | Hand-rolled SVG — used in `ExpeditionMap` |
| Animation | CSS keyframes + SVG `strokeDashoffset` / `animateMotion`; some Framer Motion |
| Deployment | Vercel · GitHub |

---

## 3. Design Language

**"Expedition cartography meets punk-girly."** Concretely, in this codebase that resolves into three coexisting visual registers:

1. **Punk-girly chrome** — dusty-pink palette, the custom *Punk Babe* signature font, playful drop/sticker animations, a `˚ʚ♡ɞ˚` motif.
2. **Cartographic field-journal** — paper/ink colours, serif display type (Playfair Display / Lora), Courier Prime for coordinates and stamps, visa-style stamps, hand-drawn icons, a self-drawing expedition trail.
3. **Jungle/forest world** — an animated SVG `ForestBackground` with warm autumnal frosted-glass panels layered over it.

These are intentional, not accidental drift. The litmus test for any change: *does it still feel like a hand-kept expedition journal made by someone with strong, playful taste?* If a change makes the site look like a generic developer template, it is wrong.

---

## 4. Design System (CANONICAL — pink + cartographic)

> The earlier green/gold/blue HSL + Space Grotesk concept is **not** used in the code and must **not** be enforced. The systems below are the real ones.

### 4.1 Pink palette (UI chrome) — `src/styles/colors.ts` + `App.css` `:root`

| Token | Hex | Role |
|---|---|---|
| `--color-pink-50` | `#FFF5F7` | Light pink background |
| `--color-pink-100` | `#FAE8ED` | Lavender blush |
| `--color-pink-200` | `#FDD5DF` | Mimi pink |
| `--color-pink-300` | `#EABEC3` | Main dusty pink (focus rings, accents) |
| `--color-pink-400` | `#D9A5AC` | Darker dusty pink |
| `--color-pink-500` | `#C88B95` | Even darker dusty pink |
| `--color-pink-600` | `#B8727C` | Strong dusty pink |
| `--color-pink-700` | `#A6707B` | Navigation text |
| `--color-pink-800` | `#8B5A65` | Main text pink (WCAG AA) |
| `--color-dark-800` | `#1E293B` | Dark surface |
| `--color-dark-900` | `#0F172A` | Almost-black surface |
| `--color-white` | `#FFFFFF` | Base |

### 4.2 Cartographic paper/ink — defined in `ExpeditionMap.tsx` & `FlipJournal.tsx`

| Constant | Hex | Role |
|---|---|---|
| `PAPER` | `#f5f0e8` | Aged-paper background |
| `INK` | `#1a1208` | Primary ink text |
| `INK_LIGHT` | `#5c4f3a` | Secondary ink |
| `INK_FAINT` | `#a09278` | Faint ink / captions |
| `PENCIL` | `#8a8070` | Grid lines, rules, borders |

### 4.3 Expedition accent stamps — `FlipJournal.tsx`

Named constants `STAMP_GREEN`, `MAP_BLUE`, `EXPEDITION_RED`, `SPINE_ROD`, `COVER_BORDER_END`. Used for visa-style stamps and journal trim. **Source of truth: the constant definitions at the top of `FlipJournal.tsx`** — read them before reusing; do not guess hex values.

### 4.4 "Jungle world" overlay — `App.css`

Warm frosted-glass panels (`rgba(250,246,238,0.72)`), earthy wood action buttons (`rgba(100,65,20,0.78)`), warm dark text (`#2a1a08` / `#3a2510`). Applied via `.jungle-glass`, `.hero-action-btn`, and element/`#id` selectors. The forest itself is `ForestBackground` + the `@keyframes` (rayPulse, cloudDrift, willowSway, leafRustle, bellSway, lilyBob, vineGrow) in `App.css`.

### 4.5 Typography (CANONICAL)

| Font | Source | Used for |
|---|---|---|
| **Punk Babe** | `@font-face`, `assets/punkbabe` | `.signature-name` — the punk-girly hero name |
| **DK Crayonista** | `@font-face`, `assets/dk_crayonista` | Crayon display accents |
| **Playfair Display** | `FONT_DISPLAY` | Serif display in journal/map (titles, stamps) |
| **Lora** | `FONT_BODY` | Serif body in journal/map |
| **Courier Prime** | `FONT_MONO` | Coordinates, stamps, mono labels |
| **Georgia** | `HeroGlobe` | Globe info-card body |
| **Inter** | Google Fonts | Headings only (About section, hero name) — use *strategically for headings ONLY* |
| System sans stack | `App.css` `body` | Global default body text |

**⚠️ Inter usage rule:** Inter is for headings only. Do **NOT** use Inter on `ExpeditionMap`, `FlipJournal`, or any cartographic/journal components — these must preserve their serif identity (Playfair Display, Lora, Courier Prime). Inter is a headings accent, not a system font replacement.

Do **not** introduce Space Grotesk, JetBrains Mono, or other sans-serif families without explicit instruction. Do not add new font families without explicit instruction.

### 4.6 Theming architecture — ⚠️ three access patterns coexist

Colour is currently reached three different ways:
1. `useThemeColors()` hook → `themeColors.colors.pink[...]`, `themeColors.text.pink`, `themeColors.text.primary`, `themeColors.primary`, `themeColors.card.background`, `themeColors.background.gradientEnd`; plus `withAlpha(color, alpha)` helper.
2. Direct `import { colors } from '../styles/colors'` (e.g. `DarkModeToggle`).
3. CSS variables in `App.css` (`var(--color-pink-800)`, legacy aliases like `var(--dusty-pink)`).

Dark mode is driven by `DarkModeContext` (`useDarkMode()` → `{ isDarkMode }`) and a `.dark` class in CSS.

**Preferred convention going forward:** `useThemeColors()` for component colour, CSS vars for global/structural styling. Treat direct `colors` imports and hardcoded hex as cleanup targets — but only refactor when explicitly asked.

---

## 5. Sections & Routes (from `App.tsx`)

| Section | id | Status |
|---|---|---|
| Hero / About | `#about` | Built (`About`, with `HeroGlobe` + `AsciiMorphText`) |
| Projects | `#projects` | Built (`Projects`) |
| Experience | `#experience` | Built (`ExperienceSection`) |
| Skills | `#skills` | Built (`Skills`) |
| Contact | route `/contact` | Built (`Contact`) |
| Footer | — | Built (`Footer`) — social + CV link |

Structural layers: background world (z 0) → scroll-driven reading overlay (z 10) → `Navigation` (z 99999) → content (z 20+). Lazy-loading is used for most sections; preserve the `Suspense` boundaries.

⚠️ **Two background systems currently exist and overlap at z 0:** the older SVG `ForestBackground` (z 0–9, animated via `App.css` keyframes) and the newer 3D `JungleCanvas` (Three.js, z 0). Decide which is canonical — they should not both render. See §6A and §7.

---

## 6. Component Inventory

| Component | Role | Notes for agents |
|---|---|---|
| `JungleCanvas.tsx` | 3D scroll-driven autumn-forest world (Three.js): trees/birch/conifer, hills, shader water lake, falling-leaf + sun-dapple particles, and a flying **blue parrot** guide. Camera travels deeper into the forest as the user scrolls. | ⚠️ Takes **no props** and does **not** consume `isDarkMode` — its lighting is fixed daylight. Target of the time-of-day + guide work (§6A). Heavy WebGL; mind perf & cleanup. |
| `ForestBackground` | Older SVG forest background (animated via `App.css`) | ⚠️ Overlaps `JungleCanvas` at z 0 — only one should render. |
| `HeroGlobe.tsx` | WebGL globe (`globe.gl`) with clickable `WAYPOINTS`, fly-to, compact "sticker" mode | Heavy dependency. Has `compact` prop. Don't break the `ResizeObserver` sizing or the `_destructor` cleanup. |
| `ExpeditionMap.tsx` | ⚠️ Custom SVG route map — pins + self-drawing dashed trail + walking explorer | **FRAGILE.** See §7. Geometry, not styling. |
| `FlipJournal.tsx` | "Field Notes" flip-book telling the career story (Ecology → MSc → Dev → Hackathon) | Content lives in `getSpreads()`. Shares the cartographic palette + stamps. |
| `ui/lanyard.tsx` | Swinging conference ID badge in the About section | Hardcoded badge interaction: the profile photo cycles through `profile1`, `profile2`, and `profile3` (`Profile1.png`, `Profile3.JPG`, `Profile4.JPG`) when clicked. Keep the hand-drawn curved "click here" arrow affordance unless explicitly removed. |
| `AsciiMorphText.tsx` | Hero text where letters drop on strings like marionettes | ⚠️ Hardcodes `color: '#000'` and `fontFamily: 'monospace'` — does **not** adapt to dark mode. Cleanup candidate. |
| `ImageCarousel.tsx` | Project screenshot carousel + enlarge modal | Pink focus rings; uses `themeColors`. |
| `DarkModeToggle.tsx` | Sun/Moon theme switch | Uses **direct** `colors` import (not the hook). |
| `BackButton.tsx` | Navigates back + smooth-scrolls to a section | Uses `themeColors.text.pink`. |
| `Footer.tsx` | Social links + CV | ⚠️ CV link points to `/Harriet_Fletcher_CV.pdf` — see §7. |
| `App.tsx` | Providers, routing, forest/overlay layering | Don't disturb z-index stack or `DarkModeProvider` wrapping. |

Shared data: `src/data/waypoints.ts` (`WAYPOINTS`, `Waypoint`, `WaypointIcon`) feeds **both** `HeroGlobe` and `ExpeditionMap`. Treat it as the single source of geographic truth.

---

## 6A. World, Scroll & Time-of-Day Background (`JungleCanvas`)

The background world is the site's signature interaction. Target experience: **scrolling carries the user deeper into the forest as the sun sets — golden, never black — with an explorer guide leading them through the sections.**

### 6A.1 What already exists
- **Scroll → depth** is implemented: in the `animate` loop, `targetZ = 4 - scroll * 92` and `targetY = 0.9 + scroll * 0.5` push the camera ~92 units into the forest with a gentle rise; smoothed by `camZ/camY += (target - cam) * 0.055`. Keep this.
- **A guide character exists**: the blue parrot flies ahead of the camera (`pTargetZ = camZ - 3.8 - …`), with wing-flap and banking. It is currently *wildlife*, not an explorer.
- **Ambience**: shader water, 180 falling leaves, 60 sun-dapple specks, fog `FogExp2`.

### 6A.2 What's missing — the two intended controls
Give scroll and the dark-mode toggle **separate, non-conflicting jobs**:

1. **Scroll = time of day.** Day at the top → golden-hour sunset deeper down, with a hard **light floor** so it ends at warm amber dusk, *never* black. Lower `sun.position.y` across the scroll range so the sun visibly sets; shift sky/fog/sun/ambient colour toward warm tones.
2. **Dark-mode toggle = which world.** Light mode runs day→sunset; dark mode runs dusk→deep-blue **night** (moonlight, cool palette, optional fireflies replacing sun-dapples) — still floored above black for legibility.

### 6A.3 Why dark mode looks wrong today
`JungleCanvas` never reads `isDarkMode`; its rig is fixed daylight. The "darker blue hue" the user sees is the **black reading overlay in `App.tsx`** (`rgba(0,0,0, opacity*0.55)` in dark mode) tinting a still-daytime scene — not the world going to night. Fix requires: (a) `JungleCanvas` consumes `useDarkMode()` and drives its own palette; (b) the App-level dark overlay is **reduced** so the scene itself supplies the darkness while text stays readable.

### 6A.4 Implementation model (palette-lerp)
Define four lighting keyframes — `dayTop`, `daySunset`, `nightTop`, `nightDeep` — each `{ sky, fog, sun, sunI, amb, ambI, sunY }`, all floored above black. Per frame: pick `from/to` by `isDarkMode`, `smoothstep` by `scroll`, then `lerpColors` / `MathUtils.lerp` onto `scene.background`, `scene.fog.color`, the `sun` DirectionalLight (colour, intensity, `position.y`), and the ambient light. Optionally add a billboard sun/moon sphere tracking `sunY` and shifting white→gold→red. `JungleCanvas` must take `isDarkMode` (via prop or `useDarkMode()`); store it in a ref so the rAF loop reads the latest value.

### 6A.5 Explorer guide
The site already has an `ExplorerCharacter` (pith helmet, backpack) in `ExpeditionMap.tsx`. Make the explorer the **through-line motif**. Two viable routes (decision pending):
- **Promote the explorer to the 3D guide** — a low-poly figure walking the path ahead of the camera; parrot stays as ambient wildlife.
- **Keep the parrot as the guide** and enhance its section-awareness.

Cheap "interactive" touches that work despite the canvas being `pointerEvents: none`:
- A **window-level `mousemove`** listener → the guide glances toward the cursor.
- An **`IntersectionObserver`** on `#about/#projects/#experience/#skills` → the guide reacts as each section enters view (dip, pause, gesture, or a small on-brand HTML label).

### 6A.6 Hard constraints for this work
- **Legibility floor**: at maximum scroll in either mode, content text must remain readable. Never lerp to pure black; keep ambient ≥ ~0.5.
- **Performance**: cap `pixelRatio` (already `min(dpr, 1.8)`); reduce particle counts and consider disabling the water shader / lowering tree density on mobile; pause the rAF loop on `document.visibilitychange` (hidden).
- **Reduced motion**: honour `prefers-reduced-motion` with a calmer or static fallback (no camera bob/sway, reduced particles).
- **Cleanup**: dispose geometries/materials (not just `renderer.dispose()`) on unmount to avoid GPU leaks if the component ever remounts.
- **One background only**: resolve `ForestBackground` vs `JungleCanvas` before shipping.

---

## 7. Known Issues / Tech Debt (priority order)

1. **`ExpeditionMap` pin ↔ trail horizontal misalignment.** The *vertical* math is correct: `PIN_NEEDLE_BOTTOM_OFFSET = 29` correctly equals `-PIN_CONTAINER_OFFSET(13) + PIN_HEAD_HEIGHT(26) + PIN_NEEDLE_HEIGHT(16)`, and paths anchor to the needle bottom. The likely culprit is the **horizontal coordinate space**: `computeLayout` is fed `viewportWidth` (= `window.innerWidth`, includes scrollbar) as `trackWidth`, while the section is `width: 100vw` with `left:50%; translateX(-50%)`, and the inner track uses `margin: 0 auto` when not scrolling. Investigate whether pin `x` (with `translateX(-50%)`) and SVG path `x` share an identical origin once centring/scrollbar width are accounted for. This is a geometry task — verify numerically, don't eyeball.
2. **Three colour-access patterns** (§4.6) — inconsistent and a source of drift.
3. **`AsciiMorphText` hardcoded `#000` + `monospace`** — breaks the dark-mode and typography systems.
4. **CV filename mismatch** — `Footer` links `/Harriet_Fletcher_CV.pdf`; the canonical CV document is `Harriet_Fletcher_CV_STAR.docx`. Confirm which file is actually deployed in `/public` and reconcile.
5. **`FlipJournal` mount point** — it exists but isn't in `App.tsx` routes; confirm where (and whether) it renders.
6. **`globe.gl` weight** — a large WebGL dependency in the hero; watch mobile performance and bundle size.
7. **`JungleCanvas` doesn't consume `isDarkMode`** — dark mode never reaches the 3D world; only the App-level black overlay tints it. See §6A.3.
8. **Two background systems (`ForestBackground` + `JungleCanvas`) overlap at z 0** — pick one before shipping.
9. **`JungleCanvas` lacks reduced-motion, mobile downscaling, visibility pausing, and full GPU disposal** — see §6A.6.

---

## 8. Blog — "Field Notes Dispatches" (to build)

**Decision:** MDX-backed blog with conventional structure, styled in the Field Notes / cartographic register. `FlipJournal` stays as the About-section set-piece; the blog is **not** a flip-book (flip-books don't deep-link, scale, or serve SEO/accessibility — all of which matter for recruiter reach).

**Intended architecture:**
- Content: `.mdx` files in `src/content/blog/` (or `content/dispatches/`), one file per post, with frontmatter: `title`, `date`, `slug`, `excerpt`, `tags`, optional `coords` (lat/lng to echo the expedition motif), `cover`.
- Routing: `/blog` (index list) and `/blog/:slug` (post page) added to `App.tsx`, lazy-loaded behind `Suspense` like the other sections.
- Index: list of "dispatches" styled as stamped journal cards (reuse `VisaStamp`, paper/ink palette, Courier Prime meta line, optional coordinate stamp).
- Post page: Playfair Display title, Lora body, Courier Prime metadata; respects light/dark via `useThemeColors()`.
- Tooling: an MDX loader for Vite (e.g. `@mdx-js/rollup`) — propose before installing.

**Design rules for the blog:** same palette and fonts as §4; theme-aware; on-brand stamps/paper, but standard semantic HTML (`<article>`, `<time>`, headings) underneath for SEO and a11y.

---

## 9. Featured Projects & Experience

> Canonical data lives in the Projects and `ExperienceSection` data files — agents must read those rather than trust this list. ⚠️ **Harriet to confirm the definitive list.** Candidates known so far:

**Projects**
- **Carbon-BiomassML** — MSc dissertation. Stacked ensemble (Random Forest, XGBoost, SVR, Ridge meta-learner) on GEE datasets (SoilGrids, CHIRPS); deployed to Streamlit. Findings reported honestly (6.5% R² gap, no statistically significant difference, 5-coordinate spatial constraint). *Confirmed featured.*
- **Pfizer CX+AI Hackathon — Compliance Checker** — 1st place. Next.js pharmaceutical web-compliance checker; Harriet owned the compliance gate, Pa11y/axe-core integration, and AI enrichment layer. Led to a job interview. *Confirmed featured.*
- **Liverpool Urban Heat Island simulator** — FastAPI / React / deck.gl / H3. *Confirm if featured.*
- **CarbonMapSolutions** — ML-validated carbon-credit positioning; data-lead role. *Confirm if featured.*

**Experience** (canonical: `ExperienceSection`)
- Junior Developer — Pfizer via Jakala (current)
- Graduate GIS Consultant — Esri UK (incoming, Sept)
- International teaching — Kuala Lumpur, Kerala, Seville
- (Confirm any others to surface on-site.)

Keep all on-site copy in Harriet's voice; do not auto-rewrite project descriptions. ML claims must stay accurate — no overclaiming.

---

## 10. Agent Rules (apply to ALL agents)

1. **Read before write.** Read the full target file (and `src/data/waypoints.ts` / relevant data file) before changing anything.
2. **One file per task.** No cross-component refactors in a single session.
3. **Design system = §4.** Validate every colour and font against the pink + cartographic systems. Never introduce non-token hex, and never reintroduce green/gold/blue HSL or Space Grotesk/Inter/JetBrains Mono.
4. **Theme-aware always.** Every change must work in both light and dark mode (`useDarkMode()` / `.dark`).
5. **Respect the layer stack.** Don't alter z-index ordering (forest 0–9 / overlay 10 / nav 99999 / content 20+) or `Suspense` boundaries without cause.
6. **`ExpeditionMap` is geometry.** Any coordinate change must be verified numerically and kept consistent across pins, paths, and the explorer's `animateMotion` route. Never move pins without re-deriving path endpoints, and vice versa.
7. **No new dependencies** without explicit approval (this includes the MDX loader — propose first).
8. **Preserve voice.** Don't rewrite personal/project copy.
9. **Prefer `useThemeColors()`** for new colour usage; flag (don't silently "fix") existing direct-import or hardcoded colour unless asked.
10. **Don't summarise this file back to the user.** Use it silently as context.
11. **Preserve `FlipJournal` structure and imagery.** The realistic journal background, book structure, page layout, and photo orientation/placement are part of the set-piece and must be maintained. Text inside the journal may be edited when requested, but do not replace, remove, rotate, or visually flatten the journal images/background without explicit approval.

---

## 11. Do-Not-Touch List

- Font families — fixed set in §4.5.
- Colour values outside the §4 systems.
- `ExpeditionMap` `INSET`, section-height, amplitude, and pin-geometry constants — unless the task *is* the alignment fix, and then only with numeric verification.
- The z-index layering in `App.tsx` / `App.css`.
- `WAYPOINTS` coordinates (real lat/lng) — they're geographically meaningful.
- `globe.gl` cleanup logic (`_destructor`, `ResizeObserver`) in `HeroGlobe`.

---

## 12. Geospatial Integrity

This portfolio should read as the work of someone with genuine spatial thinking, not a web developer who added a map. Preserve: real coordinates in `WAYPOINTS`, accurate coordinate formatting (DMS in `formatCoordinate`), honest representation of ML/GEE findings, and the expedition metaphor as a coherent spatial narrative rather than decoration.
