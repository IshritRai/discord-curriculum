---
lesson: 23
title: "Editing & deleting your messages"
---

# Lesson 23 — Editing & deleting your messages

Until now your messages were permanent. In this lesson you add a small hover toolbar to your own messages, an inline editor that replaces the text while you edit, and a delete button that asks first. Along the way you'll meet the biggest trap of "re-render everything" apps: the thing you were typing into gets destroyed.

## 🎯 Goal

By the end, hovering one of **your** messages shows a small toolbar with an edit (pencil) and a delete (trash) button. Clicking edit swaps the message text for a text box with a hint underneath: "escape to cancel • enter to save". Pressing <kbd>Enter</kbd> saves and adds an "(edited)" label; <kbd>Escape</kbd> cancels. Pressing <kbd>ArrowUp</kbd> in an empty composer starts editing your last message.

![The chat with one of Sam's messages replaced by an edit box containing the text "min-height: 0 saved me" and the hint "escape to cancel • enter to save" underneath](/screenshots/lesson-23.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### Why the edit draft lives in `state`

Lesson 16 gave you the loop: **state → render → DOM → event → action → state**. Every `update()` call runs `render()`, and the render functions throw away the old message elements and build new ones (`messageList.replaceChildren(...)`).

Now picture editing. You click the pencil, a `<textarea>` appears, and you type. If you stored your half-typed text only *inside* that textarea, what happens when anything triggers a re-render (say, a new message arrives in Lesson 28)? The textarea is destroyed and rebuilt empty. Your text, your cursor and your keyboard focus are all gone.

The fix is the same rule as always: **the state is the single source of truth**. We keep two new values in `state`:

| Field | Meaning |
| --- | --- |
| `editingMessageId` | the `id` of the message being edited, or `null` |
| `editDraft` | the text currently in the edit box |

Every keystroke copies the textarea's text into `state.editDraft`, *without* re-rendering (re-rendering on every keystroke would rebuild the box you're typing in). If a render does happen, the new textarea is created with `input.value = state.editDraft`, so nothing is lost.

```text
  typing                       render()
    │                             │
    ▼                             ▼
textarea ──input event──▶ state.editDraft ──▶ new textarea.value
 (screen)                    (truth)             (screen again)
```

::: tip Python comparison
Think of a Jupyter notebook that you restart: variables in memory (`state`) are what you rebuild from, not what was drawn on the screen. The screen is always a *picture of* the state.
:::

### Restoring focus after a re-render

A new element has no keyboard focus. So after a re-render we have to put the cursor back into the textarea ourselves. Four small browser tools do this:

- `element.focus()` gives the element keyboard focus.
- `document.activeElement` is the element that has focus *right now*. We read it **before** re-rendering to ask "was the user typing in the edit box?"
- `textarea.setSelectionRange(start, end)` places the cursor (or selects a range). When `start` and `end` are equal, it's just a cursor. We put it at the end of the text with `input.value.length`.
- `textarea.rows = 1` sets the number of visible text lines (the `rows` attribute). Combined with the auto-resize helper from Lesson 22, the box starts one line tall and grows.

```js
const input = document.querySelector('textarea');
input.focus();
input.setSelectionRange(input.value.length, input.value.length);
```

### `Object.keys()` and `Object.values()`

Messages are stored as an object that maps a channel id to an array of messages:

```js
const messages = { general: ['a', 'b'], help: ['c'] };
```

To search *every* channel for one message, you need to loop over that object. In Python you'd write `for key, value in d.items()`. JavaScript has helpers on the built-in `Object`:

| JavaScript | Python | Gives you |
| --- | --- | --- |
| `Object.keys(messages)` | `list(d.keys())` | `['general', 'help']` |
| `Object.values(messages)` | `list(d.values())` | `[['a', 'b'], ['c']]` |

You can loop over either with `for...of`.

### `confirm()`

`confirm('Delete this message?')` is built into the browser. It freezes the page, shows a small box with OK and Cancel, and returns `true` or `false`. It's the quickest way to ask "are you sure?". It looks ugly and you can't style it, so Lesson 26 replaces it with a real dialog.

### `:focus-within` and `:empty`

Two new CSS pseudo-classes:

- `.message:focus-within` matches a `.message` when the message itself **or anything inside it** has keyboard focus. We use it so the toolbar also appears for someone tabbing through the buttons with the keyboard, not just hovering with a mouse.
- `.message-actions:empty` matches an element with **no children at all**. Messages from other people get an empty toolbar `div`; `:empty` lets us hide it.

## 🛠️ Build it

