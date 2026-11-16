---
lesson: 41
title: Vanilla vs React, and deploying React
---

# Lesson 41 — Vanilla vs React, and deploying React

You built the same app twice. In this last lesson you compare the two honestly, with real numbers, and then publish the React version next to the plain one on GitHub Pages, using a small automated workflow that rebuilds the site every time you push.

## 🎯 Goal

At the end, one public website has a landing page with two links: the plain HTML/CSS/JS version at `https://YOUR-USERNAME.github.io/chat-clone/vanilla/` and the React version at `https://YOUR-USERNAME.github.io/chat-clone/react-app/`. You also have your own side-by-side numbers for the two code bases.

![The React version of the chat app, running: Frontend Friends server, #general channel, grouped member list on the right](/screenshots/lesson-41.png){.screenshot}

The app looks the same as in Lessons 39 and 40; what's new is that it runs from a public address and that you can say, with evidence, what React changed.

## 🧠 New concepts

<ConceptList />

### Part 1: Vanilla vs React, honestly

Both apps look and behave nearly identically, and they use the *same* CSS files (byte for byte: I checked with `diff -rq`). So the differences are only in how the HTML and JavaScript are organized. Here they are, one by one, with real code from both.

#### 1. Rendering a list

In vanilla, you *build* DOM nodes and put them in place, repeating the whole thing after each state change. In React, you describe the list and return it.

::: info Vanilla vs React
Plain JS (`vanilla/js/chat.js`) clears the list and appends new elements:

```js [vanilla/js/chat.js]
  messageList.replaceChildren(createChannelWelcome(channel));
  let previous = null;
  for (const message of getMessages(channel.id)) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      messageList.append(createDateDivider(message.timestamp));
    }
    messageList.append(createMessage(message, startsNewGroup(previous, message)));
    previous = message;
  }
```
React (`react-app/src/components/MessageList.jsx`) builds an array of JSX; React works out what to change:

```jsx [react-app/src/components/MessageList.jsx]
  // Build the list: date dividers between days, and grouped messages.
  const items = [];
  let previous = null;
  for (const message of messages) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      items.push(
        <li key={`day-${message.id}`} className="date-divider" role="separator">
          <span>{formatDate(message.timestamp)}</span>
        </li>,
      );
    }
    items.push(<Message key={message.id} message={message} server={server} startsGroup={startsNewGroup(previous, message)} />);
    previous = message;
  }
```
Notice the `key`. It's the price of letting React be smart: you must tell it how to match old items with new ones. In return you never decide what to remove, add or move.
:::

#### 2. Handling clicks

Vanilla used **event delegation**: one listener on the whole list, then `closest()` to find out what was clicked. React attaches the handler right where the button is, and the handler closes over the data it needs.

::: info Vanilla vs React
Plain JS (`vanilla/js/channels.js`):

```js [vanilla/js/channels.js]
export function setupChannels() {
  channelList.addEventListener('click', (event) => {
    const toggle = event.target.closest('.category-toggle');
    if (toggle) {
      toggleCategory(toggle.closest('.category').dataset.categoryId);
      return;
    }
    const button = event.target.closest('.channel-button');
    if (button) {
      selectChannel(button.closest('.channel-item').dataset.channelId);
      closeNav();
    }
  });
}
```
React (`react-app/src/components/ChannelList.jsx`):

```jsx [react-app/src/components/ChannelList.jsx]
  function handleClick() {
    if (channel.type === 'voice') {
      dispatch({ type: 'joinVoice', channelId: channel.id });
    } else {
      navigate(`/channels/${serverId}/${channel.id}`);
    }
    dispatch({ type: 'setNavOpen', open: false });
  }
```
React's handler already knows which `channel` it belongs to; vanilla has to read it back out of `data-` attributes in the DOM.
:::

#### 3. Where state lives, and how the screen updates

In vanilla, `state` is a shared object that any module changes, and you must call `update()` afterwards. The screen is drawn by a function that calls every piece in turn. In React, state lives in `useReducer`, you never mutate it, and React calls the components again by itself.

::: info Vanilla vs React
Plain JS (`vanilla/js/main.js`), the "draw everything" function that must stay in sync with every new piece of UI:

```js [vanilla/js/main.js]
// Draws the whole screen from the current state.
function render() {
  renderServers();
  renderChannels();
  renderChat();
  renderMembers();
  renderUserPanel();
  renderTyping();
  renderSpeaking();
  hideTooltip();
}
```
In React there is no such function. Each component reads what it needs with `useApp()` and returns JSX. Adding the `TypingIndicator` in Lesson 36 or the `VoicePanel` in Lesson 40 meant writing a component and placing it. There was no list of render functions to update.
:::

This is the biggest practical difference. A vanilla app is easy to understand at first but every new feature must remember to update the screen in the right place. A React app asks you to learn the rules (immutability, hooks) up front, and then the screen can't get out of sync with the state.

#### 4. Forms

Both apps read the create-server form with `FormData`. The difference is *when* the code runs.

::: info Vanilla vs React
Plain JS (`vanilla/js/modals.js`) waits for the dialog to close and checks which button closed it:

```js [vanilla/js/modals.js]
  createDialog.addEventListener('close', () => {
    if (createDialog.returnValue === 'create') {
      const data = new FormData(createForm);
      createServer(data.get('serverName'), data.get('serverIcon').trim());
    }
  });
```
React (`react-app/src/components/Dialogs.jsx`) handles the form's `submit` event directly:

```jsx [react-app/src/components/Dialogs.jsx]
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('serverName').trim();
    const iconText = form.get('serverIcon').trim();
    const id = crypto.randomUUID();
```
Same browser API, different structure. The React version also doesn't need `reset()`: a closed dialog is removed from the page and a new one starts empty.
:::

#### 5. Effects, persistence and routing

Things that interact with the world outside the screen:

| Concern | Vanilla | React |
| --- | --- | --- |
| Keyboard/window listeners | `addEventListener` once at startup, never removed | `useEffect` with a cleanup (Lesson 36) |
| Saving to `localStorage` | `update()` saves after every change, always | an effect that saves when the *data* parts of the state change (Lesson 36) |
| Timers (chat simulation) | start once from `main.js` | `useSimulation` hook, stopped by cleanup |
| Which channel is open | a value in `state` | the URL, via React Router (Lesson 37) |
| Loading the data | `fetch` the JSON files at startup (Lesson 18) | `import` the JSON files; they're bundled at build time |

Routing is a fair example of "React ecosystem vs React itself": React has no router. You add a library, and the app is shaped around it. Plain JS could do the same with `location.hash` and a `hashchange` listener, but you would write the machinery yourself.

::: info Vanilla vs React
Plain JS (`vanilla/js/state.js`): every change goes through `update()`, which saves and redraws:

```js [vanilla/js/state.js]
// Call this after every change to the state: it saves and re-renders.
export function update() {
  save();
  if (onChangeCallback) {
    onChangeCallback();
  }
}
```
React (`react-app/src/state/AppContext.jsx`): saving is a declared reaction to the data changing, and redrawing is React's job:

```jsx [react-app/src/state/AppContext.jsx]
  // Save the data whenever it changes (not on every UI change).
  useEffect(() => {
    save(state);
  }, [state.users, state.servers, state.messages, state.activeChannelByServer, state.collapsedCategoryIds]);
```
:::

#### 6. Size: measured, not guessed

I counted lines in the reference snapshots with `wc -l` (the numbers include comments and blank lines, and your numbers will differ a little):

| | Plain JS (`vanilla/`) | React (`react-app/src/`) |
| --- | --- | --- |
| JavaScript / JSX files | 22 files, 1,987 lines | 34 files (20 `.jsx`, 14 `.js`), 2,191 lines |
| HTML | `index.html`, 214 lines | `index.html`, 13 lines (the page is built by JSX) |
| JavaScript + HTML together | 2,201 lines | 2,204 lines |
| CSS | 10 files, 1,680 lines | the same 10 files, 1,680 lines |
| JSON data | 1,313 lines | the same 1,313 lines |

React did **not** make this app shorter. The lines moved: the 214 lines of HTML in `index.html` became JSX inside components, and the "draw everything" code became components. React also gave us things the vanilla version never had (URLs, per-channel drafts), so the comparison isn't perfectly fair in either direction.

The size the *user downloads* is a different story. Building the React app (Part 2) printed, in my run, about **315 kB of JavaScript (about 99 kB gzipped)** and **21 kB of CSS (about 5 kB gzipped)**. The plain version's JavaScript is about **65 kB unminified (about 17 kB gzipped)** and its CSS about **32 kB unminified (about 8 kB gzipped)**. Those aren't an apples-to-apples comparison, because the plain files aren't minified and are loaded as many separate files. To see how much is "React itself", I built a tiny test app that only used `react-dom` and the six `react-router` functions this app uses: its JavaScript was about 258 kB (about 82 kB gzipped). So roughly 56 kB of the 315 kB is *your* code, and the rest is the libraries. In short: the app's own code is about the same size either way; React adds a fixed cost of roughly 80 kB gzipped for the libraries. Your numbers will vary with versions.

#### When to choose which

Plain HTML/CSS/JS is a good choice when:

- the page is mostly content with a little interactivity,
- you want no build step and nothing to install,
- the whole thing is small enough to keep in your head.

React (or a similar library) is a good choice when:

- many parts of the screen depend on the same changing data,
- the UI has a lot of states (open/closed, loading, editing) that must stay consistent,
- several people work on it, and clear component boundaries help,
- you want to use the large ecosystem of ready-made libraries and tools.

This course's chat app sits in the middle. The vanilla version works fine, and it needed careful rules (Lesson 16's "change state, then re-render" loop) to stay manageable; the React version builds those rules into the library. Neither is "the right one": you now know both well enough to choose.

