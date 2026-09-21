import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const ts = createRequire("H:/web-klang/safe-goods-front/package.json")("typescript");
const src = readFileSync("H:/web-klang/safe-goods-front/src/lib/fee.ts", "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: "es2020" } }).outputText;
const mod = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const cases = [
  ["FEE_ADDED","SELLER",100,20,20,[100,20,100,80]],
  ["FEE_ADDED","BUYER",100,20,20,[100,20,120,100]],
  ["FEE_ADDED","SPLIT",100,20,20,[100,20,110,90]],
  ["FEE_ADDED","BUYER",50,20,20,[50,20,70,50]],
  ["FEE_INCLUDED","BUYER",120,20,20,[100,20,120,100]],
  ["FEE_ADDED","BUYER",100,10,30,[100,30,130,100]],
  ["FEE_INCLUDED","SPLIT",111,20,20,[100,21,111,90]],
  ["FEE_INCLUDED","BUYER",121,20,20,[100,21,121,100]],
  ["FEE_INCLUDED","BUYER",20,20,20,null],
];
let ok = true;
for (const [mode,feePayer,enteredPrice,ratePercent,minimum,exp] of cases) {
  const r = mod.computeFee({mode,feePayer,enteredPrice,ratePercent,minimum});
  const got = r && [r.basePrice,r.fee,r.buyerPays,r.sellerReceives];
  const pass = JSON.stringify(got) === JSON.stringify(exp);
  ok &&= pass;
  console.log(pass?"PASS":"FAIL", mode, feePayer, enteredPrice, `${ratePercent}%/${minimum}`, "→", JSON.stringify(got), pass?"":"expected "+JSON.stringify(exp));
  if (mode && exp) {
    const q = await fetch("http://localhost:3001/api/v1/fee/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({priceMode:mode,feePayer,enteredPrice})}).then(r=>r.json());
    if (ratePercent===20&&minimum===20) { const d=q.data; const be=d?[d.basePrice,d.fee,d.buyerPays,d.sellerReceives]:null; console.log("   BE quote:", JSON.stringify(be ?? q.error?.code), JSON.stringify(be)===JSON.stringify(got)?"= FE":"≠ FE"); }
  }
}
console.log("minIncludedTotal BUYER/SPLIT/SELLER:", mod.minIncludedTotal("BUYER",20,20), mod.minIncludedTotal("SPLIT",20,20), mod.minIncludedTotal("SELLER",20,20));
console.log(ok ? "ALL PASS" : "SOME FAIL");
