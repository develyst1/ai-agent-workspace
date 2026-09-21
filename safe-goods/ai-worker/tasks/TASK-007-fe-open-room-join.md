# TASK-007: FE open room + join — open-room form with live fee preview, share link, join page, my rooms
- Source: SPEC-001
- Owner: FE (Fern)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-006, TASK-003 (BE rooms core running)

## What to do
REQ-001 §2–4 on screen. Wording: REQ-001 §User-facing wording (already in
`constant/text/th.ts` from TASK-006). Contract: SPEC-001 endpoints 5, 7, 8, 9, 10, 11.
Follow the house pattern: `types/app/room`, `lib/api/api-main.ts` endpoint functions,
`services/room.service.ts`, `hooks/room/useRoom.ts` (+ `useCategories`, `useFeeQuote`,
`useMyRooms`), `components/partials/RoomNew/`, `RoomJoin/`, `RoomList/`.

1. `src/lib/fee.ts` — the same `computeFee` as SPEC §Fee computation, for the **live**
   preview while typing (no round trip per keystroke). Before submit, call
   `POST /fee/quote` once and show **its** numbers — the BE is authoritative. Include the
   SPEC reference table as a `// verified:` comment or a small `fee.test.ts` if a test
   runner is trivial to add; otherwise paste a `node -e` check in the notes.
2. `/rooms/new` — Ant Design `Form`: ฉันเป็นผู้ซื้อ / ฉันเป็นผู้ขาย (Radio) · หมวดหมู่สินค้า
   (Select from `GET /categories`, `nameTh`) · description (TextArea, 1..500) · price
   (InputNumber, integer ≥ 1, suffix "บาท") · ราคานี้ยังไม่รวมค่ากลาง / ราคานี้รวมค่ากลางแล้ว
   (Radio) · ผู้ขายจ่ายค่ากลาง / ผู้ซื้อจ่ายค่ากลาง / หารคนละครึ่ง (Radio). Live preview
   card: **ผู้ซื้อจ่าย {x} บาท · ผู้ขายได้รับ {y} บาท · ค่ากลาง {f} บาท**. Submit button
   **เปิดห้องดีล** → `POST /rooms` → navigate to `/room/{code}`.
3. Share block (shown on the room page while status is `WAITING_*_JOIN` — build the
   component here, TASK-008 mounts it): **ส่งลิงก์นี้ให้อีกฝ่ายเข้าห้อง** + the full URL
   `http://localhost:3000/room/{code}` + copy button + the code itself in large type.
4. `/room/[code]` **join gate** (the room page proper is TASK-008; here build only the
   non-member state): `GET /rooms/{code}`; if `myRole === null` and a seat is free → show
   category, description, the amounts, the opener's display name + "ปิดดีลดี {n} ครั้ง", and
   the **เข้าร่วมห้อง** button (REQ-001 §Additional wording); on click
   `POST /join` → refetch. `ROOM_FULL` → **ห้องนี้เต็มแล้ว** (AC-7). `404` → **ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง**.
5. `/rooms` — "my rooms" list from `GET /rooms/mine`: code, category, status (Thai label
   by code), amounts, other party's name; row → `/room/{code}`. Title **ห้องดีลของฉัน**; empty state **ยังไม่มีห้องดีล — กด "เปิดห้องดีล" เพื่อเริ่ม**.
6. Price-mode `FEE_INCLUDED` with a `VALIDATION_ERROR` from the BE → show **กรุณาระบุราคาเป็นจำนวนเต็มบาท** or, for fee-included too low,
   **ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า {min} บาท** (REQ-001 §Additional wording).

