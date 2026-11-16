---
lesson: 18
title: JSON files, fetch & async/await
---

# Lesson 18 — JSON files, fetch & async/await

So far the app's fake data lives inside a JavaScript file. Real apps get their data from files or servers, and that takes time, so JavaScript has a way of waiting without freezing the page. In this lesson you move the data into JSON files and load them with `fetch`, `async` and `await`.

## 🎯 Goal

The app looks the same as in Lesson 17, but now it starts by downloading three files, `data/users.json`, `data/servers.json` and `data/messages.json`. If a file is missing, the page shows a readable error message instead of staying empty. In DevTools → Network you can watch the three requests.

![The Hubbub chat app showing the Frontend Friends server, the general channel with its messages, and the member list](/screenshots/lesson-18.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### JSON: data as text

**JSON** (JavaScript Object Notation) is a text format for data. It looks almost like a JavaScript object or a Python dict, which is why it won. A `.json` file might contain:

```json
{
  "id": "u-ava",
  "displayName": "Ava",
  "online": true,
  "roles": ["admin", "mentor"],
  "nickname": null
}
```

The rules are stricter than JavaScript:

| JSON | JavaScript object |
| --- | --- |
| Keys **must** have double quotes: `"id"` | Quotes optional: `id` |
| Strings use **double** quotes only | Single or double |
| No trailing comma after the last item | Allowed |
| No comments | Allowed |
| Only strings, numbers, `true`, `false`, `null`, arrays and objects | Also functions, `undefined`, dates... |

A single mistake, such as a trailing comma, makes the whole file unreadable. You already know the two functions that convert between text and values: `JSON.stringify` and `JSON.parse` (Lesson 16, for `localStorage`). Python has the same pair in its `json` module (`json.dumps`, `json.loads`).

### Requests and responses, again

In Lesson 00 you saw the browser ask a server for a file. JavaScript can do that too, on demand, using the function `fetch`:

```js
const response = await fetch('data/users.json');
```

`fetch` sends a **request** and gives you back a **response** object. The path is relative to the HTML page (`index.html`), not to the JavaScript file: this is the one place where a path doesn't work like an `import`.

The response has useful parts:

- `response.ok` is `true` when the status code is 200-299 (success) and `false` for errors such as 404 ("not found").
- `response.status` is the number itself.
- `response.json()` reads the body and parses it as JSON, giving you real JavaScript values.

::: warning fetch does not fail on 404
If the server answers "404 not found", that is still a successful *conversation*, so `fetch` does **not** treat it as an error. It only fails when the request could not be made at all (for example you're offline). That is why you must check `response.ok` yourself.
:::

::: tip Python comparison
`await fetch(path)` plays the role of `requests.get(path)`, and `response.ok` is like checking `response.status_code`. The `requests` library waits for the answer and blocks; JavaScript can't block the page like that, which leads to the next idea.
:::

### Promises: a value that arrives later

Downloading takes time. If JavaScript sat and waited, the whole page (every click, every animation) would freeze. So `fetch` returns immediately with a **Promise**: an object that stands for "a value that will exist later". A promise is in one of three states: **pending** (still waiting), **fulfilled** (it got its value) or **rejected** (it failed).

```text
fetch('data/users.json')
        │
        ▼
   Promise (pending) ─── time passes ───▶ fulfilled: a Response
                                     └──▶ rejected: an error
```

### `async` and `await`

`await` waits for a promise and gives you its value. While it waits, the browser keeps running everything else, so the page doesn't freeze. You can only use `await` inside a function marked `async`:

```js
async function loadJson(path) {
  const response = await fetch(path);
  return response.json();
}
```

Read it top to bottom like normal code: "fetch the file, wait for the response, return its parsed body". Two facts to remember:

- An `async` function always returns a Promise, even if you write a plain `return`. To get the value out, the caller uses `await` too (or `.then`, which this course doesn't need).
- If you forget `await`, you don't get the value: you get the promise object. It prints as `Promise { <pending> }`, and `.map` or property lookups on it fail in confusing ways.

Your `main.js` will have an `async function start()` so it can use `await`.

### Throwing errors

When something is wrong, a function can stop and report it with `throw`:

```js
if (!response.ok) {
  throw new Error(`Could not load ${path} (HTTP ${response.status})`);
}
```

`new Error('message')` creates an error object with a message; `throw` stops the function and jumps to whoever can handle it. It is JavaScript's `raise ValueError('...')`. Inside an `async` function, a `throw` makes the promise **reject**. The caller handles that with `.catch(...)`, which runs a function when a promise has been rejected:

```js
start().catch((error) => {
  console.error(error);
});
```

It's the equivalent of Python's `try` / `except`. Without it, an error would only appear in the Console and the page would look empty, with no explanation.

### `Promise.all`: several downloads at once

You need three files. You could `await` them one after another, but each one would wait for the previous to finish. `Promise.all` takes an array of promises, starts them all together, and waits until **all** have finished. It gives you an array of the results in the same order:

```js
const [users, servers, messages] = await Promise.all([
  loadJson('data/users.json'),
  loadJson('data/servers.json'),
  loadJson('data/messages.json'),
]);
```

If any one of them is rejected, `Promise.all` is rejected too.

### Array destructuring and shorthand properties

Two small syntax tricks appear in that code.

**Array destructuring** unpacks an array into variables in one line, by position. You may know it as tuple unpacking from Python:

```js
const [first, second] = ['a', 'b'];   // first is 'a', second is 'b'
```

The names go in square brackets, and each one takes the value at the same position in the array.

**Shorthand properties** let you skip repeating a name. When a property has the same name as the variable holding its value, write it once:

```js
const users = [];
const servers = [];

const data1 = { users: users, servers: servers };
const data2 = { users, servers };   // exactly the same object
```

## 🛠️ Build it

### Step 1 — Add the three JSON files

Create a new folder `vanilla/data/`. Inside it, you need three files: `users.json`, `servers.json` and `messages.json`. They contain exactly the same data as the big arrays in `data.js`, written as JSON. Typing about 700 lines of data teaches you nothing new, so **paste** these files (copy each box with its button).

::: starter
<<< @/../solutions/lesson-18/vanilla/data/users.json [vanilla/data/users.json]

<<< @/../solutions/lesson-18/vanilla/data/servers.json [vanilla/data/servers.json]

<<< @/../solutions/lesson-18/vanilla/data/messages.json [vanilla/data/messages.json]
:::

Read through each file for a minute. Compare the first user with the first object in `data.js`: same keys and values, but every key now has double quotes, and the `export const users =` wrapper is gone, because a JSON file contains only the value.

Check that Live Server can serve them: in the browser, visit `http://127.0.0.1:5500/vanilla/data/users.json` (use your own address from Lesson 00). Chrome shows the raw text of the file. If you see a 404, the folder is in the wrong place: it must be `vanilla/data/`, next to `index.html`.

<!-- no-solution: starter files are pasted, nothing to type -->

### Step 2 — Rewrite `data.js` as a loader

Open `vanilla/js/data.js` and **replace the whole file**: the 750 lines of arrays are replaced by a small loader. It has two functions.

`loadJson(path)` downloads one file, checks `response.ok` and throws an `Error` if it isn't, then returns the parsed JSON. It's not exported, because only this file needs it.

`loadData()` loads all three files at once with `Promise.all`, unpacks the results with array destructuring, and returns them in one object with shorthand properties. This one is exported so `main.js` can import it.

Note the paths, like `'data/users.json'`: `fetch` resolves them relative to the **page** (`vanilla/index.html`), so they don't start with `../` or `./js`.

::: solution
```js [vanilla/js/data.js]
// Loads the app's fake data from the JSON files in data/.

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (HTTP ${response.status})`);
  }
  return response.json();
}

