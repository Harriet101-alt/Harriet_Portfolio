# Copilot Instructions for Portfolio Repository

## Build, Test, and Lint Commands

### Development
```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Build with TypeScript checking (tsc -b) + Vite
npm run lint       # Run ESLint on all .ts and .tsx files
npm run preview    # Preview production build locally
```

**Development workflow:** Run `npm run lint` before committing. There are no automated tests in this project—linting is the primary quality gate.

## High-Level Architecture

### Project Overview
This is a customizable personal portfolio website built with **React 19, TypeScript, and Vite**. The core aesthetic combines a dark terminal/developer aesthetic with geographic/environmental visual layers (grid overlays, contour-line textures, and data-driven color symbolism).

### Layered Visual Architecture
The app uses a sophisticated layering system to create depth:
1. **SVG Forest Background** (`ForestBackground.tsx`) — Illustrated forest vector (z-index 0–9)
2. **Reading Overlay** — Dynamic semi-transparent layer (z-index 10) that adapts opacity based on scroll depth
3. **Content Sections** — Main UI and text content (z-index 20+)
4. **Navigation** — Fixed header (z-index 99999)

The reading overlay shifts between warm-white (light mode) and dark (dark mode) to maintain text legibility while letting the forest background show through.

### Component Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Badge, etc.)
│   ├── section/         # Major page sections (About, Projects, Skills, etc.)
│   ├── project/         # Project detail page components
│   └── jungle/          # Specialized background/effect components
├── pages/               # Route-level pages (Contact, individual projects)
├── contexts/            # React context (DarkModeContext for theme)
├── hooks/               # Custom hooks (useThemeColors, useScrollDepth, etc.)
├── config/              # Configuration files (socialLinks, etc.)
├── styles/              # Global styles and color palette
├── types/               # TypeScript type definitions and declarations
├── lib/                 # Utility functions (cn() for classname merging)
└── data/                # Data files for content
```

### Routing Strategy
- **Homepage** — Component tree with lazy-loaded major sections (Projects, Experience, Skills, Footer)
- **Project Detail Pages** — Individual routes under `/projects/:slug`
- **Contact Page** — Lazy-loaded contact form page
- Lazy loading uses React's `lazy()` and `Suspense` for code splitting

### Design System Foundation
The portfolio enforces a **semantic token-based design system**:
- **Color tokens** — Defined in `src/styles/colors.ts` (HSL-based, theme-aware)
- **Theme variants** — Light/dark mode through CSS class toggling (`DarkModeContext`)
- **Interaction principles** — Smooth transitions, scale/shadow feedback on hover
- **Geographic aesthetic** — Grid overlays, contour textures, and color symbolism (terrain green, coordinate gold, data blue)

The `design-system-validator` agent (in `.github/agents/`) enforces these constraints for new components.

## Key Conventions

### React & TypeScript Patterns
- **Functional components with hooks** — No class components
- **forwardRef for UI components** — Allows parent access to DOM nodes (Button, Card, Badge, Tooltip)
- **CVA (class-variance-authority)** — Button, Badge, and similar components use CVA for variant composition
- **TypeScript strict mode** — All components typed; no `any`

### Component Structure Example
```tsx
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." }
  }
})

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  )
)
```

### Styling Conventions
- **Tailwind CSS first** — Use `className` for layout and utility classes
- **Semantic token colors** — Reference `colors.ts` for theme-aware colors; never hardcode hex values
- **Dynamic styles via `themeColors` hook** — Use `useThemeColors()` when inline styles are necessary
- **No custom CSS outside semantic tokens** — If a color/spacing/animation isn't in the system, add it as a token first

### Dark Mode Implementation
- `useDarkMode()` hook provides `isDarkMode` boolean
- `useThemeColors()` hook returns theme-specific color palette
- Light/dark variants stored in `colors.ts` under `light`/`dark` keys
- CSS class `dark` toggles on `<html>` element

### Customization Entry Points
When modifying the portfolio, edit:
- **Text content** — Components in `src/components/section/` (About, Navigation, Footer, etc.)
- **Projects** — `src/components/section/Projects.tsx` for gallery; create detail pages in `src/pages/projects/`
- **Colors & theme** — `src/styles/colors.ts` and theme tokens in Tailwind config
- **Skills, experience, certifications** — Components in `src/components/section/`
- **Social links & environment variables** — `.env` file and `src/config/socialLinks.ts`

### Asset Organization
- **Profile images** — `src/assets/profile*.jpg`
- **Project icons** — `src/assets/project_icons/`
- **Project screenshots** — `src/assets/project_snapshots/{project-slug}/`
- **Certification badges** — `src/assets/badges/`
- **Tech stack icons** — `src/assets/techstack/`
- **Stickers & effects** — `src/assets/stickers/`, `src/assets/stars/`

Register new assets in `src/assets/index.ts` and import as needed.

### Environment Variables
All external links are injected via `.env` to enable easy customization:
```env
VITE_GITHUB_URL=https://github.com/yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourusername
VITE_EMAIL=your.email@example.com
VITE_GITHUB_PROJECT1_URL=https://github.com/yourusername/project1
# ... add more as needed
```

Consumed in `src/config/socialLinks.ts`.

### Path Aliases
- `@/*` — Maps to `src/`
- Use `import { Button } from "@/components/ui/button"` instead of relative paths

### Lazy Loading Pattern
Major sections are lazy-loaded to optimize initial page load:
```tsx
const Projects = lazy(() => import('./components/section/Projects'))

<Suspense fallback={<div className="h-screen" />}>
  <Projects />
</Suspense>
```

### Animation Libraries
- **GSAP** — Complex, choreographed animations (ASCII morphing, scrolling triggers)
- **React Spring** — Physics-based animations and transitions
- **OGL & Globe.gl** — WebGL-based 3D effects
- **Tailwind animate** — Simple keyframe animations (fade-in, bounce)

## Special Notes

### Design System Validation
This repository uses a custom `design-system-validator` agent to enforce design system compliance. When creating or modifying components, the agent validates:
- Semantic token usage (no hardcoded colors)
- Interaction feedback (hover, active, focus states)
- Typography scale consistency
- Geographic aesthetic layer integration

Trigger the agent with: "Check this component against the design system" or "Validate my styling."

### Forest Background Performance
The `ForestBackground` component is a critical rendering layer. It uses:
- SVG vector graphics (no images)
- CSS transforms and opacity for animation
- `pointer-events: none` to prevent interaction blocking

Avoid modifying its z-index behavior or adding interactive elements to the forest layer.

### Theme Toggle Behavior
The dark mode toggle via `DarkModeContext`:
- Reads system preference on initial load
- Allows manual override
- Persists preference to localStorage
- Updates colors dynamically—no page reload needed

When adding new components, always provide both light and dark variants in `colors.ts`.
