// TEST-001 #16 tail: after the 5-minute lock, the right password works and resets the count. Throwaway harness.
import { login } from "./qadb";
const r = JSON.parse(await Bun.file(`${import.meta.dir}/test-001-result.json`).text());
const email = r.U3 as string;
const pw = `pw-u3-${r.tag}-xyz`;
const first = await login(email, pw);
const wait = Number(first.headers.get("retry-after") ?? 0);
console.log(`${new Date().toISOString()} still locked: ${first.status}, Retry-After=${wait}s — waiting ${wait + 5}s`);
await Bun.sleep((wait + 5) * 1000);
const ok = await login(email, pw);
console.log(`${new Date().toISOString()} after the lock: ${ok.status} ${ok.json?.error?.code ?? ""} — expected 200`);
const w1 = await login(email, "wrong-again");
console.log(`one wrong after unlock: ${w1.status} ${w1.json?.error?.code ?? ""} — expected 401 (count reset, not 429)`);
