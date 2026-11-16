---
lesson: 27
title: "Context menus & tooltips"
---

# Lesson 27 — Context menus & tooltips

Two details make an app feel finished: little labels that appear when you hover an icon, and menus that appear when you right-click things. In this lesson you build both, each from **one** shared element that you move around, and you describe the menus as plain data.

## 🎯 Goal

Right-clicking a message, server icon, channel, member or author name opens a custom menu next to the mouse pointer (for example "Add Reaction", "Copy Text", "Edit Message", "Delete Message"). Hovering or tabbing to any icon button shows a small tooltip with its name. Clicking the server name in the sidebar or the settings cog opens a menu too, and "Reset Demo Data" wipes everything you saved.

![The chat with a custom right-click menu open over the messages: Add Reaction (highlighted), Copy Text, Edit Message, then a divider and a red Delete Message](/screenshots/lesson-27.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### The `contextmenu` event

When you right-click (or press the menu key, or on macOS <kbd>Control</kbd>-click) the browser fires a `contextmenu` event and then shows its own menu. Calling `event.preventDefault()` in your handler tells the browser **not** to show its menu, so you can show yours instead:

```js
list.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  console.log(event.clientX, event.clientY);
});
```

`event.clientX` and `event.clientY` are the mouse position in pixels, measured from the top-left corner of the **window** (the viewport): the same coordinate system as `getBoundingClientRect()` from Lesson 24, and the one `position: fixed` and our popover use. So `left = event.clientX` and `top = event.clientY` put an element exactly under the pointer.

As in Lesson 15 we use **event delegation**: one `contextmenu` listener per area (server list, channel list, message list, member list), and `event.target.closest(...)` to find what was clicked.

::: info A detail about Firefox
MDN notes that in Firefox, holding <kbd>Shift</kbd> while right-clicking shows the browser's own menu *without* firing a `contextmenu` event, so you can't cancel it. See [`contextmenu` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event).
:::

### Menus as data

Instead of writing HTML for every menu, we describe each menu as an **array of objects**, one per item, and have *one* function build the buttons:

```js
const items = [
  { label: 'Copy Text', icon: 'copy', run: () => copyText('hello') },
  'separator',
  { label: 'Delete Message', icon: 'trash', danger: true, run: () => copyText('bye') },
];
```

The interesting part is `run`: its value is a **function**. In JavaScript, functions are values like numbers or strings: you can store them in objects and call them later with `item.run()`. (In Python: a dict like `{'label': 'Copy', 'run': lambda: copy_text('hello')}`.) The builder doesn't need to know what each item does; it just calls `item.run()` when the button is clicked. The plain string `'separator'` marks a divider line.

Adding a new menu is then only a new array, with no new DOM code.

### Copying text: `navigator.clipboard`

`navigator.clipboard.writeText(text)` puts text on the user's clipboard. It returns a **Promise** (Lesson 18) because the browser may need time, or may refuse. If it refuses, the promise is *rejected*, and `.catch(...)` lets us handle that instead of leaving an unhandled error:

```js
navigator.clipboard.writeText('hello').catch((error) => {
  console.warn('Could not copy.', error);
});
```

`navigator` is a built-in object describing the browser. The clipboard is only available in a **secure context**: `https://` pages, and also `localhost` / `127.0.0.1` addresses, which MDN lists as secure, so your Live Server address works. See [`Clipboard.writeText`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) and [Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts).

### One shared tooltip

You could give every button its own tooltip element, but there'd be dozens. Instead:

1. Any element that wants a tooltip gets a `data-tooltip="Mute"` attribute (read in JS with `element.dataset.tooltip`).
2. There is **one** tooltip `div` on the page.
3. When the mouse enters an element with `data-tooltip`, we copy the text into the tooltip, measure the element, and move the tooltip next to it.

Which events? `mouseover` bubbles (Lesson 15), so a single listener on `document` sees every hover; `event.target.closest('[data-tooltip]')` finds the nearest ancestor with the attribute (the target may be an icon *inside* the button). For keyboard users we also react to `focusin` (an element got focus; unlike `focus`, it bubbles) and `focusout` (focus left; it bubbles too).

### Resetting and reloading

`localStorage.removeItem(key)` deletes one saved entry. `location.reload()` reloads the page, like pressing <Keys mac="Cmd+R" win="Ctrl+R" />. "Reset Demo Data" combines them: remove what we saved, then reload, and the app starts again from the JSON files. ([`location.reload`](https://developer.mozilla.org/en-US/docs/Web/API/Location/reload), [`removeItem`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/removeItem))

## 🛠️ Build it

Files you'll touch: `css/theme.css`, `css/overlays.css`, `index.html`, `js/state.js`, `js/actions.js`, `js/servers.js`, `js/chat.js`, `js/menus.js` (new), `js/tooltips.js` (new), `js/main.js`.

### Step 1 — A colour for floating things (`theme.css`)

The new CSS uses a variable `--bg-floating` (very dark grey, used by tooltips and menus). Add it to `vanilla/css/theme.css` in the "Backgrounds" group after `--bg-input`:

```css [vanilla/css/theme.css]
  --bg-floating: #111214;      /* tooltips and menus */
```

::: solution
```css [vanilla/css/theme.css]
  --bg-input: #383a40;         /* message composer */
  --bg-modal: #313338;         /* dialogs */
  --bg-floating: #111214;      /* tooltips and menus */
```
:::

### Step 2 — Add the elements to `index.html`

Open `vanilla/index.html`.

**Tooltip text.** Each of these existing buttons already has an `aria-label`. Add `data-tooltip="..."` with the **same text** right before the `aria-label` on each:

| Button | Text |
| --- | --- |
| Home button in the server rail | `Direct Messages` |
| Add-server button | `Add a Server` |
| `#mute-button` | `Mute` |
| `#deafen-button` | `Deafen` |
| `#settings-button` | `User Settings` |
| Notification button in the chat toolbar | `Notification Settings` |
| Pin button | `Pinned Messages` |
| `#members-button` | `Member List` |
| Inbox button | `Inbox` |
| Help button | `Help` |

**Two new elements.** After the drawer backdrop and before the emoji picker, add the tooltip (`hidden` until needed, `role="tooltip"` so assistive technology knows what it is) and the context menu. The menu is a **popover** (Lesson 24): the browser puts it in the top layer and closes it when you click elsewhere or press <kbd>Esc</kbd>. It's empty: JavaScript fills it with buttons every time it opens.

::: solution
```html [vanilla/index.html]
<button class="server-button home-button" type="button" data-tooltip="Direct Messages" aria-label="Direct Messages">
<button class="server-button add-server-button" type="button" data-tooltip="Add a Server" aria-label="Add a Server">
<button class="icon-button" type="button" id="mute-button" data-tooltip="Mute" aria-label="Mute">
<button class="icon-button" type="button" id="deafen-button" data-tooltip="Deafen" aria-label="Deafen">
<button class="icon-button" type="button" id="settings-button" data-tooltip="User Settings" aria-label="User Settings">
<button class="icon-button" type="button" data-tooltip="Notification Settings" aria-label="Notification Settings">
<button class="icon-button" type="button" data-tooltip="Pinned Messages" aria-label="Pinned Messages">
<button class="icon-button" type="button" id="members-button" data-tooltip="Member List" aria-label="Member List" aria-pressed="true">
<button class="icon-button" type="button" data-tooltip="Inbox" aria-label="Inbox">
<button class="icon-button" type="button" data-tooltip="Help" aria-label="Help">
```

(Each line above is just the opening tag of one existing button; the contents of the buttons don't change.)

```html [vanilla/index.html]
    <!-- The dark overlay behind the drawer on small screens -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>

    <!-- One shared tooltip, moved next to whatever you hover -->
    <div class="tooltip" id="tooltip" role="tooltip" hidden></div>

    <!-- The right-click menu: filled with buttons each time it opens -->
    <div class="context-menu" id="context-menu" popover></div>

    <!-- The emoji picker. "popover" puts it on top of everything and closes it when you click outside. -->
```
:::

### Step 3 — Style the tooltip and the menu (`overlays.css`)

Open `vanilla/css/overlays.css`.

1. Change the first-line comment to `/* Things that float above the app: tooltips, menus, the emoji picker and modals. */`.
2. Directly under it, **type** the tooltip. `position: fixed` places it relative to the window (so we can use `getBoundingClientRect` numbers). `z-index: 100` keeps it above normal content. `pointer-events: none` means the mouse "passes through" it: otherwise the tooltip could appear under the pointer, steal the hover, and flicker.
3. After the `[popover]` rule and before `/* ---------- Emoji picker ---------- */`, **paste** the menu styling. Notice `.menu-item:focus-visible` is styled like hover, so keyboard users see which item is selected, and `.context-menu` doesn't set `display`, so the browser's own "hidden unless open" rule keeps working (the opposite of the emoji picker in Lesson 24).

::: solution
```css [vanilla/css/overlays.css]
/* Things that float above the app: tooltips, menus, the emoji picker and modals. */

/* ---------- Tooltip ---------- */

.tooltip {
  position: fixed;
  z-index: 100;
  max-width: 200px;
  padding: 6px 10px;
  border-radius: var(--radius-small);
  background-color: var(--bg-floating);
  color: var(--text-normal);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  pointer-events: none;
}
```
:::

Now the pasted menu CSS:

::: starter
```css [vanilla/css/overlays.css]
/* ---------- Context menu ---------- */

.context-menu {
  min-width: 188px;
  padding: 6px 8px;
  border-radius: var(--radius-small);
  background-color: var(--bg-floating);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 32px;
  margin: 2px 0;
  padding: 6px 8px;
  border-radius: 2px;
  color: var(--text-normal);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.menu-item .icon {
  width: 18px;
  height: 18px;
}

.menu-item:hover,
.menu-item:focus-visible {
  background-color: var(--brand-accent);
  color: white;
  outline: none;
}

.menu-item.danger {
  color: var(--red);
}

.menu-item.danger:hover,
.menu-item.danger:focus-visible {
  background-color: var(--red);
  color: white;
}

.menu-separator {
  height: 1px;
  margin: 4px;
  background-color: var(--divider);
}
```
:::

### Step 4 — New actions and a way to clear saved data

In `vanilla/js/state.js`, right after `save()`, add:

```js [vanilla/js/state.js]
export function clearSaved() {
  localStorage.removeItem(STORAGE_KEY);
}
```

In `vanilla/js/actions.js`:

1. Change the import from `./state.js` to also import `clearSaved` and `getChannels`.
2. After `selectChannel` (and before the `// ---------- Messages ----------` heading) add `markServerRead` and `markRead`. They reuse the helper `markChannelRead` from Lesson 19.
3. At the end of the file add `leaveServer` (refusing to leave the last server, and choosing a new active server if you left the active one) and `resetDemoData`.

::: solution
```js [vanilla/js/actions.js]
import { state, update, clearSaved, getActiveChannel, getChannels, findChannel, findMessage, CURRENT_USER_ID } from './state.js';

// ...after selectChannel:

export function markServerRead(serverId) {
  const server = state.servers.find((s) => s.id === serverId);
  for (const channel of getChannels(server)) {
    markChannelRead(channel);
  }
  update();
}

export function markRead(channelId) {
  markChannelRead(findChannel(channelId));
  update();
}

// ...at the end of the file, after createServer:

export function leaveServer(serverId) {
  if (state.servers.length === 1) {
    return; // keep at least one server on screen
  }
  state.servers = state.servers.filter((s) => s.id !== serverId);
  if (state.activeServerId === serverId) {
    state.activeServerId = state.servers[0].id;
  }
  update();
}

// ---------- Demo data ----------

// Forget everything saved and start again from the JSON files.
export function resetDemoData() {
  clearSaved();
  location.reload();
}
```
:::

### Step 5 — Tooltip text on generated buttons

Some buttons are created by JavaScript, so they need the attribute there. Add one line to each:

- `vanilla/js/servers.js`, in `createServerItem`, after `button.type = 'button';`: `button.dataset.tooltip = server.name;`
- `vanilla/js/chat.js`, in `createActionButton`, after `button.dataset.action = action;`: `button.dataset.tooltip = label;`

::: solution
```js [vanilla/js/servers.js]
  const button = el('button', 'server-button', server.icon);
  button.type = 'button';
  button.dataset.tooltip = server.name;
  button.setAttribute('aria-label', server.name);
```

```js [vanilla/js/chat.js]
function createActionButton(action, iconName, label, extraClass) {
  const button = el('button', 'icon-button');
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.tooltip = label;
  button.setAttribute('aria-label', label);
  // ...rest unchanged...
}
```
:::

### Step 6 — Write `js/tooltips.js`

Create `vanilla/js/tooltips.js`.

- `showTooltip(target)` copies the text, un-hides the tooltip **before** measuring it (a hidden element has no size; same lesson as Lesson 24), then computes a position. Server-rail icons get the tooltip to their right (`rect.right + 12`, vertically centred); everything else gets it above, horizontally centred. Finally `Math.max/min` keep it inside the window.
- `hideTooltip()` is exported: `main.js` calls it after each render, because a re-render replaces elements and no `mouseout` would ever arrive for a deleted button.
- `setupTooltips()` adds the four document-level listeners. On `mouseover`, if you are not over a `[data-tooltip]` element we hide the tooltip.

::: solution
```js [vanilla/js/tooltips.js]
// Tooltips: any element with a data-tooltip attribute shows its text on hover or focus.
// One shared tooltip element is moved next to whatever you're pointing at.

const tooltip = document.querySelector('#tooltip');

function showTooltip(target) {
  tooltip.textContent = target.dataset.tooltip;
  tooltip.hidden = false;
  const rect = target.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();

  // Server icons get the tooltip on their right, everything else above.
  let left;
  let top;
  if (target.closest('.server-rail')) {
    left = rect.right + 12;
    top = rect.top + rect.height / 2 - tipRect.height / 2;
  } else {
    left = rect.left + rect.width / 2 - tipRect.width / 2;
    top = rect.top - tipRect.height - 8;
  }
  left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.max(8, top)}px`;
}

export function hideTooltip() {
  tooltip.hidden = true;
}

export function setupTooltips() {
  // mouseover bubbles, so one listener on the document is enough.
  document.addEventListener('mouseover', (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target);
    } else {
      hideTooltip();
    }
  });
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target);
    }
  });
  document.addEventListener('focusout', hideTooltip);
  document.addEventListener('click', hideTooltip);
}
```
:::

### Step 7 — Write `js/menus.js`, part 1: the menu builder

Create `vanilla/js/menus.js`. First the imports, element lookups and `showMenu(items, x, y)`.

`showMenu` empties the menu, then loops over `items`. A `'separator'` string becomes a divider (`continue` skips the rest of that loop pass). Everything else becomes a button with a label, an optional icon and a click handler: close the popover, **then** run the item's function. After `showPopover()` (so it can be measured) it flips the menu to the left or upward if it would run off the window, clamps to at least 8 px from the edge, and focuses the first item so keyboard users can press <kbd>Tab</kbd> and <kbd>Enter</kbd> straight away.

::: solution
```js [vanilla/js/menus.js]
// Right-click (context) menus, plus the menus behind the server name and the settings button.
// The menu is one <div popover> that we fill with buttons each time it opens.

