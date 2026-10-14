#!/usr/bin/env node
// Enforces the course's most important rule: you are only asked to type code
// that uses concepts taught in the current lesson or an earlier one.
//
// It checks:
//   1. every code block in every lesson (site/lessons/*.md),
//   2. every file in every solution snapshot (solutions/lesson-NN/),
// against concepts.json, and also lints each lesson's structure.
//
// Usage:
//   node tools/check-concepts.mjs              check everything
//   node tools/check-concepts.mjs --lesson 7   only lesson 7 (and its snapshot)
//   node tools/check-concepts.mjs --upto 7     lessons 0–7
//   node tools/check-concepts.mjs --verbose    also print warnings
//   node tools/check-concepts.mjs --tokens 7   print the tokens found in lesson 7

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extract, newResult, normalizeLang, langForFile, declaredNames, jsonKeys } from './lib/tokens.mjs'
import { lessons as curriculum, pad } from '../site/.vitepress/curriculum.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const onlyLesson = args.includes('--lesson') ? Number(args[args.indexOf('--lesson') + 1]) : null
const uptoLesson = args.includes('--upto') ? Number(args[args.indexOf('--upto') + 1]) : null
const skip = (n) => (onlyLesson !== null && n !== onlyLesson) || (uptoLesson !== null && n > uptoLesson)
const tokensLesson = args.includes('--tokens') ? Number(args[args.indexOf('--tokens') + 1]) : null
const verbose = args.includes('--verbose')

const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

// ------------------------------------------------------------------ ledger

const ledger = JSON.parse(readFileSync(join(ROOT, 'concepts.json'), 'utf8'))
const tokenMap = new Map()
const conceptIds = new Set()
for (const c of ledger.concepts) {
  if (!c.id || typeof c.lesson !== 'number' || !c.title || !Array.isArray(c.tokens)) {
    err('concepts.json', `malformed concept ${JSON.stringify(c).slice(0, 80)}`)
    continue
  }
  if (conceptIds.has(c.id)) err('concepts.json', `duplicate concept id "${c.id}"`)
  conceptIds.add(c.id)
  if (!curriculum.some((l) => l.n === c.lesson)) err('concepts.json', `concept "${c.id}" points at unknown lesson ${c.lesson}`)
  for (const t of c.tokens) {
    if (tokenMap.has(t)) err('concepts.json', `token "${t}" is in both "${tokenMap.get(t).id}" and "${c.id}"`)
    tokenMap.set(t, c)
  }
}
const starterFiles = (ledger.starterFiles || []).map((s) => ({
  ...s,
  re: new RegExp(`^${s.pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*')}$`),
}))

// ----------------------------------------------------------- file helpers

function walkFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.DS_Store' || name === 'package-lock.json') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walkFiles(full))
    else out.push(full)
  }
  return out
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length
}

// ------------------------------------------------------- lesson parsing

function parseLesson(path) {
  const text = readFileSync(path, 'utf8')
  const fm = /^---\n([\s\S]*?)\n---/.exec(text)
  const lessonMatch = fm && /^lesson:\s*(\d+)/m.exec(fm[1])
  const lesson = lessonMatch ? Number(lessonMatch[1]) : null
  const blocks = []
  const lines = text.split('\n')
  const containers = []
  let ignoreNext = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const ignore = /<!--\s*ledger-ignore:?\s*(.*?)\s*-->/.exec(line)
    if (ignore) {
      ignoreNext = ignore[1] || 'no reason given'
      continue
    }
    const open = /^:::\s*([a-z-]+)(.*)$/.exec(line)
    if (open) {
      containers.push({ kind: open[1], arg: open[2].trim() })
      continue
    }
    if (/^:::\s*$/.test(line)) {
      containers.pop()
      continue
    }
    const fence = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line)
    if (fence) {
      const marker = fence[2]
      const info = fence[3].trim()
      const start = i + 1
      let j = start
      while (j < lines.length && !lines[j].trim().startsWith(marker)) j++
      const code = lines.slice(start, j).map((l) => l.slice(fence[1].length)).join('\n')
      const lang = info.split(/[\s{[:]/)[0]
      const title = /\[(.+?)\]/.exec(info)?.[1] || null
      const starter = containers.find((c) => c.kind === 'starter')
      blocks.push({
        line: i + 1,
        lang,
        title,
        code,
        kind: starter ? 'starter' : 'typed',
        explainedIn: starter && starter.arg ? Number(starter.arg) : null,
        inQuiz: containers.some((c) => c.kind === 'quiz'),
        inSolution: containers.some((c) => c.kind === 'solution'),
        ignored: ignoreNext,
      })
      ignoreNext = null
      i = j
    }
  }
  return { path, text, lesson, blocks }
}

