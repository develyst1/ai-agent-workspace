# TASK-010: AC-10 comp, redone on HeroUI: scaffold `god-plan-front` + the project page with mock data
- Source: SPEC-002 (§Overview front line, as amended 2026-11-08 13:17 · §Front — pages row `/projects/[id]` · §Non-functional deploy shape) · REQ-001 AC-10 · DECISIONS 2026-11-08 13:17
- Owner: FE (Fern)
- Status: DONE (2026-11-08, SA review; AC-10 = the owner's pick of A or B, via the PM)
- Depends on: none
- Base, read by the SA 2026-11-08: `god-plan-front` on `atom`, HEAD `a41cbd0 Initial commit`, only `README.md` (one line).
- Git: none by you.

## Why
The owner rejected the first comp (TASK-002) at 13:17: *"ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้"*. This comp is
**a real Next.js page on HeroUI** with mock data. It is not a static HTML file. The same scaffold then carries TASK-007..009.

## What to do
1. **Load the skill `anthropic-skills:nextjs-heroui-pattern` first** and follow its version policy and SSR/provider setup. Pin
   exactly its versions for: `next`, `react`, `react-dom`, `@heroui/react`, `framer-motion`, `lucide-react`, `dayjs`; dev: `typescript`,
   `tailwindcss`, `@tailwindcss/postcss`. **Do not add** NextAuth, axios or React Query (SPEC-002). Package manager: bun.
   After install, check that exactly one React version resolves.
2. Scaffold in `god-plan-front` (closed list): `package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts` (`output: "standalone"`,
   `rewrites()` `/api/:path*` → `${BACK_ORIGIN}/api/:path*`), `postcss.config.mjs`, `.gitignore` (ignores `.env.local`, `.next/`,
   `node_modules/`), `.env.example` (`BACK_ORIGIN` + one comment line), `scripts/copy-standalone-assets.mjs` + `build` script
   (`deploy-ready-build` skill), `src/app/layout.tsx` (Thai `lang="th"`, IBM Plex Sans Thai via `next/font`, the HeroUI provider),
   `src/app/globals.css`, `src/context/HeroUIProviders.tsx`, `src/strings.th.ts` (every string used, from REQ-001 §User-facing
   wording, both tables), `src/app/not-found.tsx` (Thai), `src/app/comp/project-a/page.tsx`, `src/app/comp/project-b/page.tsx`, `src/app/comp/mock.ts`,
   `README.md` (replace; how to run, ≤ 10 lines). Dev port 4300 (`next dev -p 4300`).
3. **Two comp pages, same mock data, both on HeroUI** (BRAINSTORM … §Moment C, so the owner picks):
   - **`/comp/project-a`**: a task list with the comment thread beside it on desktop and under the selected task on a phone.
   - **`/comp/project-b`**: a board with **four status columns** (ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว). Each card shows its title,
     comment count and, for ติดอยู่, the reason. A card's thread opens in a drawer/modal. **No drag-and-drop** (Out of Scope). The
     owner changes status from a menu on the card. On a phone the columns stack or scroll sideways inside the board only, so the
     page itself never scrolls sideways.
   Both pages show the same content TASK-002 asked for. Synthetic data only: project "ปรับปรุงบ้านแม่"
   with its description, six tasks across all four statuses, two ติดอยู่ tasks with reasons, comment counts, one task's thread
   open with three comments (พี่เอ, น้องบี, the owner), the comment box, and the owner's controls (add task, status, rename,
   delete, "ให้ AI ช่วยแตกงาน", links to summary and members). Use HeroUI components (Card, Chip, Select/Dropdown, Button,
   Input/Textarea, Avatar, …). Interactions may work locally on mock state. No back-end calls.
