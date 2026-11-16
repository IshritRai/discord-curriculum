---
lesson: 20
title: "Message feed: grouping, timestamps & dividers"
---

# Lesson 20 — Message feed: grouping, timestamps & dividers

Right now every message repeats the author's avatar, name and time. Real chats group consecutive messages from the same person, show friendly times like "Today at 6:15 AM", split days with dividers, and keep the newest message in view. This lesson builds all of that, and teaches how JavaScript handles dates.

## 🎯 Goal

The `#general` channel shows a "Welcome to #general!" header at its very top, date dividers between days, consecutive messages from one author grouped under a single name, author names in their role colors (Ava in orange-red, Priya in blue), a **BOT** tag on Helper Bot, and the feed scrolled down to the newest message.

![The general channel scrolled to the bottom: a date divider reading October 13, 2026, then grouped messages from Ava, Sam, Priya, Helper Bot with a BOT tag, Zoe and Omar](/screenshots/lesson-20.png){.screenshot}

::: info About "Today at" in the screenshot
The sample messages in `messages.json` are dated October 2026. The screenshot was taken on one of those days, so it says "Today at 6:15 AM". On any other day, you'll see old dates such as `10/13/2026 6:15 AM` instead. Both are correct: the code compares each message's date with the date **on your computer today**. You'll see "Today at" for real in Lesson 22, when you send your own messages.
:::

## 🧠 New concepts

<ConceptList />

### Timestamps: ISO 8601 text

Each message has a `timestamp` such as `"2026-10-13T10:15:00Z"`. This format is called **ISO 8601**:

```text
2026-10-13T10:15:00Z
│    │  │  │  │  │  └─ Z = UTC (the "zero" time zone)
│    │  │  │  │  └──── seconds
│    │  │  │  └─────── minutes
│    │  │  └────────── hour (24-hour clock)
│    │  └───────────── day
│    └──────────────── month
└───────────────────── year
```

Storing time as text in this format has two good properties: it sorts correctly as plain text, and it always means the same moment, no matter where you are. Showing it to a person in *their* time zone is the browser's job.

### `Date`: a moment in time

`new Date(text)` turns such a text into a **Date** object. A Date is one exact moment, and has methods to read its parts in the **local** time zone of the computer running the code:

```js
const date = new Date('2026-10-13T10:15:00Z');

date.getFullYear();   // 2026
date.getMonth();      // 9   (!)
date.getDate();       // 13
date.getTime();       // a big number: milliseconds since January 1, 1970 (UTC)
```

Two traps:

