# TASK-339 — sweep by SHAPE, because the count has moved four times

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-11)
⚪ **NO CLOCK. Not in any release.** 🚫 No BE change, no migration. ✅ **Nothing a tester can see.**
**Source: your TASK-329 finding.** 🔑 **You named the durable answer and declined to build it inside another
task. That was right, and this is the task it earned.**

---

## §1 The finding, and it is about US rather than the code
**The raw-time count went 4 → 6 → 9 → 11.** 🔑 **Every miss after the first was the SAME SHAPE:**
| how it hid | count |
|---|---|
| a `value=` PROP | **3** |
| a `t()` ARGUMENT KEY | **5** |
⇒ ***"We keep sweeping for a RENDER when three of the eleven are a prop and five are a `t()` argument."***
📌 **Twice the wrong number was mine, twice it was yours, and the shape was identical every time.**
🔑 **So the target is not "find the last raw time". It is *stop counting by eye*.**

## §2 What to build — and TASK-322's rule governs it
✅ **A check for the SHAPE you named:** ***a `time:`-like key inside a `t()` argument object whose value is a
DTO field, unformatted.***
🔴 **PROVE IT FIRST, against a defect it claims to catch** — 📌 *your own TASK-322 lesson, and the reason you
refused to smuggle this into TASK-329:* **re-introduce `time: booking.startTime` at one of the eleven and show
the check fails.** 🚫 **A check that has never failed is a claim.**
⚠️ **And the allow-list rule from TASK-322 applies here too: every legitimate exception carries its REASON at
the entry** — 📌 *you already found two (`CalendarContent:99`'s slot KEY, `BookingModal:776`'s `Select` state),
and those are exactly the entries that must say why.*
🚫 **Report what it finds; do not fix.** ✅ **If it finds nothing new, that is a result and I want it stated.**

## §3 Scope — and the honest limit up front
✅ **Times first, because that is the class we have measured.**
❓ **Then say whether the same shape carries OTHER unformatted DTO fields into `t()` arguments** — 📌 *dates are
the obvious candidate: you already found `CreateCourseModal:174` rendering `{b.date}` raw, and that was a JSX
render, not a `t()` argument.* ⚠️ **Name them; do not widen the check to catch them unless it is free.**
🚫 **Do NOT sweep the BE.** 🚫 **Do not touch `TIME_SLOTS`, `Select` values, or component state.**

## §4 What must not change
- 🚫 Any rendering · `formatTimeDisplay` · `formatDateDisplay` · the contract types · the eleven sites.
- 🚫 **No product-code change at all** — ✅ **`git status` should show test files only, and say so.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] 🔑 **The check exists and FAILS on a re-introduced instance** — ⚠️ *demonstrated, not asserted*
- [ ] **Every allow-list entry carries its own reason**
- [ ] 🔑 **You state the NUMBER it finds** — and 🚫 **whether it agrees with ELEVEN**
- [ ] **Anything new is REPORTED, not fixed**
- [ ] **`§3` answered** — does the shape carry other field types, and did you widen or name
- [ ] 🚫 **No product-code change** — asserted as an absence
- [ ] 🔑 **Break it and watch** — mutation and restore in ONE call, **byte-identity by checksum** *(yours, and
      it is the practice I now expect from both engineers)*

## Question
🔑 **Your `dictionaries.ts:1` example is the best thing in your report:** ***a claim that NAMES ITS ENFORCER***
(`const th: typeof en`) — **and the enforcement is real.**
⇒ ❓ **Could `contract.ts`'s new header do the same, or is there genuinely nothing to name?**
📌 *I am not asking you to build an enforcer.* ⚠️ **I am asking whether the honest version of that header ends
with *"…and nothing enforces this"*** — 🔑 **because if it does, saying so is stronger than leaving the reader
to infer it, and it is the difference between the header you replaced and one that cannot mislead the next
person the way it misled me.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-11. **The sweep finds TWO. It agrees with ELEVEN. And §3's answer is worse than the time one.**

```
bunx tsc --noEmit → exit 0
bun test          →  242 pass / 0 fail   (+4, one new file)
git status        →  ?? src/lib/scheduler/t-arg-shape.test.ts    ← the ONLY entry
```
🚫 No product-code change · no BE change · nothing a tester can see.

### The check
`src/lib/scheduler/t-arg-shape.test.ts` — parses every **bare `t(…, { … })`** argument object in
`src/components`, extracts top-level `key: value` pairs with bracket/string tracking, and flags a `time`-like
key whose value **touches a DTO field** (`.startTime` / `.endTime`) and is **not** wrapped in
`formatTimeDisplay`.

🔑 **The discriminator is the VALUE, not the key — and that is what keeps the allow-list honest.** Five other
`time:` keys exist in this tree (`fmtTime(lastRun.finishedAt)`, `fmtDateTime(data.generatedAt)`, `arrivedText`)
and they are **job-run clocks and pre-formatted strings, not booking times.** Keying on the field access
excludes them **by meaning**, so no exemption has to apologise for them. ⇒ **the allow-list holds only things
that ARE the defect.**

### 🔑 Proven to fail — and it failed from BOTH directions
Re-introduced `time: b.startTime` at `PausedTray:186`:
```
+   "partials/Calendar/PausedTray.tsx:186"     ← appeared in the RAW list
-   "partials/Calendar/PausedTray.tsx:186"     ← vanished from the FORMATTED list
(fail) finds exactly the two already reported — a NEW one fails here
(fail) the sweep actually reaches the code — it sees the FIXED sites too
```
✅ **Restored in the same call; `md5sum` before == after (`83ba1c56…`); suite green after.**
📌 **The second assertion is the one I would keep if I could keep only one:** *a check that finds nothing
because it is looking nowhere passes exactly as quietly as a clean tree.* Pinning the two FIXED sites means the
scanner cannot silently stop reaching the code.

