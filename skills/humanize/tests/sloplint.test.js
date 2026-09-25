'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { analyzeText, applyFixes, computeStats, loadRules, prepareText } = require('../bin/sloplint.js');

const rules = loadRules(path.join(__dirname, '..', 'rules', 'slop-rules.json'));

const AI_SAMPLE = `Great question! Here is an overview of sustainable energy. Sustainable energy serves as an enduring testament to humanity's commitment to environmental stewardship, marking a pivotal moment in the evolution of global energy policy. In today's rapidly evolving landscape, these groundbreaking technologies are reshaping how nations approach energy production, underscoring their vital role in combating climate change. Additionally, the seamless integration of robust solar solutions is fostering a vibrant ecosystem of innovation, highlighting the transformative potential of this multifaceted realm. The future looks bright. I hope this helps!`;

const HUMAN_SAMPLE = `Solar got cheap and nobody in my family believed me until the electric bill came. My dad ran the numbers twice. The panels paid for themselves in six years, which is faster than the loan on his truck. Storage is still the weak spot. On cloudy weeks we buy from the grid like everyone else, and the battery I priced out costs more than the panels did. I'd still do it again. The bill in July was eleven dollars.`;

test('AI-flavored text scores much higher than human text', () => {
  const ai = analyzeText(AI_SAMPLE, rules);
  const human = analyzeText(HUMAN_SAMPLE, rules);
  assert.ok(ai.score >= 50, `expected AI sample >= 50, got ${ai.score}`);
  assert.ok(human.score <= 25, `expected human sample <= 25, got ${human.score}`);
  assert.ok(ai.score > human.score + 30, `expected a wide gap, got ${ai.score} vs ${human.score}`);
});

test('tier-1 vocabulary is flagged', () => {
  const { findings } = analyzeText('We will delve into the tapestry of options.', rules);
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes('vocab:delve'));
  assert.ok(ids.includes('vocab:tapestry'));
});

test('tier-2 vocabulary needs two distinct terms', () => {
  const one = analyzeText('Furthermore, the plan is fine.', rules);
  assert.ok(!one.findings.some((f) => f.tier === 2), 'single tier-2 term should not flag');
  const two = analyzeText('Furthermore, we will utilize the new plan.', rules);
  assert.ok(two.findings.some((f) => f.tier === 2), 'two distinct tier-2 terms should flag');
});

test('em dashes and chatbot artifacts are detected with line numbers', () => {
  const text = 'First line is fine.\nThe policy \u2014 announced late \u2014 hurt.\nI hope this helps!';
  const { findings } = analyzeText(text, rules);
  const emDash = findings.filter((f) => f.id === 'em-dash');
  assert.strictEqual(emDash.length, 2);
  assert.strictEqual(emDash[0].line, 2);
  const bot = findings.find((f) => f.id === 'chatbot-artifact');
  assert.ok(bot);
  assert.strictEqual(bot.line, 3);
});

test('code blocks and inline code are not scanned', () => {
  const text = 'Plain sentence here.\n\n```js\nconst tapestry = delve("seamless");\n```\n\nUse `leverage()` in code.';
  const { findings } = analyzeText(text, rules);
  assert.strictEqual(findings.filter((f) => f.category === 'vocabulary').length, 0);
});

test('fix applies phrase replacements and strips em dashes', () => {
  const { text } = applyFixes('In order to win \u2014 and win big \u2014 we act due to the fact that time is short.', rules);
  assert.ok(!text.includes('\u2014'));
  assert.ok(/^To win/.test(text));
  assert.ok(text.includes('because time is short'));
  assert.ok(!/in order to/i.test(text));
});

test('fix normalizes curly quotes but keeps numeric ranges readable', () => {
  const { text } = applyFixes('He said “fine” about 2010\u20132023.', rules);
  assert.ok(text.includes('"fine"'));
  assert.ok(text.includes('2010-2023'));
});

test('stats detect metronomic rhythm', () => {
  const metronomic = Array(12).fill('The system processes the data very quickly today.').join(' ');
  const s = computeStats(metronomic);
  assert.ok(s.burstiness < 0.1, `expected near-zero burstiness, got ${s.burstiness}`);
  assert.ok(s.trigramRepetition > 0.5, `expected heavy trigram repetition, got ${s.trigramRepetition}`);
});

test('frontmatter is ignored', () => {
  const text = '---\ndescription: a vibrant tapestry of crucial things\n---\nPlain body text.';
  const { findings } = analyzeText(text, rules);
  assert.strictEqual(findings.length, 0);
});

test('prepareText preserves line positions', () => {
  const raw = 'line one\n```\ncode\n```\nline five';
  const prepared = prepareText(raw);
  assert.strictEqual(prepared.split('\n').length, raw.split('\n').length);
});

test('scores stay within 0-100', () => {
  const extreme = 'Delve tapestry vibrant crucial seamless robust pivotal testament. '.repeat(50);
  const a = analyzeText(extreme, rules);
  assert.ok(a.score >= 0 && a.score <= 100);
});
