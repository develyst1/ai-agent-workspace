/**
 * REQ-5000 / TEST-5000 — READ-ONLY probe on `uat`: why is a child missing from the Voucher tab?
 *
 * Authorization: Porter, inbox/QA.md 2026-10-26 (owner via Atom 17:48, REQ-5000 §Questions Q1).
 * Rules enforced here:
 *  · host hard-locked to frontoffice.develyst.online (uat) — anything else refuses;
 *  · the only non-GET is POST /api/auth/login (the app's own front door); every other call is GET;
 *  · credentials read from the out-of-repo file named in machine.local.md, `#uat` section; never printed;
 *  · no token/cookie written anywhere; output = student/voucher fields needed for the finding (no phones).
 *
 * Usage: node uat-req5000-probe.mjs <credentials-file> <search-term>
 */
import { readFileSync } from "node:fs";

const HOST = "frontoffice.develyst.online";
const ORIGIN = `https://${HOST}`;
const [credFile, term] = process.argv.slice(2);
if (!credFile || !term) { console.error("usage: node uat-req5000-probe.mjs <credentials-file> <search-term>"); process.exit(2); }
if (new URL(ORIGIN).host !== HOST) throw new Error("refused: host is not uat");

function readUat(file) {
  let sec = null; const out = {};
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("#")) { sec = line.slice(1).trim().toLowerCase(); continue; }
    if (sec !== "uat") continue;
    const m = /^([A-Za-z_]+)\s*[:=]\s*(.*)$/.exec(line);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  if (!out.user || !out.pass) throw new Error("uat user/pass not found in credentials file");
  return out;
}

const acc = readUat(credFile);
const login = await fetch(`${ORIGIN}/api/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: acc.user, password: acc.pass }),
});
if (!login.ok) { console.error(`login failed: HTTP ${login.status}`); process.exit(1); }
const { token } = await login.json();

async function get(path) {
  const u = new URL(path, ORIGIN);
  if (u.host !== HOST) throw new Error("refused: host is not uat");
  const r = await fetch(u, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
  const body = await r.json().catch(() => null);
  return { status: r.status, body };
}
const short = (id) => (id ? String(id).slice(0, 8) : id);
const list = (b) => (Array.isArray(b) ? b : b?.items ?? b?.students ?? b?.data ?? []);

const q = encodeURIComponent(term);
console.log(`uat probe · term="${term}" · ${new Date().toISOString()}`);

const st = await get(`/api/students?q=${q}&limit=50`);
const studs = list(st.body);
console.log(`\n[1] GET /students?q= (other tabs' picker) → HTTP ${st.status}, ${studs.length} row(s)`);
for (const s of studs) console.log(`  student ${short(s.id)} · name="${s.name}" · nick="${s.nickname ?? ""}" · archived=${s.archivedAt ?? s.archived ?? "-"} · hasParent=${!!(s.parentId ?? s.parent)}`);

const el = await get(`/api/students/eligible?type=VOUCHER&q=${q}`);
const els = list(el.body);
console.log(`\n[2] GET /students/eligible?type=VOUCHER&q= (Voucher tab) → HTTP ${el.status}, ${els.length} row(s)`);
for (const e of els) console.log(`  student ${short(e.id)} · name="${e.name}" · voucher ${short(e.context?.voucherId)} · remaining=${e.context?.remainingHours} · exp=${e.context?.expiryDate}`);

const elAll = await get(`/api/students/eligible?type=VOUCHER`);
console.log(`\n[3] GET /students/eligible?type=VOUCHER (no q) → HTTP ${elAll.status}, ${list(elAll.body).length} row(s) total`);

const vq = await get(`/api/vouchers?q=${q}&limit=200`);
console.log(`\n[4] GET /vouchers?q= → HTTP ${vq.status}, ${list(vq.body).length} row(s)`);
const ids = new Set(studs.map((s) => s.id));
for (const s of studs) {
  const vs = await get(`/api/vouchers?studentId=${s.id}&limit=200`);
  console.log(`\n[5] GET /vouchers?studentId=${short(s.id)} → HTTP ${vs.status}, ${list(vs.body).length} voucher(s)`);
  for (const v of list(vs.body)) console.log(`  voucher ${short(v.id)} · status=${v.status} · total=${v.totalHours} used=${v.usedHours} remaining=${v.remaining} · exp=${v.expiryDate} · ended=${v.endedAt ?? "-"} · created=${v.createdAt ?? "-"}`);
}
for (const v of list(vq.body)) {
  const sid = v.student?.id ?? v.studentId;
  if (ids.has(sid)) continue;
  console.log(`  (q-match voucher on a student NOT in [1]) voucher ${short(v.id)} · student ${short(sid)} "${v.student?.name}" · status=${v.status}`);
  console.log(`    voucher: total=${v.totalHours} used=${v.usedHours} remaining=${v.remaining} · exp=${v.expiryDate} · ended=${v.endedAt ?? "-"} · created=${v.createdAt ?? "-"}`);
  const sk = Object.keys(v.student ?? {}).filter((k) => !/phone|line|email|birth|dob/i.test(k));
  console.log(`    student fields: ${sk.map((k) => `${k}=${typeof v.student[k] === "object" ? JSON.stringify(v.student[k]) : v.student[k]}`).join(" · ")}`);
  // Why is this student not in [1]? Same name through the three filters /students offers.
  const nm = encodeURIComponent(v.student?.name ?? "");
  for (const [label, path] of [
    ["default", `/api/students?q=${nm}&limit=50`],
    ["archived=true", `/api/students?q=${nm}&archived=true&limit=50`],
    ["noParent=true", `/api/students?q=${nm}&noParent=true&limit=50`],
  ]) {
    const r = await get(path);
    const hit = list(r.body).filter((s) => s.id === sid);
    console.log(`    [6] /students ${label} q="${v.student?.name}" → HTTP ${r.status}, ${list(r.body).length} row(s), this student found=${hit.length > 0}`);
    for (const h of hit) console.log(`        archivedAt=${h.archivedAt ?? "-"} · parent ${short(h.parentId ?? h.parent?.id)} · other-tab Lewis parent(s): ${studs.map((s) => short(s.parentId ?? s.parent?.id)).join(",")}`);
  }
  if (v.student?.parentId) {
    const p = await get(`/api/parents/${v.student.parentId}`);
    const pa = await get(`/api/parents/${v.student.parentId}?archived=1`);
    const pb = p.body ?? {};
    console.log(`    [7] /parents/${short(v.student.parentId)} → HTTP ${p.status} · suspendedAt=${pb.suspendedAt ?? "-"} · archivedAt=${pb.archivedAt ?? "-"} · ?archived=1 → HTTP ${pa.status} archivedAt=${pa.body?.archivedAt ?? "-"} suspendedAt=${pa.body?.suspendedAt ?? "-"}`);
  }
}