4. **Make it clearly better than the rejected comp** (the owner's words). Pick a deliberate visual direction, and run your
   design skills (`/impeccable` or `frontend-design` if your session lists them). Status must never be colour alone. Thai text
   must not clip (line-height for Thai vowels and tone marks).
5. Previews for the owner: screenshots at **390 px** and **1280 px** of **each** page running under `next dev`. Four files:
   `god-plan/ai-worker/specs/comps/AC-10-heroui-a-390.png`, `…-a-1280.png`, `…-b-390.png`, `…-b-1280.png`. Wait until the web font has loaded before shooting
   (the first comp's font was UNVERIFIED).

## Definition of Done
- [ ] `bun run build` passes. `ls .next/standalone/server.js .next/standalone/.next/static` exist. Paste.
- [ ] `bun pm ls | grep -E "react@|react-dom@|@heroui/react@|next@"` shows the pinned versions, one React. Paste.
- [ ] Both PNGs exist (`ls -l`). The command used is pasted. You looked at each and say what you checked.
- [ ] `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → hits only in `mock.ts` data, none in components (UI words live
      in `strings.th.ts`). `grep -rn dangerouslySetInnerHTML src` → none. Paste both.
- [ ] `git check-ignore .env.local` → ignored. `git status --short` pasted.
- AC-10 stays the owner's. Nothing here claims it.

## Implementation Notes
**Fern, 2026-11-08.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). Dev port 4300.

**Direction I chose:** warm paper background, ink text, ONE deep-teal accent, low-saturation status tints; HeroUI Card / Chip / Dropdown / Drawer / Avatar / Input / TextArea / Button / Link, tokens overridden in `globals.css` only (no inline colour). Status = word + icon (dashed ring · ring-dot · triangle · check) + tint, in the chip, in the menu and in B's column heads. Thai line-height 1.65 so tone marks do not clip.
- **A** `/comp/project-a`: task cards, thread in a sticky right column at ≥1024 px, under the selected task on a phone (one CSS grid + `order`, no JS).
- **B** `/comp/project-b`: four columns (4-up at ≥1024 px; on a phone the strip scrolls sideways inside itself, the 2nd column peeks in), status menu on each card, thread in a right-hand drawer, no drag.
- Both work on mock state: change status (Stuck asks for its reason first and refuses an empty one; leaving Stuck drops the reason), add task, delete task, send comment (empty refused), open thread. **Rename is inert; delete has no confirm** (the confirm string has a `<ชื่องาน>` slot; not built for a comp).
- `?open=t2` on either page opens that task's thread (A: selects it; B: opens the drawer). Used only for the drawer preview.

**Evidence (command-verified, all run by me)**
- `bunx tsc --noEmit` → no output (`TSC_OK`).
- `bun run build` → `✓ Compiled successfully`; routes `/_not-found`, `/comp/project-a`, `/comp/project-b` static; `[postbuild] copied .next/static into .next/standalone`.
- `ls -l .next/standalone/server.js` → `6940 B`; `ls .next/standalone/.next/static` → `cRp3ebeHnSLkoomtHNIp5  chunks  media`.
- Standalone run, `PORT=4399 HOSTNAME=127.0.0.1 node .next/standalone/server.js`: `curl` page → `200`; its `/_next/static/chunks/2c1keig6o72a7.css` → `200`. Server stopped after.
- `bun pm ls | grep -E "react@|react-dom@|@heroui/react@|next@"` → `@heroui/react@3.1.0 · next@16.2.9 · react@19.2.7 · react-dom@19.2.7` (+ `@types/react@19.2.18`, `@types/react-dom@19.2.7`). One React: `bun pm ls --all | grep -E " react@| react-dom@"` → 1 line each, 19.2.7.
- `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → no hits (exit 1). Thai appears only in `src/strings.th.ts` and `src/app/comp/mock.ts`. `grep -rn dangerouslySetInnerHTML src` → no hits. `grep` for a `#hex` in `src` → none.
- `git check-ignore -v .env.local` → `.gitignore:5:.env*.local  .env.local`. `git status --short` → ` M README.md`, `?? .env.example .gitignore bun.lock next.config.ts package.json postcss.config.mjs scripts/ src/ tsconfig.json`.
- Web font: `.next/static/chunks/2c1keig6o72a7.css` contains the `IBM Plex Sans Thai` @font-face and woff2 files are in `.next/static/media`; the screenshots were taken after `--virtual-time-budget=12000` and show Plex Sans Thai glyphs (so this fixes TASK-002's UNVERIFIED font).
- Contrast (my own OKLCH→sRGB script, approximate): stuck chip 5.26 · stuck-reason 5.69 · done chip 5.33 · doing chip 7.45 · todo chip 15.07 · body 15.20 · muted on white 6.81 · primary button 6.96 · field border vs white 3.95 (need 3.0). I darkened HeroUI's default `--danger`/`--success` because the defaults gave about 3:1 text on their tint.
- Screenshots, `google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --virtual-time-budget=12000 --window-size=<W>,<H> --screenshot=<file> http://localhost:4300/comp/project-<a|b>` under `next dev -p 4300`, saved in `god-plan/ai-worker/specs/comps/`: `AC-10-heroui-a-390.png`, `AC-10-heroui-a-1280.png`, `AC-10-heroui-b-390.png`, `AC-10-heroui-b-1280.png`, plus one extra `AC-10-heroui-b-drawer-1280.png` (`?open=t2`). I opened every PNG. Checked: Thai text not clipped, no horizontal page scroll, both ติดอยู่ cards show their reason, every status has word + icon, thread under the selected task at 390 and beside it at 1280, B's columns/drawer as described, font is Plex.

**Things I found that you should know**
1. **The skill `nextjs-heroui-pattern` is wrong for the version it pins.** Its lockset (`@heroui/react@3.1.0`) is correct and installs cleanly, but its code samples are HeroUI **v2** (`HeroUIProvider`, `@plugin "@heroui/react"`, `ModalContent`, `color=`/`radius=` props, `onPress` only). v3.1.0 has **no provider**, styles come from `@import "@heroui/styles"`, and components are compound (`Card.Content`, `Dropdown.Item`, `Drawer.Dialog`). I read the real `.d.ts` files in `node_modules/@heroui/react/dist` and built against those. So **`src/context/HeroUIProviders.tsx` was not created** (there is nothing to put in it; `layout.tsx` has a comment). TASK-007..009 should follow the v3 compound API, not the skill's samples. This is for Atlas to fix in the skill, via the PM.
2. **Files outside the closed list, each with a reason:** `src/app/comp/comp-parts.tsx` (the 302 lines both pages share; duplicating them would be worse); devDeps `@types/node@24.19.2`, `@types/react@19.2.18`, `@types/react-dom@19.2.7` (TypeScript will not compile without them; pinned exact, matching React 19.2 / Node 24); `devIndicators: false` in `next.config.ts` (keeps Next's dev badge out of the owner's screenshots); `.gitignore` also ignores `next-env.d.ts`, `*.tsbuildinfo`, `*.zip`. `tsconfig.json` was re-written by `next build` (it added `.next/dev/types/**/*.ts` to `include` and reformatted); I kept that.
3. `dayjs` and `framer-motion` are pinned and installed as the TASK lists but unused: dates use `Intl.DateTimeFormat("th-TH-u-ca-gregory", {timeZone: "Asia/Bangkok"})` → `8 พ.ย. 14:05`; HeroUI's own motion is enough.
4. Sample data that is not UI copy: project, tasks, reasons, comments, names พี่เอ / น้องบี / โอ (owner) and their initials are all in `mock.ts`, synthetic. Every UI word is in `strings.th.ts` and traces to REQ-001 §User-facing wording (T1/T2): statuses, สถานะ, ติดเพราะอะไร, ใส่เหตุผลที่ติดก่อน, ให้ AI ช่วยแตกงาน, ชื่องาน, เพิ่มงาน, บันทึก, ยกเลิก, แก้ชื่องาน, ลบงาน, คอมเมนต์, เขียนคอมเมนต์, พิมพ์คอมเมนต์ก่อนส่ง, ส่ง, ยังไม่มีคอมเมนต์, `<n> คอมเมนต์`, สรุปงาน, คนในโปรเจกต์, กลับไปหน้าโปรเจกต์, ออกจากระบบ, ยังไม่มีงานในโปรเจกต์นี้, ไม่พบหน้านี้.

**UNVERIFIED**
- `UNVERIFIED — /impeccable audit`: not listed in my session (the TASK says "if your session lists them"). The SA waived it for TASK-002 and said it applies to TASK-007. Would settle it: run it on `/comp/project-a` and `-b`.
- `UNVERIFIED — interaction states`: I did not click the dropdowns, the Stuck form or the delete in a browser; only the drawer open state was captured (via `?open=`). Hover/active/disabled/loading were not exercised. Hit targets are `min-h-11` (44 px) in the classes; not measured in the page.
- `UNVERIFIED — real phone` and keyboard-only / screen-reader pass: only headless Chrome at 390 px.
- Contrast numbers above are from my own script, not from an audit tool.
- AC-10 is the owner's. Nothing here claims it.

## Questions
- **Q-F1 (copy, for the PM via you):** the drawer's close "X" has no visible words, so it needs a screen-reader label. I used `ยกเลิก` (REQ-001 T2 "Save · cancel") as `aria-label`, which is a stand-in. Is there a better string for "close the comment panel"? Until answered it stays `ยกเลิก`.
  > answer (Porter, PM, 2026-11-08): `ปิดคอมเมนต์` — added to REQ-001 §User-facing wording.
- **Q-F2 (design, for the owner's look):** B's cards repeat the status twice (column head + the chip that is also the move menu). I kept it because the chip is the control. If the owner picks B and finds it busy, the chip can become a plain "move" menu.

## Review
**DONE — Sober (SA), 2026-11-08.** Ready for the owner's look (AC-10 is his, via the PM).
- Re-ran in `god-plan-front`: `git status --short` = the scaffold. The Thai-in-`.tsx` grep → 0. `dangerouslySetInnerHTML` → 0.
  `package.json` pins `next 16.2.9`, `react`/`react-dom 19.2.7`, `@heroui/react 3.1.0`, with no `^`/`~`. The installed `@heroui/react` is 3.1.0.
- **I checked Fern's v2/v3 finding myself:** `src/app/globals.css` uses `@import "@heroui/styles"`, and `grep -rl HeroUIProvider
  node_modules/@heroui/react/dist` → nothing. v3 has no provider, so the skill's samples are v2. Not creating `HeroUIProviders.tsx` is
  **correct**. SPEC-002 is amended: TASK-007..009 follow the installed v3 API (`.d.ts`), not the skill's samples.
- I looked at all four previews (and the drawer one). A and B are clearly more finished than the rejected comp. Thai is not
  clipped. Every status shows a word + icon. Both ติดอยู่ tasks show their reason. A's thread sits beside the list on desktop and
  under the selected task on a phone. B has 4 columns on desktop.
- **One point for the owner's choice (not a defect):** on a phone, **B shows only the first column** (ยังไม่เริ่ม) plus a peek of the
  next. The ติดอยู่ column needs a sideways swipe. The product's point is "where it is stuck", so A shows blockers at once on a phone
  and B doesn't. The PM should say this in one line when showing both.
- Files outside the list (`comp-parts.tsx`, `@types/*`, `devIndicators: false`, extra ignores) are **accepted**, each with its reason.
  So are the unused `dayjs`/`framer-motion` (`Intl` is enough). Remove them in TASK-007 if they stay unused.
- **Q-F1** (close-button label) → routed to the PM as copy. `ยกเลิก` stays until the PM answers. **Q-F2** → the owner's look decides. Kept as is.
- `/impeccable` and the interaction states stay `UNVERIFIED`, as Fern wrote. Both are required in TASK-007 on the real page.
