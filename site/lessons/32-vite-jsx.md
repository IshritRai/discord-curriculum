---
lesson: 32
title: Node, npm, Vite & JSX
---

# Lesson 32 — Node, npm, Vite & JSX

Time to build the chat app a second time, with **React**, a library for building interfaces out of reusable pieces. This lesson sets up the tools (Node, npm, Vite), creates a new project in a `react-app/` folder next to your `vanilla/` folder, and turns the static page from Lesson 11 into **JSX**, React's way of writing HTML inside JavaScript.

## 🎯 Goal

A second app, running from a development server at `http://localhost:5173/`, that looks like the static layout from Lesson 11: four columns (server rail, channels, messages, members), the same colors and fonts. It is still only a picture: buttons don't do anything yet. What's new is *how it is made*: the page you see comes from JavaScript in `react-app/src/App.jsx`.

![The React version of the chat app: server rail, channel list with text and voice channels, a scrolling #general conversation and the member list, all the same dark theme as the plain HTML version](/screenshots/lesson-32.png){.screenshot}

You'll also be able to edit `App.jsx`, save, and watch the browser update by itself without a reload.

## 🧠 New concepts

<ConceptList />

### Why React?

In the vanilla app you wrote code that said *how* to change the page: create an element, append it, remove it, toggle a class. As the app grew you needed a `render()` function and careful rules about what to call when (Lesson 16). React turns that around. You describe **what the page should look like for the current data**, and React works out the DOM changes. You keep doing the same things (state, events, lists) but with less manual DOM work. Over Lessons 32–41 you'll rebuild the same app and see the differences side by side.

### Node.js and npm

Until now JavaScript ran only inside the browser. **Node.js** is a program that runs JavaScript *outside* the browser, on your computer, like `python` runs `.py` files. Developers use it to run tools: today, the tool that prepares and serves your React code.

**npm** (Node Package Manager) comes with Node. It downloads **packages**, bundles of code other people wrote, such as React itself.

| In Python | In Node | |
| --- | --- | --- |
| `python` | `node` | runs JavaScript files |
| `pip` | `npm` | installs packages |
| `requirements.txt` / `pyproject.toml` | `package.json` | lists what the project needs |
| the packages in `site-packages` | the `node_modules/` folder | where the downloaded packages live |
| `pip install -r requirements.txt` | `npm install` | install everything listed |

Unlike pip's default, npm puts the packages *inside each project*, in a folder called `node_modules/`. That folder can hold thousands of files, so **it is never committed to Git** (the `.gitignore` that comes with the project already lists it) and you can always recreate it with `npm install`.

### `package.json`

Every Node project has a `package.json` file, a JSON file (Lesson 18) with the project's name, its **dependencies** (packages the app needs when it runs, like `react`) and **devDependencies** (tools used only while developing, like `vite`), and a `"scripts"` section: named commands. `npm run dev` looks up `"dev"` in `"scripts"` and runs it.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.2.8"
  }
}
```

The `^` before a version number means "this version or a newer compatible one", so the exact numbers you get will be newer than the ones printed in this lesson. That's normal.

### Vite: the development server

React code uses **JSX**, which browsers can't read. Something has to convert it to plain JavaScript first. **Vite** (French for "quick", pronounced like "veet") is that tool, and it is also your development server. Its docs describe it as a build tool that provides a fast dev server and bundles code for production ([vite.dev/guide](https://vite.dev/guide/)).

Compare it with Live Server:

| Live Server | Vite dev server |
| --- | --- |
| serves your files unchanged | converts JSX to JavaScript as the browser asks for each file |
| reloads the whole page on save | updates just the changed part of the page ("**HMR**", hot module replacement), often keeping the app's state |
| address `127.0.0.1:5500` | address `localhost:5173` |

Vite needs a fairly recent Node version. Its guide says Node.js 20.19+ or 22.12+ (check the current requirement when you install).

### The project scaffold

`npm create vite@latest` runs Vite's official **scaffolding tool** (`create-vite`), which asks a few questions and generates a ready-made starter project from a **template**. You'll use the `react` template (plain JavaScript, not TypeScript). The generated project looks like this (after you clean it up in this lesson):

```text
react-app/
├── index.html          the only HTML page; has <div id="root">
├── package.json        dependencies and scripts
├── vite.config.js      Vite's settings (the React plugin is already added)
├── public/             files served as-is: icons.svg, brand/logo.svg
└── src/                your code
    ├── main.jsx        starts React: puts <App /> into #root
    ├── App.jsx         the App component
    └── styles/         the CSS files you wrote in Lessons 04–30
