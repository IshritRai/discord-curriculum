# Build a Chat App: learn frontend development

A free, self-paced course that teaches **HTML, CSS, JavaScript and React** by building a chat app that looks like a Discord desktop client. It starts from "what is a web page?" and ends with the same app built twice, once with plain JavaScript and once with React, deployed on the internet.

**Read the course: https://ishritrai.github.io/discord-curriculum/**

Works on **macOS, Windows and Linux**. Nothing to install to *read* it: it's a normal website. (You do install a code editor and a few tools to *follow* it; Lesson 00 walks through that for your system.)

> This is an independent learning project. It is not affiliated with or endorsed by Discord. The app uses a placeholder name ("Hubbub") and original icons; all branding is in one file so you can change it.

## Who it's for

People who know a little programming (variables, loops, functions, lists, dictionaries; Python is a good starting point) and **zero web development**. No HTML, CSS, browser JavaScript or React needed. You'll type the code yourself, in your own editor, and compare with a working solution whenever you like.

## What you'll build

A frontend-only chat app with **fake data** (no backend, no accounts, no networking):

- server list with unread and mention badges, collapsible channel categories, text and voice channels
- message feed with grouped messages, timestamps, date dividers, avatars, basic markdown (bold, italic, code, code blocks) and links
- sending, editing and deleting your own messages (`Enter` sends, `Shift+Enter` adds a new line)
- emoji picker and reactions, member list grouped by role and status
- modals, right-click menus, tooltips, fake typing indicator and fake incoming messages
- state saved in `localStorage`, responsive layout for narrow screens
- a voice-channel interface (join/leave, mute/deafen, speaking indicators), plus an optional lesson that lights up your own avatar from your microphone **locally**. This is UI only: no audio is recorded, stored or sent anywhere.

## How the course works

- **42 lessons** of about 45–60 minutes each (41 core + 1 optional). About seven weeks at six lessons a week.
- **Every lesson has the same shape:** goal and screenshot, new concepts (with diagrams), guided build in small steps, a checkpoint (including a DevTools check), common mistakes, a short quiz, and a suggested Git commit.
- **You type the code.** Typed code has no copy button on purpose. Anything you only paste is in a clearly labelled **Starter code** box that tells you which lesson explains it.
- **No untaught code.** You're only asked to type code that uses ideas from the current or an earlier lesson. A checker enforces this (see below).
- **A working solution for every lesson,** in [`solutions/`](solutions/). Compare, recover, or copy.
- **Progress and quiz scores** are saved in your browser (nothing is uploaded). Export or reset them on the Progress page.

| Phase | Lessons | What you do |
| --- | --- | --- |
| Setup & Git | 00–01 | Tools, how the web works, DevTools, Git and GitHub |
| HTML | 02–03 | The semantic skeleton of the app |
| CSS | 04–11 | Theme, box model, flexbox, grid, states, positioning, scrolling, responsive design |
| JavaScript | 12–18 | DOM, rendering from data, events, state, localStorage, modules, JSON and `fetch` |
| Features | 19–28 | Unread badges, message feed, markdown, composer, editing, reactions, modals, menus, timers |
| Voice | 29–30 | Voice UI, and an optional local microphone meter |
| Deploy | 31 | Publish the plain version on GitHub Pages |
| React | 32–40 | Vite, JSX, components, state, reducers, context, effects, routing, custom hooks |
| Wrap-up | 41 | Vanilla vs React compared, and deploying the React version |

The reasoning behind the order is in [`docs/CURRICULUM.md`](docs/CURRICULUM.md).

## What you need

- A computer running macOS, Windows or Linux, and an internet connection
- [Visual Studio Code](https://code.visualstudio.com/) and [Google Chrome](https://www.google.com/chrome/) (Linux: Chrome or Chromium)
- Free accounts and tools that Lessons 00–01 and 32 set up with you: Git (on Windows, **Git for Windows**, which includes Git Bash), a GitHub account, and Node.js

On Windows the course uses **Git Bash** as the terminal, so every command in every lesson is the same on all three systems.

## Repository layout

```text
.
├── site/              The course website (VitePress). Lessons are Markdown in site/lessons/
├── solutions/         A working snapshot of the learner's project at the end of every lesson
│   └── lesson-NN/
├── docs/              The curriculum plan (why the lessons are in this order)
├── tools/             Checkers and builders (see below); tools/authoring/ has the lesson-writing guide
├── concepts.json      The ledger: every concept the course uses, and the lesson that introduces it
├── LICENSE            MIT
└── CONTRIBUTING.md    How to report problems and contribute
```

## Run the website locally (optional)

You only need this to work on the course itself. Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run site:dev        # http://localhost:5173
```

`npm run site:build` writes a static copy to `site/.vitepress/dist`. To host it under a sub-path (as GitHub Pages does), set `SITE_BASE`, for example `SITE_BASE=/discord-curriculum/ npm run site:build`.

## Quality checks

| Command | What it does |
| --- | --- |
| `npm run check:concepts` | Fails if a lesson asks the learner to type code that uses something taught in a later lesson, or if a solution uses something missing from the ledger. |
| `npm run check:lessons` | Renders every lesson like the site does; catches broken quizzes, unclosed blocks and missing images. |
| `npm run verify` | Opens every solution in headless Chromium (React solutions are built with Vite first), fails on console errors and failed feature checks, and regenerates the screenshots in `site/public/screenshots/`. The same feature checks run against the plain and React versions. |
| `npm run check` | All three. |
| `npm run demos` | Builds every solution into `site/public/demos/` so lesson pages can link to "Open the reference app". |

`npm run verify` needs a Chromium: it uses `/opt/pw-browsers/chromium` if present, or the path in `CHROMIUM_PATH`, or Playwright's own (`npx playwright install chromium`).

## Contributing

Found a mistake, an unclear step, or something that doesn't work on your operating system? Please [open an issue](https://github.com/IshritRai/discord-curriculum/issues). See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes.

## Licence

[MIT](LICENSE). You're free to reuse the code and the text, including in your own courses; keep the copyright notice.
