# TASK-933 — FE: TEST-150 **D-150-1 (Team B half): Team B's Salary screens in English** + **the CEO isn't shown a refusing "Other Income" link** (backoffice-front) — @Fanta — now
**From @Silver, 2026-11-09.** Defect D-150-1 (Tanya, TEST-150 § Block B): REQ-120 §8 **D2 = A, "English for the whole back office", incl. the coach's slip page.** Porter's split: **Team B = People · Employee Profile · Payment Setting · Daily · My slip · Other Income (Entries) · Salary Report** (Fanta); Sober takes Pay run + Slip. Plus Porter's ruling (21:24): a CEO must not be shown a link that refuses him. **It rides ONE back-office redeploy** with Sober's D-150-1 + O-150-1, then Tanya re-checks, then each SA commits his own. Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command.** **Size ≈ 0.5–1 d.**

## (1) English, on these screens only
Files: `components/partials/Salary/{People, PeopleParts, Person, Settings, Daily, MySlip, Entries, Reports, ReportsTables, MonthPicker}.tsx` + your `salary-people.service.ts` / `salary-reports.service.ts` texts.
- **Step 0 (write it in your report first):** list **every Thai string** on these screens, each with one decision:
  - **→ English:** headings, labels, buttons, menu items, column heads, month names, empty states, the confirm / error / success toasts our code writes. Use an existing English word from the final UI / approved list where one exists.
  - **→ keep Thai, with a reason:** only text **the customer herself wrote in Thai for that screen** and asked to keep. Example: the Payment Setting Full-time commission sentence «… ฟูลไทม์ …», where ขวัญ wrote «ใส่ภาษาไทยตามที่เขียนให้เลยค่ะ» (CUSTOMER-ANSWERS 2026-10-23). Cite the line for each one kept.
- **Month names / dates:** the English month names (`Oct 2026`) and `dd/mm/yy`, as the final UI does.
- **The server's Thai error sentences** (e.g. «งวดนี้ถูกล็อกแล้ว») are the **back end's** strings. Don't rewrite them in the FE. Sober / Jason own the API texts; list any your screens show, and I'll pass the list on.
- **Every new English word you'd add that isn't in the final UI** → mark it `PENDING (Porter)` and list it. Porter approves the words.

## (2) The CEO and "Other Income"
- The menu row is `roles: ["admin"]` (`lib/roles/pages.ts:56`), yet Tanya, as the CEO, reached `/salary/entries` and got a refusal. **Find out how:** a CEO-sees-all rule in the shell, or a link / direct URL.
  - If it's the menu, make sure the CEO's menu doesn't show it.
  - **If the CEO lands on the page anyway, show one short English pointer instead of a form that refuses:** "Add income lines for a coach on the Payment Detail (slip)", with a link to the Pay run. `PENDING (Porter)` for the sentence.
  - No change to the admin's Entries.

## Tests
- No Thai left on these screens except the kept-and-cited strings: a test that scans the rendered output for Thai characters, with an allow-list of the kept strings.
- The CEO's menu has no "Other Income".
- The CEO on `/salary/entries` sees the pointer and no form.
- The admin's Entries are unchanged.

## Done =
- `tsc` 0 · tests green · `next build` 0.
- Report in `inbox/SA-B.md`: the Thai → English table, the kept list with citations, the PENDING words, and the API sentences seen.
- `git status` = only these files. No git command run.
- **When it's green, I tell Porter "Team B English green".**

## Review — @Silver, 2026-11-09: ✅ ACCEPTED on code (the live re-check → Tanya after the bundled redeploy)
- **My re-run:** BF tsc 0 · `bun test` **427 pass / 0 fail**.
- **The CEO + Other Income:** the menu was never the cause (a typed URL hit the shell's "no access"). Now the CEO gets one pointer + "Open Pay run" (a `menuRoles` field in `pages.ts`). Accepted.
- **Fanta's question (3 Transportation notes kept in Thai):** ขวัญ's explicit «ใส่ภาษาไทยตามที่เขียน» covers the Commission block only. My recommendation is **English** for the Transportation notes (D2), but translating the customer's own rule text is wording, so **it goes to Porter.** It's a one-line flip either way.
- **PENDING (Porter):** the pointer sentence + "Open Pay run".
- **Not Team B's** (routed to Porter): the shell's NoAccess card in Thai (Fern / Sober), non-Team-B Thai labels in `pages.ts`, and the API's Thai sentences.
- **Security review:** none (wording + a role-gated pointer).
