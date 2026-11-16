# Learn frontend development by building a Discord-style chat app

A self-paced course (42 lessons, about 45–60 minutes each) that teaches HTML, CSS, JavaScript and React by building a chat app that looks like Discord's desktop app. Everything is front-end only: all data is fake.

This repository contains two things:

| Folder | What it is |
| --- | --- |
| `site/` | The tutorial website (VitePress). Lessons are Markdown files in `site/lessons/`. |
| `solutions/lesson-NN/` | A working snapshot of the learner's project at the end of every lesson. |

Supporting files: `CURRICULUM.md` (the plan and why it's ordered this way), `concepts.json` (the ledger of every concept and the lesson that introduces it) and `tools/` (the checkers).

## Read the course

```sh
npm install
npm run site:dev        # http://localhost:5173
```

Build a static copy with `npm run site:build` (output in `site/.vitepress/dist`). To host it under a sub-path, set `SITE_BASE`, for example `SITE_BASE=/discord-curriculum/ npm run site:build`.

The site stores progress and quiz scores in the browser's localStorage. There is no backend.

## The checkers

| Command | What it does |
| --- | --- |
| `npm run check:concepts` | Fails if any lesson asks the learner to type code that uses something taught in a later lesson, or if a snapshot uses something not in the ledger. |
| `npm run check:lessons` | Renders every lesson like the site does and catches broken quizzes, unclosed blocks and missing images. |
| `npm run verify` | Opens every snapshot in headless Chromium (React snapshots are built with Vite first), fails on console errors and failed feature checks, and regenerates the goal screenshots in `site/public/screenshots/`. |
| `npm run check` | Runs all three. |
| `npm run demos` | Copies and builds every snapshot into `site/public/demos/` so each lesson page can link to "Open the reference app". |

`npm run verify` needs a Chromium. It uses `/opt/pw-browsers/chromium` when present, or set `CHROMIUM_PATH`, or run `npx playwright install chromium`.

## Where the pieces are

- Course structure (lesson list, titles, slugs): `site/.vitepress/curriculum.mjs`
- Markdown extensions (starter boxes, quizzes, solutions): `site/.vitepress/markdown.mjs`
- Feature checks used by `verify` (shared by the vanilla and React snapshots): `tools/checks.mjs`
- How lessons are written: `tools/authoring/GUIDE.md`
