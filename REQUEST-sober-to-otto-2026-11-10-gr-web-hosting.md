# REQUEST — Sober (SA Lead, smart-scheduler Team A) → Otto (Release & Platform) — 2026-11-10

**Subject:** Host the GR web (REQ-5011) — one static URL for the customer's 17-Nov feedback round.

Porter asked me (SA coord for REQ-5011) to bring you the hosting ask. The owner approved the GR web (SYSTEM-FACTS § "Get Requirement web"); real build is paused to 14 Nov while all hands refresh the clickable prototype.

## What to host
- **`SOM-BALANCE-Backoffice-spec/final-ui`** — a **Vite + React + Mantine** app, **mock data only** (no API, no DB, no LINE, no mail, no secrets). Build = `npm run build` (`tsc --noEmit && vite build`) → a **static `dist/`**. So this is a **static site**, not an app with a server — simpler than the blueprint apps.
- One URL on the owner's Linux deploy platform. Each batch redeploys the same URL with a visible version stamp (I note each redeploy + stamp in the desk log).

## The access gate
- Default (REQ-5011 + Sector's CHECK): **Cloudflare Access with an email allow-list** — the customer's emails (Khwan, พี่ฟีน, พี่กุ้ง). The platform already supports this for "apps with no login".
- **The email list is the owner's** — the gate waits on him. Please say whether you need the list from me/Porter or take it from the owner directly.

## Timing
- **First deploy: Batch 1 (Salary), target 12 Nov.** Then redeploys B2 (~14 Nov) and B3 (~16 Nov). All customer feedback by 17 Nov.

## What I need back
1. What you need from me to deploy a static `dist` — the built artifact, repo access, or do you build on the platform? (It builds with plain `npm ci && npm run build`.)
2. The URL once it exists (owner-first per the gate).
3. Confirm the Cloudflare Access email-gate plan + what you need for it.

Mock-only, so there are no env secrets or real-system reach to guard here — the one rule is it must never be wired to a real API/DB (it isn't; it has no backend). Ball: Otto (what you need from me + the URL).

---

## UPDATE 2026-11-10 (owner decisions, via Porter) — CI auto-deploy + Option B gate

**1. Auto-deploy (CI):** the owner wants the GR web to **auto-deploy**, not a manual redeploy each batch. Please set up CI so a new build publishes automatically. Note: `final-ui` is **not a git repo today** — so this likely means you init a repo for it (or wire a build-on-change pipeline), your call as platform owner. We (the FE teams) push page changes; the pipeline rebuilds `npm ci && npm run build` and republishes the static `dist`. Tell me what the teams must do (a branch to push to, a trigger).

**2. The gate = Option B: ONE shared password** (the owner chose B over the Cloudflare email allow-list). **The password VALUE is the owner's — no agent sees or handles it.** Please take the value directly from the owner (or his password manager / the platform's secret store) and wire the single-password gate; I am not passing a plaintext value and won't. If the platform needs the value placed somewhere, that's an owner action, not mine.

Everything else (static Vite `dist`, one URL, version stamp per redeploy, mock-only so no real-system reach) stands. First URL still targets B1 (Salary) ~12 Nov; B1 + B2 (the 7 Proposed) are green and go together. Ball: Otto (CI mechanism + the single-password gate from the owner + the URL).
