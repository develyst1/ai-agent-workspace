// Runs the dev-only IMAP + SMTP stand-in (the back end's test/support/mail-server.ts) as a standalone process, so the real
// back end can be pointed at it for live checks when no real test mailbox (B2) exists. Throwaway harness; local only.
//
//   cd <corner-chat-back> && bun <this file> --dir <folder> --ports-file <file.json> [--user a@test.local --password pw]
//                                            [--extra b@test.local=pw2] [--preload <file.eml> ...]
//
// - writes {"imapPort":N,"smtpPort":M} to --ports-file as soon as it listens;
// - delivers every --preload .eml into INBOX at start (mail that was already there);
// - then, every 200 ms, delivers each new *.eml that appears in --dir (mail "arriving" while the back end runs);
// - prints one line per delivery and per message the SMTP side accepted. Stop it with the process kill.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const one = (name: string, fallback?: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1]! : fallback;
};
const many = (name: string) => args.flatMap((a, i) => (args[i - 1] === name ? [a] : []));

const dir = one("--dir");
const portsFile = one("--ports-file");
const sentDir = one("--sent-dir"); // optional: every message the SMTP side accepts is saved here as smtp-N.eml
if (!dir || !portsFile) {
  console.error("usage: bun run.ts --dir <folder> --ports-file <file.json> [--user u --password p] [--extra u=p] [--preload f.eml]");
  process.exit(2);
}

const { startMailStandIn } = await import(`${process.cwd()}/test/support/mail-server.ts`);
const extraUsers = Object.fromEntries(many("--extra").map((kv) => kv.split(/=(.*)/s).slice(0, 2) as [string, string]));
const stand = await startMailStandIn({ user: one("--user"), password: one("--password"), extraUsers, messages: many("--preload").map((f) => readFileSync(f)) });
writeFileSync(portsFile, JSON.stringify({ imapPort: stand.imapPort, smtpPort: stand.smtpPort }));
console.log(`[stand-in] IMAP 127.0.0.1:${stand.imapPort} · SMTP 127.0.0.1:${stand.smtpPort} · user ${stand.user} · watching ${dir}`);

const delivered = new Set<string>();
let accepted = 0;
setInterval(async () => {
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".eml") && !delivered.has(n)).sort()) {
    delivered.add(f);
    const uid = await stand.append(readFileSync(join(dir, f)));
    console.log(`[stand-in] delivered ${f} as UID ${uid}`);
  }
  while (accepted < stand.sent.length) {
    const m = stand.sent[accepted++]!;
    console.log(`[stand-in] SMTP accepted a message from ${m.from} to ${m.to.join(",")}`);
    if (sentDir) writeFileSync(join(sentDir, `smtp-${accepted}.eml`), m.raw, "binary"); // exactly what arrived over SMTP
  }
}, 200);