export async function loadData() {
  // Start all three downloads at once and wait until every one has finished.
  const [users, servers, messages] = await Promise.all([
    loadJson('data/users.json'),
    loadJson('data/servers.json'),
    loadJson('data/messages.json'),
  ]);
  return { users, servers, messages };
}
```
:::

### Step 3 — Start the app after the data arrives

In `vanilla/js/main.js` there are three changes.

1. At the top, import `loadData` instead of the three constants:
   `import { loadData } from './data.js';`
2. Wrap all of the start-up code (everything below the `render` function) in `async function start() { ... }`. Inside it, after `applyBrand();`, add `const data = await loadData();`: the app can't begin until the data is here. Replace the uses of `users`, `servers` and `messages` in the `else` branch with `data.users`, `data.servers` and `data.messages`.
3. At the very bottom, call it: `start().catch(...)`. If anything inside `start` throws (a missing file, bad JSON), the `catch` function logs the error and writes a readable message into the message area.

The code that fills `state`, the three `setup...()` calls, `onChange(render)` and `render()` are the same as before, just indented inside `start`.

::: solution
```js [vanilla/js/main.js]
// The starting point of the app: load the data, set everything up, draw the screen.

import { applyBrand } from './brand.js';
import { loadData } from './data.js';
import { state, onChange, loadSaved } from './state.js';
import { renderServers, setupServers } from './servers.js';
import { renderChannels, setupChannels } from './channels.js';
import { renderChat } from './chat.js';
import { renderMembers } from './members.js';
import { renderUserPanel } from './user-panel.js';
import { setupLayout } from './layout.js';

// Draws the whole screen from the current state.
function render() {
  renderServers();
  renderChannels();
  renderChat();
  renderMembers();
  renderUserPanel();
}

async function start() {
  applyBrand();
  const data = await loadData();

  // Use the saved state from last time if there is one, otherwise the JSON data.
  const saved = loadSaved();
  if (saved !== null) {
    state.users = saved.users;
    state.servers = saved.servers;
    state.messages = saved.messages;
    state.activeServerId = saved.activeServerId;
    state.activeChannelByServer = saved.activeChannelByServer;
    state.collapsedCategoryIds = saved.collapsedCategoryIds;
  } else {
    state.users = data.users;
    state.servers = data.servers;
    state.messages = data.messages;
    state.activeServerId = data.servers[0].id;
  }

  setupLayout();
  setupServers();
  setupChannels();

  onChange(render);
  render();
}

