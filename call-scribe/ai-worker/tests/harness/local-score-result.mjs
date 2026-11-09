#!/usr/bin/env node
// local-score-result.mjs — TEST-102's counting method for REQ-101 AC-3 and AC-4. No dependencies.
//
// Proves:  given a known script and a result, the numbers AC-3 and AC-4 are judged on, computed the same way every run.
// Run:     node tests/harness/local-score-result.mjs --self-test
//          node tests/harness/local-score-result.mjs <script.json> <result.json>
//            script.json = { "id", "turns": [{ "voice": "A", "text": "..." }] }
//            result.json = [{ "speaker": "ผู้พูด 1", "text": "..." }]   (the app's output, adapted to this shape by hand
//                          or by an adapter once the SPEC names the real one)
// Does NOT prove: that the transcript is good enough (AC-10, the owner's), that the summary is right (AC-5 is judged by
//          reading), or anything about real phone-call audio. It scores text; it never touches the app or a provider.
//
// Method, fixed before any build exists, so it cannot be tuned to a result:
//  - Words: Intl.Segmenter('th', word), word-like segments only. Lowercased, NFC, Thai digits become Arabic digits.
//    Thai has no spaces, so splitting on spaces would count one sentence as one word.
//  - AC-3 pass line: word recall >= 80%. A script word counts once per occurrence in the transcript (multiset), which
//    is the AC's "appear in the transcript". Also recorded, not judged: recall in order (LCS), and transcript words not
//    in the script (AC-3 has no line for added text, so invented text is reported rather than passed silently).
//  - AC-4 pass line: exactly two labels, and >= 80% of script turns carry the right voice. Script and output words are
//    aligned by LCS. A turn takes the label most of its aligned words carry; a turn with no aligned word is wrong.
//    Each label maps to the voice it matches on the most turns, since labels are arbitrary.

const PASS_LINE = 0.8;
const seg = new Intl.Segmenter('th', { granularity: 'word' });
const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

export function words(text) {
  const clean = text.normalize('NFC').toLowerCase().replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));
  return [...seg.segment(clean)].filter((s) => s.isWordLike).map((s) => s.segment);
}

// Longest common subsequence, returning aligned index pairs. One byte per cell: 10,000 x 10,000 words is about 100 MB.
function lcsPairs(a, b) {
  const w = b.length + 1;
  const dir = new Uint8Array((a.length + 1) * w);
  let prev = new Uint32Array(w);
  let cur = new Uint32Array(w);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) { cur[j] = prev[j - 1] + 1; dir[i * w + j] = 1; }
      else if (prev[j] >= cur[j - 1]) { cur[j] = prev[j]; dir[i * w + j] = 2; }
      else { cur[j] = cur[j - 1]; dir[i * w + j] = 3; }
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  const pairs = [];
  for (let i = a.length, j = b.length; i > 0 && j > 0;) {
    const d = dir[i * w + j];
    if (d === 1) { pairs.push([i - 1, j - 1]); i--; j--; }
    else if (d === 2) i--;
    else j--;
  }
  return pairs.reverse();
}

function pct(n) { return Math.round(n * 1000) / 10; }

export function scoreAc3(script, result) {
  const sw = script.turns.flatMap((t) => words(t.text));
  const rw = result.flatMap((r) => words(r.text));
  const bag = new Map();
  for (const w of rw) bag.set(w, (bag.get(w) ?? 0) + 1);
  let found = 0;
  for (const w of sw) {
    const n = bag.get(w) ?? 0;
    if (n > 0) { found++; bag.set(w, n - 1); }
  }
  const extra = [...bag.values()].reduce((a, b) => a + b, 0);
  const recall = sw.length ? found / sw.length : 0;
  return {
    scriptWords: sw.length,
    transcriptWords: rw.length,
    wordsFound: found,
    recallPct: pct(recall),
    inOrderRecallPct: sw.length ? pct(lcsPairs(sw, rw).length / sw.length) : 0,
    extraWordsNotInScript: extra,
    pass: recall >= PASS_LINE,
  };
}

