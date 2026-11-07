#!/usr/bin/env node
// local-cdp-instrument-probe.mjs — can TEST-102 drive real Chrome with no installed package? No dependencies.
//
// Proves:  on this machine, plain Chrome DevTools Protocol gives phone width, a file put into a file input, a fake mic
//          reading a WAV file that stops at its end, the request body leaving the page, and a hit-test.
// Run:     node tests/harness/local-cdp-instrument-probe.mjs <input.wav> <recording-out.webm>
//          (needs google-chrome and ports 18771/18772 free). It records for 6 s.
// Measured 2026-11-06: Chrome's `%noloop` suffix did NOT give a silent tail (a 2 s tone, 6 s recorded: -28 to -40 dB to
//          the end), so this probe does not use it. A fake-mic file is speech padded with real silence, longer than the
//          recording will last (fixture mic-en-then-silence.wav).
// Does NOT prove: Android, a real microphone, or the real file picker (the input is filled without opening any picker).
//          It tests the instrument only, against its own small page. It starts no app and calls no provider.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const wav = resolve(process.argv[2] ?? '');
const recordingOut = process.argv[3];
if (!process.argv[2] || !recordingOut) { console.error('usage: local-cdp-instrument-probe.mjs <input.wav> <recording-out.webm>'); process.exit(2); }

const PAGE = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>probe</title><input id=f type=file style="position:absolute;left:10px;top:10px;width:200px;height:40px">
<div style="height:60px"></div><button id=b style="width:200px;height:40px">ส่ง</button>`;

let uploadBytes = 0;
const server = createServer((req, res) => {
  if (req.url === '/upload') {
    const chunks = [];
    req.on('data', (c) => { uploadBytes += c.length; chunks.push(c); });
    req.on('end', () => { writeFileSync(recordingOut, Buffer.concat(chunks)); res.end('ok'); });
    return;
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(PAGE);
}).listen(18771, '127.0.0.1');

const profile = mkdtempSync(join(tmpdir(), 'cdp-probe-'));
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=18772',
  `--user-data-dir=${profile}`, '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
  `--use-file-for-fake-audio-capture=${wav}`, 'about:blank'], { stdio: 'ignore' });

const out = {};
let exitCode = 1;
try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await new Promise((r) => setTimeout(r, 250));
    target = await fetch('http://127.0.0.1:18772/json').then((r) => r.json()).then((l) => l.find((t) => t.type === 'page')).catch(() => undefined);
  }
  if (!target) throw new Error('Chrome debugging port did not answer');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
  let id = 0;
  const waiting = new Map();
  const requests = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
    if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.method + ' ' + new URL(m.params.request.url).pathname);
  };
  const send = (method, params = {}) => new Promise((ok, no) => {
    const n = ++id;
    waiting.set(n, (m) => (m.error ? no(new Error(method + ': ' + m.error.message)) : ok(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const run = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'evaluate failed');
    return r.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 3, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:18771/' });
  await new Promise((r) => setTimeout(r, 800));

  out.widthAsked = 375;
  out.widthReported = await run('innerWidth');
  out.pageScrollWidth = await run('document.documentElement.scrollWidth');
  out.hitTestAtButtonCentre = await run(`(()=>{const r=document.getElementById('b').getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.id})()`);

  const { root } = await send('DOM.getDocument');
  const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: '#f' });
  await send('DOM.setFileInputFiles', { nodeId, files: [wav] });
  out.fileInputHolds = await run(`(()=>{const f=document.getElementById('f').files[0];return f?f.size:0})()`);

  out.recorded = await run(`(async()=>{
    const s=await navigator.mediaDevices.getUserMedia({audio:true});
    const m=new MediaRecorder(s);const c=[];m.ondataavailable=e=>c.push(e.data);
    const done=new Promise(r=>m.onstop=r);m.start();await new Promise(r=>setTimeout(r,6000));m.stop();await done;
    const b=new Blob(c,{type:m.mimeType});
    await fetch('/upload',{method:'POST',body:b});
    return {mime:m.mimeType,bytes:b.size,label:s.getAudioTracks()[0].label};
  })()`);
  await new Promise((r) => setTimeout(r, 300));
  out.serverReceivedBytes = uploadBytes;
  out.requestsSeen = requests;

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  out.screenshotBytes = Buffer.from(shot.data, 'base64').length;
  ws.close();
  exitCode = 0;
} catch (e) {
  out.error = String(e);
} finally {
  chrome.kill();
  server.close();
  await new Promise((r) => setTimeout(r, 400));
  rmSync(profile, { recursive: true, force: true });
}
console.log(JSON.stringify(out, null, 2));
process.exit(exitCode);
