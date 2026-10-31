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