import { state, getActiveServer, findChannel, findMessage, getUser, CURRENT_USER_ID } from './state.js';
import { markServerRead, markRead, leaveServer, startEditing, resetDemoData } from './actions.js';
import { el, icon } from './dom.js';
import { openEmojiPicker } from './reactions.js';
import { openProfile, confirmDelete } from './modals.js';

const menu = document.querySelector('#context-menu');
const serverList = document.querySelector('#server-list');
const channelList = document.querySelector('#channel-list');
const messageList = document.querySelector('#message-list');
const memberList = document.querySelector('#member-list');
const sidebarHeader = document.querySelector('.sidebar-header');
const settingsButton = document.querySelector('#settings-button');
const composerInput = document.querySelector('#composer-input');

// items: [{ label, icon, danger, run }] — or the string 'separator'
export function showMenu(items, x, y) {
  menu.replaceChildren();
  for (const item of items) {
    if (item === 'separator') {
      menu.append(el('div', 'menu-separator'));
      continue;
    }
    const button = el('button', 'menu-item');
    button.type = 'button';
    button.append(el('span', '', item.label));
    if (item.icon) {
      button.append(icon(item.icon));
    }
    if (item.danger) {
      button.classList.add('danger');
    }
    button.addEventListener('click', () => {
      menu.hidePopover();
      item.run();
    });
    menu.append(button);
  }

  menu.showPopover();
  // Keep the whole menu inside the window: open upwards or leftwards if needed.
  let left = x;
  let top = y;
  if (left + menu.offsetWidth > window.innerWidth - 8) {
    left = x - menu.offsetWidth;
  }
  if (top + menu.offsetHeight > window.innerHeight - 8) {
    top = y - menu.offsetHeight;
  }
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
  menu.querySelector('.menu-item').focus();
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch((error) => {
    console.warn('Could not copy to the clipboard.', error);
  });
}
```
:::

### Step 8 — `menus.js`, part 2: the menus as data

Below `copyText`, add one function per kind of menu. Each returns an array of items, and none of them touches the DOM:

- `serverMenu(serverId)`: Mark As Read, Copy Server Name, a separator, Leave Server (danger).
- `channelMenu(channelId)`: voice channels have nothing to "mark as read", so Mark As Read is added only for text channels.
- `messageMenu(messageId, anchor)`: everyone gets Add Reaction and Copy Text. If the message is yours there are two more, plus a separator.
- `userMenu(userId)`: Profile and Mention (inserts `@Name ` into the composer using the `setRangeText` trick from Lesson 24).
- `settingsMenu()`: My Profile and Reset Demo Data.

Pay attention to `run: () => markServerRead(serverId)`. The arrow function **remembers** `serverId`, and runs only when the item is clicked. For Reset Demo Data we pass the function itself, `run: resetDemoData`, with no parentheses: calling it right there would wipe your data while building the menu!

::: solution
```js [vanilla/js/menus.js]
// ---------- Menus for each kind of thing ----------

