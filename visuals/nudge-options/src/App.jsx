import React, { useEffect, useMemo, useState } from "react";

/* ───────────────────────── ข้อมูลจำลอง ───────────────────────── */

const NEEDS = [
  {
    name: "Porter-rat",
    q: "โอน TASK-861 ให้ Silver ไหม? Jason ยังไม่เริ่ม",
    age: "2m",
  },
];

const WORKING = [
  { name: "Sober-rat", doing: "รีวิว SPEC-097 §4 — salary block", age: "8m" },
  { name: "Jason-rat", doing: "TASK-861 · bonus-rules.ts", age: "12m" },
];

const IDLE = [
  { name: "Marie", note: "ว่าง — ไม่มี ORDER ค้าง", age: "—" },
  { name: "Fern-rat", note: "ว่าง — ไม่มี TASK", age: "—" },
  { name: "Tanya-rat", note: "ว่าง — ไม่มี TASK", age: "—" },
  { name: "ATLAS", note: "ว่าง — ไม่มี FAIL ใหม่", age: "—" },
];

const CONDUCTOR_ROWS = [
  {
    role: "Porter-rat",
    desk: "smart-scheduler",
    state: "idle",
    why: "REQ-120 รอใน inbox/SA.md",
    act: "นัดแล้ว",
    tone: "good",
  },
  {
    role: "Sober-rat",
    desk: "smart-scheduler",
    state: "working",
    why: "กำลังรีวิว SPEC-097",
    act: "ข้าม",
    tone: "dim",
  },
  {
    role: "Marie",
    desk: "corner-chat",
    state: "idle",
    why: "gate FAIL · 16 unreviewed",
    act: "route + นัด",
    tone: "warn",
  },
  {
    role: "Tanya-rat",
    desk: "smart-scheduler",
    state: "idle",
    why: "ไม่มีงานค้าง",
    act: "ข้าม",
    tone: "dim",
  },
  {
    role: "ATLAS",
    desk: "workspace",
    state: "idle",
    why: "ไม่มี FAIL ใหม่",
    act: "ข้าม",
    tone: "dim",
  },
];

const CONDUCTOR_STEPS = [
  "อ่าน claude agents --json — ใคร idle / working / blocked",
  "อ่าน board · inbox · check-hygiene --json",
  "ใครควรได้ลูก? — เทียบกับ chain ของ desk",
  "SendMessage นัด — ไฟล์มาก่อนเสมอ",
  "log 1 บรรทัด — นัดใคร เพราะอะไร",
];

/* ───────────────────────── ชิ้นส่วนร่วม ───────────────────────── */

