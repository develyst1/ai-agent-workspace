# As-Built Survey — Develyst Server

> อ่านจากเครื่องจริงเมื่อ **2026-09-23** (read-only survey, ไม่ได้เปลี่ยนสถานะอะไร)
> ทุกค่าเป็นข้อเท็จจริงที่ query ได้ / ที่หา "ไม่ได้" ระบุว่า **ไม่ทราบ**

---

## 1. เซิร์ฟเวอร์

| รายการ | ค่า (อ่านจากเครื่อง) |
|---|---|
| Hostname | `WIN-FKBTUPQRE7F` |
| OS | Windows Server 2022 Standard (10.0.20348, 64-bit) |
| CPU | Intel Xeon Gold 6138 @ 2.00GHz — **3 cores / 3 logical** |
| RAM | **12 GB** |
| Disk | C: 59.9 GB (เหลือว่าง **20.7 GB**) — ไดรฟ์เดียว |
| Public IP | `154.197.124.206` (ยืนยันจาก api.ipify.org) |
| Last boot | 2026-07-30 17:41 (uptime ~55 วัน) |
| RDP | เปิดที่ port 3389 |
| เจ้าของ DNS / registrar | **ไม่ทราบ** (อ่านจากเครื่องไม่ได้) — แต่ทุก domain วิ่งผ่าน **Cloudflare** (response header `Server: cloudflare`); อีเมลที่ใช้ออก cert = `develyst1@hotmail.com` |

---

## 2. แอปที่รันอยู่ (`pm2 list`)

รวม **34 process ใน pm2** — online 26, stopped 6, และ **chipint ไม่มีใน pm2 เลย** (มี nginx conf + cert แต่ไม่มี process)

**🟢 Online (26):** backoffice-front/back, develyst-ai, dte, fangfangshop-front/back, jari-front/back, juice-front/back, learning-front/back, line-oa-front/back, off-front/back, ong-front/back, portfolio-front/back, possibility-front/back, pun-kub-fang-front, roommade-front, som-front/back, wi-store-front/back

**🔴 Stopped (6):** knowcode-front/back, safe-goods-front/back, tocktest-front/back

**⚠️ ไม่มีใน pm2:** `chipint` (nginx ชี้ไป 3010 แต่ไม่มี process listen → chipint.develyst.online ตอนนี้น่าจะ 502)

**Backend exe names (ยืนยันจาก netstat process):** `jari-back`, `smart-scheduler-back` (som), `the-off-ml-project-back`, `ong-match-back`, `smart-scheduler-backoffice-back`, `fangfangshop-back`, `juice-yaso-back`, `portfolio-back`, `wi-store-back`, `line-oa-back`, `possibility-back` — ทั้งหมด mode `fork`, restart count 0 (ยกเว้น portfolio-back = 1). Fronts รันด้วย `node`, develyst-ai รันด้วย `bun`.

**ลูกค้าจริง vs dev/test:** **ไม่ทราบแน่ชัด** (อ่านจากเครื่องไม่ได้ ต้องถามเจ้าของ) — ข้อสังเกตจากชื่อ (เป็นการอนุมาน ไม่ใช่ข้อเท็จจริง): `tocktest` เดาว่า test; ทุกตัวมี domain จริง + cert จริง

---

## 3. Nginx

