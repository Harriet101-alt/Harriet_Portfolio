#!/usr/bin/env node
// Dev-time helper only. Sends a component's source (+ design-system context) to
// Gemini and prints improvement suggestions. Never runs in the shipped site —
// GEMINI_API_KEY must stay out of any VITE_-prefixed / client-bundled code.
//
// Usage:
//   node --env-file=.env scripts/gemini-review.mjs src/components/FlipJournal.tsx
//   node --env-file=.env scripts/gemini-review.mjs src/components/FlipJournal.tsx "mobile scaling"
//   npm run gemini:review -- src/components/FlipJournal.tsx "mobile scaling"

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Add it to .env (no VITE_ prefix) and run with --env-file=.env');
  process.exit(1);
}

const targetPath = process.argv[2];
if (!targetPath) {
  console.error('Usage: node --env-file=.env scripts/gemini-review.mjs <path/to/component.tsx>');
  process.exit(1);
}

// gemini-2.0-flash / gemini-2.0-flash-lite report 0 free-tier quota on some accounts (retired
// version strings); the "-latest" alias resolves to whatever current model actually has quota.
const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const focus = process.argv[3];
const componentSource = readFileSync(resolve(targetPath), 'utf-8');

let designContext = '';
try {
  designContext = readFileSync(resolve('.github/PORTFOLIO_CONTEXT.md'), 'utf-8');
} catch {
  // optional — proceed without it
}

const prompt = `You are advising on a portfolio site for Harriet Fletcher, a junior developer moving into a
Graduate GIS Consultant role. The design language is "expedition cartography meets punk-girly":
dusty-pink UI chrome + a hand-kept field-journal aesthetic (paper/ink colours, Playfair Display /
Lora / Courier Prime fonts, visa-style stamps). Do NOT suggest generic developer-template styling,
new colour systems, or new font families.

Below is the current source of "${targetPath}", a flip-book component telling her career story
(Ecology -> MSc -> Dev -> Hackathon).

${focus
  ? `Focus specifically on this issue: "${focus}". Explain the root cause precisely (cite the exact
lines/variables responsible), why it produces the symptom, and give a concrete numbered plan to fix
it — architecture, not just a patch. Do NOT rewrite her personal copy or invent achievements.`
  : `Give concrete, numbered suggestions for making this component better: storytelling/pacing, missing
beats in the narrative arc, interaction/animation ideas that fit "physically real" page-turn motion,
mobile experience gaps, and accessibility. Do NOT rewrite her personal copy or invent achievements —
suggest *where* and *what kind* of change, not verbatim replacement text.`
}

${designContext ? `--- DESIGN SYSTEM CONTEXT ---\n${designContext.slice(0, 6000)}\n` : ''}
--- COMPONENT SOURCE ---
${componentSource}
`;

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
});

if (!res.ok) {
  console.error(`Gemini API error ${res.status}:`, await res.text());
  process.exit(1);
}

const data = await res.json();
const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') ?? '(no response text)';
console.log(text);
