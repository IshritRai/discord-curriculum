#!/usr/bin/env node
// Opens every solution snapshot in headless Chromium and checks that it works.
//
//   node tools/verify-solutions.mjs               all lessons
//   node tools/verify-solutions.mjs --lesson 22   one lesson
//   node tools/verify-solutions.mjs --from 20     lessons 20 and later
//   node tools/verify-solutions.mjs --upto 11     lessons 0–11
//   node tools/verify-solutions.mjs --no-screenshots
//
// For each snapshot it:
//   1. serves it over http (like Live Server / Vite would),
//   2. fails on console errors, uncaught exceptions and failed requests,
//   3. runs every feature check that applies to that lesson (tools/checks.mjs),
//   4. saves the "goal" screenshot shown at the top of the lesson.
//
// React snapshots are built with Vite first.

import { createServer } from 'node:http'
import { readFile, mkdir, rm } from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { checks, goals } from './checks.mjs'
import { lessons, pad, appFolder } from '../site/.vitepress/curriculum.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BUILD_DIR = join(ROOT, '.verify-build')
const SHOT_DIR = join(ROOT, 'site', 'public', 'screenshots')
const args = process.argv.slice(2)
const argValue = (name) => (args.includes(name) ? Number(args[args.indexOf(name) + 1]) : null)
const onlyLesson = argValue('--lesson')
const fromLesson = argValue('--from')
const uptoLesson = argValue('--upto')
const screenshots = !args.includes('--no-screenshots')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
}

// A tiny static file server: /solutions/... and /build/... (built React apps)
function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    let path = decodeURIComponent(url.pathname)
    let base
    if (path.startsWith('/solutions/')) base = join(ROOT, 'solutions')
    else if (path.startsWith('/build/')) base = BUILD_DIR
    else {
      res.writeHead(404).end()
      return
    }
    path = normalize(path.replace(/^\/(solutions|build)\//, ''))
    if (path.endsWith('/')) path += 'index.html'
    const file = join(base, path)
    if (!file.startsWith(base)) {
      res.writeHead(403).end()
      return
    }
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

async function buildReact(n) {
  const { build } = await import('vite')
  const root = join(ROOT, 'solutions', `lesson-${pad(n)}`, appFolder('react'))
  const outDir = join(BUILD_DIR, `lesson-${pad(n)}`)
  await rm(outDir, { recursive: true, force: true })
  await build({ root, base: './', logLevel: 'warn', build: { outDir, emptyOutDir: true } })
}

function makeAssert(lesson) {
  return (condition, message) => {
    if (!condition) throw new Error(`Lesson ${pad(lesson)}: ${message}`)
  }
}

async function verifyLesson(browser, baseUrl, lesson) {
  const n = lesson.n
  const dir = join(ROOT, 'solutions', `lesson-${pad(n)}`)
  if (!existsSync(dir)) return { n, skipped: 'no snapshot yet' }
  const app = lesson.app
  let url
  if (app === 'react') {
    try {
      await buildReact(n)
    } catch (error) {
      return { n, results: [], problems: [`vite build failed: ${error.message.split('\n').slice(0, 4).join(' ')}`] }
    }
    url = `${baseUrl}/build/lesson-${pad(n)}/index.html`
  } else {
    url = `${baseUrl}/solutions/lesson-${pad(n)}/vanilla/index.html`
  }

  const problems = []
  const results = []
  const applicable = checks.filter((c) => (c[app] ?? Infinity) <= n && (c.until?.[app] ?? Infinity) >= n)

  const newPage = async (context) => {
    const page = await context.newPage()
    page.on('console', (msg) => {
      // Browsers ask for /favicon.ico on their own when a page has no icon; that 404 isn't the app's fault.
      if (msg.type() === 'error' && !/favicon\.ico/.test(msg.location()?.url || '') && !(/404/.test(msg.text()) && !msg.location()?.url)) {
        problems.push(`console error: ${msg.text()}`)
      }
    })
    page.on('pageerror', (error) => problems.push(`uncaught exception: ${error.message}`))
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) problems.push(`HTTP ${response.status()}: ${response.url()}`)
    })
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || ''
      if (!/ERR_ABORTED/.test(failure)) problems.push(`request failed: ${request.url()} ${failure}`)
    })
    return page
  }

  const contextOptions = {
    viewport: { width: 1280, height: 800 },
    permissions: ['microphone', 'clipboard-read', 'clipboard-write'],
    timezoneId: 'America/New_York',
    locale: 'en-US',
  }

  for (const check of applicable) {
    const context = await browser.newContext(contextOptions)
    const page = await newPage(context)
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await check.run(page, { lesson: n, app, url, assert: makeAssert(n), newPage: () => newPage(context) })
      results.push({ id: check.id, ok: true })
    } catch (error) {
      results.push({ id: check.id, ok: false, error: error.message.split('\n')[0] })
    }
    await context.close()
  }

  if (screenshots) {
    const context = await browser.newContext(contextOptions)
    const page = await newPage(context)
    await page.goto(url, { waitUntil: 'networkidle' })
    const goal = goals[n]
    await mkdir(SHOT_DIR, { recursive: true })
    if (goal?.setup) await goal.setup(page)
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(SHOT_DIR, `lesson-${pad(n)}.png`), fullPage: goal?.fullPage ?? false })
    for (const extra of goal?.extra || []) {
      const extraContext = await browser.newContext({ ...contextOptions, viewport: extra.viewport || contextOptions.viewport })
      const extraPage = await newPage(extraContext)
      await extraPage.goto(url, { waitUntil: 'networkidle' })
      if (extra.setup) await extra.setup(extraPage)
      await extraPage.waitForTimeout(300)
      await extraPage.screenshot({ path: join(SHOT_DIR, `lesson-${pad(n)}-${extra.name}.png`) })
      await extraContext.close()
    }
    await context.close()
  }

  return { n, results, problems: [...new Set(problems)] }
}

const server = await startServer()
const baseUrl = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
})

let failed = 0
const selected = lessons.filter(
  (l) => (onlyLesson === null || l.n === onlyLesson) && (fromLesson === null || l.n >= fromLesson) && (uptoLesson === null || l.n <= uptoLesson),
)
for (const lesson of selected) {
  const report = await verifyLesson(browser, baseUrl, lesson)
  if (report.skipped) {
    console.log(`– lesson ${pad(lesson.n)}: ${report.skipped}`)
    continue
  }
  const bad = report.results.filter((r) => !r.ok)
  const ok = bad.length === 0 && report.problems.length === 0
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} lesson ${pad(lesson.n)}: ${report.results.length - bad.length}/${report.results.length} checks passed`)
  for (const r of bad) console.log(`    ✗ ${r.id}: ${r.error}`)
  for (const p of report.problems) console.log(`    ✗ ${p}`)
}

await browser.close()
server.close()
if (existsSync(BUILD_DIR) && readdirSync(BUILD_DIR).length === 0) await rm(BUILD_DIR, { recursive: true, force: true })
console.log(failed ? `\n✗ ${failed} snapshot(s) failed` : '\n✓ all snapshots passed')
process.exit(failed ? 1 : 0)
