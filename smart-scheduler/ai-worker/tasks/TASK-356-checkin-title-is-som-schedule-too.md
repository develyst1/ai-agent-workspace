# TASK-356 — `/checkin`'s title is `SOM SCHEDULE` too (`REQ-088 §10.1`, now both LINE-opened pages)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-14)
▶️ **DECIDED by @Porter — your reading, taken.** **Size XS.** ⏱️ **He releases the deploy the moment I say it is
in — so: this, and nothing else.** ⛔ **Chain stopped.**

---

## §1 The ruling
**`/checkin` is the other page a parent opens inside LINE; the owner's reason — *the LIFF header shows the
document title* — is the same there.** ⇒ **page-level `metadata: { title: "SOM SCHEDULE" }` on
`src/app/checkin/page.tsx`, exactly as `/register` has it.** 🚫 **The root layout's `Smart Scheduler` stays for
every other route** — *the admin app keeps its name.*

## §2 What must not change
- 🚫 Anything else on `/checkin` — *it is a query-token page and it is not this task.*
- 🚫 The root `layout.tsx` · `/register`.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok — 🔑 **the prerendered `/checkin` HTML
      carries `<title>SOM SCHEDULE</title>`; every other route's still `Smart Scheduler`** — asserted from the
      build, the way TASK-355 did
- [ ] 🚫 **Nothing else in the diff** — say so
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`SOM SCHEDULE` is now the name of two pages and `Smart Scheduler` the name of the rest — and the customer's
parents only ever see the two.** ⇒ ❓ **Is there anything ELSE a parent sees inside LINE that still says
`Smart Scheduler`** — *a LIFF description, an OG title, a `manifest` name, the check-in link's preview card?*
🚫 **Name them. Build nothing.**

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-14. **One line on `/checkin`; proven from the build; nothing else in the diff.**

```
bunx tsc --noEmit → exit 0
bun test          →  327 pass / 0 fail   (unchanged count — the TASK-355 title test was RE-CUT, not added to)
bun run build     → ok
git status        →  2 modified: src/app/checkin/page.tsx · src/lib/register/register-page.test.ts
```
🚫 **Nothing else in the diff** — `/checkin`'s content, the root `layout.tsx`, `/register`: untouched.

### The line
`src/app/checkin/page.tsx`: `export const metadata: Metadata = { title: "SOM SCHEDULE" };` — with the reason beside
it (the tab/LIFF header a parent sees; page-level; the root's name stays for every other route).

### 🔑 Asserted from the BUILD — every prerendered route's `<title>`, listed
| title | routes |
|---|---|
| **`SOM SCHEDULE`** | `/register` · `/checkin` |
| `Smart Scheduler` | `/` · `/login` · `/scheduler/{attention, badges, bookings, calendar, dashboard, link-requests, overview, people, reports, settings, som, teachers}` — 14 |
| (Next's own) | `_not-found` · `_global-error` |
And in the suite: the TASK-355 title test now asserts BOTH pages carry the metadata line, the root still says
`Smart Scheduler`, **and — by walking every `page.tsx` under `src/app` — that exactly these two pages set a title
of their own.** So a third page growing a title, or one of the two losing it, fails.

### 🔑 Break-and-watch — two mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `/checkin`'s title back to `Smart Scheduler` | **1 fail** |
| 2 | a THIRD page (`/login`) given `SOM SCHEDULE` | **1 fail** |
`md5sum` of `checkin/page.tsx` identical before and after; `login/page.tsx` restored byte-for-byte; suite green after.

### Definition of Done
- [x] Suite **327 / 0** · `tsc` exit 0 · build ok — `/checkin`'s prerendered HTML carries `<title>SOM SCHEDULE</title>`,
      every other route's `Smart Scheduler` — asserted from the build (table above) and in the suite
- [x] 🚫 Nothing else in the diff — two files, both named
- [x] 🔑 Break-and-watch — two, one call, checksum

## Question — **what ELSE does a parent see inside LINE that still says `Smart Scheduler`?** ⚠️ owner's list, nothing built
Swept the front (`src/`, the built HTML `<head>`), the BE's parent-facing text, and what is not in the repo:
1. 🔻 **The `<meta name="description">` — *"Tutoring schedule & attendance management system"*, in English, on BOTH
   parent pages.** It is the root layout's and is inherited; **there is no `og:title` / `og:description` at all**, so
   when a `/checkin` or `/register` link is previewed in a LINE chat, the card is built from `<title>` (now `SOM
   SCHEDULE`) **and this description.** A parent sees the school's name over an English product tagline. *One line
   on each page (`description` in the same `metadata`), the customer's words — a task, not mine to write.*
2. 📌 **The LIFF app's own NAME and description** — shown on LINE's consent screen (*"… wants to access your
   profile"*) and in the LIFF header alongside the document title. **Not in the repo: it is the customer's LINE
   Developers console** — whatever they typed when they created the LIFF app. Only the owner can check it.
3. ✅ **No `manifest`, no `public/` dir, no `apple-mobile-web-app-title`** — nothing named for "add to home screen"
   beyond the title. Nothing to change.
4. ✅ **The LINE chat itself never says `Smart Scheduler`** — the BE's only mentions are the ICS export
   (`PRODID:-//Smart Scheduler//Teacher Schedule//EN`, `X-WR-CALNAME`) — **teachers' calendar subscriptions, not
   parents** — the OpenAPI document (developers), and one test name.
5. ✅ **`/login`'s `<Title>Smart Scheduler</Title>` and the admin header's `appName`** — admin-only, never a parent.
**So: one real item (the description on the two parent pages + no OG tags), one for the owner's console, three
cleared.** 🚫 Named, nothing built.
