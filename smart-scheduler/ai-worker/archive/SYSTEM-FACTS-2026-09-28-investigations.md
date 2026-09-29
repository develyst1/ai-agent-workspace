# SYSTEM-FACTS investigations — archived verbatim 2026-09-28

> Marie ORDER 12.5, owner-approved 2026-09-28. Executed by Porter (PM, smart-scheduler).
> **Nothing here was deleted.** Each section below is the VERBATIM body that stood in
> `ai-worker/SYSTEM-FACTS.md` under the same heading, before it was distilled to a short
> entry there. The pre-split file in full is `SYSTEM-FACTS-2026-09-28-pre-split.md`.
> Headings are the ORIGINAL headings, so a search for either heading finds this file.


---

## §PARKED LINE inbound — verbatim body, archived 2026-09-28

> Original heading, and it is SUPERSEDED: the parked diagnosis dated **2026-09-08** was
> **wrong** — the cause was ours (`ecosystem.cjs`), not the customer's console. Kept dated,
> not deleted, because the pair is how a reader knows the rule changed.

## 🅿️ PARKED — LINE inbound stopped working when the customer moved from the demo OA to their own (2026-09-08)

**Symptom:** typing into the customer's OA produces **no `[line-in]` lines on `uat`**, where the same act on `sid`
produces them. ⇒ **inbound webhook events are not reaching `uat` at all.**

🔴 **The timeline is the evidence, and it is the customer's own words via the owner:** *"ตอนแรกของเขาก็ใช้งานได้
อยู่ แต่เหมือนอยู่ ๆ ตอนเขาแจ้งว่าเปลี่ยนจากที่เคยต่อ demo ไปต่อตัวจริงแล้วนะคะ ก็ใช้ไม่ได้เลย"*
⇒ **It WORKED, then stopped AT THE MOMENT THEY SWITCHED OA.** **Nothing we deployed sits at that boundary.**

**Four candidates, in the order worth checking — the third is the one that fits their own stated goal:**
1. The **webhook URL** on their LINE console does not point at `uat` *(they were told to switch it there to test;
   it may never have been switched, or was switched back)*.
2. **`Use webhook` is OFF** in LINE Official Account Manager — **a separate switch from the URL.**
3. 🔴 **The OA is in CHAT mode rather than BOT mode.** **LINE sends no webhook at all in chat mode**, and **the
   customer's stated intention is that admins answer in the same account** — so this setting is exactly the one
   they would have reached for.
4. `uat` logging at a different level from `sid` — cheap to rule out, last.

⚠️ **Consequence while it stands: NOBODY can link on the customer's OA**, which means **inbound LINE is dead
there and nothing can be verified through it.** 📌 **OUTBOUND is unaffected** — notifications ride the channel
token, not the webhook. ⇒ **silence at 08:00/08:15 would prove nothing about the message code.**
🅿️ **Owner's call, 2026-09-08: parked pending the customer's answer.** *"ช่างมันเถอะ รอเขามาตอบ … อันนี้ค่อยดู"*
**It is a setting on their console, not a defect in our build.**

---

## §SOLVED ecosystem.cjs — verbatim body, archived 2026-09-28

> Original heading below. The settled facts and the standing rules were left in SYSTEM-FACTS.md;
> this is the full finding plus the four-consequence escalation and its same-day closure.

## ✅ SOLVED 2026-09-08 (owner) — LINE inbound was dead because **`ecosystem.cjs` HARD-CODED the demo LINE credentials on `uat`**
🔴 **UNPARKS and CORRECTS the section above.** **I wrote there: *"It is a setting on their console, not a defect
in our build."* THAT WAS WRONG. It was ours, on our server.**

**The owner's finding:** he changed `.env` on `uat` and **the value did not change**. Logging showed the process
still holding the **demo** channel secret + token. **`pm2`'s `ecosystem.cjs` had the LINE credentials written
into it literally**, so the `env` file was never consulted. ✅ **Fixed to read from `env` always.**
🔑 **Why the symptom looked exactly like a customer-console problem:** inbound webhooks are verified with the
**channel secret**. **With the DEMO secret loaded, every signed request from the CUSTOMER'S OA failed
verification and was dropped** ⇒ **no `[line-in]` lines, no error anyone would notice, and the failure appeared
at the exact moment they switched OA.** **All four of my candidates were on their side. None of them was it.**

### 🔴 CONSEQUENCES that do NOT go away with the fix — check these before trusting anything LINE on `uat`
1. **OUTBOUND on `uat` was riding the DEMO token.** ⇒ **anything `uat` sent went to the DEMO OA's users, not the
   customer's.** **The customer's parents received NOTHING from `uat`, and the demo OA may hold real messages
   about real students.**
2. 🧊 **PENDING DEPLOY item 5 was frozen on a FALSE premise** — its note says *"the server now points at the
   CUSTOMER'S OA"*. **It did not. It pointed at demo.** ⇒ **the three unknowns behind that freeze must be
   re-asked, not resumed.**
