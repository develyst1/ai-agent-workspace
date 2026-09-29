# TASK-519 — 🔴 the coach's calendar link opens a stranger's website **and takes the private token with it** — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-27) · **Size S.** Tanya, TEST-075 D3. **Do this first of the three.**

## §0 What happens
The teacher's calendar reply sends **`webcal://som.develyst.online/api/calendar/<token>`**. **LINE linkifies it as `develyst.online/…`** — dropping the scheme and the subdomain — so tapping it opens **a different site on the root domain** (Tanya's shot: someone else's page entirely).
🔴 **And the token goes with it.** That token **is** the credential for that coach's whole calendar — no login, no expiry. ⇒ **it has been sent to a host we do not control, and is in that host's request logs.**

## §1 Why this is first
**It is the only defect in this round that hands a credential to a third party.** The wrong page is the visible symptom; **the token in someone else's logs is the actual fault.** Everything else Tanya found is a feature not working — this is a secret leaving.

## §2 Build — the link
- **Send an `https://` URL LINE will open correctly** and confirm it survives LINE's linkifier. 🔑 **Prove it against the real rendered message text**, not against your intention: the bug is that what we send and what LINE shows are different things.
- **Say which host is right** — `som…` or `frontoffice…` — and why, from the deployed config rather than from a guess. 📌 **If both work, say which one the customer's phones already trust.**
- ⚠️ **A `webcal://` link is what makes a calendar SUBSCRIBE rather than download.** So say what an `https` link actually does on an iPhone and on Android, and **if the honest answer is "it downloads a snapshot instead of subscribing", stop and tell me** — that would be a real loss of function and the trade is mine to weigh, not yours to absorb.

## §3 🔑 The token — establish, recommend, do NOT rotate
**A rotation invalidates every coach's existing subscription**: their calendar silently stops updating and each one must re-subscribe. **That is a change to 21 coaches' phones and it is the owner's call.**
**What I need from you:**
1. **How many tokens can have reached the wrong host** — from the code path, not the data: every coach who has ever tapped that link. **Say whether we can know, and if not, say so.**
2. **What the token grants** in one line: which calendar, whose sessions, and **whether it discloses anything beyond a schedule** (student names? notes? — you narrowed the public check-in answers, so check this one too).
3. **Whether rotation is even implemented** — is there a way to re-issue a coach's token today, and does anything notify them?
⭐ **My lean, for the owner: fix the link now, rotate deliberately afterwards** — a rotation while the link is still wrong would send fresh tokens down the same hole. 🚫 **Rotate nothing in this task.**

## Definition of Done
- [ ] An `https` link that LINE renders and opens correctly, **proven against the real message text** · the host chosen with a reason from the deployed config · **what an `https` link does to a subscription on both platforms, stated — and STOPPED and reported if it breaks subscribing** · the three token questions answered · 🚫 **no rotation** · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring `webcal://` and one that puts the token in a query string · report here + `inbox/SA.md` + log.

---

# ⏸️ STOPPED as §2 instructs — @Jason (2026-09-27): a plain `https` link would turn SUBSCRIBE into a one-off SNAPSHOT on iPhone. Nothing built, nothing rotated. The three token questions are answered below, and one recommendation keeps subscribing AND keeps the token on our host.

## §1 Where the link comes from (read, not guessed)
- `doTeacherCalendar` (`line-webhook.service.ts`) replies with `tb("cal_link", { url: webcal })`, and `calendarUrls()` (`lib/calendar-link.ts`) builds it as `<PUBLIC_CALENDAR_BASE_URL ?? PUBLIC_CHECKIN_BASE_URL>/api/calendar/<token>.ics` with the scheme swapped to `webcal://`.
- The rendered text puts the URL **alone on its own line**, so a linkifier has clean boundaries. **The scheme is the fault, not the text around it.**
- **The host is per box, from the env files** (only those two keys read): **sid `https://som.develyst.online`**, **uat (the customer) `https://frontoffice.develyst.online`**. Neither sets `PUBLIC_CALENDAR_BASE_URL`, so both fall back to the **check-in** base.
  - ⇒ **No host change is needed or right.** Each box already uses the host its own check-in QR pages use, **which is the host the customer's phones already open.**
  - `som` → nginx 3014/4006 per `SERVER-FACTS.md`. `frontoffice` isn't in Otto's survey (a different box), so its `/api` proxying is asserted by config, not by me.
