---
lesson: 39
title: "Modals, context menus & tooltips"
---

# Lesson 39 — Modals, context menus & tooltips

Chat apps are full of things that float above the page: dialogs ("Delete this message?"), right-click menus, tooltips. In this lesson you rebuild all three in React, and finish a few clicks that did nothing so far (opening profiles, creating servers, leaving servers). The key idea: **in React, whether an overlay is open is just state**, and mounting a dialog *is* opening it.

## 🎯 Goal

- Right-click a message, a channel, a server icon, a member or a name: a custom menu appears at the mouse pointer.
- Click a member or an author's name: a profile dialog opens. Click the **+** at the bottom of the server rail: a "Customize your server" form opens, and submitting it creates a server.
- Clicking **Delete** on your message opens a styled confirmation dialog instead of the browser's `confirm()`.
- Hovering any icon button shows a small tooltip.

![The chat app on #general, in its normal resting state with no overlay open](/screenshots/lesson-39.png){.screenshot}

The screenshot is the resting state, so it looks like Lesson 38: overlays only appear after you interact. The Checkpoint lists each thing to try.

## 🧠 New concepts

<ConceptList />

### Overlays are state

Lesson 38's emoji picker already showed the pattern: a piece of state says what is open, and a component draws it. This lesson uses it three more times:

| State | Shape | Component |
| --- | --- | --- |
| `state.menu` | `null` or `{ kind, id, x, y }` | `ContextMenu` |
| `state.dialog` | `null` or `{ kind, id }` | `Dialogs` |
| (tooltip) | handled by a hook, see below | `Tooltip` |

`kind` says *what* was clicked (`'message'`, `'channel'`, `'server'`, `'user'`, `'settings'` for menus; `'createServer'`, `'profile'`, `'delete'` for dialogs) and `id` says *which one*. The menu also stores the pointer position `x`, `y`.

### Right-click: onContextMenu

::: os mac
On a Mac, "right-click" means a two-finger click on the trackpad, or holding <kbd>Ctrl</kbd> while you click (if your mouse has no right button).
:::

The browser fires a `contextmenu` event when you right-click (or press the menu key). React exposes it as the `onContextMenu` prop. Two details:

- Call `event.preventDefault()` to stop the browser's own menu from appearing.
- `event.clientX` and `event.clientY` are the pointer's position in the window, which is where we place our menu.

```jsx
function handleContextMenu(event) {
  event.preventDefault();
  dispatch({ type: 'openMenu', menu: { kind: 'channel', id: channel.id, x: event.clientX, y: event.clientY } });
}
```

### Menu items come from state

`ContextMenu` doesn't hard-code one menu. It looks at `menu.kind`, finds the thing with that `id`, and builds a list of items. Each item is a plain object `{ label, icon, run }`, where `run` is a function to call when it is clicked. The string `'separator'` stands for a divider line. A message menu has *Add Reaction* and *Copy Text* for everyone, and *Edit* and *Delete* only if it is your message.

The function that builds the list is named `useMenuItems`. In React, names starting with `use` mean "this function calls hooks" (here it calls `useApp()`). You'll write more of these in Lesson 40.

The menu is a **popover** again (Lesson 38): the browser closes it on <kbd>Esc</kbd> or an outside click, `onToggle` tells React, and a layout effect opens it and keeps it inside the window.

### Mounting a dialog = opening it

The plain-JS version had one `<dialog>` per modal in `index.html` and called `.showModal()` to open it. In React there's a neater way. A `Modal` component renders a `<dialog>` and, in an effect that runs when it first appears, calls `showModal()`:

```jsx
function Modal({ id, className, onClose, children, style }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);
  // ...
}
```

The parent decides whether to render the `Modal` at all: when `state.dialog` is `null`, the component returns `null` and the dialog doesn't exist. To open one, you set `state.dialog`. To close, you set it back to `null`; React removes the `<dialog>` from the page.

The browser can also close a dialog by itself (<kbd>Esc</kbd>, or a click on the dark backdrop that calls `.close()`). The dialog then fires a `close` event, which React exposes as `onClose`. We use it to set `state.dialog` back to `null`, so state and browser agree.

In development, StrictMode runs the effect twice. MDN lists `InvalidStateError` for `showModal()` only when the dialog is already open and *non-modal*, so calling it a second time on an already-open modal dialog is harmless here. If you see problems, that's the first place to look.

::: tip Python comparison
Think of `state.dialog` as a variable holding "which window is open, if any", like `current_screen = None` in a terminal UI. Instead of calling `show()` and `hide()` on windows, you assign the variable and the framework draws the right thing.
:::

### Forms with onSubmit and FormData

In Lesson 34 the composer was a *controlled* input: every keystroke went into state. A form with several fields that you only need at the end doesn't need that. Give each field a `name`, listen to the form's `onSubmit`, and read all the values at once with `FormData`:

```jsx
function handleSubmit(event) {
  event.preventDefault(); // don't reload the page
  const form = new FormData(event.currentTarget);
  const name = form.get('serverName').trim();
  // ...
}
```

`event.currentTarget` is the `<form>`. `form.get('serverName')` returns the value of the field with `name="serverName"`. The browser also handles `required` and `maxLength` before `onSubmit` fires. See MDN's [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) page.

### Wrapping imperative DOM code in an effect

Tooltips in the plain-JS app were pure DOM code: listen for `mouseover` on the whole document and position a `<div>`. We keep that code almost as is, and wrap it in an effect with a cleanup:

- A **ref** gives the effect the real tooltip `<div>`.
- The effect adds four listeners to `document`.
- The cleanup removes them.

React is not involved in *where* the tooltip is: that changes every mouse movement, and re-rendering for it would be wasteful. React only renders the empty `<div className="tooltip">` once. This is the same split as the popovers: **React for what the page contains, imperative code for things the browser does better.**

### More reducer actions

The reducer gets: `openMenu`, `closeMenu`, `openDialog`, `closeDialog`, plus `markRead`, `markServerRead`, `createServer` and `leaveServer`. Note `createServer` receives the entire new server object, with ids made by the dialog (a reducer must stay pure, Lesson 35).

::: info Vanilla vs React
Plain-JS (`vanilla/js/modals.js`): the dialog already exists in the HTML, and code opens it and listens for its `close` event:

```js
export function openCreateServer() {
  createForm.reset();
  createDialog.returnValue = '';
  createDialog.showModal();
}
```

React (`react-app/src/components/Dialogs.jsx`): the dialog doesn't exist until state asks for it, and the form's data is read when you submit:

```jsx
if (dialog.kind === 'createServer') {
  return <CreateServerDialog onClose={close} />;
}
```

There is nothing to `reset()` in React: the next time the dialog opens, it is a brand-new component with empty fields.
:::

## 🛠️ Build it

### Step 1 — A selector to find a message

`ContextMenu` and the delete dialog need to find a message by id. In `state/selectors.js`, add `findMessage` after `defaultChannelId`. It looks through the list of messages of every channel.

::: solution
```js [react-app/src/state/selectors.js]
export function findMessage(state, messageId) {
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

### Step 2 — Reducer: menus, dialogs and servers

In `state/reducer.js`:

1. Import `getChannels` too: `import { CURRENT_USER_ID, findChannel, getChannels } from './selectors.js';`
2. Add `menu: null` and `dialog: null` to the temporary UI state in `createInitialState`.
3. Add `markRead` and `markServerRead` after `setNavOpen`.
4. In `deleteMessage`, also set `dialog: null` (deleting from the confirmation dialog should close it).
5. After `toggleReaction`, add `createServer` and `leaveServer`. `leaveServer` refuses to remove the last server, so the app never has none.
6. After the picker cases, add `openMenu`, `closeMenu`, `openDialog`, `closeDialog`.

::: solution
```js [react-app/src/state/reducer.js]
import { CURRENT_USER_ID, findChannel, getChannels } from './selectors.js';

export function createInitialState(data) {
  const saved = loadSaved();
  return {
    /* ...everything else unchanged... */
    picker: null, // { onPick, rect } while the emoji picker is open
    menu: null, // { kind, id, x, y } while a context menu is open
    dialog: null, // { kind: 'createServer' | 'profile' | 'delete', id }
  };
}

export function reducer(state, action) {
  switch (action.type) {
    /* ...earlier cases unchanged... */
    case 'setNavOpen':
      return { ...state, navOpen: action.open };
    case 'markRead':
      return { ...state, servers: updateChannel(state.servers, action.channelId, { unread: false, mentions: 0 }) };
    case 'markServerRead': {
      let servers = state.servers;
      const server = state.servers.find((s) => s.id === action.serverId);
      for (const channel of getChannels(server)) {
        servers = updateChannel(servers, channel.id, { unread: false, mentions: 0 });
      }
      return { ...state, servers };
    }

    /* ...sendMessage, setTyping, setDraft, startEditing, cancelEditing, saveEdit unchanged... */
    case 'deleteMessage': {
      const messages = {};
      for (const [channelId, list] of Object.entries(state.messages)) {
        messages[channelId] = list.filter((m) => m.id !== action.messageId);
      }
      return { ...state, messages, editingMessageId: null, dialog: null };
    }

    /* ...toggleReaction unchanged... */

    // ----- Servers -----
    case 'createServer':
      return { ...state, servers: [...state.servers, action.server], dialog: null };
    case 'leaveServer':
      if (state.servers.length === 1) {
        return state; // keep at least one server
      }
      return { ...state, servers: state.servers.filter((s) => s.id !== action.serverId) };

    // ----- The emoji picker -----
    case 'openPicker':
      return { ...state, picker: { onPick: action.onPick, rect: action.rect } };
    case 'closePicker':
      return { ...state, picker: null };

    // ----- Context menus and dialogs -----
    case 'openMenu':
      return { ...state, menu: action.menu };
    case 'closeMenu':
      return { ...state, menu: null };
    case 'openDialog':
      return { ...state, dialog: action.dialog };
    case 'closeDialog':
      return { ...state, dialog: null };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```
:::

### Step 3 — Tooltips: a hook and a component

Create `hooks/useTooltips.js`. This is the vanilla `tooltips.js` moved into an effect. Read it:

- `tooltipRef.current` is the tooltip element. We start with it `hidden`.
- `show(target)` writes the text from `data-tooltip`, then measures the target and the tooltip with `getBoundingClientRect()` and positions the tooltip: to the right of a server icon, above anything else, always kept inside the window.
- `handleMouseOver` uses `event.target.closest('[data-tooltip]')`: it finds the nearest element (or ancestor) that has a `data-tooltip` attribute. One listener on `document` serves every button, because events bubble up (Lesson 15).
- Four listeners are added, and the cleanup removes the same four.

Then create `components/Tooltip.jsx`: it makes the ref, calls the hook, and renders the empty `<div>`.

::: solution
```js [react-app/src/hooks/useTooltips.js]
import { useEffect } from 'react';

// Shows the tooltip element next to anything with a data-tooltip attribute.
// This is the vanilla tooltips.js code, moved into an effect: React doesn't
// render the tooltip's position, we change the element directly through a ref.
export function useTooltips(tooltipRef) {
  useEffect(() => {
    const tooltip = tooltipRef.current;
    tooltip.hidden = true;

    function show(target) {
      tooltip.textContent = target.dataset.tooltip;
      tooltip.hidden = false;
      const rect = target.getBoundingClientRect();
      const tipRect = tooltip.getBoundingClientRect();
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

    function hide() {
      tooltip.hidden = true;
    }

    function handleMouseOver(event) {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        show(target);
      } else {
        hide();
      }
    }

    function handleFocusIn(event) {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        show(target);
      }
    }

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', hide);
    document.addEventListener('click', hide);

    // Cleanup: remove the listeners if the component goes away.
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('click', hide);
    };
  }, [tooltipRef]);
}
```
```jsx [react-app/src/components/Tooltip.jsx]
import { useRef } from 'react';
import { useTooltips } from '../hooks/useTooltips.js';

export function Tooltip() {
  const tooltipRef = useRef(null);
  useTooltips(tooltipRef);
  return <div className="tooltip" id="tooltip" role="tooltip" ref={tooltipRef} />;
}
```
:::

### Step 4 — The ContextMenu component

Create `components/ContextMenu.jsx`. It has three parts:

1. `copyText(text)`: copies with `navigator.clipboard.writeText`, which returns a Promise; the `.catch` logs a warning if the browser refuses (see MDN's [`writeText`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)).
2. `useMenuItems(menu)`: one branch per `kind`, each returning an array of items. Look at how each `run` just dispatches an action, opens the picker or dialog, or calls `copyText`.
3. `ContextMenu`: the popover itself. A `useLayoutEffect` with `[menu]` opens it, flips it to the other side of the pointer if it would overflow the window, and focuses the first item. `handleToggle` reports a browser-initiated close. Clicking an item closes the popover first, then runs the item.

Items are keyed by `item.label`, and separators by their position (the one place where an index key is acceptable, because the list never reorders).

::: solution
```jsx [react-app/src/components/ContextMenu.jsx]
import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findChannel, findMessage, getUser } from '../state/selectors.js';
import { clearSaved } from '../state/storage.js';
import { Icon } from './Icon.jsx';

