#!/usr/bin/env node
'use strict';

/*
 * sloplint: a zero-dependency scanner for AI writing patterns.
 *
 * Rules live in rules/slop-rules.json (rules as data, so they are
 * repeatable and reviewable). Scoring methodology follows
 * brandonwise/humanizer: pattern density on a log curve blended with
 * statistical uniformity (burstiness, type-token ratio, trigram
 * repetition). Higher score = more AI-flavored. 0-100.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_RULES = path.join(__dirname, '..', 'rules', 'slop-rules.json');
const DEFAULT_IGNORE_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'vendor', 'out', 'coverage', '.next', 'target',
]);
const DEFAULT_EXTS = new Set(['md', 'mdx', 'markdown', 'txt']);

// ---------- text preparation ----------

// Blank out a region but keep every index (and newline) in place so
// line numbers survive.
function blankPreservingLines(match) {
  return match.replace(/[^\n]/g, ' ');
}

function prepareText(raw, opts = {}) {
  let text = raw;
  text = text.replace(/^---\n[\s\S]*?\n---\n/, blankPreservingLines); // frontmatter
  text = text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1\s*$/gm, blankPreservingLines); // fenced code
  text = text.replace(/`[^`\n]+`/g, blankPreservingLines); // inline code
  text = text.replace(/\bhttps?:\/\/\S+/g, blankPreservingLines); // bare URLs
  text = text.replace(/\]\([^)\n]+\)/g, blankPreservingLines); // markdown link targets
  if (opts.ignoreQuotes) {
    text = text.replace(/^[ \t]*>[^\n]*$/gm, blankPreservingLines);
  }
  return text;
}

function lineOfIndex(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

function words(text) {
  return text.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
}

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => words(s).length > 0);
}

// ---------- statistics ----------

function computeStats(text) {
  const sents = sentences(text);
  const lens = sents.map((s) => words(s).length);
  const n = lens.length;
  const mean = n ? lens.reduce((a, b) => a + b, 0) / n : 0;
  const variance = n ? lens.reduce((a, b) => a + (b - mean) ** 2, 0) / n : 0;
  const burstiness = mean ? Math.sqrt(variance) / mean : 0; // CoV of sentence length

  const toks = words(text).map((w) => w.toLowerCase());
  const window = toks.slice(0, 500); // fixed window so length doesn't skew TTR
  const ttr = window.length ? new Set(window).size / window.length : 0;

  const trigrams = new Map();
  for (let i = 0; i + 2 < toks.length; i++) {
    const t = `${toks[i]} ${toks[i + 1]} ${toks[i + 2]}`;
    trigrams.set(t, (trigrams.get(t) || 0) + 1);
  }
  let repeated = 0;
  for (const count of trigrams.values()) if (count > 1) repeated += count - 1;
  const trigramRepetition = toks.length > 3 ? repeated / (toks.length - 2) : 0;

  return {
    sentenceCount: n,
    wordCount: toks.length,
    meanSentenceLength: round2(mean),
    burstiness: round2(burstiness),
    typeTokenRatio: round2(ttr),
    trigramRepetition: round2(trigramRepetition),
  };
}

function uniformityScore(stats) {
  // Each component contributes when the text looks mechanically uniform.
  // Short texts get a confidence haircut instead of a confident score.
  let score = 0;
  if (stats.burstiness < 0.45) score += 40 * ((0.45 - stats.burstiness) / 0.45);
  if (stats.typeTokenRatio > 0 && stats.typeTokenRatio < 0.45) {
    score += 30 * ((0.45 - stats.typeTokenRatio) / 0.45);
  }
  if (stats.trigramRepetition > 0.04) {
    score += 30 * Math.min(1, (stats.trigramRepetition - 0.04) / 0.1);
  }
  if (stats.wordCount < 120) score *= stats.wordCount / 120; // low confidence on short samples
  return Math.min(100, score);
}

// ---------- detection ----------

function loadRules(rulesPath) {
  const file = rulesPath || DEFAULT_RULES;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detect(prepared, rules) {
  const findings = [];
  const wordCount = words(prepared).length || 1;

  const addMatches = (re, meta) => {
    let m;
    while ((m = re.exec(prepared)) !== null) {
      findings.push({ ...meta, match: m[0].trim(), index: m.index, line: lineOfIndex(prepared, m.index) });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  };

  const vocab = rules.vocabulary || {};

  for (const word of vocab.tier1?.words || []) {
    addMatches(new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi'), {
      id: `vocab:${word}`, category: 'vocabulary', tier: 1, weight: vocab.tier1.weight,
    });
  }

  const tier2 = vocab.tier2 || { words: [] };
  const tier2Found = [];
  for (const word of tier2.words || []) {
    const re = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    let m;
    while ((m = re.exec(prepared)) !== null) {
      tier2Found.push({ word, match: m[0], index: m.index });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  const distinctTier2 = new Set(tier2Found.map((f) => f.word.toLowerCase()));
  if (distinctTier2.size >= (tier2.minDistinct || 2)) {
    for (const f of tier2Found) {
      findings.push({
        id: `vocab:${f.word}`, category: 'vocabulary', tier: 2, weight: tier2.weight,
        match: f.match, index: f.index, line: lineOfIndex(prepared, f.index),
      });
    }
  }

  const tier3 = vocab.tier3 || { words: [] };
  const tier3Found = [];
  for (const word of tier3.words || []) {
    const re = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    let m;
    while ((m = re.exec(prepared)) !== null) {
      tier3Found.push({ word, match: m[0], index: m.index });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  const tier3Density = (tier3Found.length / wordCount) * 100;
  if (tier3Density > (tier3.maxDensityPct || 1.5)) {
    for (const f of tier3Found) {
      findings.push({
        id: `vocab:${f.word}`, category: 'vocabulary', tier: 3, weight: tier3.weight,
        match: f.match, index: f.index, line: lineOfIndex(prepared, f.index),
      });
    }
  }

  for (const p of rules.phrases || []) {
    addMatches(new RegExp(escapeRegex(p.match).replace(/'/g, "['\\u2019]"), 'gi'), {
      id: `phrase:${p.match}`, category: p.category, weight: p.weight, fix: p.fix,
    });
  }

  for (const r of rules.regex || []) {
    addMatches(new RegExp(r.pattern, r.flags || 'gi'), {
      id: r.id, category: r.category, weight: r.weight, note: r.note,
    });
  }

  findings.sort((a, b) => a.index - b.index);
  return findings;
}

// ---------- scoring ----------

function patternScore(findings, wordCount) {
  if (!wordCount) return 0;
  const weighted = findings.reduce((a, f) => a + f.weight, 0);
  const per100 = (weighted / wordCount) * 100;
  let score = 34 * Math.log1p(per100); // density on a log curve
  const breadth = new Set(findings.map((f) => f.id)).size;
  score += Math.min(20, breadth * 2); // breadth bonus
  const categories = new Set(findings.map((f) => f.category)).size;
  score += Math.min(15, categories * 3); // category diversity bonus
  return Math.min(100, score);
}

function analyzeText(raw, rules, opts = {}) {
  const prepared = prepareText(raw, opts);
  const stats = computeStats(prepared);
  const findings = detect(prepared, rules);
  const pScore = patternScore(findings, stats.wordCount);
  const uScore = uniformityScore(stats);
  const score = Math.round(0.7 * pScore + 0.3 * uScore);
  return {
    score,
    patternScore: Math.round(pScore),
    uniformityScore: Math.round(uScore),
    stats,
    findings,
    confidence: stats.wordCount >= 120 ? 'high' : stats.wordCount >= 40 ? 'medium' : 'low',
  };
}

function badge(score) {
  if (score <= 25) return 'clean       (mostly human-sounding)';
  if (score <= 50) return 'lightly AI  (a pass would help)';
  if (score <= 75) return 'moderate AI (needs a rewrite pass)';
  return 'heavy AI    (rewrite it)';
}

// ---------- fixing ----------

function applyFixes(raw, rules) {
  let text = raw;
  const applied = [];

  for (const p of rules.phrases || []) {
    if (p.fix === null || p.fix === undefined) continue;
    const re = new RegExp(escapeRegex(p.match).replace(/'/g, "['\\u2019]"), 'gi');
    text = text.replace(re, (m) => {
      applied.push({ from: m, to: p.fix });
      if (p.fix === '') return '';
      // Preserve leading capitalization.
      return m[0] === m[0].toUpperCase() ? p.fix[0].toUpperCase() + p.fix.slice(1) : p.fix;
    });
  }

  text = text
    .replace(/(\d)\u2013(\d)/g, '$1-$2') // en dash (U+2013) in ranges -> hyphen
    .replace(/\s*\u2014\s*|\s+--\s+/g, ', ') // em dash (U+2014) / double hyphen -> comma
    .replace(/\s*\u2013\s*/g, ', ') // stray en dash -> comma
    .replace(/[“”]/g, '"')
    .replace(/[‘’](?=\s|$)/g, "'")
    .replace(/(?<=\s|^)[‘’]/g, "'")
    .replace(/(\w)’(\w)/g, "$1'$2")
    .replace(/ {2,}/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/,{2,}/g, ',')
    .replace(/, ([,.])/g, '$1');

  return { text, applied };
}