const lessonDir = join(ROOT, 'site', 'lessons')
const lessonFiles = existsSync(lessonDir)
  ? readdirSync(lessonDir).filter((f) => /^\d\d-.*\.md$/.test(f)).map((f) => parseLesson(join(lessonDir, f)))
  : []

// --------------------------------------------- names the course defines

const userNames = new Set(ledger.userNames || [])
const snapshotDirs = existsSync(join(ROOT, 'solutions'))
  ? readdirSync(join(ROOT, 'solutions')).filter((d) => /^lesson-\d\d$/.test(d)).sort()
  : []
for (const dir of snapshotDirs) {
  for (const file of walkFiles(join(ROOT, 'solutions', dir))) {
    const lang = langForFile(file)
    const code = readFileSync(file, 'utf8')
    if (lang === 'js' || lang === 'jsx') declaredNames(code, { jsx: lang === 'jsx' }).forEach((n) => userNames.add(n))
    if (lang === 'json') jsonKeys(code).forEach((n) => userNames.add(n))
    if (lang === 'html') {
      for (const m of code.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) declaredNames(m[1]).forEach((n) => userNames.add(n))
    }
  }
}
for (const lf of lessonFiles) {
  for (const b of lf.blocks) {
    const lang = normalizeLang(b.lang)
    if (lang === 'js' || lang === 'jsx') declaredNames(b.code, { jsx: lang === 'jsx' }).forEach((n) => userNames.add(n))
    if (lang === 'json') jsonKeys(b.code).forEach((n) => userNames.add(n))
  }
}

// ----------------------------------------------------------- resolving

// Returns [{ token, concept }] for everything the code uses, plus unknowns.
function resolve(result) {
  const used = []
  const unknown = []
  for (const t of result.tokens) {
    const c = tokenMap.get(t)
    if (c) used.push({ token: t, concept: c })
    else unknown.push(t)
  }
  for (const m of result.members) {
    const t = `js:member:${m}`
    const c = tokenMap.get(t)
    if (c) used.push({ token: t, concept: c })
    else if (!userNames.has(m)) unknown.push(t)
  }
  for (const g of result.globals) {
    const t = `js:global:${g}`
    const c = tokenMap.get(t)
    if (c) used.push({ token: t, concept: c })
    else if (!userNames.has(g)) unknown.push(t)
  }
  for (const n of result.lexicalNames) {
    const c = tokenMap.get(`js:global:${n}`)
    if (c) used.push({ token: `js:global:${n}`, concept: c })
  }
  return { used, unknown }
}

function checkCode({ where, code, lang, limit, label }) {
  const result = extract(code, lang, newResult())
  for (const w of result.warnings) warn(where, w)
  const { used, unknown } = resolve(result)
  for (const t of unknown) err(where, `"${t}" is not in concepts.json — add it to the concept that introduces it`)
  if (limit !== null) {
    for (const { token, concept } of used) {
      if (concept.lesson > limit) {
        err(where, `${label} uses "${token}" (${concept.title}), which is introduced in Lesson ${concept.lesson}`)
      }
    }
  }
  return used
}

