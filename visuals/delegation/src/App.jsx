import React, { useEffect, useState } from "react";

const HARD_BOUNDARIES = [
  "git ทุกคำสั่ง",
  "เงิน / ราคาที่กระทบลูกค้า",
  "เขียน DB ของลูกค้า",
  "เปลี่ยนสิทธิ์ · กฎ · บทบาท",
];

const WATCHDOG_JOBS = [
  "role idle + งานรอ > 15 นาที → นัดซ้ำ",
  "สิทธิ์เหลือ ≤ 1 หรือใกล้หมดอายุ → เตือนคุณครั้งเดียว",
  "คำถามค้างเกิน 30 นาที → ดันขึ้นหาคุณ",
];

const TIMELINE = [
  {
    t: "18:10",
    tag: "owner",
    text: "คุณสั่ง PM: “ให้สิทธิ์ตัดสิน 5 ครั้ง ไปเลยจนกว่าฉันกลับ”",
  },
  {
    t: "18:11",
    tag: "chain",
    text: "PM เขียน DELEGATION.md (scope: REQ-120) · เริ่มเดินงานให้ SA",
  },
  {
    t: "18:22",
    tag: "delegated",
    text: "SA ถาม: Trail A หรือ B? → PM ตัดสินแทน (1/5) + log ใน DECISIONS",
  },
  {
    t: "18:40",
    tag: "chain",
    text: "BE เสร็จ → SA review → นัด FE ต่อ — chain เดินเอง ไม่ต้องมีคุณ",
  },
  {
    t: "19:05",
    tag: "escalate",
    text: "คำถามนอก scope (เปลี่ยนราคาลูกค้า) → PM ไม่ตัดสิน → เข้าคิวรอคุณ",
  },
  {
    t: "19:30",
    tag: "watchdog",
    text: "watchdog เห็น FE idle + งานรอ 12 นาที → นัดซ้ำ",
  },
  {
    t: "20:00",
    tag: "owner",
    text: "ใช้ไป 2/5 · คุณกลับมา → ปิดสิทธิ์ + อ่าน log ว่าตัดสินอะไรไปบ้าง",
  },
];