function copyText(text) {
  navigator.clipboard.writeText(text).catch((error) => {
    console.warn('Could not copy to the clipboard.', error);
  });
}

// Builds the list of menu items for whatever was right-clicked.
function useMenuItems(menu) {
  const { state, dispatch } = useApp();
  if (menu === null) {
    return [];
  }
  const { kind, id } = menu;

  if (kind === 'server') {
    const server = state.servers.find((s) => s.id === id);
    return [
      { label: 'Mark As Read', icon: 'check', run: () => dispatch({ type: 'markServerRead', serverId: id }) },
      { label: 'Copy Server Name', icon: 'copy', run: () => copyText(server.name) },
      'separator',
      { label: 'Leave Server', icon: 'leave', danger: true, run: () => dispatch({ type: 'leaveServer', serverId: id }) },
    ];
  }
  if (kind === 'channel') {
    const channel = findChannel(state, id);
    const items = [];
    if (channel.type === 'text') {
      items.push({ label: 'Mark As Read', icon: 'check', run: () => dispatch({ type: 'markRead', channelId: id }) });
    }
    items.push({ label: 'Copy Channel Name', icon: 'copy', run: () => copyText(channel.name) });
    return items;
  }
  if (kind === 'message') {
    const message = findMessage(state, id);
    const items = [
      {
        label: 'Add Reaction',
        icon: 'reaction-add',
        run: () => {
          const rect = document.querySelector(`[data-message-id="${id}"]`).getBoundingClientRect();
          dispatch({ type: 'openPicker', rect, onPick: (emoji) => dispatch({ type: 'toggleReaction', messageId: id, emoji }) });
        },
      },
      { label: 'Copy Text', icon: 'copy', run: () => copyText(message.content) },
    ];
    if (message.authorId === CURRENT_USER_ID) {
      items.push({ label: 'Edit Message', icon: 'edit', run: () => dispatch({ type: 'startEditing', messageId: id }) });
      items.push('separator');
      items.push({ label: 'Delete Message', icon: 'trash', danger: true, run: () => dispatch({ type: 'openDialog', dialog: { kind: 'delete', id } }) });
    }
    return items;
  }
  if (kind === 'user') {
    const user = getUser(state, id);
    const channelId = state.viewingChannelId;
    return [
      { label: 'Profile', icon: 'user', run: () => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id } }) },
      {
        label: 'Mention',
        icon: 'at',
        run: () => {
          const draft = state.drafts[channelId] ?? '';
          dispatch({ type: 'setDraft', channelId, text: `${draft}@${user.displayName} ` });
          document.querySelector('#composer-input').focus();
        },
      },
    ];
  }
  // kind === 'settings'
  return [
    { label: 'My Profile', icon: 'user', run: () => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: CURRENT_USER_ID } }) },
    'separator',
    {
      label: 'Reset Demo Data',
      icon: 'trash',
      danger: true,
      run: () => {
        clearSaved();
        location.reload();
      },
    },
  ];
}