```

### How the page starts: `index.html` and `main.jsx`

In the vanilla app, `index.html` contained all the markup. In React, `index.html` is nearly empty:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

The script is a **module** (Lesson 17). `main.jsx` hands control to React:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- `createRoot(element)` tells React "you are in charge of everything inside this element" ([createRoot on react.dev](https://react.dev/reference/react-dom/client/createRoot)). You call it once. `.render(...)` says what to draw there.
- `<StrictMode>` is a wrapper that adds extra checks while you develop, for example it runs some of your code twice to expose mistakes. It has no visible effect and does nothing in the production build ([StrictMode on react.dev](https://react.dev/reference/react/StrictMode)). Keep it.
- `<App />` is your first **component**, which comes next.
- `import App from './App.jsx'` is a **default import**: no curly braces, because the other file used `export default`. (Named imports with braces, like `{ createRoot }`, you know from Lesson 17.)
- `import { StrictMode } from 'react'` has no `./`: a bare name means "from the installed package", here `react` in `node_modules`.
- `import './styles/theme.css'` imports a CSS file with no name: Vite adds its rules to the page. That replaces the `<link rel="stylesheet">` tags of your vanilla `index.html`.

### Components are functions that return JSX

A **component** is a JavaScript function whose name starts with a **capital letter** and that returns a description of some UI:

```jsx
function Greeting() {
  return <h1>Hello from a component</h1>;
}

