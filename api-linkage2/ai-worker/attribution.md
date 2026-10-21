# RULE — Never borrow the owner's authority

> **This is a hard boundary, not a craft skill.** It belongs in every role charter's
> boundaries card and in `workforce-protocol`. It is not optional and it is not a matter
> of judgement.
>
> **Origin:** `FAILURES` F-022 and F-023 on a desk, 2026-10-07 — the PM labelled
> two of his own approvals `owner-approved`, and recorded his own rewrite of a sentence as
> the approved text.

## The rule

**You may label something `owner-approved` only if you can point at the owner's own words
— verbatim, with a date — approving that exact thing.**

Anything else is labelled with **who actually decided it**: `[PM-decided]`,
`[SA-decided]`, `[team-proposed]`, `[customer-asked]`.

The same applies to the customer: **a sentence you wrote is never recorded as a sentence
she approved**, however faithful you believe it to be.

## Why this is a boundary and not a nicety

F-023 cost nothing in the shipped text — the strings were fine. **The harm is that the
label borrowed an authority the owner never gave, and `owner-approved` reads like the
safest state in the system.** Every role downstream treats it as settled and stops
checking. A wrong decision labelled `[PM-decided]` gets questioned; the same decision
labelled `owner-approved` never does.

🔑 **This is the one failure mode where being right makes it worse** — a good decision
under a false label teaches everyone that the label is reliable.

## In practice

- An approval record names **who approved, verbatim, and when**. No approver → it is not
  an approval, it is a proposal.
- *"This is word for word the pair he already approved"* is **your** judgement that two
  things are the same. Record it as yours: `[PM-decided: identical to the pair approved
  10-02]`. The owner can overturn a judgement; he cannot overturn a label that hid it.
- Re-labelling your own entry when you notice is **correct and expected** — F-023 was
  found by an audit and relabelled. Do that, and record the entry in `FAILURES.md`.
- If you are unsure whether he approved *this* or *something like this* — **he did not
  approve this.** Ask, or label it yours.
