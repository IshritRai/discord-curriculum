---
lesson: 10
title: "Overflow, scrolling & custom scrollbars"
---

# Lesson 10 — Overflow, scrolling & custom scrollbars

Right now, if the chat has too many messages the whole page grows and the message box is pushed off the bottom of the window. A real chat app keeps the window fixed and lets each column scroll by itself. You'll build that, and learn the one CSS rule everybody forgets: `min-height: 0`.

## 🎯 Goal

The app always fits the window exactly. The channel list, the chat messages and the member list each get their own scroll area, the message box stays at the bottom, long names end with an ellipsis (`…`) instead of wrapping or overflowing, and the scrollbars are thin and dark instead of the browser's default.

![The Hubbub layout filling the window: the chat shows messages from October 11 and October 12 with the last message partly hidden behind the message box at the bottom, the user panel shows "Learning fr..." cut with an ellipsis, and the sidebar and member list sit in their own columns.](/screenshots/lesson-10.png){.screenshot}

In the screenshot the chat is scrolled to the top, so you see the oldest messages, and the user panel's status text ends with "…". Scrollbars are not visible there. Whether you see them depends on your system. On Windows and Linux, Chrome normally draws classic scrollbars that are always visible whenever content overflows. macOS can hide them until you scroll (see the box in the next section). Scroll with the mouse wheel or trackpad over a column and check what you get.

## 🧠 New concepts

<ConceptList />

### Overflow: when content doesn't fit

Every element has a size. If its content is bigger than that, the extra content **overflows**: by default it's still drawn, spilling out of the box. The `overflow` property decides what to do instead:

| Value | What happens to the extra content |
| --- | --- |
| `visible` (default) | It spills out and is drawn anyway |
| `hidden` | It's **clipped**: cut off at the edge of the box |
| `auto` | The box becomes a **scroll area**, with a scrollbar only if the content is too big |

`overflow-y` applies to the vertical direction only (`overflow-x` to the horizontal one). `overflow-y: auto` means "scroll up and down if needed".

```css
.message-list {
  overflow-y: auto;
}
```

An element with `overflow` other than `visible` is called a **scroll container**: it's the one that scrolls, and everything inside it moves. For the scrolling to work, the box needs a limited height. A box that grows to fit its content has nothing to scroll.

### Why flex and grid items refuse to shrink

This is the trap of this lesson, so read it twice. Look at a column of three boxes in a container whose height is fixed:

```text
 container: height 300px (flex column)
 ┌───────────────┐
 │ header  48px  │
 ├───────────────┤
 │ list          │   flex: 1  ("take the remaining space")
 │  (content is  │
 │   900px tall) │   The remaining space is only 252px,
 │               │   but the list will NOT shrink below
 │               │   its content...
 ├───────────────┤
 │ composer 52px │   ...so the container overflows and
 └───────────────┘   the page gets taller than 300px.
```

Flex and grid **items** have an automatic minimum size: `min-height: auto` (and `min-width: auto`). In practice it means "never get smaller than your content". That's a good default, since it stops content from being squashed. But it ruins scroll areas, because a list that is allowed to be as small as its content never needs to scroll.

The fix is to say "you *may* shrink to nothing":

```css
.message-list {
  flex: 1;
  min-height: 0;      /* allowed to be smaller than its content */
  overflow-y: auto;   /* so it scrolls instead */
}
```

Now the remaining 252px is the list's real height, and the content scrolls inside it.

(A detail: an item that is itself a scroll container, with `overflow` set to something other than `visible`, already gets a minimum of 0. So on the list itself `min-height: 0` is a belt-and-braces. It really matters on the containers in between, which are not scroll containers.)

And it's not enough to fix only the list. The *chain* of containers from the window down to the list must all be limited in height, so every flex or grid item on that path needs `min-height: 0` too. If one link is missing, that link grows to fit its content and the page grows again.

```text
 .app           height: 100dvh                    ← fixed by the window
  └ .chat            grid item   → min-height: 0
     └ .chat-body       grid item   → min-height: 0
        └ .chat-main       grid item   → min-height: 0   (a flex column)
           └ .message-list    flex item   → overflow-y: auto (min-height: 0 too)
```

