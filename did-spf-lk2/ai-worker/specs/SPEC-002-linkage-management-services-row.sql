-- ============================================================================
-- SPEC-002 deliverable — REQ-002 item 6
-- Add the `LicenseTransit` service row to Linkage Management
--
--   Target system : did-045-api-linkage-management
--   Target DB     : PostgreSQL, database `linkage_management`  (NOT the LK2 Oracle)
--   Written by    : Sober (SA Lead), 2026-09-07, at the stakeholder's request
--                   ("ให้ sober เขียนให้เลย")
--
-- >>> NOBODY ON THE AI TEAM RUNS THIS. <<<
-- It is text for the stakeholder to execute. No agent has run it, connected to
-- that database, or verified it against a live schema. Everything below was
-- derived by READING the migrations and repository code listed under
-- "Provenance" — so treat it as a reviewed draft, not as tested SQL.
--
-- WHY: REQ-002 makes LK2 log `basicAuthSection = 'LicenseTransit'` for form 9.
-- The dashboard resolves the Thai licence name by matching that value against
-- `services.service_code`. Without this row, new log records show the raw string
-- "LicenseTransit" instead of "ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์".
--
-- The existing `LicenseShipment` row (id acea81e1-4dec-4342-a3da-cb10843f6153)
-- is deliberately LEFT ALONE — decided by the stakeholder 2026-09-07
-- ("เอาตามที่แนะนำ เพิ่มแถว LicenseTransit เก็บแถวเดิมไว้"). Keeping it means
-- historical records still resolve, and it stays reserved for the future form-18
-- endpoint. Do not rename it in place.
-- ============================================================================

-- ── Two traps, both load-bearing. Please read before editing anything below. ──
--
-- 1) is_deleted = true IS CORRECT. It is not leftover rot and must not be
--    "tidied up" to false. Name resolution runs through:
--        ServiceRepository.java:25
--        @Query("SELECT s FROM ServiceEntity s
--                WHERE s.provider.code = :code AND s.isDeleted = true ORDER BY s.seq")
--    Both `licenseNameMap()` and `LogService.buildLicenseIndex()` read through
--    that query. A row with is_deleted = false is INVISIBLE to the dashboard —
--    the exact opposite of the intent. The flag is what hides the อท. provider
--    from the agency list while still using its rows for name resolution.
--
-- 2) seq must be MAX(seq) + 1 across ALL rows of provider DID, including
--    soft-deleted ones. `uq_services_provider_seq UNIQUE (provider_id, seq)`
--    (V1__init_schema.sql:39) is a TABLE-WIDE constraint, not a partial index —
--    unlike uq_services_service_code_active (V17), which is partial
--    (WHERE is_deleted = false) and therefore does not cover these hidden rows.
--    That is also why the INSERT carries its own NOT EXISTS guard instead of
--    relying on a unique constraint for idempotency.


-- ── 1. Pre-check — look before writing (safe, read-only) ─────────────────────
-- Expect: the LicenseShipment row present, and NO LicenseTransit row yet.
SELECT s.service_code, s.name, s.seq, s.is_active, s.is_deleted
FROM   services s
JOIN   providers p ON p.id = s.provider_id
WHERE  p.code = 'DID'
ORDER  BY s.seq;


-- ── 2. The INSERT (idempotent — safe to run twice) ───────────────────────────
INSERT INTO services (id, provider_id, service_code, name, description, seq,
                      is_active, is_deleted, created_by, updated_by,
                      created_at, updated_at)
SELECT gen_random_uuid(),
       p.id,
       'LicenseTransit',
       'ข้อมูลหนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์',
       NULL,
       (COALESCE((SELECT MAX(seq) FROM services WHERE provider_id = p.id), 0) + 1)::smallint,
       true,          -- is_active  — copies the LicenseShipment row
       true,          -- is_deleted — MANDATORY, see trap (1) above
       'system',
       'system',
       now(),
       now()
FROM   (SELECT id FROM providers WHERE code = 'DID' LIMIT 1) p
WHERE  NOT EXISTS (SELECT 1 FROM services s WHERE s.service_code = 'LicenseTransit');
-- Expected result: INSERT 0 1  (or INSERT 0 0 if it already exists — that is fine)


-- ── 3. Verify ───────────────────────────────────────────────────────────────
-- Expect BOTH rows: LicenseShipment (unchanged) and LicenseTransit (new),
-- both is_deleted = true, with different seq values.
SELECT s.service_code, s.name, s.seq, s.is_active, s.is_deleted, s.created_at
FROM   services s
JOIN   providers p ON p.id = s.provider_id
WHERE  p.code = 'DID'
  AND  s.service_code IN ('LicenseShipment', 'LicenseTransit')
ORDER  BY s.seq;

-- After this, a fresh dashboard query resolves the Thai name for new log records.
-- `buildLicenseIndex()` re-reads `services` on every query, so no restart or
-- cache flush is needed.


-- ── 4. Undo, if ever needed ─────────────────────────────────────────────────
-- Only removes the row this script adds. Never touch the LicenseShipment row.
-- DELETE FROM services
-- WHERE  service_code = 'LicenseTransit'
--   AND  provider_id = (SELECT id FROM providers WHERE code = 'DID' LIMIT 1);


-- ============================================================================
-- Two notes for the stakeholder to decide on — both outside this team's scope
-- ============================================================================
--
-- A) YOUR REPO USES FLYWAY. Running this by hand leaves the change absent from
--    migration history, so a rebuilt-from-scratch environment will not have the
--    row. If you want it reproducible, the same statement as
--    `V18__seed_license_transit_service.sql` (body of section 2 only) is
--    probably the better home. That is your call — REQ-002 Q2-4 keeps that repo
--    out of our scope, so I have not written the migration file, only the SQL.
--
-- B) TIMING vs THE LK2 RELEASE. Land this row BEFORE or WITH the REQ-002
--    deployment. In between, new form-9 log records display the raw code
--    "LicenseTransit". Nothing breaks and no data is lost — old records keep
--    resolving because the LicenseShipment row stays — but the dashboard looks
--    wrong for that window.
--
-- ============================================================================
-- Provenance — every fact above came from reading these files, read-only
-- ============================================================================
--   did-045-api-linkage-management/backend/src/main/resources/db/migration/
--     V1__init_schema.sql:26-40        services DDL + uq_services_provider_seq
--     V10__refactor_services_uuid_id.sql   services.id -> UUID
--     V15__seed_license_services_did.sql   the pattern this INSERT mirrors,
--                                          incl. the LicenseShipment row and
--                                          the deliberate is_deleted = true
--     V17__partial_unique_service_code.sql uq_services_service_code_active is
--                                          PARTIAL (WHERE is_deleted = false)
--   backend/src/main/java/com/smart/linkage/
--     modules/service/repository/ServiceRepository.java:25-32
--                                          findHiddenByProviderCode + licenseNameMap
--     modules/log/service/LogService.java:450   buildLicenseIndex (read-time resolve)
--
-- Not verified against a live database — see the banner at the top.
-- ============================================================================