function serverMenu(serverId) {
  const server = state.servers.find((s) => s.id === serverId);
  return [
    { label: 'Mark As Read', icon: 'check', run: () => markServerRead(serverId) },
    { label: 'Copy Server Name', icon: 'copy', run: () => copyText(server.name) },
    'separator',
    { label: 'Leave Server', icon: 'leave', danger: true, run: () => leaveServer(serverId) },
  ];
}

function channelMenu(channelId) {
  const channel = findChannel(channelId);
  const items = [];
  if (channel.type === 'text') {
    items.push({ label: 'Mark As Read', icon: 'check', run: () => markRead(channelId) });
  }
  items.push({ label: 'Copy Channel Name', icon: 'copy', run: () => copyText(channel.name) });
  return items;
}

function messageMenu(messageId, anchor) {
  const message = findMessage(messageId);
  const items = [
    { label: 'Add Reaction', icon: 'reaction-add', run: () => openEmojiPicker(anchor, { type: 'reaction', messageId: messageId }) },
    { label: 'Copy Text', icon: 'copy', run: () => copyText(message.content) },
  ];
  if (message.authorId === CURRENT_USER_ID) {
    items.push({ label: 'Edit Message', icon: 'edit', run: () => startEditing(messageId) });
    items.push('separator');
    items.push({ label: 'Delete Message', icon: 'trash', danger: true, run: () => confirmDelete(message, false) });
  }
  return items;
}