- **Months start at 0**: January is `0`, October is `9`. (Days of the month start at 1, as you'd expect.)
- Results depend on the time zone of the computer. A message sent at 23:30 UTC is "tomorrow" for someone in Tokyo. That's correct: "same day" means the same day for the person looking.

`new Date()` with nothing in the brackets is **now**. `new Date(otherDate)` makes a copy. `date.setDate(n)` changes the day of the month (and handles rolling over: day 0 is the last day of the previous month).

::: tip Python comparison
JavaScript's `Date` is like Python's `datetime`. `getTime()` is like `timestamp()` but in milliseconds, not seconds. Subtracting two dates in Python gives a `timedelta`; in JavaScript you subtract the `getTime()` numbers yourself.
:::

### `Intl.DateTimeFormat`: showing dates for humans

Every country writes dates differently. `Intl.DateTimeFormat` is a built-in tool that does it for you. You create a formatter once, describing what you want, then call `.format(date)`:

```js
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

timeFormat.format(new Date('2026-10-13T10:15:00Z'));   // e.g. "6:15 AM" or "10:15"
```

- The first argument is the **locale** (language and region). `undefined` means "use the browser's own settings", so a US browser gives `6:15 AM` and a German one gives `06:15`.
- The second is an object of options: `hour: 'numeric'`, `minute: '2-digit'`, `year: 'numeric'`, `month: 'long'` (the full month name) or `'2-digit'`, `day: 'numeric'`.
- The exact text depends on your browser and system, so don't be surprised if yours differs from the examples.

### `Math.abs` and subtraction for time differences

`Math.abs(x)` gives the absolute value (drops a minus sign). To find the minutes between two moments, subtract their `getTime()` values (milliseconds), divide by 1000 for seconds and by 60 more for minutes. In one step: divide by `60000`.

### Today / Yesterday

To decide between "Today at...", "Yesterday at..." and a full date, ask "is the message on the same calendar day as now?", then "as yesterday?". Yesterday is `now` with the day-of-month reduced by one. A helper `isSameDay(a, b)` compares year, month and day.

### The grouping rule

Discord shows only the **first message** of a run with the avatar and name. A message *starts a new group* when **any** of these is true:

1. there is no previous message (it's the first one), or
2. the author is different from the previous message's author, or
3. more than **7 minutes** passed since the previous message, or
4. it's a different calendar day.

Here's the rule applied to part of `#general`:

| Message | Author | Time | Previous | New group? | Why |
| --- | --- | --- | --- | --- | --- |
| m1 | Priya | 09:12:00 | none | **yes** | first message |
| m2 | Priya | 09:13:10 | Priya 09:12:00 | no | same author, 1 min later |
| m3 | Leo | 09:30:00 | Priya | **yes** | different author |
| m4 | Ava | 09:32:00 | Leo | **yes** | different author |
| m5 | Ava | 09:32:40 | Ava 09:32:00 | no | same author, under a minute |
| m6 | Leo | 09:35:00 | Ava | **yes** | different author |
| m7 | Maya | next day 14:03 | Leo | **yes** | different author (and a new day) |

Within a group, later messages show only the text, with the time appearing on hover.

### How scrolling is measured

A scrollable box has three numbers you can read in JavaScript:

```text
 ┌────────────────┐ ─┐
 │  (scrolled     │  │
 │   out of view) │  │ scrollTop: how far you've scrolled down
 ├────────────────┤ ─┘      ─┐
 │                │          │
 │  what you see  │          │ clientHeight: height of the visible box
 │                │          │
 ├────────────────┤ ─┐      ─┘
 │ (still below)  │  │
 └────────────────┘ ─┘
 whole height = scrollHeight
```

- `element.scrollHeight`: the full height of the content, including the part you can't see.
- `element.clientHeight`: the height of the visible box.
- `element.scrollTop`: how many pixels the content is scrolled. You can **read and set** it. Setting `scrollTop = scrollHeight` jumps to the bottom.

The distance from the bottom is `scrollHeight - scrollTop - clientHeight`. When that is 0 (or tiny), you're at the bottom. The feed uses it to decide: when a channel is opened, jump to the bottom; on a later re-render, stay at the bottom if you were within about 80 pixels of it, but leave you where you are if you'd scrolled up to read old messages. Without that rule, every re-render would yank you down.

### `align-self`

In a flexbox row, `align-items` sets how **all** items line up across the row. `align-self` overrides that for **one** item. In the message header the author name, the bot tag and the time sit on a shared text baseline, but the bot tag looks better centered, so it gets `align-self: center`.

## 🛠️ Build it

You'll build a new file, `time.js`, then use it in `chat.js`. `time.js` is short, so you'll type it in two steps.

### Step 1 — `time.js`: comparing moments

Create `vanilla/js/time.js`. Start with the three formatters (made once at the top and reused), then two comparison functions.

- `timeFormat`: hour and minute, like `6:15 AM`.
- `dateFormat`: year, full month name and day, like `October 13, 2026`.
- `shortDateFormat`: numeric `10/13/2026`.
- `isSameDay(a, b)`: wrap both inputs in `new Date(...)` (so you can pass text *or* a Date), then compare year, month and day. `&&` chains the three checks. Notice the parentheses after `return`: they let you put the condition on several lines.
- `minutesBetween(a, b)`: the difference of the two `getTime()` values, as a positive number of minutes.

::: solution
```js [vanilla/js/time.js]
// Formatting dates and times the way the chat app shows them.

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });

export function isSameDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function minutesBetween(a, b) {
  const milliseconds = new Date(b).getTime() - new Date(a).getTime();
  return Math.abs(milliseconds) / 60000;
}
```
:::

### Step 2 — `time.js`: formatting for people

Add three more exported functions to the bottom of `time.js`:

- `formatTime(timestamp)`: just the time, `"6:15 AM"`.
- `formatDate(timestamp)`: the long date, used on dividers.
- `formatTimestamp(timestamp)`: the message header's text. It builds `now` and `yesterday` (a copy of `now` with the day moved back one), then returns `Today at ...`, `Yesterday at ...` or the short date plus time.

Template literals (backticks with `${...}`) build the strings.

::: solution
```js [vanilla/js/time.js]
// "3:41 PM"
export function formatTime(timestamp) {
  return timeFormat.format(new Date(timestamp));
}

// "October 13, 2026"
export function formatDate(timestamp) {
  return dateFormat.format(new Date(timestamp));
}

// "Today at 3:41 PM", "Yesterday at 9:02 AM" or "10/11/2026 9:02 AM"
export function formatTimestamp(timestamp) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(timestamp, now)) {
    return `Today at ${formatTime(timestamp)}`;
  }
  if (isSameDay(timestamp, yesterday)) {
    return `Yesterday at ${formatTime(timestamp)}`;
  }
  return `${shortDateFormat.format(new Date(timestamp))} ${formatTime(timestamp)}`;
}
```
:::

### Step 3 — Role colors in `state.js`

Each server has `roles` (name and color), and each entry in `server.members` has a `roleId` (or `null`). To color an author's name you need to look up their role color in the active server.

In `vanilla/js/state.js`, add two exported functions after `getMessages`:

- `getMember(server, userId)`: finds the member entry.
- `getRoleColor(server, userId)`: finds the member, then the role, and returns the role's color. If there's no member, or no role, it returns `undefined`. The expression `member && server.roles.find(...)` only runs `find` when `member` exists.

::: solution
```js [vanilla/js/state.js]
export function getMember(server, userId) {
  return server.members.find((member) => member.userId === userId);
}

// The role color of a user in a server (or undefined if they have no role).
export function getRoleColor(server, userId) {
  const member = getMember(server, userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);
  return role ? role.color : undefined;
}
```
:::

### Step 4 — One message, in two shapes

Now the main work, in `vanilla/js/chat.js`. First the imports: also import `getActiveServer` and `getRoleColor` from `state.js`, `icon` from `dom.js`, and the time helpers from `time.js`. Add one new variable below the element lookups, `let renderedChannelId = null;`, which remembers which channel is on screen (you'll use it in Step 6).

Then rewrite `createMessage(message, startsGroup)`. It takes a second argument, `startsGroup`:

- **Group start:** the gutter (left column) holds a button with the avatar; the body holds a header with the author's name button (colored with `--author-color` from the role), a `Bot` tag if `author.bot` is true, and the formatted time; then the message text.
- **Not a group start:** the gutter holds only a small time (shown on hover by the CSS), and the body holds only the text.

Add the class `is-group-start` only for group starts: the CSS gives them extra space above.

The name's color is set as a CSS **variable**, `--author-color`, using `style.setProperty`, the same trick as `--avatar-color` for avatars. The CSS will read it.

::: solution
```js [vanilla/js/chat.js]
// The chat area: header and the message feed (grouping, timestamps, date dividers).

import { getActiveChannel, getActiveServer, getMessages, getUser, getRoleColor } from './state.js';
import { el, icon, avatar } from './dom.js';
import { isSameDay, minutesBetween, formatTime, formatDate, formatTimestamp } from './time.js';

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const messageList = document.querySelector('#message-list');
const composerInput = document.querySelector('#composer-input');

let renderedChannelId = null;

// ---------- Building one message ----------

function createMessage(message, startsGroup) {
  const author = getUser(message.authorId);
  const item = el('li', 'message');
  item.dataset.messageId = message.id;
  if (startsGroup) {
    item.classList.add('is-group-start');
  }

  // Left column: avatar for the first message of a group, otherwise the time on hover
  const gutter = el('div', 'message-gutter');
  if (startsGroup) {
    const avatarButton = el('button', 'avatar-button');
    avatarButton.type = 'button';
    avatarButton.dataset.userId = author.id;
    avatarButton.setAttribute('aria-label', `${author.displayName}'s profile`);
    avatarButton.append(avatar(author));
    gutter.append(avatarButton);
  } else {
    const time = el('time', 'message-hover-time', formatTime(message.timestamp));
    time.dateTime = message.timestamp;
    gutter.append(time);
  }

  const body = el('div', 'message-body');
  if (startsGroup) {
    const header = el('h3', 'message-header');
    const name = el('button', 'message-author', author.displayName);
    name.type = 'button';
    name.dataset.userId = author.id;
    const roleColor = getRoleColor(getActiveServer(), author.id);
    if (roleColor) {
      name.style.setProperty('--author-color', roleColor);
    }
    header.append(name);
    if (author.bot) {
      header.append(el('span', 'bot-tag', 'Bot'));
    }
    const time = el('time', 'message-time', formatTimestamp(message.timestamp));
    time.dateTime = message.timestamp;
    header.append(time);
    body.append(header);
  }

  body.append(el('div', 'message-content', message.content));

  item.append(gutter, body);
  return item;
}
```
:::

### Step 5 — Welcome header, date dividers, and the grouping rule

Below `createMessage`, add:

- `createChannelWelcome(channel)`: an `<li class="channel-welcome">` with a hash icon in a circle, a "Welcome to #name!" title and a line of text. It's the first item in every feed.
- `createDateDivider(timestamp)`: an `<li class="date-divider">` with `role="separator"` (so assistive technology knows it separates content) and the long date.
- `startsNewGroup(previous, message)`: the four-part rule from the concepts, joined with `||`. Because `||` stops at the first `true`, the check `!previous` comes first: if there's no previous message, the other checks (which would fail on `null`) never run.
- `isNearBottom()` and `scrollToBottom()`: the scroll helpers. `scrollToBottom` is exported, since later lessons call it after sending.

::: solution
```js [vanilla/js/chat.js]
// ---------- The whole feed ----------

function createChannelWelcome(channel) {
  const welcome = el('li', 'channel-welcome');
  const iconCircle = el('div', 'channel-welcome-icon');
  iconCircle.append(icon('hash'));
  welcome.append(
    iconCircle,
    el('h3', 'channel-welcome-title', `Welcome to #${channel.name}!`),
    el('p', 'channel-welcome-text', `This is the start of the #${channel.name} channel.`),
  );
  return welcome;
}

function createDateDivider(timestamp) {
  const divider = el('li', 'date-divider');
  divider.setAttribute('role', 'separator');
  divider.append(el('span', '', formatDate(timestamp)));
  return divider;
}

// A new group starts when the author changes, after 7 minutes, or on a new day.
function startsNewGroup(previous, message) {
  return (
    !previous ||
    previous.authorId !== message.authorId ||
    minutesBetween(previous.timestamp, message.timestamp) > 7 ||
    !isSameDay(previous.timestamp, message.timestamp)
  );
}

function isNearBottom() {
  return messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 80;
}

export function scrollToBottom() {
  messageList.scrollTop = messageList.scrollHeight;
}
```
:::

### Step 6 — Rebuild the feed

Replace the rest of `chat.js`. `renderMessages(channel)`:

1. works out whether the channel changed, whether you were near the bottom, and your current `scrollTop` **before** clearing the list (clearing resets scrolling);
2. clears the list and adds the welcome header;
3. loops over the channel's messages, adding a date divider whenever the day changes, then each message, passing `startsNewGroup(previous, message)`;
4. restores scrolling: to the bottom if the channel changed or you were already near it, otherwise to where you were.

`renderChat()` keeps updating the header and the placeholder, then calls `renderMessages`.

::: solution
```js [vanilla/js/chat.js]
function renderMessages(channel) {
  const channelChanged = channel.id !== renderedChannelId;
  const wasNearBottom = isNearBottom();
  const previousScrollTop = messageList.scrollTop;

  messageList.replaceChildren(createChannelWelcome(channel));
  let previous = null;
  for (const message of getMessages(channel.id)) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      messageList.append(createDateDivider(message.timestamp));
    }
    messageList.append(createMessage(message, startsNewGroup(previous, message)));
    previous = message;
  }

  // Stay at the bottom (newest messages) unless you had scrolled up to read.
  if (channelChanged || wasNearBottom) {
    scrollToBottom();
  } else {
    messageList.scrollTop = previousScrollTop;
  }
  renderedChannelId = channel.id;
}

