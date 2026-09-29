# TASK-478 — `REQ-108` the shop-front check-in page at a URL that is about to be PRINTED — phone → child → class → checked in — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-25) · **Size M.** 🔴 **Urgent: the customer is printing a poster with this URL on it.** Against TASK-475's contract (§4 of that file), which is built and reviewed.

## §0 🔴 THE URL IS FIXED AND PRINTED — it can never change
**`https://frontoffice.develyst.online/checkin/shop`** — the host is the one the backend already uses on `uat` (`PUBLIC_CHECKIN_BASE_URL`), so the route is **`/checkin/shop`**, beside today's `/checkin` and `/checkin/camp`.
⚠️ **Khwan is printing this on a poster.** Once it is on a wall it cannot be renamed, redirected or tidied — a paper QR does not rotate and cannot be re-issued. So:
- 🔑 **Pin the route's existence by value** — a test that fails if `/checkin/shop` stops answering. Say in the file *why* the path is frozen, so the next person tempted to "tidy the routes" meets the reason rather than a mystery.
- **No token, ever.** The page takes no `?token=`; the phone is the credential (the owner's ruling, REQ-108 §5). A token would expire and a printed poster cannot be re-printed.
- **The Settings QR panel builds this URL from the same env value the backend uses** — never a literal typed twice. One source, or the day the host changes the poster and the panel disagree.

## §1 The page — three steps, and the second one is the guard
1. **Phone.** One field, the site's existing shape. Submits to `POST /api/checkin/shopfront/lookup`.
2. **Children and their classes.** The server returns **only what can be checked in right now**, grouped by child. 🔴 **When it returns nothing — unknown number, no class now, a suspended family, anything — the page shows ONE neutral sentence and NO names, and it must look and behave identically in every one of those cases.** The server already makes them indistinguishable; **do not undo that on the client** by, say, a different message when the list is empty versus absent, or by a retry that only happens for one of them. Pin it.
3. **The class, then Check in.** `POST /api/checkin/shopfront` with the phone and the chosen id. The reply is the same one today's check-in page already renders (`already` / the booking / the remaining count; a camp day's own shape) — **reuse that rendering, do not write a second one.**
- **Rate limited:** a `429` shows the neutral "please try again shortly, or ask the front desk" — never a technical word, never a hint about whether the number exists.
- **`409 NOT_CHECKINABLE`** (the class stopped being check-in-able between the two steps — it happens at the door) ⇒ the neutral sentence and back to the list, refreshed.
- Copy in **both languages**, counted. A poster's audience includes people who have never used the app: plain words, big targets, no jargon.

## §2 What this page must NOT do
- 🚫 No child's name, class or teacher on screen before the phone matched something check-in-able.
- 🚫 No "phone not found" — it is indistinguishable from "nothing right now" by design.
- 🚫 No second implementation of the check-in reply, of the window rule, or of anything the API decides.
- 🚫 No storing of the phone (no autofill of the last one, no `localStorage`) — it is a shared device on a counter. **Clear the field after a successful check-in and return to step 1**, so the next family does not see the last one's screen.

## §3 The printable QR — Settings
A small panel: the QR (reuse `QrDialog` / `qrcode.react` from the camp work) over the printed URL in text, and a print button. It is a shop-wide artefact, so Settings is its home. 📌 The text URL under the QR matters: it is what someone types when a camera fails.

## Definition of Done
- [ ] `/checkin/shop` answering, **pinned by value with the reason written down** · the three steps by value · **the four "nothing" cases identical on screen** (pinned) · no names before a match · the reply rendering reused, not rewritten · 429 and 409 neutral · the field cleared after success, nothing stored · the Settings panel with the QR and the text URL from the shared env value · copy both languages, counted · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-25. **`/checkin/shop` is live and in the build's route list; the phone is the credential; the four "nothing" cases are one.**

```
bunx tsc --noEmit → exit 0
bun test          →  586 pass / 0 fail   (was 578; +8 — new lib/checkin/shopfront.test.ts)
bun run build     → ok — the route list contains `○ /checkin/shop`
git status        →  4 new + 1 new test · 3 source modified (CheckinContent · SettingsContent · dictionaries)
```
Built to TASK-475 §4. No BE change. 🚫 No deploy asked.