export default Greeting;
```

You use it like an HTML tag: `<Greeting />`. A lowercase tag like `<h1>` is a normal HTML element; a capitalized one like `<Greeting />` is a component. In this lesson the whole app is one component, `App`. In Lesson 33 you'll split it into many. See [Your first component](https://react.dev/learn/your-first-component).

`export default App;` makes `App` the main thing this file offers, so other files can `import App from './App.jsx'`. A file can have only one default export.

### JSX

**JSX** looks like HTML inside JavaScript. It is not HTML: Vite converts each tag into a function call. Roughly:

```text
<h1 className="title">Hi</h1>   becomes   jsx("h1", { className: "title", children: "Hi" })
```

That is why you can put it anywhere a value can go, such as after `return`. (If you open DevTools → Sources/Network and look at what the dev server sent for `App.jsx`, you'll see exactly this kind of code.) Files containing JSX are named `.jsx` so the tools know to convert them.

JSX has stricter rules than HTML ([Writing markup with JSX](https://react.dev/learn/writing-markup-with-jsx) has the full list). Here are the ones you need today:

**1. `className`, not `class`.** `class` is already a JavaScript keyword, so JSX uses the DOM name you met in Lesson 13:

```jsx
<section className="user-panel">...</section>
```

**2. Many attributes are camelCase.** `datetime` becomes `dateTime`. Attributes with a hyphen, like `aria-label` and `data-*`, stay as they are.

```jsx
<time dateTime="2026-10-11T09:12:00Z">9:12 AM</time>
```

**3. Every tag must be closed.** HTML lets you write `<img src="x.png">` or `<input type="text">`. In JSX, tags with no content need a slash at the end:

```jsx
<img className="brand-logo" src="brand/logo.svg" alt="" />
<input className="search-input" type="search" />
```

**4. One parent element.** A component can return only one top-level element. Two siblings are an error:

```text
return (
  <h1>Title</h1>
  <p>Text</p>
);          ✗ error: two elements at the top
```

Wrap them in a parent, or in a **fragment**, an invisible wrapper written `<>` … `</>` that adds nothing to the page ([Fragment](https://react.dev/reference/react/Fragment)):

```jsx
return (
  <>
    <h1>Title</h1>
    <p>Text</p>
  </>
);
```

**5. Comments use `{/* … */}`.** An HTML comment `<!-- … -->` is not valid in JSX. Inside JSX, curly braces mean "JavaScript goes here", and a JavaScript comment goes inside them:

```jsx
{/* The server rail */}
<nav className="server-rail"></nav>
```

**6. Parentheses after `return`.** When the JSX spans several lines, wrap it in `( )`. Without them JavaScript would return after the first line and the rest would never run.

::: tip Python comparison
Python uses indentation to show structure, JSX uses nested tags. And the way Python wants a single expression after `lambda:` is similar to JSX wanting a single top-level element after `return`.
:::

### Where files live: `src/` versus `public/`

Files you `import` (JavaScript, CSS) go in `src/`. Vite processes them. Files in `public/` are served **as-is** at the root of the site: `public/icons.svg` becomes `/icons.svg` and `public/brand/logo.svg` becomes `/brand/logo.svg` ([Vite docs on public files](https://vite.dev/guide/assets)). Our icons are used from `<use href="icons.svg#plus" />`, a plain URL in markup, so they belong in `public/`.

## 🛠️ Build it

::: warning Tools and prompts change
Installers, `npm create vite@latest` and its questions change over time. This lesson was written against `create-vite` 9.3.4 and Node 22. If your terminal asks something different from what's described here, read the question and pick the choice that matches: **React**, **JavaScript** (not TypeScript), and "no" to anything that would start a server or install extras. If something is badly broken, search for the Vite guide at vite.dev and follow it for the current steps.
:::

### Step 1 — Install Node.js

In the terminal, check whether Node is already installed:

```sh
node -v
npm -v
```

If both print version numbers (Node should be 20.19 or newer, or 22.12 or newer, according to Vite's guide), skip to Step 2. If you see `command not found`:

1. Go to [nodejs.org/en/download](https://nodejs.org/en/download) in your browser.
2. Choose the **LTS** version (Long-Term Support: the stable one) and download the macOS installer. Open it and follow the installer.
3. **Quit and reopen the terminal** (or VS Code), then run `node -v` and `npm -v` again.

The Node website's download page has changed its layout before, and it now offers other ways to install (such as package managers). An installer from nodejs.org is the simplest choice for this course. If you already use Homebrew, `brew install node` also works. Ask for help if you're unsure which to pick.

<!-- no-solution: installing a program, nothing to type in the project -->

### Step 2 — Create the project with Vite

In the VS Code terminal, go to your repository folder (the one that contains `vanilla/`) and run the scaffolding tool:

```sh
cd ~/code/chat-clone
npm create vite@latest react-app -- --template react
```

- `npm create vite@latest` runs `create-vite`. (If npm asks whether to install `create-vite`, say yes: it's a tool, installed temporarily.)
- `react-app` is the folder to make. That folder name matters: this course uses `react-app` from now on.
- The `--` separates npm's own options from the options meant for the tool; `--template react` picks the plain-JavaScript React template.

It may ask a few questions. With the options above I got these (yours may differ):

1. **Which linter to use?** (A *linter* is a tool that points out likely mistakes in your code.) Choose **Oxlint**, the first option.
2. **Install with npm and start now?** Choose **No**, so you can do the steps yourself and see what each does.

Then you'll see `react-app` appear in the VS Code Explorer next to `vanilla`.

::: details If it asks "Select a framework" or "Select a variant"
That happens if the `--template react` part was missed or is not recognised. Choose **React**, then **JavaScript** (not TypeScript, and not the "React Compiler" variants).
:::

<!-- no-solution: running the scaffolding tool -->

### Step 3 — Install packages and start the dev server

```sh
cd react-app
npm install
npm run dev
```

- `cd react-app` moves into the project.
- `npm install` reads `package.json` and downloads React, Vite and the other packages into a new `node_modules/` folder. It takes from a few seconds to a minute. A `package-lock.json` file appears too: it records the exact versions installed. (It's meant to be committed.)
- `npm run dev` starts Vite. It keeps running: the terminal doesn't return to a prompt. The output looks like this:

```text
  VITE v8.3.4  ready in 197 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

(Version number and timing will differ.) Hold <kbd>Cmd</kbd> and click the `Local` address, or open `http://localhost:5173/` in Chrome. You'll see Vite's starter page with a counter button. Click it a few times: it already works, because it's a React component. We'll replace it.

