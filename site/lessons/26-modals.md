---
lesson: 26
title: Modals with <dialog>
---

# Lesson 26 — Modals with `<dialog>`

A **modal** is a box that appears on top of the page and demands your attention before you can do anything else. You'll build three: "create a server", a user profile card and a "delete message?" confirmation that replaces the ugly `confirm()` from Lesson 23. The browser's built-in `<dialog>` element does most of the hard work.

## 🎯 Goal

Clicking the green **+** in the server rail dims the whole app and shows a "Customize your server" form with a name field, an optional icon field and **Back** / **Create** buttons. Create adds a new server to the rail and switches to it. Clicking a person's avatar, name or member-list entry opens their profile card. Clicking the trash icon on your message opens a "Delete Message" dialog that shows the message.

![The app dimmed by a dark overlay with a "Customize your server" form in the middle: an explanatory sentence, a Server name box, an Icon box, and Back and Create buttons](/screenshots/lesson-26.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### The `<dialog>` element

`<dialog>` is an HTML element for dialog boxes. It is **hidden by default**. You show it from JavaScript:

```js
const dialog = document.querySelector('#my-dialog');
dialog.showModal();   // open as a modal
dialog.close();       // close it
```

`showModal()` does a lot for free:

- the dialog appears in the **top layer** (the same layer the emoji popover from Lesson 24 uses), centred in the window;
- everything else on the page becomes **inert**: you can't click, tab to or select it;
- keyboard focus moves into the dialog;
- pressing <kbd>Esc</kbd> closes it;
- a `::backdrop` pseudo-element appears behind it, covering the page. You style the dim layer with CSS: `.modal::backdrop { background-color: rgba(0, 0, 0, 0.7); }`.

Before `<dialog>` every one of those had to be written by hand (and was often done badly for keyboard and screen-reader users). See [`<dialog>` on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) (MDN lists it as widely available) and [`showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal).

### Forms that close dialogs: `method="dialog"` and `returnValue`

A form normally sends data to a server when submitted. With `<form method="dialog">` inside a dialog, submitting does something simpler: **it closes the dialog**, and sets the dialog's `returnValue` to the `value` of the button that was clicked.

```html
<dialog id="d">
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```js
const dialog = document.querySelector('#d');
dialog.addEventListener('close', () => {
  console.log(dialog.returnValue); // "cancel" or "delete"
});
```

So one `close` event handler can tell *how* the dialog was closed. (If it was closed with <kbd>Esc</kbd> or `dialog.close()` without an argument, `returnValue` stays whatever it was before, which is why we reset it to `''` before every `showModal()`.) Docs: [`returnValue`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/returnValue), [`close` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close_event).

### Form validation attributes

HTML can check input for you before the form is submitted:

| Attribute | Meaning |
| --- | --- |
| `required` | the field may not be empty; the browser shows a message and blocks submit |
| `maxlength="40"` | the user can't type more than 40 characters (technically UTF-16 code units, so one emoji can count as 2) |
| `autocomplete="off"` | don't offer the browser's saved suggestions |
| `type="submit"` on a `<button>` | clicking it submits the form (this is the default for buttons inside a form) |

With `method="dialog"` the validation still runs first: pressing Create with an empty required name shows the browser's message and the dialog stays open.

### Reading a form: `FormData`

`new FormData(form)` collects the values of every named field in a form. Each `<input>` needs a `name` attribute; then `data.get('serverName')` returns what was typed. `form.reset()` puts every field back to its starting value.

```js
const data = new FormData(createForm);
const name = data.get('serverName'); // the text in <input name="serverName">
```

See [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

### Clicking the backdrop to close

A modal doesn't close when you click outside by default. The common trick: the `::backdrop` is not a separate element, so a click on it is reported as a click on the **dialog element itself** (`event.target === dialog`). A click on content inside the dialog has a child element as its `target`. So:

```js
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});
```

This is a simple approach, not a perfect one: a click on any part of the dialog's own box that isn't covered by a child (for example the margin around the profile card) also counts. It's good enough here.

### Making initials

When a new server has no emoji icon we show its initials: "Frontend Friends" becomes "FF". The steps, with Python equivalents:

| Step | JavaScript | Python |
| --- | --- | --- |
| split into words | `name.trim().split(/\s+/)` | `name.strip().split()` |
| first letter, upper case | `word[0].toUpperCase()` | `word[0].upper()` |
| glue together | `letters.join('')` | `''.join(letters)` |
| at most 3 | `.slice(0, 3)` | `[:3]` |

Note that `join` is a method of the **array**: `['F', 'F'].join('')` gives `'FF'`. In Python it's a method of the separator string.

### A little more CSS

- `calc()` does arithmetic with mixed units: `max-width: calc(100vw - 32px)` means "the full window width minus 32 px". `vw` is a unit equal to 1% of the viewport's width. We need it so the modal never touches the screen edge on a phone.
- `border-top`, `border-width` and `<blockquote>` (an HTML element for quoted text, used here for the message preview) come up in the styling.

## 🛠️ Build it

Files you'll touch: `css/theme.css`, `css/base.css`, `css/overlays.css`, `index.html`, `js/modals.js` (new), `js/actions.js`, `js/chat.js`, `js/members.js`, `js/user-panel.js`, `js/main.js`.

### Step 1 — A background colour for modals (`theme.css`)

The modal CSS below uses a variable named `--bg-modal`. Add it to `vanilla/css/theme.css`, in the "Backgrounds" group of `:root`, after `--bg-input`:

```css [vanilla/css/theme.css]
  --bg-modal: #313338;         /* dialogs */
```

(Same colour as `--bg-primary`.) If you skip this, `var(--bg-modal)` has no value and the dialogs have no background at all, so the page shows through them.

::: warning Check this step against your own copy
The lesson's reference solution may not contain this line yet. If you compare your files with the reference solution, a missing `--bg-modal` there is a bug in the reference, not in your code: keep the line.
:::

::: solution
```css [vanilla/css/theme.css]
  --bg-input: #383a40;         /* message composer */
  --bg-modal: #313338;         /* dialogs */
```
:::

### Step 2 — Button styles (`base.css`)

Open `vanilla/css/base.css` and add this at the end. It defines `.button` (shared size and font) and three variants. Nothing here is new except that two classes are combined on one element: `class="button button-primary"`.

::: solution
```css [vanilla/css/base.css]
/* ---------- Buttons ---------- */

.button {
  min-width: 96px;
  height: 38px;
  padding: 2px 16px;
  border-radius: var(--radius-small);
  font-size: 14px;
  font-weight: 500;
  color: white;
  transition: background-color 0.17s ease;
}

.button-primary {
  background-color: var(--brand-accent);
}

.button-primary:hover {
  background-color: color-mix(in srgb, var(--brand-accent), black 15%);
}

.button-secondary {
  background-color: transparent;
}

.button-secondary:hover {
  text-decoration: underline;
}

.button-danger {
  background-color: #da373c;
}

.button-danger:hover {
  background-color: #a12829;
}
```
:::

### Step 3 — The three dialogs in `index.html`

Open `vanilla/index.html`. Just before `</body>`, after the emoji picker `div`, add three `<dialog>` elements. Notes while you type:

- **Create server**: the form has `method="dialog"`. The two text inputs have `name`s (for `FormData`); the first is `required` with a `maxlength`. "Back" is `type="button"` so it does **not** submit; "Create" is `type="submit"` with `value="create"`.
- **Profile**: no form data. The body is empty placeholders that JavaScript fills each time. The close button sits in its own tiny `method="dialog"` form: clicking it closes the dialog without any JavaScript.
- **Delete**: two buttons with values `cancel` and `delete`. Because they are inside a `method="dialog"` form and are submit buttons by default, either one closes the dialog and sets `returnValue`.

::: solution
```html [vanilla/index.html]
    <!-- Modal dialogs: hidden until JavaScript calls showModal() -->
    <dialog class="modal" id="create-server-dialog">
      <form method="dialog" class="modal-form" id="create-server-form">
        <h2 class="modal-title">Customize your server</h2>
        <p class="modal-text">Give your new server a personality with a name and an icon. You can always change it later.</p>
        <label class="field">
          <span class="field-label">Server name</span>
          <input class="field-input" name="serverName" required maxlength="40" autocomplete="off">
        </label>
        <label class="field">
          <span class="field-label">Icon (an emoji, or leave empty for initials)</span>
          <input class="field-input" name="serverIcon" maxlength="2" autocomplete="off">
        </label>
        <div class="modal-actions">
          <button class="button button-secondary" type="button" value="cancel" id="create-server-cancel">Back</button>
          <button class="button button-primary" type="submit" value="create">Create</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal profile-modal" id="profile-dialog">
      <div class="profile-banner" id="profile-banner"></div>
      <div class="avatar profile-avatar" id="profile-avatar"><span class="status-dot"></span></div>
      <div class="profile-body">
        <h2 class="profile-name" id="profile-name"></h2>
        <p class="profile-username" id="profile-username"></p>
        <p class="profile-custom-status" id="profile-custom-status"></p>
        <h3 class="profile-heading">About me</h3>
        <p class="profile-bio" id="profile-bio"></p>
        <h3 class="profile-heading">Role</h3>
        <p class="profile-role" id="profile-role"></p>
      </div>
      <form method="dialog">
        <button class="icon-button modal-close" aria-label="Close">
          <svg class="icon"><use href="assets/icons.svg#close"></use></svg>
        </button>
      </form>
    </dialog>

    <dialog class="modal" id="delete-dialog">
      <form method="dialog" class="modal-form">
        <h2 class="modal-title">Delete Message</h2>
        <p class="modal-text">Are you sure you want to delete this message?</p>
        <blockquote class="delete-preview" id="delete-preview"></blockquote>
        <div class="modal-actions">
          <button class="button button-secondary" value="cancel">Cancel</button>
          <button class="button button-danger" value="delete">Delete</button>
        </div>
      </form>
    </dialog>
  </body>
```
:::

### Step 4 — Style the modals (`overlays.css`)

Open `vanilla/css/overlays.css`. Update the comment on the first line to `/* Things that float above the app: the emoji picker and modals. */`. Then add to the end of the file.

**Part 1: type this.** It is the heart of the modal look: a box with a size limit and the dim `::backdrop`.

```css [vanilla/css/overlays.css]
/* ---------- Modals (<dialog>) ---------- */

.modal {
  width: 440px;
  max-width: calc(100vw - 32px);
  padding: 0;
  border: none;
  border-radius: var(--radius);
  background-color: var(--bg-modal);
  color: var(--text-normal);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* The dark layer behind a modal */
.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}
```

**Part 2: paste this** below it. It's ordinary layout and text styling (Lessons 4-10), plus the profile card:

::: starter
```css [vanilla/css/overlays.css]
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 0;
}

.modal-title {
  color: var(--text-strong);
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.modal-text {
  color: var(--text-muted);
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.field-input {
  height: 40px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-small);
  background-color: var(--bg-tertiary);
}

.field-input:focus {
  outline: 2px solid var(--brand-accent);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin: 0 -16px;
  padding: 16px;
  background-color: var(--bg-secondary);
}

.delete-preview {
  margin: 0;
  padding: 12px;
  border-radius: var(--radius-small);
  background-color: var(--bg-secondary);
  box-shadow: 0 0 0 1px var(--bg-tertiary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---------- User profile modal ---------- */

.profile-modal {
  position: relative;
  width: 340px;
  overflow: hidden;
  --status-ring: var(--bg-modal);
}

.profile-banner {
  height: 60px;
  background-color: var(--avatar-color, var(--gray));
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin: -40px 0 0 16px;
  font-size: 32px;
  box-shadow: 0 0 0 6px var(--bg-modal);
}

.profile-avatar .status-dot {
  width: 22px;
  height: 22px;
  border-width: 4px;
}

.profile-body {
  margin: 12px 16px 16px;
  padding: 12px;
  border-radius: var(--radius);
  background-color: var(--bg-tertiary);
}

.profile-name {
  color: var(--text-strong);
  font-size: 20px;
  font-weight: 700;
}

.profile-username {
  color: var(--text-normal);
  font-size: 14px;
}

.profile-custom-status {
  margin-top: 8px;
  font-size: 14px;
}

.profile-heading {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--divider);
  color: var(--text-strong);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.profile-bio,
.profile-role {
  margin-top: 4px;
  font-size: 14px;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
}
```
:::

<!-- no-solution: part 1 is shown inline above, part 2 is pasted -->

### Step 5 — The `createServer` action (`actions.js`)

At the end of `vanilla/js/actions.js` add a new "Servers" section. Read it slowly:

1. `crypto.randomUUID()` makes a unique id (Lesson 22). The new channels' ids are built from it with template literals so they are unique too.
2. The initials come from the name, as in *New concepts*.
3. `icon: iconText || initials` uses the typed icon if it's not empty, otherwise the initials. `iconIsEmoji` is `true` when an icon was typed (that decides the font size in the rail).
4. A server needs the same shape as the ones from `servers.json`: a role list, a member list with you in it, and categories with channels (one text, one voice).
5. Push it, make it the active server, and `update()`.

::: solution
```js [vanilla/js/actions.js]
// ---------- Servers ----------

export function createServer(name, iconText) {
  const id = crypto.randomUUID();
  const words = name.trim().split(/\s+/);
  const initials = words.map((word) => word[0].toUpperCase()).join('').slice(0, 3);
  const server = {
    id: id,
    name: name.trim(),
    icon: iconText || initials,
    iconIsEmoji: iconText !== '',
    roles: [],
    members: [{ userId: CURRENT_USER_ID, roleId: null }],
    categories: [
      {
        id: `${id}-text`,
        name: 'Text Channels',
        channels: [{ id: `${id}-general`, name: 'general', type: 'text', topic: '', unread: false, mentions: 0 }],
      },
      {
        id: `${id}-voice`,
        name: 'Voice Channels',
        channels: [{ id: `${id}-voice-general`, name: 'General', type: 'voice', voiceUserIds: [] }],
      },
    ],
  };
  state.servers.push(server);
  state.activeServerId = id;
  update();
}
```
:::

### Step 6 — Write `js/modals.js`

Create `vanilla/js/modals.js`. Walk through it in sections:

- **Lookups** at the top: each dialog and the pieces you need.
- `openCreateServer()`: empty the form (`reset()`), clear `returnValue`, then `showModal()`.
- `openProfile(userId)`: finds the user, their member entry in the active server, and their role. `member && server.roles.find(...)` is a guard: if `member` is `undefined` (a user not in this server) the expression stops there. Then it writes each piece of data into the dialog with `textContent` (never `innerHTML`: names and bios are user text) and calls `showModal()`. The avatar is rebuilt by `createProfileAvatar` so the status dot is right.
- `confirmDelete(message, skipConfirm)`: Shift+click (`skipConfirm`) deletes immediately, otherwise we remember the message in `messageToDelete`, show its text, and open the dialog. The deleting itself happens later, in the `close` handler, depending on `returnValue`.
- `closeOnBackdropClick(dialog)`: the trick from *New concepts*.
- `setupModals()`: wires everything. The create dialog's `close` handler reads the form with `FormData` only when `returnValue === 'create'`. `.trim()` removes stray spaces around the icon.

::: solution
```js [vanilla/js/modals.js]
// Modals built with the <dialog> element: create a server, view a profile, confirm a delete.

import { getUser, getActiveServer, getMember } from './state.js';
import { createServer, deleteMessage } from './actions.js';
import { avatar } from './dom.js';

const createDialog = document.querySelector('#create-server-dialog');
const createForm = document.querySelector('#create-server-form');
const createCancel = document.querySelector('#create-server-cancel');
const addServerButton = document.querySelector('.add-server-button');

const profileDialog = document.querySelector('#profile-dialog');
const deleteDialog = document.querySelector('#delete-dialog');
const deletePreview = document.querySelector('#delete-preview');

let messageToDelete = null;

// ---------- Create server ----------

export function openCreateServer() {
  createForm.reset();
  createDialog.returnValue = '';
  createDialog.showModal();
}

// ---------- User profile ----------

export function openProfile(userId) {
  const user = getUser(userId);
  const server = getActiveServer();
  const member = getMember(server, userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);

  profileDialog.style.setProperty('--avatar-color', user.avatarColor);
  profileDialog.querySelector('#profile-avatar').replaceWith(createProfileAvatar(user));
  profileDialog.querySelector('#profile-name').textContent = user.displayName;
  profileDialog.querySelector('#profile-username').textContent = user.username;
  profileDialog.querySelector('#profile-custom-status').textContent = user.customStatus;
  profileDialog.querySelector('#profile-bio').textContent = user.bio;
  profileDialog.querySelector('#profile-role').textContent = role ? role.name : 'No roles';
  profileDialog.showModal();
}

function createProfileAvatar(user) {
  const element = avatar(user, true);
  element.classList.add('profile-avatar');
  element.id = 'profile-avatar';
  return element;
}

// ---------- Delete confirmation ----------

// Shift+click deletes right away, like in the real app.
export function confirmDelete(message, skipConfirm) {
  if (skipConfirm) {
    deleteMessage(message.id);
    return;
  }
  messageToDelete = message;
  deletePreview.textContent = message.content;
  deleteDialog.returnValue = '';
  deleteDialog.showModal();
}

// ---------- Setup ----------

// Clicking the dark backdrop closes a dialog. The click "lands" on the
// <dialog> element itself only when it's outside the dialog's content.
function closeOnBackdropClick(dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

export function setupModals() {
  addServerButton.addEventListener('click', openCreateServer);
  createCancel.addEventListener('click', () => createDialog.close());

  createDialog.addEventListener('close', () => {
    if (createDialog.returnValue === 'create') {
      const data = new FormData(createForm);
      createServer(data.get('serverName'), data.get('serverIcon').trim());
    }
  });

  deleteDialog.addEventListener('close', () => {
    if (deleteDialog.returnValue === 'delete' && messageToDelete) {
      deleteMessage(messageToDelete.id);
    }
    messageToDelete = null;
  });

  closeOnBackdropClick(createDialog);
  closeOnBackdropClick(profileDialog);
  closeOnBackdropClick(deleteDialog);
}
```
:::

### Step 7 — Open profiles from the member list and user panel

In `vanilla/js/members.js`: import `openProfile` from `./modals.js`, and append `setupMembers()`: one delegated click listener on `memberList`.

In `vanilla/js/user-panel.js`: add `CURRENT_USER_ID` to the state import, import `openProfile`, and add `setupUserPanel()` that opens *your* profile when the user panel button is clicked.

::: solution
```js [vanilla/js/members.js]
import { state, getActiveServer, getUser } from './state.js';
import { el, avatar } from './dom.js';
import { openProfile } from './modals.js';

// ...at the end of the file:

export function setupMembers() {
  memberList.addEventListener('click', (event) => {
    const member = event.target.closest('.member');
    if (member) {
      openProfile(member.dataset.userId);
    }
  });
}
```

```js [vanilla/js/user-panel.js]
import { getCurrentUser, CURRENT_USER_ID } from './state.js';
import { avatar } from './dom.js';
import { openProfile } from './modals.js';

// ...renderUserPanel unchanged...

export function setupUserPanel() {
  document.querySelector('#user-panel-profile').addEventListener('click', () => openProfile(CURRENT_USER_ID));
}
```
:::

### Step 8 — Use the dialogs from the message feed (`chat.js`)

In `vanilla/js/chat.js`:

1. In the imports: add `findMessage` to the `./state.js` import; **remove** `deleteMessage` from the `./actions.js` import (chat.js no longer deletes directly); add `import { openProfile, confirmDelete } from './modals.js';`.
2. In `setupChat`'s click listener, add a new block at the very top: avatars and author names already carry `data-user-id` (from Lesson 20), so `closest('[data-user-id]')` finds them and opens the profile. `return` stops the rest of the handler.
3. Replace the whole `else if (action === 'delete')` body with a single call to `confirmDelete`.

::: solution
```js [vanilla/js/chat.js]
import { state, getActiveChannel, getActiveServer, getMessages, getUser, getRoleColor, mentionsMe, findMessage, CURRENT_USER_ID } from './state.js';
import { startEditing, cancelEditing, saveEdit, toggleReaction } from './actions.js';
import { el, icon, avatar } from './dom.js';
import { renderMarkdown } from './markdown.js';
import { openEmojiPicker } from './reactions.js';
import { openProfile, confirmDelete } from './modals.js';
```

```js [vanilla/js/chat.js]
export function setupChat() {
  messageList.addEventListener('click', (event) => {
    // Clicking an avatar or a name opens that person's profile
    const userButton = event.target.closest('[data-user-id]');
    if (userButton) {
      openProfile(userButton.dataset.userId);
      return;
    }
    const messageItem = event.target.closest('.message');
    if (!messageItem) {
      return;
    }
    const messageId = messageItem.dataset.messageId;

    // ...reaction handling unchanged...

    const action = actionButton.dataset.action;
    if (action === 'react') {
      openEmojiPicker(actionButton, { type: 'reaction', messageId: messageId });
    } else if (action === 'edit') {
      startEditing(messageId);
    } else if (action === 'delete') {
      confirmDelete(findMessage(messageId), event.shiftKey);
    } else if (action === 'cancel-edit') {
      cancelEditing();
    } else if (action === 'save-edit') {
      saveEdit();
    }
  });

  // ...input and keydown listeners unchanged...
}
```
:::

### Step 9 — Start it all in `main.js`

In `vanilla/js/main.js`, change the two imports for members and user panel to also import `setupMembers` and `setupUserPanel`, add `import { setupModals } from './modals.js';`, and call the three new setup functions after `setupEmojiPicker();`.

::: solution
```js [vanilla/js/main.js]
import { renderMembers, setupMembers } from './members.js';
import { renderUserPanel, setupUserPanel } from './user-panel.js';
import { setupModals } from './modals.js';

// ...inside start():
  setupEmojiPicker();
  setupMembers();
  setupUserPanel();
  setupModals();

  onChange(render);
  render();
```
:::

### Step 10 — Try it

Reload and click **+** in the server rail. Press Create with the name empty (the browser should complain). Type "Book Club", leave the icon empty: you get a server with the initials `BC`. Create another with the icon `📚`. Open profiles from an avatar, a name, the member list and the bottom-left panel. Open the delete dialog; press <kbd>Esc</kbd>, click the backdrop, and use both buttons. Finally try <kbd>Shift</kbd>+click on trash.

<!-- no-solution: trying the feature out, nothing to type -->

## ✅ Checkpoint

- [ ] **+** opens the "Customize your server" modal with the page dimmed; the dialog has a solid background.
- [ ] While a modal is open you can't click or tab to the page behind it; <kbd>Esc</kbd> closes it.
- [ ] Create with an empty name is blocked by the browser; with a name it adds a server, selects it and closes the modal.
- [ ] No icon gives initials (up to 3 letters); an emoji icon shows the emoji.
- [ ] Clicking a message avatar, an author name, a member list entry or the bottom-left panel opens a profile card with the right name, bio and role.
- [ ] The delete dialog shows the message text; **Cancel** keeps it, **Delete** removes it, <kbd>Shift</kbd>+click skips the dialog.
- [ ] Clicking the dark backdrop closes any dialog.
- [ ] DevTools: with a modal open, the Elements panel shows `<dialog open>` and a `::backdrop` entry. In the Console, `document.querySelector('#delete-dialog').returnValue` after clicking Cancel prints `cancel`.

## 🐛 Common mistakes

**The dialog is see-through, or has no background.** `--bg-modal` isn't defined (Step 1) or is misspelled. In DevTools the Styles pane shows the `var(--bg-modal)` declaration as invalid.

**Nothing happens when I click +.** `setupModals()` isn't called in `main.js`, or the query `.add-server-button` found nothing (it returns `null`, and `addEventListener` on `null` throws a `TypeError` in the Console).

**The server gets created even when I press Back or Esc.** You create the server in a click handler instead of the `close` handler's `returnValue === 'create'` check. Also check that you reset `returnValue = ''` before `showModal()`, otherwise an old `'create'` lingers.

**`data.get('serverName')` is `null`.** The input has no `name` attribute, or the name in the HTML and in JavaScript differ (`serverName`). `FormData` ignores fields without a name.

**The Back button submits the form and closes without validating.** It must be `type="button"`. Buttons inside forms default to `submit`.

**Clicking inside the dialog closes it.** In `closeOnBackdropClick`, compare `event.target === dialog` (three equals). With `event.currentTarget` or a missing check, every click would close it.

## 📝 Quiz

::: quiz
What happens when you click the **Cancel** button below?

```html
<dialog id="d">
  <form method="dialog">
    <button value="cancel">Cancel</button>
  </form>
</dialog>
```

- [ ] Nothing: a button needs a click handler
- [ ] The page reloads
- [x] The dialog closes and `d.returnValue` becomes `"cancel"`
- [ ] The dialog closes and `returnValue` is empty

> A button in a form is a submit button by default. A `method="dialog"` form closes its dialog on submit and stores the clicked button's `value` in `returnValue`.
:::

::: quiz
Which of these does `showModal()` do for you without extra code?

- [ ] It sends the form to the server
- [x] It puts the dialog in the top layer, makes the rest of the page inert, and lets <kbd>Esc</kbd> close it
- [ ] It saves the dialog's state in `localStorage`
- [ ] It makes the dialog draggable

> That bundle of behaviours (top layer, inert page, focus handling, Esc, `::backdrop`) is the point of `<dialog>`.
:::

::: quiz
What does this print?

```js
const name = 'book  club night';
const initials = name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).join('').slice(0, 2);
console.log(initials);
```

- [ ] `B`
- [ ] `BCN`
- [x] `BC`
- [ ] `book`

> Splitting on runs of spaces gives `['book', 'club', 'night']`; the upper-cased first letters joined are `'BCN'`; `slice(0, 2)` keeps `'BC'`.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add create-server, profile and delete dialogs"
git push
```