function userMenu(userId) {
  const user = getUser(userId);
  return [
    { label: 'Profile', icon: 'user', run: () => openProfile(userId) },
    {
      label: 'Mention',
      icon: 'at',
      run: () => {
        composerInput.setRangeText(`@${user.displayName} `, composerInput.selectionStart, composerInput.selectionEnd, 'end');
        composerInput.focus();
      },
    },
  ];
}

function settingsMenu() {
  return [
    { label: 'My Profile', icon: 'user', run: () => openProfile(CURRENT_USER_ID) },
    'separator',
    { label: 'Reset Demo Data', icon: 'trash', danger: true, run: resetDemoData },
  ];
}
```
:::

### Step 9 — `menus.js`, part 3: the listeners

At the end of `menus.js`, add `setupMenus()`. Each area gets a `contextmenu` listener that finds the target with `closest`, calls `event.preventDefault()`, and calls `showMenu` with the right items at `event.clientX/clientY`.

The message list is the tricky one: a click on an avatar or name (anything with `data-user-id`) gets the **user** menu; otherwise a click on a message gets the **message** menu, but not when the target is the edit textarea, so you can still right-click and paste while editing.

The server header and the settings cog open their menus on a normal **click**. There is no mouse position to use, so we place the menu from the button's `getBoundingClientRect()`.

::: solution
```js [vanilla/js/menus.js]
// ---------- Setup ----------