export function renderChat() {
  const channel = getActiveChannel();
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;
  renderMessages(channel);
}
```
:::

### Step 7 — CSS

All changes are in `vanilla/css/chat.css`.

**a) The welcome header.** Add these rules right before `.message-list` (after the `/* ---------- Message feed ---------- */` comment):

::: solution
```css [vanilla/css/chat.css]
/* "Welcome to #general!" at the very top of a channel */
.channel-welcome {
  padding: 16px 16px 8px;
}

.channel-welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 8px;
  border-radius: 50%;
  background-color: var(--bg-input);
}

.channel-welcome-icon .icon {
  width: 42px;
  height: 42px;
  color: var(--text-strong);
}

.channel-welcome-title {
  color: var(--text-strong);
  font-size: 32px;
  font-weight: 700;
}

.channel-welcome-text {
  color: var(--text-muted);
}
```
:::

**b) Role color, avatar button, bot tag.** Change the existing `.message-author` rule so its color uses the variable, with the old color as the fallback (`var(--author-color, var(--text-strong))`: the second value is used when the variable isn't set). Then add `.avatar-button` and `.bot-tag` after it, and before `.message-author:hover`.

The bot tag uses `align-self: center`, as explained above.

::: solution
```css [vanilla/css/chat.css]
/* --author-color is the author's role color, set from JavaScript */
.message-author {
  color: var(--author-color, var(--text-strong));
  font-weight: 500;
}

