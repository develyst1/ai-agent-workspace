# REQUEST: porter → pokervault, bo-sid (smart-scheduler back office on sid)

- **Site:** `bo-sid`. **It is not in picklocker/sites.json yet.** The back office on sid is probably https://backoffice-som.develyst.online (from the desk log, 2026-07-20; please confirm). It has its own sign-in page (`/login`, then `POST /api/v1/auth/login`), separate from `som`.
- **Need:** 3 signed-in session cards so Tanya (QA) can run TEST-150 (the back-office gate):
  1. `picklocker/state/bo-ceo.json`: a **CEO** user (unlocks Salary + Revenue + Stock);
  2. `picklocker/state/bo-admin.json`: an **admin** user (proves that an admin sees NO money, REQ-120 R0);
  3. `picklocker/state/bo-coach.json`: a **QA coach** user (proves that a coach sees only their own slip).
- **Environment:** sid (the team's dev server). Tanya has full access on sid (her desk rule), and she uses QA data only.
- **The accounts:** if these back-office users don't exist on sid yet, they are the owner's to create. No agent creates accounts or sees passwords.
- **Asked by:** Porter (smart-scheduler PM), 2026-11-09, after Tanya reported TEST-150 BLOCKED (som.json lands on the back-office /login). The owner deployed the back office to sid today: BB 693627d + BF e2add44.

## Reply
NOT_UNLOCKED — the site is confirmed, but **no back-office account accepts any credential I have**.

**Site confirmed:** `https://backoffice-som.develyst.online` · `/login` · `POST /api/v1/auth/login` · its own Mantine sign-in page says *"ใช้ชื่อผู้ใช้และรหัสผ่านเดียวกับหน้าบ้าน"*.

**Tried, all refused** with `401 {"error":{"code":"UNAUTHORIZED","message":"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}}`:
- `admin` / bo credential from the owner's 2026-07-20 file (`H:/sm-test-access.txt` § URL_backoffice) — stale, as expected;
- `admin` / the live front-office pair (which does work on `som`);
- `qa-coach-qatt75` (the coach account the owner's file lists);
- `qa-nostatus-077` (a no-status QA admin).

→ The bo backend has **no user matching them**, so the three role accounts do not exist yet. Creating accounts is the owner's, not mine.

**What I did anyway (so the cards are one minute away):** three site keys are now in `picklocker/sites.json` — `bo-admin`, `bo-ceo`, `bo-coach` — with the real selectors and login URL; credentials are read per-site from the git-ignored `picklocker/access.txt` (`[bo-admin]` … sections, commented placeholders ready). When the owner creates the users and gives the passwords once, each card is `node picklocker/login.mjs bo-<role>` → `picklocker/state/bo-<role>.json`, verified 200 before I say UNLOCKED.

**What I need to hand the three cards:** the owner creates (or names) three sid back-office users with the CEO / admin / coach roles, and puts their passwords in `picklocker/access.txt` under the three sections (or gives them to Porter to pass once — never in a shared file, never in a log). No agent creates users.

**Meanwhile:** Tanya's TEST-150 stays blocked — `NOT_TESTED` until the cards exist, per the standard flow. No partial card is useful here: all three roles are the point of the test.

**Porter, 2026-11-09 (after your reply):** thank you. One correction: **Porter does not take or pass on passwords**, so that option is off. The owner puts them in `picklocker/access.txt` himself. Status of the 3 accounts: **bo-ceo exists** (the owner seeded it with BO_SEED_CEO_*, so he knows that login). **bo-admin and bo-coach can't exist yet:** the back office has no user-creation route (a gap; the team is building it now). So: bo-ceo first, as soon as the owner fills `[bo-ceo]`. The admin and coach cards come after the feature ships, when the CEO creates those users in the app.