The same thing exists horizontally: `min-width: auto` stops a long line of text from letting its flex or grid item become narrower than the text, so the column gets pushed wider than the window. `min-width: 0` lifts it.

::: tip Python comparison
Think of a Python list that grows to hold every item you append. Without a limit it just keeps growing. `min-height: 0` + `overflow: auto` is like slicing it: "show me only this much, and let me scroll through the rest".
:::

### One scroll container per column

Design rule: each column that can have more content than room gets **its own** scroll container, and the page itself never scrolls. In Hubbub that's four:

| Column | Scroll container |
| --- | --- |
| server rail | `.server-rail` (scrollbar hidden) |
| channel sidebar | `.channel-list` (the user panel stays at the bottom) |
| chat | `.message-list` (the header and composer stay put) |
| members | `.member-list` |

### Truncating text with an ellipsis

A long name like `a-really-long-channel-name-that-never-ends` would wrap onto several lines, or push the layout. To end it with `…` instead you need **three properties together**:

```css
.channel-name {
  white-space: nowrap;      /* 1. don't wrap onto a second line */
  overflow: hidden;         /* 2. clip what doesn't fit */
  text-overflow: ellipsis;  /* 3. draw "…" where it's clipped */
}
```

`text-overflow: ellipsis` only works on text that is clipped by `overflow` and kept on one line. Remove either of the other two and it silently does nothing. And the element must have a *limited width* to overflow in. Inside flex containers that usually means adding `min-width: 0` to the flex items on the way down (the same trap as above).

### `pre-wrap` and `overflow-wrap`

Two properties for message text:

- `white-space: pre-wrap` keeps line breaks and runs of spaces from the source (like `<pre>` text does), but still wraps when a line is too long. Real chat messages need that, since people press <kbd>Shift</kbd>+<kbd>Enter</kbd> to write several lines. One consequence: spaces and line breaks *inside* the element in your HTML now count too, so a message's `<div>` text should start right after `>` and end right before `</div>`, as in the snapshot.
- `overflow-wrap: anywhere` lets the browser break a very long word, such as a URL with no spaces, anywhere to make it fit instead of overflowing.

### `display: none`

You met `visibility: hidden` in Lesson 08. The third way to hide, `display: none`, removes the element completely: no box, no space. You'll use it to hide the scrollbar of the server rail below.

### Styling scrollbars

The default scrollbar is bright and chunky next to a dark theme. There are two different tools, from different eras:

1. **`::-webkit-scrollbar`** and friends are **non-standard** pseudo-elements that work in Chrome, Edge and Safari. `::-webkit-scrollbar` is the whole bar, `::-webkit-scrollbar-thumb` the part you drag, `::-webkit-scrollbar-track` the groove behind it. You style them like any box (width, background, border-radius).
2. **`scrollbar-width`** (`auto`, `thin` or `none`) and **`scrollbar-color`** (thumb color then track color) are the **standard** properties, which Firefox supports.

[MDN notes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-scrollbar) that when an element's computed `scrollbar-color` or `scrollbar-width` is anything other than `auto`, browsers use that **instead of** the `::-webkit-scrollbar` styling. If you set both in one rule, the fancy webkit version is ignored in Chrome. The way out is to give each family to the browsers that need it, with `@supports`.

### `@supports`

`@supports` is a rule that applies the CSS inside it **only if the browser understands** something. Here it tests for a *selector* with the function `selector()`:

```css
@supports not selector(::-webkit-scrollbar) {
  .scroller {
    scrollbar-width: thin;
    scrollbar-color: var(--bg-tertiary) transparent;
  }
}
```

Read it as "if the browser does **not** know `::-webkit-scrollbar`, use the standard properties". Browsers with the webkit pseudo-elements ignore the block and keep the custom bars; Firefox uses the standard ones. See [MDN: `@supports`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@supports).

The class `scroller` is just a name of ours: any scroll area that should get the custom look carries it in the HTML.

::::: info Are my scrollbars always visible?
:::: os mac
On a Mac, the system setting "Show scroll bars" (Automatic, When scrolling, Always) decides whether classic scrollbars appear, and the default hides them until you scroll. Whether custom `::-webkit-scrollbar` styling shows up in each mode can vary, so don't be surprised if you only see the bars while scrolling. If you want to always see them, change the macOS setting to **Always**.
::::

