// Seed for a TEST-001 round on the REAL god_plan dev back (QA, Tanya) — through the app's own API only, never SQL.
// Recreates the back-pglite seed shape with a run tag, so the UI/API harnesses run unchanged:
//   P1 "ย้ายบ้านใหม่<TAG>" (6 tasks: 1 todo, 2 doing, 2 stuck with reasons, 1 done; 2 comments on ย้ายอินเทอร์เน็ต; member A)
//   P2 "งานสวนหลังบ้าน<TAG>" (2 tasks; member B only — so B has an account but never sees P1)
// A = invitee-a<TAG>@godplan.test "สมศรี ทดสอบ", B = invitee-b<TAG>@godplan.test "สมชาย ทดสอบ". Synthetic people only.
// Env: QA_OWNER_EMAIL, QA_OWNER_PASSWORD (from the out-of-repo god-plan-qa.env, never printed), GP_SEED_A_PASSWORD, GP_SEED_B_PASSWORD, QA_TAG.
// Back must be 127.0.0.1:4310. Prints ids/names only.
const BACK = "http://127.0.0.1:4310", ORIGIN = "http://127.0.0.1:4300";
const E = (k) => { const v = process.env[k]; if (!v) { console.error("missing " + k); process.exit(2); } return v; };
const TAG = E("QA_TAG");
function client() {
  let cookie = "";
  return async (method, path, body) => {
    const h = { origin: ORIGIN }; if (cookie) h.cookie = cookie; if (body !== undefined) h["content-type"] = "application/json";
    const r = await fetch(BACK + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const c of r.headers.getSetCookie?.() || []) cookie = c.split(";")[0];
    const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
    if (r.status >= 400) throw new Error(`${method} ${path} → ${r.status} ${t.slice(0, 120)}`);
    return j;
  };
}
const o = client();
await o("POST", "/api/auth/sign-in", { email: E("QA_OWNER_EMAIL"), password: E("QA_OWNER_PASSWORD") });
const P1 = (await o("POST", "/api/projects", { name: `ย้ายบ้านใหม่${TAG}`, description: "โปรเจกต์ตัวอย่างสำหรับทดสอบ" })).project;
const P2 = (await o("POST", "/api/projects", { name: `งานสวนหลังบ้าน${TAG}`, description: "โปรเจกต์ตัวอย่างสำหรับทดสอบ" })).project;
const t = {};
for (const title of ["จองรถขนของ", "แพ็คของห้องนอน", "แพ็คของห้องครัว", "ย้ายอินเทอร์เน็ต", "โอนทะเบียนบ้าน", "ทำความสะอาดบ้านเก่า"])
  t[title] = (await o("POST", `/api/projects/${P1.id}/tasks`, { title })).task;
await o("PATCH", `/api/tasks/${t["แพ็คของห้องนอน"].id}`, { status: "doing" });
await o("PATCH", `/api/tasks/${t["แพ็คของห้องครัว"].id}`, { status: "doing" });
await o("PATCH", `/api/tasks/${t["ย้ายอินเทอร์เน็ต"].id}`, { status: "stuck", stuckReason: "รอช่างนัดวัน" });
await o("PATCH", `/api/tasks/${t["โอนทะเบียนบ้าน"].id}`, { status: "stuck", stuckReason: "รอเอกสารจากเจ้าของเดิม" });
await o("PATCH", `/api/tasks/${t["ทำความสะอาดบ้านเก่า"].id}`, { status: "done" });
await o("POST", `/api/projects/${P2.id}/tasks`, { title: "ซื้อต้นไม้" });
const dig = (await o("POST", `/api/projects/${P2.id}/tasks`, { title: "ขุดแปลงผัก" })).task;
await o("PATCH", `/api/tasks/${dig.id}`, { status: "doing" });
// invite A to P1, B to P2 — each accepts signed out
const join = async (pid, name, email, password) => {
  const url = (await o("POST", `/api/projects/${pid}/invites`, { name })).url; const tok = url.split("/invite/")[1];
  const c = client(); await c("POST", `/api/invites/${tok}/accept`, { email, password, displayName: name }); return c;
};
const a = await join(P1.id, "สมศรี ทดสอบ", `invitee-a${TAG}@godplan.test`, E("GP_SEED_A_PASSWORD"));
await join(P2.id, "สมชาย ทดสอบ", `invitee-b${TAG}@godplan.test`, E("GP_SEED_B_PASSWORD"));
await o("POST", `/api/tasks/${t["ย้ายอินเทอร์เน็ต"].id}/comments`, { body: "ช่างบอกว่าจะโทรกลับพรุ่งนี้" });
await a("POST", `/api/tasks/${t["ย้ายอินเทอร์เน็ต"].id}/comments`, { body: "ถ้าช้าเดี๋ยวช่วยโทรตามให้" });
console.log(JSON.stringify({ tag: TAG, P1: { id: P1.id, name: P1.name }, P2: { id: P2.id, name: P2.name }, A: `invitee-a${TAG}@godplan.test`, B: `invitee-b${TAG}@godplan.test` }));