### 🔴 The printed URL
- **`SHOPFRONT_PATH = "/checkin/shop"` is written ONCE** (`lib/checkin/shopfront.ts`), and the reason sits beside it and
  again in `app/checkin/shop/page.tsx`: *a paper QR cannot be rotated, re-issued or redirected — every scan of that
  poster for as long as it hangs arrives here, so do not rename, nest, redirect or "tidy" this route; add one instead.*
  The test says the same in its own header, so whoever it stops meets the reason and not a mystery. **Mutation 1 renames
  the route file and the suite fails; mutation 2 drifts the literal and two tests fail.**
- **No token anywhere** — asserted absent from the page, which reads no search params at all (that is also why it needs
  no `Suspense`, unlike `/checkin`). The phone typed at the counter is the credential (the owner's ruling).
- **The poster's URL comes from the ONE env value the backend uses:** pure `shopfrontUrl(NEXT_PUBLIC_API_URL)` strips a
  trailing slash and the `/api` segment (value-tested, incl. `undefined` ⇒ a relative `/checkin/shop`, never a hardcoded
  host). The Settings panel calls it; it types no host of its own (mutation 3), and keeping `/api` breaks it (mutation 4).

### 🔴 The guard — step 2
**Unknown number · nothing right now · a suspended family · a known child whose list is empty** all reach ONE pure
`isNothingToOffer`, which the page turns into ONE phase, ONE sentence, **no names, no count, the same controls**. And
two things I pinned after trying to break it:
- **The page never reads `children` itself.** A mutation that added `if (!data.children) { setNotice("Phone not found") }`
  walked past my first pins — the shape of the leak this page exists to prevent. Now the page cannot ask the question at
  all; only the pure helper can (mutation 6).
- **No literal sentence in the page** (every line comes from the dictionary) and **the rows render in exactly ONE place**
  — a mutation that listed the names under the neutral sentence now fails (mutation 8).
**Every refusal is the same neutral line** — a 429, a 409 `NOT_CHECKINABLE`, a 400 (not phone-shaped) and a dead network:
"please try again shortly, or ask the front desk". Naming the 429 fails (mutation 7). The 409 path goes back to a
**refreshed** list rather than guessing, because it happens at the door.

### The act, the reuse, the shared device
- **`checkinBody`** sends the phone AGAIN (the server keeps no state between the calls) and exactly ONE id, by kind —
  📌 **pinned by KEY SET** after a slip: `toEqual` treats an `undefined` value as an absent key, so a body carrying both
  ids with one `undefined` passed the first two assertions (mutation 10 catches it now).
- **The reply is not re-implemented:** `CheckinContent` now exports `SuccessView` / `CampSuccessView` (with a note saying
  why) and this page renders them — remaining line, `already`, the camp day's own shape, all of it (mutation 11).
- **Nothing is stored:** no `localStorage`, `autoComplete="off"`, and the number is cleared on success **and** on
  start-over, so the next family never meets the last one's screen (mutations 12, 13).
- **No client phone rule:** the submit needs a non-empty field and nothing more — whether it is phone-shaped is the
  server's 400, and a client format test would both disagree one day and leak "this looks like a real number"
  (mutation 14).
- 📌 I also deleted a guard I could not pin: `offerRows` re-checked `isNothingToOffer`, which can never change a result
  (an empty list flattens to nothing anyway). A guard no test can hold is a comment pretending to be code — ONE place
  decides emptiness now.

### §3 The Settings panel
The shared `QrPanel` (one QR component in this repo, from the camp work) over **the URL in text** — that text is what
someone types when a camera will not focus — and a print button. It sits above the rules list, because printing it is
what staff come to that page for.

### 🔑 Break-and-watch — fourteen, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | the route is renamed ("tidied") | **1 fail** |
| 2 | the path literal drifts from the poster | **2 fail** |
| 3 | the QR panel types the host itself | **1 fail** |
| 4 | the poster URL keeps the `/api` segment | **1 fail** |
| 5 | a known family with no class is told apart from an unknown number | **1 fail** |
| 6 | an absent list is told apart from an empty one | **1 fail** — 📌 slipped first; the page may no longer read `children` |
| 7 | the 429 says what it was | **1 fail** |
| 8 | the neutral phase shows the names too | **1 fail** — 📌 slipped first; rows now render in one place only |
| 9 | the phone is not sent on the check-in call | **1 fail** |
| 10 | both ids ride | **1 fail** — 📌 slipped first; pinned by KEY SET, not by `toEqual` |
| 11 | the reply is re-implemented instead of reused | **1 fail** |
| 12 | the phone is remembered for the next family | **1 fail** |
| 13 | start-over keeps the last number on screen | **1 fail** |
| 14 | a client phone rule decides instead of the server | **1 fail** |
`md5` identical on the four mutated files; the renamed route restored byte-identical.

### Definition of Done
- [x] `/checkin/shop` answering (in the build's route list), **pinned with the reason written down**
- [x] The three steps by value · **the four "nothing" cases identical** · no names before a match · the reply reused
- [x] 429 and 409 neutral · the field cleared after success, nothing stored · the Settings panel from the shared env value
- [x] Copy +12 both languages · **586 / 0** · `tsc` 0 · build ok · 🔑 fourteen mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya, on a PHONE (the poster's audience will be standing at a counter): open `/checkin/shop` ⇒ one field, big
button; type a number with a class starting now ⇒ the child's row(s) ⇒ tap ⇒ the same confirmation the LINE link shows
(including `Remaining`); tap *Done — next family* ⇒ the field is EMPTY again. Then: a made-up number ⇒ *"Nothing to
check in right now…"*; a real family with nothing today ⇒ **the identical screen** (this is the one to look at twice);
a suspended family ⇒ the same again. Hammer the button to trip the 429 ⇒ *"Please try again shortly…"* and nothing
technical. Settings ⇒ the QR panel; scan it with a camera and confirm it lands on this page, and read the text URL
under it aloud — it must match the poster exactly.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **586 pass / 0 fail** both times · tsc 0 · `src/app/checkin/shop/page.tsx` present · `SHOPFRONT_PATH = "/checkin/shop"` written once in `lib/checkin/shopfront.ts`.
**Four things, and three of them come from her breaking her own work.**
1. 🔴 **The pin that matters most is the one she added after a mutation walked past her first ones: the page may not read `children` at all.** Her first pins checked the four "nothing" cases rendered alike — and a mutation that added `if (!data.children) setNotice("Phone not found")` **slipped past every one of them**, because it fired on a *fifth* shape none of the fixtures produced. The fix is the right one: forbid the page from touching that field, and forbid it from holding a literal sentence. **A guard written as "these four cases look the same" is weaker than "the page cannot tell them apart."**
2. 📌 **The body's key set, not its values.** A both-ids body slipped because `toEqual` treats an `undefined` value as an absent key — so a request carrying *both* a booking id and a camp id read as correct. Pinning the KEY SET is the fix, and that trap is worth carrying: our habit of `toEqual` on request bodies has this blind spot everywhere.
3. **She deleted a guard she could not pin** (`offerRows` re-asking emptiness, which cannot change a result) rather than leave unreachable code looking like a safeguard — the same instinct as TASK-456's unreachable branch, and it is becoming a habit worth naming.
4. **The printed URL is frozen in one place with the reason beside it, in the route file, and repeated in the test header** — so the person who trips the failing test is told *why* before they start "fixing" it. Renaming fails one test, drifting the literal fails two. The poster's URL is built from the same value the backend uses, and the QR panel types no host.
**Everything else as asked:** no token, the reply rendering reused rather than rewritten (`SuccessView`/`CampSuccessView` exported with the reason), a 409 returning to a **refreshed** list, nothing stored on a counter device, the field cleared on success and on start-over, and the Settings panel carrying the URL in text under the QR for the day a camera fails.