To stop the server later press <kbd>Ctrl</kbd>+<kbd>C</kbd> in that terminal. Leave it running for now. Open a **second terminal** in VS Code (the **+** button in the terminal panel) for other commands.

::: info Two servers
You now have two apps. `vanilla/` is still served by Live Server on port 5500, and `react-app/` by Vite on port 5173. They don't affect each other.
:::

<!-- no-solution: running commands -->

### Step 4 — Look around, then clean up

Spend a minute reading what the template gave you:

- `index.html`: find `<div id="root">` and the `<script type="module" src="/src/main.jsx">`.
- `src/main.jsx`: the `createRoot` code from *New concepts*.
- `src/App.jsx`: the starter component (counter, logos).
- `package.json`: see `"scripts"`, `"dependencies"` (`react`, `react-dom`) and `"devDependencies"` (`vite` and more).

Now remove what we don't need. We keep `src/App.jsx` and `src/main.jsx`, and delete the template's own CSS and images. In the second terminal (in `~/code/chat-clone/react-app`):

```sh
rm src/App.css src/index.css public/favicon.svg
rm -r src/assets
```

`rm` removes files, and `rm -r` removes a folder and everything in it. There is no trash bin and no undo, so check the paths first. The template also ships `public/icons.svg` (its own icons); we'll overwrite that file in the next step.

The browser will show an error now, since `App.jsx` imports the deleted files. That's expected.

<!-- no-solution: deleting template files -->

### Step 5 — Copy your CSS and icons from the vanilla app

Your CSS files and the SVG icon sheet work unchanged in React, so copy them. Run these in the terminal, still inside `~/code/chat-clone/react-app`:

```sh
mkdir src/styles
cp ../vanilla/css/*.css src/styles/
mkdir public/brand
cp ../vanilla/assets/icons.svg public/icons.svg
cp ../vanilla/assets/brand/logo.svg public/brand/logo.svg
```

- `cp` copies a file. `../` means "the folder above this one", and `*.css` matches every file ending in `.css`.
- `public/icons.svg` is overwritten with your icon sheet.

Check in the Explorer that `src/styles/` holds ten CSS files (`theme.css`, `base.css`, `layout.css`, `server-rail.css`, `channels.css`, `chat.css`, `members.css`, `voice.css`, `overlays.css`, `responsive.css`) and that `public/` holds `icons.svg` and `brand/logo.svg`.

<!-- no-solution: copying files with cp -->

### Step 6 — `main.jsx`: import the CSS and start React

Replace the contents of `react-app/src/main.jsx` with the code below. The imports of the ten CSS files replace the `<link>` tags of the vanilla page. Their **order matters** (later files can override earlier ones), so keep the order of the vanilla `index.html`.