.avatar-button {
  margin-top: 2px;
  border-radius: 50%;
}

.bot-tag {
  align-self: center;
  padding: 0 4px;
  border-radius: 3px;
  background-color: var(--brand-accent);
  color: white;
  font-size: 10px;
  font-weight: 600;
  line-height: 15px;
  text-transform: uppercase;
}
```
:::

### Step 8 — Try it

Reload (the saved state from earlier is fine: it contains the same messages).

1. `#general` opens scrolled to the bottom. Scroll up: you see the **Welcome to #general!** block at the very top, and dividers for each day.
2. Hover over a non-first message in a group: its time appears in the left column.
3. Switch to `#help` and back to `#general`: it jumps to the bottom again.
4. Open DevTools → Elements and find a message `<li>`: grouped messages have no `is-group-start` class and no `<h3>`.
5. Open the Console and type `document.querySelector('#message-list').scrollTop`: you get the number of pixels the feed is scrolled. Type `... .scrollHeight` and `... .clientHeight` to see the other two numbers, and check the formula from the concepts by hand.

<!-- no-solution: testing and exploring, nothing to type -->

## ✅ Checkpoint

- [ ] `time.js` exists with `isSameDay`, `minutesBetween`, `formatTime`, `formatDate` and `formatTimestamp`.
- [ ] Opening `#general` shows the newest message at the bottom and the welcome header at the top.
- [ ] Date dividers appear between days, with the full date.
- [ ] A run of messages from one author has a single avatar and name; later messages show their time on hover.
- [ ] Author names have role colors; Helper Bot has a **BOT** tag.
- [ ] In the Console, `document.querySelector('#message-list').scrollHeight` is larger than `clientHeight`.
- [ ] No errors in the Console.

