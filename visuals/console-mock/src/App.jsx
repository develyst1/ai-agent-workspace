import React, { useEffect, useState } from "react";

const DESKS = [
  { name: "smart-scheduler", status: "FAIL", failures: 11, boot: "663K", ball: "Porter → SA", tone: "red" },
  { name: "corner-chat", status: "FAIL", failures: 16, boot: "78K", ball: "ว่าง", tone: "red" },
  { name: "call-scribe", status: "FAIL", failures: 23, boot: "58K", ball: "ว่าง", tone: "red" },
  { name: "dte", status: "FAIL", failures: 0, boot: "144K", ball: "ว่าง", tone: "red" },
  { name: "portfolio-nichaphon", status: "FAIL", failures: 0, boot: "59K", ball: "ว่าง", tone: "red" },
  { name: "i-space", status: "PASS", failures: 4, boot: "89K", ball: "Sober → BE", tone: "green" },
  { name: "possibility", status: "PASS", failures: 0, boot: "86K", ball: "ว่าง", tone: "green" },
  { name: "pun-kub-fang", status: "PASS", failures: 0, boot: "41K", ball: "ว่าง", tone: "green" },
  { name: "develyst-ai", status: "PASS", failures: 0, boot: "21K", ball: "ว่าง", tone: "green" },
  { name: "buddy-screen", status: "PASS", failures: 2, boot: "52K", ball: "พักงาน", tone: "green" },
  { name: "smart-scheduler-atom", status: "PASS", failures: 1, boot: "72K", ball: "ว่าง", tone: "green" },
];

const CHECKS = [
  { s: "FAIL", t: "board.md 61.8KB > 40KB" },
  { s: "FAIL", t: "inbox/SA-B.md 62.4KB > 2KB" },
  { s: "FAIL", t: "boot read PM 132KB > 90KB" },
  { s: "FAIL", t: "FAILURES 11 unreviewed" },
  { s: "WARN", t: "board ยังมี 16 closed rows" },
  { s: "WARN", t: "4 REQ ผ่าน SPEC_DONE แต่ไม่มี TASK" },
];

function Panel() {
  const [sel, setSel] = useState("smart-scheduler");

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>แผง Workforce Console</h2>
          <p>
            หน้าจอเดียวใน GUI ที่คุณเปิดค้างไว้ — desk ไหนแดง ใครถือลูก ค้างอะไร
            ไม่ต้องไล่เปิด session หรืออ่าน JSON
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">plugin · page</span>
          <span className="chip ghost">0 LLM</span>
        </div>
      </div>

      <div className="win">
        <div className="win-bar">
          <span className="dot red" />
          <span className="dot amber" />
          <span className="dot green" />
          <span className="win-title">Workforce Console</span>
          <span className="badge">plugin</span>
          <span className="win-refresh">อัปเดต 12 วิที่แล้ว · ↻</span>
        </div>

        <div className="stats">
          <div className="stat">
            <b>11</b>
            <span>desk ทั้งหมด</span>
          </div>
          <div className="stat red">
            <b>5</b>
            <span>desk แดง</span>
          </div>
          <div className="stat amber">
            <b>57</b>
            <span>failure ยังไม่ review</span>
          </div>
          <div className="stat">
            <b>716K</b>
            <span>boot read แพงสุด / seat</span>
          </div>
        </div>

        <div className="console-grid">
          <aside className="desk-list">
            {DESKS.map((d) => (
              <button
                key={d.name}
                className={"desk-row" + (sel === d.name ? " on" : "")}
                onClick={() => setSel(d.name)}
              >
                <span className={"pill " + d.tone}>{d.status}</span>
                <span className="desk-name">{d.name}</span>
                <span className="desk-meta">
                  {d.failures > 0 ? d.failures + " ค้าง · boot " + d.boot : "boot " + d.boot}
                </span>
              </button>
            ))}
          </aside>

          <section className="detail">
            <div className="detail-head">
              <div>
                <div className="detail-name">smart-scheduler</div>
                <div className="detail-sub">gate v7 · schema 2 · mode manual</div>
              </div>
              <span className="pill red">FAIL</span>
            </div>

            <div className="ball">
              <div className="ball-label">ใครถือลูกตอนนี้</div>
              <div className="ball-main">Porter (PM) → SA</div>
              <div className="ball-sub">REQ-120 รอใน inbox/SA.md · ค้าง 1 วัน</div>
            </div>

            <div className="checks">
              <div className="checks-label">สิ่งที่ gate ฟ้อง</div>
              {CHECKS.map((c) => (
                <div className="check-row" key={c.t}>
                  <span className={"mini " + (c.s === "FAIL" ? "red" : "amber")}>{c.s}</span>
                  <span>{c.t}</span>
                </div>
              ))}
            </div>

            <div className="actions">
              <button className="btn primary">ส่งนัดไปที่ PM</button>
              <button className="btn">เขียน ORDER → Marie</button>
              <button className="btn ghost">เปิดไฟล์</button>
            </div>

            <div className="detail-foot">
              ปุ่มเหล่านี้เรียก `claude agents --json` + `SendMessage` — ใน mock นี้ยังไม่ทำงานจริง
            </div>
          </section>
        </div>

        <div className="win-foot">
          อ่านจาก `check-hygiene.mjs --json` ตรง ๆ · auto-refresh 60 วิ · ไม่เรียกโมเดล · 0 token
        </div>
      </div>

      <div className="callouts">
        <div className="callout">
          <b>ทำไมไม่ต้องมี server แยก</b>
          <p>plugin อยู่ใน GUI เดียวกับที่คุณคุยกับผม — เปิดแท็บค้างไว้ได้เลย</p>
        </div>
        <div className="callout">
          <b>ทำไมไม่ขัดกับ “ไฟล์คือความจริง”</b>
          <p>มันเป็นเลนส์อ่านไฟล์ ไม่ได้เก็บ state ที่สอง — ตัวเลขไม่เพี้ยน</p>
        </div>
        <div className="callout">
          <b>แล้วใครแก้ของจริง</b>
          <p>ปุ่มสั่งงานแค่เขียน ORDER/inbox — Marie/Atlas เป็นคนลงมือตามบทบาท</p>
        </div>
      </div>
    </div>
  );
}

