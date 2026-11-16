---
lesson: 14
title: Rendering lists from data
---

# Lesson 14 — Rendering lists from data

In Lesson 03 you wrote the server list, channel list and member list *by hand* in HTML, repeating the same markup for every item. That doesn't scale: a real app gets its lists from data. In this lesson you delete that repeated HTML and let JavaScript build it from arrays of objects.

## 🎯 Goal

By the end of this lesson the server rail, the channel list and the member list are built by JavaScript from `data.js`, and their HTML is empty. The page looks almost the same as before. The differences you can see: the member list is now one list titled `Members — 13 (10 online)` with colorful avatars, and the unread dots and badges are gone for now (they come back in Lesson 19, derived from data).

![The chat app: five server icons on the left, the Frontend Friends channel list with Text, Info and Voice categories, the chat in the middle, and a single member list titled "Members — 13 (10 online)" with colored avatars](/screenshots/lesson-14.png){.screenshot}

You should be able to add a sixth server to the `servers` array, save, and watch it appear in the rail without touching the HTML.

## 🧠 New concepts

<ConceptList />

### Data in, page out

Here is the idea for the whole JavaScript part of this course:

```text
data (arrays of objects)  →  functions that build elements  →  elements on the page
```

Instead of writing `<li>` five times, you write a function that builds **one** `<li>` from **one** server object, and a loop that calls it for every server. Change the data and the page follows.

### The shape of the data

Open the new `data.js` (you'll paste it in a moment) and look at how the data is organised. This is the structure of real chat apps, simplified:

```text
users[]            { id, displayName, username, avatarColor, status, customStatus, bio }
servers[]          { id, name, icon, iconIsEmoji, roles[], members[], categories[] }
  members[]          { userId, roleId }        ← only an id: look the user up in users[]
  categories[]       { id, name, channels[] }
    channels[]         { id, name, type: 'text' | 'voice', topic, unread, mentions }
messages{}         { channelId: [ { id, authorId, content, timestamp, reactions } ] }
```

Notice that a server's `members` list holds only a `userId`, not the whole user. Each person exists **once**, in `users`, and everything else refers to them by id. That's how databases work too, and in Python you'd do the same with a dict lookup. (`messages` is there already, but we won't use it until Lesson 16.)

### Creating elements

So far the elements came from your HTML file. JavaScript can also make new ones:

```js
const list = document.querySelector('#server-list');   // a list that is already on the page
const item = document.createElement('li');   // a new, empty <li>, not on the page yet
item.className = 'channel-item';             // its class attribute
item.textContent = 'general';                // its text
list.append(item);                           // now it's on the page, as the last child of list
```

- **`document.createElement('li')`** makes an element that lives only in memory.
- **`className`** is the whole `class` attribute as one string. (The property isn't called `class` because that's a reserved word in JavaScript.) You already know `classList.add` for adding one class to an element.
- **`textContent`** you know from last lesson.
- **`list.append(a, b, c)`** adds any number of children at the end. You can pass elements and plain strings, and strings become text.

An element isn't visible until you `append` it to something that is on the page.

Other tools you'll use today:

| Code | Does |
| --- | --- |
| `list.replaceChildren()` | Removes **all** children of `list` (called with nothing inside the brackets). Use it to clear a list before redrawing it. |
| `oldElement.replaceWith(newElement)` | Swaps one element for another. |
| `element.setAttribute('aria-label', 'Pixel Art Club')` | Sets any HTML attribute by name. |
| `button.type = 'button'` | Many common attributes are also properties, like `type`, `id`, `className`. |
| `element.dataset.serverId = 's-pixel'` | Sets a `data-*` attribute (next section). |
| `wrapper.firstElementChild` | The first child *element* of `wrapper`. |

### `data-*` attributes and `dataset`

Sometimes an element must remember *which piece of data* it was made from. HTML lets you invent attributes that start with `data-` for exactly this:

```html
<li class="server-item" data-server-id="s-pixel">
```

In JavaScript they appear on the `dataset` property, with the dashes turned into camelCase:

```js
item.dataset.serverId = 's-pixel';   // writes data-server-id="s-pixel"
console.log(item.dataset.serverId);  // reads it
```

`data-server-id` ↔ `dataset.serverId`. In Lesson 15, when someone clicks an item, you'll read this id to know which server was clicked.

### Arrow functions

JavaScript has a short way to write small functions: the **arrow function**.

