# Prod stack traces — teacher archive 502 + availability 500 (2026-07-28)

> DATA REQUEST answer for SPEC-007 / TASK-029. Stakeholder captured these from the live server
> (`som.develyst.online`) and pasted them to Porter, who transcribed them here. Raw was heavily
> minified (Bun bundle); the diagnostic lines are preserved verbatim below.

## Prod deploy fact (inferred from the traces)
- `create` + `edit` teacher WORK in prod, `archive` + `switch active/inactive` FAIL.
- The archive error comes from the **`backoffice-back` process (port 4010)** and queries
  **`ops.catalog_items`** → the deployed backoffice is the **OLD ops-live build**, NOT the
  TASK-027 ops-retired (`/auth`+`/bo` only) build. Ops IS reachable in prod.

---

## 1) `PATCH /api/teachers/availability` → 500 INTERNAL  (process: `som-back`)

Key diagnostic lines:
```
error: Failed query: select "id","name","nickname","type","active","archived","work_days",
       "line_user_id","created_at","updated_at" from "teachers" where "teachers"."id" = $1 limit $2
params: availability,1
Z4: invalid input syntax for type uuid: "availability"
   code: "22P02"
   routine: "string_to_uuid"
   where: "unnamed portal parameter $1 = '...'"
```

**Plain reading:** the request `PATCH /teachers/availability` is being handled as a **lookup by id**
with `id = "availability"` → Postgres rejects `"availability"` as a UUID → 500. The `teachers`
mapper is never reached. ⇒ This is a **routing / path-param bug** (a dedicated `/teachers/availability`
route is missing or is shadowed by `/teachers/:id`), **not** the `mappers.ts` dangling-`subject`
issue that TASK-029 §3 fixes. TASK-029's `.filter(ts => ts.subject)` is harmless but does not address
this. SA to direct the routing fix.

---

## 2) `POST /api/teachers/{id}/archive` → 502  (process: `backoffice-back`, :4010)

Key diagnostic lines:
```
error: Failed query: select ...,"item_group","item_type",... from "ops"."catalog_items"
       where (organization_id=$1 and external_source=$2 and external_ref=$3
              and item_type=$4 and active=$5 and metadata->>'kind'='FREELANCE_BUDGET') limit $6
params: 00707c4d-6d4c-4a68-be76-0aa588ad018b, smart-scheduler,
        4e58281c-a68b-45e7-92ce-ddcdd98c1df9, EXPENSE, true, 1
X4: column "item_group" does not exist
   code: "42703"
   routine: "errorMissingColumn"
```

**Plain reading:** archive on `som-back` calls the backoffice, which runs the freelance-budget lookup
against **`ops.catalog_items`** and fails because the column **`item_group` does not exist** in the
prod DB (migration `0001_item_pl.sql` not applied — the known shared-`__drizzle_migrations` drift).
The backoffice errors → `som-back` gets a bad response → Cloudflare 502.

⇒ Root cause is **(a) prod runs the ops-live build + (b) a prod DB migration drift**, NOT a 404 from
retired routes. **TASK-029 §1 (remove the ops teacher-sync call) still fixes archive** (archive stops
calling the backoffice) — good — but the re-deploy plan should account for the real prod state
(ops-live + `item_group` drift); moving to the TASK-027 `bo`/shared-DB build makes the ops query moot.
