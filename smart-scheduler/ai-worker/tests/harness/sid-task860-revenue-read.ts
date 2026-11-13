/**
 * TEST-142 case 25 (Twenty) — READ-ONLY: do my Twenty- sales on sid have their posted bo movements?
 * cwd = smart-scheduler-back. Prints DB host only; refuses anything but sid. SELECT only; prints ids/amounts of MY rows only.
 */
import fs from "node:fs";
import postgres from "H:/scheduler/smart-scheduler-back/node_modules/postgres/src/index.js";
const SID_HOST = "154.197.124.206";
const raw = process.env.DATABASE_URL!;
const host = new URL(raw).hostname;
console.log(`DB host: ${host}`);
if (host !== SID_HOST) throw new Error("Refusing: not sid");
const S = JSON.parse(fs.readFileSync("H:/ai-agent-workplace/ai-agent-workspace/smart-scheduler/ai-worker/tests/harness/state/test142-sid.json", "utf8"));
const ids: string[] = [];
for (const v of Object.values<any>(S)) for (const k of ["courseId", "voucherId", "bookingId"]) if (v?.[k]) ids.push(v[k]);
const sql = postgres(raw, { max: 1 });
try {
  const tables = await sql`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='bo' ORDER BY 2`;
  console.log(`bo tables: ${tables.map((t: any) => t.table_name).join(", ")}`);
  const cols = await sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='bo' AND table_name IN ('movement','movements','sale','sales') ORDER BY 1, ordinal_position`;
  console.log(`cols: ${cols.map((c: any) => `${c.table_name}.${c.column_name}`).join(", ")}`);
  const mt = cols.some((c: any) => c.table_name === "movement") ? "movement" : cols.some((c: any) => c.table_name === "movements") ? "movements" : null;
  if (mt) {
    const textCols = cols.filter((c: any) => c.table_name === mt).map((c: any) => c.column_name);
    console.log(`scanning bo.${mt} text of: ${textCols.join(",")}`);
    const rows = await sql.unsafe(`SELECT * FROM bo.${mt} WHERE row_to_json(${mt})::text ~ $1 ORDER BY 1`, [ids.join("|")]);
    console.log(`my movements: ${rows.length}`);
    for (const r of rows) console.log(JSON.stringify(r).slice(0, 400));
  }
} finally { await sql.end(); }
