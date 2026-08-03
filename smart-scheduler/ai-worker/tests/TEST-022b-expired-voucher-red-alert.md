# TEST-022b: Expired-voucher red alert — backend refusal (the four-round-open promise)
- Source REQ: REQ-022 (the unexercised "expired voucher shows a red reason alert" path)
- Status: IN_TEST — backend half **TEST_PASSED**; painted red alert **NOT TESTED**
- Environments: dev-server (`sid` = som.develyst.online), API level
- Tested: 2026-08-02 by Tanya

## Scope

The one promise in REQ-022 that survived four acceptance rounds unverified: booking against an **expired**
voucher must be refused with a visible reason, rendered as a **red alert**. It stayed open because mock data
cannot express "a voucher past its expiry" and nobody had a running server to make one.

**This round proves the BACKEND refusal on a real expired voucher** — created on `sid`, not mocked. It does
**not** prove the red alert itself: that alert is *painted* (a rendered component), so it needs a composited
browser on the authenticated screen. Per Porter's standing instruction, **the two halves are kept separate and
the backend PASS must not be read as the promise being kept.**

## How the expired voucher was made (no import route on `sid`)

`POST /vouchers/import` (explicit past expiry) is **404 on `sid`**. A voucher's expiry is instead set from its
**first booking**. So: create a 5h voucher (provisional expiry 2026-11-02) → book its **first** session on a
**past** date **2026-01-05** → the server recomputed expiry to **2026-04-05** (start + 3 months). Today is
2026-08-02, so the voucher is now genuinely expired. **Finding worth keeping:** the API **accepts a
past-dated booking**, which is the only lever that can expire a voucher without the import route — good for this
test, but possibly a thing staff shouldn't be able to do (raised as Q1).

## Cases

| # | Case | Type | Steps | Expected | Actual | Result |
|---|------|------|-------|----------|--------|--------|
| 1 | Voucher's first booking sets the validity window | happy | book 2026-01-05 against a fresh 5h voucher | expiry becomes 2026-04-05 | expiry = **2026-04-05**, used 0/5 | **PASS** |
| 2 | **A booking after expiry is refused** | negative | book 2026-08-05 (after 2026-04-05) against the same voucher | `400`, reason "วอยเชอร์หมดอายุแล้ว", no hours drawn | `400 VALIDATION "วอยเชอร์หมดอายุแล้ว"`, used still 0/5 | **PASS** |
| 3 | The red **alert** renders that reason in the booking modal | happy | open the modal, pick the expired voucher, submit | red alert with the Thai reason | — | **NOT TESTED** — painted; needs the authenticated browser (see below) |

## Defects

None at the backend. The refusal is enforced server-side exactly as specced.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| Parent QA-expv-parent `1405dbbc…` | `sid` | ❌ no delete endpoint — QA-marked, left in place |
| Student QA-expv-student `be5192a8…` (nickname QA-expv) | `sid` | ❌ no delete endpoint — QA-marked |
| Voucher `13c369bc…` 5h, expired 2026-04-05, 0/5 used | `sid` | ❌ no delete endpoint — inert (expired, unused) |
| Revenue `bo.movement` from the voucher sale (if `recordSale` is wired on `sid`) | `sid` | ❌ **cannot remove** — no delete path; small money-ledger residue, flagged |
| Booking #1 (2026-01-05) | `sid` | ✅ CANCELLED |
| Booking #2 (2026-08-05) | `sid` | ✅ never created (the 400) |

Full ledger: `DEV-SERVER-FOOTPRINT.md`.

## Verdict

**Backend: `TEST_PASSED`** — a genuinely expired voucher is refused on the live server with the correct visible
reason and no hours are consumed. **The four-round-old backend promise is now verified against a real
environment, not a unit test.**

**Painted red alert: `NOT TESTED`** — it renders through the same generic `ApiClientError → red alert` path that
this same project proved working on the suspend `400` (TASK-052), so the risk is low; but "low risk" is not
"tested", and this is precisely the conflation that kept the item open for four rounds. It becomes testable the
moment I can reach the authenticated booking modal (the mint-session cookie, if the in-app browser can carry an
HttpOnly cookie — under test). **REQ-022 stays open on this line until the alert is actually seen.**

## Questions

- **@Porter — Q1:** the API **accepts a booking dated in the past** (I used 2026-01-05). That is what let me
  expire the voucher, but should staff be able to create a booking months in the past at all? It also means a
  voucher's validity window can be set to already-expired by a mis-typed first-booking date. Non-blocking, but
  it's an odd capability — worth a business call.
- **@Porter — cleanup:** the QA parent/student/voucher above **cannot be deleted** (no endpoint), and the
  voucher sale likely left a `bo.movement` I also can't remove. All are QA-marked and inert. If you want them
  gone, that's a DB action only the owner can take — tell me if she wants the ids.
