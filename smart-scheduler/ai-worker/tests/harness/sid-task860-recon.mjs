// TEST-142 recon (read-only): teachers flattened (names/ids/flags only), plus today's calendar load per teacher.
import { openApi } from "./sid-twenty-api.mjs";
const { browser, call } = await openApi();
const t = await call("GET", "/teachers");
const all = (t.json?.groups ?? []).flatMap((g) => g.teachers.map((x) => ({ ...x, group: g.type })));
console.log(`teachers: ${all.length}; keys: ${all[0] ? Object.keys(all[0]).join(",") : "-"}`);
for (const x of all) {
  const extra = Object.entries(x).filter(([k]) => /line|link|archiv/i.test(k)).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" ");
  console.log(`T ${x.id} | ${x.nickname} | ${x.group} active=${x.active} isSystem=${x.isSystem} subjects=${x.subjects?.length} ${extra}`);
}
const day = process.argv[2] ?? "2026-11-09";
const b = await call("GET", `/bookings?from=${day}&to=${day}`);
console.log(`GET /bookings ${day} → ${b.status} ${b.text.slice(0, 300)}`);
await browser.close();