function Callout({ n, title, children }) {
  return (
    <div className="callout">
      <span className="callout-n">{n}</span>
      <div>
        <div className="callout-title">{title}</div>
        <div className="callout-body">{children}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── ทาง A ───────────────────────── */

function ViewA() {
  const [sel, setSel] = useState("Porter-rat");
  const [reply, setReply] = useState("ไปต่อ — REQ-120 อยู่ใน inbox/SA.md");
  const [sent, setSent] = useState(false);

  const selected = useMemo(() => {
    const all = [
      ...NEEDS.map((x) => ({ ...x, group: "needs" })),
      ...WORKING.map((x) => ({ ...x, group: "working" })),
      ...IDLE.map((x) => ({ ...x, group: "idle" })),
    ];
    return all.find((x) => x.name === sel) || all[0];
  }, [sel]);

  function send() {
    setSent(true);
    setTimeout(() => setSent(false), 2600);
  }

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>A · Agent View — คุณเป็นคนส่งลูก</h2>
          <p>
            เปิด role ทุกตัวเป็น background session แล้วดูทุกอย่างจากจอเดียว
            กด reply สั้น ๆ = สะกิด, กด Enter = เข้าไปคุยเต็ม
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">claude agents</span>
          <span className="chip ghost">background sessions</span>
        </div>
      </div>

      <div className="agent-window">
        <div className="win-bar">
          <span className="dot red" />
          <span className="dot amber" />
          <span className="dot green" />
          <span className="win-title">claude agents</span>
          <span className="win-hint">← for agents</span>
        </div>

        <div className="win-summary">
          <b>1</b> awaiting input · <b>2</b> working · <b>4</b> idle
        </div>

        <div className="group">
          <div className="group-label">Needs input</div>
          {NEEDS.map((a) => (
            <button
              key={a.name}
              className={"agent-row sel-" + (sel === a.name)}
              onClick={() => setSel(a.name)}
            >
              <span className="state-dot amber pulse" />
              <span className="agent-name">{a.name}</span>
              <span className="agent-what">รอคำตอบ: {a.q}</span>
              <span className="agent-age">{a.age}</span>
            </button>
          ))}
        </div>

        <div className="group">
          <div className="group-label">Working</div>
          {WORKING.map((a) => (
            <button
              key={a.name}
              className={"agent-row sel-" + (sel === a.name)}
              onClick={() => setSel(a.name)}
            >
              <span className="state-dot green spin" />
              <span className="agent-name">{a.name}</span>
              <span className="agent-what">{a.doing}</span>
              <span className="agent-age">{a.age}</span>
            </button>
          ))}
        </div>

        <div className="group">
          <div className="group-label">Idle</div>
          {IDLE.map((a) => (
            <button
              key={a.name}
              className={"agent-row sel-" + (sel === a.name)}
              onClick={() => setSel(a.name)}
            >
              <span className="state-dot dim" />
              <span className="agent-name">{a.name}</span>
              <span className="agent-what">{a.note}</span>
              <span className="agent-age">{a.age}</span>
            </button>
          ))}
        </div>

        <div className="peek">
          <div className="peek-label">
            peek · {selected.name}
            {selected.group === "needs" ? " — คำถามที่รอคุณ" : ""}
          </div>
          {selected.group === "needs" ? (
            <>
              <div className="peek-q">“{selected.q}”</div>
              <div className="peek-reply">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="พิมพ์ reply สั้น ๆ แล้วกด Enter…"
                />
                <button onClick={send}>ส่งนัด</button>
              </div>
              <div className="peek-foot">
                reply = ส่งเป็นข้อความเข้า session · Enter = attach เข้าไปเต็ม
              </div>
            </>
          ) : (
            <div className="peek-foot">
              session นี้ไม่รออะไร — กด Enter เพื่อ attach ดู transcript
            </div>
          )}
        </div>

        {sent && <div className="toast">✓ นัดแล้ว · Porter-rat — delivered ≠ read</div>}
      </div>

      <div className="callouts">
        <Callout n="1" title="จอเดียว เห็นทุกคน">
          ไม่ต้องสลับ 8 หน้าต่าง — ใครว่าง ใครทำงาน ใครรอคำถาม อยู่ที่เดียว
        </Callout>
        <Callout n="2" title="reply = นัด, Enter = attach">
          พิมพ์สั้น ๆ กลับเข้า session ได้เลย ไม่ต้องเปิดหน้าต่างนั้น
        </Callout>
        <Callout n="3" title="ข้อจำกัด: ต้องมีคนกด">
          ระบบไม่รู้เองว่าใครควรได้ลูก — ถ้าคุณไม่เปิดจอนี้ งานก็ยังค้าง
        </Callout>
      </div>
    </div>
  );
}

/* ───────────────────────── ทาง B ───────────────────────── */

function ViewB() {
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>B · Conductor — ระบบส่งลูกเอง</h2>
          <p>
            session เดียวรัน /loop ทุก 15 นาที ทำหน้าที่เป็น "คนส่งลูก"
            ตรวจว่าใครควรได้งาน แล้วนัดให้ — คุณดูแค่ตอนที่มีเรื่องต้องตัดสิน
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">/loop 15m</span>
          <span className="chip ghost">SendMessage</span>
        </div>
      </div>

      <div className="conductor-grid">
        <div className="conductor-card">
          <div className="conductor-top">
            <div className="orb-wrap">
              <div className="orb-ring" />
              <div className="orb">C</div>
            </div>
            <div>
              <div className="conductor-title">conductor</div>
              <div className="conductor-sub">background session · loop 15m</div>
            </div>
            <div className="tick">
              รอบถัดไป
              <b>03:12</b>
            </div>
          </div>

          <div className="steps">
            {CONDUCTOR_STEPS.map((s, i) => (
              <div key={i} className={"step" + (i === 3 ? " active" : i < 3 ? " done" : "")}>
                <span className="step-dot">{i < 3 ? "✓" : i === 3 ? "•" : ""}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="seen-card">
          <div className="seen-title">สิ่งที่มันเห็นในรอบนี้</div>
          {CONDUCTOR_ROWS.map((r) => (
            <div key={r.role} className={"seen-row tone-" + r.tone}>
              <span className="seen-role">{r.role}</span>
              <span className="seen-desk">{r.desk}</span>
              <span className="seen-state">
                <i className={"st " + r.state} />
                {r.state}
              </span>
              <span className="seen-why">{r.why}</span>
              <span className="seen-act">{r.act}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="log-card">
        <div className="log-title">conductor.log</div>
        <div className="log-line"><span>17:45</span> tick — claude agents --json → 11 sessions</div>
        <div className="log-line"><span>17:45</span> Porter-rat idle + REQ-120 waiting → SendMessage นัด</div>
        <div className="log-line"><span>17:46</span> corner-chat FAIL → เขียน inbox/Marie.md + นัด Marie</div>
        <div className="log-line"><span>17:52</span> Sober-rat working → ข้าม</div>
        <div className="log-line next"><span>18:00</span> tick ถัดไป…</div>
      </div>

      <div className="callouts">
        <Callout n="1" title="ไม่มีใครต้องจำ">
          ไม่ต้องหวังให้แต่ละ session จำนัด — conductor ตรวจให้ทุก 15 นาที
          แล้วส่งนัดเฉพาะคนที่ควรได้ลูก
        </Callout>
        <Callout n="2" title="ไฟล์ยังเป็นความจริง">
          conductor แค่นัด ไม่ทำงานแทน — งานยังอยู่ใน inbox/REQ/TASK เหมือนเดิม
        </Callout>
        <Callout n="3" title="ต้นทุนที่ต้องยอมรับ">
          กิน usage ทุก tick (เป็น Claude subscription ไม่ใช่ DeepSeek)
          และต้องมี guardrail กันนัดซ้ำ/วนลูป
        </Callout>
      </div>
    </div>
  );
}

/* ───────────────────────── App ───────────────────────── */

export default function App() {
  const [tab, setTab] = useState(
    () => (typeof window !== "undefined" && window.location.hash === "#b" ? "B" : "A")
  );

  useEffect(() => {
    const onHash = () =>
      setTab(window.location.hash === "#b" ? "B" : "A");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function pick(t) {
    setTab(t);
    history.replaceState(null, "", t === "B" ? "#b" : "#a");
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="crumb">ai-agent-workspace · ทางเลือกการสะกิด session</div>
        <h1>
          สองทาง — จะให้<span className="hl">ใครส่งลูก</span>?
        </h1>
        <p className="hero-sub">
          ปัญหาเดียวกัน: งานค้างใน inbox แต่ไม่มีใครไปสะกิดต่อ — ต่างกันที่ว่า
          <b> คุณ </b>เป็นคนกด หรือ <b>ระบบ</b> ทำให้
        </p>

        <div className="tabs">
          <button className={"tab" + (tab === "A" ? " on" : "")} onClick={() => pick("A")}>
            <span className="tab-k">A</span> Agent View
            <small>คุณกดเอง</small>
          </button>
          <button className={"tab" + (tab === "B" ? " on" : "")} onClick={() => pick("B")}>
            <span className="tab-k">B</span> Conductor
            <small>ระบบนัดให้</small>
          </button>
        </div>
      </header>

      <main>{tab === "A" ? <ViewA /> : <ViewB />}</main>

      <footer className="compare">
        <div className="cmp">
          <h3>ถ้าเลือก A</h3>
          <ul>
            <li className="pro">เห็นทุก session ในจอเดียว</li>
            <li className="pro">นัดได้ทันที ไม่ต้องสลับหน้าต่าง</li>
            <li className="pro">ต้นทุนต่ำ — ไม่มี loop วิ่ง</li>
            <li className="con">ต้องมีคนเปิดจอและกดเอง</li>
            <li className="con">ไม่มีใครตรวจแทนคุณ</li>
          </ul>
        </div>
        <div className="cmp">
          <h3>ถ้าเลือก B</h3>
          <ul>
            <li className="pro">อัตโนมัติทุก 15 นาที</li>
            <li className="pro">วินัย chain อยู่ที่เดียว</li>
            <li className="pro">ปิดรู “ลืมนัด” ที่เจออยู่บ่อย</li>
            <li className="con">เปลือง usage เล็กน้อยทุก tick</li>
            <li className="con">ต้องมี guardrail กันวน</li>
          </ul>
        </div>
      </footer>

      <div className="foot-note">
        dispatcher ถูกตัดออก — subagent ช้าและคุณไม่ชอบ ·
        ของจริงใน CLI 2.1.308: <code>claude agents --json</code> ·{" "}
        <code>ListAgents</code>/<code>SendMessage</code> · <code>/loop</code>
      </div>
    </div>
  );
}
