// Explicit z-index scale for the About/hero scene, so stacking order is a
// documented decision instead of whichever ad-hoc number a given element
// happened to get. Values are local to `section#about` — its sub-regions
// (hero collage, ExpeditionMap, sticker corkboard) each get `isolation:
// isolate` so this scale can never be compared against unrelated z-index
// values elsewhere on the page (or vice versa).
export const Z_LAYERS = {
  // Corner illustration flourishes (tropics/rocks) — sits at the back.
  background: 10,
  // Reserved for ExpeditionMap. It manages its own internal 0–40 range
  // (topo pattern, trail, pins, tooltips) inside its own isolated wrapper —
  // do not edit those values, they're geometry, not layering (see
  // PORTFOLIO_CONTEXT.md §7/§11).
  map: 15,
  // Resting tier for every corkboard/collage sticker.
  stickers: 30,
  // Momentary lift while a sticker is hovered or dragged, so it clears its
  // neighbours without ever approaching the ID card tier.
  stickerActive: 35,
  // Primary readable content (e.g. the About Me journal) — always above
  // decorative stickers.
  content: 40,
  // ID card + lanyard — always topmost within the section.
  idCard: 50,
} as const;
