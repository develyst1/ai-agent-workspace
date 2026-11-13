import React, { useEffect, useState } from "react";

const ACTIONS = [
  {
    n: "01",
    tone: "amber",
    title: "สั่งงาน / เปลี่ยนทิศ",
    say: "“ทำหน้าสรุปยอดขายให้หน่อย”",
    mech: "requirements/REQ-xxx.md",
    who: "PM เขียน REQ · SA รับช่วงไปทำ SPEC/TASK",
  },
  {
    n: "02",
    tone: "blue",
    title: "ตอบคำถาม / ตัดสิน",
    say: "“ใช้ Trail A — เหตุผลคือ… ”",
    mech: "คำตอบถูกเขียนลง REQ / DECISIONS",
    who: "PM รวบคำถามขึ้นมา · คุณตอบครั้งเดียว",
  },
  {
    n: "03",
    tone: "red",
    title: "อนุมัติ",
    say: "“ขึ้น git ได้” · “ราคานี้โอเค”",
    mech: "checkpoint — git · เงิน · deploy",
    who: "SA ลงมือหลังได้คำสั่ง · ไม่มีใครอนุมัติแทน",
  },
  {
    n: "04",
    tone: "green",
    title: "มอบอำนาจชั่วคราว",
    say: "“ตัดสินแทนได้ 5 ครั้ง ไปจนกว่าฉันกลับ”",
    mech: "DELEGATION.md · scope · used/max · expires",
    who: "PM ตัดสินแทนได้ · log ทุกครั้ง",
  },
  {
    n: "05",
    tone: "purple",
    title: "ให้ / ถอนสิทธิ์",
    say: "“อ่าน uat ได้” · “ปิดสิทธิ์นั้น”",
    mech: "permission mode · read-only role · tools",
    who: "มีผลกับ session นั้นทันที",
  },
  {
    n: "06",
    tone: "red",
    title: "สั่งหยุด / แก้ / ยกเลิก",
    say: "“พอแล้ว” · “ทำใหม่” · “เลิกอันนี้”",
    mech: "stop · งานกลับเข้า board",
    who: "PM/SA หยุดตามคำสั่ง · ไม่ใช่เงียบ ๆ",
  },
  {
    n: "07",
    tone: "amber",
    title: "จัดลำดับ / เดดไลน์",
    say: "“อันนี้ก่อน ภายในศุกร์”",
    mech: "priority + deadline ใน board",
    who: "PM จัดคิวใหม่ทั้ง desk",
  },
];

const DAY = [
  {
    t: "09:02",
    tag: "สั่งงาน",
    tone: "amber",
    text: "“ทำหน้าสรุปยอดขาย” → PM เขียน REQ-131 → SA แตก TASK",
  },
  {
    t: "09:40",
    tag: "ให้สิทธิ์",
    tone: "purple",
    text: "“อ่าน uat ได้” → SA ได้สิทธิ์ select read-only (ไม่เขียน)",
  },
  {
    t: "10:15",
    tag: "อนุมัติ",
    tone: "red",
    text: "“ขึ้น git ได้” → SA commit ตามคำสั่ง · ไม่มีใครเดาเอง",
  },
  {
    t: "11:00",
    tag: "ตอบคำถาม",
    tone: "blue",
    text: "SA ถาม: Trail A หรือ B? → คุณตอบ A → PM บันทึกใน DECISIONS",
  },
  {
    t: "12:00",
    tag: "มอบอำนาจ",
    tone: "green",
    text: "“ตัดสินแทน 5 ครั้ง ไปจนกว่ากลับ” → DELEGATION.md เริ่มนับ",
  },
  {
    t: "14:20",
    tag: "ตัดสินแทน",
    tone: "green",
    text: "PM ใช้สิทธิ์ครั้งที่ 1: เลือกชื่อคอลัมน์ → log · งานเดินต่อ",
  },
  {
    t: "16:30",
    tag: "สั่งหยุด",
    tone: "red",
    text: "“พอแล้ว อันนี้พักไว้” → PM park งานกลับ board · ไม่ลบงาน",
  },
  {
    t: "18:05",
    tag: "กลับมา",
    tone: "blue",
    text: "ปิดสิทธิ์ · อ่าน log: ใช้ไป 1/5 · มี 1 เรื่องรอคุณตัดสิน",
  },
];