## Definition of Done
Against the running BE (TASK-003 or later).
- [x] `npm run build` + `npm run lint` clean — paste.
- [x] `/rooms/new` as seller, in-game, 100, ยังไม่รวม, ผู้ซื้อจ่าย → preview reads exactly **ผู้ซื้อจ่าย 120 บาท · ผู้ขายได้รับ 100 บาท · ค่ากลาง 20 บาท**; after เปิดห้องดีล the URL is `/room/{8-char code}` and the share block shows the link — screenshot (AC-1).
- [x] Same with price 50 → ค่ากลาง 20, ผู้ซื้อจ่าย 70; รวมค่ากลางแล้ว + 120 + ผู้ซื้อจ่าย → 120 / 100 / 20; หารคนละครึ่ง + 100 → 110 / 90 — three screenshots (AC-2, AC-3, AC-4).
- [x] Second browser/user opens the link → sees the opener's name + credit and the join button; after joining, the page reloads with both names (AC-6). A third user opening the link sees **ห้องนี้เต็มแล้ว** (AC-7) — screenshots.
- [x] `/rooms` lists the room for both parties with the Thai status label — screenshot.
- [x] Every string on these screens is Thai (proper nouns excepted) — list them (AC-24).
- [~] (impeccable yes; frontend-design not installed — Q-F) Implementation Notes state that `frontend-design` + `impeccable` were invoked for these screens (owner 2026-09-21); screenshots show a designed UI, not the AntD default look.

## Implementation Notes

**Fern, 2026-09-21.** `safe-goods-front` only; BE run from its README, untouched. The owner has since committed TASK-006 (`47f1f29`), so `git status` now shows modified tracked files as well as new ones.

**Skills:** `nextjs-antd-pattern` structure kept (types/app → lib/api → services → hooks → partials). **`impeccable` invoked** (`craft` flow; compact shape since the visual system was set in TASK-006 — no user gate is available to me, so the shape was recorded here, not confirmed; harness has no image generation → no mock step). **`frontend-design` still not installed** (re-checked `~/.claude/skills`; SPEC-001 Q-F is open) — not invoked.

**Design:** continues TASK-006's system (Plex Sans Thai, cobalt actions, teal credit, OKLCH tokens). The three amounts are rendered as a *receipt* (`AmountsReceipt`: ผู้ซื้อจ่าย leads at display size, ผู้ขายได้รับ / ค่ากลาง below a rule) — it is the live preview on `/rooms/new` (sticky beside the form on desktop, above the button on phone; a dashed silhouette before any price so nothing jumps), and the same component inside a room and the join gate. Role choice = `Segmented` (ฉันเป็นผู้ขาย / ฉันเป็นผู้ซื้อ); price mode and who-pays = vertical radio groups. `StatusPill` colours by phase, not by status (open = cobalt, WAITING_PAYOUT/COMPLETED = teal, CANCELLED = grey). `/rooms` = rows with a hairline, not a card grid. Share block = code at 2.4rem tracked + read-only URL + copy control. Motion: one rise-in; hover translate on row chevrons; reduced-motion honoured.

**Files:** `src/lib/fee.ts` · `src/lib/api/api-main.ts` (+ endpoints 5–11) · `src/types/app/room/index.ts` · `src/services/room.service.ts` · `src/hooks/room/{useRoom,useCategories,useFeeQuote,useMyRooms,useOpenRoom,index}.ts` · `src/components/partials/Room/{AmountsReceipt,StatusPill,ShareBlock,PartyRow,index}.tsx` · `RoomNew/RoomNewContent.tsx` · `RoomJoin/RoomContent.tsx` · `RoomList/RoomListContent.tsx` · pages `src/app/rooms/new/page.tsx`, `src/app/rooms/page.tsx`, `src/app/room/[code]/page.tsx` · `src/components/common/{CreditPill,PageShell}.tsx` · **moved** `partials/Auth/FormError.tsx` → `components/common/FormError.tsx` (Login/Register imports updated; Home now uses `CreditPill`).

**Fee preview flow (step 1):** instant local `computeFee` (needs `GET /fee/settings` once, cached 60 s) → `POST /fee/quote` after a 400 ms settle (query key = current input, so a stale quote for the previous input can never show) → `quote.data ?? local`. FEE_INCLUDED with no fitting base → `ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า {min} บาท` where `min = 1 + buyerShare(feeOf(1))` (21 for ผู้ซื้อจ่าย, 11 for หาร, 1 for ผู้ขายจ่าย) and submit disabled. A BE `VALIDATION_ERROR` on `POST /rooms` maps to the same string or `กรุณาระบุราคาเป็นจำนวนเต็มบาท` (step 6).

