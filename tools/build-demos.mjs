#!/usr/bin/env node
// Copies (vanilla) or builds (React) every solution snapshot into site/public/demos/,
// so the lesson pages can link to "Open the reference app" when you run the site.
// The folder is git-ignored; run this again whenever a snapshot changes.
//
//   node tools/build-demos.mjs              everything
//   node tools/build-demos.mjs --lesson 12  one lesson

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { lessons, pad, appFolder } from '../site/.vitepress/curriculum.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'site', 'public', 'demos')
const args = process.argv.slice(2)
const only = args.includes('--lesson') ? Number(args[args.indexOf('--lesson') + 1]) : null

if (only === null) rmSync(OUT, { recursive: true, force: true })
for (const lesson of lessons) {
  if (only !== null && lesson.n !== only) continue
  const folder = appFolder(lesson.app)
  const source = join(ROOT, 'solutions', `lesson-${pad(lesson.n)}`, folder)
  if (!existsSync(source)) continue
  const target = join(OUT, `lesson-${pad(lesson.n)}`, folder)
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  if (lesson.app === 'react') {
    await build({ root: source, base: './', logLevel: 'error', build: { outDir: target, emptyOutDir: true } })
  } else {
    cpSync(source, target, { recursive: true })
  }
  console.log(`lesson ${pad(lesson.n)} → ${folder}`)
}
