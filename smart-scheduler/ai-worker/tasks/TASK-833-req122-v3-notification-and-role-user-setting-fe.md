# TASK-833 — FE: **REQ-122 v3 — NOTIFICATION (2 pages) + Role Setting / User Setting (front office, 2 pages)** — @Fern, ≈ 0.55 d incl. +10%
**From @Sober, 2026-10-21.** Brief: REQ-122 **§8** (+ §7.1–§7.4 words, REQ-120 §9 rulings). Repo: the spec folder (logical name `som-balance-backoffice-spec`; the path is in `machine.local.md`). Plain HTML/JS, **no money, no prices anywhere; an admin view never shows pay.** ⏳ **Waits for @Porter's GO + claims.**

## Do
- **NOTIFICATION:**
  - Notification settings → **Notification Setting** · Staff and admins → **CEO and Staff** · Person → **Who** · OWN ITEMS — ALWAYS → **MYSELF - ALWAYS** · Inbox → **Notification Alert**.
  - **No opt-out ticks** (C-h): everyone always gets all their own. Remove the ticks; the page says so in one plain line.
- **Front office (the shell's FRONT OFFICE group + the "หน้าบ้าน (SOM SCHEDULE)" label):**
  - Teacher: several roles + STAFF → **Role Setting**;
  - web login → **User Setting** · Can see → **Visible** · Not shown → **Invisible** · Own slip only … → **My slip** · Confirm · Create Login → **Create User** · Send Invite again → **Invitation** · What the coach sees… → **After signing in** · See it as Coach → **Individual Information**.

## Done means
4 pages × 3 roles: 0 errors · 0 dead · words string-matched.

---
## ✅ 2026-10-21 — GO (@Porter): **assigned to @Jason** (in parallel with Fern's 831), not Fern
- **Files:** `pages/a-notify/*`, `pages/a-frontoffice/teacher-roles.js` + `coach-login.js`, `data/a-notify.js`. **Do not touch `shell/*`, `pages-a.js` or `index.html`**: they are Fern's (831).
- **Start now with the words + the no-ticks change.** When Fern's 831 publishes the front-office label helper and the date helper (I relay the names in `inbox/BE.md`), switch the two front-office pages and every date to them.
- **Check by opening `index.html`:** 4 pages × 3 roles (CEO / Admin / Coach), 0 console errors, 0 dead buttons, every §7.1 word string-matched. Report the files changed.


## Jason (BE) 2026-10-21 — TASK-833 (REQ-122 v3 prototype: NOTIFICATION + Role / User Setting) — DONE, first pass

**Files changed (spec folder `som-balance-backoffice-spec`; only mine):** `pages/a-notify/settings.js`, `pages/a-notify/inbox.js`, `data/a-notify.js`, `pages/a-frontoffice/teacher-roles.js`, `pages/a-frontoffice/coach-login.js`. Not touched: `shell/*`, `pages-a.js`, `index.html`.

**Words (REQ-122 §7.1), all in place:**
- Notification settings → **Notification Setting** (page title) · Staff and admins → **CEO and Staff** · Person → **Who** (both tables) · OWN ITEMS — ALWAYS → **MYSELF - ALWAYS** · Inbox → **Notification Alert** (page title + the Setting page's header button).
- **No opt-out ticks:** every checkbox is gone; the tables show a static ✓ / – and one plain line says "Everyone always gets all their own items — there is nothing to switch off." (help step 3 says the same in Thai).
- Teacher: several roles + STAFF → **Role Setting**.
- Web login → **User Setting** · Can see → **Visible** (value "My slip · Confirm") · Not shown → **Invisible** · Create login → **Create User** (button + dialog title) · Send invite again → **Invitation** · What the coach sees… → **After signing in** · See it as Coach → **Individual Information**. Help steps updated to the new names.
- The grey "Scheduling app › Teachers › …" bar is now the plain label **หน้าบ้าน (SOM SCHEDULE)** (inline text for now; switch to Fern's 831 label helper when you send its name).
- **Dates carry the year** in the inbox data (21/10/26 10:12, 19/10/26 08:00, 14/10/26 …). Inline text for now; switch to Fern's date helper when you send its name.
- **No money:** the ฿ amounts were removed from every inbox line (CEO and coach). Admin lines never carried pay. Say so if you wanted the amounts kept.

**Checked** by loading `index.html` headless (Chrome, file://) and visiting the 4 pages × 3 roles (CEO / Admin / Coach): **0 console errors · 0 dead buttons · no ฿ on any page**; CEO opens all 4, Admin opens 3 (not Notification Setting), Coach opens only Notification Alert, the others show the friendly no-access screen (as before). The words were string-matched in the rendered text.

**Open:** the sidebar group names (NOTIFICATION / SETTING, caps) are the shell's (Fern, 831); my pages keep `menu: "Notifications"` / `"Front office changes"` so they group with the shell. Help-screenshot pins are left as they were: Tanya re-captures them for the new look (TASK-812 style).

Ball: Sober.

## ✅ 2026-10-21 — @Sober: TASK-833 first pass VERIFIED (shell helpers still to adopt)
- **Words:** all 15 §7.1 targets string-matched across the 5 files, plus "หน้าบ้าน (SOM SCHEDULE)". Every old word is gone (Notification settings · Staff and admins · OWN ITEMS · Can see · Not shown · Create Login · Send Invite again · See it as Coach · Scheduling app · …).
- **No money:** 0 ฿ on any rendered page. The one ฿ in source sits in a code comment. Removing the inbox amounts was right ("no money, no prices").
- **Dates:** every one carries the year (10/10/26 … 21/10/26).
- **Loaded myself** (a local read-only server + the browser pane), 4 pages × 3 roles:
  - 0 console errors · 0 dead buttons;
  - Notification Setting has 0 ticks and the one plain line;
  - the FO label shows on Role / User Setting;
  - the role gates as in v2: Admin can't open Notification Setting; Coach sees only Notification Alert.
- **Left for later:** switch the inline label/date to Fern's helpers when CONVENTIONS v3 names them. They exist in the tree as `SPEC.foLabel` / `SPEC.date`, but they're not published yet. I relay the names when they are.


## Jason (BE) 2026-10-21 — TASK-833 final: switched to the shell v3 helpers — DONE

- **Front-office label:** both front-office pages now carry an empty `.bar2` inside each `.screen`; the shell rewrites it to หน้าบ้าน (SOM SCHEDULE) (`SPEC.foLabel`). No inline text left (not both).
- **Dates:** every date in `data/a-notify.js` goes through `SPEC.date("2026-10-16")` (16 call sites, including the dates inside the Trip / Extra Hour texts); the time follows it ("21/10/26 10:12"). No hand-typed date remains.
- `menu: "Front office changes"` / `"Notifications"` left as they are (Fern renames the headings).
- **Files changed (this step):** `data/a-notify.js`, `pages/a-frontoffice/teacher-roles.js`, `pages/a-frontoffice/coach-login.js`. (`settings.js` / `inbox.js` unchanged since the first pass.)
- **Re-checked** headless, 4 pages × 3 roles: **0 console errors · 0 dead · 0 ฿**; label shows once per screen; dates render dd/mm/yy.

Ball: Sober.

## ✅ 2026-10-21 — @Sober: TASK-833 FINAL VERIFIED (on the shell helpers) → DONE
- **Dates:** 0 hand-typed dates are left in `data/a-notify.js`; each goes through `SPEC.date(…)`.
- **The front-office label:** each `.screen` has an empty `.bar2` that the shell fills. Exactly one label per screen (Role Setting 2/2 · User Setting 1/1); no inline copy.
- **Rendered by me,** 8 role-allowed renders: 0 errors · 0 dead · 0 ฿ · 0 dates without the year.
- @Jason is free.
