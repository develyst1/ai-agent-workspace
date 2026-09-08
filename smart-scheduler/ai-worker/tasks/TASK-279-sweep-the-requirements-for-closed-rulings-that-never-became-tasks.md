**Status:** IN PROGRESS (Sober 09-07). ✅ REQ-079 SWEPT — written into that file as §19: eleven closed rulings, each now carrying a task id or the sentence saying it needs no work; TWO had neither (the date format ⇒ TASK-277/280, the phone format ⇒ TASK-278 §6). ⏳ STOPPED AT: REQ-079 only. Next, in order: REQ-076 · REQ-077 · REQ-082 · REQ-083.

# TASK-279 — sweep the requirements for CLOSED rulings that never became tasks

**Assignee:** **@Sober (mine)** · **From:** @Sober (2026-09-07) · 📌 **No clock. Blocks nothing.**
🚫 **No code. No repo touched.** This is a read of `requirements/` against `tasks/` and the board.

---

## §1 Why this exists
**Two decisions in `REQ-079` were closed and never carried:**
1. **§17 — the birth-date format** (`วัน-เดือน-ปี`, owner 2026-09-06). Unbuilt for a day; **TASK-275 then
   translated the overruled prompt into English.** Fixed as TASK-277.
2. **§3c — *"phone shown formatted"***. Two of its three items were built, this one was not. Folded into
   TASK-278 §6.

**Both were found by @Jason, while looking for something else.** 🔑 **Once is a slip; twice in one file is that
there is no mechanism.** ⇒ the mechanism is now in `SA-Lead.md` (*a closed ruling names its task or says "no
work"*) — **and that rule only protects decisions closed from today.** **This task is the backlog.**

## §2 What to do
**For every `requirements/REQ-*.md`, find each section marked ✅ CLOSED / ANSWERED / SETTLED and, for every
ruling in it, establish one of three states:**
| state | evidence required |
|---|---|
| **carried** | a TASK id — and it exists |
| **needs no work** | the sentence saying why *(unchanged · deferred · already built)* |
| 🔴 **neither** | **the finding** |

⚠️ **Write the answer INTO the requirement**, at the closing entry, in the shape `SA-Lead.md` now demands.
**A sweep whose result lives only in a log is the same failure one level up.**

## §3 How to keep it honest
🔴 **"Already built" is a CLAIM and needs a file and a line**, not a memory. **@Jason's §3c answer is the
standard**: he named `CONFIRM` in `line-add-student.ts:47` and `parentChildrenNames` at
`line-webhook.service.ts:1132` — **and that is how he could be certain the third item was the only gap.**
🚫 **Do not cut tasks while sweeping.** **Produce the list, then decide** — a sweep that stops to build finds
less, and half of what is found will already be superseded by a later section.
⚠️ **Read the whole section, not the ruling.** §17's date entry also carried *"the confirm step is now
load-bearing"* — **a consequence, not a decision**, and consequences are what get dropped.

## §4 Scope, and where to stop
**Start with `REQ-079`** — it is proven to contain misses and is the one under active work. Then the REQs that
have shipped most recently: **`REQ-076` · `REQ-077` · `REQ-082` · `REQ-083`.**
🚫 **Do not sweep the whole folder in one pass.** ⇒ **it is fifty-plus files, and a sweep nobody finishes is
worse than one that is honestly partial: it makes the backlog look checked.** **Say where you stopped.**

## Done when
- [ ] `REQ-079` fully swept, every closed ruling in one of the three states, **written into the REQ**
- [ ] The four recent REQs swept the same way
- [ ] **A list of findings** — and each is either a task or a stated "no work", **decided after the sweep**
- [ ] **Where the sweep STOPPED is written down** — by file, not by feeling
- [ ] 🚫 No code, no repo touched, no task cut mid-sweep
