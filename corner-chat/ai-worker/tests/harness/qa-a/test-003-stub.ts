// TEST-003 (REQ-004) exact cases with the AI stubbed: QA's own back end (127.0.0.1:8191) → fake gateway on :3991
// scripted by qa-a/gw.json (markers like [S70] in the made-up message text pick the stub's answer).
//   bun test-003-stub.ts     → one line per check, writes test-003-stub-result.json
// The fake gateway is stopped and restarted by this script for #14 (gateway down). Throwaway harness.
import { call, login, ingest, lineMsg, qadb, secrets, waitDecided } from "./qadb";

type Check = { case: string; what: string; expected: string; actual: string; pass: boolean };
const checks: Check[] = [];
const check = (c: string, what: string, expected: string, actual: unknown, pass: boolean) => {
  const a = typeof actual === "string" ? actual : JSON.stringify(actual);
  checks.push({ case: c, what, expected, actual: a, pass });
  console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${a}`);
};
const tag = Date.now().toString(36);
const OT = (await login(secrets.ownerEmail, secrets.ownerPassword)).json.token as string;
const email = `f-${tag}@qa-a.test`, pw = `pw-f-${tag}-xyz`;
const U = (await call("POST", "/admin/users", OT, { name: "ผู้ใช้ทดสอบตัวกรอง", email, password: pw })).json.user;
const T = (await login(email, pw)).json.token as string;
await call("PUT", "/conditions/settings", T, { bar: 70, sentences: "แจ้งเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" });

const aiCalls = async (id: string) => (await qadb`select layer, ok, model, provider, error from ai_calls where message_id = ${id} order by id`) as any[];
const notes = async (id: string) => (await qadb`select count(*)::int as n from notifications_log where message_id = ${id}`)[0].n as number;
const detail = async (id: string) => (await call("GET", `/messages/${id}`, T)).json?.message;
async function run(text: string, extra: Record<string, unknown> = {}, waitMs = 30000) {
  const r: any = ingest(lineMsg(U.id, text, extra));
  if (!r.messageId) throw new Error(`ingest failed: ${JSON.stringify(r)}`);
  const t0 = Date.now();
  await waitDecided(r.messageId, waitMs);
  await Bun.sleep(400); // notify runs right after the decision transaction
  return { id: r.messageId as string, ms: Date.now() - t0, d: await detail(r.messageId), calls: await aiCalls(r.messageId), notes: await notes(r.messageId) };
}

// ---------- rules (AC-1, AC-2, #3–#6)
const rSender = (await call("POST", "/conditions/rules", T, { kind: "sender", value: "u-rule-sender", action: "always" })).json.rule;
await call("POST", "/conditions/rules", T, { kind: "keyword", value: "โปรโมชั่น", action: "never" });
await call("POST", "/conditions/rules", T, { kind: "keyword", value: "promotion", action: "never" });
await call("POST", "/conditions/rules", T, { kind: "group", value: "G-rule-group", action: "never" });
check("1", "rule created with sender key as given", "201", rSender ? "201" : "missing", !!rSender);

let m = await run("ขายของถูกมาก [S0]", { sender: { key: "u-rule-sender", name: "ผู้ส่งกฎ" } });
check("1", "AC-1 sender rule always → notify, no AI call", "notified · rule · 0 calls · notify step ran", `${m.d?.outcome} · ${m.d?.decidedBy} · ${m.calls.length} calls · notes ${m.notes}`, m.d?.outcome === "notified" && m.d?.decidedBy === "rule" && m.calls.length === 0 && m.notes > 0);
check("1", "AC-1 rule reason / about line (wording D32 under TASK-023 — reported, not judged)", "reason starts กฎของคุณ", `reason="${m.d?.decision?.reason}" about="${m.d?.aboutLine}"`, String(m.d?.decision?.reason).startsWith("กฎของคุณ"));

m = await run("มีโปรโมชั่นพิเศษสำหรับคุณ [S100]");
check("2", "AC-2 keyword never → held, no AI call", "held · rule · reason กฎของคุณ… · 0 calls · no notification", `${m.d?.outcome} · ${m.d?.decidedBy} · "${m.d?.decision?.reason}" · ${m.calls.length} calls · notes ${m.notes}`,
  m.d?.outcome === "held" && m.d?.decidedBy === "rule" && String(m.d?.decision?.reason).startsWith("กฎของคุณ") && m.calls.length === 0 && m.notes === 0);

m = await run("ลดราคา โปรโมชัน วันนี้ [S100]");
check("3", "spelling variant โปรโมชัน (no rule for it) → AI decides", "ai · 100 → notified", `${m.d?.decidedBy} · ${m.d?.score} → ${m.d?.outcome}`, m.d?.decidedBy === "ai" && m.d?.outcome === "notified");
m = await run("BIG PROMOTION today [S100]");
check("3", "PROMOTION vs rule 'promotion' (Latin case-insensitive)", "held by rule", `${m.d?.decidedBy} → ${m.d?.outcome}`, m.d?.decidedBy === "rule" && m.d?.outcome === "held");
m = await run("โปรโมชั่นส์ใหม่ [S100]");
check("3", "keyword as part of a longer word (substring)", "held by rule", `${m.d?.decidedBy} → ${m.d?.outcome}`, m.d?.decidedBy === "rule" && m.d?.outcome === "held");
m = await run("subject line only", { text: "ปกติ [S100]", groupId: "G-x" });
m = await run("ประชุมพรุ่งนี้ [S100]", { groupId: "G-rule-group", groupName: "กลุ่มกฎ" });
check("4", "group rule never → held, no AI call", "held · rule · 0 calls", `${m.d?.outcome} · ${m.d?.decidedBy} · ${m.calls.length} calls`, m.d?.outcome === "held" && m.d?.decidedBy === "rule" && m.calls.length === 0);
m = await run("โปรโมชั่นจากผู้ส่งกฎ [S0]", { sender: { key: "u-rule-sender", name: "ผู้ส่งกฎ" } });
check("5", "always (sender) + never (keyword) both match → always wins", "notified · rule", `${m.d?.outcome} · ${m.d?.decidedBy} · rule=${m.d?.decision?.rule?.action}`, m.d?.outcome === "notified" && m.d?.decidedBy === "rule" && m.d?.decision?.rule?.action === "always");
m = await run("ไม่มีกฎตรง [S70]");
check("6", "no rule matches → layer 1 then layer 2", "2 calls, layers 1,2", m.calls.map((c) => c.layer), m.calls.length === 2 && m.calls[0].layer === 1 && m.calls[1].layer === 2);

// ---------- bar (AC-3, #10)
for (const [mark, exp] of [["[S69]", "held"], ["[S70]", "notified"], ["[S71]", "notified"]] as const) {
  m = await run(`ข้อความทดสอบขอบเกณฑ์ ${mark}`);
  check("7-9", `AC-3 bar 70, stub score ${mark}`, exp, `${m.d?.score} → ${m.d?.outcome} (bar ${m.d?.decision?.bar}) · notes ${m.notes}`, m.d?.outcome === exp && m.d?.decision?.bar === 70 && (exp === "notified" ? m.notes > 0 : m.notes === 0));
}
await call("PUT", "/conditions/settings", T, { bar: 0, sentences: "แจ้งเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" });
m = await run("ขอบล่าง [S0]");
check("10", "bar 0, score 0", "notified", `${m.d?.score} → ${m.d?.outcome}`, m.d?.outcome === "notified");
await call("PUT", "/conditions/settings", T, { bar: 100, sentences: "แจ้งเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" });
m = await run("ขอบบน [S100]");
check("10", "bar 100, score 100", "notified", `${m.d?.score} → ${m.d?.outcome}`, m.d?.outcome === "notified");
m = await run("ขอบบน [S99]");
check("10", "bar 100, score 99", "held", `${m.d?.score} → ${m.d?.outcome}`, m.d?.outcome === "held");

// ---------- AC-7 bar change (#20, #21)
await call("PUT", "/conditions/settings", T, { bar: 80, sentences: "แจ้งเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" });
m = await run("เปลี่ยนเกณฑ์ [S75]");
check("20", "AC-7 bar 80, score 75", "held, bar recorded 80", `${m.d?.outcome}, bar ${m.d?.decision?.bar}`, m.d?.outcome === "held" && m.d?.decision?.bar === 80);
await call("PUT", "/conditions/settings", T, { bar: 70, sentences: "แจ้งเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" });
m = await run("เปลี่ยนเกณฑ์กลับ [S75]");
check("20", "AC-7 back to 70, score 75", "notified", `${m.d?.outcome}, bar ${m.d?.decision?.bar}`, m.d?.outcome === "notified" && m.d?.decision?.bar === 70);
for (const bad of [101, -1, 70.5, "70"]) {
  const r = await call("PUT", "/conditions/settings", T, { bar: bad, sentences: "x" });
  check("21", `bar ${JSON.stringify(bad)}`, "400 VALIDATION", `${r.status} ${r.json?.error?.code}`, r.status === 400);
}
const still = (await call("GET", "/conditions", T)).json;
check("21", "bar unchanged after refused values", "70", still.bar, still.bar === 70);

// ---------- AC-4 record (#12) + about line (#26)
m = await run("ช่วยยืนยันนัดประชุมพรุ่งนี้ด้วยครับ [S71]");
const d = m.d?.decision;
check("12", "AC-4 record: whole % 0–100, reason, summary, models per layer, prompt version, bar",
  "all present", { score: m.d?.score, reason: d?.reason, summary: d?.summary, l1: d?.layer1, l2: d?.layer2, pv: d?.promptVersion, bar: d?.bar },
  Number.isInteger(m.d?.score) && !!d?.reason && !!d?.summary && !!d?.layer1?.model && !!d?.layer2?.model && !!d?.promptVersion && d?.bar === 70);
check("26", "about line form for an AI decision", "[LINE · กลุ่มทดสอบ QA-A] ขอให้ยืนยันนัด", m.d?.aboutLine, m.d?.aboutLine === "[LINE · กลุ่มทดสอบ QA-A] ขอให้ยืนยันนัด");
// TASK-031 / REQ-004 § Questions (PM wording): over 80 → cut at a word boundary + "…", never mid-word; ≤ 80 in all.
const seg = new Intl.Segmenter("th", { granularity: "word" });
const endsOnWord = (full: string, cut: string) => {
  // the kept text (without "…") must end exactly where a segmenter word of the uncut text ends
  const kept = cut.replace(/…$/, "").trimEnd();
  return [...seg.segment(full)].some((s) => s.index + s.segment.length === kept.length);
};
const fullSummaryLine = "[LINE · กลุ่มทดสอบ QA-A] สรุปยาวมากเพื่อทดสอบการตัดความยาวของบรรทัดเรื่องให้ไม่เกินแปดสิบตัวอักษรตามที่กำหนดไว้ในข้อกำหนดของระบบ corner-chat ทั้งหมด";
m = await run("สรุปยาว [LONGSUM] [S71]");
check("26", "about line with a long summary", "≤ 80, one line, ends with … after a whole word", `${[...(m.d?.aboutLine ?? "")].length} chars: ${m.d?.aboutLine}`,
  !!m.d?.aboutLine && [...m.d.aboutLine].length <= 80 && !/\n/.test(m.d.aboutLine) && m.d.aboutLine.endsWith("…") && endsOnWord(fullSummaryLine, m.d.aboutLine));
const longGroup = "กลุ่มที่มีชื่อยาวมากๆ เพื่อทดสอบว่าบรรทัดเรื่องยังไม่เกินแปดสิบตัวอักษรอยู่หรือไม่นะครับ";
m = await run("ชื่อกลุ่มยาวมาก [S71]", { groupName: longGroup });
check("26", "about line with a very long group name", "≤ 80, ends with … after a whole word", `${[...(m.d?.aboutLine ?? "")].length} chars: ${m.d?.aboutLine}`,
  !!m.d?.aboutLine && [...m.d.aboutLine].length <= 80 && m.d.aboutLine.endsWith("…") && endsOnWord(`[LINE · ${longGroup}] ขอให้ยืนยันนัด`, m.d.aboutLine));
m = await run("สั้น [S71]");
check("26", "a line ≤ 80 is left as it is (no …)", "[LINE · กลุ่มทดสอบ QA-A] ขอให้ยืนยันนัด", m.d?.aboutLine, m.d?.aboutLine === "[LINE · กลุ่มทดสอบ QA-A] ขอให้ยืนยันนัด");
// mail head (via the core ingest seam with channel "mail" — the mail poller is REQ-002's)
const mailBase = { channel: "mail", groupId: null, groupName: null, recipientKind: "to" };
m = await run("เมลทดสอบหัวบรรทัด [S71]", { ...mailBase, sender: { key: "anna@example.test", name: "Anna Lee" } });
check("26", "mail head with a display name", "[อีเมล · Anna Lee] ขอให้ยืนยันนัด", m.d?.aboutLine, m.d?.aboutLine === "[อีเมล · Anna Lee] ขอให้ยืนยันนัด");
m = await run("เมลทดสอบหัวบรรทัด [S71]", { ...mailBase, sender: { key: "anna@example.test", name: "anna@example.test" } });
check("26", "mail head with no display name (name stored as the address)", "[อีเมล · anna] ขอให้ยืนยันนัด", m.d?.aboutLine, m.d?.aboutLine === "[อีเมล · anna] ขอให้ยืนยันนัด");
m = await run("โปรโมชั่นทางเมล [S0]", { ...mailBase, sender: { key: "deals@shop.example.test", name: "deals@shop.example.test" } });
check("26", "rule line, mail, no display name", "[อีเมล · deals] ตรงกฎของคุณ: มีคำว่า โปรโมชั่น", m.d?.aboutLine, m.d?.aboutLine === "[อีเมล · deals] ตรงกฎของคุณ: มีคำว่า โปรโมชั่น");
const [tok] = await qadb`select completion_tokens from ai_calls where message_id = ${m.id} limit 1`;
const [{ toks }] = await qadb`select count(completion_tokens)::int as toks, count(*)::int as n from ai_calls where ok`;
check("12", "ai_calls stores completion_tokens (fake gateway sends usage 1)", "column present, filled on ok calls", `filled on ${toks} ok calls`, toks > 0);

// ---------- #11 layer 1 spam → layer 2 still runs
m = await run("ซื้อเลย ถูกสุด [L1SPAM] [S20]");
check("11", "layer 1 says spam → layer 2 still called", "calls at layers 1 and 2", m.calls.map((c) => c.layer), m.calls.some((c) => c.layer === 2));

// ---------- #13 / #16 / #17 broken answers → fail open
for (const [mark, label] of [["[S70.5]", "score 70.5"], ["[SPCT]", 'score "70%"'], ["[S120]", "score 120"], ["[SNEG]", "score -5"], ["[SMISS]", "no score"], ["[L1BROKEN]", "layer 1 not JSON"], ["[L2DOWN]", "layer 2 HTTP 500"]] as const) {
  m = await run(`คำตอบเสีย ${mark}`);
  const bad = m.calls.filter((c) => !c.ok).length;
  check(mark === "[L1BROKEN]" ? "16" : mark === "[L2DOWN]" ? "17" : "13", `${label} → fail open`,
    "notified · ai_unavailable · score null · reason AI ไม่ได้ตรวจ · aboutLine null · 1 retry (2 failed calls) · notify ran",
    `${m.d?.outcome} · ${m.d?.decidedBy} · ${m.d?.score} · "${m.d?.decision?.reason}" · ${m.d?.aboutLine} · failed calls ${bad} · notes ${m.notes}`,
    m.d?.outcome === "notified" && m.d?.decidedBy === "ai_unavailable" && m.d?.score === null && m.d?.decision?.reason === "AI ไม่ได้ตรวจ" && m.d?.aboutLine === null && bad === 2 && m.notes > 0);
}

// ---------- #15 never answers → 20 s timeout, no retry
m = await run("ไม่มีคำตอบ [HANG]", {}, 90000);
check("15", "gateway never answers (LLM_TIMEOUT_MS default 40 s, TASK-031)", "notified ai_unavailable after ~40 s, 1 failed call (no retry)", `${m.d?.outcome} · ${m.d?.decidedBy} · ${(m.ms / 1000).toFixed(1)} s · calls ${m.calls.length}`,
  m.d?.outcome === "notified" && m.d?.decidedBy === "ai_unavailable" && m.calls.length === 1 && m.ms >= 38000 && m.ms < 60000);

// ---------- #22–#24 corrections
m = await run("จะถูกพักไว้ [S69]");
const heldId = m.id, notesBefore = m.notes;
let c = await call("POST", `/messages/${heldId}/correction`, T, { outcome: "notified" });
const inNotified = (await call("GET", "/messages?tab=notified", T)).json.items.some((i: any) => i.id === heldId);
const [{ n: corrRows }] = await qadb`select count(*)::int as n from corrections where message_id = ${heldId} and user_id = ${U.id} and outcome = 'notified'`;
await Bun.sleep(1000);
check("22", "AC-8 held → แจ้ง", "200 · in notified tab · decidedBy user · system decision kept · 1 correction row · no new notification",
  `${c.status} · ${inNotified} · ${c.json?.message?.decidedBy} · system ${c.json?.message?.decision?.decidedBy}/${c.json?.message?.decision?.outcome} · rows ${corrRows} · notes ${notesBefore}→${await notes(heldId)}`,
  c.status === 200 && inNotified && c.json?.message?.decidedBy === "user" && c.json?.message?.decision?.outcome === "held" && corrRows === 1 && (await notes(heldId)) === notesBefore);
m = await run("จะถูกแจ้ง [S71]");
c = await call("POST", `/messages/${m.id}/correction`, T, { outcome: "held" });
const inHeld = (await call("GET", "/messages?tab=held", T)).json.items.some((i: any) => i.id === m.id);
check("23", "AC-8 passed → ไม่ต้องแจ้ง", "200 · in held tab", `${c.status} · ${inHeld}`, c.status === 200 && inHeld);
const cBad = await call("POST", `/messages/${m.id}/correction`, T, { outcome: "maybe" });
check("23", "correction with an unknown outcome", "400", cBad.status, cBad.status === 400);
m = await run("จะถูกพักไว้ [S69]");
check("24", "after a correction, a similar message is judged the same (no learning)", "held", m.d?.outcome, m.d?.outcome === "held");

// ---------- #25 AC-9 model as a setting
const set = await call("PUT", "/admin/settings/ai", OT, { layer1: { provider: "openai", model: "gpt-4o-mini" }, layer2: { provider: "gemini", model: "gemini-2.5-flash" } });
m = await run("หลังเปลี่ยนรุ่น [S71]");
check("25", "AC-9 change both layers' models in settings → next decision", "openai/gpt-4o-mini · gemini/gemini-2.5-flash", `${set.status} · ${JSON.stringify(m.d?.decision?.layer1)} · ${JSON.stringify(m.d?.decision?.layer2)}`,
  set.status === 200 && m.d?.decision?.layer1?.model === "gpt-4o-mini" && m.d?.decision?.layer2?.model === "gemini-2.5-flash" && m.calls[0]?.model === "gpt-4o-mini");
const setBad = await call("PUT", "/admin/settings/ai", OT, { layer1: { provider: "openai", model: "no-such-model" }, layer2: { provider: "gemini", model: "gemini-2.5-flash" } });
check("25", "a model the gateway does not list", "400 VALIDATION", `${setBad.status} ${setBad.json?.error?.code}`, setBad.status === 400);

// ---------- #14 gateway down (fake gateway stopped)
const gw = Bun.spawnSync(["powershell", "-NoProfile", "-Command", "(Get-NetTCPConnection -LocalPort 3991 -State Listen -ErrorAction SilentlyContinue).OwningProcess"]);
const pid = gw.stdout.toString().trim().split(/\s+/)[0];
if (pid) Bun.spawnSync(["taskkill", "/PID", pid, "/F"]);
await Bun.sleep(1000);
m = await run("เกตเวย์ล่ม [S71]", {}, 60000);
check("14", "AC-5 gateway down (connection refused)", "notified · ai_unavailable · AI ไม่ได้ตรวจ · notify ran · no retry", `${m.d?.outcome} · ${m.d?.decidedBy} · "${m.d?.decision?.reason}" · notes ${m.notes} · calls ${m.calls.length} · ${(m.ms / 1000).toFixed(1)} s`,
  m.d?.outcome === "notified" && m.d?.decidedBy === "ai_unavailable" && m.d?.decision?.reason === "AI ไม่ได้ตรวจ" && m.notes > 0 && m.calls.length === 1);
Bun.spawn(["bun", `${import.meta.dir}/../fake-gateway/server.ts`, `${import.meta.dir}/gw.json`, "--port", "3991"], { stdout: "ignore", stderr: "ignore" }).unref();

await Bun.write(`${import.meta.dir}/test-003-stub-result.json`, JSON.stringify({ ranAt: new Date().toISOString(), user: email, checks }, null, 2));
console.log(`\n${checks.filter((x) => x.pass).length}/${checks.length} checks passed`);
await qadb.close();
process.exit(0);
