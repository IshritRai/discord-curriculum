// Markdown extensions used by the lessons.
//
//   ::: starter 21        → "Starter code — paste this" box (copy buttons enabled),
//                            with a note that Lesson 21 explains it.
//   ::: starter           → same box, for files you never need to understand (assets, data).
//   ::: solution          → collapsed "Reveal solution" block.
//   ::: quiz              → interactive multiple-choice question (see below).
//   ```js [js/main.js]    → code block with a file name shown above it.
//   ```mermaid            → diagram rendered in the browser by Mermaid.
//
// Quiz syntax:
//
//   ::: quiz
//   Question text (any Markdown, code blocks allowed)
//
//   - [ ] wrong option
//   - [x] right option
//
//   > Explanation shown after answering.
//   :::

import container from 'markdown-it-container'
import { lessonByNumber, lessonLink, pad } from './curriculum.mjs'

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function courseMarkdown(md) {
  // 1. Starter code boxes.
  md.use(container, 'starter', {
    render(tokens, idx) {
      const token = tokens[idx]
      if (token.nesting !== 1) return '</div>\n'
      const arg = token.info.trim().slice('starter'.length).trim()
      let note = 'You don’t need to understand this code — it’s provided for you.'
      if (arg) {
        const lesson = lessonByNumber(Number(arg))
        if (!lesson) throw new Error(`::: starter refers to unknown lesson "${arg}"`)
        note = `You’ll learn how it works in <a href="${lessonLink(lesson)}">Lesson ${pad(lesson.n)}</a>.`
      }
      return `<div class="starter custom-block"><p class="custom-block-title">Starter code — paste this</p><p class="starter-note">${note}</p>\n`
    },
  })

  // 2. Collapsed solutions.
  md.use(container, 'solution', {
    render(tokens, idx) {
      const token = tokens[idx]
      if (token.nesting !== 1) return '</details>\n'
      const label = token.info.trim().slice('solution'.length).trim()
      const summary = label ? `Reveal solution — ${md.utils.escapeHtml(label)}` : 'Reveal solution'
      return `<details class="solution custom-block"><summary>${summary}</summary>\n`
    },
  })

  // 3. Quizzes. The container becomes <Quiz>; a core rule (below) turns the
  //    task list into <QuizOption> components and the blockquote into
  //    <QuizExplanation>.
  md.use(container, 'quiz', {
    render(tokens, idx, _options, env) {
      const token = tokens[idx]
      if (token.nesting !== 1) return '</Quiz>\n'
      env.quizCount = (env.quizCount || 0) + 1
      return `<Quiz id="q${env.quizCount}">\n`
    },
  })

  md.core.ruler.push('quiz_options', (state) => {
    const tokens = state.tokens
    let inQuiz = false
    let quizLevel = 0
    let listDone = false
    let listDepth = 0
    let optionIndex = 0
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      if (t.type === 'container_quiz_open') {
        inQuiz = true
        quizLevel = t.level
        listDone = false
        optionIndex = 0
        continue
      }
      if (t.type === 'container_quiz_close') {
        inQuiz = false
        continue
      }
      if (!inQuiz) continue

      if (t.type === 'bullet_list_open' && t.level === quizLevel + 1 && !listDone) {
        t.meta = { ...t.meta, quizList: true }
        listDepth = 1
        continue
      }
      if (listDepth > 0) {
        if (t.type === 'bullet_list_open') listDepth++
        if (t.type === 'bullet_list_close') {
          listDepth--
          if (listDepth === 0) {
            t.meta = { ...t.meta, quizList: true }
            listDone = true
          }
          continue
        }
        if (t.type === 'list_item_open' && listDepth === 1) {
          // The first inline token after this item holds "[x] text".
          const inline = tokens.slice(i).find((x) => x.type === 'inline')
          const match = inline && /^\[( |x)\]\s+/.exec(inline.content)
          if (!match) throw new Error(`Quiz option without [ ] / [x] marker: "${inline?.content}"`)
          const correct = match[1] === 'x'
          inline.content = inline.content.slice(match[0].length)
          const first = inline.children[0]
          first.content = first.content.replace(/^\[( |x)\]\s+/, '')
          t.meta = { ...t.meta, quizOption: { index: optionIndex++, correct } }
          // find the matching close
          let depth = 0
          for (let j = i; j < tokens.length; j++) {
            if (tokens[j].type === 'list_item_open') depth++
            if (tokens[j].type === 'list_item_close') {
              depth--
              if (depth === 0) {
                tokens[j].meta = { ...tokens[j].meta, quizOptionClose: true }
                break
              }
            }
          }
        }
        continue
      }
      if (t.type === 'blockquote_open' && t.level === quizLevel + 1) {
        t.meta = { ...t.meta, quizExplain: true }
        let depth = 0
        for (let j = i; j < tokens.length; j++) {
          if (tokens[j].type === 'blockquote_open') depth++
          if (tokens[j].type === 'blockquote_close') {
            depth--
            if (depth === 0) {
              tokens[j].meta = { ...tokens[j].meta, quizExplain: true }
              break
            }
          }
        }
      }
    }
  })

  const wrap = (name, open, close) => {
    const original = md.renderer.rules[name] || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
    md.renderer.rules[name] = (tokens, idx, options, env, self) => {
      const t = tokens[idx]
      const custom = (t.nesting === 1 ? open : close)(t)
      return custom ?? original(tokens, idx, options, env, self)
    }
  }
  wrap('bullet_list_open', (t) => (t.meta?.quizList ? '<div class="quiz-options" role="radiogroup">\n' : null), () => null)
  wrap('bullet_list_close', () => null, (t) => (t.meta?.quizList ? '</div>\n' : null))
  wrap(
    'list_item_open',
    (t) => (t.meta?.quizOption ? `<QuizOption :index="${t.meta.quizOption.index}" :correct="${t.meta.quizOption.correct}">` : null),
    () => null,
  )
  wrap('list_item_close', () => null, (t) => (t.meta?.quizOptionClose ? '</QuizOption>\n' : null))
  wrap('blockquote_open', (t) => (t.meta?.quizExplain ? '<QuizExplanation>\n' : null), () => null)
  wrap('blockquote_close', () => null, (t) => (t.meta?.quizExplain ? '</QuizExplanation>\n' : null))

  // 4. Inline code must never be treated as a Vue template (JSX uses {{ }}).
  md.renderer.rules.code_inline = (tokens, idx) =>
    `<code v-pre>${md.utils.escapeHtml(tokens[idx].content)}</code>`

  // 5. File names above code blocks, and Mermaid diagrams.
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim()
    if (info === 'mermaid') {
      return `<Mermaid code="${escapeAttr(encodeURIComponent(token.content))}" />\n`
    }
    const title = /\[(.+?)\]/.exec(info)?.[1]
    const html = fence(tokens, idx, options, env, self)
    if (!title) return html
    return `<div class="code-file"><div class="code-file-name">${md.utils.escapeHtml(title)}</div>${html}</div>`
  }
}
