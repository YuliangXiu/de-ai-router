# Pre-delivery checklist

Run this before shipping any prose. Adapted from hardikpandya/stop-slop's quick checks, extended with the merged pattern catalog.

## Quick checks

- Em dash or en dash anywhere? Replace it (period, comma, colon, or parentheses).
- Any tier-1 vocabulary (delve, tapestry, robust, seamless, pivotal...)? Swap for the plain word.
- Any "not X, it's Y" contrast? State Y directly.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Sentence tails ending in "-ing" analysis (", highlighting the importance of...")? Cut or give the claim its own sourced sentence.
- Passive voice hiding an actor? Name the actor.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Paragraph starts with "So" or a Wh-cleft ("What makes this hard is...")? Restructure.
- Adverbs? Cut them and reread.
- Lazy extremes (every, always, never, nobody)? Replace with the real scope.
- Three consecutive sentences the same length? Break one.
- Three-item list where two would do? Trim it.
- Every paragraph ends punchy? Vary the endings.
- Vague declarative ("The implications are significant")? Name the implication.
- "Great question!", "I hope this helps", "Let me know if..."? Delete.
- Generic upbeat ending? End on the last concrete fact.
- Any fact, name, number, or citation not present in the source? Remove it or ask the author.
- Bold labels in bullets restating themselves? Convert to prose.
- Emojis in headings or bullets? Remove.
- Title Case Headings? Sentence case.

## Scoring rubric

Rate 1-10 on each dimension:

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds like a specific person? |
| Density | Anything cuttable? |
| Fidelity | Every claim traceable to the source? |

Below 42/60: revise.

## Mechanical check

If the repo has this kit installed:

```bash
sloplint score draft.md
```

Under 25 is the target. The score is explainable; run `sloplint analyze draft.md` to see exactly which patterns fired and where.