(The template uses no semicolons. JavaScript doesn't require them, and the course uses them, so type them to match.)

::: solution
```jsx [react-app/src/main.jsx]
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The same CSS files as the vanilla app, copied into src/styles/
import './styles/theme.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/server-rail.css';
import './styles/channels.css';
import './styles/chat.css';
import './styles/members.css';
import './styles/voice.css';
import './styles/overlays.css';
import './styles/responsive.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```
:::

### Step 7 — `index.html`: the title and the favicon

Open `react-app/index.html`. Change two things: the favicon (`<link rel="icon" …>`) should point to `/brand/logo.svg`, and the `<title>` should be `Hubbub` (the template put the project name there). The leading `/` is fine here: Vite serves `public/` at the root of the dev server.

::: solution
```html [react-app/index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/brand/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hubbub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
:::

### Step 8 — Convert the user panel to JSX by hand

Now the App. Converting 350 lines of HTML by typing would teach you little after the first few tags, so you'll convert **one small part yourself**, the user panel at the bottom left, and paste the rest in the next step.

Here is that part as plain HTML, from your Lesson 11 page:

```html
<section class="user-panel" aria-label="Your account">
  <button class="user-panel-profile" type="button" id="user-panel-profile">
    <span class="avatar status-online" id="user-panel-avatar">S<span class="status-dot"></span></span>
    <span class="user-panel-names">
      <span class="user-panel-name" id="user-panel-name">Sam</span>
      <span class="user-panel-tag" id="user-panel-tag">Learning frontend 🚀</span>
    </span>
  </button>
  <button class="icon-button" type="button" id="mute-button" aria-label="Mute">
    <svg class="icon"><use href="icons.svg#mic"></use></svg>
  </button>
  <button class="icon-button" type="button" id="deafen-button" aria-label="Deafen">
    <svg class="icon"><use href="icons.svg#headphones"></use></svg>
  </button>
  <button class="icon-button" type="button" id="settings-button" aria-label="User Settings">
    <svg class="icon"><use href="icons.svg#settings"></use></svg>
  </button>
</section>
```

Create `react-app/src/App.jsx` (replace the template's contents) with a component that returns this markup as JSX. Use the rules from *New concepts*:

1. Wrap it in `function App() { return ( … ); }`.
2. Change every `class=` to `className=`.
3. Write `<use … />` as a self-closing tag (it has no content).
4. End the file with `export default App;`.

Save and look at the browser: the dark page now has just the user panel in a corner. That's your component working, rendered by React.

**Try breaking it** (then undo): add a second element right after the `</section>`, for example `<p>Hello</p>`. Vite shows an error overlay about the JSX needing one parent. Now wrap both in `<>` … `</>` and the error disappears. Remove the `<p>` again.

::: solution
```jsx [react-app/src/App.jsx]
function App() {
  return (
    <section className="user-panel" aria-label="Your account">
      <button className="user-panel-profile" type="button" id="user-panel-profile">
        <span className="avatar status-online" id="user-panel-avatar">S<span className="status-dot"></span></span>
        <span className="user-panel-names">
          <span className="user-panel-name" id="user-panel-name">Sam</span>
          <span className="user-panel-tag" id="user-panel-tag">Learning frontend 🚀</span>
        </span>
      </button>
      <button className="icon-button" type="button" id="mute-button" aria-label="Mute">
        <svg className="icon"><use href="icons.svg#mic" /></svg>
      </button>
      <button className="icon-button" type="button" id="deafen-button" aria-label="Deafen">
        <svg className="icon"><use href="icons.svg#headphones" /></svg>
      </button>
      <button className="icon-button" type="button" id="settings-button" aria-label="User Settings">
        <svg className="icon"><use href="icons.svg#settings" /></svg>
      </button>
    </section>
  );
}

export default App;
```
:::

### Step 9 — Paste the whole page as JSX

The remaining markup is the full page of Lesson 11 (server rail, channel list, 13 messages, composer, member list), already converted the same way. Replace the entire contents of `react-app/src/App.jsx` with the code below. Your hand-converted user panel is inside it. Look for it, and compare it with yours.

While pasting, notice the differences from HTML:

- every `class` is `className`, `datetime` is `dateTime`;
- `<img … />`, `<input … />`, `<use … />` are self-closing;
- HTML comments became `{/* … */}`;
- the top is a fragment `<> … </>` because the component returns two siblings: `div.app` and the `div.drawer-backdrop` at the end.

::: starter 32
<<< @/../solutions/lesson-32/react-app/src/App.jsx [react-app/src/App.jsx]
:::

The page should now match the screenshot at the top. The server-rail buttons, the channels and the member list are all just static JSX; the next lessons replace this repetitive markup with components and real data.

### Step 10 — Watch hot reloading, and check Git ignores `node_modules`

1. With the dev server running, change `Sam` in the user panel to another name and save. The browser updates by itself **without a full reload**. That's HMR. Change it back.
2. Open DevTools → **Network**, reload, and click `App.jsx` in the list. Its **Response** tab shows JavaScript, not JSX: Vite converted it before sending. (Look for names like `jsxDEV`; the exact text depends on versions.)
3. In the terminal, in the repository root, run:

```sh
cd ~/code/chat-clone
git status
```

You should see `react-app/` as a new (untracked) folder, but nothing from `node_modules/`, because `react-app/.gitignore` lists it. If thousands of files from `node_modules` appear, stop and check Common mistakes.

<!-- no-solution: exploring and checking, nothing new to type -->

## ✅ Checkpoint

- [ ] `node -v` and `npm -v` print version numbers.
- [ ] `npm run dev` in `react-app/` prints a `Local: http://localhost:5173/` address and the page shows the four-column chat layout, like the screenshot.
- [ ] The browser tab says **Hubbub** and shows the logo as its icon.
- [ ] `src/App.jsx` starts with `function App()` and ends with `export default App;`; `src/main.jsx` imports ten CSS files and `App`.
- [ ] Editing text in `App.jsx` and saving updates the browser without a manual reload.
- [ ] DevTools → **Console** is free of red errors.
- [ ] `git status` (from the repository root) lists `react-app/` but no `node_modules/` files.
- [ ] Your `vanilla/` app still works at its Live Server address.

## 🐛 Common mistakes

**`command not found: npm` (or `node`).** Node isn't installed, or the terminal was opened before the installer finished. Install Node (Step 1), then quit and reopen the terminal.

**`npm run dev` says it can't find a `package.json`, or `vite: command not found`.** You're in the wrong folder, or you skipped `npm install`. Run `pwd`: you must be in `.../chat-clone/react-app`. Then run `npm install` once.

**The page is blank and the Console shows a red error about a file that can't be resolved, such as `./App.css` or `./index.css`.** Some file still imports something you deleted. Open `main.jsx` and `App.jsx` and remove the import lines that mention `App.css`, `index.css` or `assets`.

**The page loads but the styling is missing, or the layout looks broken.** Check that all ten CSS files are in `src/styles/` and that each is imported in `main.jsx`, spelled exactly like the filenames. A missing `base.css` or `layout.css` breaks a lot at once.

**Icons or the logo don't show.** The files must be in `public/` (`public/icons.svg` and `public/brand/logo.svg`), not in `src/`. In DevTools → Network look for a red `404` entry to see which URL failed.

**An error about "Adjacent JSX elements must be wrapped in an enclosing tag" (wording depends on the tool version).** `App` is returning two top-level elements. Wrap everything in one parent or a fragment `<> … </>`.

**Nothing changes when I use `class=` (or the Console warns about `class`).** In JSX the attribute is `className`. React may warn about `class` in the Console, and the styles won't match.

**Thousands of `node_modules` files show up in Git (or VS Code's Source Control view).** The `.gitignore` is missing from `react-app/`. Look for it with `ls -a` (names starting with a dot are hidden). If it's missing, copy the contents shown in the solution folder for this lesson, or recreate the project.

## 📝 Quiz

::: quiz
Which of these is valid JSX?

- [ ] `<div class="box"><img src="a.png"></div>`
- [x] `<div className="box"><img src="a.png" alt="" /></div>`
- [ ] `<div className="box"><img src="a.png" alt=""></div>`
- [ ] `<div class="box"><img src="a.png" alt="" /></div>`

> JSX needs `className` instead of `class`, and every tag closed: `<img ... />`. The first option has both mistakes, the third doesn't close the `<img>`, and the fourth uses `class`.
:::

::: quiz
What does this component's `return` do?

```jsx
function Page() {
  return (
    <h1>Title</h1>
    <p>Text</p>
  );
}
```

- [ ] Shows both the heading and the paragraph
- [ ] Shows only the heading
- [x] Is an error: a component must return one parent element, such as a `<>` … `</>` fragment
- [ ] Shows the text twice

> Two top-level elements aren't allowed. Wrapping them in a `<div>` works, and so does an invisible fragment `<> … </>` that adds no extra element to the page.
:::

::: quiz
You run `git clone` on a project and `npm install` is the first command you should run. Why?

- [ ] It installs Git
- [x] The project's packages in `node_modules/` aren't committed to Git, and `npm install` downloads them as listed in `package.json`
- [ ] It converts JSX to JavaScript
- [ ] It starts the dev server

> `node_modules/` is huge and fully reproducible from `package.json`, so it's left out of Git. `npm install` rebuilds it, much like `pip install -r requirements.txt`.
:::

## 💾 Commit

From the repository root (`~/code/chat-clone`):

```sh
git add .
git commit -m "Add React app scaffolded with Vite and convert the page to JSX"
git push
```

`git add .` will include `react-app/package-lock.json` but not `node_modules/`.
