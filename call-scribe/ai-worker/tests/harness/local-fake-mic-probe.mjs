// Throwaway instrument probe (Tefany, 2026-11-06, REQ-101 reading round). Not a product test.
// Question: can headless Chrome at phone width record from a fake mic fed by a known WAV?
// Run: bun probe-fake-mic.mjs <input.wav> <output-dir>
// It serves one page on localhost, lets MediaRecorder capture 3 s, and saves what it got.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [wav, outDir] = process.argv.slice(2);
if (!wav || !outDir) throw new Error("usage: probe-fake-mic.mjs <input.wav> <output-dir>");

const page = `<!doctype html><script>
(async () => {
  const report = { secure: isSecureContext, width: innerWidth };
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    const r = new MediaRecorder(s), parts = [];
    report.mime = r.mimeType;
    r.ondataavailable = e => parts.push(e.data);
    r.onstop = async () => {
      await fetch("/up", { method: "POST", body: new Blob(parts) });
      await fetch("/done", { method: "POST", body: JSON.stringify(report) });
    };
    r.start();
    setTimeout(() => r.stop(), 3000);
  } catch (e) {
    report.error = String(e);
    await fetch("/done", { method: "POST", body: JSON.stringify(report) });
  }
})();
</script>`;

let chrome;
const profile = mkdtempSync(join(tmpdir(), "probe-mic-"));
const finish = (code, msg) => {
  console.log(msg);
  chrome?.kill();
  setTimeout(() => {
    rmSync(profile, { recursive: true, force: true });
    process.exit(code);
  }, 500);
};

const server = Bun.serve({
  port: 0,
  hostname: "localhost",
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === "/up") {
      writeFileSync(join(outDir, "captured.webm"), new Uint8Array(await req.arrayBuffer()));
      return new Response("ok");
    }
    if (path === "/done") {
      finish(0, "page report: " + (await req.text()));
      return new Response("ok");
    }
    return new Response(page, { headers: { "content-type": "text/html" } });
  },
});

chrome = spawn("google-chrome", [
  "--headless=new", "--no-sandbox", `--user-data-dir=${profile}`, "--window-size=390,844",
  "--autoplay-policy=no-user-gesture-required",
  "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
  `--use-file-for-fake-audio-capture=${wav}`,
  `http://localhost:${server.port}/`,
], { stdio: "ignore" });

setTimeout(() => finish(1, "TIMEOUT: page never reported within 30 s"), 30000);
