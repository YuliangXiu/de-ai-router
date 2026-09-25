# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A kit for keeping AI-flavored writing out of prose and repos. Three artifacts matter:

- `SKILL.md`: the humanizer skill. Portable YAML frontmatter followed by the numbered pattern catalog. **Source of truth for the 41 patterns.** Edit it like a careful instruction document, not code.
- `rules/slop-rules.json`: the machine-readable rule pack. **Source of truth for what `sloplint` flags.** Vocabulary tiers, phrases (with optional `fix`), and regex detectors.
- `bin/sloplint.js`: the zero-dependency scanner. Keep it dependency-free and Node 18 compatible.

## The maintenance contract

- The skill currently defines **41 numbered patterns**. If you add, remove, or renumber any, update the README, the skill frontmatter description, and every cross-reference in the same change.
- The pattern catalog (SKILL.md) and the rule pack (slop-rules.json) overlap but are not mirrors: the skill holds judgment calls a regex can't make; the rule pack holds only what a machine can check without heavy false positives. When you add a mechanically checkable pattern to one, consider the other.
- Version lives in three places: `SKILL.md` frontmatter (`metadata.version`), `package.json`, and `.claude-plugin/plugin.json`. Bump them together.
- Every new rule in `slop-rules.json` gets a test in `tests/sloplint.test.js`. Run `npm test` before finishing.
- Keep install and usage language harness-neutral. The skill should work anywhere markdown skills load.
- This repo's own prose follows its own rules: no em dashes, sentence-case headings, no filler. Run `sloplint score README.md` after editing docs. The `references/` files are exempt where they quote slop as examples.

## Watch out for

- `prepareText` blanks regions instead of deleting them so line numbers stay correct. Preserve that invariant.
- Tier 2 vocabulary only flags when two or more distinct terms appear; tier 3 only above a density threshold. Don't "fix" that into always-flag; it exists to avoid false positives on human writing.
- `applyFixes` must stay conservative: only mechanical, meaning-preserving replacements belong there. Judgment calls belong in the skill.