## 🐛 Common mistakes

**The times are several hours different from the ones in `messages.json`.** That's expected: the file stores UTC (the `Z`), and the browser shows your local time. `10:15:00Z` is `6:15 AM` in New York in October, for example.

**Every message starts a new group, even from the same author.** `minutesBetween` is probably dividing by the wrong number, or you compared `previous.authorId` with something else. Print the values with `console.log` to check: a minute is `60000` milliseconds.

**The feed jumps to the top after every change, or stays at the top when you open a channel.** Set `scrollTop` **after** the new messages are added, not before. Setting it on an empty list does nothing.

**`Invalid Date` or `NaN` appears in the feed.** The timestamp is missing or malformed in the JSON, or you passed `undefined`. `new Date(undefined)` is an invalid date.

**The BOT tag stretches to full height, or sits on the baseline.** The `align-self: center` rule is missing from `.bot-tag`, or the rule is written outside the braces.

**`Cannot read properties of null (reading 'authorId')`.** You wrote the `startsNewGroup` conditions in the wrong order. The `!previous` check must come **first**, so the others are skipped when there is no previous message.

## 📝 Quiz

::: quiz
What does this print?

```js
const date = new Date('2026-12-25T12:00:00Z');
console.log(date.getMonth());
```

- [ ] `12`
- [ ] `25`
- [x] `11`
- [ ] `0`

> `getMonth()` counts from 0, so December is 11. (The timezone could shift the day by one, but not the month, for noon UTC on Dec 25.)
:::

::: quiz
A message list is 2000 px tall in total, its visible box is 500 px tall, and `scrollTop` is 1480. How far is the user from the bottom?

- [ ] 1480 px
- [x] 20 px
- [ ] 500 px
- [ ] 2000 px

> `scrollHeight - scrollTop - clientHeight` is 2000 - 1480 - 500 = 20. That's within the 80 px "near the bottom" range, so a re-render keeps the user at the bottom.
:::

::: quiz
Ava sends a message at 09:32:00 and another at 09:32:40, with nobody else posting in between. Does the second message start a new group?

- [ ] Yes, because the timestamps are different
- [x] No: same author, under 7 minutes, and the same day
- [ ] Yes, because every message gets its own header
- [ ] Only if it is the last message in the channel

> A new group starts only when there's no previous message, the author changes, more than 7 minutes pass, or the day changes. None of those is true here.
:::

## 💾 Commit

```sh
git add .
git commit -m "Group messages, add date dividers, role colors and bot tags"
git push
```