export function setupMenus() {
  serverList.addEventListener('contextmenu', (event) => {
    const item = event.target.closest('.server-item');
    if (item) {
      event.preventDefault(); // don't show the browser's own menu
      showMenu(serverMenu(item.dataset.serverId), event.clientX, event.clientY);
    }
  });

  channelList.addEventListener('contextmenu', (event) => {
    const item = event.target.closest('.channel-item');
    if (item) {
      event.preventDefault();
      showMenu(channelMenu(item.dataset.channelId), event.clientX, event.clientY);
    }
  });

  messageList.addEventListener('contextmenu', (event) => {
    const userButton = event.target.closest('[data-user-id]');
    const item = event.target.closest('.message');
    if (userButton) {
      event.preventDefault();
      showMenu(userMenu(userButton.dataset.userId), event.clientX, event.clientY);
    } else if (item && !event.target.closest('.edit-input')) {
      event.preventDefault();
      showMenu(messageMenu(item.dataset.messageId, item), event.clientX, event.clientY);
    }
  });

  memberList.addEventListener('contextmenu', (event) => {
    const member = event.target.closest('.member');
    if (member) {
      event.preventDefault();
      showMenu(userMenu(member.dataset.userId), event.clientX, event.clientY);
    }
  });

  sidebarHeader.addEventListener('click', () => {
    const rect = sidebarHeader.getBoundingClientRect();
    showMenu(serverMenu(getActiveServer().id), rect.left + 10, rect.bottom + 4);
  });

  settingsButton.addEventListener('click', () => {
    const rect = settingsButton.getBoundingClientRect();
    showMenu(settingsMenu(), rect.left, rect.top - 4);
  });
}
```
:::

### Step 10 — Start it in `main.js`

In `vanilla/js/main.js`: import `setupMenus` from `./menus.js` and `setupTooltips, hideTooltip` from `./tooltips.js` (after the `setupModals` import). In `render()`, add `hideTooltip();` as the last line. In `start()`, call `setupMenus();` and `setupTooltips();` after `setupModals();`.

::: solution
```js [vanilla/js/main.js]
import { setupModals } from './modals.js';
import { setupMenus } from './menus.js';
import { setupTooltips, hideTooltip } from './tooltips.js';

