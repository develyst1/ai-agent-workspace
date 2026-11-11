# As-Built Survey — Develyst Server

> 🔴 **2026-10-31, owner: there is ONE server in use, the Linux VPS → sections S2.1–S2.9 below.** *"ตอนนี้ฉันให้รู้ว่ามีแค่เครื่องเดียวนะคือ Linux"*.
> Sections §1–§10 (the Windows box `WIN-FKBTUPQRE7F`) are **history only, not in use**. Do not act on them.

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

---
---

# Server 2 — ReadyIDC VPS (Linux) — recorded 2026-10-31

> **Current state = the handbook `server-platform/readyidc/readyidc-vps.md`.** S2.1–S2.8 below describe the 10-28/10-31
> starting state (e.g. "pm2 not installed", "UFW 80/443 open", "platform NOT BUILT" are all superseded). The dated
> entries appended under S2.9 are the history, newest at the bottom. (Pointer added 2026-11-01 after a cold-start test.)

> **Source:** two documents the owner handed Otto on 2026-10-31 — `readyidc-vps.md`
> (server handbook, last updated 2026-10-28; the owner's copy lives on his Mac at
> `~/Documents/servers/readyidc-vps.md`) and `deploy-platform-brief.md` (written
> 2026-10-31). **Otto has NOT verified any of this on the live box** — no SSH key
> from this workspace's machines is in `authorized_keys` yet. Everything below is
> "as the owner's documents say"; the server is the truth.
> Owner's instruction 2026-10-31: *"บันทึกเข้า SERVER-FACTS.md ก่อน ยังไม่ต้องสร้างอะไร"* — record only, build nothing.

## S2.1 The box

| | |
|---|---|
| Provider | ReadyIDC — panel https://customer.readyidc.com, service **`vpsgame149701`** |
| IP | `43.228.86.89` |
| OS | Ubuntu **26.04.1 LTS**, x86_64 (rebuilt from the panel 2026-10-28) |
| Size | **4 CPU · 6 GB RAM · 60 GB disk** (~55 GB free, 2026-10-30) |
| Login | `ssh deploy@43.228.86.89` — **SSH key only** |
| SSH host key | `SHA256:X44qS1jtk6HvSY3qQtPlqA2Iglwxnzd+sQRni8tag0U` (ED25519) — compare before trusting any `ssh-keyscan` |
| Users | `deploy` = the only SSH user, in `sudo`; **sudo needs the owner's password (agents don't have it)**. `root` SSH login off; root password (in panel) works only in the panel **Console** |
| Allowed keys | `/home/deploy/.ssh/authorized_keys` — as of 2026-10-28 only the owner's MacBook Air (`entronica@Mac.localdomain`). One key per person/machine; revoke = delete that line |
| Emergency | Panel → server → **Console**, log in as root. **Rebuild = wipes the disk. Cancel VPS = ends the rental.** Never press either |
| Database | **None on this box, by design** |

## S2.2 What is installed / hardened (owner verified 2026-10-28/30)

| Item | State | Where |
|---|---|---|
| SSH | root login off, password login off, key only | `/etc/ssh/sshd_config.d/00-hardening.conf` |
| UFW | allow in only **22, 80, 443** (v4+v6) | `sudo ufw status verbose` |
| fail2ban | sshd jail: 5 fails / 10 min → 1 h ban (verified it counts) | `/etc/fail2ban/jail.local` |
| Auto updates | unattended-upgrades, security daily | `/etc/apt/apt.conf.d/20auto-upgrades` |
| Node.js | v24 LTS (npm 11), NodeSource, pinned | `/etc/apt/sources.list.d/nodesource.list`, `/etc/apt/preferences.d/nodesource` |
| Nginx | 1.28, default site only, `server_tokens off` | `/etc/nginx/` |
| pm2 / Bun | **not installed** | — |

