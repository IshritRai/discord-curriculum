---
lesson: 25
title: Member list — roles & online status
---

# Lesson 25 — Member list: roles & online status

So far the member list on the right is a flat list of everyone. Real chat apps group people: staff roles first, then everyone else who is online, then the offline crowd. In this lesson you'll write the grouping algorithm, sort each group alphabetically, colour names by role, and make the list start hidden on narrow screens.

## 🎯 Goal

The right-hand column now has headings such as **ADMIN — 1**, **MENTOR — 2**, **BOTS — 1**, **ONLINE — 6** and **OFFLINE — 3**. Members with a role have their names in the role's colour (Ava is orange-red, Maya and Priya are light blue). Inside each group names are in alphabetical order, and offline members are dimmed and have no status text.

![The member list on the right with the headings Admin 1, Mentor 2, Bots 1, Online 6 and Offline 3; Ava's name is coloured orange, Maya and Priya are light blue, offline members are dimmed](/screenshots/lesson-25.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### The grouping algorithm

Every server has a list of `roles` (name and colour) and a list of `members`, each pointing at a user and optionally at a role:

```js
server.roles   = [{ id: 'r-ff-admin', name: 'Admin', color: '#f47b67' }, ...];
server.members = [{ userId: 'u-ava', roleId: 'r-ff-admin' }, { userId: 'u-leo', roleId: null }, ...];
```

The rules for where a member goes are checked in this order:

1. If the user's `status` is `'offline'`, they go in **Offline** (even if they have a role).
2. Otherwise, if they have a role, they go in that **role's group**.
3. Otherwise they go in **Online**.

The display order is: one group per role (in the order the server lists its roles), then Online, then Offline. Empty groups are not shown.

Here is a trace with five members (Ava is Admin, Kenji is offline):

| Member | Status | Role | Rule that fires | Goes to |
| --- | --- | --- | --- | --- |
| Ava | online | Admin | 2 | Admin |
| Leo | idle | none | 3 | Online |
| Kenji | offline | none | 1 | Offline |
| Sam | online | none | 3 | Online |
| Priya | online | Mentor | 2 | Mentor |

Result: `Admin [Ava]`, `Mentor [Priya]`, `Online [Leo, Sam]`, `Offline [Kenji]`. Bots has no members in this tiny example, so it would be filtered out.

In code, the groups are plain objects with a `title` and a `members` array. You create all of them first, then walk through the members once and `push` each one into the right group. This "make the buckets, then drop things into them" pattern is how you'd write it in Python with a dict of lists.

### Sorting with `sort()` and `localeCompare()`

JavaScript arrays have a `.sort()` method. Like Python's `list.sort()`, it **changes the array in place**. Unlike Python, you don't pass `key=`. You pass a **compare function** that takes two items, `a` and `b`, and returns a number:

- negative: `a` goes before `b`
- zero: they are equal
- positive: `b` goes before `a`

| Python | JavaScript |
| --- | --- |
| `people.sort(key=lambda p: p.name)` | `people.sort((a, b) => a.name.localeCompare(b.name))` |

`a.localeCompare(b)` is a string method that compares two strings the way people expect (it knows about accents and treats upper and lower case sensibly) and returns a negative number, zero or a positive number: exactly what `sort()` wants. See [`localeCompare` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) and [`Array.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

::: warning Don't sort without a compare function
Calling `.sort()` with no argument converts items to strings and compares those. That gives surprising results for numbers (`[10, 9, 1].sort()` gives `[1, 10, 9]`) and useless results for objects. Always pass a compare function.
:::

### Spreading arrays

Three dots in front of an array **spread** its items out into a new array:

```js
const roleGroups = [{ title: 'Admin' }, { title: 'Mentor' }];
const online = { title: 'Online' };
const offline = { title: 'Offline' };

const groups = [...roleGroups, online, offline];
// [{Admin}, {Mentor}, {Online}, {Offline}]
```

In Python the same idea is `[*role_groups, online, offline]`. Without the dots you'd get an array with an array as its first item. See [spread syntax on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

### Reacting to window size from JavaScript: `matchMedia()`

CSS media queries (Lesson 11) respond to window width. Sometimes JavaScript needs to know the same thing. `window.matchMedia('(max-width: 1000px)')` takes the same condition text you'd put in `@media` and returns a **MediaQueryList** object with:

- `.matches`, a boolean: is the condition true *right now*?
- a `'change'` event that fires when the answer flips (the window is resized across 1000 px).

```js
const narrow = window.matchMedia('(max-width: 1000px)');
console.log(narrow.matches);          // true or false
narrow.addEventListener('change', () => console.log('flipped!'));
```

Docs: [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), [`change` event](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event).

::: tip Keep the two in sync
The number `1000` now exists in two places: `responsive.css` and `layout.js`. If you change one, change the other. (A comment in the code reminds you.)
:::

## 🛠️ Build it

Three files change: `js/members.js` (most of the work), `css/members.css` and `js/layout.js`.

### Step 1 — A compare function and `groupMembers` (`members.js`)

Open `vanilla/js/members.js`. Change the comment at the very top to describe the new behaviour. Then, **above** `createMember`, add two functions.

`byName(a, b)` is the compare function. Notice it receives *entries* of the shape `{ user, role }` that we're about to build, so it reaches into `a.user.displayName`.

`groupMembers(server)` is the algorithm. Type it in this order and read each part:

1. `server.roles.map(...)` creates one group per role. We keep the `roleId` so we can find the group again.
2. `online` and `offline` are two more groups.
3. The `for` loop turns each member into an `entry` (the user object plus their role object), then applies the three rules from *New concepts*. `roleGroups.find(...)` locates the right role group.
4. `[...roleGroups, online, offline]` builds the display order, each group is sorted, and finally `filter` drops empty groups.

It's `export`ed so that a later lesson (or the React version) can reuse it.

::: solution
```js [vanilla/js/members.js]
// The member list: grouped by role, then "Online", then "Offline".

import { state, getActiveServer, getUser } from './state.js';
import { el, avatar } from './dom.js';

const memberList = document.querySelector('#member-list');
const membersButton = document.querySelector('#members-button');

// Used by sort(): a negative number puts a before b, positive puts b first.
function byName(a, b) {
  return a.user.displayName.localeCompare(b.user.displayName);
}

// Returns [{ title, members: [{ user, role }] }] in display order.
export function groupMembers(server) {
  const roleGroups = server.roles.map((role) => ({ title: role.name, roleId: role.id, members: [] }));
  const online = { title: 'Online', members: [] };
  const offline = { title: 'Offline', members: [] };

  for (const member of server.members) {
    const user = getUser(member.userId);
    const role = server.roles.find((r) => r.id === member.roleId);
    const entry = { user: user, role: role };
    if (user.status === 'offline') {
      offline.members.push(entry);
    } else if (role) {
      roleGroups.find((group) => group.roleId === role.id).members.push(entry);
    } else {
      online.members.push(entry);
    }
  }

  const groups = [...roleGroups, online, offline];
  for (const group of groups) {
    group.members.sort(byName);
  }
  return groups.filter((group) => group.members.length > 0);
}
```
:::

### Step 2 — Show a role colour in `createMember`

Still in `members.js`, replace `createMember`. It now receives an **entry** instead of a user. Pull `user` and `role` out of it. The name gets the CSS variable `--author-color` set to the role colour, but only when there's a role (the same variable the message feed uses for author names in Lesson 20). Customised status text is hidden for offline users.

Also, note there is no blank line between some statements anymore; that's just the snapshot's style.

::: solution
```js [vanilla/js/members.js]
function createMember(entry) {
  const user = entry.user;
  const role = entry.role;
  const button = el('button', 'member');
  button.type = 'button';
  button.dataset.userId = user.id;
  if (user.status === 'offline') {
    button.classList.add('is-offline');
  }
  const names = el('span', 'member-names');
  const name = el('span', 'member-name', user.displayName);
  if (role) {
    name.style.setProperty('--author-color', role.color);
  }
  names.append(name);
  if (user.customStatus && user.status !== 'offline') {
    names.append(el('span', 'member-status-text', user.customStatus));
  }
  button.append(avatar(user, true), names);
  return button;
}
```
:::

### Step 3 — Render the groups

Replace `renderMembers` at the bottom of the file. If the list is hidden we return early without building anything. Otherwise we loop over the groups, adding a heading (`ROLE — count`) and then one button per entry.

::: solution
```js [vanilla/js/members.js]
export function renderMembers() {
  memberList.hidden = !state.showMembers;
  membersButton.setAttribute('aria-pressed', String(state.showMembers));
  if (!state.showMembers) {
    return;
  }
  memberList.replaceChildren();
  for (const group of groupMembers(getActiveServer())) {
    memberList.append(el('h3', 'member-group-title', `${group.title} — ${group.members.length}`));
    for (const entry of group.members) {
      memberList.append(createMember(entry));
    }
  }
}
```
:::

### Step 4 — Colour the names (`members.css`)

Open `vanilla/css/members.css`. In the `.member-name` rule, change the `color` to `var(--author-color, var(--text-muted))`: use the role colour if the variable is set, otherwise the old grey. Do the same in `.member:hover .member-name`, whose fallback is `var(--text-normal)`. Add a one-line comment above `.member-name`.

::: solution
```css [vanilla/css/members.css]
/* Members with a role are shown in the role's color */
.member-name {
  color: var(--author-color, var(--text-muted));
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member:hover .member-name {
  color: var(--author-color, var(--text-normal));
}
```
:::

### Step 5 — Start hidden on narrow screens (`layout.js`)

Open `vanilla/js/layout.js`:

1. Import `state` from `./state.js` above the existing import.
2. Under the element lookups, create `narrowScreen` with `window.matchMedia('(max-width: 1000px)')`. Use the same number as the media query in `responsive.css`.
3. At the **top** of `setupLayout`, set `state.showMembers = !narrowScreen.matches;`: on a narrow screen the list starts hidden, otherwise shown.
4. At the end of `setupLayout`, listen for `change` on `narrowScreen`: when the window grows past the breakpoint the drawer isn't needed, so close it.

::: solution
```js [vanilla/js/layout.js]
// Layout toggles: the member list and, on small screens, the channel drawer.

import { state } from './state.js';
import { toggleMembers } from './actions.js';

// ...const app, menuButton, backdrop, membersButton unchanged...

// Same width as the media query in responsive.css
const narrowScreen = window.matchMedia('(max-width: 1000px)');

// ...openNav and closeNav unchanged...

export function setupLayout() {
  // On narrow screens the member list starts hidden.
  state.showMembers = !narrowScreen.matches;

  menuButton.addEventListener('click', openNav);
  backdrop.addEventListener('click', closeNav);
  membersButton.addEventListener('click', toggleMembers);

  // ...the keydown (Escape) listener unchanged...

  // When the window gets wider, the drawer isn't needed any more.
  narrowScreen.addEventListener('change', () => {
    closeNav();
  });
}
```
:::

### Step 6 — Check the result

Reload at full width. You should see Admin, Mentor, Bots, Online and Offline groups. Switch to another server in the rail: its roles differ. Open DevTools' device toolbar (Lesson 11), pick a phone, reload: the member list starts hidden. Click the members button: it appears.

<!-- no-solution: trying the feature out, nothing to type -->

## ✅ Checkpoint

- [ ] Headings read `ADMIN — 1`, `MENTOR — 2`, `BOTS — 1`, `ONLINE — 6`, `OFFLINE — 3` for "Frontend Friends".
- [ ] Inside each group, names are alphabetical (Leo, Noah, Omar, Ravi, Sam, Zoe under Online).
- [ ] Ava's name is orange-red; Maya and Priya are light blue; Online members stay grey.
- [ ] Offline members are dimmed and show no custom status text.
- [ ] Switching servers shows different groups; groups with no members are not shown.
- [ ] At phone width the list starts hidden; the members button toggles it.
- [ ] Console: `matchMedia('(max-width: 1000px)').matches` prints `true` in a narrow window and `false` in a wide one.
- [ ] DevTools: select a `.member-name` for Ava. The Styles pane shows `--author-color` set on the element.

## 🐛 Common mistakes

**Names aren't sorted, or sorted in a strange order.** You called `.sort()` without a compare function, or your compare function doesn't return the result of `localeCompare`. Make sure `byName` has a `return`.

**`TypeError: Cannot read properties of undefined (reading 'members')`.** In `groupMembers`, `roleGroups.find(...)` found nothing, so the role id doesn't match a group. Check that each group has `roleId: role.id` and that you compare `group.roleId === role.id`.

**Everyone appears under Online and nobody under their role.** The order of the `if`s matters, or you tested `user.status` incorrectly. Check for `===` (three equals) and the string `'offline'`.

**The role headings are missing entirely.** You wrote `[roleGroups, online, offline]` without the three dots, so the first item is an array of groups, not groups. Use `[...roleGroups, online, offline]`.

**The member list appears on a narrow screen anyway.** `setupLayout()` must run **before** the first `render()`. In `main.js` it's called before `render()` already; check you didn't move it.

**Resizing the window never closes the drawer.** You listened for `'resize'` or forgot the `'change'` event name, or you're listening on `window` instead of `narrowScreen`.

## 📝 Quiz

::: quiz
What is `groups` after this code runs?

```js
const a = [1, 2];
const groups = [...a, 3, 4];
```

- [ ] `[[1, 2], 3, 4]`
- [x] `[1, 2, 3, 4]`
- [ ] `[1, 2]`
- [ ] A syntax error

> The three dots spread the items of `a` into the new array, like `[*a, 3, 4]` in Python.
:::

::: quiz
Which compare function sorts people alphabetically by name?

- [ ] `people.sort(person.name)`
- [ ] `people.sort(key = (p) => p.name)`
- [x] `people.sort((a, b) => a.name.localeCompare(b.name))`
- [ ] `people.sort((a, b) => a.name > b.name)`

> `sort` needs a function that returns a negative number, zero or a positive number. `localeCompare` does exactly that for strings. A boolean (last option) isn't a reliable result for a compare function.
:::

::: quiz
Kenji has the status `offline` and the Mentor role. Where does `groupMembers` put him?

- [ ] In Mentor
- [x] In Offline
- [ ] In both
- [ ] In Online

> The offline check comes first in the `if`/`else if` chain, so a role doesn't matter for offline people.
:::

## 💾 Commit

```sh
git add .
git commit -m "Group the member list by role and status"
git push
```
