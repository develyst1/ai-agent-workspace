
    const { ingestMessage } = await import("H:/corner-chat/corner-chat-back/src/core/intake.ts");
    const { db } = await import("H:/corner-chat/corner-chat-back/src/core/db.ts");
    try { const r = await ingestMessage(JSON.parse(process.env.QA_INPUT)); console.log(JSON.stringify(r)); }
    catch (e) { console.log(JSON.stringify({ error: e.name + ": " + e.message })); }
    await db.close();