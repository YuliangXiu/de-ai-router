# AI vocabulary, tiered

Words and phrases that appear far more often in AI-generated text than in human writing. Adapted from brandonwise/humanizer's 3-tier vocabulary and blader/humanizer's word lists. The machine-readable version lives in [rules/slop-rules.json](../rules/slop-rules.json); `sloplint` reads that file, so editing it changes what the scanner flags.

Tier rules:

- **Tier 1 (dead giveaways):** flag every occurrence.
- **Tier 2 (suspicious in density):** flag when two or more distinct terms appear.
- **Tier 3 (context-dependent):** flag only at high density.

## Tier 1: dead giveaways

| Word | Better alternative |
|------|-------------------|
| delve | look at, dig into |
| tapestry (abstract) | say what you actually mean |
| testament ("a testament to") | remove; state the fact |
| pivotal | important, or remove |
| landscape (abstract) | field, industry, or be specific |
| intricate / intricacies | complex, tricky |
| showcase / showcasing | show |
| foster / fostering | encourage, build |
| garner / garnered | get, receive |
| interplay | relationship, tension |
| enduring | lasting |
| vibrant | describe what makes it lively |
| crucial | important, or remove |
| meticulous | careful |
| seamless | smooth, or describe the absence of friction |
| groundbreaking | new, first |
| leverage / leveraging | use |
| synergy | cooperation |
| transformative | describe the change |
| paramount | most important |
| multifaceted | varied |
| myriad | many |
| cornerstone | foundation |
| empower | enable, help |
| catalyst / catalyze | trigger, cause |
| nestled | is in |
| realm | field, area |
| unpack | explain |
| deep dive | analysis |
| actionable | useful, specific |
| impactful | effective, or name the effect |
| learnings | lessons |
| robust | strong, solid |
| embark | start |
| underscore (verb) | show, make clear |
| bustling | busy |
| renowned | well known, or cite who says so |
| invaluable | valuable |
| bandwidth (non-technical) | time, capacity |
| thought leader | expert (or cut) |

## Tier 2: suspicious in density

additionally, furthermore, moreover, notably, consequently, subsequently, accordingly, nonetheless, comprehensive, paradigm, holistic, utilize, facilitate, nuanced, elucidate, illuminate, encompass / encompassing, streamline / streamlined, spearhead, bolster, poised, cutting-edge, harness, unleash, revolutionize, reimagine, elevate, alleviate, cadence, quintessential, ubiquitous, proactive, endeavor

Replacements follow the same rule as tier 1: prefer the plain verb (use, help, include, lead, support, ready) or cut the word.

## Tier 3: context-dependent

significant, effective, unique, compelling, exceptional, essential, key (adjective), valuable, innovative, notable

Fine individually. Flag only when they cluster or repeat.

## Phrases

### Promotional
nestled in, in the heart of, breathtaking, must-visit, stunning, world-class, state-of-the-art, game-changing, unparalleled, rich cultural heritage, natural beauty, commitment to excellence

### Significance
marking a pivotal moment, is a testament to, serves as a reminder, underscores the importance, reflects broader trends, setting the stage for, key turning point, evolving landscape, indelible mark, shaping the future of

### Business jargon
| Avoid | Use instead |
|-------|-------------|
| navigate (challenges) | handle, address |
| unpack (analysis) | explain, examine |
| lean into | accept, embrace |
| double down | commit, increase |
| deep dive | analysis |
| circle back | return to |
| move the needle | make a difference (or name the metric) |
| low-hanging fruit | the easy wins |
| pain points | problems |
| double-click on | look closer at |
| take a step back | reconsider |
| moving forward | next, from now on |
| on the same page | agreed |

### Chatbot artifacts
I hope this helps!, Let me know if you'd like..., Would you like me to..., Feel free to..., Don't hesitate to..., Happy to help!, Here is an overview of..., Of course!, Certainly!, Absolutely!, Great question!, Excellent point!, You're absolutely right!, Is there anything else...

### Hedging stacks
could potentially, might possibly, could possibly, may potentially, perhaps potentially, it could be argued, one could argue, it is possible that

### Generic conclusions
the future looks bright, exciting times lie ahead, continue this journey, journey toward excellence, step in the right direction, only time will tell, the possibilities are endless, poised for growth, watch this space
