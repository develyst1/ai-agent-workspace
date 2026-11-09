// Throwaway (Sober, SPEC-102 Q11, 2026-11-07): how Bun's SQL behaves when an established connection dies mid-query.
// A fake Postgres on loopback, in this file. NO real database, no env, no network beyond 127.0.0.1.
//   bun bun-sql-dead-connection.ts hole    a connection stops answering, with no close (a dropped route, a silent peer)
//   bun bun-sql-dead-connection.ts fin     a connection is closed by the far side during a query
// It shows what the driver does IF that happens. It does not show that this is what happened to the back.
import { SQL } from "bun";

const mode = process.argv[2] as "hole" | "fin";
if (mode !== "hole" && mode !== "fin") throw new Error("usage: hole | fin");

const msg = (t: string, body = Buffer.alloc(0)) => {
  const h = Buffer.alloc(5);
  h.write(t, 0);
  h.writeInt32BE(body.length + 4, 1);
  return Buffer.concat([h, body]);
};
const i32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeInt32BE(n);
  return b;
};

let conns = 0;
let sabotage = false;
const dead = new Set<number>();

const srv = Bun.listen<{ id: number; started: boolean }>({
  hostname: "127.0.0.1",
  port: 0,
  socket: {
    open(s) {
      s.data = { id: ++conns, started: false };
    },
    data(s, d) {
      let b = Buffer.from(d);
      if (!s.data.started) {
        const len = b.readInt32BE(0);
        if (b.readInt32BE(4) === 80877103) {
          s.write("N"); // SSLRequest: no
          return;
        }
        s.data.started = true;
        s.write(Buffer.concat([msg("R", i32(0)), msg("Z", Buffer.from("I"))]));
        b = b.subarray(len);
      }
      if (dead.has(s.data.id)) return; // a silent connection never answers again
      const out: Buffer[] = [];
      let o = 0;
      while (o + 5 <= b.length) {
        const t = String.fromCharCode(b[o]!);
        o += 1 + b.readInt32BE(o + 1);
        if (sabotage && (t === "E" || t === "Q")) {
          sabotage = false;
          dead.add(s.data.id);
          console.error(`  server: connection ${s.data.id} goes ${mode}`);
          if (mode === "fin") s.end();
          return;
        }
        if (t === "P") out.push(msg("1"));
        else if (t === "B") out.push(msg("2"));
        else if (t === "D") out.push(msg("n"));
        else if (t === "E") out.push(msg("C", Buffer.from("SELECT 0\0")));
        else if (t === "S") out.push(msg("Z", Buffer.from("I")));
        else if (t === "Q") out.push(msg("C", Buffer.from("SELECT 0\0")), msg("Z", Buffer.from("I")));
      }
      if (out.length) s.write(Buffer.concat(out));
    },
    close() {},
  },
});

const sql = new SQL(`postgres://u:throwaway@127.0.0.1:${srv.port}/x`);
const LIMIT_MS = 12000;

async function q(label: string) {
  const t = performance.now();
  const p = sql`SELECT 1`.then(
    () => "ok",
    (e: { name?: string; code?: string }) => `ERROR ${e.name} code=${e.code}`,
  );
  const r = await Promise.race([p, Bun.sleep(LIMIT_MS).then(() => `NO ANSWER, gave up waiting at ${LIMIT_MS} ms`)]);
  console.error(`  ${label}: ${r} in ${Math.round(performance.now() - t)} ms | connections opened ${conns}`);
}

console.error(`mode=${mode} bun=${Bun.version}`);
await q("q1 normal");
await q("q2 normal");
sabotage = true;
const stuck = q("q3 hits the dying connection");
await Bun.sleep(300);
await Promise.all([stuck, q("q4 sent 0.3 s later"), q("q5 sent 0.3 s later")]);
await q("q6 afterwards");
process.exit(0);