// ---------- scan ----------

function walk(dir, opts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (opts.ignoreDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name), opts, out);
    } else {
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      if (opts.exts.has(ext)) out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function scan(dir, rules, opts) {
  const files = walk(dir, opts);
  const results = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const analysis = analyzeText(raw, rules, opts);
    if (analysis.stats.wordCount < opts.minWords) continue;
    const counts = {};
    for (const f of analysis.findings) counts[f.id] = (counts[f.id] || 0) + 1;
    const topPatterns = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => `${id} x${count}`);
    results.push({ file, score: analysis.score, words: analysis.stats.wordCount, topPatterns });
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ---------- CLI ----------

function parseArgs(argv) {
  const opts = {
    _: [],
    json: false,
    write: false,
    ignoreQuotes: false,
    failAbove: null,
    minWords: 30,
    exts: new Set(DEFAULT_EXTS),
    ignoreDirs: new Set(DEFAULT_IGNORE_DIRS),
    rules: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '-w' || a === '--write') opts.write = true;
    else if (a === '--ignore-quotes') opts.ignoreQuotes = true;
    else if (a === '--fail-above') opts.failAbove = Number(argv[++i]);
    else if (a === '--min-words') opts.minWords = Number(argv[++i]);
    else if (a === '--ext') opts.exts = new Set(argv[++i].split(',').map((e) => e.trim().toLowerCase()));
    else if (a === '--ignore-dirs') for (const d of argv[++i].split(',')) opts.ignoreDirs.add(d.trim());
    else if (a === '--rules') opts.rules = argv[++i];
    else opts._.push(a);
  }
  return opts;
}

