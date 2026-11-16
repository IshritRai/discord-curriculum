---
lesson: 24
title: Emoji picker & reactions
---

# Lesson 24 — Emoji picker & reactions

Messages get a "react" button, little emoji pills appear under messages, and the smiley button in the composer inserts emoji into your text. Both open the same **emoji picker**, a floating panel built with the browser's new Popover API.

## 🎯 Goal

Hovering a message shows a smiley-with-plus button in its toolbar. Clicking it (or the smiley in the composer) opens a 340 px wide emoji picker with a search box and emoji grouped by category. Picking an emoji under a message adds a reaction pill such as `💯 4`; clicking a pill toggles your own reaction on and off. Picking an emoji from the composer's button inserts it at the cursor.

![The chat with an emoji picker open above the composer: a search box reading "Find the perfect emoji", then People, Gestures and Hearts categories as grids of emoji. Under Priya's message is a reaction pill showing 100 and 4](/screenshots/lesson-24.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### The Popover API

Some UI has to float on top of everything else: pickers, menus, tooltips. Historically that meant `position: absolute`, a huge `z-index`, and JavaScript to close it when you click elsewhere. The browser now does this for you with the **Popover API**.

You mark an element with the `popover` attribute:

```html
<div id="emoji-picker" popover>...</div>
```

and the browser gives you:

- **Hidden until opened.** A `popover` element is not displayed by default.
- `element.showPopover()` and `element.hidePopover()` to open and close it from JavaScript.
- **The top layer.** An open popover is drawn above all other content on the page, no matter what `z-index` values or `overflow` settings its ancestors have. (MDN describes this as the "top layer".)
- **Light dismiss.** With a plain `popover` attribute, clicking outside the popover, or pressing <kbd>Esc</kbd>, closes it. You write no code for that.
- The CSS pseudo-class **`:popover-open`**, which matches the element while it is showing.

::: info Browser support
MDN's Popover API page lists it as "Baseline Newly available", working in the latest versions of Chrome, Edge, Firefox and Safari since January 2025. Very old browsers won't open the picker. See [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) and [the `popover` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) for the current table.
:::

By default the browser **centers** a popover in the window. Our picker should sit next to the button that opened it, so we override that in CSS (`inset: auto; margin: 0`) and set `left` and `top` ourselves.

One more rule: the browser hides closed popovers with its own `display: none`. If you write `.emoji-picker { display: flex; }` your rule wins and the picker would always be visible. So we write `display: none` in our rule and only set `display: flex` inside `.emoji-picker:popover-open`.

### Placing an element next to another

To put the picker beside a button we need numbers. `button.getBoundingClientRect()` returns a rectangle describing where the button is **in the browser window** (the viewport) right now, with the properties `top`, `bottom`, `left`, `right`, `width` and `height` in pixels:

```text
  window (viewport)
  ┌──────────────────────────────────────────┐ ← y = 0
  │                                          │
  │              rect.top ─►┌────────┐       │
  │                         │ button │       │
  │           rect.bottom ─►└────────┘       │
  │                         ▲        ▲       │
  │                  rect.left   rect.right  │
  └──────────────────────────────────────────┘ ← y = window.innerHeight
```

Other measurements we need:

- `window.innerWidth` and `window.innerHeight` are the size of the viewport in pixels.
- `picker.offsetWidth` and `picker.offsetHeight` are an element's rendered width and height. They are `0` while the element is `display: none`, so we must open the popover **before** measuring it.

To keep the picker inside the window we clamp a number with `Math.min` and `Math.max`, which return the smaller or larger of their arguments (like Python's `min()` and `max()`, but called as `Math.min(a, b)`):

```js
Math.max(8, Math.min(left, window.innerWidth - width - 8));
// "left, but at least 8, and at most (window width - picker width - 8)"
```

### The data model for reactions

Each message gets a `reactions` array. Each reaction is an emoji plus the ids of the users who used it:

```js
message.reactions = [
  { emoji: '💯', userIds: ['u-ava', 'u-leo', 'u-noah', 'u-me'] },
  { emoji: '😅', userIds: ['u-priya'] },
];
```

The count shown on the pill is simply `userIds.length`, and "is this reaction mine?" is `userIds.includes(CURRENT_USER_ID)`. We store *who* reacted, not just a number, so the same person can't add the same reaction twice. Toggling then has three cases:

| Situation | What `toggleReaction` does |
| --- | --- |
| Nobody used this emoji yet | add a new reaction with just you |
| It exists and you're in `userIds` | remove you; if nobody is left, remove the whole reaction |
| It exists and you're not in `userIds` | add you |

### Inserting text at the cursor

A `<textarea>` knows where the cursor is: `selectionStart` and `selectionEnd` are character positions (equal when nothing is selected). `textarea.setRangeText(text, start, end, 'end')` replaces the characters from `start` to `end` with `text`, and the last argument `'end'` puts the cursor after the inserted text. Using it, rather than `value = value + emoji`, means the emoji lands where the cursor is, not at the end.

String search is also needed: `'Grinning'.toLowerCase()` returns `'grinning'`, so the picker's search can ignore capital letters (like Python's `.lower()`).

### `flex-wrap`, `repeat()` and `border-color`

- `flex-wrap: wrap` lets flex items move to a new line when they don't fit, instead of squashing. Reaction pills use it.
- `repeat(8, 1fr)` is shorthand for `1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr`: eight equal columns in `grid-template-columns` (Lesson 7). See [`repeat()` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat).
- `border-color` sets only the colour of a border (so a transparent border can change colour on hover without changing the box size).

## 🛠️ Build it

Files you'll touch: `data/emoji.json` (new), `index.html`, `js/data.js`, `js/state.js`, `js/main.js`, `js/actions.js`, `js/reactions.js` (new), `js/chat.js`, `js/composer.js`, `css/chat.css`, `css/overlays.css` (new).

### Step 1 — Add the emoji data

Create `vanilla/data/emoji.json`. It's a list of categories, each with a list of `{ "char": ..., "name": ... }` objects (the names are what the search box looks at). It's long and repetitive, so paste it.

::: starter
<<< @/../solutions/lesson-24/vanilla/data/emoji.json [vanilla/data/emoji.json]
:::

<!-- no-solution: pasting data, nothing to type -->

### Step 2 — Load it and keep it in state

Lesson 18's `loadData()` downloads all JSON files at once. In `vanilla/js/data.js`, add the fourth file to the list, and to the destructuring on the left and the returned object. (The comment changes from "three" to "four".)

Then in `vanilla/js/state.js`, add `emojiCategories: []` to the `// Temporary — not saved` section. It isn't saved because it comes from the JSON file every time.

In `vanilla/js/main.js`, inside `start()`, right after `const data = await loadData();`, copy it into state: `state.emojiCategories = data.emojiCategories;`.

::: solution
```js [vanilla/js/data.js]
export async function loadData() {
  // Start all four downloads at once and wait until every one has finished.
  const [users, servers, messages, emojiCategories] = await Promise.all([
    loadJson('data/users.json'),
    loadJson('data/servers.json'),
    loadJson('data/messages.json'),
    loadJson('data/emoji.json'),
  ]);
  return { users, servers, messages, emojiCategories };
}
```

```js [vanilla/js/state.js]
  // Temporary — not saved
  emojiCategories: [],
  showMembers: true,
  editingMessageId: null, // the message you're editing, if any
  editDraft: '', // what's in the edit box right now
```

```js [vanilla/js/main.js]
async function start() {
  applyBrand();
  const data = await loadData();
  state.emojiCategories = data.emojiCategories;

  // ...rest of start() unchanged...
}
```
:::

### Step 3 — Add the popover markup to `index.html`

Open `vanilla/index.html`:

1. In `<head>`, add `<link rel="stylesheet" href="css/overlays.css">` after the `voice.css` link and before `responsive.css` (responsive rules must stay last, Lesson 11).
2. On the composer's emoji button (the one with `aria-label="Choose an emoji"`), add `id="composer-emoji-button"`.
3. At the bottom of `<body>`, after the drawer backdrop and before `</body>`, add the picker. It's an empty shell: JavaScript fills `#emoji-grid` each time it opens.

::: solution
```html [vanilla/index.html]
    <link rel="stylesheet" href="css/voice.css">
    <link rel="stylesheet" href="css/overlays.css">
    <link rel="stylesheet" href="css/responsive.css">
```

```html [vanilla/index.html]
              <button class="icon-button composer-button" type="button" id="composer-emoji-button" aria-label="Choose an emoji">
                <svg class="icon"><use href="assets/icons.svg#emoji"></use></svg>
              </button>
```

```html [vanilla/index.html]
    <!-- The dark overlay behind the drawer on small screens -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>

    <!-- The emoji picker. "popover" puts it on top of everything and closes it when you click outside. -->
    <div class="emoji-picker" id="emoji-picker" popover>
      <input class="emoji-search" id="emoji-search" type="search" placeholder="Find the perfect emoji" aria-label="Search emoji">
      <div class="emoji-grid scroller" id="emoji-grid"></div>
    </div>
  </body>
```
:::

### Step 4 — Style the picker (`css/overlays.css`)

Create `vanilla/css/overlays.css`. It starts with the popover reset and the picker box; you type these because they are the new ideas. Then you paste the ordinary styling, then type the `repeat()` grid, then paste the rest.

**Part 1: type this.**

::: solution
```css [vanilla/css/overlays.css]
/* Things that float above the app (for now: the emoji picker). */

/* ---------- Popovers ----------
   Elements with the popover attribute are placed in the browser's "top layer".
   By default the browser centers them; we position them ourselves instead. */

[popover] {
  inset: auto;
  margin: 0;
  border: none;
  padding: 0;
  color: inherit;
}

/* ---------- Emoji picker ---------- */

.emoji-picker {
  display: none;
  flex-direction: column;
  width: 340px;
  height: 360px;
  border-radius: var(--radius);
  background-color: var(--bg-secondary);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
}

/* The browser adds :popover-open while the popover is showing */
.emoji-picker:popover-open {
  display: flex;
}
```
:::

**Part 2: paste this** directly below Part 1 (plain styling you already know from Lessons 4-10):

::: starter
```css [vanilla/css/overlays.css]
.emoji-search {
  margin: 12px;
  height: 30px;
  padding: 0 8px;
  border-radius: var(--radius-small);
  background-color: var(--bg-tertiary);
}

.emoji-search:focus {
  outline: none;
}

.emoji-grid {
  flex: 1;
  min-height: 0;
  padding: 0 8px 8px 12px;
  overflow-y: auto;
}

.emoji-category {
  margin: 8px 0 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
```
:::

**Part 3: type this** below it. Each category's emoji sit in an `.emoji-options` container with eight equal columns:

```css [vanilla/css/overlays.css]
/* 8 equal columns */
.emoji-options {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
}
```

**Part 4: paste this** at the end of the file:

::: starter
```css [vanilla/css/overlays.css]
.emoji-option {
  height: 36px;
  border-radius: var(--radius-small);
  font-size: 22px;
}

.emoji-option:hover {
  background-color: var(--bg-hover);
}

.emoji-empty {
  padding: 24px;
  color: var(--text-muted);
  text-align: center;
}
```
:::

<!-- no-solution: the solution for this step is shown inline above -->

### Step 5 — Style reactions (`css/chat.css`)

Open `vanilla/css/chat.css`. Find the comment `/* ---------- Hover actions (edit, delete) ---------- */`. Insert the reactions section **above** it, and change that comment to `(react, edit, delete)`.

Then, a little lower, the toolbar CSS changes. Since the react button now appears on *every* message, the toolbar is never empty, so the `:empty` rule from Lesson 23 is removed. Only the "hide while editing" selector remains, and it no longer needs `!important`.

::: solution
```css [vanilla/css/chat.css]
/* ---------- Reactions ---------- */

.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.reaction {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background-color: var(--bg-secondary);
  font-size: 14px;
}

.reaction:hover {
  border-color: var(--text-faint);
}

/* Reactions you added get the accent color */
.reaction.is-mine {
  border-color: var(--brand-accent);
  background-color: color-mix(in srgb, var(--brand-accent), transparent 85%);
}

.reaction-count {
  color: var(--text-normal);
  font-weight: 600;
}

/* ---------- Hover actions (react, edit, delete) ---------- */
```

```css [vanilla/css/chat.css]
/* replaces the old ".message-actions:empty, .message.is-editing ..." rule */
.message.is-editing .message-actions {
  display: none;
}
```
:::

### Step 6 — Add `toggleReaction` to `actions.js`

In `vanilla/js/actions.js`, add `CURRENT_USER_ID` to the import from `./state.js`, and append this function at the end of the file. It handles the three cases from the table above. Both `.find()` (first match, or `undefined`) and `.filter()` come from Lesson 14.

::: solution
```js [vanilla/js/actions.js]
import { state, update, getActiveChannel, findChannel, findMessage, CURRENT_USER_ID } from './state.js';

// ...at the end of the file:

// Adds your reaction, or removes it if you already reacted with that emoji.
export function toggleReaction(messageId, emoji) {
  const message = findMessage(messageId);
  const reaction = message.reactions.find((r) => r.emoji === emoji);
  if (!reaction) {
    message.reactions.push({ emoji: emoji, userIds: [CURRENT_USER_ID] });
  } else if (reaction.userIds.includes(CURRENT_USER_ID)) {
    reaction.userIds = reaction.userIds.filter((id) => id !== CURRENT_USER_ID);
    if (reaction.userIds.length === 0) {
      message.reactions = message.reactions.filter((r) => r !== reaction);
    }
  } else {
    reaction.userIds.push(CURRENT_USER_ID);
  }
  update();
}
```
:::

### Step 7 — Write the picker, `js/reactions.js`

Create `vanilla/js/reactions.js`. It exports two functions: `openEmojiPicker(anchor, newTarget)`, which other files call, and `setupEmojiPicker()`, which `main.js` calls once.

The module remembers **what the picker is open for** in `target`: either `{ type: 'reaction', messageId }` or `{ type: 'composer' }`. One picker serves both uses; only the final click differs.

Read the code in this order:

1. `renderEmojiGrid(filter)` clears the grid, lowercases the search text, and for each category keeps only the emoji whose `name` includes the query. Empty categories are skipped (`continue`). If nothing matched at all it shows a message.
2. `positionPicker(anchor)` aims for "above the button, right edges aligned" (`rect.right - width`, `rect.top - height - 8`). If there's no room above (`top < 8`), it opens below. Then `Math.max/Math.min` clamp it to the window.
3. `openEmojiPicker` resets the search, fills the grid, **then** shows the popover, **then** measures and positions (an element that isn't displayed has no size), then focuses the search box.
4. `setupEmojiPicker` handles typing in the search box and clicks on the grid (delegation again). After a pick it closes the popover with `hidePopover()` and either toggles a reaction or inserts text at the cursor.

::: solution
```js [vanilla/js/reactions.js]
// The emoji picker. It's used for two things:
//  - adding a reaction to a message ({ type: 'reaction', messageId })
//  - inserting an emoji into the composer ({ type: 'composer' })

import { state } from './state.js';
import { toggleReaction } from './actions.js';
import { el } from './dom.js';

const picker = document.querySelector('#emoji-picker');
const search = document.querySelector('#emoji-search');
const grid = document.querySelector('#emoji-grid');
const composerInput = document.querySelector('#composer-input');

// What the picker is open for (see the comment at the top)
let target = null;

function renderEmojiGrid(filter) {
  grid.replaceChildren();
  const query = filter.trim().toLowerCase();
  let found = 0;
  for (const category of state.emojiCategories) {
    const matches = category.emoji.filter((e) => e.name.includes(query));
    if (matches.length === 0) {
      continue;
    }
    found += matches.length;
    grid.append(el('h3', 'emoji-category', category.category));
    const options = el('div', 'emoji-options');
    for (const emoji of matches) {
      const button = el('button', 'emoji-option', emoji.char);
      button.type = 'button';
      button.dataset.emoji = emoji.char;
      button.title = `:${emoji.name.split(' ')[0]}:`;
      options.append(button);
    }
    grid.append(options);
  }
  if (found === 0) {
    grid.append(el('p', 'emoji-empty', 'No emoji match that search.'));
  }
}

// Places the picker next to the button that opened it, inside the window.
function positionPicker(anchor) {
  const rect = anchor.getBoundingClientRect();
  const width = picker.offsetWidth;
  const height = picker.offsetHeight;
  let left = rect.right - width;
  let top = rect.top - height - 8;
  if (top < 8) {
    top = rect.bottom + 8; // not enough room above: open below
  }
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  top = Math.min(top, window.innerHeight - height - 8);
  picker.style.left = `${left}px`;
  picker.style.top = `${top}px`;
}

export function openEmojiPicker(anchor, newTarget) {
  target = newTarget;
  search.value = '';
  renderEmojiGrid('');
  picker.showPopover();
  positionPicker(anchor);
  search.focus();
}

export function setupEmojiPicker() {
  search.addEventListener('input', () => renderEmojiGrid(search.value));

  grid.addEventListener('click', (event) => {
    const option = event.target.closest('.emoji-option');
    if (!option) {
      return;
    }
    const emoji = option.dataset.emoji;
    picker.hidePopover();
    if (target.type === 'reaction') {
      toggleReaction(target.messageId, emoji);
    } else {
      composerInput.setRangeText(emoji, composerInput.selectionStart, composerInput.selectionEnd, 'end');
      composerInput.focus();
    }
  });
}
```
:::

### Step 8 — Use the picker in `main.js`

In `vanilla/js/main.js`, add `import { setupEmojiPicker } from './reactions.js';` after the `setupComposer` import, and call `setupEmojiPicker();` right after `setupComposer();` in `start()`.

::: solution
```js [vanilla/js/main.js]
import { setupComposer } from './composer.js';
import { setupEmojiPicker } from './reactions.js';

// ...inside start():
  setupChat();
  setupComposer();
  setupEmojiPicker();

  onChange(render);
  render();
```
:::

### Step 9 — Reaction pills and the react button in `chat.js`

Open `vanilla/js/chat.js`:

1. Add `toggleReaction` to the `./actions.js` import and add `import { openEmojiPicker } from './reactions.js';`.
2. Above `createEditor`, add `createReactions(message)`: a `div.reactions` with one `button.reaction` per reaction. `is-mine` marks yours. `String(...)` turns the number into text because `el()` sets `textContent`.
3. In `createMessage`, after the `if (isEditing) ... else ...` block, append the reactions when there are any. Then, when building the toolbar, add the react button **first**, before the `if (message.authorId === CURRENT_USER_ID)` check, because everyone can react to anything.
4. In `setupChat`'s click listener, restructure so that clicks are first matched to their message, then reaction pills are handled, and only then toolbar buttons. Replace the `messageId` line that used `actionButton.closest(...)`, and add the new `react` action that opens the picker anchored on the clicked button.

::: solution
```js [vanilla/js/chat.js]
import { startEditing, cancelEditing, saveEdit, deleteMessage, toggleReaction } from './actions.js';
import { el, icon, avatar } from './dom.js';
import { renderMarkdown } from './markdown.js';
import { openEmojiPicker } from './reactions.js';

// ...above createEditor:

// The reaction pills under a message: emoji + count
function createReactions(message) {
  const list = el('div', 'reactions');
  for (const reaction of message.reactions) {
    const button = el('button', 'reaction');
    button.type = 'button';
    button.dataset.emoji = reaction.emoji;
    if (reaction.userIds.includes(CURRENT_USER_ID)) {
      button.classList.add('is-mine');
    }
    button.setAttribute('aria-label', `${reaction.emoji} reaction, ${reaction.userIds.length}`);
    button.append(el('span', 'reaction-emoji', reaction.emoji), el('span', 'reaction-count', String(reaction.userIds.length)));
    list.append(button);
  }
  return list;
}
```

```js [vanilla/js/chat.js]
// ...inside createMessage, after the isEditing if/else block:

  if (message.reactions.length > 0) {
    body.append(createReactions(message));
  }

  // The toolbar that appears when you hover a message (only your own can be edited)
  const actions = el('div', 'message-actions');
  actions.append(createActionButton('react', 'reaction-add', 'Add Reaction'));
  if (message.authorId === CURRENT_USER_ID) {
    actions.append(createActionButton('edit', 'edit', 'Edit'));
    actions.append(createActionButton('delete', 'trash', 'Delete', 'danger'));
  }
```

```js [vanilla/js/chat.js]
export function setupChat() {
  messageList.addEventListener('click', (event) => {
    const messageItem = event.target.closest('.message');
    if (!messageItem) {
      return;
    }
    const messageId = messageItem.dataset.messageId;

    const reaction = event.target.closest('.reaction');
    if (reaction) {
      toggleReaction(messageId, reaction.dataset.emoji);
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }
    const action = actionButton.dataset.action;
    if (action === 'react') {
      openEmojiPicker(actionButton, { type: 'reaction', messageId: messageId });
    } else if (action === 'edit') {
      startEditing(messageId);
    } else if (action === 'delete') {
      // Shift+click deletes right away; otherwise ask first.
      // (Lesson 26 replaces confirm() with a nicer dialog.)
      if (event.shiftKey || confirm('Delete this message?')) {
        deleteMessage(messageId);
      }
    } else if (action === 'cancel-edit') {
      cancelEditing();
    } else if (action === 'save-edit') {
      saveEdit();
    }
  });

  // ...the input and keydown listeners: unchanged...
}
```
:::

### Step 10 — The composer's emoji button

In `vanilla/js/composer.js`: import `openEmojiPicker` from `./reactions.js`, get the button with `document.querySelector('#composer-emoji-button')` next to the other element lookups, and at the end of `setupComposer()` add a click listener that opens the picker with `{ type: 'composer' }`.

::: solution
```js [vanilla/js/composer.js]
import { autoResize, scrollToBottom } from './chat.js';
import { openEmojiPicker } from './reactions.js';

const composer = document.querySelector('#composer');
const composerInput = document.querySelector('#composer-input');
const emojiButton = document.querySelector('#composer-emoji-button');

// ...inside setupComposer(), after the 'input' listener:

  composerInput.addEventListener('input', () => autoResize(composerInput));

  emojiButton.addEventListener('click', () => {
    openEmojiPicker(emojiButton, { type: 'composer' });
  });
}
```
:::

### Step 11 — Try everything

Reload. Hover a message and click the react button; pick an emoji and see the pill appear. Click the pill to remove it. Search for "heart" in the picker. Click into the middle of some composer text, open the picker from the composer smiley and pick: the emoji appears where your cursor was. Press <kbd>Esc</kbd> with the picker open, or click outside it, to close it.

<!-- no-solution: trying the feature out, nothing to type -->

## ✅ Checkpoint

- [ ] Every message toolbar has a react button; only your own messages also have edit and delete.
- [ ] The react button opens the picker beside it, fully inside the window, even for the message nearest the top.
- [ ] Clicking outside the picker, or pressing <kbd>Esc</kbd>, closes it (light dismiss) with no code from you.
- [ ] Typing `heart` in the search box narrows the grid; a nonsense word shows "No emoji match that search."
- [ ] Picking an emoji adds a pill; picking the same one again removes it. Pills you added have an accent border.
- [ ] Reload: your reactions are still there (they live in `state.messages`, which is saved).
- [ ] The composer's emoji button inserts at the cursor, not at the end.
- [ ] DevTools: in Elements, the `#emoji-picker` div has the `popover` attribute; while it is open, Chrome's Elements panel should show a "top-layer" entry for it (the wording may differ in other browsers). The `:popover-open` rule shows in the Styles pane while open.
- [ ] Application → Local Storage: a message object now has a `reactions` array.

## 🐛 Common mistakes

**The picker is always visible on the page.** Your `.emoji-picker` rule probably says `display: flex` outright, which overrides the browser's hiding rule. Use `display: none` and put `display: flex` in `.emoji-picker:popover-open`.

**The picker is in the middle of the screen.** Browsers center popovers. Make sure `[popover]` sets `inset: auto; margin: 0` and that `positionPicker` runs *after* `showPopover()`.

**The picker jumps to the top-left corner or its size is wrong.** `offsetWidth` and `offsetHeight` are `0` while the popover is hidden. Call `picker.showPopover()` before measuring.

**Clicking an emoji does nothing and the Console shows `TypeError: Cannot read properties of null` for `target.type`.** `target` is `null` until `openEmojiPicker` runs. Check that the toolbar button passes a second argument, `{ type: 'reaction', messageId: messageId }`.

**The new emoji is added at the end of my composer text instead of at the cursor.** You probably used `composerInput.value += emoji`. Use `setRangeText` with `selectionStart` and `selectionEnd`.

**Search finds nothing for "Smile".** `renderEmojiGrid` lowercases the query, but the names in `emoji.json` are lowercase too. Make sure you call `.toLowerCase()` on the **query**, not on the emoji name.

## 📝 Quiz

::: quiz
You call `picker.showPopover()` on an element with the `popover` attribute. The user then clicks somewhere else on the page. What happens?

- [ ] The popover stays open until you call `hidePopover()`
- [x] The browser closes it automatically (light dismiss)
- [ ] The click is ignored
- [ ] An error is thrown

> A plain `popover` (the `auto` kind) is light dismissed by clicking outside or pressing <kbd>Esc</kbd>. Only `popover="manual"` stays open until you close it.
:::

::: quiz
Given this data, what does the call do?

```js
const message = { reactions: [{ emoji: '🎉', userIds: ['u-me'] }] };
toggleReaction(message.id, '🎉');
```

- [ ] Adds a second reaction `🎉` with `u-me`
- [ ] Changes the count to 2
- [x] Removes the reaction entirely, since you were its only user
- [ ] Does nothing

> You're already in `userIds`, so your id is filtered out. The list is then empty, so the whole reaction is removed.
:::

::: quiz
Why does `openEmojiPicker` call `showPopover()` **before** `positionPicker`?

- [ ] So the search box can be focused first
- [x] A hidden element has `offsetWidth` and `offsetHeight` of 0, so the picker can only be measured after it is displayed
- [ ] `getBoundingClientRect()` only works on open popovers
- [ ] Because `showPopover()` positions the picker automatically

> Measuring a `display: none` element gives zeros. Show first, measure second.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add emoji picker and message reactions"
git push
```
