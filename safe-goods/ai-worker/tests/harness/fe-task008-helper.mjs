// TASK-008 harness — drives the BE directly for the steps that are not the FE's (admin
// confirm/reject/payout, opening extra rooms) so the room page can be screenshotted in each state.
// usage: node fe-task008-helper.mjs <cmd> [...args]   (BE on :3001, users seeded by TASK-006/007 runs)
const BE = "http://localhost:3001/api/v1";
const USERS = {
  A: ["fern.task006@local.test", "password123"],
  B: ["buyer.b.task007@local.test", "password123"],
  admin: ["admin@local.test", "admin1234"],
};
const call = async (method, path, token, body, form) => {
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  if (body && !form) headers["content-type"] = "application/json";
  const res = await fetch(BE + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  const json = await res.json();
  return { status: res.status, ...json };
};
const login = async (who) => (await call("POST", "/auth/login", null, { email: USERS[who][0], password: USERS[who][1] })).data.token;
const [cmd, ...args] = process.argv.slice(2);
const out = (r) => console.log(JSON.stringify(r.success ? { status: r.status, code: r.data?.code, roomStatus: r.data?.status, autoReleaseAt: r.data?.autoReleaseAt, released: r.data?.released } : r));
switch (cmd) {
  case "open": { // open <who> <BUYER|SELLER> <categoryId> <desc>
    const t = await login(args[0]);
    out(await call("POST", "/rooms", t, { myRole: args[1], categoryId: Number(args[2]), description: args[3], priceMode: "FEE_ADDED", feePayer: "BUYER", enteredPrice: 100 }));
    break;
  }
  case "join": out(await call("POST", `/rooms/${args[1]}/join`, await login(args[0]))); break; // join <who> <code>
  case "slip": { // slip <who> <code>  — uploads tests/harness/slip.png
    const fd = new FormData();
    fd.append("file", new Blob([await import("node:fs").then((fs) => fs.readFileSync(new URL("./slip.png", import.meta.url)))], { type: "image/png" }), "slip.png");
    out(await call("POST", `/rooms/${args[1]}/slip`, await login(args[0]), null, fd));
    break;
  }
  case "evidence": {
    const fd = new FormData();
    fd.append("file", new Blob([await import("node:fs").then((fs) => fs.readFileSync(new URL("./slip.png", import.meta.url)))], { type: "image/png" }), "evidence.png");
    out(await call("POST", `/rooms/${args[1]}/evidence`, await login(args[0]), null, fd));
    break;
  }
  case "deliver": out(await call("POST", `/rooms/${args[1]}/deliver`, await login(args[0]), args[2] ? { courier: args[2], trackingNumber: args[3] } : {})); break;
  case "confirm": out(await call("POST", `/admin/rooms/${args[0]}/payment/confirm`, await login("admin"))); break;
  case "reject": out(await call("POST", `/admin/rooms/${args[0]}/payment/reject`, await login("admin"), { reason: args[1] })); break;
  case "payout": out(await call("POST", `/admin/rooms/${args[0]}/payout`, await login("admin"))); break;
  case "sweep": out(await call("POST", `/admin/jobs/auto-release`, await login("admin"))); break;
  case "get": { const r = await call("GET", `/rooms/${args[1]}`, await login(args[0])); console.log(JSON.stringify({ status: r.data.status, canCancel: r.data.canCancel, autoReleaseAt: r.data.autoReleaseAt, events: r.data.events.map(e => `${e.type}:${e.actorRole}:${e.actorDisplayName ?? "-"}${e.note ? ":" + e.note : ""}`) })); break; }
  default: console.log("unknown cmd");
}
