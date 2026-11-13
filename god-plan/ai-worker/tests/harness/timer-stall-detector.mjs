// Logs every time this idle Node process's own 500 ms timer fires more than 3 s late (a frozen machine / paused VM).
let last = Date.now();
setInterval(() => {
  const now = Date.now();
  if (now - last > 3000) console.log(`${new Date(now).toISOString()}  timer late by ${now - last - 500} ms`);
  last = now;
}, 500);
setTimeout(() => process.exit(0), 20 * 60 * 1000);
