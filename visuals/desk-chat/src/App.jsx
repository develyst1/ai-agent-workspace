import React, { useEffect, useState } from "react";

const DESKS = [
  {
    name: "smart-scheduler",
    seats: ["Porter-rat", "Sober-rat", "Jason-rat", "Fern-rat", "Tanya-rat"],
  },
  { name: "corner-chat", seats: ["Porter-cc", "Sober-cc", "Fanta-cc"] },
  { name: "i-space", seats: ["Porter-isp", "Sober-isp"] },
  { name: "dte", seats: ["Porter-dte", "Jason-dte"] },
];

const SEATS = {
  "Porter-rat": { engine: "claude", role: "PM", desk: "smart-scheduler", state: "waiting", bad: 1 },
  "Sober-rat": { engine: "claude", role: "SA", desk: "smart-scheduler", state: "working", bad: 0 },
  "Jason-rat": { engine: "claude", role: "BE", desk: "smart-scheduler", state: "idle", bad: 0 },
  "Fern-rat": { engine: "claude", role: "FE", desk: "smart-scheduler", state: "working", bad: 0 },
  "Tanya-rat": { engine: "claude", role: "QA", desk: "smart-scheduler", state: "idle", bad: 0 },
  "Porter-cc": { engine: "claude", role: "PM", desk: "corner-chat", state: "idle", bad: 0 },
  "Sober-cc": { engine: "claude", role: "SA", desk: "corner-chat", state: "idle", bad: 0 },
  "Fanta-cc": { engine: "claude", role: "FE", desk: "corner-chat", state: "idle", bad: 0 },
  "Porter-isp": { engine: "claude", role: "PM", desk: "i-space", state: "idle", bad: 0 },
  "Sober-isp": { engine: "claude", role: "SA", desk: "i-space", state: "idle", bad: 0 },
  "Porter-dte": { engine: "claude", role: "PM", desk: "dte", state: "idle", bad: 0 },
  "Jason-dte": { engine: "claude", role: "BE", desk: "dte", state: "idle", bad: 0 },
  ISO: { engine: "deepseek", role: "verifier", desk: "workspace", state: "sleeping", bad: 1 },
  PokerVault: { engine: "deepseek", role: "access", desk: "workspace", state: "sleeping", bad: 0 },
};

const FEED = [
  { t: "18:29", x: "PM → SA", s: "ส่งบอลอัตโนมัติ — REQ-131" },
  { t: "18:31", x: "SA → BE", s: "แตก TASK-861" },
  { t: "18:33", x: "SA → PM", s: "ถามกลับ: Trail A/B?" },
  { t: "18:34", x: "Porter → ISO", s: "REQUEST build-593" },
];

const TIMELINE = [
  { t: "18:29", x: "PM → SA", s: "ส่งบอลอัตโนมัติ · ไม่ต้องมีคุณ", kind: "auto" },
  { t: "18:31", x: "SA → BE", s: "แตก TASK-861 แล้วส่งต่อ", kind: "auto" },
  { t: "18:33", x: "SA → PM", s: "ถามกลับ: Trail A หรือ B?", kind: "question" },
  { t: "18:34", x: "Porter → ISO", s: "เขียน REQUEST-iso-build-593.md", kind: "deepseek" },
  { t: "18:35", x: "ISO", s: "ตื่นตาม REQUEST · เริ่มตรวจ build 593", kind: "deepseek" },
  { t: "18:36", x: "PM", s: "อัปเดต: รอ QA รอบถัดไป", kind: "auto" },
];

