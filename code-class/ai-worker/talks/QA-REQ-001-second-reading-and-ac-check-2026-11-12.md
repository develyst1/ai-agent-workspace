# QA reply — REQ-001 second reading + AC checkability (2026-11-12, Tanya, QA)

Asked by: the PM, `inbox/QA.md` 2026-11-12 → REQ-001 § "Second reading" and AC-2..AC-7.
Nothing here edits the REQ; the PM decides what to take. Every point is labelled `[QA-proposed]`.

## 1. Second reading — who the front page is for

**My answer: neither of the two readings. A third one, and one check that settles it.**

- **Evidence (verbatim):** *"งานแรก สอน **ลูกค้า**ที่ไม่ได้เรียนเพื่อการเรียน … อยากให้ design folder structure ให้ดูดี ใช้สำหรับการให้คุย fastwork แทน"*
  (owner 2026-11-12, `SYSTEM-FACTS.md` line 37). He calls the first learner **ลูกค้า** of **งานแรก**: a client he already has.
- **Third reading `[QA-proposed]`:** the first reader is **this one client, at the deal stage**. The owner shows him the tidy tree
  and the schedule in the Fastwork chat **instead of** typing out the course plan there, so the client can see what he would
  get. That is a pitch, as reading 1 says, but to one known person and not to the open market. It is also the
  learner's "start here", as reading 2 says, once he agrees.
- **Why it matters for the build:** a pitch to the open market leads with "who is this for / why me". A pitch to one client
  who is already talking leads with **his plan**: what he will learn, in what order, and how long it takes. The tree and the
  schedule are the same either way. Only the order of the front page changes, as the PM's draft already says.
- **On what the other two readings rest:** reading 1 is helped by `SYSTEM-FACTS.md` line 55 *"the repo may be shown to other
  clients"*. That line is **not** in the owner's verbatim words (lines 36–42). It is the desk-open recorder's summary, so
  I would not lean on it as his ruling. The SA's argument (*"ดูดี only matters to someone still deciding"*) fits my third
  reading just as well: this client is still deciding.
- **The distinguishing check, the cheapest one:** has this client already agreed or paid, or is the course plan part of
  closing the deal? That is one yes/no only the owner can answer. **If the PM keeps the one-page design (pitch on top,
  "start here" below), the answer changes no file in REQ-001, so there is nothing to ask.** I agree with not asking. My one
  addition: write the pitch for "a person who is talking with me now", not as a public sales page.

## 2. Are AC-2..AC-7 checkable as written?

Legend: ✅ checkable as is · ⚠️ checkable, but a gap would let a wrong build pass · ❌ not checkable without a rule.

| AC | Verdict | Finding | Suggested change `[QA-proposed]` |
|---|---|---|---|
| AC-2 | ⚠️ | (a) Requirement 2 says **in Thai**, but AC-2 does not, so an English front page passes. (b) "rendered Markdown" on a local clone means my renderer, not GitHub's. Relative links to a **folder** work on GitHub but not in every local preview, so the GitHub half stays `NOT_TESTED` until the owner pushes. | Add "in Thai". Name the local instrument (VS Code Markdown preview). Say that the GitHub check runs after the owner's push and that until then it is reported `NOT_TESTED`. |
| AC-3 | ⚠️ | "No empty cell" is checkable. It does not check **order**: Requirement 3 says "every class in order", but numbers 1, 2, 4 would pass. It also does not say whether the schedule shows the length and frequency that the owner approves at AC-1 (Q2). | Add "numbered 1..N with no gap". Say whether the length and frequency appear on the schedule page. |
| AC-4 | ❌ | "Presented as a feature of only one language" is my own judgement against my own knowledge. Topics like classes/OOP, pointers, list comprehensions and async exist in some languages and not in others, so two testers would give two verdicts. | The SPEC (or the approved AC-1 outline) names, for each basics topic, **two named languages that both have it** (e.g. Python + JavaScript). Then AC-4 = "every basics topic shows up in both named languages". That is checkable, and a FAIL names the topic. |
| AC-5 | ⚠️ | 🔴 **Git does not keep empty folders.** REQ-001 builds the tree **before** any material (Out of Scope + Requirement 7). Empty class folders exist on the local disk, but they vanish from the commit and from GitHub, so AC-5 passes locally and fails for the client. "The folder name matches the class" has no rule: number only? topic too? | Each class folder holds a placeholder file (e.g. a `README.md` with the class number and topic). Define "matches", e.g. the folder starts with the zero-padded class number and the schedule row links to it. Add: **the number of class folders = the number of schedule rows**. |
| AC-6 | ⚠️ | (a) Phone, email and LINE id can be found by a regex search. **Names cannot**: the desk does not know the learner's name, which is correct, so no search can find it. Names are checked by reading every file. That is feasible while the repo is small, so the AC should say so. (b) Ambiguous: is the **owner's own** contact (phone/LINE/email) allowed on the front page? A client page often wants it, but AC-6 as written would FAIL it. | Split it: regex search for phone/email/LINE id/URL handles, plus a full read of every file for names. Then answer: owner's contact on the front page — allowed or not? (Question for the PM, see §3.) |
| AC-7 | ⚠️ | "Nothing was committed" turns a legitimate owner's `ขึ้น git` between build and test into a FAIL. "Not pushed" is checkable read-only with `git status -sb` against the last-fetched `origin/main`. I would not run `git fetch`, so a push from another machine stays invisible. | Reword: "the root commit `54e1529` is unchanged, and any newer commit is one the owner ordered (hash recorded in the log); no new branch (`git branch -a`)". Checked with `git log --oneline`, `git status -sb`, `git branch -a`. All read-only. |

**Requirements with no AC (so nothing would fail if they were missed):**
- **Requirement 6** (fits an adult beginner; no exam/university framing): no AC. Suggest: "QA reads the front page and the
  schedule; any exam/grade/semester/credit wording, or any jargon used before it is explained, is a finding."
- **Requirement 7** (approval before content): could be checked mechanically. Suggest: "after the build, the class folders hold only
  placeholders; no lesson, slide, exercise or example-code file exists". This also guards Out of Scope.
- **Requirement 1, the "without explanation" part:** AC-5 covers finding a class, but not the overview. Suggest folding it in:
  "from the front page, the overview and the schedule are each one click away".

## 3. Questions for the PM (not blocking; I can design TEST-001 around either answer)

- **QA-Q1 — owner's own contact on the front page:** allowed (then AC-6 excludes it) or not? Default if unanswered:
  **not allowed**, and AC-6 stays as written.
  > answer: _(pending)_