You'll touch six files: `state.js`, `actions.js`, `chat.js`, `composer.js`, `main.js` and `chat.css`. Work in that order, and keep the page open: nothing visible changes until the last JavaScript step.

### Step 1 — Add the edit fields and `findMessage` to `state.js`

Open `vanilla/js/state.js`. In the `state` object, under the `// Temporary — not saved` comment, after `showMembers: true,` add the two new fields. They are temporary on purpose: `save()` doesn't list them, so a half-finished edit isn't stored in `localStorage`.

Then scroll down to the getter functions and add `findMessage` right after `getMessages`. It loops over the arrays of all channels and returns the message with a matching id, or `null`.

::: solution
```js [vanilla/js/state.js]
export const state = {
  // ...rest unchanged...

  // Temporary — not saved
  showMembers: true,
  editingMessageId: null, // the message you're editing, if any
  editDraft: '', // what's in the edit box right now
};

// ...after getMessages(channelId)...

export function findMessage(messageId) {
  for (const messages of Object.values(state.messages)) {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      return message;
    }
  }
  return null;
}
```
:::

### Step 2 — Write the edit and delete actions in `actions.js`

Open `vanilla/js/actions.js`.

1. Change the import line at the top to also import `findMessage`.
2. Inside `selectServer` and `selectChannel`, add `state.editingMessageId = null;` right after the line that changes the active server or channel. Otherwise you could start editing, switch channel, and the editor state would linger.
3. At the very bottom of the file, add four new exported actions.

`saveEdit` has one subtle detail: it clears `editingMessageId` *first*. Saving an empty box deletes the message (like Discord), and `deleteMessage` calls `update()` itself, so we must already be out of editing mode by then. It only sets `editedAt` if the text actually changed.

::: solution
```js [vanilla/js/actions.js]
import { state, update, getActiveChannel, findChannel, findMessage } from './state.js';

// ...markChannelRead unchanged...

export function selectServer(serverId) {
  state.activeServerId = serverId;
  state.editingMessageId = null;
  markChannelRead(getActiveChannel());
  update();
}

// In selectChannel, add this line after
// state.activeChannelByServer[state.activeServerId] = channelId;
//   state.editingMessageId = null;

// ...at the bottom of the file:

export function startEditing(messageId) {
  state.editingMessageId = messageId;
  state.editDraft = findMessage(messageId).content;
  update();
}

export function cancelEditing() {
  state.editingMessageId = null;
  update();
}

export function saveEdit() {
  const message = findMessage(state.editingMessageId);
  const content = state.editDraft.trim();
  state.editingMessageId = null;
  if (content === '') {
    // Saving an empty message deletes it, like in the real app.
    deleteMessage(message.id);
    return;
  }
  if (content !== message.content) {
    message.content = content;
    message.editedAt = new Date().toISOString();
  }
  update();
}

export function deleteMessage(messageId) {
  for (const channelId of Object.keys(state.messages)) {
    state.messages[channelId] = state.messages[channelId].filter((m) => m.id !== messageId);
  }
  update();
}
```

`selectChannel` after the edit:

```js [vanilla/js/actions.js]
state.activeChannelByServer[state.activeServerId] = channelId;
state.editingMessageId = null;
markChannelRead(channel);
update();
```
:::

### Step 3 — Build the toolbar and the editor in `chat.js` (part 1)

Open `vanilla/js/chat.js`. This is the biggest file of the lesson, so we go in three steps.

First, imports and a new variable:

1. Add `state` to the first import from `./state.js`.
2. Add a new import line: `import { startEditing, cancelEditing, saveEdit, deleteMessage } from './actions.js';`
3. Under `let renderedChannelId = null;` add `let renderedEditingId = null;`. We'll use it in Step 5 to detect "the user *just* started editing".

Then, under the `// ---------- Building one message ----------` heading and **above** `createMessage`, add two helper functions:

- `createActionButton(action, iconName, label, extraClass)` builds one icon button. `data-action` says what it does; the click handler (Step 5) reads it. The `aria-label` is there because an icon-only button has no text for a screen reader.
- `createEditor()` builds a wrapper `div` with the textarea and the "escape to cancel • enter to save" hint, whose two words are real buttons (handy for touch screens).

