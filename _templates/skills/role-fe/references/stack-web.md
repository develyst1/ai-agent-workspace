# If the desk's stack is web (Next.js / React / TypeScript)

Read `package.json` for the real versions, the repo's `CLAUDE.md`/`AGENTS.md`, and the workspace
`FRONTEND-STANDARD.md` (the web UI bar: one token system, OKLCH tinted neutrals, one accent, the
8-state discipline, table rules, the UI definition of done). The repo's own standard overrides it.

## Routing

| Situation | Skill |
|---|---|
| Scaffolding a module, feature, hook or service in a house Next.js repo | `anthropic-skills:nextjs-pattern-generator` → the matching `anthropic-skills:nextjs-*-pattern` for the repo's UI library (antd, heroui, chakra, …). **Only in a repo that follows the house pattern.** In a guest repo, follow the host. |
| Self-audit against the anti-pattern list | `hallmark audit`, **if the repo has hallmark installed**. Use it in addition to `/impeccable audit`, never instead of it |
| New screen direction left to FE | `frontend-design:frontend-design` |
| Polish, harden, adapt or audit | `impeccable:impeccable` |
| Current framework or library API | context7 MCP |
| Seeing the change working | the `run` skill or the desk's launch config. Drive it in a browser at every breakpoint |

## Engineering rules

- **App Router:** keep server components as the default. Add `"use client"` only at the leaf that
  needs it. Use `loading`/`error` files for route states. Never ship a hydration mismatch (no
  `Date.now()` or random values in render).
- **TypeScript strict:** no `any` or `as` casts to silence the compiler. If the type is wrong, the
  model is wrong.
- **One UI library** through its theme tokens. Don't mix it with a second colour system. Know the
  library's traps: components that truncate their own labels, `position: sticky` that breaks inside
  transformed scroll containers, compact variants that read as tags.
- **Data fetching** follows the repo's pattern (server component or the repo's client data
  library), with all four states designed.
- **Forms:** use the repo's form and validation library. Validation messages are copy from the SPEC.
- **i18n:** if the repo has dictionaries, every new key exists in every language. Use the SPEC's
  strings and never translate them yourself.
- Use `next/image` (or the repo's image component) with sizes. Don't render unbounded lists.

## Evidence

Type check (zero errors), lint, test counts before and after, and a production build that succeeds.
Then the screen loaded in a browser at 375, 768 and 1280 (or the desk's breakpoints): each state,
keyboard-only, reduced motion, console free of errors. A grep of the diff for inline hex,
`font-family`, `z-index: 9`, `transition-all` and `!important` should return zero hits. Include the
`/impeccable audit` verdict (and the `hallmark` verdict if it's installed).