function Meter({ used, max }) {
  return (
    <div className="meter" aria-label={`ใช้ไป ${used} จาก ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={"pip" + (i < used ? " on" : "")} />
      ))}
      <span className="meter-label">
        ใช้ไป <b>{used}</b>/{max}
      </span>
    </div>
  );
}

function Overview() {
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>ภาพรวม — ใครถืออะไร</h2>
          <p>
            คุณคุยกับ PM/ATLAS เท่านั้น · chain นัดกันเองเหมือนที่ทำอยู่ ·
            ที่เพิ่มมาคือ “ใบมอบอำนาจ” ที่นับได้ และ watchdog ที่กันงานตัน
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">DELEGATION.md</span>
          <span className="chip ghost">chain เดิม · ไม่แตะ</span>
        </div>
      </div>

      <div className="proposals">
        <div className="p"><b>①</b> ใบมอบอำนาจที่นับได้ — DELEGATION.md</div>
        <div className="p"><b>②</b> watchdog กันงานตัน</div>
        <div className="p"><b>③</b> chain เดิมไม่แตะ — แค่เพิ่มความจำ</div>
      </div>

      <div className="cards3">
        <div className="card you">
          <div className="card-top">
            <span className="avatar">N</span>
            <div>
              <div className="card-title">คุณ (owner)</div>
              <div className="card-sub">ไม่อยู่ · ธุระ</div>
            </div>
          </div>
          <div className="quote">
            “ให้สิทธิ์ตัดสิน 5 ครั้ง ไปเลยจนกว่าฉันจะกลับ”
          </div>
          <div className="card-foot">คุยกับ PM / ATLAS เท่านั้น</div>
        </div>

        <div className="card pm">
          <div className="card-top">
            <span className="avatar pm-a">P</span>
            <div>
              <div className="card-title">PM · ATLAS</div>
              <div className="card-sub">ผู้ถือสิทธิ์</div>
            </div>
            <span className="badge">active</span>
          </div>
          <Meter used={2} max={5} />
          <div className="scope">
            scope: REQ-120 — ลำดับ / แบ่งงาน / รับเข้า batch
          </div>
          <div className="expire">หมดอายุ: เมื่อคุณกลับ</div>
          <div className="card-foot">ตัดสินแทนได้เฉพาะใน scope</div>
        </div>

        <div className="card wd">
          <div className="card-top">
            <span className="avatar wd-a">W</span>
            <div>
              <div className="card-title">Watchdog</div>
              <div className="card-sub">ทุก 15 นาที</div>
            </div>
            <span className="badge dim">ไม่ทำงานแทน</span>
          </div>
          <ul className="jobs">
            {WATCHDOG_JOBS.map((j) => (
              <li key={j}>{j}</li>
            ))}
          </ul>
          <div className="card-foot">แค่กันตัน — ไม่ตัดสิน ไม่ทำงานแทนใคร</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">เมื่อมีคำถามเข้ามา</div>
        <div className="flow">
          <div className="fnode">
            <span className="fnum">1</span>
            <div>
              <b>PM เจอคำถาม</b>
              <p>“ใช้ Trail A หรือ B?” — จาก SA หรือ QA</p>
            </div>
          </div>
          <span className="farrow">→</span>
          <div className="fnode">
            <span className="fnum">2</span>
            <div>
              <b>เช็ก DELEGATION.md</b>
              <p>อยู่ใน scope ไหม · เหลือกี่ครั้ง · ยังไม่หมดอายุ</p>
            </div>
          </div>
          <span className="farrow">→</span>
          <div className="outcomes">
            <div className="outcome good">
              <b>อยู่ใน scope</b>
              <p>ตัดสิน + log + used+1 → งานเดินต่อ ไม่รบกวนคุณ</p>
            </div>
            <div className="outcome warn">
              <b>นอก scope / หมดสิทธิ์</b>
              <p>ไม่ตัดสิน → เข้าคิวรอคุณ · watchdog ดันขึ้นมาถ้าเงียบนาน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">chain ยังเดินเองแบบเดิม — ไฟล์ก่อน แล้วค่อยนัด</div>
        <div className="chain">
          {["คุณ", "PM", "SA", "BE · FE", "QA"].map((n, i) => (
            <React.Fragment key={n}>
              {i > 0 && <span className="cdash" />}
              <span className={"cnode" + (n === "PM" ? " hot" : "")}>{n}</span>
            </React.Fragment>
          ))}
          <span className="cdash back" />
          <span className="cnode ghost">กลับ PM</span>
        </div>
        <div className="chain-note">
          role นัดกันด้วย ListAgents / SendMessage · ไม่ต้องมีคุณคั่นกลาง
        </div>
      </div>

      <div className="boundaries">
        <div className="bound-title">สิ่งที่ไม่เคยถูกมอบ — แม้สิทธิ์ยังเหลือ</div>
        <div className="bound-row">
          {HARD_BOUNDARIES.map((b) => (
            <span key={b} className="bound">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Timeline() {
  const tone = {
    owner: "blue",
    chain: "dim",
    delegated: "green",
    escalate: "amber",
    watchdog: "dim",
  };
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>ไทม์ไลน์ — หนึ่งวันตอนคุณไม่อยู่</h2>
          <p>
            จากตอนที่คุณมอบสิทธิ์ จนถึงตอนคุณกลับ — งานเดินเอง 2 ครั้ง
            ตัดสินแทน 2 ครั้ง และมี 1 เรื่องที่รอคุณจริง ๆ
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">delegated ≠ abandoned</span>
        </div>
      </div>

      <div className="timeline">
        {TIMELINE.map((e) => (
          <div className={"tl-row tone-" + tone[e.tag]} key={e.t + e.text}>
            <span className="tl-time">{e.t}</span>
            <span className="tl-dot" />
            <div className="tl-body">
              <span className={"tl-tag " + e.tag}>{e.tag}</span>
              <div className="tl-text">{e.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-row">
        <div className="sum">
          <b>2</b>
          <span>ครั้งที่ PM ตัดสินแทน</span>
        </div>
        <div className="sum">
          <b>2</b>
          <span>ครั้งที่ chain เดินเอง</span>
        </div>
        <div className="sum">
          <b>1</b>
          <span>เรื่องที่รอคุณจริง ๆ</span>
        </div>
        <div className="sum">
          <b>0</b>
          <span>ครั้งที่คุณต้องไปกด session</span>
        </div>
      </div>

      <div className="note">
        ทั้งหมดนี้อยู่บนหลักเดิมของ workspace: ไฟล์คือความจริง · นัดเป็นแค่กริ่ง ·
        คุณมอบสิทธิ์ได้เฉพาะเมื่อสั่งเป็นลายลักษณ์อักษร
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#t" ? "T" : "O"
  );

  useEffect(() => {
    const onHash = () => setTab(window.location.hash === "#t" ? "T" : "O");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function pick(t) {
    setTab(t);
    history.replaceState(null, "", t === "T" ? "#t" : "#o");
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="crumb">ai-agent-workspace · แนวทางที่เสนอ</div>
        <h1>
          คุณไม่ได้เป็นคนส่งงาน — คุณเป็นคน<span className="hl">ให้สิทธิ์</span>
        </h1>
        <p className="hero-sub">
          chain เดินเองอยู่แล้ว · สิ่งที่ขาดคือ “ใบมอบอำนาจ” ที่นับได้ หมดอายุได้
          และคนกันงานตัน — ไม่ใช่มีคนคอยกดแทนคุณ
        </p>

        <div className="tabs">
          <button className={"tab" + (tab === "O" ? " on" : "")} onClick={() => pick("O")}>
            <span className="tab-k">1</span> ภาพรวม
            <small>ใครถืออะไร</small>
          </button>
          <button className={"tab" + (tab === "T" ? " on" : "")} onClick={() => pick("T")}>
            <span className="tab-k">2</span> ไทม์ไลน์
            <small>ตอนคุณไม่อยู่</small>
          </button>
        </div>
      </header>

      <main>{tab === "O" ? <Overview /> : <Timeline />}</main>

      <div className="foot-note">
        การเพิ่ม DELEGATION.md เข้า desk เป็นการแก้กฎของ workforce — ควรสั่งผ่าน Atlas/Marie ·
        ผมเขียน prototype ให้ดูก่อนได้
      </div>
    </div>
  );
}