// ...in render(), after renderUserPanel();
  hideTooltip();

// ...in start(), after setupModals();
  setupMenus();
  setupTooltips();
```
:::

### Step 11 — Try everything

Hover the icons in every corner of the app; <kbd>Tab</kbd> to a button and see the tooltip appear on focus. Right-click a server, a channel, one of your messages, someone else's message, a name and a member. Right-click near the bottom-right of the window: the menu opens upward and leftward instead of falling off the screen. Use Copy Text, then paste into the composer. Click the cog and choose **Reset Demo Data**.

<!-- no-solution: trying the feature out, nothing to type -->

## ✅ Checkpoint

- [ ] Hovering or tabbing to any icon button shows a tooltip; server icons show theirs on the right, the rest above.
- [ ] Right-clicking a message shows your menu, not the browser's; your own messages have Edit Message and Delete Message, others don't.
- [ ] Right-clicking a server shows Mark As Read, Copy Server Name and Leave Server (disabled in effect when only one server remains).
- [ ] The menu stays inside the window, even when you right-click at the very bottom-right.
- [ ] Clicking outside the menu or pressing <kbd>Esc</kbd> closes it. Choosing an item closes it and does the action.
- [ ] Copy Text puts the message text on the clipboard (paste it to check).
- [ ] Clicking the server name or the cog opens a menu under/above it.
- [ ] Reset Demo Data reloads the page with the original messages and servers.
- [ ] DevTools: Elements shows `#context-menu` refilled with `<button class="menu-item">` elements on each right-click. Application → Local Storage: the saved entry disappears after Reset Demo Data (and is re-created by the next change).

