// DEF-2 front half (QA, round 5): with the sign-in call answered 500 INTERNAL / 502 UPSTREAM_UNAVAILABLE / a network failure (CDP
// interception, the back untouched), the sign-in form must show REQ-001's "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง", not the save message;
// a wrong password must still show "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (real back, wrong password). Local only.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300";
const WANT = "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง", SAVE = "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง", WRONG = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
const b = await launch({ width: 1280, height: 900, port: 9451 });
const until = async (p, n = 75) => { for (let i = 0; i < n; i++) { if (await p()) return true; await b.sleep(200); } return false; };
const tryOnce = async (label, rule, pw) => {
  await b.goto(`${BASE}/sign-in`, 2500); if (rule) await b.intercept(rule);
  await b.type("อีเมล", "owner@godplan.test"); await b.type("รหัสผ่าน", pw); await b.click("เข้าสู่ระบบ", "button");
  await until(async () => { const t = await b.text(); return t.includes(WANT) || t.includes(SAVE) || t.includes(WRONG); });
  const t = await b.text(); if (rule) await b.clearIntercepts();
  console.log(JSON.stringify({ case: label, shows: t.includes(WANT) ? "signInFailed" : t.includes(WRONG) ? "wrongSignIn" : t.includes(SAVE) ? "SAVE MESSAGE" : "nothing", url: await b.url() }));
};
const isSignIn = (r) => r.method === "POST" && /\/api\/auth\/sign-in$/.test(r.url);
try {
  await tryOnce("500 INTERNAL", (r) => (isSignIn(r) ? { status: 500, body: { error: { code: "INTERNAL" } } } : null), "whatever-pass-1");
  await tryOnce("502 UPSTREAM_UNAVAILABLE", (r) => (isSignIn(r) ? { status: 502, body: { error: { code: "UPSTREAM_UNAVAILABLE" } } } : null), "whatever-pass-1");
  await tryOnce("network failure", (r) => (isSignIn(r) ? "fail" : null), "whatever-pass-1");
  await tryOnce("wrong password (real back)", null, "definitely-wrong-1");
} finally { b.close(); }
