/** QA check — read-only: confirm no real teacher's type was changed by the REQ-009 UI harness. */
import { openSidSession, api } from "./sid-session.mjs";
const { browser, origin, apiToken } = await openSidSession();
const r = await api(origin, apiToken, "GET", "/teachers");
const rows = r.json.groups.flatMap((g) => g.teachers.map((t) => ({ type: g.type, nickname: t.nickname, active: t.active })));
console.log(JSON.stringify({ counts: r.json.groups.map((g) => ({ type: g.type, n: g.teachers.length })), rows }, null, 1));
await browser.close();