// ---------------------------------------------------------- lesson checks

const REQUIRED_SECTIONS = ['🎯 Goal', '🧠 New concepts', '🛠️ Build it', '✅ Checkpoint', '🐛 Common mistakes', '📝 Quiz', '💾 Commit']
const usedByLesson = new Map()

for (const lf of lessonFiles) {
  const rel = relative(ROOT, lf.path)
  if (lf.lesson === null) {
    err(rel, 'missing "lesson: N" in frontmatter')
    continue
  }
  const meta = curriculum.find((l) => l.n === lf.lesson)
  if (!meta) err(rel, `lesson ${lf.lesson} is not in curriculum.mjs`)
  else if (!lf.path.endsWith(`${meta.slug}.md`)) err(rel, `file name should be ${meta.slug}.md`)
  if (skip(lf.lesson)) continue

  // structure
  const h2 = [...lf.text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
  let pos = -1
  for (const section of REQUIRED_SECTIONS) {
    const idx = h2.indexOf(section)
    if (idx === -1) err(rel, `missing section "## ${section}"`)
    else if (idx < pos) err(rel, `section "## ${section}" is out of order`)
    else pos = idx
  }
  const quizCount = (lf.text.match(/^::: quiz/gm) || []).length
  if (quizCount < 2 || quizCount > 4) err(rel, `has ${quizCount} quiz questions (expected 2–3)`)
  const buildSection = /## 🛠️ Build it\n([\s\S]*?)\n## ✅ Checkpoint/.exec(lf.text)?.[1] || ''
  const steps = buildSection.split(/^### /m).slice(1)
  if (!steps.length) err(rel, 'the "Build it" section has no "### Step" headings')
  for (const step of steps) {
    const title = step.split('\n')[0]
    if (!/::: solution/.test(step) && !/<!--\s*no-solution/.test(step)) err(rel, `step "${title}" has no ::: solution block (or <!-- no-solution: reason -->)`)
  }
  if (lf.lesson >= 1) {
    const commit = /## 💾 Commit\n([\s\S]*?)(\n## |$)/.exec(lf.text)?.[1] || ''
    if (!/git commit -m/.test(commit)) err(rel, 'the Commit section has no `git commit -m` command')
  }
  if (!/<ConceptList \/>/.test(lf.text)) err(rel, 'the New concepts section should include <ConceptList />')
  if (!/!\[[^\]]*\]\(\/screenshots\/lesson-\d\d[^)]*\)\{\.screenshot\}|<img[^>]+screenshots\/lesson-/.test(lf.text) && !/<!--\s*no-screenshot/.test(lf.text)) {
    warn(rel, 'no goal screenshot')
  }

  // code
  const used = new Set()
  for (const b of lf.blocks) {
    const lang = normalizeLang(b.lang)
    const where = `${rel}:${b.line}`
    if (!lang) {
      if (!['text', 'txt', 'mermaid', 'python', 'diff', 'plaintext', ''].includes(b.lang)) warn(where, `code block language "${b.lang}" is not checked`)
      continue
    }
    if (b.ignored) {
      if (verbose) warn(where, `ignored: ${b.ignored}`)
      continue
    }
    if (b.kind === 'starter') {
      if (b.explainedIn !== null && b.explainedIn < lf.lesson) warn(where, `starter block says it is explained in Lesson ${b.explainedIn}, which is before this lesson`)
      const res = checkCode({ where, code: b.code, lang, limit: b.explainedIn, label: `starter code (explained in Lesson ${b.explainedIn})` })
      if (b.explainedIn === null) continue
      void res
    } else {
      const res = checkCode({ where, code: b.code, lang, limit: lf.lesson, label: b.inQuiz ? 'quiz code' : 'code to type' })
      res.forEach(({ concept }) => used.add(concept.id))
    }
  }
  usedByLesson.set(lf.lesson, used)
  if (tokensLesson === lf.lesson) {
    const all = newResult()
    lf.blocks.filter((b) => b.kind === 'typed' && normalizeLang(b.lang)).forEach((b) => extract(b.code, normalizeLang(b.lang), all))
    console.log([...all.tokens, ...[...all.members].map((m) => `js:member:${m}`), ...[...all.globals].map((g) => `js:global:${g}`)].sort().join('\n'))
  }
}

