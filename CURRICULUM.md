# Curriculum plan

This file is the plan behind the tutorial site: the lesson list, why the lessons are in this order, the tools I picked, and the conventions the lessons and reference solutions follow.

## The two things in this repository

| Folder | What it is |
| --- | --- |
| `site/` | The tutorial website (VitePress). Read it in your browser while you code in VS Code. |
| `solutions/lesson-NN/` | A working snapshot of the clone at the **end** of lesson NN. Compare it with your code, or copy it if you get stuck. |
| `concepts.json` | The ledger: every concept the course uses, and the lesson that introduces it. |
| `tools/` | Scripts that check the ledger and test every snapshot in a real browser (Chromium). |

Your own code lives in your own repository, which you create in Lesson 1. Its layout is below. The React folder is called `react-app/` rather than `react/`, so the project's name in `package.json` isn't the same as the `react` library it depends on, which avoids confusion.

```text
chat-clone/            ← your repo (Lesson 1)
├── README.md
├── .gitignore
├── vanilla/           ← the plain HTML/CSS/JS app (Lessons 0–31)
└── react-app/         ← the React app (Lessons 32–41)
```

The snapshots mirror that layout. `solutions/lesson-07/` is what your whole repo should look like after Lesson 7. From Lesson 32 on, snapshots contain `react-app/` and the repository-root files only. The `vanilla/` folder stops changing after Lesson 31, so Lesson 31's copy is the final one.

## Lesson list (42 lessons: 41 core + 1 optional)

Each lesson takes about 45–60 minutes. At 6 lessons a week that is about 7 weeks.

| # | Phase | Lesson | What you see at the end |
| --- | --- | --- | --- |
| 00 | Setup | Your toolkit & how the web works | "Hello" page served by Live Server, inspected in DevTools |
| 01 | Git | Git & GitHub: save and share your work | Your repo on GitHub with a first commit |
| 02 | HTML | Elements, attributes & nesting | A plain document listing servers, channels, messages, members |
| 03 | HTML | Semantic HTML: the app skeleton | The full page structure, unstyled |
| 04 | CSS | Selectors, colors, text & theme variables | Dark theme colors and fonts |
| 05 | CSS | The box model | Round server icons, spacing everywhere |
| 06 | CSS | Flexbox and SVG icons | Rows and columns line up, icons appear |
| 07 | CSS | Grid: the app shell | The 4-column app layout filling the window |
| 08 | CSS | States: hover, focus, selected & transitions | Hover pills, icon morph, selected channel |
| 09 | CSS | Positioning: badges, dots & layers | Mention badges, status dots |
| 10 | CSS | Overflow, scrolling & custom scrollbars | Each column scrolls on its own, slim scrollbars |
| 11 | CSS | Responsive design | Layout adapts to narrow windows |
| 12 | JS | JavaScript for Python programmers | Your data explored in the DevTools Console |
| 13 | JS | The DOM: find and change elements | User panel filled in by JavaScript |
| 14 | JS | Rendering lists from data | Server rail, channels and members built from arrays |
| 15 | JS | Events & event delegation | Clicking servers/channels, collapsing categories, drawers |
| 16 | JS | State, rendering & localStorage | Selection drives the whole UI and survives a reload |
| 17 | JS | Modules & the brand config | Code split into modules; one file controls the branding |
| 18 | JS | JSON files, fetch & async/await | Data loaded from `.json` files |
| 19 | Features | Channel list: categories, voice, unread & mentions | Unread channels, mention badges on servers |
| 20 | Features | Message feed: grouping, timestamps, dividers | A message feed that looks like the real thing |
| 21 | Features | Markdown & links (regex + safe HTML) | **bold**, *italic*, `code`, code blocks, links |
| 22 | Features | The composer: sending messages | Enter sends, Shift+Enter adds a new line |
| 23 | Features | Editing & deleting your messages | Hover actions, inline edit, delete |
| 24 | Features | Emoji picker & reactions | Picker, reaction pills with counts |
| 25 | Features | Member list: roles & online status | Members grouped by role and status |
| 26 | Features | Modals with `<dialog>` | Create-server and user-profile modals |
| 27 | Features | Context menus & tooltips | Right-click menus, hover tooltips |
| 28 | Features | Timers: typing indicator & fake messages | "Ava is typing…", messages arriving on their own |
| 29 | Voice | Voice channel UI | Join/leave, mute/deafen, speaking rings |
| 30 | Voice | *(Optional)* Your mic, locally, with Web Audio | Your own avatar lights up when you talk; nothing is sent anywhere |
| 31 | Deploy | Deploy to GitHub Pages | The vanilla app live on the internet |
| 32 | React | Node, npm, Vite & JSX | A React app showing the static shell |
| 33 | React | Components, props, lists & keys | The whole UI rendered from data with components |
| 34 | React | State & events with `useState` | Selecting, collapsing, sending |
| 35 | React | `useReducer` & Context | One store for the app; edit & delete |
| 36 | React | Effects & refs | Persistence, timers, auto-scroll |
| 37 | React | Routing with React Router | URLs like `#/channels/s1/c1`; back button works |
| 38 | React | Reactions, emoji picker & member list | Feature parity for the chat area |
| 39 | React | Modals, context menus & tooltips | Feature parity for overlays |
| 40 | React | Voice UI & custom hooks | Feature parity for voice (and the optional mic hook) |
| 41 | Wrap-up | Vanilla vs React, and deploying React | Side-by-side comparison; React app live |

