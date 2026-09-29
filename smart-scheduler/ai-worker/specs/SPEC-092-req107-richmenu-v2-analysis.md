# SPEC-092 — `REQ-107` rich menu v2 · message formats · LIFF sign-up — ANALYSIS + sizes (Sober, 2026-09-25). **No build; the owner rules §5 first.**

---
## §1 The four asks, answered

### A. ✅ Does `/register` already cover BOTH sign-up and Add Student? YES — verified in the routes, not assumed
`routes/register.ts` (REQ-088 / TASK-348) serves five endpoints behind a LIFF id-token: `status` · `unlink` · **`lookup`** (find the family by phone) · **`link`** (bind this LINE account to it) · **`create`** (*"add a child to MY family — THE ONE WRITER"*, `addChildForLineParent`, with the per-parent cap read from the roster rather than copied). So **sign-up and Add Student are already the same page**, and §2 is *"point the menu cell and the bot's reply at the LIFF we already have"* — **not** "build a LIFF page". Porter's read is right.
⇒ **Size for §2: BE S** (the unlinked cell's postback becomes the LIFF link; the Add Student reply becomes the link message; the two LIFF ids already live in the env files, demo on `.env.sid`, real on `.env.uat`).
⚠️ **One thing I would keep, quietly:** the typed-phone path must stay **working** even though the menu stops advertising it. It is the door TASK-447 re-opened for a parent who types their number unprompted, and a LIFF page that fails on an old phone leaves them with nothing else. Advertise the link; keep the fallback.

### B. 🔑 What bilingual artwork does to the TH/EN family model — it can DELETE half of it
Today a menu id exists per **role × language**: `parentTH/parentEN · knownTH/(knownEN — never published) · teacherTH/teacherEN`. The only thing that differs between the two languages of a pair is **the picture**; the cells post the same language-independent actions. One bilingual image therefore makes the pair redundant.
⇒ **Recommended: one menu per ROLE, not per role × language** — `menuIdFor(role)` instead of `menuIdFor(role, lang)`. What that buys, and it is not small:
1. **It closes the `knownEN` gap permanently** (TASK-452's consequence: EN parents stranded on the old blue menu because no EN artwork exists) — there is no EN variant to be missing.
2. **It deletes the `variant` drift class outright** (TASK-446/452: the toggle re-linking a different family). With one menu per role, a language toggle changes the BOT's language and touches no menu at all — so the sweep's `variant` outcome becomes unreachable.
3. Half as many menus to publish, link, and get wrong.
⚠️ **The one thing bilingual artwork cannot make bilingual is the CHAT BAR TEXT** (`chatBarText`, one string per menu — today `"เมนู"`). One menu means one chat bar for everyone: `Menu / เมนู` or similar. **Owner's decision, and it belongs in §5.**
⇒ **Size: BE S–M** — the definitions (new cells + the 2-cell unlinked), `menuIdFor` and the id model losing their language axis, the relink plan following it, and the publish script. The migration of ids is only `app_settings`, and the real OA has none anyway.

### C. What a LIFF sign-up needs from us — almost nothing, because it exists
A LIFF page needs: a LINE **Login** channel (the LIFF id belongs to it, not to the Messaging channel), the page itself, and **server-side id-token verification** — we have all three (`verifyLiffIdToken`, used by all five register endpoints). The ids are already in the env files. So the work is wiring, not building. **What I want confirmed by the owner (it is the one real risk):** that `2011577840-zelD9mEA` is a LIFF on **his** Login channel pointing at **our** `/register` page — not a third-party page the customer was shown. If it points elsewhere, everything in §2 changes shape.

### D. "Chat with Admin closes the rich menu" — what that can honestly mean
There is **no API that closes a rich menu for a user.** What exists: a menu can be published `selected: false` so it opens COLLAPSED (the chat bar shows, the panel does not), and a per-user link can be removed (which drops them to the default — not what the customer means). What we already do on that cell is the **mute** (TASK-447): the bot goes quiet for 60 minutes so a human can answer, and the parent gets a confirmation. ⇒ **My reading of the customer's note: she wants the panel out of the way so the keyboard is free for typing to a person** — which is `selected: false` on the menu (a publish-time property) plus the existing mute, and it costs nothing extra. **Say this back to her in those words before building** — if she means something else, the answer may be "LINE cannot do that".

---
## §2 Sizes, all together
| item | size | note |
|---|---|---|
| New artwork published (unlinked 2-cell + linked 6-cell, bilingual) | **BE S–M** | the definitions and the family collapse (§B) |
| Teacher menu, existing artwork, **re-published on the real OA** | **XS** | the owner's ruling; its ids are dead there too — it rides the same publish run |
| §2 sign-up + Add Student point at the existing LIFF | **BE S** | wiring; the page exists |
| §3 message formats (check-in · leave · my course · help list) | **BE M** | four renderers, each pinned by value, in both languages — and every byte is the owner's |
| The publish itself on `@427ybeky` | **owner's hands** | `LINE_OA_WRITE_ALLOW=@427ybeky` + `--account @427ybeky` (TASK-448), after `sid` proof |
**Total BE M+ · FE 0** (nothing on the admin frontend; `/register` already exists). No migration expected.
📌 **Order matters:** artwork and the family collapse first (they decide the ids), then the wiring, then the formats. The real OA is a **fresh publish** — no relink, nothing to sweep, which makes this the cleanest possible moment to collapse the family model.

---
## §3 Questions to add to `REQ-107 §5`
4. **The chat bar text** — one menu now serves both languages; what should the bar say? (`Menu / เมนู`?)
5. **Does the LIFF id point at OUR `/register`** on the owner's Login channel? (§C — the one answer that could change the shape of §2.)
6. **"Closes the rich menu"** — is a collapsed panel + the existing mute what she means? (§D; LINE cannot force a menu shut.)
7. **The typed-phone fallback stays alive but unadvertised** — agreed? (§A; it is the safety net for a parent whose LIFF page will not open.)
8. **The leave message must not mention "moves to the end of the course"** — confirm that is only the WORDING, not a change to what leave does. (The customer's note reads as copy; a change of behaviour would be a different REQ.)
9. **My Course drops the leave-quota count** — it is on the message only, or should the quota disappear from the parent's view everywhere?