- The staff endpoint (`POST /teachers/:id/calendar-link`) **already returns the `https` form beside the `webcal` one**, so the https feed URL is an existing, supported shape.

## §2 🔴 Why I stopped: what an `https` link does to a subscription
- **iPhone:** tapping an `https://…/x.ics` link opens it in a browser, and iOS offers to **import the events once** ("Add All"). **A snapshot: it never updates.** Only `webcal://` makes a tap offer **Subscribe** (or pasting the https URL under Settings → Calendar → Accounts → *Add Subscribed Calendar*).
- **Android:** there's no tap-to-subscribe **for either scheme**. A tapped `.ics` downloads and at most imports once, and `webcal://` usually has no handler at all. **Android subscribes only by pasting the `https` URL into Google Calendar → *From URL* (web).** So Android loses nothing from the switch; it never had tap-subscribe.
- ⚠️ **Confidence:** this is platform behaviour I know, **not something I could test** (no device, no OA; agents never touch the real OA). **@Tanya can confirm both** on sid in minutes.
- **⇒ Swapping to plain `https` would silently turn every iPhone coach's "subscribe" into a stale copy.** That's the loss of function you said is your trade, so it isn't built.

## §3 ⭐ The recommendation: an `https` landing page on OUR host (BE-only, small)
- **The LINE reply** sends **`https://<the box's check-in host>/api/calendar/<token>`** (no `.ics`), a plain https URL on our own host that LINE linkifies correctly. **The token only ever goes to us.**
- **That route answers a tiny HTML page** (pre-guard, the token being the credential exactly as the feed is today):
  - a **"Subscribe" button whose `href` is the `webcal://` URL**. Tapped inside a browser, not by LINE's linkifier, **iPhone subscribes as today**;
  - **the `https` `.ics` URL shown to copy**, with one line: *Android: Google Calendar → From URL*;
  - `Referrer-Policy: no-referrer` and `Cache-Control: no-store`, **no third-party assets** (so the page itself can't leak the token onward);
  - an unknown token 404s with the same neutral body as the feed.
- **The feed route (`<token>.ics`) is unchanged**, so every existing subscription keeps working. **Nothing is rotated.**
- ⚠️ **One thing to verify on a device (Tanya):** whether LINE's **in-app** browser hands a `webcal://` tap to the Calendar app. If it doesn't, the page says *"open in Safari"* (LINE has a menu item for it). That's the only unknown left.
- **Alternatives, weighed:**
  - **A LINE URI button:** LINE's URI actions allow http(s) / tel / line schemes, **not `webcal`**, so it would hit the same limit.
  - **A 302 from https to `webcal://`:** it depends on the in-app browser following a custom-scheme redirect, **less predictable than a button the coach taps.**
  - **Plain https now, as a stopgap:** it stops the leak today **at the cost of iPhone subscribing**, and that's your trade.
- 📌 **Until one of these ships, every tap still sends the token to the root domain.** Tapping is the only trigger (the reply itself doesn't leak it; the tap does).

## §4 The three token questions (from code; nothing rotated)
1. **How many could have reached the wrong host? We can't know exactly, and here's the bound.**
   - A token leaks when a coach **taps** the link. The tap happens on their phone and goes to someone else's server, and **nothing on our side records a tap.**
   - Tokens are minted **lazily**, on a coach's first "My calendar" or by staff via `POST /teachers/:id/calendar-link`. So **the upper bound is the number of coaches with a non-null `calendar_token`** (read-only DATA REQUEST: `SELECT count(*) FROM teachers WHERE calendar_token IS NOT NULL;` on each box).
   - The lower bound is unknowable. Staff-minted tokens that were never sent through LINE are inside that upper bound but were never exposed this way.
2. **What a token grants:** **one coach's whole teaching calendar**, 30 days back to 90 days forward, for classes they're primary **or** additional on (TASK-487).
   - Per class: date, start and end, **the child's display name** (`studentNamesOf`: nickname / name, a DUO's "A & B") + the subject, and the status (in the coach's language).
   - **No phone, no parent, no note, no money, no student id, no address.**
   - ⚠️ **But it is the schedule of named children**: *where and when a named minor will be.* That's more than "a coach's timetable", and worth the owner knowing when he weighs a rotation.
3. **Is rotation implemented?** **Yes, per coach, staff-only:** `POST /api/teachers/:id/calendar-link?rotate=true` issues a new 192-bit token, and **the old link 404s immediately**.
   - **Nothing notifies the coach.** Their subscription silently stops updating (and on some phones stays showing stale events) until they re-subscribe with a new link.
   - **There is no bulk rotation.** 21 coaches means 21 calls plus 21 people re-subscribing.
- ⭐ **Your lean holds, and I agree:** fix the link first, then rotate deliberately, with each coach sent the new link **through the fixed path**. Rotating now would send new tokens down the same hole.

## What I need
- **Your ruling:** build the landing page (§3), **or** plain https as a stopgap with the iPhone loss accepted, **or** something else.
- On your word I'll build it with the DoD's proofs: the rendered message text, a mutation that restores `webcal://`, and one that puts the token in a query string.
- **@Tanya's device check** (§2, §3) is the one fact I can't produce.

⛔ Nothing built, nothing rotated.

---

# 🔨 RULING — @Sober (2026-09-27): **build §3, the landing page on our host.** ▶️ Go. 🚫 Still no rotation.

**Stopping was right, and §2 is why I asked the question in that form.** A plain `https` link would have **silently turned every iPhone coach's subscription into a stale copy** — a fix that removes the feature it was protecting, and **the kind of loss that nobody notices for weeks** because a calendar that stops updating looks exactly like a quiet week.
🔑 **And your solution is better than both options I offered.** The token **never leaves our host**, the tap that subscribes happens **inside a browser rather than inside LINE's linkifier**, iPhone keeps subscribing, Android loses nothing it ever had, **and the feed route is untouched so no existing subscription breaks and nothing needs rotating.** That is the whole problem solved rather than traded.
✅ **No host change** — each box already uses the host its own check-in pages use, **which is the host the customer's phones already open.** Established from the env rather than chosen.

## 🔴 One requirement you must add, and it is not in your §3
**This page is a NEW PRE-GUARD PUBLIC ROUTE**, and we spent TASK-499/501 on exactly that class.
- 🔑 **It must be registered in TASK-501's evidence list**, with its own `why` — otherwise **the suite you built will fail, and it should**: that is the test doing its job on its author.
- 🔑 **Build the page's content by ALLOW-LIST**, like `toPublicCheckinBooking`: **the two URLs and fixed words. Nothing about the coach, no name, no class, no counts.** A page that greets the coach by name would hand a stranger with a stale link a person's identity.
- ✅ Keep your `no-referrer`, `no-store`, no third-party assets — **and add `X-Robots-Tag: noindex`**: a URL containing a credential must never be crawlable if it is ever pasted somewhere public.
- **The unknown token 404 with the feed's own neutral body**, as you say.

## The remaining unknown, and who closes it
⚠️ **Whether LINE's in-app browser hands a `webcal://` tap to the Calendar app is the only open question**, and your fallback — *"open in Safari"* — is the right shape for it. 🔑 **Say plainly in the page's own copy what to do if the button does nothing**, because the coach who hits that case cannot ask us. **Tanya confirms it on a device; do not guess it either way in the code.**
✅ **And I am glad you flagged your confidence on §2 as knowledge rather than a test.** Platform behaviour we cannot run is exactly what should be labelled that way.

## §4 — all three answered, and one line changes how the owner should think about rotation
✅ **The bound is honest:** nothing records a tap, so **the upper bound is coaches with a token** (a read-only count) and the lower bound is unknowable. **Said, not estimated.**
🔴 **What the token grants is worse than "a coach's timetable", and your sentence is the one going up: *it is the schedule of named children — where and when a named minor will be.*** That is what the owner is weighing when he decides about rotation, and it would have been easy to describe as "just a calendar".
✅ **Rotation exists per coach, staff-only, and nothing notifies anyone** — 21 calls and 21 people re-subscribing, with **no bulk path.** ⭐ **Your agreement with my lean stands: fix first, then rotate deliberately, sending each coach the new link through the fixed path.**
📌 **And the sentence I am taking to Porter today: until this ships, every tap still sends the token to the root domain.** That is the argument for shipping it on its own rather than with the next round.

## Definition of Done — amended
As before, plus: · the landing page **registered in TASK-501's evidence** with its `why` · its content built by **allow-list — no coach name, no class, no counts** · `X-Robots-Tag: noindex` beside your other headers · the "if the button does nothing" line in the page's own copy · the feed route pinned **unchanged** · 🔑 a mutation that puts anything about the coach on the page, and one that adds a third-party asset.

---

# ✅ REPORT — @Jason (2026-09-27): built as ruled (§3). The LINE reply links to an `https` landing page on OUR host; the subscribing tap happens on the page · the token never leaves us · the feed and every existing subscription are untouched · 🚫 nothing rotated · 3332 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60

## §1 What changed
- **The LINE reply** (`doTeacherCalendar`) sends **`calendarPageUrl(token)`** = `https://<the box's check-in host>/api/calendar/subscribe/<token>`: the token in the **path**, never a query string, **derived from the same base as the feed** (one host decision; no host change).
  - The `cal_link` copy is unchanged ("tap the link and choose Add/Subscribe" still describes it).
- **The page** (`GET /api/calendar/subscribe/:token`, in `routes/calendar.ts` beside the feed):
  - a **Subscribe button whose href is the `webcal://` feed URL** (so iPhone subscribes, as before);
  - **the `https` `.ics` URL** to paste for Android (Google Calendar → From URL);
  - 🔑 **the "if the button does nothing" line IN THE PAGE'S OWN COPY**: *"tap ⋯ → Open in browser / Safari, then tap the button again"*, in TH and EN. The coach who hits that case can't ask us.
  - **Unknown, rotated or too-short token ⇒ the feed's own plain `404 Not Found`** (nothing tells "never existed" from "rotated").
- **The allow-list** (as ruled): `renderCalendarSubscribePage({ webcal, https })` is a pure function whose **signature is the allow-list**. It takes the two URLs and prints fixed words. **It cannot be handed a coach.**
  - The route's only read is `calendarTokenExists` (`columns: { id }`): an existence check, nothing about the coach.
  - HTML-escaped throughout.
- **Headers:** `Cache-Control: private, no-store` · `Referrer-Policy: no-referrer` (+ the meta tag) · **`X-Robots-Tag: noindex, nofollow`** (+ the meta robots) · **`Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`**, which enforces **no third-party asset** rather than merely promising it.
- **The feed `GET /api/calendar/<token>.ics` is byte-unchanged**, so every existing subscription keeps updating. **Nothing rotated.**
- 📖 **The page's words are MY placeholder** (the owner hasn't seen them), marked so in `lib/calendar-subscribe-page.ts`.

## §2 🔴 The new pre-guard public route, registered in TASK-501's evidence
**Exactly as you said, my own suite refused it first:** `🔴 GET /api/calendar/subscribe/:token is registered … ABOVE app.use("/api/*", …) for: authMiddleware, accessGuard, uuidParamGuard, coachRateMask`. It now carries its own `why` in `EVIDENCE`: the landing page, allow-list by signature, the four headers, the 404, and where it's pinned by value.

## §3 Proof (`src/routes/calendar-subscribe-task519.test.ts`, 8 tests)
- 🔑 **Against the REAL rendered message text**, TH and EN: through the real dispatcher (a linked teacher taps *My calendar*), the reply
  - contains **no `webcal` anywhere**;
  - **every** link in it is exactly `https://som.develyst.online/api/calendar/subscribe/<token>` (the reply is bilingual, so the one link appears once per language), **each alone on its own line**;
  - has no `?`, and its host is the box's own check-in host.
- The page URL shares the feed's origin (one base).
- **The page, by value:** 200 HTML; the button **is** the `webcal://` feed URL; the `https` `.ics` URL is shown; the "if the button does nothing" line is present; both languages.
- **The headers, by value:** all four, exactly.
- 🔑 **The allow-list, by value:** the page's **only** URLs are the two it was handed; no `<script>` / `<img>` / external stylesheet / `url(`. **With a teacher row carrying a nickname and name in reach, none of `KK`, `Kanokwan`, the LINE id or the teacher id appears.**
- **Unknown and too-short tokens ⇒ `404 Not Found` plain.**
- The renderer's signature: two strings in, and a hostile value can't break out of the attribute.
- ⚠️ **Not provable here (labelled, not guessed):** what LINE's app does with the text, and whether the **in-app** browser hands a `webcal://` tap to Calendar. **@Tanya confirms on a device.** The page's fallback line covers the "no" case.

## §4 Break-and-watch (database unreachable · CHECKSUM identical before and after · every restore byte-identical · BASELINE=8)
- **W: the reply sends `webcal://` again:** BITES (TH and EN).
- **Q: the token rides a QUERY STRING:** BITES (3).
- **N: the page greets the coach BY NAME:** BITES (3, **including the allow-list test itself**, checked with the full output).
- **S: a third-party `<script>` on the page:** BITES (the allow-list).
- **R: no `X-Robots-Tag`:** BITES (the headers).
- **X: an unknown token still gets a page:** BITES (the 404).

## §5 For the owner (unchanged from my stop report; not acted on)
- **Until this ships, every tap still sends the token to the root domain.** That's the argument for shipping it alone.
- **After it ships, rotation is safe to do deliberately:** per coach, staff-only (`POST /api/teachers/:id/calendar-link?rotate=true`), **the old link 404s at once, nobody is notified, no bulk.** Each coach then needs the new link, **which now reaches them through the fixed path.**
- **What a leaked token disclosed:** one coach's classes, −30/+90 days, **with the children's display names**: *where and when a named minor will be.*
- 📌 **The staff endpoint** (`POST /teachers/:id/calendar-link`) still returns `{ https, webcal }` as before. It isn't a LINE message, so it isn't the leak; **if the staff screen shows staff a link to send on by LINE, it should send the landing-page URL.** That's Fern's, and I haven't checked what that screen shows.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27). **The leak is closed.**
Verified: **3332 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.

🔑 **His own TASK-501 suite refused the new route before I could** — and he says so first. **That is the best evidence I have seen all week that a guard is real:** it was written four tasks ago, by him, to stop exactly this, and it stopped its own author adding an unguarded public route. **A test that only ever catches other people's mistakes is not yet proven.**
✅ **The allow-list is by SIGNATURE** — `renderCalendarSubscribePage({ webcal, https })` can only be given two URLs — so **"no coach name on the page" is not a rule anyone has to keep; the function cannot express a name.** And he pinned it anyway **with a coach's name in reach**, which is the version that proves something.
✅ **Proven against the REAL rendered text through the dispatcher, in both languages** — no `webcal`, only our https link, alone on its line, **no `?`**. The bug was that what we send and what LINE shows differ, so that is the only proof that counts.
✅ Headers as ruled, **plus `CSP default-src 'none'`** which I had not asked for: a page carrying a credential should be unable to fetch anything at all. ✅ Unknown token ⇒ plain 404. ✅ **The feed untouched: no subscription breaks and nothing is rotated.**
⚠️ **Device-only facts labelled, not guessed** — LINE's linkifier and the in-app browser's `webcal` hand-off are Tanya's to confirm, and the page's own copy already tells a coach what to do if the button does nothing. **The person who hits that case cannot ask us, which is why it belongs in the page rather than in a runbook.**

## 📌 His side-note, ruled: **not a task yet, but Fern must know**
The staff `calendar-link` endpoint still returns `{https, webcal}`. **If a staff screen gives someone a link to send to a coach by LINE, it must be the PAGE url** — otherwise a staff member re-creates the leak by hand, one coach at a time. 🔑 **He did not check the FE and says so.** ⇒ **I am asking @Fern what that screen sends** before deciding whether it is a task: *if the screen only copies the `webcal` for a desktop calendar, there is nothing to fix.*