:::: os windows linux
On Windows and Linux, Chrome normally shows classic scrollbars that stay visible whenever content overflows, so you will see the custom 8px bars right away. Some systems and Chrome versions use thin overlay scrollbars that only appear when you scroll or hover, so if you don't see them, scroll over the column first.
::::

We haven't tested every browser and operating system combination.
:::::

## 🛠️ Build it

### Step 1 — Add more messages and mark the scroll areas

Right now there isn't enough content to overflow anything. Open `vanilla/index.html`.

**Add the scroller class.** In three places, add `scroller` to the `class` attribute:

1. The `<nav class="channel-list" id="channel-list" ...>` in the sidebar.
2. The `<ol class="message-list" id="message-list">`.
3. The `<aside class="member-list" id="member-list" ...>`.

::: solution
```html [vanilla/index.html]
<nav class="channel-list scroller" id="channel-list" aria-label="Channel list">
```

```html [vanilla/index.html]
<ol class="message-list scroller" id="message-list">
```

```html [vanilla/index.html]
<aside class="member-list scroller" id="member-list" aria-label="Members">
```
:::

**Add older messages.** Paste this block as the **first children** of `<ol class="message-list ...">`, right after its opening tag and before the existing `<li class="date-divider" ...>` for October 13. It's two days of older chat so there's something to scroll.

::: starter
```html [vanilla/index.html]
              <!-- Older messages, so there's enough to scroll -->
              <li class="date-divider" role="separator"><span>October 11, 2026</span></li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">P</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Priya</button>
                    <time class="message-time" datetime="2026-10-11T09:12:00Z">10/11/2026 9:12 AM</time>
                  </h3>
                  <div class="message-content">Morning everyone ☀️ Reminder: the <strong>weekly code review</strong> thread opens at noon.</div>
                </div>
              </li>
              <li class="message">
                <div class="message-gutter"><time class="message-hover-time" datetime="2026-10-11T09:13:10Z">9:13 AM</time></div>
                <div class="message-body">
                  <div class="message-content">Post a link to your repo and say what kind of feedback you want.</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">L</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Leo</button>
                    <time class="message-time" datetime="2026-10-11T09:30:00Z">10/11/2026 9:30 AM</time>
                  </h3>
                  <div class="message-content">Quick question: what's the difference between <code>let</code> and <code>const</code>?</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">A</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Ava</button>
                    <time class="message-time" datetime="2026-10-11T09:32:00Z">10/11/2026 9:32 AM</time>
                  </h3>
                  <div class="message-content"><code>const</code> means the <em>variable</em> can't be reassigned. The object it points to can still change.</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">L</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Leo</button>
                    <time class="message-time" datetime="2026-10-11T09:35:00Z">10/11/2026 9:35 AM</time>
                  </h3>
                  <div class="message-content">ohhh that makes sense, thanks!</div>
                </div>
              </li>

              <li class="date-divider" role="separator"><span>October 12, 2026</span></li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">M</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Maya</button>
                    <time class="message-time" datetime="2026-10-12T14:03:00Z">10/12/2026 2:03 PM</time>
                  </h3>
                  <div class="message-content">Finished the hover animation for the server icons: the circle morphs into a rounded square. Way more satisfying than I expected.</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">R</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Ravi</button>
                    <time class="message-time" datetime="2026-10-12T14:05:00Z">10/12/2026 2:05 PM</time>
                  </h3>
                  <div class="message-content">how did you animate border-radius? I thought you couldn't transition that</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">M</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Maya</button>
                    <time class="message-time" datetime="2026-10-12T14:06:30Z">10/12/2026 2:06 PM</time>
                  </h3>
                  <div class="message-content">You can! <code>transition: border-radius 0.2s ease</code> works fine.</div>
                </div>
              </li>
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">N</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Noah</button>
                    <time class="message-time" datetime="2026-10-12T14:20:00Z">10/12/2026 2:20 PM</time>
                  </h3>
                  <div class="message-content">Bookmarking the docs for later: <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transition">https://developer.mozilla.org/en-US/docs/Web/CSS/transition</a></div>
                </div>
              </li>
              <!-- End of the older messages -->
```
:::

