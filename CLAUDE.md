# Harriet Fletcher — Portfolio

Shared project context lives in `.github/PORTFOLIO_CONTEXT.md` (also used by GitHub
Copilot). It is the source of truth for the design system, component inventory, known
issues, and agent rules. Read it before taking any action on a component.

@.github/PORTFOLIO_CONTEXT.md

## Build & quality gate
- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — `tsc -b` + Vite build
- `npm run lint` — ESLint over `.ts`/`.tsx` (primary quality gate; there are no automated tests)

Run `npm run lint` before committing.

## Specialised agents
Project subagents live in `.claude/agents/`. Invoke them by name via the Agent tool
(e.g. "use the design-enforcer agent on About.tsx"):

| Agent | Use it for | Edits files? |
|---|---|---|
| `research-agent` | Investigate / trace / diagnose **before** any code is written | No |
| `design-enforcer` | Audit one file against the pink + cartographic design system | Only if told "fix" |
| `component-fix` | Surgical, on-brand, theme-aware change to ONE named component | Yes |
| `design-system-validator` | Deeper component + interaction + token review | Only if told "fix" |
| `front-end-developer` | Senior front-end work: scroll storytelling, animation, performance | Yes |

All agents must obey §10 (Agent Rules) and §11 (Do-Not-Touch) of PORTFOLIO_CONTEXT.md.
