# TASK-019: Measure the antd shared-chunk cost COMPRESSED (gzip + Brotli), A/B on today's tree
- Source: SPEC-001 (§Decision 6)
- Owner: FE (Fern)
- Status: DONE
- Depends on: none (TASK-003 is `DONE`; nothing here changes what it shipped)
- Written: 2026-09-09 by Sober (SA Lead)

## Why this exists

TASK-003 measured the antd bridge at **+100.8 kB uncompressed First Load JS on every route** and
carried one honest `UNVERIFIED`: the **compressed** delta — the bytes a user actually downloads —
because Next 16 + Turbopack prints no size table and the BEFORE chunk files had already been
overwritten (TASK-003 §Questions **Q3**, answered by me 2026-09-08: *"it will arrive as its own
small measurement TASK with the method written down… do not run anything for this yet, and do not
uninstall antd to get a BEFORE."*). **This is that TASK.**

The number is the input to **SPEC-001 §Decision 6**: whether the antd provider stays in the root
layout or is scoped below it (a route group over the app surfaces, marketing pages left antd-free).
**That decision is mine, not yours.** You produce numbers; you decide nothing and you move nothing.

**This TASK is measurement only.** No route group is created, no provider is moved, no dependency
is added or removed, `node_modules` and `package.json` are untouched, and every source edit you
make is reverted inside this same session and proved reverted.

Everything is **local only**. No commit, no push, no deploy, `back/` untouched, production and the
production database never contacted (PROTOCOL.md §Environments).

---

## The method, and why it is shaped this way

**Two states of the same tree, one variable.**

| State | What it is | How it is produced |
|---|---|---|
| **A** — `antd-in-root` | the tree exactly as it ships today | no edit at all |
| **B** — `antd-free` | the same tree with antd absent from the entry graph | remove **only** the two antd imports + the two wrapper elements from `front/src/app/layout.tsx` |

Why editing `layout.tsx` and **not** uninstalling antd:

- The cost is structural and enters through exactly one door. I checked the whole of `front/src`
  on 2026-09-09: `antd` / `@ant-design` is imported by **four files only** —
  `app/layout.tsx` (`AntdRegistry`), `contexts/AntdConfigProvider.tsx` (`ConfigProvider`, `theme`),
  and the two wrappers `components/ui/Button/BaseButton.tsx` and `components/ui/Input/BaseInput.tsx`.
  **Nothing imports those two wrappers** (grep for `ui/Button` / `ui/Input` across `src` returns no
  consumer). So removing the root layout's two imports takes antd out of the entry graph entirely —
  no uninstall needed, no half-installed tree, no lockfile churn.
- It also makes State B the **exact hypothetical the decision needs**: a page rendered with the
  provider scoped away from it is a page whose entry graph has no antd in it. State B's `/` and
  `/about` numbers *are* the post-scoping marketing-page numbers, not an estimate of them.

**Compression: measure BOTH gzip and Brotli.** What the live server negotiates, and at what level,
is a production fact nobody here has and nobody here may go and look at. Measuring both brackets
the realistic range, so the decision never rests on a guessed server setting. Both states are
compressed with the **identical** settings, so the delta is like-for-like.

🔴 **These numbers are NOT comparable to TASK-003's.** That tree had **13** routes; today's has
**9** (TASK-014 removed four) and four routes have gained a `layout.tsx` since (TASK-016/017).
State A is **re-measured here from scratch** — never carried over. If your State A uncompressed
delta lands near TASK-003's `+100.8 kB`, that is a welcome sanity check on the method, not the
result being reported.

---

## What to do

### Step 0 — preserve `layout.tsx` before you touch it

🔴 `front/src/app/layout.tsx` is **load-bearing for REQ-005** — it holds the root
`title.default` + `title.template` that every one of the 8 page titles is built from. A botched
restore silently breaks all of them. So, before any edit:

```
cd <dte>/front
cp src/app/layout.tsx <coordination-repo>/ai-worker/tests/harness/layout.tsx.state-a.bak
sha256sum src/app/layout.tsx
wc -c src/app/layout.tsx
```

Paste the hash and the byte count into §Implementation Notes. The backup goes in the
**coordination** repo (PROTOCOL.md: throwaway verification material lives here, not in the product
repo) — do **not** leave a `.bak` inside `front/`.

🔴 **Do not use `sed -i` on `layout.tsx`** — `SYSTEM-FACTS.md` **A40**: on this machine it silently
rewrites a whole file CRLF→LF. Edit it in an editor, or write it out deliberately; either way the
restore in Step 5 is a **copy back from the Step-0 backup**, never a hand re-edit.

### Step 1 — write the harness script

New file, in the **coordination repo**: `ai-worker/tests/harness/measure-first-load.mjs`
(same home and same shape as `check-no-emoji.mjs`: plain Node ESM, `node:` built-ins only, no
dependency, no `npm install`).

```
node measure-first-load.mjs <path-to-front> <label>
```

It must:

1. Read `<front>/.next/diagnostics/route-bundle-stats.json` — an array of
   `{ route, firstLoadUncompressedJsBytes, firstLoadChunkPaths[] }`. This is where Next 16 +
   Turbopack keeps the sizes now that the build prints no table (TASK-003 §Step 1 established this).
2. For each route: **de-duplicate** its chunk paths, resolve each one relative to `<front>`, and
   🔴 **normalise the separator — the JSON stores Windows backslashes** (`.next\static\chunks\x.js`).
3. **Fail loudly** (non-zero exit, name the file) if any chunk file is missing from disk. A missing
   chunk means the `.next` you are measuring does not belong to the build you just ran — that is the
   exact failure mode that cost TASK-003 its BEFORE, and it must be an error, never a silent zero.
4. Sum per route: `raw` (the bytes on disk), `gzip` (`zlib.gzipSync(buf, { level: 9 })`), `brotli`
   (`zlib.brotliCompressSync(buf)` at Node's default quality). Compress each chunk **individually**
   and sum — that is how they are served, one request each.
5. Also report `firstLoadUncompressedJsBytes` from the JSON beside your own `raw` sum, so the two
   can be compared. If they disagree, say so; do not reconcile them silently.
6. Print a readable table (route, raw, gzip, brotli) **and** write
   `ai-worker/tests/harness/first-load-<label>.json` with the per-route numbers, the chunk count,
   the Node version, and the label. Exit 0 on success.

The script is a throwaway measuring instrument, not product code. Keep it short and readable.

### Step 2 — State A build and measurement

```
cd <dte>/front
rm -rf .next
npm run build
node <coordination-repo>/ai-worker/tests/harness/measure-first-load.mjs . A-antd-in-root
```

`rm -rf .next` before **every** build in this TASK — a stale `.next` is how the previous BEFORE was
lost. Build must be green; if it is not, stop and `@Sober` — do not measure a red tree.

### Step 3 — produce State B (the only source edit in this TASK)

In `front/src/app/layout.tsx`, remove exactly these four things and **nothing else**:

- the import of `AntdRegistry` from `@ant-design/nextjs-registry`;
- the import of `AntdConfigProvider` from `@/contexts/AntdConfigProvider`;
- the `<AntdRegistry>` element wrapping the body's children, and its closing tag;
- the `<AntdConfigProvider>` element inside `<ThemeProvider>`, and its closing tag.

Everything else stays **byte-identical**: the `metadata` object (title default + template,
description, keywords — REQ-005's), the fonts, `themes.css` + `globals.css` imports, the
`ThemeProvider > AuthProvider > Navbar/main/Footer` nesting, `lang="th"`, both
`suppressHydrationWarning`s. Do **not** delete `contexts/AntdConfigProvider.tsx`, the two `ui/`
wrappers, or anything from `package.json` — State B is an *entry-graph* change, not an uninstall.

Paste the `layout.tsx` diff (it should be 4 lines removed plus indentation) into
§Implementation Notes.

### Step 4 — State B build and measurement

```
cd <dte>/front
rm -rf .next
npm run build
npx tsc --noEmit
node <coordination-repo>/ai-worker/tests/harness/measure-first-load.mjs . B-antd-free
```

Both must exit 0. State B is expected to render **without** antd's registry — that is the point;
no screen uses an antd component today, so nothing should look different. If the build warns or a
route disappears from the stats file, report it verbatim; do not fix it.

### Step 5 — restore State A, and PROVE the restore

```
cd <dte>/front
cp <coordination-repo>/ai-worker/tests/harness/layout.tsx.state-a.bak src/app/layout.tsx
sha256sum src/app/layout.tsx        # must equal Step 0 exactly
wc -c src/app/layout.tsx            # must equal Step 0 exactly
rm -rf .next
npm run build
npx tsc --noEmit
node <coordination-repo>/ai-worker/tests/harness/measure-first-load.mjs . A-rerun
```

Then, on **your own dev server** (a port you pick, `127.0.0.1` only, **started and stopped by
you**), re-prove REQ-005 is intact — this is the check that catches a bad restore:

- all **8** titles character-exact (`/` `/about` `/courses` `/login` `/register` `/teach`
  `/verify-email` `/classroom/<any id>`);
- `/`'s rendered `<title>` has a **pipe count of 0** (`SYSTEM-FACTS.md` **A31**).

`A-rerun` vs `A-antd-in-root` is also the **determinism check**: if the two disagree by more than a
few bytes per route, the measurement is noise and the whole comparison is `UNVERIFIED` — say so
rather than picking the nicer run.

### Step 6 — report the numbers (this is the deliverable)

One table in §Implementation Notes, per route, all 9:

| Route | A raw | A gzip | A brotli | B raw | B gzip | B brotli | Δ raw | Δ gzip | Δ brotli |

Plus, stated in one line each: the **uncompressed** delta (for comparison with TASK-003's
`+100.8 kB`), the **gzip** delta, the **Brotli** delta, and whether the delta is uniform across all
9 routes (which would confirm it is the shared chunk, not any page).

🚫 **Do not draw the conclusion.** No recommendation, no route group, no "we should…". SPEC-001
§Decision 6 is mine to close, and I close it on your numbers.

---

## Definition of Done

- [x] Step 0 backup exists in `ai-worker/tests/harness/layout.tsx.state-a.bak`; the Step-0
      `sha256sum` and `wc -c` of `front/src/app/layout.tsx` are pasted.
- [x] `ai-worker/tests/harness/measure-first-load.mjs` exists, is dependency-free Node ESM, and
      **errors** (non-zero, naming the file) when a listed chunk is missing — prove that branch, e.g.
      by pointing it at a `<front>` whose `.next` has been removed, and paste the failure output.
- [x] The script normalises the JSON's **Windows backslash** chunk paths (say how) and de-duplicates
      per route.
- [x] State A: `rm -rf .next` then `npm run build` **exit 0**, and `first-load-A-antd-in-root.json`
      written; the printed table pasted.
- [x] State B: the `layout.tsx` diff pasted, showing **only** the 2 imports + 2 wrapper elements
      removed and `metadata` untouched.
- [x] State B: `rm -rf .next` then `npm run build` **exit 0**, `npx tsc --noEmit` **exit 0**,
      `first-load-B-antd-free.json` written; the printed table pasted.
- [x] `package.json` and `package-lock.json` are **byte-identical** to how you found them
      (`sha256sum` both, before and after — paste all four).
- [x] Restore proved: post-restore `sha256sum` **and** `wc -c` of `layout.tsx` equal Step 0's
      exactly, and a CR/LF count is pasted showing the line endings survived (A40).
- [x] Post-restore `npm run build` **exit 0** and `npx tsc --noEmit` **exit 0**.
- [x] Post-restore live check on your own dev server (port named, **stopped afterwards**): all **8**
      titles character-exact and `/`'s pipe count **0** (A31).
- [x] `A-rerun` measured; its per-route numbers compared with `A-antd-in-root` and the difference
      stated. If they diverge materially, the comparison is written up as `UNVERIFIED`.
- [x] The Step-6 table is complete for all **9** routes, with the raw / gzip / Brotli deltas stated
      and the uniform-across-routes question answered yes or no.
- [x] `node <coordination-repo>/ai-worker/tests/harness/check-no-emoji.mjs <dte>/front/src` run;
      **124** occurrences = the standing baseline (the exit code is **not** the signal here — read
      the count).
- [x] Full-ISO `mtime` evidence that the only files written in `front/` are `layout.tsx` (twice:
      edited, then restored) and `.next/` build output — nothing else.
- [x] Nothing in `back/` changed. No route group created, no provider moved, no dependency added or
      removed, no `sed -i` on `layout.tsx`. No commit, no push, no deploy; production and the
      production DB never contacted.
- [x] Anything you could not actually run is written as `UNVERIFIED — <what would settle it>`.

## Implementation Notes

Filled by Fern, 2026-09-09. Everything below is real pasted output. Local only: no commit, no push,
no deploy, `back/` untouched, production and the production DB never contacted.

### Step 0 — `layout.tsx` preserved (backup + fingerprint)

```
$ cp src/app/layout.tsx <coord>/ai-worker/tests/harness/layout.tsx.state-a.bak
$ sha256sum src/app/layout.tsx
ab5f6aaf6c9a02d027a568a6e43b247ea30bf62addea39f7d89c0835ba9a2909 *src/app/layout.tsx
$ wc -c < src/app/layout.tsx      -> 2374
$ wc -l < src/app/layout.tsx      -> 65
$ tr -cd '\r' < src/app/layout.tsx | wc -c   -> 65        # CR == lines, CRLF intact (A40)
$ sha256sum <coord>/ai-worker/tests/harness/layout.tsx.state-a.bak
ab5f6aaf6c9a02d027a568a6e43b247ea30bf62addea39f7d89c0835ba9a2909   # identical to source
```

Lockfile fingerprints taken at Step 0 (compared again after Step 5, below):

```
31bd9953e1010e58b7e51d8449eafe205ef2c3360250aa40100ea0e1df8bbf4a *package.json        (977 bytes)
a6dcf00af7f61eeef0f35370dc9105b11fe03c8b97a444f8b056c9f2e5ff083c *package-lock.json   (114378 bytes)
```

### Step 1 — the harness script

`ai-worker/tests/harness/measure-first-load.mjs` — plain Node ESM, `node:fs` / `node:path` /
`node:url` / `node:zlib` only, no dependency, no `npm install`.

- **Backslash normalisation:** the JSON stores `.next\static\chunks\x.js`. The script applies
  `p.replace(/\\/g, "/")` to every path **before** `resolve(front, rel)`, so a Windows-written stats
  file resolves on any separator.
- **De-duplication:** `[...new Set(chunkPaths.map(normalise))]` per route, before any sizing.
- **Compression:** each chunk compressed **individually** and the results summed —
  `gzipSync(buf, { level: 9 })` and `brotliCompressSync(buf)` (Node default quality). Identical
  settings for both states, so the delta is like-for-like.
- **`declared` vs `raw`:** the script prints `firstLoadUncompressedJsBytes` from the JSON beside its
  own on-disk `raw` sum and labels each row. **On every route of every run the two were equal**
  (`raw == declared`) — nothing was reconciled silently.

**Both failure branches proved, non-zero and naming the file** (run against scratch dirs outside the
repo, so nothing in `front/` was disturbed):

```
$ node measure-first-load.mjs <scratch>/fakefront MISSING-CHUNK-TEST   # stats JSON copied in, no chunks on disk
ERROR: 89 chunk file(s) listed in <scratch>\fakefront\.next\diagnostics\route-bundle-stats.json are missing from disk:
  /: <scratch>\fakefront\.next\static\chunks\0vlaqdvg6cjg_.js
  ... (89 lines, each naming the route and the absolute file)
The .next being measured does not belong to the build just run.
EXIT=1

$ node measure-first-load.mjs <scratch>/emptyfront NO-NEXT-TEST        # .next absent entirely
ERROR: stats file not found: <scratch>\emptyfront\.next\diagnostics\route-bundle-stats.json
The build did not run, or .next was removed after it.
EXIT=1
```

Neither failing run wrote a `first-load-*.json` — the script only writes on success.

### Step 2 — State A (`antd-in-root`), the tree exactly as it ships

```
$ rm -rf .next && npm run build      -> BUILD_EXIT=0   (9 routes listed, green)
$ node measure-first-load.mjs . A-antd-in-root        -> EXIT=0
label: A-antd-in-root   node: v22.23.2   front: H:\dte\dte\front
stats: ...\.next\diagnostics\route-bundle-stats.json   routes: 9

route                    chunks         raw        gzip      brotli    declared  note
---------------------------------------------------------------------------------------------
/                            10    678.4 kB    203.4 kB    176.2 kB    678.4 kB  raw == declared
/_not-found                   9    640.1 kB    193.4 kB    167.8 kB    640.1 kB  raw == declared
/about                       10    643.0 kB    194.5 kB    168.6 kB    643.0 kB  raw == declared
/classroom/[id]              10    656.7 kB    197.9 kB    171.6 kB    656.7 kB  raw == declared
/courses                     10    641.8 kB    194.1 kB    168.3 kB    641.8 kB  raw == declared
/login                       10    649.2 kB    196.6 kB    170.4 kB    649.2 kB  raw == declared
/register                    10    659.8 kB    199.4 kB    172.9 kB    659.8 kB  raw == declared
/teach                       10    662.7 kB    199.0 kB    172.6 kB    662.7 kB  raw == declared
/verify-email                10    647.0 kB    195.6 kB    169.6 kB    647.0 kB  raw == declared
```

### Step 3 — State B (`antd-free`): the only source edit in this TASK

**No `sed -i`** (A40). The edit was made by a one-shot Node script that reads the file as UTF-8,
removes six exact CRLF-terminated strings — each asserted **present and unique** first, aborting
otherwise — and writes the result back. Indentation of the surviving lines was deliberately left
unchanged, so the diff is removals only.

```
$ diff --strip-trailing-cr <coord>/.../layout.tsx.state-a.bak src/app/layout.tsx
8,9d7
< import { AntdRegistry } from "@ant-design/nextjs-registry";
< import AntdConfigProvider from "@/contexts/AntdConfigProvider";
49d46
<         <AntdRegistry>
51d47
<             <AntdConfigProvider>
59d54
<             </AntdConfigProvider>
61d55
<         </AntdRegistry>
```

Nothing else moved: `metadata` (REQ-005's `title.default` + `title.template`, description, keywords),
the fonts, `themes.css` + `globals.css`, the `ThemeProvider > AuthProvider > Navbar/main/Footer`
nesting, `lang="th"` and both `suppressHydrationWarning`s are all untouched. State B fingerprint:
2130 bytes, 59 lines, **CR count 59** (CRLF survived the edit too). `contexts/AntdConfigProvider.tsx`,
the two `ui/` wrappers and `package.json` were **not** touched — this is an entry-graph change, not
an uninstall.

### Step 4 — State B build and measurement

```
$ rm -rf .next && npm run build   -> BUILD_EXIT=0   (same 9 routes, none disappeared, no warning)
$ npx tsc --noEmit                -> TSC_EXIT=0
$ node measure-first-load.mjs . B-antd-free        -> EXIT=0
label: B-antd-free   node: v22.23.2   routes: 9

route                    chunks         raw        gzip      brotli    declared  note
---------------------------------------------------------------------------------------------
/                             8    575.2 kB    162.9 kB    140.5 kB    575.2 kB  raw == declared
/_not-found                   7    536.9 kB    152.9 kB    132.1 kB    536.9 kB  raw == declared
/about                        8    539.8 kB    153.9 kB    132.9 kB    539.8 kB  raw == declared
/classroom/[id]               8    553.5 kB    157.4 kB    135.9 kB    553.5 kB  raw == declared
/courses                      8    538.6 kB    153.5 kB    132.6 kB    538.6 kB  raw == declared
/login                        8    546.0 kB    156.0 kB    134.7 kB    546.0 kB  raw == declared
/register                     8    556.6 kB    158.8 kB    137.2 kB    556.6 kB  raw == declared
/teach                        8    559.5 kB    158.5 kB    136.9 kB    559.5 kB  raw == declared
/verify-email                 8    543.8 kB    155.0 kB    133.9 kB    543.8 kB  raw == declared
```

Chunk count falls **10 -> 8** on every route (9 -> 7 on `/_not-found`): antd leaves as exactly two
shared chunks.

### Step 5 — restore proved, and REQ-005 re-proved live

Restore was a **copy back from the Step-0 backup**, never a hand re-edit.

```
$ cp <coord>/ai-worker/tests/harness/layout.tsx.state-a.bak src/app/layout.tsx
$ sha256sum src/app/layout.tsx
ab5f6aaf6c9a02d027a568a6e43b247ea30bf62addea39f7d89c0835ba9a2909   # == Step 0, exactly
$ wc -c  -> 2374     # == Step 0
$ wc -l  -> 65       # == Step 0
$ tr -cd '\r' | wc -c -> 65   # CR == lines: CRLF survived (A40)

$ sha256sum package.json package-lock.json
31bd9953e1010e58b7e51d8449eafe205ef2c3360250aa40100ea0e1df8bbf4a *package.json        # == Step 0
a6dcf00af7f61eeef0f35370dc9105b11fe03c8b97a444f8b056c9f2e5ff083c *package-lock.json   # == Step 0

$ rm -rf .next && npm run build   -> BUILD_EXIT=0
$ npx tsc --noEmit                -> TSC_EXIT=0
$ node measure-first-load.mjs . A-rerun   -> EXIT=0   (table byte-identical to A-antd-in-root, below)
```

**Live title check — my own server, `npx next start -p 3047 -H 127.0.0.1`, serving the restored
State A build; started by me and stopped by me** (`taskkill` on PID 18472; a post-kill
`curl -m 3` returned exit **7**, connection refused — the port is closed):

```
/              => <title>DTE — Develyst The Education</title>
/about         => <title>เกี่ยวกับเรา | DTE — Develyst The Education</title>
/courses       => <title>ทักษะทั้งหมด | DTE — Develyst The Education</title>
/login         => <title>เข้าสู่ระบบ | DTE — Develyst The Education</title>
/register      => <title>สมัครสมาชิก | DTE — Develyst The Education</title>
/teach         => <title>สอน | DTE — Develyst The Education</title>
/verify-email  => <title>ยืนยันอีเมล | DTE — Develyst The Education</title>
/classroom/42  => <title>ห้องเรียน | DTE — Develyst The Education</title>

pipe count in /'s rendered <title>: 0          # A31 holds
/classroom/42 title text length: 60 bytes      # `ห้องเรียน` present, A37 shape intact
```

All **8** character-exact, `/` still one-part. The restore is clean.

### Step 6 — THE NUMBERS (bytes; all 9 routes)

| Route | A raw | A gzip | A brotli | B raw | B gzip | B brotli | Δ raw | Δ gzip | Δ brotli |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 678396 | 203447 | 176236 | 575204 | 162894 | 140528 | **103192** | 40553 | 35708 |
| `/_not-found` | 640119 | 193426 | 167769 | 536927 | 152873 | 132061 | **103192** | 40553 | 35708 |
| `/about` | 643040 | 194451 | 168646 | 539848 | 153898 | 132938 | **103192** | 40553 | 35708 |
| `/classroom/[id]` | 656711 | 197930 | 171621 | 553519 | 157376 | 135914 | **103192** | 40554 | 35707 |
| `/courses` | 641758 | 194094 | 168322 | 538566 | 153541 | 132614 | **103192** | 40553 | 35708 |
| `/login` | 649177 | 196571 | 170422 | 545985 | 156020 | 134712 | **103192** | 40551 | 35710 |
| `/register` | 659796 | 199357 | 172947 | 556604 | 158803 | 137220 | **103192** | 40554 | 35727 |
| `/teach` | 662684 | 199018 | 172579 | 559492 | 158465 | 136874 | **103192** | 40553 | 35705 |
| `/verify-email` | 646975 | 195590 | 169569 | 543783 | 155037 | 133861 | **103192** | 40553 | 35708 |

The four lines asked for:

- **Uncompressed delta: `+103192` bytes = `+103.2 kB` on every route.** Comparable in magnitude to
  TASK-003's `+100.8 kB` on a 13-route tree — a sanity check on the method, not a re-measurement of
  that number.
- **gzip (level 9) delta: `+40.55 kB`** per route (range 40551–40554 bytes, spread **3 bytes**).
- **Brotli (Node default quality) delta: `+35.71 kB`** per route (range 35705–35727 bytes, spread
  **22 bytes**).
- **Uniform across all 9 routes: YES.** Δ raw is `103192` bytes **identically** on all nine — the
  arithmetic proof that this is the shared chunk pair, not any page's own code. The gzip/Brotli
  spreads (3 B and 22 B, ≤0.06%) are compression-context noise from the surrounding chunk set, not
  a per-route difference.

Context, stated as fact and not as a recommendation: antd is **20–22% of the gzip** First Load JS
(e.g. `/`: 203.4 -> 162.9 kB) and **20–21% of the Brotli** (176.2 -> 140.5 kB).

### Determinism check — `A-antd-in-root` vs `A-rerun`

Not "within a few bytes" — **exactly zero** on every route and every metric:

```
/                  draw 0  dgzip 0  dbrotli 0
/_not-found        draw 0  dgzip 0  dbrotli 0
/about             draw 0  dgzip 0  dbrotli 0
/classroom/[id]    draw 0  dgzip 0  dbrotli 0
/courses           draw 0  dgzip 0  dbrotli 0
/login             draw 0  dgzip 0  dbrotli 0
/register          draw 0  dgzip 0  dbrotli 0
/teach             draw 0  dgzip 0  dbrotli 0
/verify-email      draw 0  dgzip 0  dbrotli 0
IDENTICAL: true
```

The build is byte-reproducible across a full `rm -rf .next` cycle, so the A/B comparison is **not**
noise-limited and is reported as measured, not `UNVERIFIED`.

### Standing checks

```
$ node <coord>/ai-worker/tests/harness/check-no-emoji.mjs H:/dte/dte/front/src
124 occurrence(s) in 44 file(s) scanned.       # == the standing baseline, unchanged
```

### mtime evidence — what was written in `front/`

`find` over `front/` excluding `node_modules` and `.next`, newest first (full ISO, +0700):

```
2026-09-09 09:00:03.580889800  ./tsconfig.tsbuildinfo
2026-09-09 08:59:44.587293000  ./src/app/layout.tsx
2026-09-09 08:58:19.167712300  ./next-env.d.ts
2026-09-09 08:14:49.996517400  ./src/app/teach/page.tsx        <- TASK-018, earlier today, not mine
2026-09-09 08:14:49.995516300  ./src/app/register/page.tsx     <- TASK-018
2026-09-09 08:14:49.994517000  ./src/app/login/page.tsx        <- TASK-018
2026-09-09 08:14:49.987555300  ./src/app/about/page.tsx        <- TASK-018
2026-09-09 03:55:25.035322700  ./src/app/classroom/[id]/layout.tsx   <- TASK-017
(older still: the TASK-016 layouts at 00:34:59)
```

**Declared honestly, because it is two files more than the DoD wording anticipated:** besides
`src/app/layout.tsx` (edited then restored — only the final mtime survives) and `.next/`, two
**generated build artefacts** were rewritten by the commands this TASK itself prescribes —
`next-env.d.ts` (rewritten by `next build`) and `tsconfig.tsbuildinfo` (rewritten by
`npx tsc --noEmit`). Both pre-existed in the tree; neither is source; I authored neither. I did not
capture their content before the first build, so:
`UNVERIFIED — whether their bytes changed as well as their mtimes; a byte comparison against a
pre-session copy would settle it.` No other file under `front/` was written.

**`back/` untouched** — its newest file is `./src/routes/ai.ts` at `2026-09-08 03:18:41`, predating
this session entirely.

### Scope guards

No route group created, no provider moved, no dependency added or removed, `node_modules` untouched,
`package.json` / `package-lock.json` byte-identical (hashes above). No `sed -i` anywhere near
`layout.tsx`. No commit, push, merge or deploy; production and the production database were never
contacted; no SQL. Files written outside `front/`: only this TASK file, the board, today's log, my
inbox, and the harness artefacts (`measure-first-load.mjs`, `layout.tsx.state-a.bak`,
`first-load-A-antd-in-root.json`, `first-load-B-antd-free.json`, `first-load-A-rerun.json`).

**I draw no conclusion.** SPEC-001 §Decision 6 is Sober's.

### UNVERIFIED, carried

- `UNVERIFIED — what the live server actually negotiates (gzip vs Brotli, and at what level).` That
  is a production fact; the two columns bracket it deliberately, per the TASK's own method, and
  nobody here may go and look.
- `UNVERIFIED — whether next-env.d.ts / tsconfig.tsbuildinfo changed in content as well as mtime`
  (above).
- `UNVERIFIED — a person's eyes on the restored site.` I proved the 8 titles by HTTP against my own
  server and then stopped it; no human has looked, and `/teach` + `/classroom/<id>` render behind
  `withAuth` in the browser, so their *bodies* were never seen. The tab strings themselves come from
  `metadata` and are in the served HTML, which is what I checked.
- Reported verbatim, not acted on: `next start` printed
  `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.`
  It nevertheless served all 9 routes and every title correctly.

## Questions

None. The method in the TASK was fully executable as written, and every ambiguity it could have had
(which compression, which state is BEFORE, how to restore) was already pinned in it.

## Review

**Verdict: `DONE` — no rework.** Reviewed 2026-09-09 by Sober (SA Lead).

I reviewed the evidence, not the claim: every load-bearing number below I produced myself, from the
tree as it sits on disk, without asking Fern for anything.

### What I re-ran myself

| Check | My own result | Verdict |
|---|---|---|
| `sha256sum front/src/app/layout.tsx` vs the Step-0 backup | both `ab5f6aaf…a2909`, **byte-identical** | the restore is real |
| `wc -c` / `wc -l` / CR count on it | **2374 / 65 / 65** — CR == lines | CRLF survived (A40) |
| `sha256sum package.json package-lock.json` | `31bd9953…bbf4a` / `a6dcf00a…f083c`, equal to her Step-0 pair | no dependency churn |
| `measure-first-load.mjs . SOBER-REVIEW-A` against the `.next` on disk now | table **byte-identical to `A-antd-in-root` on all 9 routes and all 3 metrics** | State A is what is on disk, and the instrument reproduces in my hands too |
| A vs `A-rerun` vs my run, recomputed from the three JSONs | `raw`/`gzip`/`brotli` **exactly equal**, no route excepted | determinism confirmed independently |
| Δ recomputed from the JSONs, not read off her table | **Δ raw `103192` B identically on all 9**; Δ gzip 40551–40554; Δ brotli 35705–35727; **Δ chunks −2 on every route** | her Step-6 table is arithmetically correct |
| The missing-chunk failure branch | pointed the script at a scratch `<front>` holding only the stats JSON: **`ERROR: 89 chunk file(s) … are missing from disk`, EXIT=1**, and **no `first-load-*.json` written** | the branch that cost TASK-003 its BEFORE is genuinely fatal |
| `grep -rln "antd\|@ant-design" front/src` | **5** files — the 4 the TASK names **plus `constants/theme-tokens.ts`**, which only *mentions* antd in comments and identifiers (`antdTokens`) and **imports nothing from it** | the "antd enters by one door" premise holds; State B really is antd-free in the entry graph |
| `grep -rn "ui/Button\|ui/Input" front/src` | **no consumer** | ditto |
| `check-no-emoji.mjs front/src` | **124 occurrences in 44 files** | == the standing baseline |
| `find back/ -newermt 2026-09-09` | **empty** | `back/` untouched |
| Live titles on **my own** `npx next start -p 3053 -H 127.0.0.1`, started and stopped by me (`taskkill` PID 19644; post-kill `curl -m 3` exit **7** = port closed) | all **8** character-exact — `/` · `เกี่ยวกับเรา` · `ทักษะทั้งหมด` · `เข้าสู่ระบบ` · `สมัครสมาชิก` · `สอน` · `ยืนยันอีเมล` · `ห้องเรียน` — and `/`'s rendered `<title>` **pipe count 0** | REQ-005 survived the restore; A31 holds |

My run's artefact is kept as review evidence: `ai-worker/tests/harness/first-load-SOBER-REVIEW-A.json`.

### Two things worth saying out loud

1. **The `mtime` finding is Fern right and my DoD wording wrong.** My DoD said the only files written
   in `front/` would be `layout.tsx` and `.next/`. `next build` rewrites `next-env.d.ts` and
   `npx tsc --noEmit` rewrites `tsconfig.tsbuildinfo` — both **generated build artefacts, not
   source**, both pre-existing, both rewritten by the very commands my own TASK prescribes. She
   declared them rather than letting them pass quietly, which is exactly the behaviour I want.
   **No rework.** The wording was mine and is corrected for my future TASKs to: *"the only **source**
   file written is X; generated build output (`.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`) is
   expected."* Her `UNVERIFIED` on their byte content is accepted and **carried nowhere** — it has no
   consequence for anything.
2. **She drew no conclusion, as instructed, and produced a genuinely decisive dataset.** §Decision 6
   is closed by me on these numbers — `specs/SPEC-001-frontend-foundation.md` §Decision 6 §CLOSED.

### UNVERIFIED accepted, not laundered

- `UNVERIFIED — what the live server negotiates (gzip vs Brotli, and at what level).` A production
  fact; the two columns bracket it by design and nobody here may go and look. My decision is
  therefore stated against **gzip `+40.6 kB` as the pessimistic bound and Brotli `+35.7 kB` as the
  optimistic one**, never against a single guessed number.
- `UNVERIFIED — a person's eyes on the restored site.` Two automated browsers (hers, then mine) read
  the tab strings over HTTP; `/teach` and `/classroom/<id>` render their *bodies* behind `withAuth`
  and neither of us saw those. **No new Blocked row** — the standing "Owner's own eyes — the 8
  unified tabs" row already covers exactly this surface.
- Reported verbatim by both of us, acted on by neither: `next start` prints
  `⚠ "next start" does not work with "output: standalone" configuration.` It served all 9 routes and
  every title correctly regardless. Not a defect of this TASK; it concerns how the site is *started*,
  which is the human's ground, and it becomes a finding only if something later depends on it.

