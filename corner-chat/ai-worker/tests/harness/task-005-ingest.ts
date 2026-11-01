// TASK-005 live check (throwaway): ingest one made-up LINE message for a user through the real ingestMessage.
// Run from the corner-chat-back checkout so its .env (DATABASE_URL) and src/ are found:
//   cd <corner-chat-back> && bun <this file> <user email> "<text>" [group name]
const [email, text, groupName = "ทีมทดสอบ"] = process.argv.slice(2);
if (!email || !text) {
  console.error('usage: bun task-005-ingest.ts <user email> "<text>" [group name]');
  process.exit(2);
}

const { db } = await import(`${process.cwd()}/src/core/db.ts`);
const { ingestMessage } = await import(`${process.cwd()}/src/core/intake.ts`);

const [user] = await db`select id from users where email = ${email.trim().toLowerCase()}`;
if (!user) {
  console.error(`no user with email ${email}`);
  process.exit(1);
}

const result = await ingestMessage({
  userId: user.id,
  channel: "line",
  externalId: `harness-${crypto.randomUUID()}`,
  sender: { key: "U-made-up-sender", name: "ผู้ส่งทดสอบ" },
  groupId: "G-made-up-group",
  groupName,
  text,
  recipientKind: "mention",
  hasAttachments: false,
  attachmentNames: [],
  receivedAt: new Date().toISOString(),
});
console.log(JSON.stringify(result));
await db.close();