Save and look at the page. You've created the problem: the message list is much taller than the window, so the **whole page** now scrolls, the composer drops out of sight at the bottom of the page and the member list and the sidebar stretch with it. The next steps fix it.

<!-- no-solution: the starter above is pasted, the three class edits are shown above it -->

### Step 2 — Give every container in the chain `min-height: 0`

Open `vanilla/css/layout.css`. Add `min-height: 0` (and where text may overflow sideways, `min-width: 0`) to every grid or flex item on the way from the window to the lists:

- `.nav-drawer`: `min-height: 0`.
- `.chat`: `min-width: 0` and `min-height: 0`.
- `.chat-body`: `min-height: 0`.
- `.chat-main`: `min-width: 0` and `min-height: 0`.
- The `.channel-list, .message-list` rule gets `min-height: 0` and an explanatory comment.

::: solution
```css [vanilla/css/layout.css]
/* Server rail and channel sidebar side by side */
.nav-drawer {
  display: flex;
  min-height: 0;
}

/* The chat area: a header row on top, everything else below */
.chat {
  display: grid;
  grid-template-rows: var(--header-height) 1fr;
  min-width: 0;
  min-height: 0;
}

/* Below the header: messages on the left, member list on the right */
.chat-body {
  display: grid;
  grid-template-columns: 1fr auto;
  min-height: 0;
}

/* Messages fill the space, the composer sits at the bottom */
.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

/* Grid and flex children refuse to shrink below their content unless
   min-height is 0. Without this, the lists would push the page taller
   than the window instead of scrolling. */
.channel-list,
.message-list {
  flex: 1;
  min-height: 0;
}
```

`.app` is unchanged.
:::

### Step 3 — Make the columns scroll

Now add the actual scroll containers, and the `min-height: 0` for the sidebar and member list.

**`vanilla/css/channels.css`:**

- `.channel-sidebar` gets `min-height: 0`. In our tests in Chrome this one (like `.nav-drawer` and `.member-list` below) makes no visible difference, but it keeps the chain complete and does no harm.
- `.channel-list` gets `overflow-y: auto`.

::: solution
```css [vanilla/css/channels.css]
.channel-sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  min-height: 0;
  background-color: var(--bg-secondary);
}

.channel-list {
  padding: 0 8px 16px 0;
  overflow-y: auto;
}
```
:::

**`vanilla/css/chat.css`:** `.message-list` gets `overflow-y: auto`.

::: solution
```css [vanilla/css/chat.css]
.message-list {
  padding-bottom: 24px;
  overflow-y: auto;
}
```
:::

**`vanilla/css/members.css`:** `.member-list` gets `min-height: 0` and `overflow-y: auto`.

::: solution
```css [vanilla/css/members.css]
.member-list {
  width: var(--members-width);
  min-height: 0;
  padding: 0 8px 20px;
  overflow-y: auto;
  background-color: var(--bg-secondary);
}
```
:::

**`vanilla/css/server-rail.css`:** the rail scrolls too, on windows too short for all server icons, but without showing a scrollbar: the thin 72px column has no room for one. That's where `display: none` comes in, for the webkit scrollbar.

::: solution
```css [vanilla/css/server-rail.css]
.server-rail {
  width: var(--rail-width);
  padding: 12px 0;
  background-color: var(--bg-tertiary);
  overflow-y: auto;
  scrollbar-width: none; /* the rail scrolls, but without a visible scrollbar */
}

.server-rail::-webkit-scrollbar {
  display: none;
}
```
:::

Save. The page should stop scrolling as a whole: the window is full, the message box is at the bottom, and the message list scrolls on its own. Scroll in the chat: the header and composer stay put.

### Step 4 — Truncate long names with an ellipsis

Every place that shows a name or a short line gets the three-property recipe. In `vanilla/css/channels.css`:

- `.server-name` (the server title in the sidebar header)
- `.channel-name`
- `.user-panel-name` and `.user-panel-tag`, and give these two explicit line heights (`18px` and `13px`) so the two lines fit neatly; clipped text with `overflow: hidden` can lose the tops or bottoms of letters when the line is too short for them.
- `.user-panel-profile` and `.user-panel-names` get `min-width: 0` so they are allowed to be narrower than their text. Without it the ellipsis never appears, because the flex items refuse to shrink.

