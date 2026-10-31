// Stand-in Blueprint for REQ-105's CAW-side QA run (PM's Q5 answer, 2026-10-30) — Silver (SA, Team B).
// Serves caw-back's OWN test fake (test/helpers/fake-blueprint.ts: recorded v1 answers + SYNTHETIC v2 per SPEC-106) on a fixed port,
// plus a control route, so QA can drive it with curl. Nothing here is a real Blueprint: the v2 answers are synthetic until TASK-113.
//
// usage:  bun tests/harness/stand-in-blueprint-105.ts <caw-back dir> [port, default 4290]
//   then start caw-back with BLUEPRINT_URL=http://127.0.0.1:<port> (and the usual env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT).
//   The Blueprint project id to link is printed at start (the recorded seed "จองห้องประชุม").
//
// control (JSON body, every field optional):
//   POST /__mode {"down": true|false}                                   — Blueprint answers 500 to everything (AC-5) / back up
//   POST /__mode {"label": {"version": 2, "label": "v2"} | null}         — latest label (AC-3 no label, AC-4 v1 → v2)
//   POST /__mode {"text": 1|2|3}                                         — which recorded version's part TEXT is the current spec
//   POST /__mode {"change": {"changed": ["STEP-004"], "removed": [], "added": []}}
//                                                                         — one saved edit: revision + 1, a change set with that rev (AC-1/AC-2 on CAW's side).
//                                                                           It does NOT change any text by itself: send "text" in the same body
//                                                                           (e.g. {"text": 2, "change": {"changed": ["STEP-004"]}}) for the part reader to show new words.
//   POST /__mode {"gone": ["STEP-004"]} / {"back": ["STEP-004"]}        — a part's context answers 404 / answers again
//   GET  /__mode                                                         — the current state + the last 20 calls CAW made
// REQ-112 (added 2026-10-30, PM's ask; the fake's own knobs from TASK-121 — SYNTHETIC until Team A's TASK-117):
//   POST /__mode {"snapshot": {"parts": [...], "links": [...]} | null}  — what `/spec` lists (coverage reads its decisions + `covers` links)
//   POST /__mode {"decisionsOn": {"SCR-001": [<part>, …]}}              — the `decisions` a part's context carries (null for a key = recorded ones)
//   POST /__mode {"related": {"SCR-001": [{"via": "STEP-002", "decision": <part>}, …]}}
//                                                                         — the `relatedDecisions` it carries (null for a key = none, like Blueprint before TASK-117)
//   POST /__mode {"preset": "req112"}         — TEST-106's shape, as caw-back's test/http/coverage.test.ts: DEC-001…003 cover STEP-002,
//                                               DEC-005 covers SCR-001, SCR-001's context lists DEC-005 only, no relatedDecisions
//                                               → a card on SCR-001 leaves STEP-002 uncovered (DEC-001…003)
//   POST /__mode {"preset": "req112-related"} — the same, plus SCR-001's context carries DEC-001…003 via STEP-002 → nothing uncovered
// A preset or knob changes what CAW reads, not the revision: send {"change": {"changed": ["SCR-001"]}} with it if CAW must re-read.
// After a "change", CAW sees it at its next poll (CAW_POLL_MS), or at once if you POST CAW's /v1/notify
//   {"event":"spec.changed","projectId":"<printed id>","revision":<new rev>,"at":"<iso>"}.

const [dir, portArg] = process.argv.slice(2);
if (!dir) { console.error("usage: bun stand-in-blueprint-105.ts <caw-back dir> [port]"); process.exit(2); }
const port = Number(portArg ?? 4290);
const { fakeBlueprint, BP_PROJECT, BP_NAME } = await import(`${dir.replace(/\/$/, "")}/test/helpers/fake-blueprint.ts`);
const fake = fakeBlueprint();
const now = () => new Date().toISOString();

// REQ-112 preset — the same parts/links as caw-back's test/http/coverage.test.ts (TEST-106's shape)
const part = (key: string, kind: string, title: string) => ({ key, kind, title, body: {}, origin: { date: "2026-10-30", stamp: "operator" } });
const link = (fromKey: string, toKey: string, kind = "covers") => ({ id: `${fromKey}>${toKey}`, kind, fromKey, toKey, position: null, label: null });
const DEC = (n: number) => part(`DEC-00${n}`, "decision", `กฎข้อ ${n}`);
const req112 = (withRelated: boolean) => {
  fake.mode.snapshot = {
    parts: [part("STEP-002", "step", "เช็คสถานะ"), part("SCR-001", "screen", "หน้าจองห้อง"), DEC(1), DEC(2), DEC(3), DEC(5)],
    links: [link("DEC-001", "STEP-002"), link("DEC-002", "STEP-002"), link("DEC-003", "STEP-002"), link("DEC-005", "SCR-001"), link("STEP-002", "SCR-001", "next")],
  };
  fake.mode.decisionsOn["SCR-001"] = [DEC(5)];
  if (withRelated) fake.mode.related["SCR-001"] = [1, 2, 3].map((n) => ({ via: "STEP-002", decision: DEC(n) }));
  else delete fake.mode.related["SCR-001"];
};
const setPerKey = (target: Record<string, unknown>, from: Record<string, unknown>) => {
  for (const [k, v] of Object.entries(from)) { if (v === null) delete target[k]; else target[k] = v; }
};

Bun.serve({
  hostname: "127.0.0.1", port,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__mode") {
      const m = fake.mode;
      if (req.method === "POST") {
        const b = await req.json();
        if (typeof b.down === "boolean") m.down = b.down;
        if (b.label !== undefined) m.spec.label = b.label;
        if (b.text !== undefined) m.spec.version = b.text;
        if (b.change) {
          m.spec.revision += 1; m.spec.savedAt = now();
          m.changes.push({ rev: m.spec.revision, at: m.spec.savedAt, by: "QA", cause: "edit", added: b.change.added ?? [], changed: b.change.changed ?? [], removed: b.change.removed ?? [] });
        }
        for (const k of b.gone ?? []) m.gone.add(k);
        for (const k of b.back ?? []) m.gone.delete(k);
        if (b.preset === "req112" || b.preset === "req112-related") req112(b.preset === "req112-related");
        if (b.snapshot !== undefined) m.snapshot = b.snapshot;
        if (b.decisionsOn) setPerKey(m.decisionsOn, b.decisionsOn);
        if (b.related) setPerKey(m.related, b.related);
      }
      return Response.json({ down: m.down, spec: m.spec, changes: m.changes, gone: [...m.gone], snapshot: m.snapshot, decisionsOn: m.decisionsOn, related: m.related, lastCalls: m.calls.slice(-20) });
    }
    return fetch(fake.url + url.pathname + url.search, { method: req.method, headers: req.headers, body: req.method === "GET" ? undefined : await req.text() });
  },
});
console.log(`stand-in Blueprint on http://127.0.0.1:${port} — project ${BP_PROJECT} (${BP_NAME}) · revision ${fake.mode.spec.revision} · label ${JSON.stringify(fake.mode.spec.label)}`);