export function ContextMenu() {
  const { state, dispatch } = useApp();
  const menuRef = useRef(null);
  const menu = state.menu;
  const items = useMenuItems(menu);

  // Open/close the popover and keep the whole menu inside the window.
  useLayoutEffect(() => {
    const element = menuRef.current;
    if (menu === null) {
      if (element.matches(':popover-open')) {
        element.hidePopover();
      }
      return;
    }
    element.showPopover();
    let left = menu.x;
    let top = menu.y;
    if (left + element.offsetWidth > window.innerWidth - 8) {
      left = menu.x - element.offsetWidth;
    }
    if (top + element.offsetHeight > window.innerHeight - 8) {
      top = menu.y - element.offsetHeight;
    }
    element.style.left = `${Math.max(8, left)}px`;
    element.style.top = `${Math.max(8, top)}px`;
    element.querySelector('.menu-item').focus();
  }, [menu]);

  function handleToggle(event) {
    if (!event.currentTarget.matches(':popover-open')) {
      dispatch({ type: 'closeMenu' });
    }
  }

  return (
    <div className="context-menu" id="context-menu" popover="auto" ref={menuRef} onToggle={handleToggle}>
      {items.map((item, index) =>
        item === 'separator' ? (
          <div key={`separator-${index}`} className="menu-separator" />
        ) : (
          <button
            key={item.label}
            className={item.danger ? 'menu-item danger' : 'menu-item'}
            type="button"
            onClick={() => {
              menuRef.current.hidePopover();
              item.run();
            }}
          >
            <span>{item.label}</span>
            <Icon name={item.icon} />
          </button>
        ),
      )}
    </div>
  );
}
```
:::

### Step 5 — The Dialogs component

Create `components/Dialogs.jsx`. Read it from the bottom up:

- `Dialogs` reads `state.dialog` and returns `null`, or one of three dialog components. `ProfileDialog` has a `key={dialog.id}` so that opening another user's profile while one is open creates a *fresh* dialog.
- `Modal` renders `<dialog>`, calls `showModal()` once in an effect, passes `onClose` to the dialog's `close` event, and closes on a backdrop click (a click whose `event.target` is the dialog element itself).
- `CreateServerDialog` is a form read with `FormData`. It builds a new server object with generated ids, dispatches `createServer`, and navigates to the new server's first channel with `useNavigate` (Lesson 37).
- `ProfileDialog` looks up the user and their role in the server you're viewing.
- `DeleteDialog` shows the message text and a red Delete button.

::: solution
```jsx [react-app/src/components/Dialogs.jsx]
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findMessage, findServerOfChannel, getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

