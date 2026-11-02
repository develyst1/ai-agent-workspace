// QA Team A — helpers that talk to QA's OWN database (corner_chat_test_qa_a, on the owner's server) only. Throwaway harness.
// The owner's DATABASE_URL comes from the back repo's .env, in-process, never printed; only the database name is swapped.
// Paths come from the environment, never from this file (workspace rule: no absolute paths in committed files):
//   QA_BACK_REPO = the corner-chat-back checkout (machine.local.md) · QA_SECRETS = QA's secrets.json, outside the repo.
import { readFileSync, writeFileSync } from "node:fs";
import { SQL } from "bun";

const need = (k: string) => { const v = process.env[k]?.trim(); if (!v) throw new Error(`set ${k} (see the header of qadb.ts)`); return v; };
export const BACK_REPO = need("QA_BACK_REPO");
export const API = "http://127.0.0.1:8191/api/v1";
export const SECRETS = need("QA_SECRETS");

export function qaDbUrl(): string {
  const env = readFileSync(`${BACK_REPO}/.env`, "utf8");
  const m = env.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
  if (!m) throw new Error("no DATABASE_URL in the back repo's .env — ask the owner through the PM");
  const u = new URL(m[1]!.replace(/^["']|["']$/g, ""));
  if (["127.0.0.1", "localhost", "::1"].includes(u.hostname)) throw new Error("refusing: a local Postgres (rule 4, TEST-001 Q4)");
  u.pathname = "/corner_chat_test_qa_a";
  return u.toString();
}
export const qadb = new SQL(qaDbUrl());
export const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));

export async function call(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
}

export async function login(email: string, password: string) {
  return call("POST", "/auth/login", undefined, { email, password });
}

// Ingest one made-up message through the PRODUCT's ingestMessage, in a child process bound to QA's database.
export function ingest(input: Record<string, unknown>): { messageId: string; duplicate: boolean } | { error: string } {
  const code = `
    const { ingestMessage } = await import("${BACK_REPO}/src/core/intake.ts");
    const { db } = await import("${BACK_REPO}/src/core/db.ts");
    try { const r = await ingestMessage(JSON.parse(process.env.QA_INPUT)); console.log(JSON.stringify(r)); }
    catch (e) { console.log(JSON.stringify({ error: e.name + ": " + e.message })); }
    await db.close();`;
  const file = `${import.meta.dir}/.ingest-child.ts`;
  writeFileSync(file, code); // sync: an un-awaited Bun.write left the child an empty file (first run, 2026-11-01)
  const r = Bun.spawnSync(["bun", file], {
    cwd: BACK_REPO,
    env: { ...process.env, NODE_ENV: "development", DATABASE_URL: qaDbUrl(), SECRET_KEY: secrets.secretKey, QA_INPUT: JSON.stringify(input) },
  });
  const out = r.stdout.toString().trim().split("\n").pop() ?? "";
  try { return JSON.parse(out); } catch { return { error: `child failed: ${r.stderr.toString().slice(0, 300)}` }; }
}

export function lineMsg(userId: string, text: string, extra: Record<string, unknown> = {}) {
  return {
    userId, channel: "line", externalId: `qa-a-${crypto.randomUUID()}`,
    sender: { key: "U-qa-a-sender", name: "ผู้ส่งทดสอบ" }, groupId: "G-qa-a-group", groupName: "กลุ่มทดสอบ QA-A",
    text, recipientKind: "mention", hasAttachments: false, attachmentNames: [], receivedAt: new Date().toISOString(), ...extra,
  };
}

export async function waitDecided(messageId: string, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const [m] = await qadb`select filter_state, outcome from messages where id = ${messageId}`;
    if (m?.filter_state === "done") return m;
    await Bun.sleep(300);
  }
  return null;
}