function Overview() {
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>บทบาทของคุณ — 7 อย่าง ไม่ใช่แค่ให้สิทธิ์</h2>
          <p>
            ทุกอย่างที่คุณทำกับ workforce ไหลเข้า “ไฟล์” เสมอ ไม่ใช่แชทที่หายไป —
            แต่ละอย่างมีกลไกของมันเอง และมีสิ่งที่มอบแทนไม่ได้
          </p>
        </div>
        <div className="chip-row">
          <span className="chip">owner lane</span>
          <span className="chip ghost">files are the channel</span>
        </div>
      </div>

      <div className="grid7">
        {ACTIONS.map((a) => (
          <div className={"act tone-" + a.tone} key={a.n}>
            <div className="act-top">
              <span className="act-n">{a.n}</span>
              <span className="act-title">{a.title}</span>
            </div>
            <div className="act-say">{a.say}</div>
            <div className="act-mech">
              <span className="lab">→ กลายเป็น</span>
              <code>{a.mech}</code>
            </div>
            <div className="act-who">{a.who}</div>
          </div>
        ))}

        <div className="act note">
          <div className="act-top">
            <span className="act-n">∞</span>
            <span className="act-title">ทั้งหมดนี้ลงเอยที่ไฟล์เดียว</span>
          </div>
          <p>
            REQ · DECISIONS · DELEGATION · board · log — ไม่มีอะไรอยู่ในหัวใคร
            และไม่มีอะไรอยู่ในแชทอย่างเดียว
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-title">ทุกคำสั่งไหลเข้าที่เดียวกัน</div>
        <div className="lane">
          <div className="lane-box you">คุณ</div>
          <span className="lane-arrow">→</span>
          <div className="lane-box pm">PM · ATLAS</div>
          <span className="lane-arrow">→</span>
          <div className="lane-box chain">SA → BE · FE → QA</div>
          <span className="lane-arrow back">↩</span>
          <div className="lane-note">
            ถามกลับ · อนุมัติ · รายงาน — กลับมาที่จุดเดียว
          </div>
        </div>
      </div>

      <div className="boundaries">
        <div className="bound-title">สิ่งที่คุณยังต้องทำเอง — มอบแทนไม่ได้</div>
        <div className="bound-row">
          <span className="bound">อนุมัติ git</span>
          <span className="bound">เงิน / ราคาลูกค้า</span>
          <span className="bound">เขียน DB ลูกค้า</span>
          <span className="bound">เปลี่ยนกฎ / บทบาท</span>
        </div>
      </div>
    </div>
  );
}

function Day() {
  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h2>หนึ่งวัน — คุณทำครบทุกแบบ</h2>
          <p>
            สั่งงาน ให้สิทธิ์ อนุมัติ ตอบ มอบอำนาจ สั่งหยุด — ทั้งหมดนี้คือ “owner lane”
            ที่ระบบต้องรับได้ ไม่ใช่แค่ delegation อย่างเดียว
          </p>
        </div>
        <div className="chip-row">
          <span className="chip ghost">1 day · 8 actions</span>
        </div>
      </div>

      <div className="timeline">
        {DAY.map((e) => (
          <div className={"tl-row tone-" + e.tone} key={e.t + e.text}>
            <span className="tl-time">{e.t}</span>
            <span className="tl-dot" />
            <div className="tl-body">
              <span className={"tl-tag tone-" + e.tone}>{e.tag}</span>
              <div className="tl-text">{e.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-row">
        <div className="sum">
          <b>7</b>
          <span>แบบที่คุณสั่งได้</span>
        </div>
        <div className="sum">
          <b>8</b>
          <span>ครั้งที่คุณแตะระบบใน 1 วัน</span>
        </div>
        <div className="sum">
          <b>0</b>
          <span>ครั้งที่ต้องไปกด session</span>
        </div>
        <div className="sum">
          <b>1</b>
          <span>เรื่องที่รอคุณจริง ๆ</span>
        </div>
      </div>

      <div className="note">
        จุดร่วมของทุก action: คุณไม่ต้องจำ — ระบบอ่านจากไฟล์ แล้วรายงานกลับที่ PM/ATLAS
        จุดเดียว
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#d" ? "D" : "O"
  );

  useEffect(() => {
    const onHash = () => setTab(window.location.hash === "#d" ? "D" : "O");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function pick(t) {
    setTab(t);
    history.replaceState(null, "", t === "D" ? "#d" : "#o");
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="crumb">ai-agent-workspace · owner lane</div>
        <h1>
          คุณไม่ได้สั่งอย่างเดียว — คุณ<span className="hl">สั่งได้ 7 แบบ</span>
        </h1>
        <p className="hero-sub">
          สั่งงาน · ตอบ · อนุมัติ · มอบอำนาจ · ให้สิทธิ์ · สั่งหยุด · จัดลำดับ —
          แต่ละแบบมีกลไกของมัน และไม่มีแบบไหนที่หายไปในแชท
        </p>

        <div className="tabs">
          <button className={"tab" + (tab === "O" ? " on" : "")} onClick={() => pick("O")}>
            <span className="tab-k">1</span> 7 บทบาท
            <small>สั่งอะไรได้บ้าง</small>
          </button>
          <button className={"tab" + (tab === "D" ? " on" : "")} onClick={() => pick("D")}>
            <span className="tab-k">2</span> หนึ่งวัน
            <small>ใช้จริงพร้อมกัน</small>
          </button>
        </div>
      </header>

      <main>{tab === "O" ? <Overview /> : <Day />}</main>

      <div className="foot-note">
        ระบบนี้ยึดหลักเดิม: ไฟล์คือความจริง · PM/ATLAS เป็นประตูเดียว · chain ของ desk ไม่เปลี่ยน
      </div>
    </div>
  );
}
