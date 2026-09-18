# TASK-351 — tier LABELS follow the language; VALUES stay Thai (`REQ-088 §8b`, reversing TASK-350 §3)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-13)
▶️ **Owner's screen, via @Porter.** **Size XS.** 🚫 No BE change, no stored-value change. ⛔ **Chain stopped —
this one item, same deploy as whatever comes next.**

---

## §1 The reversal, and it was a ruling two of us got wrong
**EN mode, pick mode, on the owner's phone: `Province · อำเภอ · ตำบล`.** 🔴 ***One English label over two Thai
ones — a foreign parent reads "Province", then two words they cannot read, above fields they must fill.***
🔻 **@Porter's reasoning — and mine when I agreed with it — was about the VALUES** (`คลองสามวา` is a proper noun
on their own mail) **and we applied it to the LABELS.** ✅ **Corrected:**
| | EN | TH |
|---|---|---|
| **LABELS** | `Province · District · Sub-district` | `จังหวัด · เขต/อำเภอ · แขวง/ตำบล` |
| **VALUES** | Thai | Thai |
📌 **English loses the เขต/อำเภอ distinction and that is fine — "District" covers both; the Bangkok/elsewhere
flip still drives the THAI labels.**

## §2 What to do
✅ **`tierWordsFor(code)` gains the language** — or the page maps its result through the dictionary; **your
call, but the four Thai literals stay the SOURCE and the Bangkok flip stays keyed off geocode `10`.**
🔴 **TASK-350's assertion *"tier words unchanged by the toggle"* is now WRONG BY REQUIREMENT.** ✅ **Rewrite it —
do not delete it** — to: *labels follow `lang`; values do not.* 📌 **With the reversal and its reason inside
the test**, the way TASK-343 handled *"the calendar date appears nowhere"*.
✅ **Values asserted Thai in BOTH modes** — *the half of the old ruling that was right, kept.*
📝 **Four new EN label strings** — `Province` already exists; `District` and `Sub-district` are @Porter's
words, PLACEHOLDER by rule, pinned by FORM.

## §3 What must not change
- 🚫 The values · the join · the stored string · the Bangkok flip · the pickers · the toggle's one-thing rule.
- 🚫 No new dependency, no BE change.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok
- [ ] **EN mode shows `Province · District · Sub-district`; TH mode shows `จังหวัด · เขต/อำเภอ · แขวง/ตำบล`,
      with the Bangkok flip** — asserted, all four combinations
- [ ] **VALUES Thai in both modes** — asserted
- [ ] 🔴 **TASK-350's tier assertion REWRITTEN with the reversal's reason, not deleted**
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **Two people ruled "stay Thai" from a sentence about VALUES, and the screen corrected both in one shot.**
⇒ ❓ **Is there anything else on `/register` where a LABEL and a VALUE share a rule they should not?** 📌 *The
month names in the date picker? The `กทม` in the confirm line?* 🚫 **Name it. Build nothing.**

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-13. **Labels follow the language; values stay Thai; the old assertion rewritten with the reversal inside it.**

```
bunx tsc --noEmit → exit 0
bun test          →  314 pass / 0 fail   (was 312; +2 — the reversed test re-cut, two new cases)
bun run build     → ok — `○ /register` still static
git status        →  3 modified (RegisterContent.tsx · dictionaries.ts · register-page.test.ts)
```
🚫 No BE · no dependency · no stored-value change · `entry.ts` untouched (the four Thai literals and the geocode-`10`
flip are still the SOURCE) · the join, the pickers, the toggle's one-thing rule untouched.

### What changed — six lines on the page, two keys in the dictionary
```ts
const tierTh = tierWordsFor(provPick?.code ?? null);            // Thai — the source, with the Bangkok flip
const tier = lang === "th" ? tierTh
  : { district: t("register.addrDistrict"), subDistrict: t("register.addrSubDistrict") };
```
`register.addrDistrict` = **`District`**, `register.addrSubDistrict` = **`Sub-district`** — @Porter's words, PLACEHOLDER
by rule, pinned by FORM (`/^[A-Za-z-]+$/`). The TH halves (`อำเภอ` / `ตำบล`) exist for key parity only and are not
what Thai mode renders — Thai mode renders `tierWordsFor`'s words, so the Bangkok flip is intact. Documented at the
key. 📌 *"District" covers both เขต and อำเภอ in English — as ruled.*

