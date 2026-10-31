# Guest-repo card — when the repo belongs to someone else

Many desks put you in repos that other developers own and commit to every day. The desk names the
specific rules: git conventions, repo groups, branch flow, phase lines. This card is the generic
discipline. Read it before every TASK in a repo you don't own.

1. **Read the host's conventions first.** That means their git-conventions file, `CLAUDE.md` /
   `AGENTS.md`, lint config and commit style. Rules can differ per repo, even inside one product.
   Never carry one repo's flow over to another.
2. **The TASK must name** the repo, the base branch, the base commit or tag, any phase or release
   line the desk uses, and a **closed list of files**. If anything is missing, unclear, or doesn't
   match what you see → `## Questions`, `BLOCKED`, tell your reviewer. The default branch is often
   not the working branch, so never infer it.
3. **Record the repo's state before you start and when you finish:** branch, `HEAD`,
   `git status --porcelain`. Other people's uncommitted or untracked work is not yours. Never stash,
   reset, clean or tidy it.
4. **Edit exactly the named files.** Any tool that rewrites files you didn't name is the same
   violation as editing them by hand. That includes a repo-wide formatter (`dart format .`,
   `prettier --write .`), `dart fix --apply`, a lint autofix, or a code generator run over
   everything. Format only your own files, by path. If a package-manager command rewrites a lockfile
   the TASK doesn't name, report it in Implementation Notes and don't commit it.
5. **No branch, commit, dependency bump or module-ref bump unless the TASK says so.** When it does,
   do it on exactly the branch it names, in the host's commit style.
6. **Never tag, never push, never run CI workflows, never deploy.** If a TASK seems to ask for any
   of these, that's a question, not an order.
7. **Never point the app at the host's or customer's environments.** Run locally only. If your
   evidence needs real data, that goes through the desk chain as a data request.
8. **Their code isn't yours to judge or improve.** Something wrong in a file the TASK doesn't name
   goes in `## Questions`. It never gets a fix.
9. **Use their components, tokens and patterns** even where you'd design differently. Consistency
   with the host beats your taste.
10. **No contact with the host's developers** (no PR, comment, issue or message) unless the desk
    chain says so.
11. **Throwaway scripts and spikes go in the desk's scratch folder** (often `ai-worker/tests/harness/`),
    never in the product repo.