function readInput(fileArg) {
  if (fileArg) return fs.readFileSync(fileArg, 'utf8');
  return fs.readFileSync(0, 'utf8'); // stdin
}

const HELP = `sloplint: scan prose for AI writing patterns

Usage:
  sloplint score   [file]            Composite score 0-100 (higher = more AI-flavored)
  sloplint analyze [file]            Score plus every finding with line numbers
  sloplint stats   [file]            Statistical tells only (burstiness, TTR, trigrams)
  sloplint fix     [file] [-w]       Apply safe mechanical fixes (stdout, or -w to write in place)
  sloplint scan    <dir>             Scan a folder, rank files by score

Options:
  --json               JSON output
  --rules <file>       Alternate rules file (default: rules/slop-rules.json)
  --ignore-quotes      Skip markdown blockquotes (pasted examples)
  --fail-above <n>     Exit 2 if any score >= n (CI gate; works for score and scan)
  --ext <list>         Scan extensions (default: md,mdx,markdown,txt)
  --min-words <n>      Scan: skip files shorter than n words (default 30)
  --ignore-dirs <list> Scan: extra directories to ignore

Reads stdin when no file is given. Score under 25 is the target.`;

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opts = parseArgs(rest);
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(HELP);
    return;
  }
  const rules = loadRules(opts.rules);

  if (cmd === 'score' || cmd === 'analyze' || cmd === 'stats') {
    const raw = readInput(opts._[0]);
    const analysis = analyzeText(raw, rules, opts);

    if (opts.json) {
      const payload = cmd === 'stats' ? analysis.stats : analysis;
      console.log(JSON.stringify(payload, null, 2));
    } else if (cmd === 'stats') {
      const s = analysis.stats;
      console.log(`words: ${s.wordCount}   sentences: ${s.sentenceCount}   mean sentence length: ${s.meanSentenceLength}`);
      console.log(`burstiness: ${s.burstiness}  (human tends > 0.45)`);
      console.log(`type-token ratio: ${s.typeTokenRatio}  (human tends > 0.45)`);
      console.log(`trigram repetition: ${s.trigramRepetition}  (human tends < 0.04)`);
    } else {
      console.log(`score: ${analysis.score}/100  ${badge(analysis.score)}`);
      console.log(`pattern: ${analysis.patternScore}  uniformity: ${analysis.uniformityScore}  confidence: ${analysis.confidence}`);
      if (cmd === 'analyze') {
        if (analysis.findings.length === 0) {
          console.log('no findings');
        }
        for (const f of analysis.findings) {
          const note = f.fix !== undefined && f.fix !== null ? ` -> "${f.fix}"` : f.note ? `  (${f.note})` : '';
          console.log(`  L${f.line}  [${f.category}/${f.id}] "${f.match}"${note}`);
        }
      }
    }
    if (opts.failAbove !== null && analysis.score >= opts.failAbove) process.exit(2);
    return;
  }

  if (cmd === 'fix') {
    const file = opts._[0];
    const raw = readInput(file);
    const { text, applied } = applyFixes(raw, rules);
    if (opts.write && file) {
      fs.writeFileSync(file, text);
      console.log(`applied ${applied.length} fixes to ${file}`);
    } else {
      process.stdout.write(text);
    }
    return;
  }

  if (cmd === 'scan') {
    const dir = opts._[0];
    if (!dir) {
      console.error('scan: directory required');
      process.exit(1);
    }
    const results = scan(dir, rules, opts);
    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const r of results) {
        console.log(`${String(r.score).padStart(3)}  ${r.file}  (${r.words} words)${r.topPatterns.length ? '  top: ' + r.topPatterns.join(', ') : ''}`);
      }
      if (results.length === 0) console.log('no files matched');
    }
    if (opts.failAbove !== null && results.some((r) => r.score >= opts.failAbove)) process.exit(2);
    return;
  }

  console.error(`unknown command: ${cmd}`);
  console.log(HELP);
  process.exit(1);
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

if (require.main === module) main();

module.exports = { analyzeText, applyFixes, computeStats, detect, loadRules, prepareText, scan };
