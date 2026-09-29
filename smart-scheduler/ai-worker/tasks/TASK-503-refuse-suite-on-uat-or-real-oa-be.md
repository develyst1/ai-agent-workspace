# TASK-503 — the suite must REFUSE to run when `.env` points at the UAT database or the real OA — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** Owner ruling, 09-26, via Porter. 🚫 **This replaces the dead-port preload — do not build that.**

## §0 What the owner ruled, and what it changes
**Running the tests against `sid` is BY DESIGN** ("เทสบน sid นั่นแหละ ถูกแล้ว"). The desktop `.env` holding sid's database and the demo OA token is the intended setup. ⇒ **the escalation is stood down, the preload is cancelled, and we both run the suite normally again.**
📌 **The correction is mine to carry: "never touch a real database" is a rule about the CUSTOMER'S environments.** `sid` is the test box. I read the rule at its widest and escalated before asking which environments it covers — and that cost the owner a decision he should not have had to make. **Your stop-and-report was still right;** the thing I got wrong is what the rule meant, not that you raised it.

## §1 What IS wanted — the one guard
**The suite refuses to run when `.env` points at the customer's environment.** That is the case that must be impossible, and it is a real risk: the owner's `.env` **did** hold the uat database and the **real OA token** (`@427ybeky`) during the 09-26 release, and the real OA again on 09-23.
- **Refuse on either signal:** the **UAT database** (its host/name), **or** the **real OA** — `LINE_OA_WRITE_ALLOW=@427ybeky`, the real `LIFF_ID` (`2011577840-…`), or the real channel token if you can identify it **without reading or printing any credential value**.
- 🔑 **Fail before anything is imported and before any test runs** — the point is that nothing connects, not that something reports afterwards.
- 🔑 **The message must say what to do**, not just what is wrong: which setting tripped it, that the tests are meant to run against `sid`, and to switch `.env` back. Whoever hits this will be mid-release with the customer's values loaded, which is exactly when a cryptic error costs the most.
- 🚫 **No opt-out env var.** An override would be used at 2 a.m. by the person the guard exists for.
- ⚠️ **Identify by NAME, never by secret:** compare hosts and the OA/LIFF ids, never a token's value, and **never print a credential** in the failure.
- 📌 **`sid` and local must be unaffected** — pin that a normal run is byte-identical.

## §2 Scope
- 🚫 Nothing else from the escalation: no preload, no dead port, no blanking of credentials, no mock work. **The 44 unmocked tests are ordinary work for later**, per the owner — flaky or slow ones get mocked as normal maintenance, not as an incident.
- The guard belongs where it cannot be skipped by running one file (say how you achieved that).

## Definition of Done
- [ ] The suite refuses on the uat database **or** any real-OA signal, **before any import or connection** · the message names the tripped setting and says to switch back to `sid` · **no credential value read or printed**, comparison by name/id only · no opt-out · a normal `sid` run pinned unchanged · the guard unskippable when running a single file (say how) · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that lets a uat host through and one that prints a credential in the message · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the suite REFUSES to run against the customer's system, by name, before any import; sid runs unchanged. 3279 pass / 0 fail · tsc 0 · 59 = 59 · 5/5 mutations bite (one only after I fixed the pin it exposed)