```js
const double = (n) => n * 2;     // takes n, returns n * 2

function double2(n) {            // the same, written long
  return n * 2;
}
```

```python
double = lambda n: n * 2   # Python's closest relative
```

With a single expression after the arrow, `return` is implied. Arrow functions are mostly used as **arguments** to other functions, which is what the next section is about. (`function name() {}` declarations from Lesson 12 are still the usual way to write a named function.)

### `map`, `filter` and `find`

Arrays have methods that take a function and call it for each item:

```js
const names = ['ava', 'leo', 'noah'];

names.map((name) => name + '!');                // ['ava!', 'leo!', 'noah!']: transform each item
names.filter((name) => name.length === 3);      // ['ava', 'leo']: keep items that pass the test
names.find((name) => name.length === 4);        // 'noah': first item that passes (or undefined)
```

| JavaScript | Python equivalent |
| --- | --- |
| `items.map((x) => f(x))` | `[f(x) for x in items]` |
| `items.filter((x) => test(x))` | `[x for x in items if test(x)]` |
| `items.find((x) => test(x))` | `next((x for x in items if test(x)), None)` |

All three **return a new result** and leave the original array alone. `find` returns `undefined` if nothing matches. Here is how the app uses `find` to look a user up by id:

```js
function getUser(userId) {
  return users.find((user) => user.id === userId);
}
```

And `filter(...).length` counts the items that pass a test:

```js
const onlineCount = memberUsers.filter((user) => user.status !== 'offline').length;
```

### The ternary operator

For a quick two-way choice inside an expression there's the **conditional operator**:

```js
const iconName = channel.type === 'voice' ? 'speaker' : 'hash';
```

Read it as: *condition* `?` *value if true* `:` *value if false*. Python's version is `'speaker' if channel.type == 'voice' else 'hash'`.

### Small building blocks

Writing `createElement`, `className` and `append` over and over is tedious, so the lesson builds three tiny helper functions in a new file `dom.js`, and the rest of the code uses them:

- `el(tag, className, text)`: make an element with an optional class and optional text.
- `icon(name)`: an SVG icon from the sprite (more below).
- `avatar(user, withStatus)`: the colored circle with the user's first letter, and optionally the status dot.

Then each part of the page gets a **`createXxx`** function that builds *one* item (`createServerItem`) and a **`renderXxx`** function that clears the container and loops over the data (`renderServers`). This pattern, "small function builds one thing, bigger function builds the list", will carry you through the rest of the course and, later, into React.

### `innerHTML`, and why we nearly never use it

There is another way to put content in an element: `element.innerHTML = '<b>hi</b>'` parses the string **as HTML**. The icon helper uses it, because an icon is a bit of SVG markup that we wrote ourselves:

```js
wrapper.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
```

`innerHTML` is dangerous with text that a *user* typed. If someone sends a message containing `<img src=x onerror=...>` and you put it into `innerHTML`, the browser would run their code on everyone's screen. This attack is called **XSS** (cross-site scripting). The rule:

> Use `textContent` for any text that didn't come from you. Use `innerHTML` only for markup that you wrote.

(Lesson 21 returns to this when messages learn Markdown.)

The attribute `aria-hidden="true"` on that icon tells screen readers to skip it. The icons here are decoration: the button's text or `aria-label` already says what it is.

## 🛠️ Build it

### Step 1 — Replace the data

The lists are now built from data, so the data needs to be bigger than last lesson's two variables: 13 users, five servers with channels and roles, and some messages. That's a lot of repetitive typing, so you paste this one. Read through it, though: it's the structure from the *New concepts* section.

Replace the **whole** content of `vanilla/js/data.js`:

::: starter
<<< @/../solutions/lesson-14/vanilla/js/data.js [vanilla/js/data.js]
:::

Reload the page. The Console will now show a red error such as `currentUser is not defined`: the old `app.js` expects a variable that no longer exists (it is now computed from `users`). That's expected and you'll fix it in Step 4.

<!-- no-solution: the starter box above is the whole step -->

### Step 2 — Write the helpers in `dom.js`

Create `vanilla/js/dom.js` and type the three helpers. Read the comments, which explain each one.

Notes:

- `el`'s last two parameters are optional. `if (className)` is false when the argument is missing (`undefined`), and `text !== undefined` lets you pass an empty string deliberately.
- `icon` creates a throw-away `<span>`, fills it with the SVG markup, then returns the SVG element that is inside it (`firstElementChild`).
- `user.displayName[0]` is the first character of the name, like `name[0]` in Python.