### Part 2: Preparing the build

#### Dev server vs production build

`npm run dev` starts Vite's development server: it serves your source files as they are, which is fast and gives you the instant updates of Lesson 32. For publishing, `npm run build` instead **bundles** and **minifies** (removes spaces and shortens names) everything into a few files in a folder called `dist/`. Vite's docs say the build output is placed at `dist` by default, and you can deploy that folder to any static host. `dist/` is thrown away and recreated on each build, so it is not committed (the template's `.gitignore` lists it).

`npm run preview` starts a small local web server that serves `dist/` (by default at `http://localhost:4173`, according to Vite's docs), so you can test the production build on your computer before publishing.

#### Why `base: './'`

The built `index.html` has to point at the built JavaScript and CSS. By default Vite writes paths starting with `/`, such as `/assets/index.js`, which means "at the root of this website". That's fine at `https://example.com/`. But your React app will live at `https://YOUR-USERNAME.github.io/chat-clone/react-app/`, where `/assets/…` would point at `https://YOUR-USERNAME.github.io/assets/…`, which doesn't exist.

Vite's `base` option sets the public base path. The Vite docs describe a **relative base**: `base: './'` "will make all generated URLs to be relative to each file". With it, the built page asks for `./assets/…`: "next to me", wherever the page is hosted. That's why the snapshot sets it, and why the same build works from any folder. (Vite's own GitHub Pages recipe suggests `base: '/<REPO>/'` instead; relative is simpler for us because one repository serves two apps in two folders.)

Remember `HashRouter` from Lesson 37: the route is in the part after `#`, so the server never needs to know about `/channels/...` paths.

### Part 3: The GitHub Pages workflow

In Lesson 31 you published the plain version with Pages' **Deploy from a branch** option: GitHub copied the files from your repository as they were. A React app is different: what you publish (`dist/`) doesn't exist in your repository, because it's created by a build. So GitHub must run `npm run build` for you. That's what a **GitHub Actions workflow** is: a file, in `.github/workflows/`, describing steps GitHub should run on a fresh virtual machine whenever something happens.

According to GitHub's docs, if you want a build process other than Jekyll (the tool Pages builds with by default), the recommended way to publish is a workflow, and in the repository's **Settings → Pages**, under "Build and deployment", you set **Source** to **GitHub Actions**. Vite's docs give the same instructions.

::: warning Free GitHub Pages needs a public repository
GitHub's docs say Pages is available in public repositories with GitHub Free (and in private ones on paid plans). Your repository `chat-clone` must be public for the free plan, as it already had to be in Lesson 31.
:::

#### The workflow file, step by step

The file is `.github/workflows/deploy.yml` at the root of your project. It's written in **YAML**, a format based on indentation (a bit like Python) where `key: value` pairs and `- ` list items describe settings. Here it is, in plain words:

- `name: Deploy to GitHub Pages` is the name shown in your repository's **Actions** tab.
- `on:` says when to run. `push: branches: [main]` means "every time someone pushes to the `main` branch". `workflow_dispatch:` adds a **Run workflow** button in the Actions tab, so you can also start it by hand. (GitHub's docs say this button appears only for workflows that use `workflow_dispatch`.)
- `permissions:` lists what the workflow's temporary access token may do. `contents: read` lets it read your code. `pages: write` and `id-token: write` are what GitHub's docs say the deploy action needs. Everything not listed is not allowed.
- `concurrency:` with `group: pages` and `cancel-in-progress: true` means only one deployment runs at a time: if you push twice quickly, the older run is cancelled in favor of the newer. (GitHub's docs: `cancel-in-progress: true` also cancels a currently running job in the same group.)
- `jobs: deploy:` is the single job. `runs-on: ubuntu-latest` means "run it on a GitHub-hosted Linux machine". It runs there whatever your own operating system is, so the workflow is identical for macOS, Windows and Linux learners.
- `environment:` with `name: github-pages` and a `url:` ties the job to the Pages environment. The `url` line takes the address of the published site from the last step (`steps.deployment.outputs.page_url`) and shows it in the run, so you can click it.
- Then the **steps**, run in order. A step is either `uses:` (run a ready-made **action** from GitHub) or `run:` (run shell commands, like in your terminal):
  1. **Get the code**: `actions/checkout` copies your repository onto the machine.
  2. **Install Node.js**: `actions/setup-node` installs Node. `node-version: lts/*` asks for the long-term-support version (as in Vite's sample workflow). `cache: npm` and `cache-dependency-path: react-app/package-lock.json` tell it to remember downloaded packages between runs, using your lock file to know when they change. (I could not open the `setup-node` documentation from here, so this describes those options from their names and Vite's sample, which also uses `cache`.)
  3. **Build the React app**: with `working-directory: react-app`, run `npm ci` and `npm run build`. `npm ci` installs exactly the versions in `package-lock.json` (GitHub's docs say it prevents updates to the lock file, and is generally faster than `npm install`). This is why **`package-lock.json` must be committed**.
  4. **Put both versions in one folder**: make a folder `_site` and copy into it the landing `index.html`, the `vanilla` folder, and the React build (`react-app/dist`) renamed to `react-app`. This is the shape of the final website.
  5. **Set up GitHub Pages**: `actions/configure-pages`, GitHub's own helper step.
  6. **Upload the folder**: `actions/upload-pages-artifact` packages `_site` for Pages. GitHub's docs describe the artifact as a compressed archive.
  7. **Publish it**: `actions/deploy-pages` publishes the uploaded artifact. Its `id: deployment` is what the `url:` above refers to.

::: warning Action versions and the GitHub website change
The `@v7`, `@v6` and `@v5` after each action name are version numbers. They matched Vite's own sample workflow (vite.dev, "Deploying a Static Site") when this lesson was written, but GitHub's own docs pages show some older numbers in their examples, and new versions come out regularly. If a run fails with a message that an action or version can't be found, look at the action's page on GitHub or at Vite's current sample and change the number. The same goes for the Settings → Pages screens: names and positions of buttons change, so read what GitHub shows today.
:::

## 🛠️ Build it

### Step 1 — Count your own code

Open the terminal in the project root (`chat-clone`). `cat` prints files one after another, `|` (pipe) passes the output of one command to the next, and `wc -l` counts lines. `find` lists files; `xargs cat` gives that list to `cat`. These are bash commands: they work as written in macOS and Linux terminals and in Git Bash on Windows (Git for Windows ships common Unix tools; if `find` complains about its arguments, make sure you are in Git Bash and not PowerShell or cmd, which have a different `find`).

```sh
cat vanilla/js/*.js | wc -l
cat vanilla/css/*.css | wc -l
wc -l vanilla/index.html
find react-app/src -name "*.jsx" -o -name "*.js" | xargs cat | wc -l
cat react-app/src/styles/*.css | wc -l
```

Write the five numbers in a table like the one in Part 1. They won't match mine exactly (your comments and blank lines differ), but they should be close.

::: solution
On the reference project, the commands print:

```text
1987
1680
     214 vanilla/index.html
2191
1680
```

The exact spacing of the `wc` output differs between systems.
:::

### Step 2 — Use a relative base in Vite

Open `react-app/vite.config.js` and add the `base` option inside `defineConfig`. Don't forget the comma after `plugins: [react()]`.

::: solution
```js [react-app/vite.config.js]
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths in the built files, so the app works from any folder,
  // like https://YOUR-USERNAME.github.io/chat-clone/react-app/
  base: './',
})
```
:::

### Step 3 — Build and preview

Stop `npm run dev` (<kbd>Ctrl</kbd>+<kbd>C</kbd>), then:

```sh
cd react-app
npm run build
ls dist
npm run preview
```

`npm run build` prints the files it made and their sizes. `ls dist` shows `assets`, `brand`, `icons.svg` and `index.html`. `npm run preview` prints a local address, `http://localhost:4173/` by default. Open it. The app works exactly as in development, including the `#/channels/...` addresses.

Now look at what the build produced:

1. Open `react-app/dist/index.html` in VS Code. The `<script>` and `<link>` tags point at `./assets/index-….js` and `./assets/index-….css` (the letters in the names are a fingerprint and will differ).
2. In Chrome DevTools → **Network**, reload the preview page: you'll see a single JavaScript file and a single CSS file, instead of the many separate files the dev server sends.

Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop the preview server. Then go back to the project root with `cd ..`.

::: solution
Your `npm run build` output looks something like this (file names and sizes differ):

```text
vite v8.x building client environment for production...
✓ 138 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-XXXXXXXX.css   20.87 kB │ gzip:  4.71 kB
dist/assets/index-XXXXXXXX.js   314.74 kB │ gzip: 98.79 kB
✓ built in 212ms
```

And in the built `index.html`, the script and stylesheet paths start with `./assets/index-` followed by the fingerprint letters.
:::

### Step 4 — Link both versions from the landing page

Open `index.html` in the project root (not the one in `react-app`) and add a second link to the list.

::: solution
```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Chat App</title>
  </head>
  <body>
    <h1>My Chat App</h1>
    <p>A Discord-style chat app built while learning frontend development. All data is fake.</p>
    <ul>
      <li><a href="vanilla/">The plain HTML, CSS and JavaScript version</a></li>
      <li><a href="react-app/">The React version</a></li>
    </ul>
  </body>
</html>
```
:::

### Step 5 — Update the README

Replace the content of `README.md` in the project root. Keep your own GitHub user name instead of `YOUR-USERNAME` (use the same one you used in Lesson 31).

::: solution
```md [README.md]
# My Chat App

A Discord-style chat app I built twice to learn frontend development:
first with plain HTML, CSS and JavaScript, then with React.
All data is fake and everything runs in the browser: there is no server and no real accounts.

**Live demo:** https://YOUR-USERNAME.github.io/chat-clone/

## What's inside

- `vanilla/` — the plain HTML, CSS and JavaScript version
- `react-app/` — the same app built with React and Vite
- `index.html` — a small landing page that links to both
- `.github/workflows/deploy.yml` — builds the React app and publishes everything to GitHub Pages

## Run it locally

- Vanilla: open this folder in VS Code and use **Open with Live Server** on `vanilla/index.html`.
- React: `cd react-app`, then `npm install` (first time only) and `npm run dev`.
```
:::

### Step 6 — Add the workflow

Create the folders `.github/workflows` in the project root (the folder name starts with a dot) and a file `deploy.yml` in it. The file is explained step by step above, so paste it rather than typing it: YAML is picky about indentation.

First check that `react-app/package-lock.json` exists and is not ignored by Git:

```sh
git status
```

If you have run `npm install` in `react-app` (you did, in Lesson 32), the lock file exists, and `git status` will list it as a new file until you commit it. `git add .` in the last step includes it.

::: starter
<<< @/../solutions/lesson-41/.github/workflows/deploy.yml [.github/workflows/deploy.yml]
:::

<!-- no-solution: the workflow is pasted, nothing to type -->

### Step 7 — Switch Pages to GitHub Actions, push, and watch

1. Commit and push (see the **Commit** section below). The workflow will run but the deploy step can't publish until the next point is done.
2. On GitHub, open your `chat-clone` repository → **Settings** → **Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions** (it replaces "Deploy from a branch" from Lesson 31).
3. Open the **Actions** tab. You will see a run called **Deploy to GitHub Pages**. Click it, then the `deploy` job, to see each step turn green. If the run started before you changed the Pages setting, use **Run workflow** (the button exists because of `workflow_dispatch`) to start it again.
4. When the last step finishes, the run page shows the site's address (from the `url:` line). Open `https://YOUR-USERNAME.github.io/chat-clone/`: the landing page with two links. Click each.

If a step fails, click it: the log is the error message. The common causes are listed below.

<!-- no-solution: clicking through GitHub's website, nothing to type -->

::: warning GitHub's pages change
Menu names such as **Settings → Pages → Build and deployment → Source** were correct in GitHub's docs when I checked, but GitHub rearranges its interface from time to time. If you don't see them, search GitHub's docs for "Configuring a publishing source for your GitHub Pages site".
:::

## ✅ Checkpoint

- [ ] `npm run build` in `react-app/` finishes without errors and creates `react-app/dist/`.
- [ ] `npm run preview` shows the working React app at `http://localhost:4173/` (or the address it prints), including clicking channels and the `#/channels/...` address.
- [ ] In `react-app/dist/index.html`, the script and link paths start with `./assets/`.
- [ ] `git status` does not list `react-app/dist/` or `react-app/node_modules/` (they're ignored), but does list `.github/workflows/deploy.yml` and `react-app/package-lock.json` before you commit.
- [ ] In the repository's **Actions** tab, the latest **Deploy to GitHub Pages** run has a green check.
- [ ] `https://YOUR-USERNAME.github.io/chat-clone/` shows the landing page; both links work (`/vanilla/` and `/react-app/`).
- [ ] On the deployed React app, DevTools → **Network** shows every file (JS, CSS, `icons.svg`, logo) with status **200**, and DevTools → **Console** has no red errors.
- [ ] On the deployed React app, click through to another channel, then **reload**: you stay on that channel (the route is in the `#` part of the address).
- [ ] You wrote down your own line counts and compared them with the table in Part 1.

## 🐛 Common mistakes

**The deployed React app is a blank page and the Console shows 404 errors for `/assets/...`.** `base: './'` is missing from `vite.config.js`, or you forgot to push it. The built files then ask for `/assets/...` at the root of the site. Fix the config, push, and let the workflow run again.

**The workflow fails at `npm ci`, complaining about `package-lock.json`.** The lock file was never committed (or `package.json` and the lock file disagree). Run `npm install` in `react-app`, then `git add .`, commit and push. The exact wording of the error may differ.

**The deploy step fails and the message mentions Pages not being enabled or configured (the exact wording may differ).** The Pages **Source** is still on "Deploy from a branch". Change it to **GitHub Actions** and re-run the workflow.

**Nothing runs when you push.** The workflow only triggers for pushes to `main`. Check your branch name with `git branch`. If it isn't `main`, change `branches: [main]` or push to `main`. Also make sure the file is exactly at `.github/workflows/deploy.yml`, at the repository root, not inside `react-app/`.

**A step fails with a message that an action or version can't be found.** The version number after `@` doesn't exist (or no longer does). See the warning in Part 3: check the action's current version and edit it.

**The page works on your computer but the vanilla version is missing online.** The `cp -r vanilla _site/vanilla` step expects a `vanilla` folder at the project root; check the folder name and spelling.

**The site is out of date after a deploy.** The browser kept the old files. Do a hard reload with <Keys mac="Cmd+Shift+R" win="Ctrl+Shift+R" />, as in Lesson 31.

## 📝 Quiz

::: quiz
Why does `vite.config.js` set `base: './'` for this project?

- [ ] To make the app load faster
- [ ] Because React Router requires it
- [x] So the built files use relative paths and work from any folder, such as `/chat-clone/react-app/`
- [ ] To tell GitHub which branch to deploy

> By default the built `index.html` asks for `/assets/...` from the root of the website. On a project site at `/chat-clone/react-app/` that points at the wrong place. A relative base makes every URL relative to the file that contains it.
:::

::: quiz
In `deploy.yml`, the line `run: npm ci` comes right after the checkout and Node setup steps. What does it do?

- [ ] Starts the development server
- [x] Installs exactly the package versions recorded in `package-lock.json`, so the build uses the same packages you tested with
- [ ] Publishes the site to GitHub Pages
- [ ] Copies `dist/` into `_site`

> `npm ci` is a clean, repeatable install from the lock file. The build (`npm run build`) comes after it, and the publishing is done by the later `deploy-pages` step.
:::

::: quiz
Predict what happens: you push a commit that changes only the README, and the workflow has `on: push: branches: [main]`. What does GitHub do?

- [ ] Nothing, because the README isn't part of the website
- [x] It runs the whole workflow again, because the trigger is any push to `main`, and republishes the site
- [ ] It asks you to press **Run workflow**
- [ ] It deploys only the changed file

> The trigger only looks at the branch, not at which files changed. The workflow always rebuilds and publishes the whole site. (GitHub also supports path filters for `push` triggers if you ever want to skip such runs.)
:::

## 💾 Commit

```sh
git add .
git commit -m "Deploy both versions to GitHub Pages with a workflow"
git push
```
