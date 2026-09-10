# TASK-334 — three notifications that send a meaningless line (LIVE)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
🔴 **LIVE — on the deployed build.** 🚫 No migration, no FE change.
⛔ **PART A ONLY when I say so — I have asked @Porter whether it may land during @Tanya's round.**
⛔ **PART B is BLOCKED on copy from the owner. Do not invent it.**
**Source: your own TASK-333 inventory, found while answering "how is a new kind added?".**

---

## §1 What I verified myself, before writing this
✅ **Renderer `case`s: 14. Producer kinds: 14. Three do not overlap.**
✅ **All three reach the outbox through `enqueueLine`** — the teacher one directly
(`teacher-link.service.ts:157`), the two admin ones through `notifyAdmins` (`line-admin.ts:41`/`:48`).
⇒ 🔴 **all three render the default: `🔔 แจ้งเตือนจากระบบตารางเรียน`.** **Your measurement stands.**

## §2 ✅ PART A — `teacher_link_approved`. **It needs NO copy from anyone.**
🔑 **The payload ALREADY carries the right sentence, already translated:**
`payload: { kind: "teacher_link_approved", text: t("verify_teacher_ok", lang, { nick: teacher!.nickname }) }`
⇒ ✅ **one branch that returns `payload.text`.**
⚠️ **Decide and say which:** **a `case "teacher_link_approved"`, or a general *"a payload carrying `text`
renders that text"* rule.** 🔑 **I lean to the SPECIFIC case** — 📌 *a general `text` passthrough is a second
way to make a message, and this file has spent a week removing second ways.* **Argue me out of it if you
disagree; you have twice been right about this shape.**
🔴 **And the comment above that send belongs IN the fix:** *"The bot promised 'you'll be told once it's
approved' — not sending would make it a lie."* ⇒ ***the send happened and the message said nothing. The
promise was kept in form and broken in content.***

## §3 ⛔ PART B — the two ADMIN kinds. **BLOCKED, and not on me.**
**`student_registered`** carries `studentName` and `parentPhone`. **`parent_asked_for_admin`** carries
`lineUserId`.
🚫 **The FACTS are there; the WORDS are not ours.** ⚠️ **By the rule we adopted today, anything I write is a
PLACEHOLDER** — 📌 **and an admin alert is read under time pressure by the owner's staff, which is the worst
place to ship a placeholder.**
✅ **@Porter is asking the owner what an admin should be told.** 🚫 **Do NOT write the copy.**
✅ **What you MAY do inside Part A, if it costs nothing: leave the two branches structurally ready** — 📌 *and
if "ready" means anything more than a named gap, do not do it.*

## §4 📌 The three DEAD branches — named here so they are not lost, NOT fixed
**Your inventory also found `reschedule_requested`, `sick_leave` and `leave_teacher` have a renderer `case`
and NO producer.** ⚠️ **Two of them went unsent as a side effect of TASK-305, which you reported at the time.**
🚫 **Do not delete them in this task.** 🔑 **A dead branch is not a defect; a MISSING one is** — and deleting
code that a requirement may still want is how we lose the record. 📌 **It belongs with the exhaustiveness
work in TASK-333's code half, where the compiler will name them.**

## §5 What must not change
- 🚫 The default branch itself — ⚠️ *it is correct for a kind nobody has written; it is being reached by kinds
  that HAVE been written.*
- 🚫 `notifyAdmins` · TASK-152's SKIPPED row and its reason string · the idempotency key.
- 🚫 `verify_teacher_ok`'s text · the mute behaviour in `doCallAdmin` · no new i18n key.

## Definition of Done — **Part A only**
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **An approved teacher receives `verify_teacher_ok`, with the nickname** — asserted, ⚠️ *and the OLD
      behaviour asserted as gone: the default line must NOT be reachable for this kind*
- [ ] **You say which shape you chose** — a `case`, or a `text` passthrough — **and why**
- [ ] 🔴 **The two ADMIN kinds still render the default** — asserted **with a comment naming them as BLOCKED ON
      COPY**, ⚠️ *so the next reader knows it is a decision and not an oversight*
- [ ] **The three DEAD branches untouched** — asserted as an absence
- [ ] 🔑 **Break it and watch** — mutation and restore in ONE call, restore verified byte-identical

## Question
🔑 **You found this answering *"how would a new kind be added?"* — a DESIGN question, not a bug hunt.**
⇒ ❓ **What other question, cheap to ask, would have found it EARLIER?** 📌 *"Does every producer have a
renderer" is obvious in hindsight and nobody asked it in a year.* ⚠️ **I am not asking for a test** — 🔑 **I am
asking whether there is a family of questions of the form *do these two lists match?* that we could keep,**
📌 *because `withExit`'s eleven, the 17-vs-9 contract exports, and now 14-vs-14-with-3-gaps are all the same
question asked about different pairs of lists.*

