// TEST-104 #9a/#9b: a tiny local page server. /page = a Thai page · /hop = redirect to 127.0.0.1:4296 (not on the allow-list).
const [port] = process.argv.slice(2);
Bun.serve({ hostname: '127.0.0.1', port: Number(port), fetch(req) {
  const p = new URL(req.url).pathname;
  if (p === '/hop') return Response.redirect('http://127.0.0.1:4296/page', 302);
  return new Response('<html><body><h1>หน้าทดสอบ TEST-104</h1><p>เนื้อหาใหม่หลังเช็คอีกครั้ง</p></body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
} });
console.log(`page server on ${port}`);