## 🐛 Common mistakes

**The browser's normal right-click menu still appears.** You forgot `event.preventDefault()`, or your `closest(...)` selector didn't match (so the handler never reached it). Add a `console.log` at the top of the handler.

**Menu items do nothing, or "Reset Demo Data" fires as soon as I right-click.** `run` must hold a *function*. `run: resetDemoData()` (with parentheses) calls it immediately and stores its result. Write `run: resetDemoData` or `run: () => something(x)`.

**The tooltip flickers.** The tooltip is intercepting the mouse. Make sure `.tooltip` has `pointer-events: none`.

**The tooltip or the menu has no background and is hard to read.** `--bg-floating` is missing or misspelled in `theme.css` (Step 1).

**The menu opens in the wrong place or at the top-left of the window.** Measure *after* `showPopover()` (hidden elements have size 0), and make sure you set both `style.left` and `style.top` with `px`.

**Copy Text does nothing and the Console warns "Could not copy to the clipboard".** The page may not be a secure context (check the address starts with `http://127.0.0.1` or `http://localhost`, or `https://`), or the browser blocked clipboard access. The warning's second part shows the real reason.

## 📝 Quiz

::: quiz
What does this print?

```js
const items = [
  { label: 'Hi', run: () => 'hello' },
];
console.log(items[0].run());
```

- [ ] `() => 'hello'`
- [x] `hello`
- [ ] `undefined`
- [ ] `Hi`

> `items[0].run` is a function stored in an object; adding `()` calls it, and the arrow function returns `'hello'`. Without the parentheses you'd get the function itself.
:::

::: quiz
Why does the tooltip use `pointer-events: none`?

- [ ] So it can't be copied
- [x] So the mouse "passes through" it and hovering the button underneath keeps working
- [ ] To make it invisible
- [ ] To make it appear faster

> If the tooltip sat under the pointer and received mouse events, the button would lose the hover, the tooltip would hide, the button would get the hover again, and so on: flickering.
:::

::: quiz
You right-click at `clientX = 900, clientY = 700` in a 1000 × 720 window, and the menu is 188 × 150 px. What does the code do?

- [ ] Places the menu at left 900, top 700, partly off-screen
- [x] Moves it left and up so it fits in the window
- [ ] Doesn't show it
- [ ] Scrolls the page

> `900 + 188` is more than `1000 - 8`, so `left` becomes `x - menu.offsetWidth`; `700 + 150` is more than `720 - 8`, so `top` becomes `y - menu.offsetHeight`.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add context menus and tooltips"
git push
```
