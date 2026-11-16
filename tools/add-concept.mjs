#!/usr/bin/env node
// Adds tokens to a concept in concepts.json, creating the concept if needed.
//   node tools/add-concept.mjs <lesson> <concept-id> "<title>" token1 token2 ...
// Refuses to move a token that already belongs to another concept.
// Safe to run from several terminals at once (it takes a simple lock).

import { readFileSync, writeFileSync, mkdirSync, rmdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const FILE = fileURLToPath(new URL('../concepts.json', import.meta.url))
const LOCK = `${FILE}.lock`
const [lessonArg, id, title, ...tokens] = process.argv.slice(2)
if (!lessonArg || !id || !title) {
  console.error('usage: node tools/add-concept.mjs <lesson> <concept-id> "<title>" token1 token2 ...')
  process.exit(2)
}
const lesson = Number(lessonArg)

for (let i = 0; ; i++) {
  try {
    mkdirSync(LOCK)
    break
  } catch {
    if (i > 400) throw new Error(`could not lock ${LOCK}; delete it if no other process is running`)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}
try {
  const ledger = JSON.parse(readFileSync(FILE, 'utf8'))
  const owner = new Map(ledger.concepts.flatMap((c) => c.tokens.map((t) => [t, c])))
  for (const token of tokens) {
    const c = owner.get(token)
    if (c && c.id !== id) throw new Error(`"${token}" already belongs to "${c.id}" (Lesson ${c.lesson})`)
  }
  let concept = ledger.concepts.find((c) => c.id === id)
  if (concept && concept.lesson !== lesson) throw new Error(`"${id}" belongs to Lesson ${concept.lesson}, not ${lesson}`)
  if (!concept) {
    concept = { id, lesson, title, tokens: [] }
    ledger.concepts.push(concept)
  }
  concept.title = title
  for (const token of tokens) if (!concept.tokens.includes(token)) concept.tokens.push(token)
  ledger.concepts.sort((a, b) => a.lesson - b.lesson)
  const lines = ledger.concepts.map((c) => `    ${JSON.stringify(c)}`)
  const rest = Object.entries(ledger).filter(([k]) => k !== 'concepts').map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
  writeFileSync(FILE, `{\n  "concepts": [\n${lines.join(',\n')}\n  ],\n${rest.join(',\n')}\n}\n`)
  console.log(`ok: ${id} (Lesson ${lesson}) now has ${concept.tokens.length} token(s)`)
} catch (error) {
  console.error(`error: ${error.message}`)
  process.exitCode = 1
} finally {
  rmdirSync(LOCK)
}