// ------------------------------------------------------- snapshot checks

const MARKER_BEGIN = /starter code(?::\s*explained in Lesson (\d+))?/i
const MARKER_END = /end starter code/i

function splitRegions(code) {
  // Splits a file into [{ code, starter: bool, explainedIn }] using comment markers.
  const regions = []
  const lines = code.split('\n')
  let current = { lines: [], starter: false, explainedIn: null, startLine: 1 }
  lines.forEach((line, i) => {
    if (MARKER_END.test(line) && /(\/\/|\/\*|<!--)/.test(line)) {
      regions.push(current)
      current = { lines: [], starter: false, explainedIn: null, startLine: i + 2 }
      return
    }
    const begin = /(\/\/|\/\*|<!--)/.test(line) && MARKER_BEGIN.exec(line)
    if (begin && !MARKER_END.test(line)) {
      regions.push(current)
      current = { lines: [], starter: true, explainedIn: begin[1] ? Number(begin[1]) : null, startLine: i + 2 }
      return
    }
    current.lines.push(line)
  })
  regions.push(current)
  return regions.filter((r) => r.lines.join('').trim())
}

for (const dir of snapshotDirs) {
  const n = Number(dir.slice(-2))
  if (skip(n)) continue
  if (!curriculum.some((l) => l.n === n)) err(`solutions/${dir}`, 'no such lesson in curriculum.mjs')
  for (const file of walkFiles(join(ROOT, 'solutions', dir))) {
    const rel = relative(join(ROOT, 'solutions', dir), file)
    const lang = langForFile(file)
    if (!lang) continue
    const starterFile = starterFiles.find((s) => s.re.test(rel))
    const code = readFileSync(file, 'utf8')
    if (starterFile) {
      if (starterFile.explainedIn != null) {
        checkCode({ where: `solutions/${dir}/${rel}`, code, lang, limit: starterFile.explainedIn, label: `starter file (explained in Lesson ${starterFile.explainedIn})` })
      }
      continue
    }
    // Inside a JSX/JS file, regions are checked in that file's language.
    for (const region of splitRegions(code)) {
      const where = `solutions/${dir}/${rel}:${region.startLine}`
      if (region.starter) {
        if (region.explainedIn !== null) checkCode({ where, code: region.lines.join('\n'), lang, limit: region.explainedIn, label: `starter region (explained in Lesson ${region.explainedIn})` })
      } else {
        checkCode({ where, code: region.lines.join('\n'), lang, limit: n, label: 'snapshot code' })
      }
    }
  }
}

// ------------------------------------------ concepts that are never used

if (onlyLesson === null) {
  for (const c of ledger.concepts) {
    if (uptoLesson !== null && c.lesson > uptoLesson) continue
    const used = usedByLesson.get(c.lesson)
    if (used && c.tokens.length && !used.has(c.id)) warn(`concepts.json`, `"${c.id}" is introduced in Lesson ${c.lesson} but no code block in that lesson uses it`)
  }
}

// --------------------------------------------------------------- report

if (verbose || errors.length === 0) for (const w of warnings) console.log(`warning  ${w}`)
for (const e of errors) console.log(`ERROR    ${e}`)
console.log(`\n${lessonFiles.length} lessons, ${snapshotDirs.length} snapshots, ${ledger.concepts.length} concepts, ${tokenMap.size} tokens`)
console.log(errors.length ? `✗ ${errors.length} error(s)` : '✓ no ledger violations')
process.exit(errors.length ? 1 : 0)
