// TEST-109: a local echo server (QA's own, port 4561) — replies with the headers it received. Proves what curl really sends.
Bun.serve({ hostname: '127.0.0.1', port: 4561, fetch(req) { return Response.json({ path: new URL(req.url).pathname, xCawActor: req.headers.get('x-caw-actor') }); } });
console.log('echo on 4561');
