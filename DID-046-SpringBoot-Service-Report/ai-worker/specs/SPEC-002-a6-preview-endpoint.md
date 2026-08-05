# SPEC-002: Restore the อ.6 (a6) mock preview endpoint

- Source: REQ-002
- Status: ACTIVE

## Overview
Restore `GET /api/v1/preview/checklist/a6` — a **no-auth, mock-data** PDF preview
of the full อ.6 layout — mirroring the existing, working a9 preview. It was
removed in commit `b0d9a84` ("Implement A6 checklist report with database
integration"), which replaced the mock a6 preview with a DB-backed one
(`/preview/checklist/a6/db/{requestId}`) and deleted a6's `buildMock`. REQ-002
brings the mock preview back to serve as the correctness baseline for REQ-001.

**Why a separate mock provider (not the a6 builder):** `A6CheckListReportBuilder`
is now DB-connected (its old `buildMock` is gone). Rather than re-mixing mock data
into the DB builder, restore the mock as a small, self-contained provider so the
DB path stays clean and the throwaway preview is easy to delete later (the whole
`PreviewController` is already marked TEMPORARY).

## Current state (verified in code + git)
- `PreviewController` (`/api/v1/preview`) today exposes:
  - `GET /checklist/a6/db/{requestId}` → `A6CheckListReportBuilder.createDataRaw(id)` (DB) — keep as-is.
  - `GET /checklist/a9` → `A9CheckListReportBuilder.createData("preview")` (mock) — the pattern to mirror.
  - **No plain `GET /checklist/a6`** — this is what REQ-002 restores.
- `SecurityConfig` already `permitAll` on `"/api/v1/preview/**"` (line ~72–73) →
  **no security change needed**; the new route is no-auth automatically.
- The old mock lived in `A6CheckListReportBuilder.buildMock(...)` at git
  `b0d9a84~1` (a 130-line builder whose `createData("preview")` returned `buildMock`).
- The `A6CheckListReportData` record shape is **unchanged** since then (verified by
  diff — only line-endings differ), so the restored mock compiles with no adaptation.

## Interface
`GET /document-service/api/v1/preview/checklist/a6?disposition=inline`
- Query: `disposition=inline|attachment` (default `inline`) — same handling as a9.
- Auth: **none** (no X-API-KEY, no bearer) — parity with a9.
- 200 → `application/pdf`, full อ.6 layout from mock data. Filename `a6-preview.pdf`.

## Flow
`previewA6()` → mock provider returns `A6CheckListReportData` (full sample) →
`jasperPdfReportService.exportPdfA6(data)` → bytes → PDF response. Identical
shape to `previewA9()`.

## Non-functional
- Temporary/dev-only endpoint (mock data, no DB). Keep the existing TEMPORARY
  warning comment. No new dependency, no config change.

## Tasks
- TASK-001: Restore a6 mock provider + `previewA6()` endpoint (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