function TopBar({ tab, setTab }) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-mark">▦</span>
        <span className="brand-name">Workforce</span>
        <span className="brand-ws">ai-agent-workspace</span>
      </div>

      <nav className="topnav">
        {[
          ["desks", "โต๊ะ"],
          ["seats", "Seats"],
          ["timeline", "ไทม์ไลน์"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={"tn" + (tab === k ? " on" : "")}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="topright">
        <div className="search">ค้นหา…</div>
        <span className="chainpill">chain: on</span>
        <span className="avatar">N</span>
      </div>
    </div>
  );
}

function Rail({ seat, setSeat }) {
  return (
    <aside className="rail">
      <div className="rail-title">โต๊ะทำงาน</div>
      {DESKS.map((d) => (
        <div key={d.name} className={"desk" + (SEATS[seat]?.desk === d.name ? " open" : "")}>
          <div className="desk-btn">
            <span className="desk-ico">▦</span>
            <span className="desk-label">{d.name}</span>
            <span className="desk-count">{d.seats.length}</span>
          </div>
          {SEATS[seat]?.desk === d.name &&
            d.seats.map((s) => {
              const sd = SEATS[s];
              return (
                <button
                  key={s}
                  className={"seat" + (seat === s ? " on" : "")}
                  onClick={() => setSeat(s)}
                >
                  <span className={"sd " + sd.state} />
                  <span className="seat-name">{s}</span>
                  <span className="seat-role">{sd.role}</span>
                  {sd.bad > 0 && <span className="bad">{sd.bad}</span>}
                </button>
              );
            })}
        </div>
      ))}

      <div className="rail-title ws">
        Workspace <span className="rail-badge">deepseek</span>
      </div>
      {["ISO", "PokerVault"].map((s) => {
        const sd = SEATS[s];
        return (
          <button
            key={s}
            className={"seat ws" + (seat === s ? " on" : "")}
            onClick={() => setSeat(s)}
          >
            <span className="moon">☾</span>
            <span className="seat-name">{s}</span>
            <span className="seat-role">{sd.role}</span>
            {sd.bad > 0 && <span className="bad deep">{sd.bad}</span>}
          </button>
        );
      })}
    </aside>
  );
}

function Chat({ seat, onSend }) {
  const [text, setText] = useState("");

  return (
    <div className="chatpane">
      <div className="chat-head">
        <div className="chat-id">
          <span className="chat-avatar">P</span>
          <div>
            <div className="chat-name">Porter-rat</div>
            <div className="chat-sub">PM · smart-scheduler · claude code</div>
          </div>
        </div>
        <div className="chat-right">
          <span className="chip-live">รอคุณ</span>
          <span className="chat-meta">session จริง</span>
        </div>
      </div>

      <div className="subnav">
        {["แชท", "ไฟล์", "ประวัติ"].map((t, i) => (
          <button key={t} className={"sn" + (i === 0 ? " on" : "")}>
            {t}
          </button>
        ))}
      </div>

      <div className="msgs">
        <div className="bubble user">ไปทำหน้า report ให้ข้อมูลถูกหน่อย — ตัวเลขไม่ตรง</div>

        <div className="bubble pm">
          รับเรื่องครับ — ผมเขียน <code>requirements/REQ-131.md</code> แล้วส่งให้ SA
        </div>

        <div className="sysline">
          <span className="auto-dot" /> PM → SA · ส่งบอลอัตโนมัติ (inbox/SA.md)
        </div>

        <div className="bubble pm">SA รับงานแล้ว กำลังแตก TASK — เดี๋ยวผมแจ้งเมื่อถึง QA</div>

        <div className="sysline">
          <span className="auto-dot" /> SA → BE · TASK-861
        </div>

        <div className="bubble pm">SA ถามกลับครับ: ใช้ Trail A หรือ B?</div>

        <div className="qcard">
          <div className="q-label">คำถามจาก SA — รอคุณตัดสิน</div>
          <div className="q-text">Trail A (เร็ว, แตะ 2 ไฟล์) หรือ Trail B (ช้า, แตะ 5 ไฟล์)?</div>
          <div className="q-opts">
            <span className="q-opt">A · เร็ว</span>
            <span className="q-opt">B · ปลอดภัย</span>
            <span className="q-hint">หรือพิมพ์ตอบเอง</span>
          </div>
        </div>
      </div>

      <div className="composer">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="พิมพ์ถึง Porter-rat… (Enter = ส่ง)"
        />
        <button
          onClick={() => {
            onSend?.();
            setText("");
          }}
        >
          ส่ง
        </button>
      </div>
    </div>
  );
}

function DeepSeekChat({ seat, onWake, awake }) {
  const isISO = seat === "ISO";
  return (
    <div className="chatpane">
      <div className="chat-head">
        <div className="chat-id">
          <span className="chat-avatar deep">☾</span>
          <div>
            <div className="chat-name">{seat}</div>
            <div className="chat-sub">
              {isISO ? "verifier · workspace" : "access · workspace"} · deepseek
            </div>
          </div>
        </div>
        <div className="chat-right">
          <span className="chip-live deep">{awake ? "ตื่นแล้ว" : "หลับ"}</span>
          <span className="chat-meta">wake by request</span>
        </div>
      </div>

      <div className="subnav">
        {["REQUEST", "ผลงาน", "ประวัติ"].map((t, i) => (
          <button key={t} className={"sn" + (i === 0 ? " on" : "")}>
            {t}
          </button>
        ))}
      </div>

      <div className="msgs">
        <div className="reqcard">
          <div className="req-top">
            <span className="req-tag">REQUEST</span>
            <span className="req-file">
              {isISO ? "REQUEST-iso-2026-11-09-build-593.md" : "REQUEST-pokervault-2026-11-09-som.md"}
            </span>
          </div>
          <div className="req-body">
            {isISO
              ? "ขอบเขตกว้าง build 593 · ตรวจ claim ที่ค้าง 4 รายการ แล้วลง ISO-LEDGER"
              : "ปลุก session ที่ค้าง 3 ตัว · ยืนยันสิทธิ์ก่อนสั่ง"}
          </div>
          <div className="req-foot">จาก Porter-rat · 18:34 · ยังไม่ถูกปลุก</div>
        </div>

        {awake && (
          <div className="bubble pm">
            ตื่นแล้วครับ — {isISO ? "กำลังตรวจ build 593 (เริ่มจาก F-061)" : "กำลังไล่ปลุก session ที่ค้าง"}
          </div>
        )}

        <div className="bubble ghost">
          ที่นี่ไม่มีแชทค้างไว้ — ปลุกด้วย REQUEST เท่านั้น ประหยัด session/claude
        </div>
      </div>

      <div className="composer">
        <input placeholder="เขียน REQUEST ใหม่…" />
        <button className="deep-btn" onClick={onWake}>
          {awake ? "ปลุกอีกครั้ง" : "ปลุก"}
        </button>
      </div>
    </div>
  );
}

function SeatsGrid({ setSeat, setTab }) {
  const list = Object.entries(SEATS);
  return (
    <div className="gridpane">
      <div className="grid-head">
        <h2>ทุก seat — ทั้ง claude และ deepseek</h2>
        <p>กดการ์ดเพื่อเปิดแชท · สถานะสดจาก session จริง</p>
      </div>
      <div className="seatgrid">
        {list.map(([name, s]) => (
          <button
            key={name}
            className={"scard " + s.engine}
            onClick={() => {
              setSeat(name);
              setTab("desks");
            }}
          >
            <div className="sc-top">
              <span className="sc-avatar">{s.engine === "deepseek" ? "☾" : name[0]}</span>
              <span className="sc-name">{name}</span>
              <span className={"sc-state " + s.state}>{s.state}</span>
            </div>
            <div className="sc-sub">
              {s.role} · {s.desk}
            </div>
            <div className="sc-foot">
              <span className={"sc-engine " + s.engine}>{s.engine}</span>
              {s.bad > 0 && <span className="bad">{s.bad} ค้าง</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Timeline() {
  return (
    <div className="gridpane">
      <div className="grid-head">
        <h2>ไทม์ไลน์ — ลูกวิ่งทั้ง claude และ deepseek</h2>
        <p>ทุกการส่งบอลอัตโนมัติ อยู่ที่เดียว ไม่ต้องไปถามใคร</p>
      </div>
      <div className="tl">
        {TIMELINE.map((e) => (
          <div className={"tlitem " + e.kind} key={e.t + e.x}>
            <span className="tl-time">{e.t}</span>
            <span className="tl-x">{e.x}</span>
            <span className="tl-s">{e.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Right({ seat }) {
  const deep = SEATS[seat]?.engine === "deepseek";
  return (
    <aside className="right">
      <div className="rcard">
        <div className="rc-label">ลูกอยู่ที่ใคร</div>
        <div className="rc-main">{deep ? "— (หลับ)" : "Sober-rat (SA)"}</div>
        <div className="rc-sub">
          {deep ? "ตื่นเมื่อมี REQUEST" : "กำลังแตก TASK จาก REQ-131"}
        </div>
        <div className="chain">
          {["PM", "SA", "BE", "FE", "QA"].map((n, i) => (
            <React.Fragment key={n}>
              {i > 0 && <span className="csep" />}
              <span className={"cstep" + (!deep && n === "SA" ? " on" : "")}>{n}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rcard">
        <div className="rc-label">ส่งบอลอัตโนมัติ</div>
        <div className="toggle">
          <span className="sw on" />
          <span className="tg-text">เปิด · chain ทำงานเอง</span>
        </div>
        <div className="rc-sub" style={{ marginTop: 8 }}>
          PM ส่งต่อ SA → BE → QA ตามกติกา desk โดยไม่ต้องรอคุณ
        </div>
      </div>

      <div className="rcard">
        <div className="rc-label">การส่งบอลล่าสุด</div>
        {FEED.map((f) => (
          <div className="feed" key={f.t + f.s}>
            <span className="feed-t">{f.t}</span>
            <span className="feed-x">{f.x}</span>
            <span className="feed-s">{f.s}</span>
          </div>
        ))}
      </div>

      <div className="rcard note">
        <div className="rc-label">เบื้องหลัง</div>
        <p>
          claude: <code>SendMessage</code> · deepseek: REQUEST + wake — ทั้งคู่เป็น session
          เดิม ไม่ใช่ agent ใหม่
        </p>
      </div>
    </aside>
  );
}

export default function App() {
  const [tab, setTab] = useState("desks");
  const [seat, setSeat] = useState("Porter-rat");
  const [awake, setAwake] = useState(false);
  const [sent, setSent] = useState(false);

  const isDeep = SEATS[seat]?.engine === "deepseek";

  useEffect(() => {
    const h = window.location.hash;
    if (h === "#seats") setTab("seats");
    else if (h === "#timeline") setTab("timeline");
    else if (h === "#iso") { setSeat("ISO"); setTab("desks"); }
  }, []);

  return (
    <div className="app">
      <div className="shell">
        <TopBar tab={tab} setTab={setTab} />
        <div className="body">
          <Rail seat={seat} setSeat={(s) => { setSeat(s); setTab("desks"); setAwake(false); }} />

          <main className="main">
            {tab === "seats" ? (
              <SeatsGrid
                setSeat={(s) => { setSeat(s); setAwake(false); }}
                setTab={setTab}
              />
            ) : tab === "timeline" ? (
              <Timeline />
            ) : isDeep ? (
              <DeepSeekChat seat={seat} awake={awake} onWake={() => setAwake(true)} />
            ) : (
              <Chat
                seat={seat}
                onSend={() => {
                  setSent(true);
                  setTimeout(() => setSent(false), 2000);
                }}
              />
            )}
          </main>

          <Right seat={seat} />
        </div>
      </div>

      {sent && <div className="toast">✓ ส่งเข้า session แล้ว</div>}

      <div className="legend">
        <span className="lg"><i className="lg-dot claude" /> claude session — แชทได้</span>
        <span className="lg"><i className="lg-dot deepseek" /> deepseek session — ปลุกด้วย REQUEST</span>
        <span className="lg"><i className="lg-dot auto" /> ส่งบอลอัตโนมัติ</span>
      </div>
    </div>
  );
}