| | EN | TH — Bangkok | TH — elsewhere |
|---|---|---|---|
| labels | `Province · District · Sub-district` | `จังหวัด · เขต · แขวง` | `จังหวัด · อำเภอ · ตำบล` |
| values | Thai (`nameTh`) | Thai | Thai |
✅ **All four combinations asserted** (`§8b — all four label combinations`). ✅ **Values Thai in both — asserted**: the
option labels and the join read `nameTh`, `nameEn` appears nowhere on the page, and no `lang` reaches `joinAddress`.

### 🔴 TASK-350's assertion — REWRITTEN, not deleted
The test *"§3 — the tier words stay THAI in both languages: no `t(` and no `lang` near them"* is now
*"§3 (reversed by TASK-351) — tier LABELS follow the language"*, with a four-line comment above it stating the
reversal and its reason (a ruling about VALUES applied to LABELS; the owner's EN screen `Province · อำเภอ · ตำบล`).
**The half that was right is kept in the same test** — `tierWordsFor`'s region is still asserted lang-free and
Thai-literal — and the half that was wrong is inverted. TASK-350's *"`lang` appears exactly twice"* pin became
*exactly three*, each named (destructure · `DatesProvider` locale · the tier label choice), with the rule it
protects restated: **`lang` renders; nothing keyed on it sets state** (no `[lang]` effect, no setter on a `lang`
branch). TASK-349's `const tier = tierWordsFor(...)` pin follows the rename to `tierTh`.

### 🔑 Break-and-watch — three mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the old ruling back — labels Thai in both languages (`tier = tierTh`) | **2 fail** |
| 2 | the over-correction — VALUES follow the language (`label: lang === "th" ? nameTh : nameEn`) | **2 fail** |
| 3 | @Porter's EN word replaced by `อำเภอ` in the EN dictionary | **2 fail** |
`md5sum` identical on both mutated files before and after; suite green after.

### Definition of Done
- [x] Suite **314 / 0** · `tsc` exit 0 · build ok
- [x] EN `Province · District · Sub-district`; TH `จังหวัด · เขต/อำเภอ · แขวง/ตำบล` with the Bangkok flip — all four asserted
- [x] Values Thai in both modes — asserted
- [x] 🔴 TASK-350's tier assertion REWRITTEN with the reversal's reason, not deleted
- [x] 🔑 Break-and-watch — three, one call, checksum

## Question — **where else on `/register` do a LABEL and a VALUE share a rule they should not?** ⚠️ owner's list, nothing built
Walked every rendered string on the page against the split *label follows `lang` · value is what is stored*:
- **Month names in the date picker** — a LABEL, and they already follow `lang` (the page's own `DatesProvider`); the
  VALUE is `DD-MM-YYYY`, digits, language-free. ✅ No shared rule.
- **`กทม` in the confirm line** — a VALUE under a label that follows `lang` (`reviewProvince`). An English parent sees
  `Address: พระโขนงเหนือ วัฒนา กทม` — Thai, because that is the stored string. ✅ Correct by the rule, and it is the
  same string the `done` screen and the admin will see.
- 🔻 **The one real one: the TYPED-mode instruction, `provinceLabel` EN** — the customer's own `§17c` sentence:
  *"…Eg. Prakanueng Nuea, Wattana, BKK"*. **A LABEL whose example is a romanised VALUE.** An English parent who takes
  the hint types `Prakanueng Nuea, Wattana, BKK` — stored as-is — while the picker two taps away stores
  `พระโขนงเหนือ วัฒนา กทม` for the same address. Two spellings of one place from one page, and `som-report` groups by
  that column (the TASK-349 finding, one level down). *It is the customer's verbatim text, so not mine to change;
  and it pre-exists in the chat (REQ-079 screen 6, EN half).* 📌 **Owner's list, beside the two-writers item: the
  English example should show the value the way it is stored — Thai — or the field should say "in Thai".**
- **`(skipped)` / `(ข้าม)` in a value slot** — a label standing where a value would be; follows `lang`; nothing stored.
  ✅ Fine.
- **`ChildList` names, the `done` screen's `DD-MM-YYYY` echo, `{phone}`** — values, rendered as stored. ✅ Fine.
🚫 Named, nothing built.
