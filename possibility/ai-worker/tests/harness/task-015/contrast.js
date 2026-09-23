// Throwaway (tests/harness spirit): measure text/background contrast of the rendered error
// alert from a cropped screenshot. Text pixels = brightest cluster; background = mode color.
const { PNG } = require("/tmp/pngtools/node_modules/pngjs");
const fs = require("fs");

const png = PNG.sync.read(fs.readFileSync(process.argv[2]));
const px = [];
for (let i = 0; i < png.data.length; i += 4) {
  px.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
}
const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
// background = most common exact color; text = mean of the brightest 5%
const freq = new Map();
for (const p of px) freq.set(p.join(","), (freq.get(p.join(",")) || 0) + 1);
const bg = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);
const sorted = [...px].sort((a, b) => lum(b) - lum(a));
const top = sorted.slice(0, Math.max(20, Math.floor(px.length * 0.02)));
const fg = [0, 1, 2].map((c) => Math.round(top.reduce((s, p) => s + p[c], 0) / top.length));
const ratio = (lum(fg) + 0.05) / (lum(bg) + 0.05);
console.log("bg:", bg, "fg(text):", fg, "contrast:", ratio.toFixed(2) + ":1");