::: solution
```css [vanilla/css/channels.css]
.server-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Long names end with "…" instead of wrapping */
.channel-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-panel-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 4px 2px;
  border-radius: var(--radius-small);
  text-align: left;
}

.user-panel-names {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-panel-name {
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-panel-tag {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
:::

In `vanilla/css/members.css`, the same for the member name and status text, plus `min-width: 0` on `.member-names`:

::: solution
```css [vanilla/css/members.css]
.member-names {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.member-name {
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status-text {
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
:::

In `vanilla/css/chat.css`, the chat header: the header itself and the topic may shrink (`min-width: 0`); the title never wraps; the topic is truncated:

::: solution
```css [vanilla/css/chat.css]
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: var(--header-height);
  padding: 0 8px 0 16px;
  box-shadow: var(--header-shadow);
  z-index: 1; /* keeps the header's shadow on top of the messages */
}

.chat-title {
  color: var(--text-strong);
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.chat-topic {
  flex: 1;
  min-width: 0;
  padding-left: 12px;
  margin-left: 4px;
  border-left: 1px solid var(--divider);
  color: var(--text-muted);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
:::

Test it: make your browser window narrower, about 1000px wide. The topic in the chat header ends with `…` (the user panel's text already does). Don't go much narrower than about 800px yet: the layout can't shrink further and the page scrolls sideways until Lesson 11 fixes that. Each of these ellipses is the recipe at work.

### Step 5 — Message text: keep line breaks, break long words

In `vanilla/css/chat.css`, `.message-body` gets `min-width: 0` (so a long URL can't push the column wider than the window), and `.message-content` gets the two text properties:

::: solution
```css [vanilla/css/chat.css]
.message-body {
  flex: 1;
  min-width: 0;
}

.message-content {
  color: var(--text-normal);
  white-space: pre-wrap;    /* keep line breaks in messages */
  overflow-wrap: anywhere;  /* break very long words and links */
}
```
:::

The long link in Noah's message (a full MDN URL) now breaks to fit instead of stretching the chat.

### Step 6 — Custom scrollbars

Two files.

**`vanilla/css/base.css`:** add a **Scrollbars** section before the Icons section. It styles every element with the `scroller` class: an 8px wide bar with a dark thumb and a transparent track, plus the `@supports` fallback for Firefox:

::: solution
```css [vanilla/css/base.css]
/* ---------- Scrollbars ---------- */

/* Thin scrollbars for Chrome, Edge and Safari */
.scroller::-webkit-scrollbar {
  width: 8px;
}

.scroller::-webkit-scrollbar-thumb {
  background-color: var(--bg-tertiary);
  border-radius: 4px;
}

.scroller::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Firefox doesn't support ::-webkit-scrollbar, so it gets the standard properties */
@supports not selector(::-webkit-scrollbar) {
  .scroller {
    scrollbar-width: thin;
    scrollbar-color: var(--bg-tertiary) transparent;
  }
}
```
:::

**`vanilla/css/chat.css`:** the chat scrollbar is wider (16px) and has a visible track. A thick border in the chat's own background color around the thumb and the track makes them look inset. After the `.message-list` rule add three rules. The selector `.message-list.scroller::-webkit-scrollbar` joins two classes on one element, so it's more specific than the generic `.scroller::-webkit-scrollbar` and wins.

::: solution
```css [vanilla/css/chat.css]
/* The chat's scrollbar is wider, with a visible track like the real app */
.message-list.scroller::-webkit-scrollbar {
  width: 16px;
}

.message-list.scroller::-webkit-scrollbar-thumb {
  border: 4px solid var(--bg-primary);
  border-radius: 8px;
}

.message-list.scroller::-webkit-scrollbar-track {
  margin-bottom: 8px;
  border: 4px solid var(--bg-primary);
  border-radius: 8px;
  background-color: var(--bg-secondary);
}
```
:::

### Step 7 — Check it works

1. Scroll the chat. Only the message list moves. The header, the message box, the sidebar and the member list stay.
2. Make the window short (drag the bottom edge up, or use DevTools docked at the bottom). The channel list and the member list get their own scrollbars instead of the page growing.
3. In DevTools → Elements select `.chat-body` and untick `min-height: 0` in the Styles pane: the whole page grows taller than the window again, and the message box is pushed out of view. Tick it back, then try `.chat` and `.chat-main`: same result. This is the chain in action. If you untick `min-height: 0` on `.message-list` itself, nothing changes, because it is already a scroll container (see the detail above).

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] The page itself never scrolls: the message box is always visible at the bottom of the window.
- [ ] Scrolling over the chat moves only the messages. Scrolling over the member list or channel list moves only that column.
- [ ] The user panel's status text is cut with `…`, and so is the chat topic when the window is about 1000px wide or less.
- [ ] The long MDN link in Noah's message wraps inside the chat rather than widening it.
- [ ] Scrollbars (when visible) are thin and dark; the chat's one is wider with a lighter track.
- [ ] In DevTools → **Elements**, `.message-list` has `overflow-y: auto`; with `min-height: 0` unticked on `.chat-body` the page grows taller than the window.
- [ ] In DevTools → **Console** there are no errors, and **Network** shows every CSS file with status 200.

## 🐛 Common mistakes

**The page still scrolls as a whole, and the composer is pushed out of view.** One link of the chain is missing `min-height: 0`. In DevTools, work down from `.app` and check each container (`.chat`, `.chat-body`, `.chat-main`, `.message-list`). The one whose height is bigger than its parent's is the culprit. In our tests, `.chat`, `.chat-body` and `.chat-main` were the three that mattered.

**The list doesn't scroll even though it's too tall.** It needs `overflow-y: auto` (or `overflow: auto`) *and* a limited height. Both `min-height: 0` and `flex: 1` should be there too.

**No `…` appears on long text.** All three properties are required: `white-space: nowrap`, `overflow: hidden` and `text-overflow: ellipsis`. Also check that the element can actually become narrower than its text: flex items may need `min-width: 0`.

**The scrollbar styling has no effect.** Check the element has the `scroller` class. In Chrome, don't also set `scrollbar-width` or `scrollbar-color` on it: they override the webkit styling. On a Mac, check the "Show scroll bars" setting; on Windows and Linux, scroll over the element, because some systems only show overlay bars while you scroll.

**Messages look strangely spaced after adding `pre-wrap`.** The spaces and line breaks inside `.message-content` in the HTML are now visible. Keep the text on a single line directly between the tags: `<div class="message-content">text</div>`.

## 📝 Quiz

::: quiz
A flex column has a fixed height. Its child has `flex: 1; overflow-y: auto;` but the page still grows taller than the window. Which missing rule is the most likely fix?

- [ ] `height: auto` on the child
- [x] `min-height: 0` on the child's ancestors that are flex or grid items
- [ ] `overflow: visible` on `body`
- [ ] `display: block` on the child

> Flex and grid items default to `min-height: auto`, which won't let them shrink below their content. Each link in the chain from the fixed-height container down to the scroll area needs `min-height: 0` so the height limit can reach the scrolling element.
:::

::: quiz
Predict: what does this show for a multi-word name that's too long for one line of the box?

```css
.name {
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] The text is cut with `…` on one line
- [x] The text wraps onto several lines and no `…` appears
- [ ] The text overflows the box
- [ ] A horizontal scrollbar appears

> `text-overflow: ellipsis` only works when the text can't wrap. Without `white-space: nowrap`, the text just wraps onto more lines, and since `overflow: hidden` clips only the extra, you see several lines, not an ellipsis.
:::

::: quiz
Why does the scrollbar block in `base.css` use `@supports not selector(::-webkit-scrollbar)`?

- [ ] Because Firefox is faster that way
- [x] So browsers that don't know `::-webkit-scrollbar` get the standard `scrollbar-width` and `scrollbar-color`, while Chrome keeps the custom webkit bars (the standard properties would override them)
- [ ] Because `@supports` is required for every pseudo-element
- [ ] To make the scrollbar disappear on every browser

> When `scrollbar-width` or `scrollbar-color` is set, Chrome-style browsers use them instead of the `::-webkit-scrollbar` rules. Wrapping the standard properties in `@supports not selector(...)` gives each family of browsers the right one.
:::

## 💾 Commit

```sh
git add .
git commit -m "Make each column scroll and style the scrollbars"
git push
```