3. **Which OA holds the six rich menus?** `publishRichMenus` uses the **token** ⇒ **they were published to
   whichever OA the token named.** **The 09-05 phone confirmation was on the owner's demo OA.** ⇒ **the
   customer's OA may have NO menus at all**, and *"the menus exist"* is unverified there.
4. **`family_line_links` rows written from `uat`** carry userIds **scoped to the DEMO provider** ⇒ **they may
   match nothing on the customer's OA.**

📌 **The lesson worth keeping: a value in TWO places, where one silently wins, is invisible from the outside.**
**Everyone could read the `.env` and everyone was reading the wrong file.** ⇒ **the same class as the two Thai
sentences and the two live-status lists we hit the same week.**

### ✅ ALL FOUR CONSEQUENCES CLOSED, same day — I over-escalated them and the owner closed each one
**Recorded because the escalation is on the record above and must not outlive its answer.**
1. **Outbound rode the demo token** — **TRUE and HARMLESS.** **Inbound was dead, so NOBODY was ever linked on the
   customer's OA** ⇒ **no parent was waiting for a message that never came**, and what `uat` did send went to
   the owner's own demo test accounts. **Nothing to fix.**
2. **The frozen item-5 note states a false premise** — **a document correction, not work.**
3. 🔑 **"The customer's OA may have NO menus" — TRUE, AND IT IS THE INTENDED STATE.** **The owner removed them
   deliberately on 09-08 with the team's `line:remove-menus` tool**, because *"ลูกค้าบอกให้เอาออกก่อนเพราะกลัว
   ลูกค้าเขาเห็น ยังไม่พร้อมใช้งาน"*. ⇒ **absence is the decision, not a symptom.**
4. **`family_line_links` rows are demo-scoped** — **TRUE and inert: nothing to collide with, since nobody had
   linked on the customer's OA.**
🔻 **The lesson is mine: I derived four consequences from one true mechanism without checking any of them against
what we had already DONE ON PURPOSE.** **Item 3 was an instruction I carried myself, eight hours earlier.**
⇒ **a consequence chain is a hypothesis list, and I presented it as a findings list.**
🟢 **LINE inbound on the customer's OA is WORKING — the owner's screenshot: `สมัคร` → the bilingual entry message
with `ผู้ปกครอง · ครู · แอดมิน`. Nothing is outstanding from this fix.**

---

## §Project info — verbatim body, archived 2026-09-28

> Board context, not knowledge. This is the block that was moved OUT of `board.md` on 2026-09-09
> in the incident that started the SYSTEM-FACTS bloat. The durable part is now back in `board.md`,
> immediately under its title line.

## Project info

- Scheduling + back-office ERP for a balance/wheeled sports activity centre. Repos by logical name:
  `smart-scheduler-back` / `-front` / `-backoffice-back` /
  `-backoffice-front` (+ `smart-scheduler-requirement`). **Absolute paths on this machine are in `machine.local.md`
  at the workspace root** — never in a committed file.
- 🔴 **STANDING RULE (owner, 2026-08-28): `develop` is the CANONICAL central branch in every repo.** `dong`/`dong2`/
  `dong3` are no longer the reference. **Another team also builds on `develop`** — before speccing anything on
  shared ground (calendar, course card, cell, expiry, LINE), **read what `develop` already does**
  (`git show develop:<path>`) and re-apply only what is genuinely missing. Never build against a remembered tree.
  *(08-28: merged — front `dong`≡`develop`≡`origin/develop` @9ec5d35, back @d901dc7; one tree with our REQ-052/068
  cell + the TASK-191 toggle fix; only `hasRental` (TASK-190) was missing.)*
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, **:4006** → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, **:3016** → Fern
  - `smart-scheduler-backoffice-back` — finance API, **`bo` schema on the shared `smart_scheduler` DB**
    (`ops` RETIRED by REQ-006 / TASK-027), **:4010** → Jason
  - `smart-scheduler-backoffice-front` — admin money UI, Next.js, **:3018** → Fern
- **Read first**: `ai-worker/SYSTEM-FACTS.md` (owner-stated system behaviour), then
  `project-understanding.md` (as-built map, rewritten 08-01), then the monorepo root `CLAUDE.md` and
  `docs/` — newest wins. Docs calling this a "tutoring school" are wrong; it is a sports business.
- DB: one PostgreSQL — `public.*` (scheduling) + `bo.*` (finance). Reading schema from the Drizzle files is fine;
  the DATA REQUEST rule covers **real data and live environments**.
- Team: Porter (PM/BA) · Sober (SA) · Jason (BE) · Fern (FE) · **Tanya (QA)**.
  - **QA trial, this project only.** Tanya talks to Porter only; tests on **local + `sid`** (never `uat`); owns
    `IN_TEST` / `TEST_PASSED` / `TEST_FAILED`. A REQ is `DELIVERED` only after a `TEST_PASSED` **and** a post-deploy
    re-check. She **may create test data on `sid`**, declaring and retiring the footprint in the TEST file.
