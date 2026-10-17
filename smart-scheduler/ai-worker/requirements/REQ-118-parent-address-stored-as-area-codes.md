# REQ-118: Store a parent's address as AREA CODES (province / district / sub-district), so it renders correctly in Thai OR English
**Source:** the owner, 2026-10-12, verbatim:
> อ่อมีอีกเรื่อง เรื่อง address ของผู้ปกครอง อยากให้เก็บเป็นรหัสเพื่อเอาไปแปลงเป็นไทย หรืออังกฤษได้อย่างถูกต้อง ตอนนี้ ถ้าให้ฉันเดา มันเก็บเป็นไทยล้วน อยากให้เก็บเป็นรหัสไป จังหวัด อำเภอ ตำบล
**Status:** INTAKE. **Not sized, not cut.** The final round (owner, 2026-10-11): it is either done now or dropped with a reason, never parked.
**His own word: "ถ้าให้ฉันเดา" (a GUESS).** ⇒ **How the address is stored today is a fact for the SA to read from the code and the schema, not assumed.**

## What is wanted
- **Province (จังหวัด) · district (อำเภอ/เขต) · sub-district (ตำบล/แขวง) stored as CODES**, so any screen or message can render **Thai or English** correctly from one source.
- **Related, and NOT ours:** the Dashboard (Palm's) wants district/province breakdowns (meeting 2026-10-11 §3.3). Codes make that possible. We only store; Palm reads.

## Questions for the SA (facts, then a plan)
1. **Today:** where the address is captured (the LINE registration page? admin screens? import?), and how it is stored (free text? Thai names? any id?). Which screens and messages print it?
2. **The code set:** which official dataset (the standard Thai province/district/sub-district codes with TH + EN names), how it gets into the repo (a seed table vs a static file), and its licence/source. 🚫 No hand-made list.
3. **Existing data:** how many parents have an address on uat (a DATA REQUEST, bare SQL, read-only). **A matching plan** from today's text to codes, with **unmatched rows LISTED, never guessed**. This is a data migration on the customer's live system, so the owner runs it.
4. **Capture after the change:** the registration page picks from the lists (province → district → sub-district) instead of free text? Any wording change goes through a copy set.
5. **Size** (your estimate + 10%), and **whether it fits the current Path B release** or rides after it.

## ⚖️ OWNER RULINGS, 2026-10-12, verbatim
> 1 ตามนั้น
> 2 หมายถึงอะไรฉันนึงว่าเราคุยกันจบแล้วนะ ว่าให้ไปregister ในลิ้ง อยู่แล้วนี่ ถ้าพิมพ์ในแชทยังมีคนใช้ โดยเฉพาะพวกใช้คอม ก็ให้ไม่ค้องกรอกที่อยุ่ ไปเลย ปล่อยว่างให้แอดมินดูแล ให้เอาเคสพวกใช้คอม
> 3 จบทุกอย่าง
1. **Dataset:** `thailand-geography-json` (MIT), **behind a machine cross-check** against the register page picker's codes.
2. **The LINE CHAT registration asks for NO address at all.** The register PAGE (the link) stays the address door. The chat path, used mostly by people on a computer, **skips the address and leaves it EMPTY for the admin to fill.** (The analysis recommended "send them to the page"; the owner's rule is simpler: no address in chat, period.)
3. **Release: with EVERYTHING**, in the ONE final front-office release (it joins Path B; uat waits until all of it is done).

## ⚖️ OWNER RULING 2026-10-12, the wrong ENGLISH names in the dataset: *"แก้"*
Fix them, using the **Department of Provincial Administration (กรมการปกครอง / DOPA)** as the source of the correct English. An **override list in OUR repo**; the upstream file stays untouched. Scope = every wrong row the machine check finds (≥ 30 found so far; the count is not guessed). A follow-up after this uat; it does not hold it.