::: solution
```js [vanilla/js/chat.js]
import { state, getActiveChannel, getActiveServer, getMessages, getUser, getRoleColor, mentionsMe, CURRENT_USER_ID } from './state.js';
import { startEditing, cancelEditing, saveEdit, deleteMessage } from './actions.js';
import { el, icon, avatar } from './dom.js';
// ...other imports unchanged...

let renderedChannelId = null;
let renderedEditingId = null;

// ---------- Building one message ----------

function createActionButton(action, iconName, label, extraClass) {
  const button = el('button', 'icon-button');
  button.type = 'button';
  button.dataset.action = action;
  button.setAttribute('aria-label', label);
  if (extraClass) {
    button.classList.add(extraClass);
  }
  button.append(icon(iconName));
  return button;
}

// The edit box that replaces a message's text while you edit it
function createEditor() {
  const wrapper = el('div', 'editor');
  const input = el('textarea', 'edit-input');
  input.value = state.editDraft;
  input.rows = 1;
  input.setAttribute('aria-label', 'Edit message');

  const hint = el('p', 'edit-hint', 'escape to ');
  const cancel = el('button', '', 'cancel');
  cancel.type = 'button';
  cancel.dataset.action = 'cancel-edit';
  const saveButton = el('button', '', 'save');
  saveButton.type = 'button';
  saveButton.dataset.action = 'save-edit';
  hint.append(cancel, ' • enter to ', saveButton);

  wrapper.append(input, hint);
  return wrapper;
}
```
:::

### Step 4 — Use them inside `createMessage` (part 2)

Still in `chat.js`, change `createMessage`:

