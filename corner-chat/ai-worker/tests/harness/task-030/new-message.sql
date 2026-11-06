-- TASK-030: insert ONE new made-up message for the made-up app user, as if the filter had just decided it.
-- Run ONLY on the throwaway database corner_chat_app_b (local cluster, dropped when the TASK is done).
-- Usage: psql <url of corner_chat_app_b> -v ON_ERROR_STOP=1 -v ext=n-001 -v outcome=notified -f new-message.sql
--   outcome=notified  -> notified_at = now(): the watcher must raise a notification for it
--   outcome=held      -> no notified_at:      the watcher must stay silent
WITH m AS (
  INSERT INTO messages
    (user_id, channel, external_id, sender_key, sender_name, group_id, group_name, text, recipient_kind,
     received_at, filter_state, outcome, notified_at)
  SELECT id, 'line', :'ext', 'U9001', 'คุณทดสอบ', 'G9001', 'กลุ่มทดสอบ ' || :'ext',
         'ข้อความใหม่สำหรับทดสอบการแจ้งเตือน ' || :'ext' || E'\nบรรทัดที่สอง',
         'to', now(), 'done', :'outcome', CASE WHEN :'outcome' = 'notified' THEN now() END
  FROM users WHERE email = 'appb@corner.test'
  RETURNING id
)
INSERT INTO decisions (message_id, decided_by, outcome, summary, score, reason, bar, layer1_provider, layer1_model, prompt_version)
SELECT id, 'ai', :'outcome', 'ข้อความทดสอบ ' || :'ext', 88, 'ทดสอบ', 70, 'gateway', 'fast-1', 'p3' FROM m;
