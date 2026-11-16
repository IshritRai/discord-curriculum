# How lessons are written

Read `site/lessons/00-toolkit.md` first: it is the reference example of tone, depth and format. Then read `briefs.md` for your lesson.

## The learner
Knows some Python (variables, loops, functions, lists, dicts), **no** HTML/CSS/browser JS/React. macOS, VS Code, Chrome. Studies 45–60 min per lesson and **types every line themselves**. Wants to understand *why*. Python comparisons help (`::: tip Python comparison`).

## Ground rules
1. **No untaught code.** `node tools/check-concepts.mjs --lesson N` checks every code block against `concepts.json`: a block may only use concepts of this lesson or earlier. If a step needs something later, put it in `::: starter M` (M = the lesson that explains it). Concepts new in this lesson must be in `concepts.json` with this lesson's number and explained in **New concepts**. Add missing tokens to *this lesson's* concepts only: `node tools/add-concept.mjs N concept-id "Title" token1 token2`. Never touch other lessons' concepts; if a token belongs to a later lesson, rewrite the example or use a starter box.
2. **Steps rebuild the snapshot exactly.** `solutions/lesson-(N-1)` + what the steps tell the learner to type/paste must equal `solutions/lesson-N`. Run `diff -ru solutions/lesson-(N-1) solutions/lesson-N` and cover every change. **Never edit `solutions/`.** If a snapshot looks wrong, say so in your final report instead.
3. **Accuracy over helpfulness.** No invented APIs, options, menu names or shortcuts. Only describe what the snapshot code uses or what you checked on MDN / react.dev / vite.dev / reactrouter.com. Only link pages you opened and got HTTP 200 for (prefer MDN). For setup steps that may have changed (VS Code, GitHub UI, Node installer, `npm create vite`) add a `::: warning` box saying so. Say "about" for uncertain numbers. No quotes attributed to people.
4. Plain, friendly, precise English; short sentences; explain jargon on first use; no filler ("Great job!"). Use "you".

## File format
Frontmatter `lesson: N` and `title:`; then `# Lesson NN — Title`, a one-to-two sentence intro, then exactly these `##` headings in this order (the checker enforces it):
`## 🎯 Goal`, `## 🧠 New concepts`, `## 🛠️ Build it`, `## ✅ Checkpoint`, `## 🐛 Common mistakes`, `## 📝 Quiz`, `## 💾 Commit`.

- **Goal**: what is visible at the end, plus `![Accurate description](/screenshots/lesson-NN.png){.screenshot}` (generated from the snapshot; LOOK at the image with the Read tool and describe it accurately; extra images like `lesson-11-narrow.png` may exist). If nothing visible changes (Git, console-only), use `<!-- no-screenshot: reason -->` and describe terminal/DevTools output instead.
- **New concepts**: starts with `<ConceptList />`, then one `###` per idea with a simple explanation, small examples, and a diagram where useful (```` ```mermaid ```` or ASCII in ```` ```text ````). Required diagrams: box model (05), flexbox axes (06), grid (07), event bubbling (15), state→render loop (16), module graph (17), component tree (33), React data flow (35).
- **Build it**: `### Step 1 — Title`… (usually 5–9). Say which file, what to add, where and why. Each step ends with a collapsed answer:
  ````md
  ::: solution
  ```css [vanilla/css/layout.css]
  .app { display: grid; }
  ```
  :::
  ````
  (or `<!-- no-solution: reason -->` for steps with nothing to type). Put file paths in `[brackets]` after the language (`vanilla/...` or `react-app/...`). Snippets may be partial (use `/* ...rest unchanged... */`) but must parse on their own (balanced braces). Show the whole function/rule you changed.
  **Starter code** (pasted, not typed) goes in `::: starter M` … `:::` (M = explaining lesson; plain `::: starter` = never needs explaining: data, assets, workflow files). Big starter files can be embedded straight from the snapshot so they cannot drift: `<<< @/../solutions/lesson-14/vanilla/js/data.js [vanilla/js/data.js]`. Only starter boxes get a copy button.
  Shell commands: ```` ```sh ````, one per line, no `$`; output in ```` ```text ````.
- **Checkpoint**: `- [ ]` checklist of what must work and exactly how to verify, including a DevTools check.
- **Common mistakes**: 3–6 realistic ones for *this* lesson: **bold symptom**, cause, fix. Quote exact error text only when you are sure of it.
- **Quiz**: 2–3 `::: quiz` blocks, at least one "predict what happens" with code; options `- [ ]` / `- [x]` (exactly one `[x]`), explanation as `> blockquote`.
- **Commit** (from Lesson 01): a ```` ```sh ```` block with `git add .`, `git commit -m "Imperative, specific message"`, `git push`.

Details: inline code is safe for any text (don't write `{{` in prose); `<kbd>Cmd</kbd>` for keys; containers `tip info warning danger details starter solution quiz`. `<!-- ledger-ignore: reason -->` on the line before a block excludes it from the check (rare; prefer rewriting).

## Finish
```sh
node tools/check-concepts.mjs --lesson N     # must say "no ledger violations"
node tools/render-check.mjs site/lessons/NN-slug.md   # must pass
```
Then check by hand: every changed file in the snapshot diff is covered by a step; every step's code matches the snapshot. Report any snapshot problem and any doubt about a fact you could not verify.
