// Throwaway (Fern, TASK-107/108/109 real-back runs). Keeps a run from leaving rows in the shared dev database.
//   BACK=http://127.0.0.1:3101 PW=<throwaway password> node real-back-rows.mjs snapshot <file>
//   BACK=... PW=... node real-back-rows.mjs clean <file>
// `snapshot` writes the ids of every recording that exists now. `clean` DELETEs only ids that are NOT in the snapshot,
// i.e. rows made since, so rows that belong to anyone else are never touched. Prints ids and statuses only:
// never a file name, never text.
import { readFileSync, writeFileSync } from "node:fs";

const [mode, file] = process.argv.slice(2);
const base = process.env.BACK || "http://127.0.0.1:3101";
const login = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: process.env.PW }),
});
if (login.status !== 204) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? [])[0]?.split(";")[0];
const list = async () => (await (await fetch(`${base}/api/recordings`, { headers: { cookie } })).json()).recordings;

if (mode === "snapshot") {
  const rows = await list();
  writeFileSync(file, JSON.stringify(rows.map((r) => r.id)));
  console.log(`snapshot: ${rows.length} existing row(s) recorded`);
} else if (mode === "clean") {
  const before = new Set(JSON.parse(readFileSync(file, "utf8")));
  const mine = (await list()).filter((r) => !before.has(r.id));
  for (const r of mine) {
    const res = await fetch(`${base}/api/recordings/${r.id}`, { method: "DELETE", headers: { cookie } });
    console.log(`delete ${r.id} (${r.source}, ${r.status}) -> ${res.status}`);
  }
  const left = (await list()).filter((r) => !before.has(r.id));
  console.log(`clean: removed ${mine.length}, new rows left that the list shows: ${left.length}`);
  console.log("note: GET /api/recordings never lists `uploading` rows, so this cannot see them; the specs delete the ids they create.");
} else {
  throw new Error("usage: snapshot|clean <file>");
}
