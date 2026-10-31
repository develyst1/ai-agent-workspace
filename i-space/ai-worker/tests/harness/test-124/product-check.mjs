// TEST-122 (REQ-124) AC-1 — the product the team built, checked against its 7 points BY HAND through its page (as the owner would), on :3920.
// usage: bun product-check.mjs <front dir for playwright> a   — add / list / totals / delete / validation (points 1–4, 6, 7)
//        bun product-check.mjs <front dir> b                   — after QA restarted the server: the entries are still there (point 5)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front, phase] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const note = (c, ok, d) => log(`${ok ? 'WORKS' : 'DOES NOT'} ${c} — ${d}`);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.setDefaultTimeout(15000);
const dialogs = []; p.on('dialog', async (d) => { dialogs.push(`${d.type()}: ${d.message()}`); if (p.__dismissNext) { p.__dismissNext = false; await d.dismiss(); } else await d.accept(); });
await p.goto('http://127.0.0.1:3920/', { waitUntil: 'networkidle' });
const body = () => p.innerText('body');
const add = async (amount, cat, noteText) => { await p.fill('#amount', amount); await p.selectOption('#category', { label: cat }); await p.fill('#note', noteText); await p.click('#save-btn'); await p.waitForTimeout(900); };
const listText = async () => { const t = await body(); return t.slice(t.indexOf('รายการวันนี้')); };
try {
  if (phase === 'a') {
    await add('120', 'อาหาร', 'ข้าวมันไก่'); await add('45', 'เดินทาง', 'รถเมล์'); await add('89.50', 'ของใช้', 'สบู่');
    await p.screenshot({ path: 'out/product-3-added.png', fullPage: true });
    const list = await listText(); fs.writeFileSync('out/product-list.txt', list);
    note('1. ใส่รายจ่ายได้ (จำนวนเงิน หมวด หมายเหตุ ปุ่ม "บันทึก")', ['ข้าวมันไก่', 'รถเมล์', 'สบู่'].every((x) => list.includes(x)), JSON.stringify(list.slice(0, 300)));
    const iS = list.indexOf('สบู่'), iR = list.indexOf('รถเมล์'), iK = list.indexOf('ข้าวมันไก่');
    note('2. รายการของวันนี้ ล่าสุดอยู่บนสุด พร้อมเวลา', iS > -1 && iS < iR && iR < iK && /\d{1,2}[:.]\d{2}/.test(list), `order สบู่ ${iS} < รถเมล์ ${iR} < ข้าวมันไก่ ${iK}; time ${(/\d{1,2}[:.]\d{2}/.exec(list) ?? ['none'])[0]}`);
    const t = await body(); const sum = t.slice(t.indexOf('ยอดรวมวันนี้'), t.indexOf('รายการวันนี้')).replace(/\n+/g, ' ');
    note('3. ยอดรวมของวันนี้ และแยกตามหมวด', /รวมทั้งหมด\s*254\.50/.test(sum) && /อาหาร\s*120\.00/.test(sum) && /เดินทาง\s*45\.00/.test(sum) && /ของใช้\s*89\.50/.test(sum) && /อื่นๆ\s*0\.00/.test(sum), JSON.stringify(sum));
    // 4 — delete: first DISMISS the confirm (must stay), then accept (must go)
    const delBtns = p.getByRole('button', { name: /ลบ/ }); const nDel = await delBtns.count();
    p.__dismissNext = true; await delBtns.first().click(); await p.waitForTimeout(800); const afterCancel = await listText();
    const confirmSeen = dialogs.length > 0 || (await p.getByRole('dialog').count()) > 0 || /ยืนยัน|แน่ใจ/.test(await body());
    // a page-made confirm (not window.confirm): press its cancel/OK
    if (dialogs.length === 0 && (await p.getByRole('button', { name: /ยกเลิก/ }).count())) { await p.getByRole('button', { name: /ยกเลิก/ }).first().click(); await p.waitForTimeout(500); }
    const stayed = (await listText()).includes('สบู่');
    await delBtns.first().click(); await p.waitForTimeout(500);
    if (dialogs.length === 0 && (await p.getByRole('button', { name: /^(ลบ|ยืนยัน|ตกลง)$/ }).count()) > nDel) await p.getByRole('button', { name: /^(ยืนยัน|ตกลง|ลบ)$/ }).last().click();
    await p.waitForTimeout(900); const afterDel = await listText();
    await p.screenshot({ path: 'out/product-after-delete.png', fullPage: true });
    note('4. ลบรายการได้ โดยถามยืนยันก่อนลบ', nDel === 3 && confirmSeen && stayed && !afterDel.includes('สบู่') && afterDel.includes('รถเมล์'), `delete buttons ${nDel} · confirm ${JSON.stringify(dialogs)} · cancelled → still there ${stayed} · confirmed → gone ${!afterDel.includes('สบู่')}`);
    // 6 — bad amounts
    const res6 = [];
    for (const bad of ['0', '-5', 'abc', '']) { const before = await listText(); await add(bad, 'อื่นๆ', `ผิด ${bad || 'ว่าง'}`); const after = await body(); const msg = (after.match(/[^\n]*(ต้อง|กรุณา|ไม่ถูก|มากกว่า)[^\n]*/) ?? [''])[0]; res6.push({ bad, saved: (await listText()).includes(`ผิด ${bad || 'ว่าง'}`), msg }); }
    await p.screenshot({ path: 'out/product-bad-amount.png', fullPage: true });
    note('6. จำนวนเงินต้องมากกว่า 0 — ใส่ผิดขึ้นข้อความภาษาไทยและไม่บันทึก', res6.every((r) => !r.saved && /[฀-๿]/.test(r.msg)), JSON.stringify(res6));
    // 7 — :3920, no login, Thai only (any English word on the page?)
    const words = ((await body()).match(/[A-Za-z]{2,}/g) ?? []);
    note('7. รันที่ :3920 ไม่ต้อง login ข้อความบนหน้าเป็นภาษาไทยทั้งหมด', p.url().startsWith('http://127.0.0.1:3920') && !/login|เข้าสู่ระบบ/i.test(await body()) && words.length === 0, `url ${p.url()} · English words on the page: ${JSON.stringify(words)}`);
    fs.writeFileSync('out/product-before-restart.txt', await listText());
  } else {
    const before = fs.readFileSync('out/product-before-restart.txt', 'utf8'); const now = await listText();
    await p.screenshot({ path: 'out/product-after-restart.png', fullPage: true });
    note('5. ข้อมูลอยู่ในไฟล์ JSON — ปิดแล้วเปิด server ใหม่ ข้อมูลยังอยู่ครบ', ['ข้าวมันไก่', 'รถเมล์'].every((x) => now.includes(x)) && !now.includes('สบู่'), `before ${JSON.stringify(before.slice(0, 160))} · after ${JSON.stringify(now.slice(0, 160))}`);
  }
} finally { await b.close(); }
