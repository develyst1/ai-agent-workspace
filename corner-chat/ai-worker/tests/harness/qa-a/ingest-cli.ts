// One made-up message through the product's ingestMessage into QA's own DB; waits for the filter. Throwaway harness.
//   bun ingest-cli.ts <userId> "<text>" [json-extra]   → prints {"messageId", "outcome", "decidedBy"}
import { ingest, lineMsg, qadb, waitDecided } from "./qadb";
const [userId, text, extra] = process.argv.slice(2);
const r: any = ingest(lineMsg(userId!, text!, extra ? JSON.parse(extra) : {}));
if (!r.messageId) { console.log(JSON.stringify(r)); process.exit(1); }
const d = await waitDecided(r.messageId, 60000);
const [dec] = await qadb`select decided_by from decisions where message_id = ${r.messageId}`;
console.log(JSON.stringify({ messageId: r.messageId, outcome: d?.outcome, decidedBy: dec?.decided_by }));
await qadb.close();
