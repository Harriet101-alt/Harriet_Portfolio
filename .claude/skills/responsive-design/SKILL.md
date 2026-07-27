---
name: responsive-design
description: Use this skill when creating, editing, or reviewing responsive layout, imagery, typography, or spacing in the Harriet Fletcher portfolio.
---

# Responsive Design Skill

## Source of truth

Apply this skill alongside `.github/PORTFOLIO_CONTEXT.md`. Preserve the portfolio's pink + cartographic design system, theme-awareness, and z-index layer stack.

## Standard breakpoints

Use the existing Tailwind breakpoint model as the default:

| Name | Width | Use |
| --- | ---: | --- |
| `xs` | `480px` | Small phones and tight content-specific CSS/media queries |
| `sm` | `640px` | Tailwind default small screens |
| `md` | `768px` | Tablet and mobile/desktop layout switch |
| `lg` | `1024px` | Desktop layout switch |
| `xl` | `1280px` | Wide desktop |
| `2xl` | `1536px` | Maximum hero/content cap already used in the site |

Prefer Tailwind's built-in `sm`, `md`, `lg`, `xl`, and `2xl` utilities. Use raw media queries only for component-specific thresholds such as `480px` or highly constrained canvas/SVG cases.

## Images and media

- Every rendered `img`, `picture`, `svg-as-image`, and modal image must be constrained with `max-width: 100%` and `height: auto`, unless it is intentionally cropped inside a fixed-aspect container.
- Use `aspect-ratio` on image wrappers or the image itself whenever the rendered dimensions are predictable, especially cards, modals, thumbnails, icons, and decorative stickers.
- Use explicit `width` and `height` attributes for stable intrinsic sizing where practical.
- Use `loading="lazy"` for below-the-fold images and keep eager/preloaded images limited to above-the-fold critical media.
- For any raster image over roughly 50KB, provide responsive candidates (`srcSet` + `sizes`, or an imported/generated equivalent) unless the source asset has no alternate sizes yet. If alternate sizes do not exist, flag it rather than inventing a build step.
- Decorative imagery should have `alt=""` and `aria-hidden="true"` when appropriate.

## Layout approach

- Prefer CSS Grid for responsive card/list/gallery layouts, using `grid-template-columns: repeat(auto-fit, minmax(min(100%, <target>), 1fr))` when the number of columns should adapt fluidly.
- Prefer Flexbox for one-dimensional alignment, navigation rows, button groups, and inline controls.
- Use container queries only when a component's layout depends on its own rendered width rather than the viewport. Keep them scoped and documented.
- Avoid fixed pixel widths on content containers. Use `width: 100%`, `max-width`, `min()`, `clamp()`, or Tailwind fluid utilities.
- For horizontal controls that may overflow on mobile, use wrapping or `overflow-x: auto` with touch-friendly targets rather than squeezing text below readability.

## Typography and spacing

- Body text should use `rem` sizing and inherit the global Lora/system base unless the design system specifies a cartographic font.
- Headings should use `clamp()` when they need to scale across mobile, tablet, and desktop.
- Prefer `rem`, `%`, viewport units, and `clamp()` for spacing that affects layout. Pixel units are acceptable for hairlines, icon glyphs, small decorative offsets, and touch-target minimums.
- Maintain a minimum touch target of `44px` for interactive controls.

## Responsive checks

When editing `.css`, `.tsx`, or component layout code:

1. Run `npm run responsive:lint` for quick static responsive checks.
2. Run `npm run lint` before commit.
3. Manually inspect or reason through 480px, 768px, 1024px, and desktop widths for any file that changes structural layout.

Ask before changing visual hierarchy, collapsing/hiding major sections, changing the order of content, or replacing a bespoke set-piece layout. Safe mechanical fixes include adding media constraints, converting obvious fixed layout pixels to fluid units, adding `aspect-ratio`, and adding missing responsive wrappers.
