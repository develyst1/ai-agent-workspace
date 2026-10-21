# Skill — Quote the customer. Never paraphrase a rule into existence.

**Who needs it:** PM / BA — anyone who turns what a human said into something the team builds on.
**Costs it has already paid here:** `FAILURES` F-015, the most expensive entry in the file —
a built task stopped, an SA re-size (M→L), three redesigns. Also F-016 and F-018.

---

## The one line

**Their words are evidence; your restatement is a design decision.** Mark it as yours,
and get it confirmed in *consequences*, not in *rules*, before anything is built on it.

## What actually happened (F-015)

The customer described her leave policy. It was written down as **"every leave adds one
week"**. The truth: an ordinary leave adds nothing; only three explicit triggers add a
week, and a make-up that cannot fit means the leave is **refused**.

That one sentence became an SA re-size, four rulings and a finished task. It was caught
by **the customer's own numbers** — *"15 ค่ะ" / "6 ค่ะ"* — after the build.

🔑 **Nobody lied and nobody was careless.** A paraphrase is how a human being
understands something; the defect is that **the paraphrase was stored where the original
belonged**, and from then on everyone downstream was reasoning about a sentence the
customer never said.

## How to do it

**1. Keep the original, verbatim, next to your restatement.**

```markdown
> ลูกค้า (10-06, verbatim): "<พิมพ์ตามที่เธอพูดเป๊ะ>"
the PM's reading: every leave adds one week.   ← MINE, unconfirmed
```

Anyone downstream can now see which half is testimony and which half is interpretation.
Without the first line, **your sentence silently becomes the requirement.**

**2. Confirm by consequence, not by rule.**

Do not ask *"so every leave adds a week, right?"* — people agree with tidy rules about
their own business even when the rule is wrong. **Ask for a number or an outcome:**

> *"เคสนี้ลาวันที่ 3 แล้วเลื่อนไม่ได้ — คอร์สจบวันไหนครับ"*

F-015 was caught exactly this way, by two numbers. **Use them before the build, not after.**

**3. Treat the customer's own statement of their rule with the same care.**
They may describe their intent wrongly — not dishonestly, just the way anyone
misdescribes a habit they perform without thinking. **Confirm what should happen in named
cases; do not accept the rule as given.**

**4. A forwarded screenshot is not a new requirement.** Before calling anything new,
search `requirements/` for it. In F-015's own entry, a forwarded set was treated as a new
intake when it was already shipped — *"เห้ยไม่ใช่ 6 ข้อนี่มันตั้งนานแล้ว"*.

**5. Nothing downstream moves on an unconfirmed reading.** No SPEC, no re-size, no TASK,
no ruling. If the team must start, say in the handoff: **"this rests on my reading of her
words, not yet confirmed"** — then whoever builds on it knows what they are standing on.

## The test, before it becomes a requirement

> **Can I show the sentence she actually said — and has she agreed to an outcome, not just
> to my rule?**

Both yes → it is a requirement.
Either no → it is your reading, labelled, and nothing is built on it yet.
