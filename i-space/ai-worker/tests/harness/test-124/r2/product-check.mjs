// TEST-122 round 2 (REQ-124 r2) AC-1 — "สมุดยืม-คืนหนังสือในออฟฟิศ", checked against its 8 points BY HAND through its page on :3930 (as the owner would).
// usage: bun product-check.mjs <front dir for playwright> a   — points 1–5, 7, 8   ·   b — after QA restarted the server: point 6
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [front, phase] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const note = (c, ok, d) => log(`${ok ? 'WORKS' : 'DOES NOT'} ${c} — ${d}`);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.setDefaultTimeout(15000);
const dialogs = []; let dismiss = false; p.on('dialog', async (d) => { dialogs.push(`${d.type()}: ${d.message()}`); if (dismiss) { dismiss = false; await d.dismiss(); } else await d.accept(); });
await p.goto('http://127.0.0.1:3930/', { waitUntil: 'networkidle' });
const body = () => p.innerText('body');
const addBook = async (title, author) => { await p.fill('#add-title', title); await p.fill('#add-author', author); await p.getByRole('button', { name: 'เพิ่มหนังสือ' }).click(); await p.waitForTimeout(900); };
// the page's rows are `.book` (QA read the markup first); titles below are new each run, so a row is one book
const rowOf = async (title) => { const all = await p.locator('.book').allInnerTexts(); return all.find((t) => t.includes(title)) ?? ''; };
const inRow = (title) => p.locator('.book').filter({ hasText: title }).first();
const borrow = async (title, name) => { await inRow(title).getByRole('button', { name: 'ยืม' }).click(); await p.waitForTimeout(400); await p.getByPlaceholder('ชื่อคนยืม').fill(name); await p.getByRole('button', { name: 'ยืนยันการยืม' }).click(); await p.waitForTimeout(900); };
try {
  if (phase === 'a') {
    await addBook('ทำงานอย่างมืออาชีพ ฉบับสาม', 'สมชาย ใจดี'); await addBook('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม', 'สุดา รักเรียน'); await addBook('การจัดการเวลา ฉบับสาม', '');
    await p.screenshot({ path: 'out/product-3-added.png', fullPage: true });
    const t1 = await body();
    note('1. เพิ่มหนังสือได้ (ชื่อหนังสือ ผู้แต่ง ปุ่ม "เพิ่มหนังสือ")', ['ทำงานอย่างมืออาชีพ ฉบับสาม', 'เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม', 'การจัดการเวลา ฉบับสาม'].every((x) => t1.includes(x)) && t1.includes('สมชาย ใจดี'), JSON.stringify(t1.slice(0, 260)));
    // 3 — borrow the first; the borrower box empty first (point 7), then a name
    // point 7, the borrower half: "ยืม" → leave "ชื่อคนยืม" empty → "ยืนยันการยืม"
    await inRow('ทำงานอย่างมืออาชีพ ฉบับสาม').getByRole('button', { name: 'ยืม' }).click(); await p.waitForTimeout(400);
    await p.getByRole('button', { name: 'ยืนยันการยืม' }).click(); await p.waitForTimeout(800); const emptyBorrow = await body();
    const borrowMsg = (emptyBorrow.match(/[^\n]*(กรุณา|ห้ามว่าง|ใส่ชื่อ)[^\n]*/) ?? [''])[0];
    const stillFree = (await rowOf('ทำงานอย่างมืออาชีพ ฉบับสาม')).includes('ว่าง');
    await p.getByPlaceholder('ชื่อคนยืม').fill('วิภา'); await p.getByRole('button', { name: 'ยืนยันการยืม' }).click(); await p.waitForTimeout(1000);
    await p.screenshot({ path: 'out/product-borrowed.png', fullPage: true });
    const r1 = await rowOf('ทำงานอย่างมืออาชีพ ฉบับสาม'), r2 = await rowOf('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม');
    note('2. รายการหนังสือทั้งหมด พร้อมสถานะ "ว่าง" / "ถูกยืม" และชื่อคนยืม', r1.includes('ถูกยืม') && r1.includes('วิภา') && r2.includes('ว่าง'), JSON.stringify([r1, r2]));
    note('3. ยืมได้: "ยืม" → ชื่อคนยืม → ถูกยืม พร้อมวันที่ยืม', r1.includes('ถูกยืม') && r1.includes('วิภา') && /\d{1,2}\s*\S+\.?\S*\s*25\d\d|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(r1), JSON.stringify(r1));
    // 4 — return: cancel first (must stay), then OK
    dismiss = true; await inRow('ทำงานอย่างมืออาชีพ ฉบับสาม').getByRole('button', { name: 'คืน' }).click(); await p.waitForTimeout(700);
    if (!dialogs.length && (await p.getByRole('button', { name: /ยกเลิก/ }).count())) await p.getByRole('button', { name: /ยกเลิก/ }).last().click();
    await p.waitForTimeout(500); const stayed = (await rowOf('ทำงานอย่างมืออาชีพ ฉบับสาม')).includes('ถูกยืม');
    await inRow('ทำงานอย่างมืออาชีพ ฉบับสาม').getByRole('button', { name: 'คืน' }).click(); await p.waitForTimeout(700);
    if (!dialogs.length || dialogs.length < 2) { const ok = p.getByRole('button', { name: /ยืนยัน|ตกลง|คืน/ }); if ((await ok.count()) > 1) await ok.last().click(); }
    await p.waitForTimeout(900); const r1b = await rowOf('ทำงานอย่างมืออาชีพ ฉบับสาม');
    note('4. คืนได้: ถามยืนยันก่อน แล้วกลับเป็นว่าง', stayed && r1b.includes('ว่าง') && !r1b.includes('ถูกยืม'), `confirm ${JSON.stringify(dialogs)} · cancelled → still borrowed ${stayed} · confirmed → ${JSON.stringify(r1b)}`);
    // 5 — search
    await p.fill('#search', 'สุดา'); await p.waitForTimeout(500); const s1 = await body();
    await p.fill('#search', 'เวลา'); await p.waitForTimeout(500); const s2 = await body(); await p.fill('#search', ''); await p.waitForTimeout(400);
    note('5. ค้นหาจากชื่อหรือผู้แต่ง กรองทันที', s1.includes('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม') && !s1.includes('ทำงานอย่างมืออาชีพ ฉบับสาม') && s2.includes('การจัดการเวลา ฉบับสาม') && !s2.includes('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม'), `by author "สุดา" → ${s1.includes('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม')} only · by title "เวลา" → ${s2.includes('การจัดการเวลา ฉบับสาม')} only`);
    // 7 — empty title; empty borrower (above)
    const before = await body(); await addBook('', 'ใครก็ได้'); const after = await body();
    const titleMsg = (after.match(/[^\n]*(กรุณา|ห้ามว่าง|ใส่ชื่อ)[^\n]*/) ?? [''])[0];
    note('7. ชื่อหนังสือและชื่อคนยืมห้ามว่าง — ข้อความไทย ไม่บันทึก', /[฀-๿]/.test(titleMsg) && !after.includes('ใครก็ได้') && /[฀-๿]/.test(borrowMsg) && stillFree, `empty title → ${JSON.stringify(titleMsg)} · empty borrower → ${JSON.stringify(borrowMsg)}`);
    await p.screenshot({ path: 'out/product-empty-title.png', fullPage: true });
    const words = ((await body()).match(/[A-Za-z]{2,}/g) ?? []);
    note('8. รันที่ :3930 ไม่ต้อง login ข้อความไทยทั้งหมด', p.url().startsWith('http://127.0.0.1:3930') && !/login|เข้าสู่ระบบ/i.test(await body()) && words.length === 0, `English words: ${JSON.stringify(words)}`);
    // leave one book borrowed for the restart check
    await borrow('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม', 'ก้อง');
    fs.writeFileSync('out/product-before-restart.txt', await body());
  } else {
    const before = fs.readFileSync('out/product-before-restart.txt', 'utf8'); const now = await body();
    await p.screenshot({ path: 'out/product-after-restart.png', fullPage: true });
    const r = await rowOf('เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม');
    note('6. ข้อมูลอยู่ในไฟล์ JSON — ปิดเปิด server ใหม่ ข้อมูลยังอยู่ครบ (รวมสถานะยืม)', ['ทำงานอย่างมืออาชีพ ฉบับสาม', 'เขียนโปรแกรมด้วยภาษาไทย ฉบับสาม', 'การจัดการเวลา ฉบับสาม'].every((x) => now.includes(x)) && r.includes('ถูกยืม') && r.includes('ก้อง'), `after restart: ${JSON.stringify(r)}`);
  }
} finally { await b.close(); }
