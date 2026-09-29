# TASK-511 — the public docs page names what is probably the first super-admin's username — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** Your finding in TASK-509.

## §0 What it is
`openapi/document.ts`'s login example is **`username: "admin"`, `password: "admin"`**, served on a page anyone can read.
- **The password is unusable** — every password write requires 8+ characters. **That part is fine and I am not treating it as a credential leak.**
- **But `admin` is `.env.example`'s `BOOTSTRAP_ADMIN_USERNAME`**, so the public page most likely **names the real first super-admin account.**
**It is small. It is also one word, and a free hint on a public page is worth more to someone attacking us than it is to us.**

## §1 Build
- Replace both example values with something **obviously not real**: `"your.username"` and a placeholder password that **cannot be mistaken for a working one** and that **satisfies the 8-character rule**, so the example does not teach a shape that would be rejected.
- 📌 **Check the rest of the document for the same shape while you are there** — other examples that are real-looking values rather than obvious placeholders. **Report them; change only the ones that are plainly the same defect.**
- 🚫 Nothing about the routes, the schema's structure, or the auth behaviour. 🚫 Not a rewrite of the document — you established it is a partial, stale subset, and **that is its own decision for another day.**

## §2 What I am NOT asking for
🚫 **Do not investigate whether any real account has a short password.** You already said that is a data question you cannot answer from code — **correct, and it stays a data question.** If the owner wants it checked, it is a read-only query for him, and I will raise it separately if he asks.

## Definition of Done
- [ ] Both example values obviously placeholder, the password satisfying the real rule · other real-looking examples **reported**, and only plain cases changed · nothing else in the document touched · suite **count** · tsc 0 · 59 = 59 · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): the public login example is now `your.username` / `your-password-here` · the rest of the document checked, nothing else of that shape · 3306 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## §1 The change (`openapi/document.ts`, the two `LoginRequest` example values only)
- `username: "admin"` became **`"your.username"`**. It's obviously not an account, and it **matches `USERNAME_RE`** (`a-z 0-9 . _ -`, 3–40).
- `password: "admin"` became **`"your-password-here"`** (18 characters). It **meets `PASSWORD_MIN` (8)**, so the example never teaches a login the API would refuse, and it can't be mistaken for a working password.
- The reason is in a comment beside them (the page is public per TASK-509; `admin` is `.env.example`'s bootstrap username).
- **Nothing else in the document was touched**: not the structure, the routes, the auth behaviour, nor the stale partial coverage.

## §2 The rest of the document: checked for the same shape
- **The other 3 `example`s:** `"2026-06-30"` (a date query parameter), `"09:00"` and `"10:00"` (start times). **Obvious placeholders, not real values; left alone.**
- **Every other string in the document** (298 of them, from TASK-509's walk): **no** phone, email, LINE id, uuid, IP, token or URL/host. The Thai text is tag and endpoint descriptions. **Nothing else of this defect's shape.**

## §3 Pin and break-and-watch
- **`src/openapi/document-examples-task511.test.ts`** (2 tests): the pair **by value**, never `admin`, and both **accepted by the real rules** (`USERNAME_RE`, `PASSWORD_MIN`, imported from `user.service`, not copied).
- **A.** The example reverted to `admin`/`admin`: **BITES** (0/2). CHECKSUM identical before and after; restore byte-identical.
- 🚫 **Not investigated, as instructed:** whether any real account has a short password. It stays a data question.

⛔ Only you mark this DONE.