- **โครงสร้าง:** ใช้ **`conf.d/*.conf`** (ไม่ใช่ sites-available/enabled) — 1 ไฟล์ต่อ 1 domain, รวม **20 ไฟล์** ที่ `C:\nginx\conf.d\`
- **Main config:** `C:\nginx\conf\nginx.conf` → มี `include C:/nginx/conf.d/*.conf;`
- **Config ส่วนกลาง (http block ที่ใช้ร่วมกันทุกเว็บ):**
  - `server_names_hash_bucket_size 64;`
  - `sendfile on;` / `keepalive_timeout 65;`
  - `proxy_buffer_size 16k; proxy_buffers 8 16k; proxy_busy_buffers_size 32k;` ← (เพิ่งเพิ่มแก้ 502 login เมื่อ 2026-09-22)
- nginx รันเป็น process เดียว ฟัง **80 + 443**

**domain → upstream port:**

| conf | domain | ports (proxy_pass) |
|---|---|---|
| develyst-ai | ai.develyst.online | 3009 |
| chipint | chipint.develyst.online | 3010 *(ไม่มี app)* |
| dte | dte.develyst.online | 3011 |
| tocktest | tocktest.develyst.online | 3012, 4004 *(stopped)* |
| jari | jari.develyst.online | 3013, 4005 |
| som | som.develyst.online | 3014, 4006 |
| learning | learning.develyst.online | 3015, 4007 |
| offml | offml.develyst.online | 3016, 4008 |
| ong | ong.develyst.online | 3017, 4009 |
| backoffice-som | backoffice-som.develyst.online | 3018, 4010 |
| fangfangshop | fangfangshop.develyst.online | 3019, 4011 |
| portfolio | portfolio.develyst.online | 3020, 4014 |
| knowcode | knowcode.develyst.online | 3021, 4012 *(stopped)* |
| orenge | orenge.develyst.online | 3022, 4013 |
| punkubfang | punkubfang.develyst.online | 3023 (4015 อยู่ใน comment รอ back) |
| wi-store | wi-store.develyst.online | 3024, 4016 |
| line-oa | line-oa.develyst.online | 3025, 4017 |
| klang | klang.develyst.online | 3026, 4018 *(stopped)* |
| possibility | possibility.develyst.online | 3027, 4019 |
| roommade | roommade.develyst.online | 3028 |

---

## 4. Port ที่ใช้จริง (`Get-NetTCPConnection -Listen`)

**Infra:** 80 + 443 (nginx), 5432 (postgres), 3389 (RDP)

**Frontend (listen อยู่จริง):** 3009, 3011, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3022, 3023, 3024, 3025, 3027, 3028
**Backend (listen อยู่จริง):** 4005, 4006, 4007, 4008, 4009, 4010, 4011, 4013, 4014, 4016, 4017, 4019

**จองใน config แต่ไม่ listen (app stopped/ไม่มี):** 3010 (chipint), 3012+4004 (tocktest), 3021+4012 (knowcode), 3026+4018 (safe-goods), 4015 (pun-kub-fang back รอ deploy)

**ช่วงว่างถัดไป:** front **3029+**, back **4020+** (convention: 3009–3099 front / 4000–4099 back)

---

## 5. SSL

- ออกด้วย **Let's Encrypt ผ่าน win-acme** (`C:\win-acme\wacs.exe`), cert เก็บที่ `C:\nginx\ssl\<domain>-chain.pem` + `-key.pem`
- **20 domain มี cert**
- **ต่ออายุอัตโนมัติ:** Scheduled Task **`SSL-CertRenewal`** — ทุกวัน **03:00**, รัน `C:\Develyst\deploy\ssl-renew.ps1` (`wacs --renew` + `nginx -s reload`) — LastRun 2026-09-22 03:00 **Result=0**. มี task `win-acme renew (...)` อีกตัว (ของ win-acme เอง)
- **🔴 ปัญหา: `chipint.develyst.online` cert หมดอายุแล้ว (−16 วัน, 2026-09-07)** — renewal รันผ่านแต่ตัวนี้ไม่ต่อ (น่าจะเพราะ app ไม่รัน/validation ล้ม)
- ที่เหลือเหลือ 39–90 วัน (ใกล้สุด: tocktest / dte / ai = 39 วัน)

---

## 6. โครงสร้างโฟลเดอร์

- Root: **`C:\Develyst\<project>\`** (ยกเว้น roommade อยู่ `C:\Develyst\fastwork\website-portfolio\front`)
- Pattern มาตรฐานต่อโปรเจกต์: `<project>\front\` + `<project>\back\`
  - **front:** `.next.zip` → แตกเป็น `.next\standalone\` (รันด้วย `server.js`), มี `ecosystem.config.cjs` + `deploy.sh` (+ บางตัวมี `backup\`)
  - **back:** `dist.zip` → แตกเป็น `dist\<app>.exe` (Bun compiled), มี `.env` + `ecosystem.config.cjs` + `deploy.sh`
- **หน้าตาเหมือนกันเกือบทั้งหมด** แต่ **ไม่ 100%**: ชื่อโฟลเดอร์ไม่ตรง pm2 บางตัว (เช่น `pun-kun-fang` แต่ pm2 = `pun-kub-fang`; `smart-scheduler` = som), roommade อยู่ใต้ `fastwork\`
- โปรเจกต์ที่ไม่มีใน pm2 / ไม่ตรง: `ai-api-center`, `learning-curve`, `lk2-client-tool` (มีโฟลเดอร์แต่สถานะไม่ชัด — **ไม่ทราบ**)

---

## 7. deploy.sh

- มี **30 ไฟล์** (front + back ต่อโปรเจกต์) ที่ `C:\Develyst\<project>\{front,back}\deploy.sh` — **ทุกไฟล์เป็น pattern เดียวกัน** (ต่างแค่ชื่อ pm2 + `.next.zip`/`dist.zip`)
- ⚠️ **ทุกตัวยังเป็น flow เดิมที่ทำให้ 502** (stop → rm → unzip → restart)

**เนื้อ `smart-scheduler\back\deploy.sh` (som-back) — ตัวจริง:**

```bash
#!/bin/bash
if [ ! -f "dist.zip" ]; then echo "dist.zip not found"; exit 1; fi
if [ -d "dist" ]; then
    pm2 stop som-back              # <- ดับแอป
    rm -rf dist                    # <- ลบโค้ดเก่า (แอปดับช่วงนี้)
fi
unzip -q dist.zip                  # <- แตกไฟล์ (นานหลายวินาที)
if [ -d "dist" ]; then echo "ok"; else echo "fail"; exit 1; fi
pm2 restart som-back
read
```

**front (som-front)** เหมือนกันทุกอย่าง แค่เปลี่ยน `dist.zip`→`.next.zip`, `dist`→`.next`, `som-back`→`som-front`

> มี `deploy.ps1` (7.6KB) + `ssl-renew.ps1` ที่ `C:\Develyst\deploy\` ด้วย

---

## 8. Backup

| ที่เก็บ | มีอะไร |
|---|---|
| `C:\Develyst\deploy\dump.pm2.bak-20260719-152954` | pm2 dump backup (156KB) |
| `C:\Develyst\deploy\dump.pm2.bak-20260720-175242` | pm2 dump backup (159KB) |
| `C:\ProgramData\pm2\home\dump.pm2` (+ `.bak`) | boot dump ปัจจุบัน (413KB, 2026-09-22) — ตัวที่ pm2 service resurrect |
| `C:\Users\Administrator\.pm2\dump.pm2` | dump เก่า (184KB, 2026-07-20) — คนละ home |
| `C:\Develyst\<project>\front\backup\` | โฟลเดอร์ backup ต่อแอป — **มีแบบ ad-hoc ไม่สม่ำเสมอ** (som front = 2 ไฟล์, wi-store = ว่าง) |
| `C:\Develyst\deploy\pm2-installer\` | git clone ตัวติดตั้ง pm2-service |

**restore กลับได้:** pm2 process list (จาก dump.pm2 backups). **ไม่มี** backup โค้ด/DB แบบเป็นระบบ (`dist.prev`/snapshot อัตโนมัติ — ไม่พบ)

---

## 9. Database (PostgreSQL 18, localhost:5432)

มี **24 database** บนเครื่อง (user `postgres`):

`agent_office`, `agent_office_test`, `code_report` (knowcode), `fangfangshop`, `fangfangshop_db` *(ว่าง)*, `iwealth_better_db`, `jari_db`, `juice_db`, `learning_curve`, `lerning_curve` *(สะกดผิด?)*, `line_oa`, `line_ranger_db`, `ong_match_db`, `ong_match_db_test`, `possibility_db`, `pp_realtimechat`, `punkubfang`, `safe_goods_db`, `smart_backoffice_db`, `smart_scheduler` (som), `the_off_ml_project` (off), `tocktest_db`, `wi_store`, `postgres`

**แอป ↔ DB ที่ยืนยันได้จาก `.env` (ตัวที่ deploy รอบนี้):** som→`smart_scheduler`, wi-store→`wi_store`, line-oa→`line_oa`, safe-goods→`safe_goods_db`, possibility→`possibility_db`, juice→`juice_db`, knowcode→`code_report`, fangfangshop→`fangfangshop`

**DB ที่ไม่ชัดว่าแอปไหนใช้ / อาจ orphan:** `agent_office*`, `iwealth_better_db`, `line_ranger_db`, `pp_realtimechat`, `lerning_curve` (สะกดผิด vs `learning_curve`), `fangfangshop_db` (ว่าง) — **ไม่ทราบแน่ชัด**

---

## 10. Checklist เพิ่มโปรเจกต์ใหม่ 1 ตัว (จากขั้นตอนจริงที่เห็นบนเครื่อง)

1. วางไฟล์ `C:\Develyst\<project>\front\.next.zip` (+ `back\dist.zip` + `back\.env` ถ้ามี back)
2. **เลือก port ถัดไป** — front 3029+, back 4020+ (เช็ค `Get-NetTCPConnection -Listen` ก่อน) 🔴
3. แตก zip → `.next\standalone\` / `dist\`
4. เขียน `ecosystem.config.cjs` (front: PORT/HOSTNAME + NextAuth ถ้ามี; back: NODE_ENV เท่านั้น, config อยู่ใน `.env`)
5. แก้ `back\.env`: DB host → **localhost**, secret placeholder → generate จริง
6. สร้าง DB ใน Postgres ถ้าต้องใช้
7. `pm2 start ecosystem.config.cjs` → เช็ค `Test-NetConnection <port>` + log
8. เขียน `C:\nginx\conf.d\<name>.conf` (bootstrap HTTP 80 ก่อน) → `nginx -t` → reload 🔴
9. ออก cert: `wacs.exe --target manual --host <domain> ...`
10. เขียน conf ตัวเต็ม (HTTPS + proxy_pass) → `nginx -t` → **reload (ผ่าน SYSTEM scheduled task)** 🔴
11. verify HTTPS + `pm2 save` (เขียน boot dump)

### 🔴 ขั้นที่ "พลาดแล้วกระทบแอปอื่น / ทั้งเครื่อง"

| ขั้น | ความเสี่ยง (blast radius) |
|---|---|
| **10 (nginx reload)** | ถ้า `.conf` ใหม่ syntax ผิดแล้ว reload → **nginx ล้มทั้ง process = ทุก domain 502 พร้อมกัน** → ต้อง `nginx -t` ให้ผ่านก่อนเสมอ |
| **แก้ `nginx.conf` (http block ส่วนกลาง)** | พังจุดเดียว = **ทุกเว็บล่ม** (เช่นเคส proxy_buffer) |
| **2 (เลือก port)** | ใช้ port ซ้ำกับแอปที่รันอยู่ → แอปใหม่ start ไม่ขึ้น (EADDRINUSE) หรือชนของเดิม |
| **deploy.sh เดิม (stop→rm→unzip)** | กระทบ **เฉพาะแอปตัวเอง** (ดับช่วง deploy → 502 ของ domain นั้น) — ไม่ลามข้ามแอป แต่คือปัญหาที่คุยเรื่อง blue-green |
| **`pm2 save` ผิด home** | ถ้า save ผิด PM2_HOME → reboot แล้วแอปหาย |

---

## ⚠️ ประเด็นที่เจอระหว่างสำรวจ (ข้อเท็จจริง — ยังไม่ได้แก้)

1. **chipint** — cert หมดอายุ 16 วัน + ไม่มี process ใน pm2 → chipint.develyst.online น่าจะล่ม
2. **safe-goods (klang)** + **knowcode** + **tocktest** — stopped อยู่ (klang เคยคุยว่ารอ seed admin)
3. **pm2.exe Windows Service = Stopped** (StartType Automatic) ทั้งที่แอป online อยู่ — daemon รันจาก PM2_HOME `C:\ProgramData\pm2\home` แต่ตัว service wrapper ไม่ได้ start → **ควรตรวจว่า reboot แล้วจะ resurrect ได้จริงไหม** (ไม่ทราบแน่ชัด ต้องทดสอบ)
4. Disk C: เหลือ **20.7 GB** จาก 60 GB — เริ่มควรจับตา (แต่ละ back exe ~100MB)
5. DB หลายตัวอาจ orphan (ไม่แน่ใจว่าแอปไหนใช้)

---

*สร้างโดย read-only survey (pm2 list, netstat, nginx confs, x509 cert, scheduled tasks, psql SELECT, folder/deploy.sh listing) — ไม่ได้เปลี่ยนสถานะอะไรบนเครื่อง*
