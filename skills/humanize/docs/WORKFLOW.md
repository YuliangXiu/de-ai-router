# The workflow

The point of this kit is not beating AI detectors. It is having a writing and editing workflow you can actually inspect: visible rules, explainable scores, reviewable diffs, and guardrails that run without you remembering to run them.

Each stage borrows the best quality of a different tool.

## 1. Draft

Write the draft however you like, with or without a model. If a model drafts it, the skill's always-on rules (see the README) reduce the slop at the source.

## 2. Audit

Make the problems visible before touching the text.

- **By hand or by agent:** run the [checklist](../references/checklist.md), or invoke the skill in pasted-text mode and read its audit bullets.
- **Mechanically:** `sloplint analyze draft.md` lists every finding with a line number and the rule that fired. The score is explainable on purpose; a black-box verdict you can't argue with is how you end up rewriting good prose. (This is the brandonwise/humanizer quality.)

## 3. Rewrite

The skill (SKILL.md) runs a draft, then audits its own draft, then produces the final rewrite. Two rules make the rewrite trustworthy:

- **No fabrication.** Specifics come from the source or the author, never from the rewriter.
- **Voice calibration.** Give it a sample of your own writing and it matches your habits instead of producing generic "clean" output. (Both are the blader/humanizer quality.)

## 4. Verify with diffs and undo

Work git-first, the way Aider treats code edits:

- Rewrite files in place only on a clean working tree, so every change lands as a reviewable diff.
- Read the diff before committing. `git diff --word-diff` is the right view for prose.
- Undo is `git checkout -- file.md`, not an apology.
- Re-run `sloplint score` after the rewrite. Under 25 is the target; the tests in `tests/` keep the scorer honest the same way a test suite keeps a refactor honest.

## 5. Gate

Guardrails catch what the session missed. (This is the Biome/Semgrep quality: cheap, automatic, post-edit.)

- **Pre-commit:** `scripts/install-git-hook.sh` installs a hook that scans staged markdown and blocks commits above a threshold.
- **CI:** `.github/workflows/slop-check.yml` runs the tests and scans your docs on every push.

## Rules as data

All detection lives in [rules/slop-rules.json](../rules/slop-rules.json), not in code. Adding a house rule is a JSON edit plus a test, and the rule then applies identically in the CLI, the hook, and CI. (This is the ast-grep/OpenRewrite quality: cleanup defined as repeatable, reviewable, versioned rules rather than one-off edits.)

If your team bans a phrase, add it to `phrases` with a `fix` and `sloplint fix` will handle it mechanically forever after.

## Auditing a whole repo

```bash
# Rank every doc by how AI-flavored it is
sloplint scan docs/

# Gate: fail when anything scores 50 or above
sloplint scan docs/ --fail-above 50

# JSON for dashboards or baselines
sloplint scan docs/ --json > slop-report.json
```

Fix the worst files first, one at a time, through the skill's file mode. Rewrites land as diffs; review them like code.