## Changes from the suggested order, and why

1. **Typography is part of the first CSS lesson.** Font, size and color are the first things you notice on a page, and they need no new mental model.
2. **SVG icons come with Flexbox.** Icons are the first thing you line up in a row, so you learn them where you use them.
3. **I added a Positioning lesson (09).** Badges, status dots, tooltips, menus and the drawer all need `position`. It wasn't in the suggested list, but every overlay feature depends on it.
4. **Responsive CSS comes before JavaScript, and the JavaScript part comes with Events (15).** CSS does the hard part with classes such as `is-nav-open`. Your first event handlers then just toggle those classes, which is a satisfying first win.
5. **State (16) comes before Modules (17).** By the end of Lesson 16 `app.js` is a few hundred lines with a clear shape (state, render functions, actions). That makes the reason for splitting it into modules obvious, and makes it clear where each piece should go.
6. **localStorage is taught with State (16), not as a late feature.** Once the app saves its state from that lesson on, every later feature (sent messages, reactions, new servers) is saved without extra work.
7. **JSON/fetch (18) comes after State.** Loading data asynchronously is easier once you know where the data goes.
8. **Native `<dialog>` and the Popover API are used for modals and menus.** They are current web standards ([MDN: dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)) and give you Escape-to-close, focus handling and click-outside-to-close for free, with less code to type than hand-built versions.
9. **The React half reuses your CSS, data and pure functions.** You copy them over (pasting is clearly marked) and spend your typing time on components and state. Each React lesson has a "Vanilla vs React" box, and Lesson 41 is a full side-by-side comparison.
10. **42 lessons, slightly more than the 35–40 asked for.** Rebuilding the clone in React with every feature needs about nine lessons. Squeezing them into fewer would push lessons well past 60 minutes. Lesson 30 is optional, so the core path is 41 lessons.

## Tool choices

- **Tutorial site: VitePress 1.6.** It gives you the sidebar, previous/next links, dark mode, local search and syntax highlighting (Shiki) out of the box. Lessons are plain Markdown. Interactive parts (quizzes, progress tracking) are small Vue components that you never have to read or edit. Its 1.x API has been stable for a long time, which makes it less likely that the site's own setup is out of date. Astro would also work, but it needs more custom code for the same features.
- **Local server for the vanilla app: VS Code's Live Server extension.** JavaScript modules and `fetch()` don't work from `file://` URLs, so you need a local web server from the start. Live Server also reloads the page whenever you save.
- **React tooling: Vite + React + React Router**, created with `npm create vite@latest`. Tool setup screens change often, so each lesson that installs something says what to check if the prompts look different.

## Conventions

### Code blocks in lessons

- **Code you type** has syntax highlighting and **no copy button**, on purpose.
- **Starter code** sits in a box labeled *"Starter code — paste this"* that also names the lesson where it will be explained. Only these blocks have a copy button.
- **Reveal solution** blocks are collapsed by default and show the finished code for one step.

### The no-untaught-code rule

`concepts.json` maps every concept (an HTML tag, a CSS property, a JS method, a shell command…) to the lesson that introduces it. `npm run check:concepts`:

1. reads every code block in every lesson,
2. extracts what each block uses (HTML tags and attributes, CSS properties, selectors and functions, JS syntax, built-in objects and methods, JSX, shell commands),
3. fails if a block you're asked to type uses something introduced in a later lesson,
4. fails if a starter block claims "explained in Lesson N" but uses something introduced after N,
5. fails if something isn't in the ledger at all (so the ledger can't fall behind),
6. runs the same checks on every solution snapshot.

### Reference solutions

`npm run verify` serves each snapshot and opens it in headless Chromium. It fails on any console error, failed request or broken feature check. It also saves the screenshot shown at the top of each lesson. The feature checks are shared between the vanilla and React snapshots, so the React version is tested against the same behavior as the vanilla one.