**Numbers:** `bun test` **3279 pass / 0 fail**, twice (+8, the guard's own tests; nothing else changed, so the sid run is otherwise identical) · `tsc` **0** · **59 = 59**.

## What landed (three small files)
- **`src/lib/test-env-guard.ts`**: the rules, pure. **Customer signals, each one alone enough to refuse:**
  - **the uat database host** `154.197.124.29` (sid's is `…206`);
  - **the real OA** `@427ybeky` in `LINE_OA_WRITE_ALLOW` (also inside a list);
  - **the real LIFF**, recognised by its CHANNEL: a LIFF id is `<channel>-<suffix>`, so **no LIFF id is written anywhere**, which keeps the standing rule and the `liff-link-req107` pin;
  - **the real login channel** `2011577840`.
- **`src/test-env-guard.preload.ts`**: three lines. It computes the signals from `process.env` and, if there are any, **throws before any test file loads.** **It imports nothing but the rules**, so no app code, no db client and nothing that could connect. It reads only and changes nothing (unlike the cancelled preload).
- **`bunfig.toml`**: `[test] preload = ["./src/test-env-guard.preload.ts"]`.

## 🔑 By NAME, never by secret
- `dbHostOf(url)` returns **the host and nothing else** (never user, password, port or path).
- The message prints the setting's **name** plus the non-secret id that matched (a host, an `@id`, a channel id). **No password, token or URL is ever compared, returned or printed.**
- **The channel access TOKEN is deliberately not examined:** telling the customer's token from sid's would mean reading it. The OA, LIFF and channel ids travel with it, and those are what trip.
- Pinned:
  - a message built from an env carrying a fake password and a fake token contains neither, nor `postgres://`;
  - the guard's source never even names a credential variable.

## The message (what the person mid-release sees)
```
🔴 REFUSING TO RUN THE TESTS — .env points at the CUSTOMER'S system (uat / the real OA):
   · DATABASE_URL → host 154.197.124.29 — the uat database
   · LINE_OA_WRITE_ALLOW → @427ybeky — the customer's real OA
   The tests are meant to run against sid, never uat. NOTHING has connected: this check runs before any test file loads.
   What to do: switch .env back to the sid values (e.g. copy .env.sid over .env), then run `bun test` again.
   There is no override, on purpose.
```

## Unskippable when running ONE file, and how
Bun runs `bunfig.toml`'s preloads before **every** test file, **including `bun test <one file>`**, and Bun loads `.env` before the preload, so the values are there to check.
- **Proven by BEHAVIOUR, not asserted:** a test spawns a real `bun test src/lib/crm.test.ts` with a uat-shaped environment (uat host plus a **fake** password, the real OA id, a **fake** token). It checks four things: **the process fails · the refusal appears · none of that file's tests ran · neither fake secret appears in the output.**
- 📌 **The limit, stated:** Bun reads `bunfig.toml` from the directory `bun test` is run in. Running the tests from a *different* working directory would not load it. Every script and every habit here runs from the repo root.

## 🚫 No opt-out
There is no env var or flag. The rules read only the env object they are handed (pinned: `process.env` does not appear in them), and the preload is pinned to its exact three lines.

## Break-and-watch: `mut503.mjs`, 5 mutations, **5 bite**
`BASELINE=18` (the guard + `liff-link-req107`). `finally` + sha-256 restore, byte-identical. **CHECKSUM `e2f7bfaf…` identical before and after.**
- **A — a uat HOST let through**: **bites, 3 fail**.
- **B — a CREDENTIAL printed** (the full URL, password included, in the message): **bites, 1 fail**.
- **C — an OPT-OUT added** (`ALLOW_UAT_TESTS`): **bites, 1 fail**.
- **D — the guard UNWIRED from `bunfig.toml`**: **bites, 2 fail** (the single-file subprocess runs, and is not refused).
- **E — app code imported BEFORE the check** (`import "./db";` in the preload): ⚠️ **on the first run it SURVIVED.** My pin collected only `import … from "…"`, and a bare side-effect import has no `from`. **I fixed the pin** (every import specifier, plus no dynamic `import(`), and re-ran all five: **E bites, 1 fail.** Reported because a pin that looked complete wasn't.

## Two notes for the record
- 📌 **`LIFF_ID` in my first test draft:** I had written real LIFF ids as fixtures, and `liff-link-req107`'s "no LIFF id in src" pin caught it on the full run. The test now **builds** LIFF-shaped values at runtime (`channel + "-" + "xxxxxxxx"`). **The standing rule held because a pin enforced it, not because I remembered it.**
- ⚠️ **The green count, as you asked to have it on the record:** these 3279 include the 44–46 tests that pass because sid's database answers them. That is by design now, per the owner, and those files are TASK-504's.
⛔ Only you mark this DONE. Next: TASK-504 (the mocks, a file at a time), then TASK-502.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3279 pass / 0 fail** both times · tsc 0 · 59 = 59 · the old preload gone, `bunfig.toml` now loading only the guard, and the preload read by me: **six lines, importing nothing but the rules.**

🔑 **"Unskippable" is proven by BEHAVIOUR, and that is the part I would have accepted a weaker version of.** A test **spawns a real `bun test <one file>`** with a uat-shaped environment and checks four things: the process fails, the refusal appears, **none of that file's tests ran**, and **neither fake secret appears in the output.** A source assertion that the preload is wired would have proved nothing about what Bun actually does with it.
✅ **And the limit is named: `bunfig.toml` is read from the directory `bun test` runs in.** Stated rather than glossed, with the reason it is acceptable here.

🔑 **Recognising the real LIFF by its CHANNEL rather than by the id is the best decision in the task.** A LIFF id is `<channel>-<suffix>`, so matching on the channel means **no LIFF id is written anywhere** — which keeps the standing rule and leaves `liff-link-req107`'s pin intact. **A guard that had to break another guard's rule to exist would have been a poor trade**, and he found the way round it rather than asking for an exception.
✅ **The token is deliberately not examined, with the reason given:** telling the customer's token from sid's would mean reading it. **The OA, LIFF and channel ids travel with the token and are not secret** — so the guard trips on those. That is the right line, and it is pinned two ways (no credential in the message; no credential variable even named in the source).
✅ **The message is written for the person who will see it** — mid-release, customer values loaded — and it says **nothing has connected**, which is the one fact that stops a panic, plus what to do and that there is no override.

## 📌 Two things he volunteered, and both are why I trust the rest
- **Mutation E survived the first run:** app code imported **before** the check would have gone unnoticed, because his pin collected only `import … from "…"` and **a bare side-effect import has no `from`.** He fixed the pin, re-ran all five, and **reported that the pin had looked complete and was not.** That is the second time this week a pin he wrote was too narrow **and he said so first.**
- **His own first draft put real LIFF ids in fixtures, and `liff-link-req107` caught it.** 📌 **"The standing rule held because a pin enforced it, not because I remembered it"** — that sentence is the whole argument for the way we work, written by the person it caught.
✅ **And he restated the caveat I asked to be on the record**: these 3279 include the 44–46 tests that pass because sid answers. **By design now, and TASK-504's to close.**

---

# ⚠️ CORRECTION — @Jason (2026-09-26, found during TASK-505): the mutation COUNTS above were misparsed; the verdicts stand
- **The cause:** my runner read the FIRST "N pass" / "N fail" in the output. This file's single-file guard test quotes a **subprocess's** output inside its failure message, so some counts were the inner process's.
- **Re-run with the runner reading the FINAL summary** (`BASELINE=18`, checksum `bf919155…` identical before/after): **A 15/3 · B 16/2 · C 17/1 · D 16/2 · E 17/1: all five BITE.** The reported "B 5 pass / 1 fail" was the misparse; **B genuinely bites with 2 failures.**