start().catch((error) => {
  console.error(error);
  document.querySelector('#message-list').textContent = `Something went wrong while starting the app: ${error.message}`;
});
```
:::

### Step 4 — Try it

Reload the page. It should look the same as before.

Two things might surprise you:

- If you used the app in Lesson 17, your browser has a **saved** copy of the state in `localStorage`, so the app loads that and ignores the JSON data (it only uses the files when nothing is saved). That's right, and it's why the screen looks unchanged. To see the JSON data actually being used, open DevTools → **Application** → **Local Storage**, select your site, delete the key `chat-clone-state-v1`, and reload.
- Even when the app uses the saved copy, `loadData()` still downloads the files on every start. That's a little wasteful, but it keeps the code simple.

Now open DevTools → **Network** and reload. You should see `users.json`, `servers.json` and `messages.json`, each with status **200** and type **fetch**. Click one and open its **Response** (or **Preview**) tab to see the data.

<!-- no-solution: testing, nothing to type -->

### Step 5 — Break it on purpose

Learning to read errors is half of programming. Try each of these, look at what happens, then undo it.

1. **Wrong path.** In `data.js` change `'data/users.json'` to `'data/user.json'`. Reload. The message area shows `Something went wrong while starting the app: Could not load data/user.json (HTTP 404)`, the Network panel shows a red 404, and the Console shows the error. That's your `throw` and your `catch` working together.
2. **Bad JSON.** In `users.json` add a comma after the last object in the array (just before the closing `]`). Reload. The error comes from `response.json()` and its text mentions unexpected JSON. Remove the comma again.
3. **Missing `await`.** In `loadData`, delete the word `await` in front of `Promise.all`. Reload. The destructuring fails with an error, because you're trying to unpack a promise, not an array. Put it back.

<!-- no-solution: experiments, nothing to type -->

## ✅ Checkpoint

- [ ] `vanilla/data/` holds `users.json`, `servers.json` and `messages.json`.
- [ ] `data.js` has no data arrays anymore, only `loadJson` and `loadData`.
- [ ] The app looks and works as in Lesson 17, with no errors in the Console.
- [ ] DevTools → **Network** shows the three JSON requests with status **200**.
- [ ] After clearing `chat-clone-state-v1` in Local Storage and reloading, the app still shows all servers and messages (it is using the JSON files).
- [ ] With a deliberately wrong path, the page shows the "Something went wrong" message and the Network panel shows a **404**.

## 🐛 Common mistakes

**The data never shows up and the Console says something about `undefined`, or you see `Promise { <pending> }`.** You forgot `await`. Without it, you get the promise instead of its value. Add `await` in front of the call, inside an `async` function.

**The Console says `await is only valid in async functions` (or similar).** `await` can only be used inside a function marked `async`. Add `async` before `function`.

**An error about an unexpected token in JSON, often mentioning a position.** The JSON file has a syntax error. The usual suspects: a trailing comma, single quotes, or a missing quote around a key. Look near the position the message mentions.

**Network shows 404 for a data file.** The path is wrong, or the `data` folder is in the wrong place. `fetch('data/users.json')` is relative to `index.html`, so the folder must sit next to it.

**The page is empty and nothing seems to happen.** The error probably got swallowed. Make sure the `start().catch(...)` at the bottom of `main.js` exists, and check the Console.

**You changed the JSON but the app shows the old data.** The app prefers the state saved in `localStorage`. Delete the `chat-clone-state-v1` key (Step 4) and reload.

## 📝 Quiz

::: quiz
Which of these is **valid JSON**?

- [ ] `{ id: "u-ava" }`
- [ ] `{ 'id': 'u-ava' }`
- [x] `{ "id": "u-ava" }`
- [ ] `{ "id": "u-ava", }`

> JSON keys and strings need double quotes, and a trailing comma isn't allowed. The first fails on the key quotes, the second on single quotes, the last on the trailing comma.
:::

::: quiz
What is printed?

```js
async function getNumber() {
  return 42;
}

const result = getNumber();
console.log(result);
```

- [ ] `42`
- [x] A Promise (shown as `Promise { 42 }` or similar), not the number
- [ ] `undefined`
- [ ] An error, because `getNumber` is not awaited

> An `async` function always returns a promise. To get the `42`, write `const result = await getNumber();` inside another async function.
:::

::: quiz
The server answers your `fetch('data/missing.json')` with status 404. What does `await fetch(...)` do?

- [ ] It throws an error automatically
- [x] It gives you a response whose `ok` is `false`; you have to check it and throw yourself
- [ ] It returns `null`
- [ ] It retries until the file exists

> `fetch` only rejects when the request can't be made at all. A 404 is still a response, so check `response.ok`.
:::

## 💾 Commit

```sh
git add .
git commit -m "Load data from JSON files with fetch"
git push
```