function Tool() {
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>tool `desk_status` — ยิงเข้าแชทให้ agent ใช้ต่อ</h2>
          <p>
            ตัวเดียวกัน แต่มาทาง tool call: session ไหนก็ถามได้โดยไม่ต้องเปิดไฟล์เอง —
            ผลลัพธ์เข้า context เป็นข้อมูลสั้น ๆ ไม่ใช่ทั้ง board
          </p>
        </div>
        <div className="chip-row">
          <span className="chip ghost">local · 38ms</span>
          <span className="chip">0 token</span>
        </div>
      </div>

      <div className="chat">
        <div className="msg user">วันนี้มีอะไรค้าง</div>

        <div className="toolcall">
          <div className="tc-head">
            <span className="tc-name">desk_status</span>
            <span className="tc-args">{`{ "workspace": "ai-agent-workspace" }`}</span>
            <span className="tc-meta">38ms · 0 token</span>
          </div>
          <div className="tc-body">
            <div className="tc-table">
              <div className="tc-tr tc-th">
                <span>desk</span>
                <span>gate</span>
                <span>ค้าง</span>
                <span>boot</span>
                <span>ใครถือลูก</span>
              </div>
              {DESKS.filter((d) => d.status === "FAIL").map((d) => (
                <div className="tc-tr" key={d.name}>
                  <span className="tc-name-cell">{d.name}</span>
                  <span><i className="pill red">FAIL</i></span>
                  <span className="tc-num">{d.failures || "—"}</span>
                  <span className="tc-num">{d.boot}</span>
                  <span className="tc-ball">{d.ball}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="msg assistant">
          สรุป: 5 desk แดง · 57 failure ค้าง · smart-scheduler แพงสุด (716K/seat) —
          เริ่มจาก Porter ที่รอ SA มา 2 วันไหม?
        </div>
      </div>

      <div className="callouts">
        <div className="callout">
          <b>ทำไมต้องมี tool ด้วย</b>
          <p>session ที่ปรึกษาไม่ต้องอ่าน board ทั้งไฟล์ — ถามเป็นคำตอบสั้น ๆ</p>
        </div>
        <div className="callout">
          <b>ข้อมูลเดียวกันกับแผง</b>
          <p>ทั้งคู่เรียกตัวอ่านชุดเดียวกัน — ไม่มีเลขสองชุดให้เถียงกัน</p>
        </div>
        <div className="callout">
          <b>ไม่ทำงานแทนใคร</b>
          <p>มันแค่รายงาน — การสั่งงานยังต้องผ่าน PM/ATLAS ตาม chain</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#t" ? "T" : "P"
  );

  useEffect(() => {
    const onHash = () => setTab(window.location.hash === "#t" ? "T" : "P");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function pick(t) {
    setTab(t);
    history.replaceState(null, "", t === "T" ? "#t" : "#p");
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="crumb">ai-agent-workspace · ที่ผมจะสร้างให้</div>
        <h1>
          Workforce Console — <span className="hl">เห็นทั้งกองทัพในจอเดียว</span>
        </h1>
        <p className="hero-sub">
          แผงใน GUI (plugin) + tool ให้ session ถามได้ — อ่านไฟล์และ gate ตรง ไม่มี
          LLM ใน loop ไม่มี server แยก และไม่กินเครดิตตอนเปิดค้าง
        </p>

        <div className="tabs">
          <button className={"tab" + (tab === "P" ? " on" : "")} onClick={() => pick("P")}>
            <span className="tab-k">1</span> แผง console
            <small>หน้าจอที่คุณเปิดดู</small>
          </button>
          <button className={"tab" + (tab === "T" ? " on" : "")} onClick={() => pick("T")}>
            <span className="tab-k">2</span> tool
            <small>ให้ session ถาม</small>
          </button>
        </div>
      </header>

      <main>{tab === "P" ? <Panel /> : <Tool />}</main>

      <div className="foot-note">
        อ่านจาก `check-hygiene --json` · `claude agents --json` · ไฟล์ใน ai-worker/ —
        ไม่มีฐานข้อมูลที่สอง
      </div>
    </div>
  );
}
