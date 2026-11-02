// TEST-001 (REQ-001) API cases, run against QA's own instance (127.0.0.1:8191, db corner_chat_qa_tanya).
//   bun test-001.ts            → prints one line per check and writes test-001-result.json
// Throwaway harness, not product code. All accounts are made up (@qa-a.test).
import { call, login, ingest, lineMsg, qadb, secrets, waitDecided } from "./qadb";

type Check = { case: string; what: string; expected: string; actual: string; pass: boolean };
const checks: Check[] = [];
const check = (c: string, what: string, expected: string, actual: unknown, pass: boolean) => {
  const a = typeof actual === "string" ? actual : JSON.stringify(actual);
  checks.push({ case: c, what, expected, actual: a, pass });
  console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${a}`);
};
const code = (r: { status: number; json: any }) => `${r.status} ${r.json?.error?.code ?? ""}`.trim();
const tag = Date.now().toString(36);

// --- owner
const ownerLogin = await login(secrets.ownerEmail, secrets.ownerPassword);
check("1", "owner signs in", "200 role owner", `${ownerLogin.status} ${ownerLogin.json?.user?.role}`, ownerLogin.status === 200 && ownerLogin.json.user.role === "owner");
const OT = ownerLogin.json.token as string;

// --- #1 add users U1, U2 → they sign in
const mk = async (n: string) => {
  const email = `${n}-${tag}@qa-a.test`, password = `pw-${n}-${tag}-xyz`;
  const r = await call("POST", "/admin/users", OT, { name: `ผู้ใช้ทดสอบ ${n}`, email, password });
  return { r, email, password, id: r.json?.user?.id as string };
};
const U1 = await mk("u1"), U2 = await mk("u2");
check("1", "owner adds U1", "201 role user active", `${U1.r.status} ${U1.r.json?.user?.role} ${U1.r.json?.user?.status}`, U1.r.status === 201 && U1.r.json.user.role === "user" && U1.r.json.user.status === "active");
const l1 = await login(U1.email, U1.password);
check("1", "U1 signs in with the owner's email+password (API)", "200", l1.status, l1.status === 200);
const l1case = await login(`  ${U1.email.toUpperCase()} `, U1.password);
check("1", "email is trimmed + case-insensitive at sign-in", "200", l1case.status, l1case.status === 200);
let T1 = l1.json.token as string;
const T2 = (await login(U2.email, U2.password)).json.token as string;

// --- #2 duplicate email
const dup = await call("POST", "/admin/users", OT, { name: "dup", email: U1.email.toUpperCase(), password: "another-pw-123" });
check("2", "add again with U1's email (upper-case)", "409 EMAIL_TAKEN", code(dup), dup.status === 409 && dup.json.error.code === "EMAIL_TAKEN");
const [{ n: dupCount }] = await qadb`select count(*)::int as n from users where email = ${U1.email}`;
check("2", "still one account for U1's email", "1", dupCount, dupCount === 1);

// --- #3 malformed
for (const [label, body] of [
  ["empty email", { name: "x", email: "", password: "longenough1" }],
  ["malformed email", { name: "x", email: "notanemail", password: "longenough1" }],
  ["empty password", { name: "x", email: `p-${tag}@qa-a.test`, password: "" }],
  ["7-char password", { name: "x", email: `p7-${tag}@qa-a.test`, password: "1234567" }],
  ["empty name", { name: "", email: `pn-${tag}@qa-a.test`, password: "longenough1" }],
] as const) {
  const r = await call("POST", "/admin/users", OT, body);
  check("3", `add with ${label}`, "400 VALIDATION", code(r), r.status === 400 && r.json.error.code === "VALIDATION");
}
const [{ n: strays }] = await qadb`select count(*)::int as n from users where email like ${"p%-" + tag + "@qa-a.test"} or email = 'notanemail'`;
check("3", "no account left by the refused adds", "0", strays, strays === 0);

// --- #4 wrong email or password → same code
const wrongPw = await login(U2.email, "definitely-wrong");
const unknown = await login(`nobody-${tag}@qa-a.test`, "definitely-wrong");
check("4", "wrong password", "401 INVALID_CREDENTIALS", code(wrongPw), wrongPw.status === 401 && wrongPw.json.error.code === "INVALID_CREDENTIALS");
check("4", "unknown email: same answer as wrong password", code(wrongPw), code(unknown), code(unknown) === code(wrongPw));
await login(U2.email, U2.password); // reset U2's count

// --- #5 user token on admin API
for (const [m, p, b] of [
  ["GET", "/admin/users"], ["POST", "/admin/users", { name: "x", email: `x-${tag}@qa-a.test`, password: "longenough1" }],
  ["POST", `/admin/users/${U2.id}/disable`], ["POST", `/admin/users/${U2.id}/enable`],
  ["POST", `/admin/users/${U2.id}/password`, { password: "hijacked-123" }],
  ["GET", "/admin/settings/ai"], ["PUT", "/admin/settings/ai", { layer1: { provider: null, model: null }, layer2: { provider: null, model: null } }],
  ["GET", "/admin/stats/line-pushes"], ["GET", "/admin/ai-models"],
] as [string, string, unknown?][]) {
  const r = await call(m, p, T1, b);
  check("5", `U1 token ${m} ${p.replace(U2.id, "<U2>")}`, "403 FORBIDDEN", code(r), r.status === 403 && r.json.error.code === "FORBIDDEN");
}
const stillU2 = await login(U2.email, U2.password);
check("5", "U2 unaffected by U1's admin attempts (old password still works)", "200", stillU2.status, stillU2.status === 200);

// --- #6 no token
for (const [m, p] of [["GET", "/admin/users"], ["GET", "/me"], ["GET", "/messages?tab=notified"], ["GET", "/conditions"], ["GET", "/channels"], ["PUT", "/devices"]] as const) {
  const r = await call(m, p, undefined, m === "PUT" ? { fcmToken: "x", platform: "android" } : undefined);
  check("6", `no token ${m} ${p}`, "401 UNAUTHENTICATED", code(r), r.status === 401 && r.json.error.code === "UNAUTHENTICATED");
}
const bogus = await call("GET", "/me", "not-a-real-token");
check("6", "made-up token", "401 UNAUTHENTICATED", code(bogus), bogus.status === 401);

// --- data for #7–#9: U2 gets a message, a rule, a bar, a device; U1 gets its own
const u2msg = ingest(lineMsg(U2.id, "ข้อความของ U2 เท่านั้น ห้าม U1 เห็น"));
const u1msg = ingest(lineMsg(U1.id, "ข้อความของ U1"));
const u2id = (u2msg as any).messageId as string, u1id = (u1msg as any).messageId as string;
check("7", "made-up messages ingested for U1 and U2", "two ids", `${u1id} ${u2id}`, !!u1id && !!u2id);
await waitDecided(u2id); await waitDecided(u1id);
const u2rule = await call("POST", "/conditions/rules", T2, { kind: "keyword", value: `คำของU2-${tag}`, action: "never" });
await call("PUT", "/conditions/settings", T2, { bar: 42, sentences: "ประโยคของ U2" });
await call("PUT", "/devices", T2, { fcmToken: `fcm-u2-${tag}`, platform: "android" });
const u2ruleId = u2rule.json?.rule?.id as string;

// #7 lists
const lists = [
  ...(await call("GET", "/messages?tab=notified", T1)).json.items,
  ...(await call("GET", "/messages?tab=held", T1)).json.items,
];
check("7", "U1's message lists hold none of U2's", "no U2 id", lists.map((i: any) => i.id), !lists.some((i: any) => i.id === u2id) && lists.some((i: any) => i.id === u1id));
const c1 = await call("GET", "/conditions", T1);
check("7", "U1's conditions: own bar and no U2 rule", "bar 70, no U2 rule", { bar: c1.json.bar, rules: c1.json.rules.length, sentences: c1.json.sentences }, c1.json.bar === 70 && !c1.json.rules.some((r: any) => r.id === u2ruleId) && c1.json.sentences === "");
const ch1 = await call("GET", "/channels", T1);
check("7", "U1's channels: nothing of U2's", "mail not connected", ch1.json, ch1.status === 200 && ch1.json.mail.connected === false);

// #8 U2's ids with U1's token
for (const [m, p, b] of [
  ["GET", `/messages/${u2id}`], ["POST", `/messages/${u2id}/correction`, { outcome: "held" }],
  ["POST", `/messages/${u2id}/correction`, { outcome: "notified" }], ["POST", `/messages/${u2id}/replies`, { body: "x" }],
  ["DELETE", `/conditions/rules/${u2ruleId}`],
] as [string, string, unknown?][]) {
  const r = await call(m, p, T1, b);
  check("8", `U1 token ${m} ${p.replace(u2id, "<U2 msg>").replace(u2ruleId, "<U2 rule>")}`, "404 NOT_FOUND", code(r), r.status === 404 && r.json.error.code === "NOT_FOUND");
}
const fake = crypto.randomUUID();
const rNo = await call("GET", `/messages/${fake}`, T1);
check("8", "an id that does not exist: same answer as another user's", "404 NOT_FOUND", code(rNo), rNo.status === 404);
const rBad = await call("GET", `/messages/not-a-uuid`, T1);
check("8", "a malformed id", "404 (or 400), never 500", code(rBad), rBad.status === 404 || rBad.status === 400);
const delDev = await call("DELETE", `/devices/fcm-u2-${tag}`, T1);
const [{ n: devLeft }] = await qadb`select count(*)::int as n from devices where fcm_token = ${"fcm-u2-" + tag} and user_id = ${U2.id}`;
check("8", "U1 deletes U2's device token", "U2's device kept", `${delDev.status}, U2 rows left ${devLeft}`, devLeft === 1);
const after = await call("GET", "/conditions", T2);
const [d2] = await qadb`select outcome from messages where id = ${u2id}`;
const [{ n: corr2 }] = await qadb`select count(*)::int as n from corrections where message_id = ${u2id}`;
const [{ n: out2 }] = await qadb`select count(*)::int as n from mail_outbox where message_id = ${u2id}`;
check("8", "U2's data unchanged afterwards", "rule kept, bar 42, no correction, no reply", { rules: after.json.rules.length, bar: after.json.bar, corrections: corr2, outbox: out2, outcome: d2.outcome },
  after.json.rules.some((r: any) => r.id === u2ruleId) && after.json.bar === 42 && corr2 === 0 && out2 === 0);

// #9 create with U2 as owner
const sneaky = await call("POST", "/conditions/rules", T1, { kind: "keyword", value: `sneaky-${tag}`, action: "always", userId: U2.id, user_id: U2.id });
const [own] = await qadb`select user_id from rules where value = ${"sneaky-" + tag}`;
check("9", "rule created by U1 with userId=U2 in the body", "stored as U1's or refused", `${sneaky.status} owner=${own?.user_id === U1.id ? "U1" : own?.user_id === U2.id ? "U2" : "none"}`, !own || own.user_id === U1.id);
const sneakyBar = await call("PUT", "/conditions/settings", T1, { bar: 99, sentences: "", userId: U2.id });
const u2bar = (await call("GET", "/conditions", T2)).json.bar;
check("9", "settings PUT by U1 with userId=U2", "U2's bar stays 42", `${sneakyBar.status}, U2 bar ${u2bar}`, u2bar === 42);
await call("PUT", "/conditions/settings", T1, { bar: 70, sentences: "" });

// --- #10/#11 disable
const live1 = await call("GET", "/me", T1);
check("11", "U1's sign-in works before the disable", "200", live1.status, live1.status === 200);
const dis = await call("POST", `/admin/users/${U1.id}/disable`, OT);
check("10", "owner disables U1", "200 status disabled", `${dis.status} ${dis.json?.user?.status}`, dis.status === 200 && dis.json.user.status === "disabled");
const after11 = await call("GET", "/me", T1);
check("11", "U1's existing sign-in after the disable (D23: refused at once)", "401 (UNAUTHENTICATED or ACCOUNT_DISABLED)", code(after11), after11.status === 401);
const lDis = await login(U1.email, U1.password);
check("10", "disabled U1 signs in", "403 ACCOUNT_DISABLED", code(lDis), lDis.status === 403 && lDis.json.error.code === "ACCOUNT_DISABLED");
const lDisWrong = await login(U1.email, "wrong-password");
check("10", "disabled U1 with a WRONG password", "401 INVALID_CREDENTIALS (does not reveal the account state)", code(lDisWrong), lDisWrong.status === 401);
const ownerDis = await call("POST", `/admin/users/${ownerLogin.json.user.id}/disable`, OT);
check("10", "owner tries to disable the owner", "400 CANNOT_DISABLE_OWNER", code(ownerDis), ownerDis.status === 400 && ownerDis.json.error.code === "CANNOT_DISABLE_OWNER");

// #12 message for a disabled user
const before12 = (await qadb`select count(*)::int as n from messages where user_id = ${U1.id}`)[0].n;
const r12 = ingest(lineMsg(U1.id, "ข้อความถึง U1 ตอนปิดใช้งาน"));
const after12 = (await qadb`select count(*)::int as n from messages where user_id = ${U1.id}`)[0].n;
check("12", "ingest for disabled U1 (core seam; mail poller = REQ-002, not built)", "IngestRefused, no new row", `${JSON.stringify(r12)} rows ${before12}→${after12}`, "error" in r12 && /IngestRefused/.test((r12 as any).error) && before12 === after12);

// #13 enable again
const en = await call("POST", `/admin/users/${U1.id}/enable`, OT);
const lEn = await login(U1.email, U1.password);
check("13", "owner enables U1; U1 signs in", "200 / 200", `${en.status} / ${lEn.status}`, en.status === 200 && lEn.status === 200);
T1 = lEn.json.token;

// #14/#15 reset
const reset = await call("POST", `/admin/users/${U1.id}/password`, OT, { password: `new-pw-${tag}-abc` });
check("14", "owner resets U1's password", "204", reset.status, reset.status === 204);
const old15 = await call("GET", "/me", T1);
check("15", "sign-in made before the reset (D23)", "401", code(old15), old15.status === 401);
const lOld = await login(U1.email, U1.password);
check("14", "old password", "401 INVALID_CREDENTIALS", code(lOld), lOld.status === 401);
const lNew = await login(U1.email, `new-pw-${tag}-abc`);
check("14", "new password", "200", lNew.status, lNew.status === 200);
const resetShort = await call("POST", `/admin/users/${U1.id}/password`, OT, { password: "short" });
check("14", "reset to a 5-char password", "400", code(resetShort), resetShort.status === 400);

// #16–#18 lockout (U3, a fresh account)
const U3 = await mk("u3");
const tries: string[] = [];
for (let i = 1; i <= 4; i++) tries.push(code(await login(U3.email, `wrong-${i}`)));
check("16", "wrong passwords 1–4", "401 ×4", tries, tries.every((t) => t === "401 INVALID_CREDENTIALS"));
const fifth = await login(U3.email, "wrong-5");
check("16", "5th wrong password", "401 or 429 (lock starts)", code(fifth), fifth.status === 401 || fifth.status === 429);
const locked = await login(U3.email, U3.password);
check("16", "RIGHT password while locked", "429 TOO_MANY_ATTEMPTS + Retry-After ≤ 300", `${code(locked)} Retry-After=${locked.headers.get("retry-after")}`,
  locked.status === 429 && locked.json.error.code === "TOO_MANY_ATTEMPTS" && Number(locked.headers.get("retry-after")) > 0 && Number(locked.headers.get("retry-after")) <= 300);
const lockedUpper = await login(U3.email.toUpperCase(), U3.password);
check("16", "same email in upper case while locked", "429", code(lockedUpper), lockedUpper.status === 429);
const otherOk = await login(U2.email, U2.password);
check("18", "U2 signs in while U3 is locked", "200", otherOk.status, otherOk.status === 200);
const U4 = await mk("u4");
for (let i = 1; i <= 4; i++) await login(U4.email, `wrong-${i}`);
const mid = await login(U4.email, U4.password);
const again: string[] = [];
for (let i = 1; i <= 4; i++) again.push(code(await login(U4.email, `wrong-b${i}`)));
const fin = await login(U4.email, U4.password);
check("17", "4 wrong → right → 4 wrong → right", "200 then 200 (count reset)", `${mid.status} … ${again.join(",")} … ${fin.status}`, mid.status === 200 && fin.status === 200);
const unk: string[] = [];
for (let i = 1; i <= 6; i++) unk.push(String((await login(`ghost-${tag}@qa-a.test`, "x")).status));
check("16", "unknown email 6 wrong in a row (counted too, SPEC §3.2)", "…429 by the 6th", unk, unk[5] === "429");

// #21 secrets in responses
const users = await call("GET", "/admin/users", OT);
const blob = JSON.stringify(users.json) + JSON.stringify(lNew.json) + JSON.stringify(ownerLogin.json.user);
check("21", "no password / hash in admin list or sign-in replies", "no 'password', no '$argon2'", blob.match(/password|argon2|hash/i)?.[0] ?? "none", !/password|argon2|hash/i.test(blob));

await Bun.write(`${import.meta.dir}/test-001-result.json`, JSON.stringify({ ranAt: new Date().toISOString(), tag, U3: U3.email, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed — U3 (locked) = ${U3.email}`);
await qadb.close();
