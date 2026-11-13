// THROWAWAY browser driver (no dependencies): headless Chrome over the DevTools Protocol, using Node's built-in WebSocket.
// Lets a script click, type, read text and take screenshots at a given width. Written by the FE for TASK-007 evidence.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function launch({ width = 1280, height = 900, port = 9333 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "cdp-"));
  const proc = spawn("google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`,
    `--user-data-dir=${dir}`, `--window-size=${width},${height}`, "about:blank",
  ], { stdio: "ignore" });
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("chrome did not start");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const rules = []; // request interceptors: (req) => null | "fail" | { status, body }
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Fetch.requestPaused") {
      const { requestId, request } = m.params;
      let act = null;
      for (const r of rules) { act = r(request); if (act) break; }
      if (act === "fail") send("Fetch.failRequest", { requestId, errorReason: "ConnectionRefused" });
      else if (act) send("Fetch.fulfillRequest", { requestId, responseCode: act.status, responseHeaders: [{ name: "content-type", value: "application/json" }], body: Buffer.from(JSON.stringify(act.body ?? {})).toString("base64") });
      else send("Fetch.continueRequest", { requestId });
      return;
    }
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Runtime.enable");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const b = {
    send, sleep,
    /** answer matching /api requests with a fake failure: rule(request) → "fail" | {status, body} | null */
    async intercept(rule) { rules.push(rule); await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] }); },
    async clearIntercepts() { rules.length = 0; await send("Fetch.disable"); },
    async size(w, h) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
    },
    async goto(url, wait = 1500) { await send("Page.navigate", { url }); await sleep(wait); },
    async eval(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "eval failed");
      return r.result.value;
    },
    async text() { return b.eval("document.body.innerText"); },
    async url() { return b.eval("location.pathname"); },
    /** centre of the first visible element whose own text equals `text` (button, link, menuitem, label) */
    async centre(text, sel = "button,a,[role=menuitem],[role=menuitemradio],label") {
      return b.eval(`(() => { const els=[...document.querySelectorAll(${JSON.stringify(sel)})].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed');
        const el = els.find(e => e.textContent.trim() === ${JSON.stringify(text)}) ?? els.find(e => (e.getAttribute('aria-label')||'') === ${JSON.stringify(text)});
        if(!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    },
    async clickAt({ x, y }) {
      for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
        await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1, pointerType: "mouse" });
      await sleep(350);
    },
    async click(text, sel) {
      const c = await b.centre(text, sel);
      if (!c) throw new Error(`no clickable "${text}"`);
      await b.clickAt(c);
    },
    /** focus the input by its accessible label (or placeholder) and type */
    async type(label, value) {
      const ok = await b.eval(`(() => { const ins=[...document.querySelectorAll('input,textarea')];
        const el = ins.find(i => (i.labels?.[0]?.textContent.trim()===${JSON.stringify(label)}) || i.placeholder===${JSON.stringify(label)} || i.getAttribute('aria-label')===${JSON.stringify(label)});
        if(!el) return false; el.scrollIntoView({block:'center'}); el.focus(); el.select?.(); return true; })()`);
      if (!ok) throw new Error(`no input "${label}"`);
      await send("Input.insertText", { text: value });
      await sleep(150);
    },
    async press(key) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: key === "Enter" ? 13 : 27, text: key === "Enter" ? "\r" : undefined });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: key === "Enter" ? 13 : 27 });
      await sleep(350);
    },
    async shot(file, { full = true } = {}) {
      let clip;
      if (full) {
        const h = await b.eval("Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)");
        const w = await b.eval("document.documentElement.clientWidth");
        clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
      }
      const r = await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: full });
      writeFileSync(file, Buffer.from(r.data, "base64"));
    },
    /** horizontal page scroll check: documentElement scrollWidth vs clientWidth */
    async pageOverflowX() { return b.eval("document.documentElement.scrollWidth - document.documentElement.clientWidth"); },
    close() { try { ws.close(); } catch {} proc.kill(); },
  };
  return b;
}