### 🔑 The NUMBER — **2, and it agrees with ELEVEN**
| | |
|---|---|
| `BookingModal.tsx:1140` | `t("booking.blockedDesc", { …, time: blocked.startTime })` |
| `CancelBookingDialog.tsx:80` | `t("cancelBooking.line", { …, time: booking?.startTime ?? "—" })` |
**Exactly the two I reported in TASK-329 §3 — nothing new, and nothing missing.** ⇒ **11 = 9 routed + these 2.**
✅ **Both are allow-listed as KNOWN-OPEN with their reason and the task that owns them**, because §4 forbids
fixing them here. 🚫 **Reported, not fixed.**

### ⚠️ Your two expected allow-list entries are NOT in this check, and should not be
You wrote that `CalendarContent:99` (a slot KEY) and `BookingModal:776` (a `Select`'s state) *"are exactly the
entries that must say why"*. 🔑 **Neither is a `t()` argument** — one is `setCreateSlot({…})`, the other
`notify({ description })`. **They never reach this sweep**, so an entry for them would exempt something the
check cannot see. 📌 **TASK-322's rule cuts both ways: an unexplained entry is bad, and so is an unneeded one.**

### 🔻 A mistake of mine, caught before it reached you
My first scanner stripped comments by **deleting** them and reported line numbers from the shortened text.
**I was one step from quoting those to you as file positions.** ⇒ comments are now blanked to **equal-length
whitespace**, so every offset and newline survives and a reported line is the real one.
🔑 **A sweep whose output cannot be looked up is worse than no sweep** — it sends the next reader to the wrong
line and spends the trust that makes them check at all.

### §3 ✅ ANSWERED — **yes, the shape carries DATES, and it is the money shape again**
Same scanner, `date` keys. **Four raw DTO date fields in `t()` arguments:**
| | |
|---|---|
| `CreateVoucherModal.tsx:121` | `date: result.voucher.expiryDate` — a raw ISO date read by a human |
| `BookingModal.tsx:118` | `date: createSlot?.date ?? ""` |
| `BookingModal.tsx:336` | `date: res.extended.date` — **the make-up's date, straight off a response** |
| `CancelBookingDialog.tsx:79` | `date: booking?.date ?? "—"` — 🔑 **one line above the raw `time:` in the SAME call** |

🔴 **And the reason is the one that made money worse than time: the shared formatter EXISTS and components
still roll their own.** **Five local date/time formatters, in four components:** `fmtTime`
(`AttentionContent:27`), `fmtDate` (`ImportBalanceModal:138`, `SomContent:15`), `fmtDateTime`
(`OverviewContent:58`, `SomContent:16`) — **alongside `formatDateDisplay`.**
⇒ **dates are not the "already solved" sibling I described in TASK-324. They are in money's state: one shared
helper, several private ones.**
🚫 **Not widened, per §3.** ✅ **Widening is one line** — the same scanner with `date` keys and
`formatDateDisplay` — **but it would fail on four sites today, so it is a task with a fix in it, not a check to
smuggle in here.** *(TASK-322's lesson, third application.)*

### Definition of Done
- [x] `bun test` **242 / 0** · `bunx tsc --noEmit` exit 0
- [x] 🔑 **The check FAILS on a re-introduced instance** — demonstrated, **from both directions**
- [x] Every allow-list entry carries its reason — and the five out-of-class keys need none, by design
- [x] 🔑 **The number is 2, and it AGREES with eleven**
- [x] Anything new is reported, not fixed — **nothing new for times; four for dates (§3)**
- [x] §3 answered — **named, not widened**, with the cost of widening stated
- [x] 🚫 **No product-code change** — `git status` shows one untracked test file and nothing else
- [x] 🔑 Break-and-watch — one call, **byte-identity by checksum**

## Question — **could `contract.ts`'s header name its enforcer?**

🔻 **No. There is genuinely nothing to name, and the honest header says so.**

**I checked what an enforcer could be, rather than assuming:**
| candidate | why it is not one |
|---|---|
| a test diffing the two repos | ⚠️ **green-by-absence** where the sibling checkout is missing — *a check that passes because it found nothing*, the failure mode we already rejected in TASK-326 — and **17 of the exports have no BE counterpart**, so it would report 26 differences with 17 correct. |
| codegen | **a different day, and you excluded it.** |
| parsing responses at the boundary | 🔑 **This one is real, and it enforces a DIFFERENT claim.** It would hold *"a type here is this repo's CLAIM about the wire"* against actual payloads — the FE twin of `TASK-333`'s *"parsed, not cast"*. ⚠️ **But it says nothing about lockstep with the BE FILE**, which is the claim the header makes, and it is a large decision. |

⇒ ✅ **For the claim that header actually makes, nothing enforces it, and the honest version ends by saying so.**
📌 **Your instinct is right that saying it is stronger than leaving it to be inferred** — the header I replaced
misled you precisely because *"synced"* let a reader stop. **A header that ends *"and nothing enforces this"*
cannot do that to anyone.**
✅ **The clause, if you want it:** *"⚠️ Nothing enforces this — keeping it in step with the BE is a human job."*
🔻 **I did not write it: §4 forbids any product-code change here, and `git status` showing one test file is
part of this task's evidence.** **One line, yours to cut.**
📌 *(The current header already says **"Nothing here is generated. Keeping it in step with the BE is a HUMAN
job and no test enforces it."** — so the substance is there; what your clause adds is putting it at the END,
where a reader who stops early still meets it.)*
