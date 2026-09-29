// Throwaway (tests/harness): contrast of a region inside a screenshot.
// Usage: node contrast-region.js <file.png> <x> <y> <w> <h>
// Text = brightest-or-darkest minority cluster vs the dominant background colour.
const { PNG } = require("C:/Users/KUYDONG/AppData/Local/Temp/pngtools/node_modules/pngjs");
const fs = require("fs");

const [file, X, Y, W, H] = process.argv.slice(2);
const x0 = +X, y0 = +Y, w = +W, h = +H;
const png = PNG.sync.read(fs.readFileSync(file));

const px = [];
for (let y = y0; y < Math.min(y0 + h, png.height); y++) {
  for (let x = x0; x < Math.min(x0 + w, png.width); x++) {
    const i = (png.width * y + x) * 4;
    px.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
  }
}
const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const freq = new Map();
for (const p of px) freq.set(p.join(","), (freq.get(p.join(",")) || 0) + 1);
const bg = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);
// text pixels = the cluster farthest in luminance from the background (top 5% by distance)
const sorted = [...px].sort((a, b) => Math.abs(lum(b) - lum(bg)) - Math.abs(lum(a) - lum(bg)));
const top = sorted.slice(0, Math.max(20, Math.floor(px.length * 0.03)));
const fg = [0, 1, 2].map((c) => Math.round(top.reduce((s, p) => s + p[c], 0) / top.length));
const l1 = Math.max(lum(fg), lum(bg));
const l2 = Math.min(lum(fg), lum(bg));
console.log("bg:", bg, "fg(text):", fg, "contrast:", ((l1 + 0.05) / (l2 + 0.05)).toFixed(2) + ":1");
