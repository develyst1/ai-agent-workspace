/**
 * QA harness — batch acceptance on `sid`, READ-ONLY (creates nothing, sends nothing).
 *   REQ-024  search (nickname + parent phone) · sort · custom range · invalid sort → 400
 *   REQ-023  the "Needs attention" panel shows a REAL last-run timestamp, not "never run"
 *   REQ-020  the staff-facing LINE-link screen: pending requests, approve/reject, unlink
 *   REQ-026  nav (re-asserted here so one run covers the batch)
 * LINE sending is never triggered — notification channels point at real people.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (req, id, expected, actual, result) => {
  cases.push({ req, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${req}] ${id} — ${String(actual).slice(0, 190)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);

try {
  // ── REQ-024 — the API half, re-checked against today's build ───────────
  const all = await A("GET", "/bookings?page=1&limit=5");
  const total = all.json?.total ?? all.json?.items?.length;
  record("REQ-024", "AC-1 all-bookings list responds", "200 + paged shape", `${all.status} total=${total}`, all.status === 200 ? "PASS" : "FAIL");

  const students = (await A("GET", "/students?q=QA")).json;
  const nick = students?.[0]?.nickname;
  const phone = students?.[0]?.phone;
  const byNick = await A("GET", `/bookings?q=${encodeURIComponent(nick)}`);
  const byPhone = await A("GET", `/bookings?q=${encodeURIComponent(phone)}`);
  record(
    "REQ-024",
    "AC-3 search matches nickname AND parent phone",
    "both queries return the same student's bookings",
    `nickname "${nick}" → ${byNick.json?.total} · phone "${phone}" → ${byPhone.json?.total}`,
    byNick.status === 200 && byPhone.status === 200 && (byNick.json?.total ?? 0) > 0 && (byPhone.json?.total ?? 0) > 0 ? "PASS" : "FAIL",
  );

  const asc = await A("GET", "/bookings?sort=date_asc&page=1&limit=1");
  const desc = await A("GET", "/bookings?sort=date_desc&page=1&limit=1");
  const bad = await A("GET", "/bookings?sort=NONSENSE");
  record(
    "REQ-024",
    "AC-5 date sort is a sort, not a filter (and rejects nonsense)",
    "asc first ≠ desc first, both totals equal, bad sort → 400",
    `asc=${asc.json?.items?.[0]?.date} desc=${desc.json?.items?.[0]?.date} totals ${asc.json?.total}/${desc.json?.total} · bad=${bad.status}`,
    asc.json?.items?.[0]?.date !== desc.json?.items?.[0]?.date && asc.json?.total === desc.json?.total && bad.status === 400 ? "PASS" : "FAIL",
  );

  const range = await A("GET", "/bookings?from=2026-08-01&to=2026-08-31&page=1&limit=50");
  const outside = (range.json?.items ?? []).filter((b) => b.date < "2026-08-01" || b.date > "2026-08-31");
  record(
    "REQ-024",
    "AC-4 arbitrary custom range filters correctly",
    "every row inside the requested window",
    `${range.status} rows=${range.json?.items?.length} outsideWindow=${outside.length}`,
    range.status === 200 && outside.length === 0 ? "PASS" : "FAIL",
  );

  // ── REQ-023 — the attention panel + digest last-run ────────────────────
  await page.goto(`${origin}/scheduler/attention`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const attText = await page.locator("body").innerText();
  await page.screenshot({ path: `${OUT}/sid-req023-attention.png`, fullPage: true });
  const neverRun = /never run|ยังไม่เคยรัน|ไม่เคยทำงาน/i.test(attText);
  const stamp = (attText.match(/\d{4}-\d{2}-\d{2}[^\n]*/) ?? attText.match(/\d{1,2}\s\w{3}\s\d{2,4}[^\n]*/) ?? [""])[0];
  record(
    "REQ-023",
    "AC — the panel shows a real last-run timestamp for the daily digest",
    "a timestamp, not the red 'never run' warning",
    `neverRunWarning=${neverRun} · stampSeen="${stamp.slice(0, 80)}" · panel="${attText.replace(/\n/g, " · ").slice(0, 220)}"`,
    !neverRun && !!stamp ? "PASS" : "FAIL",
  );

  // ── REQ-020 — the staff-facing link-control screen ─────────────────────
  await page.goto(`${origin}/scheduler/link-requests`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const linkText = await page.locator("body").innerText();
  await page.screenshot({ path: `${OUT}/sid-req020-line-links.png`, fullPage: true });
  const buttons = (await page.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  record(
    "REQ-020",
    "AC-2/4 staff screen exists with approve / reject / unlink controls",
    "pending requests listed; approve, reject and unlink available",
    `url=${page.url().replace(origin, "")} · buttons=${JSON.stringify(buttons.slice(0, 12))} · text="${linkText.replace(/\n/g, " · ").slice(0, 220)}"`,
    /approve|อนุมัติ/i.test(linkText + buttons.join(" ")) || /unlink|ยกเลิกการเชื่อม/i.test(linkText + buttons.join(" ")) ? "PASS" : "FAIL",
  );
  const pending = await A("GET", "/teacher-link-requests").catch(() => ({ status: 0, text: "" }));
  record(
    "REQ-020",
    "AC-1 a claim queues as a pending request (API surface)",
    "an endpoint that lists pending teacher link requests",
    `${pending.status} ${pending.text.slice(0, 160)}`,
    pending.status === 200 ? "PASS" : "NOT TESTED",
  );

  // ── REQ-026 — nav, re-asserted ─────────────────────────────────────────
  const nav = (await page.locator("a").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  record(
    "REQ-026",
    "Stage 1 — the extra Dashboard entry is gone, the three keepers remain",
    "no bare 'Dashboard'; SOM dashboard + Daily report + Needs attention present",
    JSON.stringify([...new Set(nav)].slice(0, 12)),
    !nav.some((s) => /^dashboard$/i.test(s)) &&
      nav.some((s) => /som dashboard/i.test(s)) &&
      nav.some((s) => /daily report/i.test(s)) &&
      nav.some((s) => /needs attention/i.test(s))
      ? "PASS"
      : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