::: solution
```js [vanilla/js/dom.js]
// Small helpers for building elements, used by every render function.

// el('li', 'channel-item', 'general') → <li class="channel-item">general</li>
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// icon('hash') → <svg class="icon"><use href="assets/icons.svg#hash"></use></svg>
// innerHTML is safe here because the markup is ours, not something a user typed.
function icon(name) {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
  return wrapper.firstElementChild;
}

// A round avatar with the user's first letter on their color.
// withStatus = true adds the status dot.
function avatar(user, withStatus) {
  const element = el('span', 'avatar', user.displayName[0]);
  element.style.setProperty('--avatar-color', user.avatarColor);
  if (withStatus) {
    element.classList.add(`status-${user.status}`);
    element.append(el('span', 'status-dot'));
  }
  return element;
}
```
:::

### Step 3 — Load `dom.js` and empty the three lists

Open `vanilla/index.html`.

**(a)** In the `<head>`, add a script tag for `dom.js` **between** `data.js` and `app.js`. (`app.js` uses the helpers, so they must load first.)

::: solution
```html [vanilla/index.html]
    <!-- defer: run the scripts after the whole page has been read -->
    <script src="js/data.js" defer></script>
    <script src="js/dom.js" defer></script>
    <script src="js/app.js" defer></script>
```
:::

**(b)** Now delete the hand-written items. Keep the container elements and their `id`s, because JavaScript will find them by id. The server list `<ul id="server-list">` had five `<li>` items. Delete them, so it is one empty element:

::: solution
```html [vanilla/index.html]
          <ul class="server-list" id="server-list"></ul>
```
:::

**(c)** The channel list `<nav id="channel-list">` contained two `<section class="category">` blocks. Delete everything inside it:

::: solution
```html [vanilla/index.html]
          <nav class="channel-list scroller" id="channel-list" aria-label="Channel list"></nav>
```
:::

**(d)** The member list `<aside id="member-list">` contained the group titles and every `<button class="member">`. Delete everything inside it:

::: solution
```html [vanilla/index.html]
          <aside class="member-list scroller" id="member-list" aria-label="Members"></aside>
```
:::

Leave everything else alone, including the hard-coded messages in the middle (Lesson 16 replaces those) and the user panel's HTML (JavaScript will replace its avatar). After saving, the server rail, channels and members are empty. That's right, since the render code doesn't exist yet.

### Step 4 — Start `app.js`: the current user and the server rail

Delete the whole content of `vanilla/js/app.js` and start again.

First the data lookups: `currentUser` is now found by id in `users`, and `getUser` finds any user by id.

Then the server rail. `createServerItem` builds one `<li class="server-item">` containing one `<button class="server-button">`:

- the `<li>` remembers the server id in `data-server-id`, and gets `is-active` when it is the selected server;
- the button shows the server's `icon` text (letters or an emoji), has `type="button"`, and gets an `aria-label` with the server name, because an emoji alone isn't a useful name for screen readers;
- servers with an emoji icon also get the class `is-emoji` (your Lesson 05 CSS styles it).

`renderServers` empties the list and adds one item per server. `servers` comes from `data.js`, and `activeServer` is the one to mark as active.

::: solution
```js [vanilla/js/app.js]
// Lesson 14: building the server rail, channel list and member list from data.

const currentUser = users.find((user) => user.id === currentUserId);

function getUser(userId) {
  return users.find((user) => user.id === userId);
}

// ---------- Server rail ----------

const serverList = document.querySelector('#server-list');

function createServerItem(server, isActive) {
  const item = el('li', 'server-item');
  item.dataset.serverId = server.id;
  if (isActive) {
    item.classList.add('is-active');
  }

  const button = el('button', 'server-button', server.icon);
  button.type = 'button';
  button.setAttribute('aria-label', server.name);
  if (server.iconIsEmoji) {
    button.classList.add('is-emoji');
  }

  item.append(button);
  return item;
}

function renderServers(activeServer) {
  serverList.replaceChildren(); // remove the old items
  for (const server of servers) {
    serverList.append(createServerItem(server, server.id === activeServer.id));
  }
}
```
:::

### Step 5 — The channel list

Add the channel list code below the server rail code. It builds the structure you had in HTML, from the inside out:

1. `createChannelItem` makes `<li class="channel-item">` with a `<button class="channel-button">` holding an icon and a `<span class="channel-name">`. A ternary picks the `speaker` icon for voice channels and `hash` for text ones.
2. `createCategory` makes `<section class="category">` with an `<h3>` containing the toggle button (chevron icon plus the category name), and a `<ul>` of channel items.
3. `renderChannels` sets the sidebar title and fills `#channel-list` with one category per `server.categories`.

Compare this with your old HTML in Lesson 03: it is the same tree, just built by code.

::: solution
```js [vanilla/js/app.js]
// ---------- Channel list ----------

const serverName = document.querySelector('#server-name');
const channelList = document.querySelector('#channel-list');

function createChannelItem(channel, isSelected) {
  const item = el('li', 'channel-item');
  item.dataset.channelId = channel.id;
  if (isSelected) {
    item.classList.add('is-selected');
  }

  const button = el('button', 'channel-button');
  button.type = 'button';
  const iconName = channel.type === 'voice' ? 'speaker' : 'hash';
  button.append(icon(iconName), el('span', 'channel-name', channel.name));

  item.append(button);
  return item;
}

function createCategory(category, selectedChannelId) {
  const section = el('section', 'category');
  section.dataset.categoryId = category.id;

  const heading = el('h3');
  const toggle = el('button', 'category-toggle');
  toggle.type = 'button';
  toggle.append(icon('chevron-down'), category.name);
  heading.append(toggle);

  const list = el('ul');
  for (const channel of category.channels) {
    list.append(createChannelItem(channel, channel.id === selectedChannelId));
  }

  section.append(heading, list);
  return section;
}

function renderChannels(server, selectedChannelId) {
  serverName.textContent = server.name;
  channelList.replaceChildren();
  for (const category of server.categories) {
    channelList.append(createCategory(category, selectedChannelId));
  }
}
```
:::

### Step 6 — The member list

Add the member code. A server's `members` only contain user ids, so `renderMembers` first turns them into full user objects with `map` and `getUser`, then counts the online ones with `filter`.

`createMember` builds a `<button class="member">` with the avatar (using your `avatar` helper with a status dot) and the names. The status text is only added if the user has a `customStatus`: an empty string is "falsy", so `if (user.customStatus)` skips it. Offline users get the class `is-offline`.

The heading says `Members — 13 (10 online)`. The em dash `—` is a plain character; copy it from the code block rather than typing it (a normal hyphen `-` also works).

::: solution
```js [vanilla/js/app.js]
// ---------- Member list ----------

const memberList = document.querySelector('#member-list');

function createMember(user) {
  const button = el('button', 'member');
  button.type = 'button';
  button.dataset.userId = user.id;
  if (user.status === 'offline') {
    button.classList.add('is-offline');
  }

  const names = el('span', 'member-names');
  names.append(el('span', 'member-name', user.displayName));
  if (user.customStatus) {
    names.append(el('span', 'member-status-text', user.customStatus));
  }

  button.append(avatar(user, true), names);
  return button;
}

function renderMembers(server) {
  // server.members only has user ids: look up each user
  const memberUsers = server.members.map((member) => getUser(member.userId));
  const onlineCount = memberUsers.filter((user) => user.status !== 'offline').length;

  memberList.replaceChildren();
  memberList.append(el('h3', 'member-group-title', `Members — ${memberUsers.length} (${onlineCount} online)`));
  for (const user of memberUsers) {
    memberList.append(createMember(user));
  }
}
```
:::

### Step 7 — The user panel and drawing everything

The user panel's HTML still has the hand-written avatar. `renderUserPanel` builds a fresh one with the same helper, gives it back its `id` and swaps it in with `replaceWith`. It then fills in the name and tag like in Lesson 13.

Finally, choose what to show first (the first server and its first channel), and call all four render functions once.

::: solution
```js [vanilla/js/app.js]
// ---------- User panel ----------

function renderUserPanel() {
  const newAvatar = avatar(currentUser, true);
  newAvatar.id = 'user-panel-avatar';
  document.querySelector('#user-panel-avatar').replaceWith(newAvatar);
  document.querySelector('#user-panel-name').textContent = currentUser.displayName;
  document.querySelector('#user-panel-tag').textContent = currentUser.customStatus;
}

// ---------- Draw everything once ----------

const firstServer = servers[0];
const firstChannel = firstServer.categories[0].channels[0];

renderServers(firstServer);
renderChannels(firstServer, firstChannel.id);
renderMembers(firstServer);
renderUserPanel();
```
:::

### Step 8 — Check the result and play with the data

Save. The page should match the screenshot at the top. Then experiment:

