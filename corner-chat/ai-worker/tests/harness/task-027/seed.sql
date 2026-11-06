-- TASK-027 seed. Run ONLY on the throwaway database corner_chat_app_b (local cluster, dropped when the TASK is done).
-- Made-up data, nothing real. Columns per SPEC-001 §5.
--
-- Made-up app user (created through POST /api/v1/admin/users, not by SQL):
--   email    appb@corner.test
--   password AppB-Test-2026
--
-- Usage: psql <url of corner_chat_app_b> -v ON_ERROR_STOP=1 -f seed.sql

BEGIN;

INSERT INTO messages
  (id, user_id, channel, external_id, sender_key, sender_name, group_id, group_name, subject, text,
   mail_to, mail_cc, mail_message_id, recipient_kind, has_attachments, attachment_names,
   received_at, filter_state, outcome, notified_at)
SELECT v.id::uuid, u.id, v.channel, v.ext, v.skey, v.sname, v.gid, v.gname, v.subject, v.body,
       v.mail_to, v.mail_cc, v.mid, v.rk, v.att, v.att_names,
       v.at::timestamptz, 'done', v.outcome, CASE WHEN v.outcome = 'notified' THEN v.at::timestamptz END
FROM users u,
(VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'line', 'seed-l-1', 'U0001', 'สมชาย ใจดี', 'G001', 'ทีมขายภาคเหนือ', NULL::text,
   E'@ทุกคน ประชุมด่วนพรุ่งนี้ 9 โมงเช้า ห้องประชุมใหญ่\nอย่าลืมเอกสารสรุปยอดไตรมาสนี้มาด้วย',
   NULL::text[], NULL::text[], NULL::text, 'mention_all', false, '{}'::text[], '2026-11-01 17:42:00+07', 'notified'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'mail', 'seed-m-2', 'sales@vendor.test', 'บริษัท ภูมิพัฒน์ จำกัด', NULL, NULL, 'ใบเสนอราคาเครื่องพิมพ์ฉลากรุ่นใหม่',
   E'เรียนคุณลูกค้า\nตามที่สอบถามราคาเครื่องพิมพ์ฉลาก ขอส่งใบเสนอราคาตามไฟล์แนบ\nราคานี้มีผลถึงสิ้นเดือนพฤศจิกายน',
   ARRAY['appb@corner.test'], ARRAY[]::text[], '<seed-m-2@fixture.test>', 'to', true, ARRAY['ใบเสนอราคา.pdf'], '2026-11-01 11:10:00+07', 'notified'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'line', 'seed-l-3', 'U0003', 'คุณธนา', 'G003', 'โครงการคลังสินค้า', NULL,
   E'ของล็อตใหม่ถึงแล้วนะครับ\nรบกวนเช็กจำนวนก่อนเซ็นรับ',
   NULL, NULL, NULL, 'to', false, '{}', '2026-10-31 20:15:00+07', 'notified'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'line', 'seed-l-4', 'U0004', 'น้องมิ้นท์', 'G004', 'ชมรมวิ่งเช้า', NULL,
   E'วันนี้ใครไปวิ่งสวนสาธารณะบ้างคะ\nมีขนมมาฝากด้วยนะ',
   NULL, NULL, NULL, 'to', false, '{}', '2026-11-01 13:02:00+07', 'held'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'mail', 'seed-m-5', 'news@shop.test', 'ร้านหนังสือมุมสวน', NULL, NULL, 'ข่าวสารและโปรโมชั่นประจำเดือนพฤศจิกายน',
   E'ลดสูงสุด 40% ทุกหมวดหนังสือ\nเฉพาะสมาชิก ตลอดเดือนนี้เท่านั้น',
   ARRAY['list@shop.test'], ARRAY[]::text[], '<seed-m-5@fixture.test>', 'list', false, '{}', '2026-11-01 15:48:00+07', 'held'),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'line', 'seed-l-6', 'U0006', 'พี่แอน', 'G006', 'เพื่อนร่วมรุ่น', NULL,
   E'เจอกันงานเลี้ยงรุ่นเดือนหน้านะทุกคน\nใครมาได้ช่วยกดไลก์ไว้ด้วย',
   NULL, NULL, NULL, 'to', false, '{}', '2026-10-29 19:20:00+07', 'held')
) AS v(id, channel, ext, skey, sname, gid, gname, subject, body, mail_to, mail_cc, mid, rk, att, att_names, at, outcome)
WHERE u.email = 'appb@corner.test';

INSERT INTO decisions
  (message_id, decided_by, outcome, summary, score, reason, bar,
   layer1_provider, layer1_model, layer2_provider, layer2_model, prompt_version, decided_at)
VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'ai', 'notified', 'ประชุมด่วนพรุ่งนี้ 9 โมงเช้า', 86,
   'มีนัดประชุมที่ต้องเข้าและมีกำหนดเวลาชัดเจน', 70, 'gateway', 'fast-1', 'gateway', 'smart-2', 'p3', '2026-11-01 17:42:05+07'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'ai', 'notified', 'ผู้ขายส่งใบเสนอราคาเครื่องพิมพ์ มีผลถึงสิ้นเดือน', 91,
   'ตอบคำถามเรื่องราคาที่คุณสอบถามไว้ และมีกำหนดหมดอายุ', 70, 'gateway', 'fast-1', 'gateway', 'smart-2', 'p3', '2026-11-01 11:10:05+07'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'ai_unavailable', 'notified', NULL, NULL,
   'AI ไม่ได้ตรวจ', 70, NULL, NULL, NULL, NULL, NULL, '2026-10-31 20:15:05+07'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'ai', 'held', 'ชวนไปวิ่งที่สวนสาธารณะและมีขนมมาฝาก', 18,
   'เป็นการพูดคุยทั่วไปในกลุ่ม ไม่ได้ถึงตัวคุณ', 70, 'gateway', 'fast-1', NULL, NULL, 'p3', '2026-11-01 13:02:05+07'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'ai', 'held', 'ร้านหนังสือแจ้งโปรโมชั่นประจำเดือน', 32,
   'เป็นข่าวโปรโมชั่นทั่วไป ไม่ตรงกับเงื่อนไขของคุณ', 70, 'gateway', 'fast-1', 'gateway', 'smart-2', 'p3', '2026-11-01 15:48:05+07'),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'ai', 'held', 'พี่แอนชวนไปงานเลี้ยงรุ่นเดือนหน้า', 25,
   'ข้อความถึงทุกคนในกลุ่ม ไม่ได้เจาะจงถึงคุณ', 70, 'gateway', 'fast-1', NULL, NULL, 'p3', '2026-10-29 19:20:05+07');

COMMIT;