// A <dialog> that opens as a modal as soon as it appears on screen.
// Closing it (Escape, a button, a backdrop click) tells the app with onClose.
function Modal({ id, className, onClose, children, style }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  function handleClick(event) {
    // A click on the dialog element itself is a click on the dark backdrop.
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  return (
    <dialog ref={dialogRef} id={id} className={classNames('modal', className)} style={style} onClose={onClose} onClick={handleClick}>
      {children}
    </dialog>
  );
}

function CreateServerDialog({ onClose }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('serverName').trim();
    const iconText = form.get('serverIcon').trim();
    const id = crypto.randomUUID();
    const initials = name
      .split(/\s+/)
      .map((word) => word[0].toUpperCase())
      .join('')
      .slice(0, 3);
    dispatch({
      type: 'createServer',
      server: {
        id,
        name,
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
      },
    });
    navigate(`/channels/${id}/${id}-general`);
  }

  return (
    <Modal id="create-server-dialog" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2 className="modal-title">Customize your server</h2>
        <p className="modal-text">Give your new server a personality with a name and an icon. You can always change it later.</p>
        <label className="field">
          <span className="field-label">Server name</span>
          <input className="field-input" name="serverName" required maxLength={40} autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">Icon (an emoji, or leave empty for initials)</span>
          <input className="field-input" name="serverIcon" maxLength={2} autoComplete="off" />
        </label>
        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Back
          </button>
          <button className="button button-primary" type="submit">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileDialog({ userId, onClose }) {
  const { state } = useApp();
  const user = getUser(state, userId);
  // Their role in the server you're looking at
  const server = findServerOfChannel(state, state.viewingChannelId);
  const member = server.members.find((m) => m.userId === userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);

  return (
    <Modal id="profile-dialog" className="profile-modal" onClose={onClose} style={{ '--avatar-color': user.avatarColor }}>
      <div className="profile-banner" />
      <Avatar user={user} withStatus className="profile-avatar" />
      <div className="profile-body">
        <h2 className="profile-name">{user.displayName}</h2>
        <p className="profile-username">{user.username}</p>
        <p className="profile-custom-status">{user.customStatus}</p>
        <h3 className="profile-heading">About me</h3>
        <p className="profile-bio">{user.bio}</p>
        <h3 className="profile-heading">Role</h3>
        <p className="profile-role">{role ? role.name : 'No roles'}</p>
      </div>
      <button className="icon-button modal-close" type="button" aria-label="Close" onClick={onClose}>
        <Icon name="close" />
      </button>
    </Modal>
  );
}

function DeleteDialog({ messageId, onClose }) {
  const { state, dispatch } = useApp();
  const message = findMessage(state, messageId);
  return (
    <Modal id="delete-dialog" onClose={onClose}>
      <div className="modal-form">
        <h2 className="modal-title">Delete Message</h2>
        <p className="modal-text">Are you sure you want to delete this message?</p>
        <blockquote className="delete-preview">{message.content}</blockquote>
        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-danger" type="button" onClick={() => dispatch({ type: 'deleteMessage', messageId })}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Shows whichever dialog state.dialog asks for (or nothing).
export function Dialogs() {
  const { state, dispatch } = useApp();
  const dialog = state.dialog;
  const close = () => dispatch({ type: 'closeDialog' });
  if (dialog === null) {
    return null;
  }
  if (dialog.kind === 'createServer') {
    return <CreateServerDialog onClose={close} />;
  }
  if (dialog.kind === 'profile') {
    return <ProfileDialog key={dialog.id} userId={dialog.id} onClose={close} />;
  }
  return <DeleteDialog messageId={dialog.id} onClose={close} />;
}
```
:::

### Step 6 — Mount the overlays in App

In `App.jsx` import `Tooltip`, `ContextMenu` and `Dialogs` and render them in the fragment, next to `<EmojiPicker />`.

::: solution
```jsx [react-app/src/App.jsx]
import { Tooltip } from './components/Tooltip.jsx';
import { ContextMenu } from './components/ContextMenu.jsx';
import { EmojiPicker } from './components/EmojiPicker.jsx';
import { Dialogs } from './components/Dialogs.jsx';

/* ...GoToDefaultChannel, ChatScreen unchanged... */

function App() {
  const { dispatch } = useApp();
  useSimulation();

  /* ...the Escape/matchMedia effect is unchanged... */

  return (
    <>
      <Routes>
        <Route path="/channels/:serverId/:channelId" element={<ChatScreen />} />
        <Route path="*" element={<GoToDefaultChannel />} />
      </Routes>
      {/* Overlays live outside the routes, on top of everything */}
      <Tooltip />
      <ContextMenu />
      <EmojiPicker />
      <Dialogs />
    </>
  );
}
```
:::

### Step 7 — Triggers: servers, channels and the user panel

Now wire up the things that open overlays. In each file import nothing new except `useApp` where it isn't yet:

- **`ServerRail.jsx`**: `ServerItem` gets `dispatch` and a `handleContextMenu` (kind `'server'`) attached with `onContextMenu`. `ServerRail` gets `dispatch`, and the **+** button gets `onClick` dispatching `openDialog` with `{ kind: 'createServer' }`.
- **`ChannelList.jsx`**: `ChannelItem` gets `handleContextMenu` (kind `'channel'`) and the button gets `onContextMenu={handleContextMenu}`.
- **`ChannelSidebar.jsx`**: clicking the header opens the server menu just below the server name. It uses the header's rectangle (`event.currentTarget`) for the position.
- **`UserPanel.jsx`**: the profile button opens your own profile; the settings button opens the `'settings'` menu above itself.

::: solution
```jsx [react-app/src/components/ServerRail.jsx]
import { useNavigate } from 'react-router';
import { useApp } from '../state/AppContext.jsx';
import { isServerUnread, countServerMentions, defaultChannelId } from '../state/selectors.js';
import { brand } from '../brand.js';
import { classNames } from '../lib/classNames.js';
import { Icon } from './Icon.jsx';

function ServerItem({ server, isActive }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const mentions = countServerMentions(server);

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch({ type: 'openMenu', menu: { kind: 'server', id: server.id, x: event.clientX, y: event.clientY } });
  }

  return (
    <li className={classNames('server-item', isActive && 'is-active', isServerUnread(server) && 'is-unread')}>
      <button
        className={classNames('server-button', server.iconIsEmoji && 'is-emoji')}
        type="button"
        data-tooltip={server.name}
        aria-label={server.name}
        onClick={() => navigate(`/channels/${server.id}/${defaultChannelId(state, server)}`)}
        onContextMenu={handleContextMenu}
      >
        {server.icon}
        {mentions > 0 && <span className="mention-badge">{mentions}</span>}
      </button>
    </li>
  );
}

export function ServerRail({ activeServerId }) {
  const { state, dispatch } = useApp();
  return (
    <nav className="server-rail" aria-label="Servers">
      <ul className="server-list">
        <li className="server-item">
          <button className="server-button home-button" type="button" data-tooltip="Direct Messages" aria-label="Direct Messages">
            <img className="brand-logo" src={brand.logo} alt="" />
          </button>
        </li>
        <li className="server-separator" role="separator" />
      </ul>
      <ul className="server-list" id="server-list">
        {state.servers.map((server) => (
          <ServerItem key={server.id} server={server} isActive={server.id === activeServerId} />
        ))}
      </ul>
      <ul className="server-list">
        <li className="server-item">
          <button
            className="server-button add-server-button"
            type="button"
            data-tooltip="Add a Server"
            aria-label="Add a Server"
            onClick={() => dispatch({ type: 'openDialog', dialog: { kind: 'createServer' } })}
          >
            <Icon name="plus" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
```
```jsx [react-app/src/components/ChannelList.jsx]
function ChannelItem({ channel, serverId, isSelected }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const voiceUserIds = channel.type === 'voice' ? channel.voiceUserIds : [];

  function handleClick() {
    if (channel.type === 'voice') {
      return; // joining voice channels comes in Lesson 40
    }
    navigate(`/channels/${serverId}/${channel.id}`);
    dispatch({ type: 'setNavOpen', open: false });
  }

  function handleContextMenu(event) {
    event.preventDefault(); // don't show the browser's own menu
    dispatch({ type: 'openMenu', menu: { kind: 'channel', id: channel.id, x: event.clientX, y: event.clientY } });
  }

  return (
    <li className={classNames('channel-item', isSelected && 'is-selected', channel.unread && 'is-unread')}>
      <button className="channel-button" type="button" onClick={handleClick} onContextMenu={handleContextMenu}>
        <Icon name={channel.type === 'voice' ? 'speaker' : 'hash'} />
        <span className="channel-name">{channel.name}</span>
        {channel.mentions > 0 && <span className="channel-mention-badge">{channel.mentions}</span>}
      </button>
      {voiceUserIds.length > 0 && (
        <ul className="voice-users">
          {voiceUserIds.map((userId) => (
            <VoiceUser key={userId} userId={userId} />
          ))}
        </ul>
      )}
    </li>
  );
}
```
```jsx [react-app/src/components/ChannelSidebar.jsx]
import { useApp } from '../state/AppContext.jsx';
import { ChannelList } from './ChannelList.jsx';
import { UserPanel } from './UserPanel.jsx';
import { Icon } from './Icon.jsx';

export function ChannelSidebar({ server, activeChannelId }) {
  const { dispatch } = useApp();

  // Clicking the server name opens the server's menu just below it.
  function openServerMenu(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch({ type: 'openMenu', menu: { kind: 'server', id: server.id, x: rect.left + 10, y: rect.bottom + 4 } });
  }

  return (
    <aside className="channel-sidebar" aria-label="Channels">
      <header className="sidebar-header" onClick={openServerMenu}>
        <h1 className="server-name" id="server-name">
          {server.name}
        </h1>
        <Icon name="chevron-down" />
      </header>
      <ChannelList server={server} activeChannelId={activeChannelId} />
      <UserPanel />
    </aside>
  );
}
```
```jsx [react-app/src/components/UserPanel.jsx]
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, getUser } from '../state/selectors.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

export function UserPanel() {
  const { state, dispatch } = useApp();
  const me = getUser(state, CURRENT_USER_ID);

  function openSettings(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch({ type: 'openMenu', menu: { kind: 'settings', x: rect.left, y: rect.top - 4 } });
  }

  return (
    <section className="user-panel" aria-label="Your account">
      <button
        className="user-panel-profile"
        type="button"
        id="user-panel-profile"
        onClick={() => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: CURRENT_USER_ID } })}
      >
        <Avatar user={me} withStatus />
        <span className="user-panel-names">
          <span className="user-panel-name" id="user-panel-name">{me.displayName}</span>
          <span className="user-panel-tag" id="user-panel-tag">{me.customStatus || me.username}</span>
        </span>
      </button>
      <button className="icon-button" type="button" id="mute-button" data-tooltip="Mute" aria-label="Mute">
        <Icon name="mic" />
      </button>
      <button className="icon-button" type="button" id="deafen-button" data-tooltip="Deafen" aria-label="Deafen">
        <Icon name="headphones" />
      </button>
      <button className="icon-button" type="button" id="settings-button" data-tooltip="User Settings" aria-label="User Settings" onClick={openSettings}>
        <Icon name="settings" />
      </button>
    </section>
  );
}
```
:::

### Step 8 — Triggers: members and messages

- **`MemberList.jsx`**: `Member` gets `dispatch`. Clicking opens the profile dialog; right-clicking opens the `'user'` menu.
- **`Message.jsx`**: 
  - `roleColor` is computed once; `openProfile` opens the author's profile and is attached to the avatar button and the author name.
  - `handleDelete` now opens the delete dialog (Shift+click still deletes immediately). The old `window.confirm` is gone.
  - `handleContextMenu` is attached to the whole `<li>`. It leaves the browser's own menu alone inside the edit box (so copy and paste work), and otherwise opens the `'user'` menu if you right-clicked something with `data-user-id` (avatar or name), or the `'message'` menu.
  - In the editor's comments, two comments were reworded; that's optional.

::: solution
```jsx [react-app/src/components/MemberList.jsx]
function Member({ user, role }) {
  const { dispatch } = useApp();
  const isOffline = user.status === 'offline';

  function handleContextMenu(event) {
    event.preventDefault();
    dispatch({ type: 'openMenu', menu: { kind: 'user', id: user.id, x: event.clientX, y: event.clientY } });
  }

  return (
    <button
      className={classNames('member', isOffline && 'is-offline')}
      type="button"
      onClick={() => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: user.id } })}
      onContextMenu={handleContextMenu}
    >
      <Avatar user={user} withStatus />
      <span className="member-names">
        <span className="member-name" style={{ '--author-color': role?.color }}>
          {user.displayName}
        </span>
        {user.customStatus && !isOffline && <span className="member-status-text">{user.customStatus}</span>}
      </span>
    </button>
  );
}
```
```jsx [react-app/src/components/Message.jsx]
export function Message({ message, server, startsGroup }) {
  const { state, dispatch } = useApp();
  const author = getUser(state, message.authorId);
  const isMine = message.authorId === CURRENT_USER_ID;
  const isEditing = state.editingMessageId === message.id;
  const roleColor = getRoleColor(server, author.id);

  const openProfile = () => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: author.id } });

  function openReactionPicker(event) {
    dispatch({
      type: 'openPicker',
      onPick: (emoji) => dispatch({ type: 'toggleReaction', messageId: message.id, emoji }),
      rect: event.currentTarget.getBoundingClientRect(),
    });
  }

  function handleDelete(event) {
    if (event.shiftKey) {
      dispatch({ type: 'deleteMessage', messageId: message.id }); // Shift+click: no questions asked
    } else {
      dispatch({ type: 'openDialog', dialog: { kind: 'delete', id: message.id } });
    }
  }

  function handleContextMenu(event) {
    if (event.target.closest('.edit-input')) {
      return; // keep the browser's own menu (copy/paste) in the edit box
    }
    event.preventDefault();
    const kind = event.target.closest('[data-user-id]') ? 'user' : 'message';
    const id = kind === 'user' ? author.id : message.id;
    dispatch({ type: 'openMenu', menu: { kind, id, x: event.clientX, y: event.clientY } });
  }

  return (
    <li
      className={classNames(
        'message',
        startsGroup && 'is-group-start',
        !isMine && mentionsMe(state, message.content) && 'is-mention',
        isEditing && 'is-editing',
      )}
      data-message-id={message.id}
      onContextMenu={handleContextMenu}
    >
      <div className="message-gutter">
        {startsGroup ? (
          <button className="avatar-button" type="button" data-user-id={author.id} aria-label={`${author.displayName}'s profile`} onClick={openProfile}>
            <Avatar user={author} />
          </button>
        ) : (
          <time className="message-hover-time" dateTime={message.timestamp}>
            {formatTime(message.timestamp)}
          </time>
        )}
      </div>

      <div className="message-body">
        {startsGroup && (
          <h3 className="message-header">
            <button className="message-author" type="button" data-user-id={author.id} style={{ '--author-color': roleColor }} onClick={openProfile}>
              {author.displayName}
            </button>
            {author.bot && <span className="bot-tag">Bot</span>}
            <time className="message-time" dateTime={message.timestamp}>
              {formatTimestamp(message.timestamp)}
            </time>
          </h3>
        )}

        {isEditing ? (
          <MessageEditor message={message} />
        ) : (
          <div className="message-content">
            {/* renderMarkdown escapes the text first, so this is safe */}
            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
            {message.editedAt && <span className="edited-label"> (edited)</span>}
          </div>
        )}

        {message.reactions.length > 0 && <Reactions message={message} />}
      </div>

      <div className="message-actions">
        <ActionButton action="react" icon="reaction-add" label="Add Reaction" onClick={openReactionPicker} />
        {isMine && (
          <ActionButton action="edit" icon="edit" label="Edit" onClick={() => dispatch({ type: 'startEditing', messageId: message.id })} />
        )}
        {isMine && <ActionButton action="delete" icon="trash" label="Delete" className="danger" onClick={handleDelete} />}
      </div>
    </li>
  );
}
```
:::

## ✅ Checkpoint

- [ ] No red errors in the Console.
- [ ] Right-click a message: a menu appears at the pointer with Add Reaction and Copy Text (plus Edit Message and Delete Message on Sam's own messages). Press <kbd>Esc</kbd> or click elsewhere: it closes.
- [ ] Right-click a channel: Mark As Read and Copy Channel Name. Right-click a voice channel: only Copy Channel Name.
- [ ] Right-click a server icon, or click the server name at the top of the channel list: Mark As Read, Copy Server Name, Leave Server.
- [ ] Right-click an author's name or avatar, or a member: Profile and Mention. Mention puts `@Name ` in the message box.
- [ ] Click a member: the profile dialog opens with a banner, bio and role. <kbd>Esc</kbd>, the close button, and a click on the dark backdrop all close it.
- [ ] Click the **+** below the servers, type a name and press Create: a new server appears in the rail and opens. Try leaving it with the right-click menu.
- [ ] Click Delete on your own message: a dialog shows the message text; Cancel closes, Delete removes it. <kbd>Shift</kbd>+click Delete skips the dialog.
- [ ] Hover over icon buttons and server icons: a small label appears. Move the pointer away: it disappears.
- [ ] Click the gear next to your name, then **Reset Demo Data**: the page reloads with the original messages (your saved data is cleared).

## 🐛 Common mistakes

**The browser's own right-click menu shows up on top of yours.** The handler is missing `event.preventDefault()`.

**The menu appears in the top-left corner of the window.** `x` and `y` are missing or wrong in the `menu` object (`event.clientX`, `event.clientY`), or the position is set before `showPopover()`.

**`Unknown action: openDialog`.** The reducer case is missing, or a typo in the action name. The `default` case throws on purpose.

**The dialog opens but pressing Escape leaves the page "dead".** `onClose` isn't hooked up in `Modal`, so `state.dialog` still says it's open, and nothing renders a new one on the next click. Check `onClose={onClose}` on the `<dialog>`.

**`Cannot read properties of null (reading 'showModal')`.** `dialogRef` isn't attached. Make sure the `<dialog>` has `ref={dialogRef}`.

**Submitting the create-server form reloads the page.** `event.preventDefault()` is missing in `handleSubmit`.

**A tooltip stays stuck on the screen after you click a button.** One of the four listener lines (`click`) is missing from the effect, so `hide` isn't called.

## 📝 Quiz

::: quiz
How does a dialog "open" in this app?

- [ ] `Dialogs` calls `dialog.open = true` in a click handler
- [ ] A CSS class `is-open` is added to the `<dialog>`
- [x] State changes to a non-null `state.dialog`, a `Modal` component mounts, and its effect calls `showModal()`
- [ ] The reducer calls `showModal()` directly

> Mounting is opening. The reducer only changes data; a component renders from that data, and an effect tells the browser to show the modal.
:::

::: quiz
Predict what happens:

```jsx
<li onContextMenu={(event) => dispatch({ type: 'openMenu', menu: { kind: 'message', id: message.id, x: event.clientX, y: event.clientY } })} />
```

You right-click the item. What do you see?

- [ ] Only your custom menu
- [x] Your custom menu *and* the browser's own context menu, because `preventDefault()` was never called
- [ ] Nothing
- [ ] An error, because `clientX` doesn't exist

> `onContextMenu` only listens. Without `event.preventDefault()`, the browser still shows its default menu.
:::

::: quiz
Why does `useTooltips` put its code in `useEffect` with a cleanup that removes four listeners?

- [ ] Because `document.addEventListener` is not allowed outside an effect
- [x] So the listeners are added once when the component appears and removed when it disappears, instead of piling up (StrictMode even runs the effect twice in development)
- [ ] Because the cleanup makes the tooltip faster
- [ ] Because React forbids more than one `addEventListener` per component

> An effect is where you start things outside React, and its cleanup is where you stop them. Without cleanup, StrictMode's extra setup would leave duplicate listeners.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add dialogs, context menus and tooltips as React overlays"
git push
```