1. After the `is-mention` `if` block, add the `isEditing` constant and add the `is-editing` class when it's true.
2. Near the bottom of the function, replace the three lines that built `content` and appended it to `body` with an `if (isEditing) ... else ...`: while editing we show the editor, otherwise the normal rendered Markdown (the old code, moved into the `else`).
3. Create the toolbar `div`. Only if the author is you (`CURRENT_USER_ID`) do we put buttons in it; for everyone else it stays empty (that's what `:empty` hides in CSS). The icon names `edit` and `trash` already exist in `assets/icons.svg`.
4. Change the last `item.append(...)` to include `actions`.

::: solution
```js [vanilla/js/chat.js]
function createMessage(message, startsGroup) {
  // ...unchanged: author, item, startsGroup class...
  if (mentionsMe(message.content) && message.authorId !== CURRENT_USER_ID) {
    item.classList.add('is-mention');
  }
  const isEditing = state.editingMessageId === message.id;
  if (isEditing) {
    item.classList.add('is-editing');
  }

  // ...gutter and header code unchanged...

  if (isEditing) {
    body.append(createEditor());
  } else {
    const content = el('div', 'message-content');
    // renderMarkdown escapes the text first, so this innerHTML is safe.
    content.innerHTML = renderMarkdown(message.content);
    if (message.editedAt) {
      content.append(' ', el('span', 'edited-label', '(edited)'));
    }
    body.append(content);
  }

  // The toolbar that appears when you hover a message (only your own can be edited)
  const actions = el('div', 'message-actions');
  if (message.authorId === CURRENT_USER_ID) {
    actions.append(createActionButton('edit', 'edit', 'Edit'));
    actions.append(createActionButton('delete', 'trash', 'Delete', 'danger'));
  }

  item.append(gutter, body, actions);
  return item;
}
```
:::

### Step 5 — Restore focus in `renderMessages`, then add `setupChat`

Still in `chat.js`, two more changes.

**In `renderMessages`:** just before `messageList.replaceChildren(...)`, remember whether the edit box currently has focus (`editorHadFocus`). The `document.activeElement && ...` part guards against `activeElement` being empty. At the end of the function (after `renderedChannelId = channel.id;`), find the new textarea, size it, and focus it if the user either was typing in it or has just clicked "Edit". Finally remember which message is being edited.

**At the end of the file:** add `setupChat()`, which registers three listeners on `messageList` using **event delegation** (Lesson 15): one `click` handler for all the buttons, one `input` handler to copy the draft into state, and one `keydown` handler for <kbd>Escape</kbd> and <kbd>Enter</kbd>.

Things to notice:

- Buttons are found with `event.target.closest('[data-action]')`, then the message id comes from the nearest `.message` ancestor's `data-message-id`.
- **Shift+click** on delete skips the confirmation: `event.shiftKey || confirm(...)`. With `||`, when `event.shiftKey` is `true` JavaScript never even calls `confirm`.
- Typing updates `state.editDraft` but does **not** call `update()`.
- After saving or cancelling with the keyboard we call `composerInput.focus()`, so you can keep typing the next message.
- `Enter` without Shift saves; `event.preventDefault()` stops the textarea from inserting a newline.

::: solution
```js [vanilla/js/chat.js]
function renderMessages(channel) {
  const channelChanged = channel.id !== renderedChannelId;
  const wasNearBottom = isNearBottom();
  const previousScrollTop = messageList.scrollTop;
  const editorHadFocus = document.activeElement && document.activeElement.classList.contains('edit-input');

  messageList.replaceChildren(createChannelWelcome(channel));
  // ...the loop that builds messages and the scrolling code: unchanged...
  renderedChannelId = channel.id;

  // Re-rendering replaced the edit box: size it, and focus it if you were
  // typing in it or just clicked "Edit".
  const editInput = messageList.querySelector('.edit-input');
  if (editInput) {
    autoResize(editInput);
    const justStartedEditing = state.editingMessageId !== renderedEditingId;
    if (justStartedEditing || editorHadFocus) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }
  renderedEditingId = state.editingMessageId;
}
```

```js [vanilla/js/chat.js]
// ...at the very end of the file:

// ---------- Events ----------

export function setupChat() {
  messageList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }
    const messageId = actionButton.closest('.message').dataset.messageId;
    const action = actionButton.dataset.action;
    if (action === 'edit') {
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

  // Typing in the edit box: remember the draft without re-rendering.
  messageList.addEventListener('input', (event) => {
    if (event.target.classList.contains('edit-input')) {
      state.editDraft = event.target.value;
      autoResize(event.target);
    }
  });

  messageList.addEventListener('keydown', (event) => {
    if (!event.target.classList.contains('edit-input')) {
      return;
    }
    if (event.key === 'Escape') {
      cancelEditing();
      composerInput.focus();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
      composerInput.focus();
    }
  });
}
```
:::

### Step 6 — Wire up `main.js` and the ArrowUp shortcut in `composer.js`

In `vanilla/js/main.js`, import `setupChat` next to `renderChat` and call `setupChat();` between `setupChannels();` and `setupComposer();`.

In `vanilla/js/composer.js`, update the two imports at the top (`getMessages` from state, `startEditing` from actions). Inside the existing `keydown` listener, after the Enter-to-send block, add the ArrowUp rule: when the box is empty, find the messages written by you in this channel and edit the last one. `mine[mine.length - 1]` is the last element (JavaScript has no negative indexes like Python's `mine[-1]`).

::: solution
```js [vanilla/js/main.js]
import { renderChat, setupChat } from './chat.js';

// ...inside start(), with the other setup calls:
  setupLayout();
  setupServers();
  setupChannels();
  setupChat();
  setupComposer();
```

```js [vanilla/js/composer.js]
import { getActiveChannel, getMessages, CURRENT_USER_ID } from './state.js';
import { sendMessage, startEditing } from './actions.js';

// ...inside the keydown listener, after the Enter block:
    // Up arrow in an empty box edits your last message
    if (event.key === 'ArrowUp' && composerInput.value === '') {
      const mine = getMessages(getActiveChannel().id).filter((m) => m.authorId === CURRENT_USER_ID);
      if (mine.length > 0) {
        event.preventDefault();
        startEditing(mine[mine.length - 1].id);
      }
    }
```
:::

### Step 7 — Style the toolbar and the editor in `chat.css`

Open `vanilla/css/chat.css`.

1. Find the `.message:hover` rule and turn it into a selector list so the highlight also shows while focus is inside or while editing.
2. Under the existing `.edited-label` rule (before the `/* ---------- Composer ---------- */` heading), add the two new sections.

Notes on the CSS: `.message-actions` is `position: absolute` (Lesson 9) so it floats over the top-right corner of the message without taking space; it is `display: none` until the message is hovered or focused. The `!important` in the `:empty` rule beats the `display: flex` rule above it, whatever the specificity (Lesson 4).

::: solution
```css [vanilla/css/chat.css]
.message:hover,
.message:focus-within,
.message.is-editing {
  background-color: var(--bg-message-hover);
}

/* ...place after the .edited-label rule: */

/* ---------- Hover actions (edit, delete) ---------- */

.message-actions {
  position: absolute;
  top: -16px;
  right: 16px;
  display: none;
  padding: 2px;
  border-radius: var(--radius-small);
  background-color: var(--bg-primary);
  box-shadow: 0 0 0 1px rgba(4, 4, 5, 0.15), 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* :focus-within matches when the message OR something inside it has focus */
.message:hover .message-actions,
.message:focus-within .message-actions {
  display: flex;
}

/* Messages from other people have no buttons: hide the empty toolbar */
.message-actions:empty,
.message.is-editing .message-actions {
  display: none !important;
}

.message-actions .danger:hover {
  color: var(--red);
}

/* ---------- Inline editing ---------- */

.edit-input {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 10px 16px;
  border-radius: var(--radius);
  background-color: var(--bg-input);
  resize: none;
}

.edit-input:focus {
  outline: none;
}

.edit-hint {
  margin: 4px 0;
  color: var(--text-normal);
  font-size: 12px;
}

.edit-hint button {
  color: var(--text-link);
}

.edit-hint button:hover {
  text-decoration: underline;
}
```
:::

### Step 8 — Try it

Save everything and reload. Hover one of Sam's messages (the blue "S" avatar): the toolbar appears. Edit a message, press <kbd>Enter</kbd>: "(edited)" appears. Reload the page: the edit survived (messages are saved in `localStorage`). Click the trash icon and press Cancel, then click it again holding <kbd>Shift</kbd>.

<!-- no-solution: trying the feature out, nothing to type -->

## ✅ Checkpoint

- [ ] Hovering **your** messages shows the pencil and trash buttons; hovering other people's messages shows no toolbar.
- [ ] Pressing <kbd>Tab</kbd> until a toolbar button has focus shows the toolbar (`:focus-within`).
- [ ] Clicking the pencil replaces the text with a focused textarea whose cursor is at the end of the text.
- [ ] <kbd>Enter</kbd> saves and adds "(edited)"; <kbd>Escape</kbd> cancels and leaves the message unchanged; <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a new line in the editor.
- [ ] Saving an empty box deletes the message.
- [ ] Clicking the trash icon asks "Delete this message?"; Cancel keeps it, OK removes it, and <kbd>Shift</kbd>+click removes it immediately.
- [ ] In an empty composer, <kbd>ArrowUp</kbd> starts editing your last message in this channel.
- [ ] DevTools: in the Elements panel, a message from someone else contains an empty `<div class="message-actions">`; in the **Console**, typing `document.activeElement` while editing shows the `<textarea class="edit-input">`.
- [ ] Application → Local Storage: the edited text is saved, but you won't find `editDraft` there.

## 🐛 Common mistakes

**The edit box loses focus (or its text) every time I type.** You probably called `update()` inside the `input` handler. That re-renders and rebuilds the textarea. The handler must only copy `event.target.value` into `state.editDraft`.

**The toolbar never appears, even on hover.** Check that `.message` has `position: relative` from Lesson 9 (the toolbar is absolutely positioned against it), and that the `.message:hover .message-actions` rule sets `display: flex`. Inspect the toolbar in DevTools and look for a crossed-out `display`.

**Clicking the pencil does nothing.** Either `setupChat()` isn't called in `main.js`, or the button lacks `data-action`. In the Console check that `document.querySelector('.message-actions button').dataset.action` prints `edit`.

**`TypeError: Cannot read properties of null` when clicking edit.** `findMessage` returned `null` because the id wasn't found, or you wrote `Object.values` as `Object.value`. Check the spelling and that `findMessage` is exported and imported.

**Pressing Enter in the edit box inserts a new line and doesn't save.** You forgot `event.preventDefault()` in the `Enter` branch.

**Escape leaves the editor open.** The keydown listener returns early unless `event.target` has class `edit-input`. If the focus is on the hint buttons rather than the textarea, Escape isn't handled there; click into the box first.

## 📝 Quiz

::: quiz
Why is `editDraft` stored in `state` instead of only in the textarea?

- [ ] Because textareas can't hold text
- [x] Because `render()` rebuilds the DOM, so a textarea would lose its text if the draft lived only there
- [ ] Because `localStorage` needs it
- [ ] Because JavaScript can't read a textarea's value

> Every `update()` replaces the message elements, textarea included. The state outlives re-renders, so the new textarea can be filled from `state.editDraft`.
:::

::: quiz
What does this print?

```js
const messages = { general: ['a', 'b'], help: ['c'] };
console.log(Object.keys(messages));
```

- [ ] `[['a', 'b'], ['c']]`
- [x] `['general', 'help']`
- [ ] `3`
- [ ] `{ general: 2, help: 1 }`

> `Object.keys` gives the keys, like `list(d.keys())` in Python. `Object.values` would give the arrays.
:::

::: quiz
You hold <kbd>Shift</kbd> and click the trash icon. What happens, given `if (event.shiftKey || confirm('Delete this message?'))`?

- [ ] The confirm box appears, then the message is deleted
- [x] The message is deleted without the confirm box
- [ ] Nothing happens
- [ ] The message is edited instead

> `||` stops at the first truthy value. `event.shiftKey` is `true`, so `confirm(...)` is never evaluated.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add editing and deleting of your own messages"
git push
```