Security check 2026-10-30 (owner's session): no sign of intrusion — every successful SSH login was the owner's IP + key.

**Health check** (from a machine with a key; asks once for sudo password):

```bash
ssh -t deploy@43.228.86.89 'sudo ufw status; sudo fail2ban-client status sshd; sudo sshd -T | grep -E "^(permitrootlogin|passwordauthentication) "; node -v; systemctl is-active nginx'
```

Expected: UFW active 22/80/443 · sshd jail shown · `permitrootlogin no` · `passwordauthentication no` · `v24.x` · `active`.

## S2.3 Gotchas already hit on this box (do not re-learn them)

- ReadyIDC drops in `/etc/ssh/sshd_config.d/99-custom.conf` that turns root + password login **on**. `00-hardening.conf` wins only because sshd keeps the first value read — **never rename it to a later number**.
- Ubuntu 26.04 / OpenSSH 10 logs failures from `sshd-session`; Debian's `jail.d/defaults-debian.conf` watches only `sshd` → out of the box fail2ban bans nobody. `jail.local` has its own `journalmatch` line — **keep it**.
- Ubuntu's `nginx.conf` already sets `server_tokens`; setting it again in `conf.d/` makes **`nginx -t` fail**.
- `sudo` is **`sudo-rs`** (different prompt). `last` / `wtmpdb` not installed → login history from `journalctl -u ssh`.
- After a Rebuild SSH takes 1–3 min ("Connection refused" until then).
- `apt install nginx` once hung the SSH command → run long remote commands with `</dev/null` and a timeout.
- A hook in the owner's local workspace blocks `sed -i` → edit remote files by writing whole files, or a quoted heredoc that asserts exactly one match.
- Owner's Mac is **arm64**, server is **x86_64** → never ship native builds from the Mac.

## S2.4 Deploy platform — DESIGNED & AGREED with the owner 2026-10-30, **NOT BUILT**

Goal: the AI team deploys many small projects with no manual copying — **merge `develop` → `sit`, push → live in 2–5 min.**

| # | Topic | Decision |
|---|---|---|
| 1 | DNS | One Cloudflare record on `develyst.online`: `A * 43.228.86.89`, **proxied**. Explicit records still win → existing subdomains stay on Server 1. One level only (`shop-api.develyst.online` ✓, `api.shop.develyst.online` ✗) |
| 2 | TLS | One **Cloudflare Origin Certificate** `*.develyst.online` + `develyst.online` (15 y) in Nginx; Cloudflare SSL mode **Full (strict)**; records must stay proxied. No per-app ACME |
| 3 | Unknown hosts | Nginx `default_server` on 80/443 → `444` |
| 4 | App types | **static** (Vite/React/Svelte, Nginx serves, no port/pm2) · **process** (Next.js standalone, Bun Hono/Elysia, Go, Rust, .NET, Python; pm2 on `127.0.0.1:<port>`) |
| 5 | Ports | Registry file on the server (e.g. `/srv/apps/ports.tsv`); `new-app` hands out next free **from 3001 up**, under a lock. Agents never guess |
| 6 | Releases | `/srv/apps/<name>/releases/<ts>/` + `current` symlink; keep **current + 1 previous**; refuse deploy if free disk < 2 GB |
| 7 | Scripts | Only agent interface: `new-app` (once per app) and `deploy-app` (every deploy) — contracts in S2.5 |
| 8 | Sudo | sudoers lets `deploy` run **only** `new-app` + nginx test/reload without password; pm2 runs as `deploy` |
| 9 | Secrets | `.env` only at `/srv/apps/<name>/shared/.env` (mode 600), symlinked into each release; never in git/artifact |
| 10 | Build | **GitHub Actions** `ubuntu-latest` (x86_64) — never on the Mac |
| 11 | Branches | own → `develop` → `sit`. Push to **`sit`** deploys to `<app>-sit.develyst.online` (or per-app name). `develop` = checks only. `main` → production name later |
| 12 | CI (light) | `typecheck` + `lint` if present, then build; any failure stops deploy, live stays. Tests later |
| 13 | Database | Apps use the **owner's existing DB server** (which one: **ไม่ทราบ** — not named in the docs). When first needed: allow only `43.228.86.89`, require SSL, one DB user per app |
| 14 | Process mgr | **pm2** + `pm2 startup` + `pm2 save` + `pm2-logrotate` |

## S2.5 Script contracts (to build)

**`sudo new-app <name> <static|process> [--host <fqdn>] [--start "<cmd>"]`**
- name `^[a-z0-9-]{2,40}$`, refuse existing. Create `/srv/apps/<name>/{releases,shared}` owned by `deploy`, `shared/.env` 600.
- process: reserve port, write pm2 ecosystem entry (`cwd`=`current`, `PORT`, start cmd; defaults Next `node server.js`, Bun binary `./app`).
- Write `/etc/nginx/sites-available/<name>.conf` (static: `root …/current` + `try_files $uri /index.html`; process: `proxy_pass http://127.0.0.1:<port>` + Host/X-Forwarded-*). 443 with origin cert, 80 → 443.
- Enable, `nginx -t`, reload; if `-t` fails remove the new file and exit non-zero. Print name/type/host/port.

**`deploy-app <name> <artifact.tgz>`** (as `deploy`, no sudo)
1. App exists, artifact exists, free disk ≥ 2 GB.
2. Extract to `releases/<UTC ts>/`, link `shared/.env`.
3. Remember old `current`; atomic switch (`ln -sfn` temp + `mv -T`).
4. process: `pm2 reload` (or `start` first time), poll `127.0.0.1:<port>/` (or health path) ≤ 30 s, expect < 500. static: `index.html` exists.
5. Fail → point back to old release, reload, exit non-zero.
6. Success → delete releases older than previous; `pm2 save`.

**GitHub Actions** (sketch, untested): secrets `DEPLOY_SSH_KEY` (key made only for GitHub) + `DEPLOY_KNOWN_HOSTS`; jobs build (`--if-present typecheck/lint`, build, tar) → deploy on `sit` (scp to `/tmp`, `deploy-app`, rm). Build notes: Next `output:'standalone'` + copy `.next/static` & `public`; Bun `bun build --compile --target=bun-linux-x64 … --outfile app`; Go `GOOS=linux GOARCH=amd64`; .NET `-r linux-x64 --self-contained -p:PublishSingleFile=true`; Python needs a venv step added when the first one appears.

## S2.6 Build order (each step ends with a check)

1. Base: pm2 for `deploy`, `pm2 startup` (owner sudo once), `pm2-logrotate`. ✔ `pm2 ping`, unit `pm2-deploy` enabled.
2. **Owner/Cloudflare:** create Origin Cert → install `/etc/ssl/cloudflare/` (key 600, root). ✔ `openssl x509 -noout -subject -enddate`.
3. Nginx default_server 444 + shared TLS snippet. ✔ `nginx -t`; `curl -k https://43.228.86.89` closed.
4. Scripts to `/usr/local/bin` (root-owned) + `/etc/sudoers.d/deploy-platform`, `visudo -c`. ✔ `sudo -n new-app --help` works, `sudo -n ls /root` refused.
5. **Owner/Cloudflare:** wildcard record + SSL mode Full (strict). ✔ `dig +short test-xyz.develyst.online` → CF IPs; an existing subdomain still served from Server 1.
6. Pilot app (small Next or Bun) → Action green, `https://<app>-sit.develyst.online` 200, broken push auto-rolls back.
7. Update the handbook.

**Needs the owner (agents cannot):** sudo password (steps 1, 3, 4) · Cloudflare cert/record/SSL mode · pilot repo + the two repo secrets (or `gh` access) · DB server address + permission to allow `43.228.86.89`.

## S2.7 Open items from the handbook (not done)

- A Next.js app deploy was planned as **systemd on `127.0.0.1:3000`** + Let's Encrypt — this predates and **conflicts with** the agreed design (pm2, ports from 3001, Origin Cert). Treat the brief (S2.4) as current unless the owner says otherwise.
- Optional sudoers rule for `systemctl restart <app>` (superseded by pm2-as-deploy if the platform is built).
- Owner to back up his Mac's `~/.ssh/id_ed25519` — losing it means Console only.

## S2.8 ⚠️ Risks Otto sees (recorded, not acted on)

1. **Cloudflare SSL mode is zone-wide by default.** Switching `develyst.online` to Full (strict) (step 5) applies to the ~20 Server-1 subdomains too. Server 1 uses valid Let's Encrypt certs, so they should survive — **but any Server-1 host with an expired/invalid cert goes 526** (known: `chipint`, expired 2026-09-07). Check every Server-1 cert's expiry and the zone's current SSL mode **before** flipping it.
2. The wildcard `*` catches **every** name without an explicit record. Confirm every Server-1 subdomain has its own explicit record before adding `*`.
3. No access yet from the workspace machines: a new key per machine/agent must be added by the owner (S2.1).
4. Server 2 has no DB; the "existing DB server" is unnamed. If it is Server 1's Postgres (5432, not exposed publicly today), opening it to `43.228.86.89` is a change on the shared box → owner's explicit go.

## S2.9 Access log

- **2026-10-31 — Otto verified live:** `ssh-keyscan` of `43.228.86.89` returns ED25519 `SHA256:X44qS1jtk6HvSY3qQtPlqA2Iglwxnzd+sQRni8tag0U` = matches the handbook. Banner `OpenSSH_10.2p1 Ubuntu-2ubuntu3.8`.
- **2026-10-31 — new key made for the owner's Windows PC** (`DESKTOP-V5GJILT`, the machine Otto talks to the owner from — NOT the Mac). Comment `otto@KUYDONG-win-2026-10-31`, fingerprint `SHA256:Tk2k7K9m2NKsUSWhubp92Hs3rcapg7e4eOtMZjioBng`, no passphrase (agent use). Private key stays on that PC only (ACL: that user only); SSH alias `readyidc` there with `StrictHostKeyChecking yes`. **Status: waiting for the owner to add the .pub to `authorized_keys`.** Revoke = delete the line ending `otto@KUYDONG-win-2026-10-31`.
- **2026-10-31 15:21 — key is live.** The owner's Mac session added it; `authorized_keys` now has 2 lines: `entronica@Mac.localdomain`, `otto@KUYDONG-win-2026-10-31`. Otto logged in from the Windows PC as `deploy` (read-only commands only, no sudo). Live readings: hostname `ubuntu2604`; `deploy` groups `deploy,sudo`; uptime 3 d 3 h; disk `/` 58 G, 3.3 G used, **54 G free**; RAM 5.8 Gi, 5.2 Gi available; **swap: none (0 B)**; nginx `active`; node `v24.22.1`; **pm2 not installed** — all match the docs. Server returns `Permission denied (publickey)` when a password is attempted → password login is off.
- **2026-10-31 15:2x — password-login test** above was exactly 1 attempt; fail2ban bans at 5 failures / 10 min (S2.2). Never loop it.
- **2026-10-31 ~15:30 — Build step 1 done (pm2 base)**, per Atlas's review (`REVIEW-atlas-to-otto-2026-10-31-security.md`, item 6) and the `platform-security` skill:
  - A first attempt (`sudo sh -c 'npm install -g pm2 && pm2 startup'` as root) was **cancelled at the password prompt — it never ran**. Verified: `/usr/bin/pm2` absent, `/usr/lib/node_modules` = only `corepack`, `npm`.
  - **pm2 7.1.1 installed as `deploy`, no root:** `npm config set prefix ~/.local` → **`/home/deploy/.local/bin/pm2`**. Scripts and CI must call it by this **absolute path** (non-interactive SSH has no `~/.local/bin` on PATH). PM2_HOME = `/home/deploy/.pm2`.
  - **pm2-logrotate 3.0.0** (module, as `deploy`): `max_size 10M`, `retain 7`, `compress true`.
  - **The only root step:** the owner ran `sudo /home/deploy/.local/bin/pm2 startup systemd -u deploy --hp /home/deploy` in his own terminal. Result: unit **`pm2-deploy`** = `enabled`, `User=deploy`, `ExecStart=/home/deploy/.local/lib/node_modules/pm2/bin/pm2 resurrect`, `PIDFile=/home/deploy/.pm2/pm2.pid`. It is `inactive` right now because the daemon was already running outside systemd; it starts on boot. **A boot-resurrect test (reboot) has NOT been done.** Nothing on the box serves users yet, so a reboot now is cheap: the owner decides when.
  - `pm2 save --force` → `/home/deploy/.pm2/dump.pm2` (empty list, no apps yet). `pm2 ping` → pong. No root pm2 daemon is running (ps shows only `deploy`'s God Daemon + the logrotate module).
  - Audit after the change: nginx, ssh, fail2ban and ufw are all `active`; RAM 5.1 Gi available; disk 54 G free. Swap is still none (Atlas recommends 2 GB with `vm.swappiness=10`; that needs its own sudo call and the owner's go).
  - **Rollback:** `sudo /home/deploy/.local/bin/pm2 unstartup systemd -u deploy` (owner), then as deploy: `~/.local/bin/pm2 kill && npm uninstall -g pm2` (prefix `~/.local`).
- **2026-10-31 15:32 — boot-resurrect PROVEN on Server 2.** The owner ran `sudo systemctl reboot` in his own terminal. His first 3 sudo-password tries failed (`sudo-rs` stops after 3 and closes the session; this is not an SSH failure, so it does not count toward the sshd fail2ban jail), and the 4th went through. A 5th run of the same command only timed out because the box was already down, so there was no second reboot. Before: boot `2026-10-28 04:33:44`, logrotate pid 51541. After: boot **`2026-10-31 08:32:47` UTC**, `pm2-deploy` became **active** at 08:32:57 (10 s after boot), the `deploy` God Daemon is running, pm2-logrotate 3.0.0 is **online** with a new pid (1309) and 0 restarts, and ssh, nginx, fail2ban and ufw are all **active**. RAM 5.2 Gi available; disk 54 G free. SSH came back in under ~1 min. Limit of this test: the pm2 dump held no apps yet, so it proves that the daemon and its modules start from systemd, not that a saved app list resurrects. Re-check that with the pilot app (S2.6 step 6).
- **The sudo password** asked for on Server 2 is the **`deploy` user's own password** (owner-held; ReadyIDC's root password in the panel is a different one and works only in the Console).
- **2026-10-31 — owner correction (via Atlas):** only this Linux box is in use; the Windows box is history. Effect on S2.8: risks 1, 2 and 4 talk about "Server-1 hosts". Whether `develyst.online` still has DNS records pointing at the old Windows IP is **unknown** (read it in Cloudflare at build step 5, before any zone-wide change or the wildcard). Creating the Origin Certificate (step 2) changes nothing in the zone.
- **2026-10-31 15:43 — Build step 2 done (Cloudflare Origin Certificate).** The owner created it in Cloudflare (`develyst.online` → SSL/TLS → Origin Server, RSA 2048, 15 y) and saved it on the Windows PC; it never went through chat.
  - Installed by the owner's sudo (one script, two `install` lines): **`/etc/ssl/cloudflare/origin.pem`** `root:root 644` and **`/etc/ssl/cloudflare/origin.key`** `root:root 600`; directory `root 755`.
  - Cert: issuer `CloudFlare Origin SSL Certificate Authority`, SAN **`*.develyst.online, develyst.online`**, notAfter **2041-10-27 08:35 GMT**.
  - Key↔cert match was proven on the server **before** install (`sha256sum` of both public keys equal) on the very files then copied byte-for-byte (sizes 1732/1706 unchanged). `deploy` cannot read the installed key (proven). nginx will re-prove the match at step 3 (`nginx -t` fails on a mismatch).
  - All copies destroyed: server drop folder (`shred -u` on the key, then removed) and the PC's drop folder. **There is no other copy of the private key.** Losing it = create a new Origin Certificate in Cloudflare (free, minutes); old ones can be revoked there.
  - Moving to a new server later: this cert is **not tied to an IP**, so copy both files (as root) or simply issue a new one.
  - Rollback: `sudo rm -r /etc/ssl/cloudflare` and revoke the cert in Cloudflare → SSL/TLS → Origin Server.
- **Owner question 2026-10-31, "how much work to move to a bigger server / new IP?"** Otto's answer, **proposed and not yet decided**: design for it now with three things: (1) every server setup step kept as a script in git (bootstrap); (2) never hard-code the server IP in each repo's workflow: one org-level GitHub variable/secret, or a DNS-only name such as `deploy.develyst.online`, plus copying the SSH host keys so `known_hosts` stays valid; (3) back up `/srv/apps/*/shared/.env` and the port registry off the box. With those, a move is about 1 h and touches no project repo.
- **2026-10-31 15:47 — Build step 3 done (nginx base).** The owner's sudo ran `~/nginx-stage/install-nginx-base.sh` (staged by Otto, shown before running): it printed `KEY-MATCH` (origin key ↔ cert, checked as root), `nginx -t` passed, then a reload printed `NGINX-OK`.
  - New **`/etc/nginx/snippets/cloudflare-origin-tls.conf`** = `ssl_certificate` + `ssl_certificate_key` for `/etc/ssl/cloudflare/origin.{pem,key}`. Every app's `listen 443 ssl` block includes it. `ssl_protocols TLSv1.2 TLSv1.3` already comes from Ubuntu's `nginx.conf` (http block), so do not repeat it.
  - New **`/etc/nginx/sites-available/00-default-drop.conf`**, enabled. Port 80 `default_server` → `return 444`; port 443 `default_server` → `ssl_reject_handshake on` (no cert served to unknown SNI). IPv4 and IPv6 listeners. The box has no global IPv6 address.
  - Ubuntu's `default` site is **disabled** (symlink removed). Backup: `/etc/nginx/sites-available/default.bak-20261031-0847`; the original file is also still in `sites-available/default`.
  - Checks: on the box, `curl http://127.0.0.1/` → empty reply (000) and `curl -k https://127.0.0.1/` → exit 35 (handshake refused). From the PC, `http://43.228.86.89` → exit 52 (empty reply) and `openssl s_client` → `alert 112 unrecognized_name`. ssh, fail2ban and ufw are active.
  - **Rollback:** `sudo rm /etc/nginx/sites-enabled/00-default-drop.conf && sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx`.
  - **Network oddity, not caused by the config, watch it:** around 15:49, from the PC, some TLS handshakes hung until timeout and SSH to :22 timed out for about a minute, while ping still answered. A minute later everything worked again (path MTU 1500 OK, DF ping with 1472 bytes OK). Loopback on the box always behaved correctly. Possible causes: provider network flakiness, or rate-limiting of one IP that opens many connections. If Cloudflare→origin errors (522/524) show up at the pilot, check this first.

## S2.2b Daily security audit (installed 2026-10-31 ~15:58; addition to S2.2)

Owner: *"ฉันอยากให้ออโต้ทำการเช็คว่าเซิร์ฟเวอร์โดนแฮกไหมมีไวรัสไหมทุกวัน"* · *"เริ่มเลย"*. Design: `REQUEST-atlas-to-otto-2026-10-31-daily-security-audit.md`.

| Item | State |
|---|---|
| ClamAV | `clamav` + `clamav-freshclam` 1.5.4 (Ubuntu). **No `clamd` daemon** (it would hold ~1 GB RAM). `clamav-freshclam` service enabled and active; it updates signatures. A `NotifyClamd: Can't find … clamd.conf` error from freshclam is expected and harmless |
| rkhunter | 1.4.6, installed with `--no-install-recommends` (so no MTA/mailer). Baseline taken with `rkhunter --propupd` (181 files searched, 177 found). `/etc/default/rkhunter` has `APT_AUTOGEN="true"` so apt/unattended-upgrades refresh the baseline after upgrades (backup: `/etc/default/rkhunter.bak-20261031-0857`). Trade-off: a binary swapped *through dpkg* is not flagged by rkhunter |
| Script | **`/usr/local/bin/security-audit`**, root:root 755, read-only, no arguments, prints 8 sections: logins, access, config hashes, processes/ports/cron/units, changed files, rkhunter, ClamAV, patching |
| sudoers | **`/etc/sudoers.d/security-audit`** (root 440): `deploy ALL=(root) NOPASSWD: /usr/local/bin/security-audit ""`. `visudo` checked it before and after install. Proven: `sudo -n …/security-audit` works as deploy; `sudo -n ls /root` is refused; `security-audit extra-arg` is refused |
| Schedule | Atlas's task **`otto-daily-security-audit`**, daily **20:30** (owner's local time). It opens an Otto session that runs `ssh readyidc 'sudo -n /usr/local/bin/security-audit'` and writes `server-audit/readyidc/<YYYY-MM-DD>.md` (line 1 = verdict 🟢/🔴) |
| Staging copies | The install files were staged in `/home/deploy/audit-stage/`; the source of truth is the installed script |

Rollback: `sudo rm /etc/sudoers.d/security-audit /usr/local/bin/security-audit && sudo apt-get purge clamav clamav-freshclam rkhunter`.

**Audit baseline (2026-10-31 15:58, `server-audit/readyidc/2026-10-31.md`, 🟢):**
- **One run takes about 7.5 min** (455 s; ClamAV loading signatures takes most of it). RAM stays fine with 6 GB and no swap.
- **Known login IPs** (with recorded keys only): owner's Mac `202.129.207.248`; Otto's Windows PC `223.24.171.7`. Both may be dynamic: a new IP **with a known key** = 🟡 note; an unknown key = 🔴.
- **Known rkhunter false positives** (do not raise 🔴): `PermitRootLogin has not been set` (rkhunter does not read `sshd_config.d/`, and the effective value is `no`); hidden files `/etc/.resolv.conf.systemd-resolved.bak` and `/etc/.updated`. The `clamav` user/group "added" warnings were one-time (install day).
- **Found, not changed:** `/root/.ssh/authorized_keys` contains the owner's Mac key (`entronica@Mac.localdomain`), probably injected by the ReadyIDC rebuild. It is not usable while `permitrootlogin no`; it is not in the handbook. The owner decides whether to remove it.
- **Observation:** 788 failed SSH attempts in 24 h (scanners). With keys-only auth, most bots end at `Connection closed by authenticating user … [preauth]`, which fail2ban's default `normal` mode may not count. They cannot get in either way; this is log noise only. Making fail2ban count them means `mode = aggressive` in `jail.local`, which needs the owner's go.
- `deploy` cannot read the system journal (it is not in `adm` or `systemd-journal`). Only the audit script (root) sees the ssh log.
- **2026-10-31 16:45 — Build step 4 done (scripts + sudoers).** The owner ran one sudo install, which printed `PLATFORM-INSTALL-OK`.
  - **`/usr/local/bin/new-app`** (root 755): `new-app <name> <static|process> [--host <one-label>.develyst.online] [--start "<cmd>"] [--health </path>]`.
    - **Validation:** every argument is checked. Values containing a newline are refused before the pattern check. Name `^[a-z0-9-]{2,40}$`. Host is one label under `develyst.online` only (the wildcard cert covers one level). `--start` allows letters, digits, space and `. _ / = : -`. `--health` must be `/path`. Tested before install: bad name, bad type, two-level host, foreign host, `;`, `$( )`, newline in each value and unknown flags were all refused.
    - **Creates:** `/srv/apps/<name>/{releases,shared/.env(600)}` owned by deploy; `app.conf` with TYPE/HOST/PORT/HEALTH; for `process`, `ecosystem.config.cjs` (the file **must** be named `*.config.cjs`, or pm2 ignores it); `/etc/nginx/sites-available/<name>.conf` plus its `sites-enabled` link.
    - **nginx:** 80 → 301 to https; 443 uses `snippets/cloudflare-origin-tls.conf` and `http2`; `process` proxies to `127.0.0.1:<port>`; `static` serves from `current` with SPA fallback.
    - **Safety:** runs `nginx -t` and removes the site again if the test fails.
    - **Ports:** reserved under a `flock` in **`/srv/apps/ports.tsv`** (name TAB port), from 3001 up; ports already listening are skipped.
  - **`/usr/local/bin/deploy-app`** (root 755, run as deploy, no sudo): `deploy-app <name> <artifact.tgz>`.
    - **Before it starts:** needs ≥ 2 GB free and takes a per-app lock.
    - **Release:** extracted into `releases/<UTC ts>`; `.env` → `../../shared/.env`; atomic `current` switch; then `pm2 reload --update-env`, or `pm2 start` the first time.
    - **Health check:** status < 500 at `127.0.0.1:<port><health>` within 30 s; a static app only needs `index.html`.
    - **On a failed check:** switches back to the previous release and deletes the failed one.
    - **After a deploy:** keeps current + previous, then `pm2 save`.
    - **Tested end to end** before install (in a temp folder, port 3998, removed afterwards): v1 ok → v2 ok (`.env` readable through the symlink) → v3 crashing → rolled back to v2, exit 1, the failed release deleted → v4 ok, 2 releases kept.
    - **pm2 picks up the new release:** shown separately with a throwaway app — switching the `current` symlink and running `pm2 reload` serves the new release.
  - **`/etc/sudoers.d/deploy-platform`** (root 440): deploy NOPASSWD **only** `/usr/local/bin/new-app`, `/usr/sbin/nginx -t`, `/usr/bin/systemctl reload nginx`. `visudo` checked it before and after install.
    - Proven as deploy: `new-app --help` and `nginx -t` work; `systemctl reload nginx` works; `ls /root`, `systemctl restart nginx` and the audit script with an extra argument are refused; `new-app ../x` is refused; deploy cannot write to `new-app`.
  - **Apps get no env from pm2** apart from `NODE_ENV=production`, `PORT` and `HOSTNAME=127.0.0.1`. Secrets come only from `.env` in the working directory: Bun loads it automatically. **Whether Next.js standalone reads `.env` at runtime is not yet proven** — check this with the pilot (step 6).
  - Byte-for-byte copies of every installed file: `server-platform/readyidc/` (README maps each one to its path). Staging folders in `/home/deploy` are deleted.
  - **Rollback:** `sudo rm /etc/sudoers.d/deploy-platform /usr/local/bin/new-app /usr/local/bin/deploy-app` (`/srv/apps` is empty apart from `ports.tsv`).
  - **Routine work now needs no owner password:** new-app, deploy-app, the nginx test and reload, and the security audit. Changes to the system itself (packages, firewall, sshd, sudoers, swap) still need it.
- **2026-10-31 ~16:50 — Build step 5 pre-check (read-only, from the Windows PC): `develyst.online` still has LIVE hosts on OTHER origins.**
  - **No wildcard yet:** a random name (`zz-probe-<ts>.develyst.online`) returns NXDOMAIN.
  - **Live through Cloudflare** (explicit, proxied records):

    | Via Cloudflare | Hosts |
    |---|---|
    | 200 | apex `develyst.online`, `www`, `ai`, `dte`, `offml`, `fangfangshop`, `portfolio`, `punkubfang` |
    | 307 | `som`, `learning` |
    | 502 | `ong`, `backoffice-som` |

  - **NXDOMAIN (no record):** `chipint`, `tocktest`, `jari`, `knowcode`, `orenge`, `wi-store`, `line-oa`, `klang`, `possibility`, `roommade`.
  - **The old Windows box (154.197.124.206) is still serving** `ai`, `dte`, `som`, `learning`, `offml`, `fangfangshop`, `portfolio` and `punkubfang` (probed with `--resolve`; each has a valid Let's Encrypt cert, expiring 2026-11-21 to 2026-12-25). The apex and `www` give 502 on the Windows box but 200 through Cloudflare, so they are served by some other origin (unknown).
  - **This contradicts "only the Linux box is in use"** (owner, earlier today), so it was raised with the owner. Otto does nothing on the Windows box. It matters here only because Cloudflare zone settings reach those hosts.
  - **Consequence for step 5:**
    - The wildcard `*` is safe: every live host has its own record, and explicit records win.
    - The zone SSL mode must **not** be flipped blind; read the current mode first. The Let's Encrypt certs would pass Full (strict) today, but `som`'s cert expires 2026-11-21 and auto-renews only if win-acme still runs there.
- **2026-10-31 ~16:55 — Build step 5 done (DNS).**
  - **Wildcard record:** the owner added `A * 43.228.86.89` (proxied) on `develyst.online`.
    - Check: a random name `zz-probe-<ts>.develyst.online` now resolves to Cloudflare (`104.21.25.137` and IPv6) and returns **525**. That is correct: no app claims the name, so the origin's `default_server` rejects the TLS handshake (`ssl_reject_handshake`).
    - Existing hosts are unchanged after the record: `som` 307, `ai` 200, `portfolio` 200, apex 200.
  - **Zone SSL mode was read, not changed: `Full`** (automatic mode disabled ~315 days ago).
    - Full encrypts Cloudflare→origin but does **not** validate the origin cert. The Origin Certificate on this box works under it, so **no SSL change was needed**.
    - Optional hardening, for later and only with the owner's go: a Cloudflare **Configuration Rule** setting Full (strict) for this box's hostnames only. Do not change the zone-wide mode while other origins serve live hosts.
- **2026-10-31 ~17:00 — Otto's own mess, cleaned up.**
  - **What happened:** an earlier test used a config file named `eco.cjs`. pm2 does not recognise that name as a config, so it ran the file as an app called `eco`. This happened twice (ids 1 and 2, ~68 MB each, about 70 min). A later `pm2 save`, from the deploy-app test, put both into the boot dump.
  - **Fixed:** both deleted and `pm2 save --force` run. pm2 now holds only `pm2-logrotate`, the dump holds no apps, and no `/tmp/tmp.*` test folders are left.
  - **Lesson:** after every throwaway pm2 test, run `pm2 list`, not only `pm2 list | grep <name>`.
- **2026-10-31 17:00 — resources** (owner asked): 4 vCPU, load 0.10, CPU 98 % idle; RAM 5.8 Gi, 575 Mi used, 5.2 Gi available; swap none; disk `/` 58 G, 3.6 G used (7 %), 54 G free; up 2 h 16 m.
- **2026-10-31 ~17:10 — Pilot candidate surveyed (read-only): `blueprint-front` + `blueprint-back`.** These are the i-space desk's Team A repos (paths in `machine.local.md`; branch `nichaphon`, also on GitHub). REQ-127 made them deploy-ready today: front commit `fbf3424`, back commit `d8df886`.
  - **Front:** Next 16 standalone; `build` copies static/public in. At runtime it reads `BLUEPRINT_API_URL` on the server side (default `http://127.0.0.1:4200`) and `CAW_URL`. PDF export launches **Chrome via playwright-core**, which is **not on this box**, so export will fail there until Chrome is installed (owner's call).
  - **Back:** a Bun binary compiled with `--target=bun-linux-x64`. It reads `DATABASE_URL` (Postgres URL, or `pglite:memory` = in-memory, lost on restart), `PORT`, `HOST` (default 127.0.0.1), `SOURCES_DIR` (default `./data/sources`, **relative to cwd = the release folder, so it is lost on each deploy**; set it to `/srv/apps/<name>/shared/sources`), `GATEWAY_URL`, `GATEWAY_LIGHT_MODEL` and `CAW_NOTIFY_URL`.
  - **The back has no authentication at all.** It must **not** get a public hostname. Only the front calls it, server-side, over `127.0.0.1`.
  - **`new-app` today always creates a public nginx site,** so a private back needs a new `--private` option (re-install = one owner sudo).
  - **REQ-127 AC-4 is still open** ("pglite in the compiled binary on Linux", NOT_TESTED, *"settles on the owner's first server run"*). The pilot will settle it.
  - **Tooling on the Windows PC:** bun 1.3.14 and node 22 are installed.
- **2026-10-31 ~19:00 — Cloudflare Access protects the pilot front (owner's decision instead of an app login).**
  - **Why:** the owner suggested asking the desk for a quick temporary login. Otto recommended Access instead (no code change, the team keeps working, stronger), and the owner agreed: *"โอเคนะ"*.
  - **Setup:** the owner set up Zero Trust **Free**, team **`aged-fire-690b`** (login domain `aged-fire-690b.cloudflareaccess.com`). Self-hosted app **`blueprint-sit`** → `blueprint-sit.develyst.online`; policy **`owner only`** (Allow, Include: the owner's email); login by one-time PIN; session 24 h.
  - **Check:** `curl https://blueprint-sit.develyst.online/` returns **302 to the Access login**. A random host still returns 525; `som` returns 307, unchanged.
  - **Every new public app on this box needs its own Access app,** or the same policy added to it, until it has a real login. Cloudflare checks the policy before traffic reaches the box.
- **2026-10-31 ~19:10 — Pilot, first try: `blueprint-back-sit` failed at its DB start.** Otto's mistakes along the way, then the result.
  - **Wrong turn 1, reverted:** Otto first cloned both repos into his scratch and started `bun install` + `build` there. The owner stopped it: *"เราสามารถ ทำการ build ที่ codebase จริงๆ ได้ ไม่ต้องไป clone ให้เครื่องหนัก"*. The team checkout already held today's REQ-127 builds (18:23). The clones were deleted and their processes stopped.
  - **Rule from now on:** use the build already in the codebase. **Look before building.**
  - **Artifacts:** packed read-only from the team checkout; `git status` stays clean.
    - back = `dist/blueprint-back` (ELF x86-64, 95 MB). The tar needs `--mode=755`: files tarred on Windows carry no exec bit.
    - front = `.next/standalone` (46 MB). It contains `@img/sharp-win32-x64` (Windows-native sharp), so next/image optimisation would fail on Linux. A Linux build (CI) fixes that. Its `server.js` embeds `outputFileTracingRoot: H:\ispace\blueprint-front`.
  - `new-app` was updated with **`--private`** (process apps only, no nginx site, loopback only). The owner ran one sudo; backups are `/usr/local/bin/{new-app,deploy-app}.bak-20261031-1158`.
  - **Apps created** (ports in `ports.tsv`): `blueprint-back-sit` 3001, PRIVATE, health `/health`, start `./blueprint-back`; `blueprint-sit` 3002, public, behind Cloudflare Access.
  - **`.env`** (no secrets): back `DATABASE_URL=pglite:memory`, `SOURCES_DIR=/srv/apps/blueprint-back-sit/shared/sources`; front `BLUEPRINT_API_URL=http://127.0.0.1:3001`.
  - **Result:** `deploy-app blueprint-back-sit` gave **health 000 after 30 s**. The binary **does start on Linux** (`Bun v1.3.14 (Linux x64)`), then dies: `Can't find meta/_journal.json`. The drizzle migrations are not inside the compiled binary.
  - **Wrong turn 2:** this was **already documented by the team**, TASK-173 line 18: *"The binary needs a Postgres DATABASE_URL; pglite:memory crashes it (P2) and that is expected"*. Otto's `pglite:memory` advice was wrong because he had not read SPEC-127 / TASK-173 first.
  - **Now:** the process is **stopped** after 16 pm2 restarts. Release `20261031-121107` is kept. `pm2 save` was not run, so the boot dump stays empty.
  - **Blocker:** the back needs a real Postgres. Decision S2.4 #13 says no DB on this box; the owner picks the DB.
- **2026-10-31 ~19:20 — PILOT LIVE (manual first deploy, no CI yet).**
  - **DB:** the team's own `blueprint-back/.env` points at Postgres **`154.197.124.206:5432`**, the old Windows box. That port **is reachable from this box** (and from the internet, which is a risk on that box; Otto does not touch it).
  - **`.env`:** the owner said *"ก็อปไปทั้ง env เลยสิ"*. The whole back `.env` (keys `DATABASE_URL`, empty `PORT`) was piped straight into `/srv/apps/blueprint-back-sit/shared/.env` (600, deploy), with `SOURCES_DIR` appended. **No value was printed anywhere.**
  - **The pilot shares the team's dev database:** data made on sit lands in the team's DB.
  - **`blueprint-back-sit`:** release `20261031-121700`. `/health` → `{"ok":true}` 200; **`GET /v1/projects` (reads the DB) → 200**. That is **REQ-127 AC-4 proven on Linux** (the compiled binary answers a DB route). ~96 MB RAM. Kept previous release `20261031-121107` (the failed pglite one).
  - **`blueprint-sit`** (front): release `20261031-121712`. Loopback `/` → 200; CSS `/_next/static/...css` → 200; public `https://blueprint-sit.develyst.online` → **302 to the Cloudflare Access login**. ~192 MB RAM.
  - **pm2:** both apps were saved by deploy-app. RAM now 830 Mi used, 5.0 Gi available.
  - **Not verified:**
    - the full page in a browser after login (the owner will try it);
    - image optimisation, since sharp in the bundle is win32;
    - PDF export (no Chrome on the box);
    - a deliberately broken deploy rolling back on these real apps (it was proven only on the throwaway test app);
    - boot resurrect with real apps in the dump.
  - Otto's mistakes today: **`OTTO-FAILURES.md`** OF-001…007. Fix requested from Atlas: `REQUEST-otto-to-atlas-2026-10-31-fix-otto.md`.
- **2026-10-31 ~19:25 — owner confirmed in his browser:** `https://blueprint-sit.develyst.online` opens after the Access login (*"เปิดได้"*). The path browser → Cloudflare Access → origin cert → nginx → front → private back → Postgres works end to end. Still not done in S2.6 step 6: CI (GitHub Actions on `sit`) and a broken-push auto-rollback on these real apps. Step 7 (handbook update) is open too.
- **2026-10-31 ~21:10 — CI set-up (S2.6 step 6, CI part). No root needed.**
  - **Owner's answers:**
    - (1) Otto writes the workflow files; **the owner commits and pushes them himself.** The desk may not (owner 2026-10-30 23:31: *"เรื่องฝั่ง deployment ไม่ต้องแตะอะไรเลย"*). Answer: *"2ข้อ ตามนั้น"*.
    - (2) `sit` is cut from **`nichaphon`**, the only branch with REQ-127's build commits.
    - (3) a CI-only key, restricted to deploy. Answer: *"ก็โอเคนะ"*.
    - Owner's question: does a merge from the Mac work too? Yes. CI runs on GitHub on any push to `sit`, wherever it comes from.
  - **CI key:** ED25519 `SHA256:pdr7Rgc6We2xXJ3H1YuuPnszrbpeP5TJ51k4XIvVUk0`, comment `github-ci@blueprint-2026-10-31`, line 3 of `/home/deploy/.ssh/authorized_keys`: `command="/home/deploy/.local/bin/ci-deploy",restrict …`. Backup: `authorized_keys.bak-20261031-1407`. **Revoke** = delete the line ending `github-ci@blueprint-2026-10-31`.
  - **`/home/deploy/.local/bin/ci-deploy`** (copy in `server-platform/readyidc/ci-deploy`): the forced command.
    - Takes the app name from `SSH_ORIGINAL_COMMAND` (regex, and the app must exist), reads the artifact from stdin into `~/ci-incoming` (500 MB cap), runs `deploy-app`, and always deletes the temp file.
    - **Proven with the CI key from the PC:** `id` → refused ("no app id"); `cat /etc/passwd` → refused; `nope-app` → refused; `blueprint-sit < blueprint-front.tgz` → deployed release `20261031-140825`, health 200. `~/ci-incoming` is empty afterwards.
  - **Workflow files** (new, untracked, nothing else touched): `.github/workflows/deploy-sit.yml` in both repos (paths in `machine.local.md`). On push to `sit`, or a manual run: setup-bun latest → `bun install --frozen-lockfile` → `typecheck`/`lint` if present → `build` → tar → `ssh deploy@43.228.86.89 <app> < app.tgz`. Back tars `dist/blueprint-back` with `--mode=755`; front tars `.next/standalone`, built on Linux, so sharp is the Linux one.
  - **Repo secrets for the owner to add:** `DEPLOY_SSH_KEY` (the private key) and `DEPLOY_KNOWN_HOSTS` (the server's host-key line). They are staged in `C:\Users\KUYDONG\ci-secrets\` (that user only) and **must be deleted after he adds them.**
  - **Risk to watch:** `--frozen-lockfile` with bun latest may refuse the v2 lock, as bun 1.3.14 on the PC did (REQ-127 R2/R6). If the first run fails there, decide with the owner: pin the bun version Atom's box uses, or drop `--frozen-lockfile`.
  - Otto ran `git fetch` (read-only, remote-tracking refs only) in both team checkouts to see the branches.
- **2026-10-31 ~21:33 — CI LIVE for both pilot apps (S2.6 step 6 done, except a real broken-push test).**
  - **Commits:** the owner committed and pushed the workflows himself: back `14a9201`, front `65e2ec2`. `sit` was created from `nichaphon` with `git push origin nichaphon nichaphon:sit`.
  - **Gotcha 1 — no run on the first push:** GitHub registered **no run** for the push that created `sit`; the workflow stayed unknown, its page 404. Pushing an **empty commit** to `sit` made it fire: back `39d5c88`, front `1abf14b`. If a new repo's first `sit` push shows nothing under Actions, do that.
  - **Gotcha 2 — the secrets were missing:** the owner had pushed before adding them. Back run 1 failed with `No ED25519 host key is known … Host key verification failed` (exit 255). That is the safe behaviour: nothing reached the server. After the owner added both secrets in both repos, the re-run went green.
  - **Back:** run `41209638571` attempt 2 **success** (~32 s), release `20261031-142926`, `/health` ok, `/v1/projects` 200. `bun install --frozen-lockfile` with bun latest **passed** on the Linux runner; the lock problem was only the Windows PC's bun.
  - **Front:** run `41210487765` **success** (~75 s), release `20261031-143204`, loopback 200, public 302 → Access. Built on Linux, so `node_modules/@img/sharp-linux-x64` and the libvips packages are present, which fixes the win32-sharp issue of the manual deploy.
  - **Repos are PUBLIC** (`develyst1/blueprint-front`, `develyst1/blueprint-back`). The secrets are safe; the code and the workflow are readable by anyone. The owner was told.
  - **Clean-up proof:**
    - Removed: the CI key copies and secret files on the PC (`C:\Users\KUYDONG\ci-secrets\` is empty; the folder itself was busy, probably open in Explorer); the local `artifacts/`; `/tmp/blueprint-{back,front}.tgz` on the server. `~/ci-incoming` is empty.
    - pm2 holds 3 entries (2 apps + logrotate), and the dump holds `blueprint-back-sit` and `blueprint-sit`.
  - **The deploy loop from now on:** merge into `sit` and push, from any machine; GitHub builds and the server health-checks and rolls back by itself.
  - **Still open:**
    - (a) a real broken push showing the auto-rollback on these apps;
    - (b) a reboot with real apps in the dump (needs the owner's sudo);
    - (c) S2.6 step 7, the handbook;
    - (d) actions/checkout@v4 warns about Node 20 deprecation, so bump to a newer major later.
- **2026-10-31 ~21:43 — Auto-rollback proven on a real app** (owner: *"ลองก็ ลอง"*).
  - **Test:** a fake `blueprint-back` (a 3-line sh script that exits 1) was packed like a real build, sent with Otto's key, and run through `deploy-app blueprint-back-sit` — the same step the CI door calls.
  - **Why not the CI key:** its PC copy was deleted at clean-up; the door itself was proven at 14:08.
  - **Why not a real push through CI:** that would put broken code on the desk's `sit` branch and need a revert. The server's behaviour is the same either way.
  - **Before:** `current → releases/20261031-142926`, health ok.
  - **Run:** `health: last status 000 after 30s` → `health check FAILED, rolling back to releases/20261031-142926` → `health: 200 after 1s` → exit 1, which a CI run shows as red.
  - **After:** `current → releases/20261031-142926`, `/health` ok, `/v1/projects` 200. The failed release was deleted; kept `20261031-121700` and `20261031-142926`.
  - **Downtime:** the back was down for about 30 s during the test.
  - **Clean-up:** the local fake package and the server's `/tmp/otto-broken-test.tgz` were removed.
- **2026-10-31 ~22:05 — `bun test` added to the back CI. Its first run proved that CI blocks a bad build.**
  - **Changes:** owner commit `b6b7bd8` added `bun test` (env `DATABASE_URL=pglite:memory`).
  - **Run `41211570320`:** 8 min; **330 pass, 16 skip, 5 fail**. Every visible failure reads `this test timed out after 5000ms` (each took ~6 s; bun's default limit is 5 s). Build, tar and **deploy were skipped**, and the server stayed on `20261031-142926`, healthy.
    - This is the first real-path proof that CI stops a bad change.
    - Whether the 5 are only slow on the runner, or a real problem, is **not settled**; the desk would have to say.
  - **Owner's choice (*"ตามนั้น"*):** raise the CI limit to `bun test --timeout 20000`. That is a workflow-only change, not the desk's code. Sending the 5 slow tests to the i-space desk stays the owner's call: the desk is off-limits for deployment work.
  - **Gotcha:** unauthenticated GitHub API = **60 calls/hour per IP**. Otto ran out while watching run `41211570320` (reset 22:12). Poll every 60 s or slower, or ask the owner to look in his browser.
- **2026-10-31 ~22:15 — Back CI green with tests.** Owner commit `4fd6e50` (`bun test --timeout 20000`). About 9 min after the push, the server switched to release **`20261031-150429`**: `/health` ok, `/v1/projects` 200; it keeps `20261031-142926` as the previous release. The deploy step runs only after `bun test`, so the tests passed with the 20 s limit. The back pipeline is now install → tests → build → deploy → server health-check / auto-rollback.
  - **Front CI still has no tests.** The Playwright specs need a browser and a running back, so that is a separate piece of work.
  - **A full back run takes ~9 min**, most of it the tests.
- **2026-10-31 ~22:16 — Front CI now runs the Playwright isolation spec** (owner: *"เอาแค่ isolation"*).
  - **Changes:** owner commit `34dd9cb` put `bun run test:isolation` after `build` and before deploy.
  - **Run `41213932255`:** success, about 80 s in total; the isolation step itself took **8 s** (15:15:51 → 15:15:59 UTC). Otto has **not seen the step's log** (it needs a GitHub login), so the number of tests that actually ran is unverified: confirm it says passed, not 0 tests.
  - **Result:** release `20261031-151610`, loopback 200, public 302 → Access. `/dev/isolation/none` gives 404 on the server, as it should: dev pages are off in production.
  - **Not in CI yet:** `test:states` and `test:required`. Both need blueprint-back's source checked out beside the front (they start it on pglite: 4298, or 4299 for required).
- **2026-10-31 ~22:42 — Front isolation step VERIFIED from its log** (owner's screenshot of run `41213932255`).
  - **Result:** "Running 4 tests using 1 worker" → **4 passed (7.4 s)**. The core made 1152 property comparisons and the libraries 384, with 0 differences; 3 library buttons were checked, 0 unstyled. The step is real, not a 0-test pass.
  - **Note:** Playwright's webServer runs `next start`, which warns that it *"does not work with output: standalone; use node .next/standalone/server.js"*. The spec therefore tests the build through `next start`, not through the exact `server.js` that runs on the box. It works today. Changing it is the desk's config (`playwright.config.ts`), not CI's.
- **2026-10-31 ~22:45 — Owner: *"เทส พอแค่นี้แหละ"*.** The CI tests stay as they are: back = `bun test --timeout 20000`, front = `test:isolation`. `test:states` and `test:required` are **not** to be added unless the owner asks again.
- **2026-10-31 ~23:52 — One root sitting, 3 steps, 1 password** (platform-preflight gate 4). Script `root-batch.sh`, staged, shown, then deleted.
  - **Owner's answers:**
    - swap: *"ลองดูก่อน"*. Otto measured: blueprint front 157 MB + back 66 MB; pm2 + logrotate 167 MB; total 747 MB used of 5.9 GB, 5.1 GB available, disk 4 G / 58 G. **No swap for now.**
    - root's Mac key: *"ลบเลยก็ได้"*.
    - fail2ban aggressive: *"แบนแม่งเลย"*.
  - **Done:**
    - (1) `/root/.ssh/authorized_keys` → **0 keys**; backup `authorized_keys.bak-<ts>` beside it.
    - (2) `/etc/fail2ban/jail.local` gets **`mode = aggressive`** under `[sshd]`; `fail2ban-client -t` passed and fail2ban restarted. **1 IP banned within seconds.** Backup `jail.local.bak-<ts>`. Copy in `server-platform/readyidc/jail.local`? Not copied; the content is in the handbook and below.
    - (3) Reboot.
  - **Boot with real apps PROVEN:** new boot `2026-10-31 16:51:42` UTC. `pm2-deploy`, nginx, fail2ban, ssh and ufw are all active. **`blueprint-back-sit` and `blueprint-sit` came back by themselves from the pm2 dump:** back `/health` ok, `/v1/projects` 200; front 200; public 302 → Access.
  - **The owner's plan for SSH access:** this Windows PC and Atom's box (Grok bot). **Atom has no key yet.** Adding one is a separate order. Deploys need no personal key: the CI key does it.
- **2026-10-31 — S2.6 step 7 done:** the server handbook was rewritten to match what was built, at **`server-platform/readyidc/readyidc-vps.md`** (no secrets). The owner should copy it over `~/Documents/servers/readyidc-vps.md` on the Mac.
- **2026-10-31 — The handbook lives in the workspace only.** Owner: *"คู่มือ ไม่ต้องใช้แล้ว จดไว้ที่นายนี่แหละ"*. **`server-platform/readyidc/readyidc-vps.md`** is the handbook; the Mac copy is retired. Keep it current whenever the box changes, next to SERVER-FACTS.
- **2026-11-01 ~00:15 — Full security review (read-only): `server-platform/readyidc/SECURITY-REVIEW-2026-11-01.md`.** It has the timeline since purchase, the good baseline, 13 gaps and a new-server recipe.
  - **🔴 Cloudflare Access can be bypassed:** `curl --resolve blueprint-sit.develyst.online:443:43.228.86.89` returns **200 Blueprint with no login**, because 80/443 accept any source. The fix (owner's go) is UFW 80/443 from Cloudflare IP ranges only.
  - **🟡 Otto's PC is banned on :22 by fail2ban aggressive** (OF-010). The PC's public IP is now `223.24.156.113` and it is **dynamic** (it was `223.24.171.7`). Ping and 443 still work. The ban expires after 1 h, or the owner unbans it from the Mac or the panel: `sudo fail2ban-client set sshd unbanip <ip>`.
  - Also found: the provider's `99-custom.conf` is still on disk; `X11Forwarding yes`; **the clock is not NTP-synced**; there is no automatic reboot for kernel fixes; several unused root services are enabled; there are no backups of the `.env` files; the **Windows box's Postgres :5432 is open to the internet**.
- **2026-11-01 ~00:40 — Gap 1 FIXED: the Cloudflare-Access bypass is closed** (owner: *"แก้เลย"*; one sudo sitting).
  - **Script:** `server-platform/readyidc/ufw-cloudflare-only.sh` (the server copy was deleted after the run). It first added `allow proto tcp from <range> to any port 80,443` (comment `cloudflare`) for the **15 IPv4 and 7 IPv6 Cloudflare ranges** (from cloudflare.com/ips-v4 and /ips-v6, 2026-11-01), then removed `80/tcp` and `443/tcp` from Anywhere (v4 + v6). **22/tcp from Anywhere is unchanged.** Output: `UFW-CLOUDFLARE-OK`.
  - **Proof:** direct `curl --resolve blueprint-sit.develyst.online:443:43.228.86.89` → **000, timeout (blocked)**; via Cloudflare → **302 to the Access login**; SSH ok; front loopback 200.
  - **Expect in the next daily audit:** the hashes of `/etc/ufw/user.rules` and `user6.rules` changed. That is this recorded change, not tampering.
  - **To do:** re-check the Cloudflare ranges monthly. A new Cloudflare range missing from UFW would make some visitors fail to connect (not a security hole).
  - **Rollback:** `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`, then delete the `cloudflare` rules.
- **2026-11-01 ~00:45 local (17:44 UTC) — Hardening sitting: review gaps 2, 3, 4, 7, 8 FIXED; gap 5 (clock) NOT fixed.** Owner: *"ทำเลย ขอให้ทำอย่างรอบคอบ"*. One sudo run of `harden.sh` (copies of all files in `server-platform/readyidc/`). Backups in **`/root/otto-backup-20261031-1744/`**.
  - **fail2ban:** `ignoreip = 127.0.0.1/8 ::1 223.24.156.113 202.129.207.248` (PC and Mac, both **dynamic**; update them when they change). Mode stays aggressive. Step 0 found **no** log lines for 223.24.x, so the cause of the 10-31 ban is still unknown.
  - **SSH:** the provider's `99-custom.conf` was **removed**. `00-hardening.conf` now sets `AllowUsers deploy`, `MaxAuthTries 3`, `LoginGraceTime 30`, and `X11Forwarding`/`AllowTcpForwarding`/`AllowAgentForwarding` `no`. `sshd -t` passed; `sshd -T` shows every value.
    - **Proven:** a new login works; a `-L` tunnel is refused (`administratively prohibited`).
    - **Dead-man guard** `otto-ssh-guard-20261031-1744` (fires 17:55 UTC): it reverts unless `~/.ssh-guard-ok` exists. Confirmed in time (see OF-011 for the near-miss).
  - **Clock:** `ptp_kvm` loads and `/dev/ptp0` exists; `/etc/modules-load.d/ptp_kvm.conf` is persisted. But chrony **failed to start** with `refclock PHC /dev/ptp0 poll 2 stratum 2`, so the script **restored the old chrony.conf** and chrony is active, still unsynced.
    - The clock is right today (kvm-clock matches the PC to the second).
    - **Open:** find why chrony refused the PHC refclock (probably its AppArmor profile or sandbox on /dev/ptp0). Outbound **UDP 123 is blocked** by the provider, while TCP 4460 (NTS-KE) is open.
  - **sysctl:** `/etc/sysctl.d/90-hardening.conf` sets `send_redirects=0`, `log_martians=1`, `suid_dumpable=0`.
  - **Services disabled** (not masked; `systemctl enable --now <unit>` brings one back): ModemManager, multipathd, udisks2, apport, snapd(+socket), lxd-installer.socket, iscsid.socket, open-iscsi, open-vm-tools. `qemu-guest-agent` is **untouched**, so the provider's panel features keep working.
  - **Post-check:** nginx, pm2-deploy, fail2ban, ufw and ssh active; back health ok; front 200; public 302; `sudo -n new-app` works.
  - **Next audit will show:** changed hashes for `/etc/ssh/sshd_config.d/*` (99-custom gone), `jail.local` and `/etc/sysctl.d`, plus fewer enabled units. All of these are this recorded change.
  - **Still open from the review:** gap 5 (clock), gap 6 (auto-reboot), gap 9 (backups), gap 11 (strict SSL rule), gap 10 (the Windows DB is the owner's call).
- **2026-10-31 17:56 UTC — The SSH guard fired and kept the hardening:** the timer is gone; `sshd_config.d` = `00-hardening.conf`, `50-cloud-init.conf`, `60-cloudimg-settings.conf` (no `99-custom.conf`); `AllowUsers deploy` and `AllowTcpForwarding no` are still in place. The confirmation flag was removed only after the guard ran.
- **2026-11-01 — Otto made ready for a cold start** (owner: *"อัปเกรดตัวเอง … ให้สามารถทำได้ แม้จะ restart session นายใหม่"*).
  - **OTTO.md:** a session-start order (charter, failures, handbook, machine.local, SERVER-FACTS for detail) and the task skills.
  - **New skill `platform-deploy-app`:** the next app onto the platform, step by step.
  - **Templates `server-platform/templates/deploy-sit.{bun-binary,next-standalone}.yml`:** the live blueprint workflows with `__APP__/__BINARY__/__SERVER__` placeholders.
  - **`machine.local.md` → "Otto":** this PC's SSH alias, key and dynamic-IP note.
  - **CI keys:** one per repo from now on. The blueprint CI key's private half exists only in GitHub, so it cannot be reused.
- **2026-11-01 — Cold-start test** (a fresh, read-only Otto agent planned "deploy CAW" and "new server" from the files alone).
  - **It found:** the start order, the skills, the templates, the `readyidc` alias, the new-key-per-repo rule, the Access-before-deploy step, and the two-sitting plan.
  - **Fixed after it:** stale pointers (OTTO.md S2.1–S2.9 → handbook; a current-state note under "# Server 2"); handbook stale lines (99-custom, AllowUsers/ignoreip, SSL mode, add-app steps → skill); who types git and the chain (skill); new-server sitting A as root via the Console, and "templates, not drop-ins" (skill).
  - **Open questions for when the owner orders CAW's deploy** (raised by the test, not decided):
    - (a) The CAW **runner** is a second process from source (`bun`, not on the box) and needs **Claude CLI with a subscription** on the box. `new-app` has no mode for a second process.
    - (b) Its `CLAUDE_BIN` and `CAW_WORKSPACE_ROOT` must be set so it never launches real runs by accident.
    - (c) caw repos: public or private? Existing workflows? Which branch becomes `sit`?
    - (d) The URLs between caw-back and blueprint-back-sit (`BLUEPRINT_URL`, `CAW_URL`).
    - (e) Its DB: blueprint's is on the old Windows box with :5432 open to the internet.

## S2.2c Audit baseline — intended changes since the 2026-10-31 baseline (do NOT raise 🔴 for these)

The scheduled audit (`otto-daily-security-audit`, 20:30) compares against `server-audit/readyidc/2026-10-31.md`. These differences are recorded, owner-approved changes:
- **Config hashes changed:**
  - `/etc/ufw/user.rules` and `user6.rules`: 80/443 now **only from Cloudflare ranges** (comment `cloudflare`), 22/tcp anywhere (2026-11-01).
  - `/etc/ssh/sshd_config.d/`: `99-custom.conf` **removed**; `00-hardening.conf` rewritten (`AllowUsers deploy`, no forwarding, `MaxAuthTries 3`, `LoginGraceTime 30`); `50-cloud-init.conf` and `60-cloudimg-settings.conf` unchanged.
  - `/etc/fail2ban/jail.local`: `ignoreip` + `mode = aggressive`.
  - New `/etc/sysctl.d/90-hardening.conf`, `/etc/modules-load.d/ptp_kvm.conf`.
  - `/root/.ssh/authorized_keys`: now empty (Mac key removed 10-31).
  - `/etc/nginx/sites-available/blueprint-sit.conf` + link (10-31).
- **Units no longer enabled:** ModemManager, multipathd, udisks2, apport, snapd(+socket), lxd-installer.socket, iscsid.socket, open-iscsi, open-vm-tools.
- **New keys** in `/home/deploy/.ssh/authorized_keys`: `github-ci@blueprint-2026-10-31` (forced command `ci-deploy`, 10-31). Expected total: 3 keys (Mac, Otto's PC, CI).
- **Listening (expected):** 22, 80, 443, 127.0.0.1:3001 (blueprint-back-sit), 127.0.0.1:3002 (blueprint-sit), local DNS 53, chrony 323.
- **Logins:** the PC's IP is dynamic (`223.24.171.7` → `223.24.156.113`). A known key from a new IP = 🟡 note, not 🔴.
- Anything **not** on this list, or not in a dated S2.9 entry, is still 🔴.
- **2026-11-01 — SSH off the public port: DEFERRED by the owner, to be raised again.** Owner: *"ยังดีกว่า แต่จำไว้ เอาไว้ นำเสนอ หรือ หาทางที่มันดีกว่านี้อีกมา ครั้งหน้า"*.
  - **Idea:** Tailscale (or Cloudflare Access/Tunnel for SSH) so port 22 is not public. That ends the scanner noise and the fail2ban self-lockouts.
  - **Cost:** CI needs a way in too (a Tailscale GitHub Action + auth key, or Cloudflare Access for SSH).
  - **Next time** (a new server, or the next security talk): present it again in ≤5 lines, **and compare at least one alternative** before recommending (e.g. Cloudflare Tunnel `cloudflared access ssh` + a service token for CI; WireGuard on the box; port-knocking is NOT acceptable).
- **2026-11-02 — corner-chat deploy request** (owner via Porter: *"ส่งรายละเอียดไปบอก otto หน่อยว่ามีแอป อยาก deploy"*; `REQUEST-porter-to-otto-2026-11-02-corner-chat-deploy.md`). Survey is read-only; nothing has changed on the box yet.
  - **Repos** (branch `D1`; private, since the GitHub API gives 404):
    - back `519ebf5`: Bun + Hono, already `bun build --compile` → `dist/corner-chat-back`; Bearer-session auth; the LINE webhook checks the HMAC signature. Migrations run only from `scripts/` (db-init / migrate), **not at start-up**.
    - front `2a90393`: Next standalone + copy script. `NEXT_PUBLIC_API_BASE_URL` is **baked in at build time**, so CI must set it.
    - app `21eb731`: Capacitor/Vite APK; `VITE_API_BASE` is baked in at build.
  - **Back tests need a real Postgres:** they create `corner_chat_test_r<pid>_…` DBs on the server in `DATABASE_URL`/`DATABASE_URL_TEST`.
  - **Outbound from this box:** `api.line.me:443` open; `ai.develyst.online:443` open; `154.197.124.206:5432` open; **`mail.entronica.in.th` (202.183.141.121): 993, 465, 587, 143, 25 and even 443 all BLOCKED**, while the owner's PC reaches 993/465 fine. So the mail host (or its network) refuses this box's IP. **The mail poller cannot work from here until `43.228.86.89` is allowed** (the owner or entronica IT).
  - **Capacity:** 5.1 GB RAM free, 53 G disk; the ports in use are 3001 and 3002.
- **2026-11-02 — corner-chat APK prep (Porter, TASK-041):**
  - **`VITE_FAKE` defaults to true**, so the release APK build must set `VITE_FAKE=false` together with `VITE_API_BASE=https://<api host>/api/v1`.
  - The repo now git-ignores `*.jks`.
  - The APK still waits on the owner's final API hostname and on where the signing key is kept.
- **2026-11-02 — mail block: it is NOT this box.** The owner asked *"ไม่ได้เป็นที่เราเหรอ นี่เครื่องที่บ้านฉันนะ ยังเข้าได้ปกติเลย ไม่ใช่เครื่องบริษัท"*. Read-only checks:
  - From this box: `imap.gmail.com:993`, `smtp.gmail.com:465`, `outlook.office365.com:993` are **open**; `mail.entronica.in.th:993/465` still **fail**; ping to 202.183.141.121 gets 0 replies.
  - Outbound policy here is `DEFAULT_OUTPUT_POLICY="ACCEPT"`; nothing in `/etc/ufw` or `/etc/fail2ban` names 202.183.x; the route is the normal gateway 43.228.86.1.
  - The owner's home PC (today `223.24.168.26`) reaches `202.183.141.121:993`.
  - **So the mail side (or its network) drops this box's IP** — likely an allow-list or a block on data-centre IPs. Fix is on the mail side: allow `43.228.86.89`.
  - **Note:** the PC's IP changed again (`223.24.156.113` → `223.24.168.26`); fail2ban `ignoreip` still holds the old one.
- **2026-11-02 — owner: park entronica, use an ordinary mailbox for now.** Owner: *"ปิดข้าม เรื่อง เมล entronica ไว้ก่อนแล้วกันทำให้ มันทำงานได้ แค่เมลธรรมดาก็ได้ ก่อน"*.
  - **No code change needed:** the back reads the mail host from env: `ZIMBRA_IMAP_HOST/PORT`, `ZIMBRA_SMTP_HOST/PORT` (`src/config.ts`, `origin/D1`). The server `.env` points them at an ordinary provider (e.g. Gmail `imap.gmail.com:993` / `smtp.gmail.com:465`, both reachable from this box).
  - **One host serves every user**, so each user's mailbox in the app must be on that provider.
  - **Gmail:** needs 2-Step Verification + an App Password per mailbox. Set `MAIL_APPEND_SENT=false`, because Gmail's SMTP already files sent mail (the code finds Sent by `\Sent`, so leaving it true would duplicate).
  - Waiting on the owner: which provider.
- **2026-11-02 — owner's mail is Outlook (personal); that cannot work with the app as built.**
  - **The network is fine:** from this box, `outlook.office365.com:993`, `smtp.office365.com:587` and `smtp-mail.outlook.com:587` are all open (587 = STARTTLS, which `connection.ts` requires on non-465 ports).
  - **Why it still fails:** Microsoft ended password (basic-auth) logins for IMAP/SMTP on personal Outlook/Hotmail accounts on 2024-09-16. App passwords are refused too, and only OAuth2 works. The app logs in to IMAP/SMTP with a stored password (`imapflow` with `password_enc`), so an Outlook mailbox would be refused at login.
  - **Options for the owner:**
    - (a) a Gmail mailbox with an App Password: env change only, works now;
    - (b) the desk adds Microsoft OAuth2 sign-in. That is code work, and it goes through Porter.
- **2026-11-02 — owner: incoming mail only for now** (*"ไม่เอา เอาแค่ขาเข้ามาก่อนก็ได้"*).
  - No env switch turns off outgoing: `app.ts:66` always starts the outbox. It sends only when a user presses reply (`POST /messages/:id/replies`), though, so "incoming only" just means not replying.
  - **Incoming still logs in to IMAP with a password,** so the Outlook limit applies to reading too. The mailbox choice stands: Gmail + App Password, or entronica once it allows `43.228.86.89`.
- **2026-11-02 — DECIDED: mail off on SIT for now** (owner: *"ปิดเมลไว้ก่อน"*). The server `.env` for the corner-chat back gets `MAIL_POLL_SECONDS=0`, so the poller does not start (`app.ts:65`). Tanya's SIT pass skips the mail poller. Revisit when entronica allows `43.228.86.89`, or the owner picks a Gmail box.
- **2026-11-02 — DECIDED: mail via forward** (owner: *"forward"*; replaces "mail off"). Incoming only (*"ฉันไม่เอาส่งออก ฉันเอา ขาเข้ามา เพื่อรับรู้ว่าใครทักมาจากไหนบ้าง"*).
  - **The owner** sets a forward in the entronica webmail (Zimbra) to one Gmail box. That Gmail box needs 2-Step Verification and an App Password. He connects it in the app himself; the password never passes through Otto.
  - **The server `.env` (corner-chat back):** `ZIMBRA_IMAP_HOST=imap.gmail.com`, `ZIMBRA_IMAP_PORT=993`, `ZIMBRA_SMTP_HOST=smtp.gmail.com`, `ZIMBRA_SMTP_PORT=465`, `MAIL_POLL_SECONDS=60`, `MAIL_APPEND_SENT=false`.
  - **To prove:** one test mail to the entronica address shows up in the app with the original sender (not the forwarder).
  - **Later:** when entronica allows `43.228.86.89`, switch the env back to `mail.entronica.in.th` and drop the forward.
- **2026-11-02 — DECIDED: hostnames** (owner: *"ตามนั้นก็ได้"*).
  - API `cornerchat-api-sit.develyst.online`: public, no Access, because LINE and the APK must reach it.
  - Admin web `cornerchat-sit.develyst.online`: behind Cloudflare Access (owner only).
  - APK `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`.
- **2026-11-02 — DECIDED: corner-chat uses the owner's Postgres without SSL for now** (owner: *"ใช้ไปก่อน"*). This is an accepted risk, the same as review gap 10: the DB password and the data cross the internet unencrypted between `43.228.86.89` and `154.197.124.206:5432`. Raise it again when the gaps are reviewed.
- **2026-11-02 — DECIDED: LINE on SIT = the test OA LifeStyle-Shop (@183qrfme)** (owner: *"ใช้ OA ทดสอบ"*).
  - Its channel secret/token go into the server `.env` only, plus `LINE_LIVE=1`.
  - After the first deploy, the owner sets the Webhook URL in the LINE console to `https://cornerchat-api-sit.develyst.online/api/v1/webhooks/line`.
- **2026-11-02 — DECIDED: corner-chat back CI runs no DB tests** (owner: *"ไม่ต่อ"*).
  - The workflow runs typecheck, lint and build only, and **no `bun test`**, because the tests need a real Postgres and the owner keeps the DB secret out of GitHub.
  - Gate 6 gap, said out loud: CI does not run the back's unit tests. The desk runs them locally against the dev DB.
- **2026-11-02 — DECIDED: APK signing key lives on the owner's PC + a backup off the PC** (owner: *"เครื่องนี้ + สำรอง"*).
  - On the PC: a folder **outside every repo**. Its path goes in `machine.local.md` only.
  - The off-PC backup (password manager or a private drive) is the owner's to make.
  - Never in git (`*.jks` is git-ignored).
- **All owner decisions for the first corner-chat SIT deploy are in** (2026-11-02): mail via forward to Gmail, hostnames, DB without SSL, the test LINE OA, CI without DB tests, the key location. Next: server `.env` source, then `new-app` ×2, Access, CI keys, workflows.
- **2026-11-02 — corner-chat apps created on the box** (owner: *"ก็อปไปเลย"* for the `.env`).
  - **`new-app`** (no password; both rc=0):
    - `cornerchat-api-sit`: process, `--start "./corner-chat-back"`, `--health /api/v1/health`, port **3003**, public;
    - `cornerchat-sit`: process, port **3004**, public, Access still to add.
  - Ports in `ports.tsv`: 3001–3004. nginx on the API returns 502 until the first deploy (expected).
  - **`shared/.env` for the back** (600, 32 lines, no duplicate keys, values never printed): the team's local `.env` piped in.
    These keys are replaced with server values: `PORT=3003`, `HOST=127.0.0.1`, `ADMIN_WEB_ORIGIN=https://cornerchat-sit.develyst.online`, Gmail IMAP/SMTP, `MAIL_APPEND_SENT=false`, `LLM_GATEWAY_URL=https://ai.develyst.online` (the local value was `localhost:3009`; prod per the `llm-gateway` skill, no key needed), `LINE_LIVE=1`.
    **`MAIL_POLL_SECONDS=0` for now** (see the next entry). `PG_LOCAL_*` and `TEST_MAIL_*` came along with the copy.
  - **`shared/.env` for the front:** comments only. The API URL is a build-time value set in CI.
- **2026-11-02 — OPEN: SIT and local dev share one database.** The back only accepts the DB name `corner_chat` (or `corner_chat_test_*`) (`src/config.ts:60-91`), so the SIT back and anyone's local back write the same rows.
  - **Mail:** the mail host is one global setting, so a SIT poller (Gmail) would try every mailbox in `mail_accounts`, including the team's entronica ones, and fail on them (writing `last_error`), and vice versa. So the poller stays at 0 until the owner decides.
  - **Options:**
    - (a) the desk lets the back accept a SIT DB name (small code change, through Porter);
    - (b) accept the sharing, and only one back polls mail at a time.
- **2026-11-02 — corner-chat release APK built** (Porter, TASK-041 DONE; `REQUEST-porter-to-otto-…` Follow-up 2).
  - `app-release.apk`, 3,361,589 bytes, SHA-256 `9816a1b5…8b96e3b`. It points at `https://cornerchat-api-sit.develyst.online/api/v1`.
  - Not handed out yet. Its install and sign-in are not yet proven, because the API is not deployed.
  - **Otto tells Porter when SIT is up; that starts the desk's release QA** (owner: *"เสร็จแล้วฝากส่งรายละเอียดให้ทีมเทสต่อด้วยนะ"*).
- **2026-11-02 — DECIDED: SIT shares the `corner_chat` DB with local dev** (owner: *"ใช้ร่วมกัน"*).
  - Only one back may poll mail at a time. The SIT poller stays at `MAIL_POLL_SECONDS=0` until the owner connects the Gmail box.
  - At that point Otto turns the SIT poller on, and the desk's local backs run with `MAIL_POLL_SECONDS=0`. Porter is told this with the "SIT is up" note.
- **2026-11-02 — corner-chat CI keys + workflows (Otto).**
  - **CI keys** (made in `C:\Users\KUYDONG\ci-secrets\`, ACL that user only; lines 4–5 of `/home/deploy/.ssh/authorized_keys`, forced command `ci-deploy`, `restrict`; backup `authorized_keys.bak-20261102-cornerchat`):
    - `github-ci@corner-chat-back-2026-11-02` `SHA256:68TQ31A/D81G8qLu0ogk6ZD57gtLkNVCtSHSKFGkwtU`;
    - `github-ci@corner-chat-front-2026-11-02` `SHA256:cqz8soO3fUos4ndjYxJdroQDqyw1hXK++bGPxwXkSD0`.
    - **Proven:** both are refused for `id` ("no app id") and `cat /etc/passwd` (usage). **Expected total now: 5 keys.**
    - **Revoke** = delete the line ending with that comment.
  - **Workflows written (not committed)**, `.github/workflows/deploy-sit.yml` in `corner-chat-back` and `corner-chat-front`:
    - **back:** `bun install` → `bunx tsc --noEmit` (the repo has no typecheck script; it passed locally at `519ebf5`) → build → deploy `cornerchat-api-sit`. **No tests and no lint** (no lint script; DB tests decided out).
    - **front:** `bun install` → typecheck → lint → build with `NEXT_PUBLIC_API_BASE_URL=https://cornerchat-api-sit.develyst.online/api/v1` → deploy `cornerchat-sit`. **No UI tests** (the repo has none).
  - **Remote `sit` exists in both repos** and is an ancestor of `D1`, so `git push origin D1:sit` fast-forwards (no force).
  - **Waiting on the owner:** the Access app for `cornerchat-sit.develyst.online` (before the front's first push), the two secrets per repo, then his git commands.
- **2026-11-02 23:13 — corner-chat SIT is UP** (both CI runs green after the owner fixed the secrets).
  - **Runs:** front run 41477535507 re-run (`94f3b1c`), back run 41479201958 (`4323ee1`).
  - **Releases:** `cornerchat-sit` `20261102-161151`, `cornerchat-api-sit` `20261102-161312`.
  - **On the box:**
    - both apps are online in pm2, ↺ 0 (api 56 MB, front 86 MB);
    - `/api/v1/health` → `{"ok":true,"db":true}`, which reads the DB;
    - front `/` → 307 (app redirect), and a `/_next/static` chunk → 200;
    - API log: `line: target=live`, "database connection is not encrypted" (accepted), and "Owner account created for owner@corner-chat.local".
  - **From outside:**
    - API `https://cornerchat-api-sit.develyst.online/api/v1/health` → 200;
    - the admin web via the IP directly times out (firewall OK);
    - 🔴 **the admin web `https://cornerchat-sit.develyst.online/` → 307 to `/users`, NOT to the Access login. So Cloudflare Access is NOT on it yet.** It is protected only by the app's own sign-in until the owner adds the Access app.
  - **Gate 6 gaps:**
    - back CI = tsc + build only; front CI = typecheck + lint + build. No tests.
    - Not yet done: a failing case pushed through CI, and a rollback proof, for these repos.
    - The health check catches a crash, not wrong behaviour.
  - **Open for QA:** Access is owner-only (email PIN), so Tanya's headless browser cannot pass it. A Cloudflare Access service token for QA is the usual fix; the owner decides.
- **2026-11-02 ~23:30 — Access ON for `cornerchat-sit`.** The owner made Access app `cornerchat-sit` (destination `cornerchat-sit.develyst.online`, policy `owner only`, self-hosted).
  - From outside, `/`, `/users` and `/_next/static/…` all → 302 to `aged-fire-690b.cloudflareaccess.com/…/login/cornerchat-sit.develyst.online`.
  - The API stays public: health → 200.
  - Closes the 🔴 in the 23:13 entry.
- **2026-11-02 ~23:55 — QA Access token for `cornerchat-sit`** (owner: *"ทำเลย"*).
  - **Token:** Cloudflare service token `corner-chat-qa` (1 year; expires around 2027-11-02, renew before then). The owner made it in the dashboard.
  - **Policy:** `qa service token` (Service Auth, Include = that token), order 2, after `owner only`.
  - **The values** sit in a private file on the PC; its path is in `machine.local.md` only. Otto never printed them. The harness did show the file to Otto's session once, by accident (diff notice). The owner was told and may rotate the token.
  - **Proven from outside:**
    - with the token headers: `/` → 307 (the app itself) and an unknown static file → 404 (the app);
    - without them: → 302 to the Access login;
    - before the app page's Save: → 403.
- **2026-11-02 — clean-up:** deleted the two corner-chat CI key files (private + `.pub`) from `C:\Users\KUYDONG\ci-secrets\`; their private halves now live only in the GitHub secrets. Left in that folder: `known_hosts.txt` (not secret) and `corner-chat-qa-token.txt` (the QA token, in use).
- **2026-11-02 — LINE webhook switched to SIT** (owner: *"เปลี่ยนเลย"*, then *"done"* after Update + Verify in the LINE console). The test OA LifeStyle-Shop now posts to `https://cornerchat-api-sit.develyst.online/api/v1/webhooks/line`.
  - **Checked from outside:** an unsigned POST → 401, and a bad `x-line-signature` → 401, so the route is live and the HMAC check works.
  - **Not seen by Otto:** LINE's own Verify call. nginx `access.log` is `www-data:adm 640`, and `deploy` is not in `adm`, so the log needs sudo. The app logs nothing per webhook.
  - **Gap:** a real LINE message showing up in the admin web is not proven yet. That is in QA's pass.
  - **Side effect:** the desk's local back no longer gets LINE events for this OA.
- **2026-11-03 00:3x — the owner signed in to the SIT admin web through Access + the app login** (`owner@corner-chat.local`). His screenshot shows the users page working, with QA's test users already there (`qa-sit-*`, 23:16–23:30). So QA has started.
  - The page's LINE number is "LINE messages **sent** in Nov 2569 = 0". That is outgoing quota, not received messages, so it cannot prove the owner's test message arrived.
  - **Inbound LINE stays unproven;** the check is the APK inbox in QA's pass.
- **2026-11-03 ~01:05 — SIT mail poller ON** (asked by Porter, Follow-up 3: the owner's entronica→Gmail forward is set; this is the step the owner's "forward / gmail" decision planned).
  - **Server `.env`:** `MAIL_POLL_SECONDS=0` → `60`, guarded by an exact-one-line match. Backup `.env.bak-20261103-mailon`. The Gmail IMAP/SMTP host and `MAIL_APPEND_SENT=false` were already set.
  - **Restart:** `pm2 restart --update-env`, then `pm2 save`. Online, ↺ 1 (this restart), health `{"ok":true,"db":true}`.
  - **After ~90 s (one poll):** no `mail:` lines in the log, so no failing mailbox row so far. The poller logs only failures.
  - **Not proven yet:** a forwarded mail showing up in the app. That waits for the owner to connect the Gmail box in the app, then QA TEST-006 row 10.
  - **Roll back:** set the line back to `0` and restart.
- **2026-11-10 — blueprint parked** (owner: *"ปิดแอปที่รันอยู่ตอนนี้ให้หน่อยดิ … บูปิน … ปิดทิ้งไว้หรือว่าลบออกไปเลยก็ได้ … ให้มันเบาลงพักไปก่อน"*; the SOM project will come with a deploy).
  - **Before:** 4 apps online: blueprint-back-sit 65 MB, blueprint-sit 165 MB, cornerchat-api-sit 95 MB, cornerchat-sit 100 MB. RAM used 1067 MB of 5919.
  - **Done:** `pm2 delete blueprint-sit blueprint-back-sit` + `pm2 save`. They are out of the pm2 list and the saved dump, so they stay off after a reboot. Used 888 MB after.
  - **Kept:** `/srv/apps/blueprint-*` (releases, `current`, `shared/.env`), the ports 3001/3002 in `ports.tsv`, the nginx site, the Access app, and the CI key.
  - **Bring back:** `pm2 start /srv/apps/<name>/ecosystem.config.cjs && pm2 save`, or the next push to `sit` (`deploy-app` starts it again).
  - `blueprint-sit.develyst.online` now gives 502 behind Access (expected).
  - **corner-chat left running:** the owner thought blueprint was the only app; corner-chat SIT is the desk's QA target, so the owner is asked.
- **2026-11-10 — SOM (smart-scheduler) asks arrived via Porter: plan only, nothing done on the box.** Reply: `REQUEST-otto-to-porter-2026-11-10-som-deploys.md`.
  - **GR web (REQ-5011):** static. `final-ui/dist` = one `index.html` (vite-plugin-singlefile, 1.3 MB). Not a git repo.
    - **Plan:** `new-app <name> static` + a one-off `deploy-app` from the PC today. Gate = nginx Basic Auth: the owner types the shared password at `htpasswd` in one sudo sitting; Cloudflare Access cannot do one shared password. CI after the owner makes a repo.
    - **Waiting on:** the hostname, the owner's go, Sober confirming the build.
  - **develyst-line-bot (REQ-5012):** a public process app (LINE webhook + HMAC). Survey before deploy; it comes after the GR web.
- **2026-11-10 — corner-chat SIT stays running** (owner: *"เปิดไว้ก่อน"*).
- **2026-11-10 ~01:40 local — GR web LIVE: `https://som-gr.develyst.online`** (owner go via Porter: *"URL web เอาตามที่ auto เสนอได้เลย"*; Sober confirmed the build).
  - **Order:** `new-app som-gr static`, then the gate, then the content, so it was never public with content.
  - **Gate:** `server-platform/readyidc/som-gr-gate.sh` (sha256 `ba76e46a…`), run by the owner via `sudo` in terminal tab c12. He typed the shared password; no agent saw it.
    - It wrote `/etc/nginx/htpasswd-som-gr` (root:www-data 640, login `som`, apr1 hash) and added `auth_basic` to `som-gr.conf` (backup `.bak-20261109-184012`, server UTC).
    - Re-run the script to change the password.
  - **Content:** `final-ui/dist/index.html`, md5 `e0a8f3cc39190b92893b03b4d7ad4721` (matches Sober's), deployed with `deploy-app`; release `20261109-184034`.
  - **Proven from outside:**
    - with no password `/`, `/salary` and an asset → 401;
    - a wrong password → 401;
    - the direct IP times out (firewall).
    - **Not proven by Otto:** right password → 200. That is the owner's browser check.
  - **Redeploy (until CI):** Sober pings a new md5, then Otto packs `dist/index.html` and runs `deploy-app som-gr` (it keeps the current release + 1 previous).
- **2026-11-10 01:42 local — GR web owner check PASSED.** The owner's screenshot shows `som-gr.develyst.online` after login: the SOM BALANCE Back Office home with the Salary, Notification, Setting and Revenue menus. Gate 6 for the one-off is closed. Remaining: CI waits for the repo.
- **2026-11-10 — develyst-line-bot survey (read-only).**
  - **Repo and checks:** public repo, `b1ffa6c`. It compiles to a Linux binary in CI (no repo build script). `bun test` 39/39 with no DB.
  - **Routes:** `/health`, `/line/webhook`, `/send` (Bearer `SEND_KEY`), `/img/:name`.
  - **Server needs:** `DATA_DIR` must be `shared/data`. It binds `0.0.0.0` (the firewall covers it). `api.line.me` and `api-data.line.me` are open.
  - **Proposed host:** `line-bot.develyst.online`. Waiting on the owner's name OK via Porter.
- **2026-11-10 — line-bot set up (owner via Porter: host `line-bot.develyst.online`, repo stays public *"ปล่อยเป็น Public"*).**
  - **`new-app line-bot process --start "./develyst-line-bot" --health /health`:** port **3005**, public, no Access.
  - **`shared/.env`** (600; values never printed):
    - Otto set `LINE_API_BASE`, `PUBLIC_BASE_URL`, `PORT=3005`, `DATA_DIR=/srv/apps/line-bot/shared/data` (dir 700), and a `SEND_KEY` generated on the box (`openssl rand -hex 32`);
    - `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` are left EMPTY for the owner.
  - **Desk `.env.send`** (git-ignored, in the bot repo checkout): `BOT_URL` plus the same `SEND_KEY`, copied over ssh straight into the file and never shown.
  - **CI key:** `github-ci@develyst-line-bot-2026-11-10` `SHA256:QeG514dHmrtTouMdgT85az7Zvn8SgHjr8qEO78l/8EM`, line 6 of `authorized_keys` (backup `.bak-20261110-linebot`). Refuses `id` ("no app id"). Expected total: 6 keys.
  - **Workflow written (not committed):** `.github/workflows/deploy-sit.yml`. Steps: `bun install` → typecheck → `bun test` (39, local fake LINE) → compile → deploy `line-bot`. Local typecheck rc 0.
  - **Deploy branch = `sit`** (platform standard).
- **2026-11-10 ~02:00 local — GR web redeployed** (Sober's new build: Stock, Users/login, toasts, menu). md5 `f6744d5e0a30e06785216daa335f51e4` checked on the PC and on the box. Release `20261109-190032` (previous `…184034` kept for rollback). No password → 401 still. Note: `deploy-app` is `/usr/local/bin/deploy-app`, not `~/.local/bin`.
- **2026-11-10 — line-bot phase 2 keys added to the server `.env`:** `RECORD_GROUP_MESSAGES=` (empty = OFF; it turns on only after the owner tells the group) and `MESSAGE_RETENTION_DAYS=90`.
  - A leftover unmodified `nano` from the closed tab c13 was killed first; no `.save` file was left.
  - Phase 2 is `dong` `8427a0e`; `sit` = `b1ffa6c`. The owner's step list is in the REQUEST file.
- **2026-11-10 — GR web redeploy #2** (Sober, feedback round 1: light theme, CEO Unlock). md5 `9a5e7307693a5aaff89f8999a16fafc7` checked on the PC; the box result is in the line above. Gate still 401.
  - Box: release `20261109-193056` (previous `…190032` kept), server md5 `9a5e7307…fafc7` matches; no password → 401. (Correction: the line above says 'in the line above'; the box result is this line.)
- **2026-11-10 — line-bot:** the owner filled both LINE values (checked as filled, never printed) and added both GitHub secrets. Waiting on Sector to commit the workflow, bring dong into sit and push.
- **2026-11-10 ~02:33 local — line-bot LIVE: `https://line-bot.develyst.online`** (CI from `sit` `7dbf9a8` = phase 2 + workflow; Sector pushed on the owner's word via Porter).
  - **Release:** `20261109-193312`, a 109 MB binary. pm2 `line-bot` online, ↺ 0, 25 MB. Log: "develyst-line-bot on :3005 (push ON)".
  - **Proven from outside:**
    - `/health` → 200 `{"ok":true,"groupKnown":false,"recording":false}`;
    - unsigned and bad-signature webhook → 401;
    - `/send` and `/messages` without the key → 401;
    - `/img/../.env` → 404.
  - **Binding:** it listens on `*:3005` (all interfaces). The firewall blocks it from outside (direct `:3005` checked).
  - **Clean-up:** the CI key files were deleted from the PC; the key now lives only in GitHub.
  - **Not proven yet:**
    - a real LINE event (it waits for the owner's webhook switch + adding the OA to the group);
    - a real `/send`;
    - a failing CI case through this repo.
- **2026-11-10 02:35 local — line-bot joined SOM SYSTEM:** `/health` → `groupKnown:true`, `recording:false`. `shared/data/group.json` was written at 19:35 UTC, so a real LINE webhook arrived and passed the signature check. The data sits in `shared/data` and survives deploys.
- **2026-11-10 — line-bot recording ON** (owner via Porter: *"ส่งละ"*, after sending the consent notice to SOM SYSTEM: messages are for internal team use and auto-deleted within 90 days). `RECORD_GROUP_MESSAGES=true` (backup `.env.bak-20261110-recordon`), then restart + `pm2 save`. `/health` → `recording:true`, `groupKnown:true`. **Roll back:** clear the value and restart.
- **2026-11-10 — GR web redeploy #3** (Sober, round 2: orange menu highlight, logo and banner). md5 `6ac40756f3e238cd8a47717c2a4e1973` matches on the PC and the box. Release `20261109-200651` (previous `…193056` kept). No password → 401.
- **2026-11-10 — GR web redeploy #4** (Sober, round 3: brand 'SOM BACK OFFICE', Merit card CEO-only). md5 `cb7334e73e449dc4d71a28b87fb62e90` matches on the PC and the box. Release `20261110-130639` (previous `20261109-200651` kept). No password → 401.
- **2026-11-11 — GR web redeploy #5** (Sober, round 4: per-person 'Can see Revenue' switch + 'Viewing as' dropdown). md5 `949cf32a203c4304caf75566575fa9ca` matches on the PC and the box. Release `20261111-011937` (previous `20261110-130639` kept). No password → 401.
- **2026-11-11 — GR web redeploy #6** (Sober, round 5: Khwan's 11-11 batch across 3 teams). md5 `3341cf63e8e97915e7ca5f5e264cfe79` matches on the PC and the box. Release `20261111-123508` (previous `20261111-011937` kept). No password → 401.