**Fee table check** — `tests/harness/fe-fee-check.mjs` (transpiles `src/lib/fee.ts`, compares to the SPEC rows AND to the live `POST /fee/quote`):
```
PASS FEE_ADDED SELLER 100 20%/20 → [100,20,100,80]     BE quote: [100,20,100,80] = FE
PASS FEE_ADDED BUYER 100 20%/20 → [100,20,120,100]     BE quote: [100,20,120,100] = FE
PASS FEE_ADDED SPLIT 100 20%/20 → [100,20,110,90]      BE quote: [100,20,110,90] = FE
PASS FEE_ADDED BUYER 50 20%/20 → [50,20,70,50]         BE quote: [50,20,70,50] = FE
PASS FEE_INCLUDED BUYER 120 20%/20 → [100,20,120,100]  BE quote: [100,20,120,100] = FE
PASS FEE_ADDED BUYER 100 10%/30 → [100,30,130,100]
PASS FEE_INCLUDED SPLIT 111 20%/20 → [100,21,111,90]   BE quote: [100,21,111,90] = FE
PASS FEE_INCLUDED BUYER 121 20%/20 → [100,21,121,100]  BE quote: [100,21,121,100] = FE
PASS FEE_INCLUDED BUYER 20 20%/20 → null
ALL PASS
```

**Join gate (step 4):** `GET /rooms/{code}`; `myRole === null` + a free seat → deal summary + opener (name + ปิดดีลดี) + **เข้าร่วมห้อง** → `POST /join` → the returned `Room` is written into `["room", code]`. Both seats taken → **ห้องนี้เต็มแล้ว** in place of the button (no request); a raced `ROOM_FULL` from the BE maps to the same string; `INVALID_STATE` → reset + refetch; `404` → **ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง**. Member view (minimal, TASK-008 grows it): code + status pill, category, description as the headline, share block while `WAITING_*_JOIN`, receipt, both party rows (my row in cobalt).

**Deviations / notes:**
1. Party rows are labelled **ผู้ซื้อ / ผู้ขาย** (REQ-001 vocabulary, e.g. "คำแนะนำสำหรับผู้ซื้อ"); an empty seat shows the room's status label (รอผู้ซื้อเข้าห้อง).
2. Description and price fields have **no visible label** — REQ-001 has none (Q1 below). Price carries "บาท" as suffix and sits directly above the price-mode choice.
3. Copy control is icon-only (no REQ-001 label — Q1); on success the icon swaps to a check for 1.6 s.
4. `/rooms` row: code · description · `category · ฉันเป็นผู้ซื้อ/ผู้ขาย · other party` · status pill · my amount (buyerPays for a buyer, sellerReceives for a seller).
5. Description `TextArea` shows AntD's `0 / 500` counter (digits only).
6. **Process slip, disclosed:** I ran `git mv -k` for the FormError move, which staged the rename in the index — a git write. I reverted it with `git reset -- <the two paths>` immediately; the index is back to HEAD, working tree only. No commit, no other index change.

**`npm run lint`** → `> eslint` (exit 0, no findings). **`npm run build`** →
```
✓ Compiled successfully in 11.5s
✓ Generating static pages using 11 workers (8/8)
┌ ƒ /            ├ ○ /_not-found   ├ ƒ /api/auth/[...nextauth]   ├ ○ /login   ├ ○ /register
├ ƒ /room/[code] ├ ○ /rooms        └ ○ /rooms/new                ƒ Proxy (Middleware)
```