---

## ✅ PART A RESULT 2026-09-11 — @Jason. **2017 pass / 0 fail**, 162 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, no new key.
*(Landed together with TASK-335 — same suite run; both reported separately.)*

- [x] 🔑 **An approved teacher receives `verify_teacher_ok`, with the nickname** — asserted
- [x] 🔴 **The OLD behaviour asserted GONE** — the default line is not reachable for this kind
- [x] **The shape chosen and why** — below
- [x] 🔴 **Both ADMIN kinds still render the default**, asserted, **with `BLOCKED ON COPY` in the source**
- [x] **The three DEAD branches untouched** — asserted as an absence
- [x] 🔑 **Break it and watch** — the `case` removed → **3 fail**; restore **byte-identical**, 0 markers

### ✅ The shape — **a specific `case`, and @Porter's reason is better than the one I had**
I would have argued *"a general passthrough is a second way to make a message"*. **His is sharper:**
> ***a general passthrough would make every future payload's `text` field silently load-bearing — a field
> added for LOGGING becomes a message nobody meant to send.***
📌 **The difference matters:** mine is about tidiness, **his is about a failure that would arrive later and
look like nothing.** ✅ It is in the code, above the branch.
🔑 **And the sentence you asked for is in there too** — *"the send happened and the message said nothing. The
promise was kept in FORM and broken in CONTENT."* — **asserted**, so a reader who has it will not delete the
branch as dead.

### 📌 Two details I decided inside Part A, both small
- **A blank `text` falls back to `ob_default`** rather than sending an empty message. 🔑 *A poor message must
  never become NO message* — the same rule as TASK-333's `§2`. Asserted for `""`, whitespace, `null`,
  `undefined`. ✅ It reuses `fieldValue` rather than adding a second emptiness rule.
- ⚠️ **The text is pre-rendered at APPROVAL time**, so it carries the language the teacher had then rather than
  at send. **Named in the code so it is not mistaken for a bug later** — approval and send are seconds apart,
  and it is a consequence of the existing payload rather than of this fix.

### ⛔ Part B — untouched, and the code now says WHY
Both admin kinds still render the generic line, and the comment beside `default` names them as **BLOCKED ON
COPY** and **PARKED by the owner**, so the next reader meets a decision rather than an oversight. 🚫 I wrote no
copy and left no scaffolding — *"if 'ready' means anything more than a named gap, do not do it."*

---

## ❓ THE QUESTION — **yes, there is a family, and it has a name: *the two lists that must match*.**

**Every one of the examples you gave is the same question about a different pair:**
| pair | the question | what it found |
|---|---|---|
| `withExit` sites ↔ screens the copy names | *does the rule reach every site?* | 🔴 11 vs 2 ⇒ TASK-323's whole scope |
| contract exports ↔ what the FE imports | *is anything exported that nobody reads?* | the 17-vs-9 |
| **producer kinds ↔ renderer cases** | *does every message have somewhere to be rendered?* | 🔴 **this defect, live for a year** |
| i18n keys ↔ keys any code renders | *is any string unreachable?* | not asked yet |
| `TEMPLATE_FIELDS` keys ↔ `TemplateKey` | *is any template unrenderable?* | **held by the compiler already** |

### 🔑 What makes it a family rather than a coincidence
***Both lists are DERIVABLE by grep, and neither one imports the other.*** ⇒ **nothing makes them agree**, and
the disagreement is invisible because **each side is individually correct**: a producer that enqueues is
working, a renderer with a `case` is working. 📌 **`teacher_link_approved` SENT successfully every time.**
⚠️ **That is why a year passed: there is no failing state to notice.** ⇒ ***the defect is not in either list;
it is in the empty space between them, and nothing in the language points at empty space.***

### ✅ The cheap question, and it is one sentence
***"What two lists here are supposed to match, and what makes them?"***
📌 **If the answer to the second half is *"someone remembers"*, that is the finding** — you do not even have to
run the diff to know it is worth running.
🔑 **And it is cheaper than it sounds because the answer is usually one of three:** the compiler (`Record<K,V>`
— this repo does it three times and those pairs have never drifted) · a test · **nothing.**

### ⚠️ Where I would NOT keep it as a standing sweep
🚫 **Not as a recurring audit** — most pairs are held by the compiler, and re-running those costs attention for
nothing. ✅ **Ask it when a list GAINS a member**: a new kind, a new export, a new call site. 📌 *That is the
moment the two lists can diverge, and it is the only moment.* ⇒ **it belongs beside the "count the call sites"
question, asked at the same time and for the same reason** — 🔑 **both are *what else is supposed to move when
this moves?***

**BALL: @Sober — Part A done. ⛔ Part B still blocked on copy.**
