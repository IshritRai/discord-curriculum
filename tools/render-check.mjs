#!/usr/bin/env node
// Renders lesson Markdown exactly like the site does and compiles the result as a Vue
// template, without building the whole site. Catches broken quizzes, unclosed
// containers and template errors in a second or two.
//
//   node tools/render-check.mjs                     all lessons
//   node tools/render-check.mjs site/lessons/05-box-model.md

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer } from 'vitepress'
import { compile } from '@vue/compiler-dom'
import { courseMarkdown } from '../site/.vitepress/markdown.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SITE = join(ROOT, 'site')
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(join(SITE, 'lessons')).filter((f) => f.endsWith('.md')).map((f) => join(SITE, 'lessons', f))

const md = await createMarkdownRenderer(SITE, { theme: { light: 'github-light', dark: 'github-dark' }, config: courseMarkdown })

let failed = 0
for (const file of files) {
  const source = readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
  const problems = []
  let html = ''
  try {
    html = md.render(source, { path: file, relativePath: file })
  } catch (error) {
    problems.push(`markdown: ${error.message}`)
  }
  if (html) {
    try {
      compile(`<div>${html}</div>`, { onError: (error) => problems.push(`vue template: ${error.message}`) })
    } catch (error) {
      problems.push(`vue template: ${error.message}`)
    }
    for (const match of html.matchAll(/src="\/(screenshots\/[^"]+)"/g)) {
      if (!existsSync(join(SITE, 'public', match[1]))) problems.push(`missing image: /${match[1]}`)
    }
    const quizzes = (html.match(/<Quiz /g) || []).length
    const correct = (html.match(/:correct="true"/g) || []).length
    if (correct !== quizzes) problems.push(`${quizzes} quizzes but ${correct} correct answers (each quiz needs exactly one [x])`)
    if (/^:::/m.test(html.replace(/<pre[\s\S]*?<\/pre>/g, ''))) problems.push('an unclosed or misspelled ::: container')
  }
  if (problems.length) {
    failed++
    console.log(`✗ ${file}`)
    for (const p of problems) console.log(`    ${p}`)
  } else console.log(`✓ ${file}`)
}
process.exit(failed ? 1 : 0)