export function scoreAc4(script, result) {
  const labels = [...new Set(result.map((r) => r.speaker))];
  const sw = [];
  const swTurn = [];
  script.turns.forEach((t, i) => { for (const w of words(t.text)) { sw.push(w); swTurn.push(i); } });
  const rw = [];
  const rwLabel = [];
  for (const r of result) for (const w of words(r.text)) { rw.push(w); rwLabel.push(r.speaker); }

  const votes = script.turns.map(() => new Map());
  for (const [i, j] of lcsPairs(sw, rw)) {
    const v = votes[swTurn[i]];
    v.set(rwLabel[j], (v.get(rwLabel[j]) ?? 0) + 1);
  }
  const turnLabel = votes.map((v) => [...v.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null);

  const tally = new Map();
  turnLabel.forEach((label, i) => {
    if (label === null) return;
    const v = script.turns[i].voice;
    if (!tally.has(label)) tally.set(label, new Map());
    tally.get(label).set(v, (tally.get(label).get(v) ?? 0) + 1);
  });
  const labelToVoice = {};
  for (const [label, m] of tally) labelToVoice[label] = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const right = turnLabel.filter((label, i) => label !== null && labelToVoice[label] === script.turns[i].voice).length;
  const share = script.turns.length ? right / script.turns.length : 0;
  return {
    labels,
    exactlyTwoLabels: labels.length === 2,
    scriptTurns: script.turns.length,
    turnsRight: right,
    turnsWithNoAlignedWord: turnLabel.filter((l) => l === null).length,
    rightPct: pct(share),
    labelToVoice,
    pass: labels.length === 2 && share >= PASS_LINE,
  };
}

function selfTest() {
  const script = {
    id: 'self-test',
    turns: [
      { voice: 'A', text: 'ประชุมงบประมาณวันศุกร์ที่ 14 พฤศจิกายน' },
      { voice: 'B', text: 'ได้ครับ ผมจองห้องชั้นสามไว้แล้ว' },
      { voice: 'A', text: 'ขอย้ายไปห้อง meeting ชั้นห้าได้ไหม' },
      { voice: 'B', text: 'ได้ครับ เดี๋ยวผมแจ้งฝ่ายอาคารให้' },
      { voice: 'A', text: 'งบการตลาดรอบนี้สองแสนบาท' },
    ],
  };
  const same = script.turns.map((t) => ({ speaker: t.voice === 'A' ? 'ผู้พูด 1' : 'ผู้พูด 2', text: t.text }));
  const swapped = same.map((r) => ({ ...r, speaker: r.speaker === 'ผู้พูด 1' ? 'ผู้พูด 2' : 'ผู้พูด 1' }));
  const oneLabel = same.map((r) => ({ ...r, speaker: 'ผู้พูด 1' }));
  const threeLabels = same.map((r, i) => ({ ...r, speaker: i === 4 ? 'ผู้พูด 3' : r.speaker }));
  const flip = (r) => (r.speaker === 'ผู้พูด 1' ? 'ผู้พูด 2' : 'ผู้พูด 1');
  const wrongOne = same.map((r, i) => ({ ...r, speaker: i === 0 ? flip(r) : r.speaker }));
  const wrongTwo = same.map((r, i) => ({ ...r, speaker: i < 2 ? flip(r) : r.speaker }));
  const garbage = [{ speaker: 'ผู้พูด 1', text: 'วันนี้อากาศดีมาก ฝนไม่ตกเลย' }, { speaker: 'ผู้พูด 2', text: 'ใช่ ท้องฟ้าสวย' }];
  const spaced = same.map((r) => ({ ...r, text: [...words(r.text)].join(' ') }));
  const thaiDigits = same.map((r) => ({ ...r, text: r.text.replace('14', '๑๔') }));
  const merged = [{ speaker: 'ผู้พูด 1', text: same[0].text + ' ' + same[2].text + ' ' + same[4].text },
    { speaker: 'ผู้พูด 2', text: same[1].text + ' ' + same[3].text }];
  const padded = same.concat([{ speaker: 'ผู้พูด 1', text: 'ลูกค้าขอเลื่อนสัญญาออกไปอีกหนึ่งปี' }]);
  const nothing = [];

  // Boundary: a 10-word script whose transcript holds exactly 8 of them, then exactly 7.
  const tenWords = 'หนึ่ง สอง สาม สี่ ห้า หก เจ็ด แปด เก้า สิบ';
  const boundary = { id: 'boundary', turns: [{ voice: 'A', text: tenWords }] };
  const eight = [{ speaker: 'ผู้พูด 1', text: 'หนึ่ง สอง สาม สี่ ห้า หก เจ็ด แปด' }];
  const seven = [{ speaker: 'ผู้พูด 1', text: 'หนึ่ง สอง สาม สี่ ห้า หก เจ็ด' }];

  // Each row states its prediction first; the check is whether the code agrees.
  const cases = [
    ['identical -> AC-3 pass', () => scoreAc3(script, same).pass, true],
    ['identical -> 100%', () => scoreAc3(script, same).recallPct, 100],
    ['garbage text -> AC-3 FAIL (the old AC could not fail)', () => scoreAc3(script, garbage).pass, false],
    ['empty result -> AC-3 FAIL', () => scoreAc3(script, nothing).pass, false],
    ['spaces between Thai words -> still 100%', () => scoreAc3(script, spaced).recallPct, 100],
    ['Thai digits -> still 100%', () => scoreAc3(script, thaiDigits).recallPct, 100],
    ['exactly 8 of 10 words -> pass at the line', () => scoreAc3(boundary, eight).pass, true],
    ['7 of 10 words -> FAIL just under the line', () => scoreAc3(boundary, seven).pass, false],
    ['invented sentence -> still passes, but is counted', () => scoreAc3(script, padded).extraWordsNotInScript > 0, true],
    ['identical -> AC-4 pass', () => scoreAc4(script, same).pass, true],
    ['labels swapped -> AC-4 pass, labels are arbitrary', () => scoreAc4(script, swapped).pass, true],
    ['one label on every turn -> AC-4 FAIL (the old AC could not fail)', () => scoreAc4(script, oneLabel).pass, false],
    ['three labels -> AC-4 FAIL', () => scoreAc4(script, threeLabels).pass, false],
    ['1 of 5 turns on the wrong voice -> 80%, pass at the line', () => scoreAc4(script, wrongOne).pass, true],
    ['1 of 5 turns wrong -> 80% right', () => scoreAc4(script, wrongOne).rightPct, 80],
    ['2 of 5 turns on the wrong voice -> AC-4 FAIL', () => scoreAc4(script, wrongTwo).pass, false],
    ['2 of 5 turns wrong -> 60% right', () => scoreAc4(script, wrongTwo).rightPct, 60],
    ['turns merged per speaker, order lost -> still reported, not crashed', () => typeof scoreAc4(script, merged).rightPct, 'number'],
    ['empty result -> AC-4 FAIL', () => scoreAc4(script, nothing).pass, false],
  ];
  let bad = 0;
  for (const [name, run, want] of cases) {
    const got = run();
    const ok = got === want;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'BAD '} ${name}${ok ? '' : ` — wanted ${want}, got ${got}`}`);
  }
  console.log(`${cases.length - bad} of ${cases.length} as predicted`);
  process.exit(bad ? 1 : 0);
}

const [a, b] = process.argv.slice(2);
if (a === '--self-test') selfTest();
else if (a && b) {
  const fs = await import('node:fs');
  const script = JSON.parse(fs.readFileSync(a, 'utf8'));
  const result = JSON.parse(fs.readFileSync(b, 'utf8'));
  console.log(JSON.stringify({ script: script.id, ac3: scoreAc3(script, result), ac4: scoreAc4(script, result) }, null, 2));
} else {
  console.error('usage: local-score-result.mjs --self-test | <script.json> <result.json>');
  process.exit(2);
}