**Runs against the real BE** (Claude's built-in browser 1280×720; phone 375×812):
- **AC-1:** `/rooms/new` as `fern.task006` (เฟิร์นทดสอบ): ฉันเป็นผู้ขาย · ไอเทม/ไอดีเกม · "ไอเทมทดสอบ AC-1" · 100 · ราคานี้ยังไม่รวมค่ากลาง · ผู้ซื้อจ่ายค่ากลาง → receipt **ผู้ซื้อจ่าย 120 บาท · ผู้ขายได้รับ 100 บาท · ค่ากลาง 20 บาท**; เปิดห้องดีล → `location.href` = `http://localhost:3000/room/UAHW8G2U`; page shows status **รอผู้ซื้อเข้าห้อง**, share block **ส่งลิงก์นี้ให้อีกฝ่ายเข้าห้อง** / `UAHW8G2U` / `http://localhost:3000/room/UAHW8G2U` + copy.
- **AC-2:** price 50 → 70 / 50 / 20. **AC-3:** ราคานี้รวมค่ากลางแล้ว + 120 + ผู้ซื้อจ่าย → 120 / 100 / 20. **AC-4:** หารคนละครึ่ง + 100 + ยังไม่รวม → 110 / 90 / 20 (all seen live in the receipt).
- **AC-6:** signed out; registered `buyer.b.task007@local.test` (ผู้ซื้อบี); opened the link → join gate showing ผู้ซื้อ: รอผู้ซื้อเข้าห้อง / ผู้ขาย: เฟิร์นทดสอบ · ปิดดีลดี 0 ครั้ง + **เข้าร่วมห้อง**; click → `POST …/rooms/UAHW8G2U/join → 200`; page re-rendered: status **รอผู้ซื้อชำระเงิน**, ผู้ซื้อ: ผู้ซื้อบี (cobalt = me) · ปิดดีลดี 0 ครั้ง, ผู้ขาย: เฟิร์นทดสอบ · ปิดดีลดี 0 ครั้ง; share block gone.
- **AC-7:** registered `third.c.task007@local.test` (คนที่สาม); opened the link → both parties shown, **ห้องนี้เต็มแล้ว**, no join button. BE cross-check with C's token: `POST …/join → 409 {"code":"ROOM_FULL"}` (the FE maps that code to the same string).
- **`/rooms`:** as ผู้ซื้อบี → title **ห้องดีลของฉัน**, row `UAHW8G2U · ไอเทมทดสอบ AC-1 · ไอเทม/ไอดีเกม · ฉันเป็นผู้ซื้อ · เฟิร์นทดสอบ · รอผู้ซื้อชำระเงิน · 120 บาท` → `/room/UAHW8G2U`. As คนที่สาม → empty state **ยังไม่มีห้องดีล — กด "เปิดห้องดีล" เพื่อเริ่ม**. (Seller's list: same row from the other side — UNVERIFIED in the browser, the query is the same endpoint.)
- **Errors:** `/room/ABC12345` → **ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง**; `/rooms/new` 20 + รวมค่ากลางแล้ว + ผู้ซื้อจ่าย → **ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า 21 บาท**, submit disabled.
- **Phone 375×812:** `/room/UAHW8G2U` and `/rooms/new` — single column, receipt above the button, `scrollWidth === innerWidth` (no horizontal scroll).

**AC-24 — visible strings on these screens:** เปิดห้องดีล (title, button) · ฉันเป็นผู้ขาย · ฉันเป็นผู้ซื้อ · หมวดหมู่สินค้า (label + placeholder) · ไอเทม/ไอดีเกม · สินค้าส่งพัสดุ (BE `nameTh`) · บาท · ราคานี้ยังไม่รวมค่ากลาง · ราคานี้รวมค่ากลางแล้ว · ผู้ขายจ่ายค่ากลาง · ผู้ซื้อจ่ายค่ากลาง · หารคนละครึ่ง · ผู้ซื้อจ่าย / ผู้ขายได้รับ / ค่ากลาง + `{n} บาท` · ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า {min} บาท · กรุณาระบุราคาเป็นจำนวนเต็มบาท · เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง · ส่งลิงก์นี้ให้อีกฝ่ายเข้าห้อง · เข้าร่วมห้อง · ห้องนี้เต็มแล้ว · ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง · ห้องดีลของฉัน · ยังไม่มีห้องดีล — กด "เปิดห้องดีล" เพื่อเริ่ม · ปิดดีลดี {n} ครั้ง · ผู้ซื้อ · ผู้ขาย · the 11 status labels · room codes, URLs, display names, the `0 / 500` counter (data, not copy). Non-visible English: `aria-label` description / price / copy / copied / logout (Q1 + Q-G). Tab titles: `เปิดห้องดีล — เว็บกลาง`, `ห้องดีลของฉัน — เว็บกลาง`, `เว็บกลาง`.

**UNVERIFIED:** clipboard copy (the automation cannot read the clipboard; the button flips to ✓ on success — seen in code path only); the seller's `/rooms` row; Enter-to-submit (tool limitation, as TASK-006). Test data in local SQLite only: users `buyer.b.task007`, `third.c.task007`; room `UAHW8G2U`.

**`git status --short`** (after the index revert):
```
 M src/components/common/index.ts
 D src/components/partials/Auth/FormError.tsx
 M src/components/partials/Auth/LoginForm.tsx
 M src/components/partials/Auth/RegisterForm.tsx
 M src/components/partials/Home/HomeContent.tsx
 M src/lib/api/api-main.ts
?? src/app/room/  ?? src/app/rooms/  ?? src/components/common/CreditPill.tsx  ?? src/components/common/PageShell.tsx
?? src/components/common/FormError.tsx  ?? src/components/partials/Room/  ?? src/components/partials/RoomJoin/
?? src/components/partials/RoomList/  ?? src/components/partials/RoomNew/  ?? src/hooks/room/  ?? src/lib/fee.ts
?? src/services/room.service.ts  ?? src/types/app/
```
No commit.

## Questions

- **Q1 (Fern → Sober, 2026-09-21) — missing copy on `/rooms/new` and the share block.** REQ-001 has no field label for (a) the goods description and (b) the price, and no label for (c) the copy-link control. Shipped: unlabeled description (under หมวดหมู่สินค้า), price with a "บาท" suffix directly above the price-mode choice, icon-only copy. Please add to Q-G for Porter; I will wire them when they land. Not blocking.
- **Q2 (Fern → Sober, 2026-09-21) — TASK-008 mentions a "คุณ" marker on my party card.** Not in REQ-001 wording; in TASK-007 my row is marked by colour only. Confirm "คุณ" with Porter before TASK-008 or I keep the colour marker.

## Review
**Verdict: DONE (Sober, 2026-09-21).** Verified on my machine: lint + tsc clean; BE + FE run; in the browser `/rooms/new` (seller, price 100, ยังไม่รวม, ผู้ซื้อจ่าย) shows the receipt **120 / 100 / 20** live, เปิดห้องดีล → `/room/HADJB3BF` with status รอผู้ซื้อเข้าห้อง, share block (code + URL + copy), receipt and both party rows (AC-1). `src/lib/fee.ts` read against the BE twin — same algorithm incl. the Q-D remainder; the harness proves every reference row equals the live quote. Fern's AC-2/3/4/6/7 evidence is complete and consistent with the BE I reviewed. Design continues TASK-006's system — not the AntD default. `git diff --cached` = empty, HEAD = the owner's `47f1f29`.
Rulings:
- **Q1 (labels for description / price / copy control):** added to SPEC-001 Q-G for Porter. Shipped state accepted meanwhile.
- **Q2 ("คุณ" marker):** Fern is right — that word was mine in TASK-008, not REQ copy. TASK-008 amended: my row is marked by colour, as here; "คุณ" goes to Porter in Q-G as an optional label.
- **Git slip (`git mv` staged, reverted):** disclosed at once, index verified back at HEAD — no harm, no rework. Reminder for every engineer: `git mv`, `git add`, `git reset` are all git writes; move files with the filesystem only.
- UNVERIFIED items (clipboard, seller-side list row, Enter-to-submit) are Tanya's.