1. In `data.js`, add a new object to the `servers` array (copy the *Game Night* entry, change `id`, `name` and `icon`). Save: a sixth server appears in the rail.
2. In the Console type `renderMembers(servers[1])`. The member list switches to the *Pixel Art Club* members. The functions are global, so you can call them by hand. Likewise try `renderChannels(servers[2], servers[2].categories[0].channels[0].id)`.
3. In DevTools → **Elements**, open the server rail and find the `data-server-id` attributes.

Remove your extra server again afterwards.

<!-- no-solution: experimenting, nothing new to type -->

## ✅ Checkpoint

- [ ] `index.html` has empty `#server-list`, `#channel-list` and `#member-list` elements, and loads `data.js`, `dom.js`, `app.js` in that order.
- [ ] The rail shows five server buttons, with the first one active (colored, with its pill).
- [ ] The channel list shows **Text Channels** (4), **Info** (2) and **Voice Channels** (2) with the right icons (`#` or speaker).
- [ ] The member list shows `Members — 13 (10 online)` and 13 members. Kenji, Nora and Mateo are dimmed (offline).
- [ ] The user panel avatar is blue with a green dot.
- [ ] The Console has no red errors.
- [ ] In DevTools → **Elements**, each `<li class="server-item">` has a `data-server-id`, and each channel item has a `data-channel-id`.
- [ ] `renderMembers(servers[1])` in the Console changes the member list to the five Pixel Art Club members.

## 🐛 Common mistakes

**`Uncaught ReferenceError: el is not defined` (or `icon`, `avatar`).** `dom.js` isn't loaded, or it is loaded *after* `app.js`. The order in `index.html` must be `data.js`, `dom.js`, `app.js`.

**The server rail (or another list) is empty and the Console shows `Cannot read properties of null`.** The `id` in the HTML doesn't match the selector. Check `id="server-list"`, `id="channel-list"` and `id="member-list"` are still there after you emptied them.

**Every list is drawn twice.** You left the old HTML items inside the containers (Step 3) or you call a render function twice. `replaceChildren()` clears what's in the container before each redraw, but only if you call it.

**Only the last item shows up.** You assigned instead of appending, or you created the element *outside* the loop. Each item needs its own `el(...)` call *inside* the loop (or inside the `createXxx` function that the loop calls).

**Text appears with the tag characters visible, like `<b>hi</b>`.** That's `textContent` doing its job: it shows text, never tags. For your own icon markup use `innerHTML` as `icon` does. Never use it for user text.

**Icons don't show.** The sprite is loaded over `http`. Use Live Server, not a double-clicked `file://` page (Lesson 06). Also check the name you pass to `icon(...)`: `speaker`, `hash`, `chevron-down` are the ones in `assets/icons.svg`.

## 📝 Quiz

::: quiz
What does this print?

```js
const nums = [1, 2, 3, 4];
const result = nums.filter((n) => n > 2).map((n) => n * 10);
console.log(result);
```

- [ ] `[3, 4]`
- [ ] `[10, 20, 30, 40]`
- [x] `[30, 40]`
- [ ] `[1, 2]`

> `filter` keeps the numbers greater than 2 (3 and 4), then `map` multiplies each by 10. In Python this is `[n * 10 for n in nums if n > 2]`.
:::

::: quiz
You run this code once. How many `<li>` elements are on the page afterwards?

```js
const list = document.querySelector('#server-list');
const item = el('li', 'server-item');
list.append(item);
list.append(item);
```

- [ ] Two
- [x] One
- [ ] Zero, because `el` doesn't add anything to the page
- [ ] It depends on the number of servers

> An element can only be in one place in the DOM. Appending `item` a second time *moves* it, so there's still just one. To get two list items you must create two elements, which is why the loop calls `createServerItem` for each server.
:::

::: quiz
Which is the safest way to show a message that a user typed, `message.content`, inside `box`?

- [ ] `box.innerHTML = message.content;`
- [x] `box.textContent = message.content;`
- [ ] `box.outerHTML = message.content;`
- [ ] `box.setAttribute('html', message.content);`

> `textContent` shows the text exactly as typed, even if it contains tags, so injected `<img onerror=...>` can't run. `innerHTML` would parse and run it. `outerHTML` also parses its string as HTML, and `setAttribute('html', ...)` just makes a meaningless attribute.
:::

## 💾 Commit

```sh
git add .
git commit -m "Render server rail, channels and members from data"
git push
```
