---
lesson: 6
title: Flexbox and SVG icons
---

# Lesson 06 — Flexbox and SVG icons

So far everything in Hubbub is stacked from top to bottom, and the buttons say "Mute" and "Settings" in plain words. In this lesson you'll line things up in rows and columns with **flexbox**, and replace those words with proper icons drawn from an **SVG sprite**.

## 🎯 Goal

At the end, the server rail is a tidy column of centered round buttons, channel names have a `#` or speaker icon next to them, and the user panel at the bottom of the sidebar has three small icon buttons on the right:

![The dark Hubbub server rail on the left with a logo, five round server buttons and a green plus button, and below it the channel sidebar with a "Frontend Friends" header, channels with # icons, voice channels with speaker icons and the start of the user panel. The right side is empty because the chat column is still below.](/screenshots/lesson-06.png){.screenshot}

The screenshot only shows the top of the page. The rail and the sidebar are still stacked on top of each other, and the chat area is further down: putting the four big columns side by side is the job of Lesson 07. Scroll down in your own page and you'll see the chat header with its row of icon buttons, the messages with avatars on the left, and the message box with a `+` and an emoji icon.

## 🧠 New concepts

<ConceptList />

### Flexbox: lining things up in a row or a column

Normally the browser places block elements one under the other and inline things (like text) one after another. Flexbox gives you a different mode. You turn it on for **one parent element**, and that parent then lines up its **direct children** for you.

```css
.toolbar {
  display: flex;
}
```

- The parent with `display: flex` is the **flex container**.
- Its direct children become **flex items**. Grandchildren are not affected.
- By default the items sit in a **row**, left to right, as wide as their content.

::: tip Python comparison
Think of the container as a list and the items as its elements. Setting `display: flex` is like saying "treat these children as a sequence and lay them out along a line". Only the direct children are in the sequence, just as `len(my_list)` doesn't count the items inside a nested list.
:::

Text directly inside a flex container (not wrapped in a tag) also becomes a flex item. You'll see this in the category buttons, where an icon and the text `Text Channels` sit side by side.

### The two axes: main and cross

Everything in flexbox is described with two directions:

- The **main axis** is the direction the items are placed in.
- The **cross axis** is the direction at a right angle to it.

With the default `flex-direction: row`, the main axis runs left to right and the cross axis runs top to bottom. With `flex-direction: column` they swap: main runs top to bottom, cross runs left to right.

```text
flex-direction: row  (the default)

   main axis  ──────────────────────────────▶
  ┌──────────────────────────────────────────┐   cross
  │  ┌──────┐  ┌──────────┐  ┌────┐           │   axis
  │  │ item │  │  item 2  │  │ 3  │           │    │
  │  └──────┘  └──────────┘  └────┘           │    │
  └──────────────────────────────────────────┘    ▼


flex-direction: column

   cross axis ──────────▶
  ┌────────────────────┐
  │  ┌──────────────┐  │   main
  │  │    item 1    │  │   axis
  │  └──────────────┘  │    │
  │  ┌──────────────┐  │    │
  │  │    item 2    │  │    │
  │  └──────────────┘  │    ▼
  └────────────────────┘
```

Two properties on the container use these axes:

| Property | Works along | Common values |
| --- | --- | --- |
| `justify-content` | the **main** axis | `flex-start` (default), `center`, `flex-end`, `space-between` |
| `align-items` | the **cross** axis | `stretch` (default), `center`, `flex-start`, `flex-end`, `baseline` |

A way to remember it: `justify-content` decides where the leftover space on the main axis goes, and `align-items` decides how each item sits on the cross axis. Because the axes swap with `flex-direction`, so does what these properties do on screen. In a row, `align-items: center` centers vertically. In a column it centers horizontally.

You'll use `align-items: center` almost everywhere in this lesson. The values you'll meet:

- `center`: items are centered on the cross axis.
- `flex-start`: items hug the start of the cross axis (the top, in a row).
- `baseline`: items line up so that the bottoms of their first lines of text are on one line. Perfect for a name and a small timestamp next to it.

### `flex-direction`

`flex-direction` sets the main axis. `row` is the default. `column` stacks the items vertically. Setting `display: flex; flex-direction: column;` is the flexbox way to say "stack these, and let me use the flex tools on them".

### `gap`

`gap` puts a fixed space **between** flex items, and not before the first or after the last one:

```css
.toolbar {
  display: flex;
  gap: 8px;
}
```

It replaces the old habit of putting a margin on every child. You can write the value in the same units you learned for `margin`.

### Growing and shrinking: `flex` and `flex-shrink`

Items don't have to keep their natural size. Two ideas control what happens with leftover or missing space on the main axis:

- **`flex: 1`** (a shorthand) says "I'm willing to **grow** and take a share of the leftover space". If one item has `flex: 1` and the others don't, it stretches to fill everything that's left. Two items with `flex: 1` share the leftover space equally. The details of the shorthand are on [MDN's `flex` page](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex).
- **`flex-shrink`** controls whether an item may be squeezed smaller than its width when the container is too small. The default is `1` (yes, may shrink). **`flex-shrink: 0`** says "never squeeze me". You'll put it on avatars and icons so they never turn into ovals when a name is long.

### Pushing an item to the far end: `margin-left: auto`

Inside a flex container, an automatic margin absorbs all the free space on its side. So `margin-left: auto` on one item pushes it, and everything after it, to the right end of the row. This is the standard trick for "title on the left, toolbar on the right".

There's a catch you'll see in this lesson: leftover space is handed out to items with `flex: 1` first. If a neighbor already grows to take all the free space, nothing is left for the auto margin to absorb. We'll look at this in Step 5.

### The next-sibling combinator `+`

You know the descendant selector (a space) and combined classes. A third kind of selector relates two **siblings**, elements with the same parent:

```css
.server-list + .server-list {
  margin-top: 8px;
}
```

`A + B` selects a `B` that comes **immediately after** an `A`, with the same parent. Here, the first `.server-list` is not matched (nothing before it). The second and third are. This lets you put space *between* repeated things without putting extra space before the first one. See [MDN: next-sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Next-sibling_combinator).

### SVG icons from a sprite

**SVG** is an image format made of text: shapes described with numbers. Unlike a PNG it stays sharp at any size, and you can color it with CSS. An **SVG sprite** is one SVG file that holds many icons, each inside a `<symbol>` with its own `id`. You show one icon like this:

```html
<svg class="icon"><use href="assets/icons.svg#hash"></use></svg>
```

- `<svg>` is the element that draws the icon on your page. Because it's an image-like element, it needs a size (we give it one with the `.icon` class).
- `<use>` says "draw a copy of something defined elsewhere".
- `href="assets/icons.svg#hash"` has two parts: the file (`assets/icons.svg`, relative to your HTML page) and, after the `#`, the `id` of the `<symbol>` to draw (`hash` is the `#` channel icon). [MDN: `<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use).

Why bother? One file holds all icons, the browser downloads it once, and your HTML stays short.

### Coloring icons with `currentColor`

Every symbol in the sprite draws its lines with `stroke="currentColor"`. `currentColor` is a CSS keyword that means "whatever the text `color` is right here". So you don't color an icon with a special property: you set `color` on the icon (or on a parent) and the lines follow. Muted-gray buttons get muted-gray icons for free, and a green button gets a green plus.

::: info Icons need a real server
The `<use>` element loads another file. Browsers can block that when the page was opened straight from disk (a `file://` address), so use Live Server as in Lesson 00 and your icons will show. If they don't, check the address bar starts with `http://`.
:::

## 🛠️ Build it

Open your project in VS Code and start Live Server on `vanilla/index.html` as before.

### Step 1 — Add the icon sprite

Create the file `vanilla/assets/icons.svg` and paste the sprite into it. It's a long file of drawing instructions (the 24×24 grids and curves for each icon) that you don't need to type.

::: starter
<<< @/../solutions/lesson-06/vanilla/assets/icons.svg [vanilla/assets/icons.svg]
:::

Nothing changes on the page yet. The file only becomes visible once the HTML points at one of its icons. Scan the `id="..."` values in it: `hash`, `speaker`, `chevron-down`, `plus`, `mic`, `headphones`, `settings`, `members`, `bell`, `pin`, `search`, `inbox`, `help`, `emoji` and more. You'll use the ones in that list now, and the rest in later lessons.

<!-- no-solution: starter file is pasted, not typed -->

### Step 2 — Shared rules: avatars and icons

Open `vanilla/css/base.css`. Two places change.

First the **avatar**. In Lesson 05 it was an `inline-block` with `line-height` and `text-align` to center the letter. Flexbox does that job properly: center on both axes, and never let it shrink. Replace the whole `.avatar` rule with:

- `display: flex` makes the avatar a flex container. Its only child is the letter, which becomes the flex item.
- `align-items: center` centers the letter on the cross axis (vertically), and `justify-content: center` centers it on the main axis (horizontally).
- `flex-shrink: 0` keeps the circle round when the avatar sits in a crowded row.
- `line-height` and `text-align` are gone: flexbox centers the letter for you.

Second, replace the `/* ---------- Buttons with an icon ---------- */` section with an **Icons** section. `.icon` gives every SVG a size. Without a width and height an `<svg>` would be drawn at a default size, about 300 by 150 pixels, far too big. `.icon-button` becomes a square flex box that centers its icon, and `.icon-button .icon` (a descendant selector) makes icons inside such buttons a bit smaller.

::: solution
```css [vanilla/css/base.css]
/* ---------- Avatars ---------- */

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--gray);
  color: white;
  font-weight: 600;
}

/* ---------- Icons ---------- */

.icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-small);
  color: var(--text-muted);
}

.icon-button .icon {
  width: 20px;
  height: 20px;
}
```
:::

### Step 3 — The server rail

**HTML.** In `vanilla/index.html`, find the add-server button (the third `<ul class="server-list">` in the rail, the one with the `+`). Replace the `+` text with an icon:

::: solution
```html [vanilla/index.html]
<ul class="server-list">
  <li class="server-item">
    <button class="server-button add-server-button" type="button" aria-label="Add a Server">
      <svg class="icon"><use href="assets/icons.svg#plus"></use></svg>
    </button>
  </li>
</ul>
```
:::

The `aria-label` stays: an icon has no text, so the label is what a screen reader announces.

**CSS.** In `vanilla/css/server-rail.css` the plan is:

- Each `.server-list` becomes a **column** flex container with its icons centered horizontally and `8px` between them. This replaces the `margin-bottom: 8px` you put on every `.server-item`.
- The three lists need a gap *between* them, so use the next-sibling combinator.
- Each `.server-item` is a flex row that centers its button.
- Each `.server-button` is a flex container that centers its own content (the initials, the emoji or the `+` icon).
- The `+` gets the green color; `currentColor` makes the icon green too.
- The separator line no longer needs `margin: 0 auto 8px`, because the column's `align-items: center` and `gap` do that work.

Add the two new rules after `.server-rail`, change `.server-item` and `.server-button`, add `.add-server-button` after `.brand-logo`, and remove the `margin` line from `.server-separator`:

::: solution
```css [vanilla/css/server-rail.css]
/* A column of icons, centered, with 8px between them */
.server-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* The space between the three lists in the rail */
.server-list + .server-list {
  margin-top: 8px;
}

.server-item {
  display: flex;
  justify-content: center;
  width: 100%;
}

.server-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--bg-primary);
  color: var(--text-normal);
  font-size: 18px;
  font-weight: 500;
}

.add-server-button {
  color: var(--green);
}

/* The thin line under the home button */
.server-separator {
  width: 32px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--divider);
}
```

Unchanged in this file: `.server-rail`, `.server-button.is-emoji` and `.brand-logo`. Keep them where they are between the rules above.
:::

Save and look at the page. The server buttons are now a centered column.

### Step 4 — The channel sidebar

This step has three parts: the header, the category buttons and the channel buttons.

**HTML.** In `vanilla/index.html`, inside the `<aside class="channel-sidebar">`:

1. Add a chevron icon after the `<h1>` in the sidebar header.
2. In each category's `<h3>`, put a chevron icon before the text. Both categories use `chevron-down`.
3. In each channel button, put an icon before the `<span class="channel-name">`. Text channels use `hash`; the two voice channels use `speaker`.

Make the first of each by hand; to avoid typing the same line eight times, copy and paste the line and change the `<span>` text yourself.

::: solution
```html [vanilla/index.html]
<header class="sidebar-header">
  <h1 class="server-name" id="server-name">Frontend Friends</h1>
  <svg class="icon"><use href="assets/icons.svg#chevron-down"></use></svg>
</header>
<nav class="channel-list" id="channel-list" aria-label="Channel list">
  <section class="category">
    <h3><button class="category-toggle" type="button"><svg class="icon"><use href="assets/icons.svg#chevron-down"></use></svg>Text Channels</button></h3>
    <ul>
      <li class="channel-item is-selected">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#hash"></use></svg><span class="channel-name">general</span></button>
      </li>
      <li class="channel-item is-unread">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#hash"></use></svg><span class="channel-name">help</span></button>
      </li>
      <li class="channel-item">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#hash"></use></svg><span class="channel-name">showcase</span></button>
      </li>
      <li class="channel-item">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#hash"></use></svg><span class="channel-name">off-topic</span></button>
      </li>
    </ul>
  </section>
  <section class="category">
    <h3><button class="category-toggle" type="button"><svg class="icon"><use href="assets/icons.svg#chevron-down"></use></svg>Voice Channels</button></h3>
    <ul>
      <li class="channel-item">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#speaker"></use></svg><span class="channel-name">Lounge</span></button>
      </li>
      <li class="channel-item">
        <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#speaker"></use></svg><span class="channel-name">Pair Programming</span></button>
      </li>
    </ul>
  </section>
</nav>
```

Only the `<svg>` lines are new. Everything else is as it was in Lesson 05, and anything between this nav and the user panel stays unchanged.
:::

**CSS.** In `vanilla/css/channels.css`:

- `.channel-sidebar` becomes a column flex container. For now this only matters for the user panel's `flex-shrink: 0` below; in Lesson 10 it lets the channel list take the remaining height.
- `.sidebar-header` is a flex row with `align-items: center`, so the server name and the chevron share a vertical middle. Its padding changes from `12px 16px` to `0 16px`, because centering now does the vertical spacing. The header gets `color: var(--text-strong)`, which the chevron picks up through `currentColor`, and `flex-shrink: 0`.
- `.server-name` loses its `color` (the header sets it) and gets `flex: 1`: the name takes all free space, which pushes the chevron to the right edge.
- `.sidebar-header .icon` is a descendant selector that makes this chevron 18px.
- `.category-toggle` becomes a flex row (chevron + text) with `gap: 2px`, `width: 100%`, and `padding: 0 8px 4px 4px`. A `<button>` is not as wide as its container by default, so `width: 100%` makes the whole row clickable.
- `.category-toggle .icon` is 12px.
- `.channel-button` becomes a flex row with `gap: 6px`. A new `.channel-button .icon` rule sets 20px and the gray color. `.channel-name` gets `flex: 1`.

::: solution
```css [vanilla/css/channels.css]
.channel-sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
}

.sidebar-header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 16px;
  box-shadow: var(--header-shadow);
  color: var(--text-strong);
  flex-shrink: 0;
}

.server-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-header .icon {
  width: 18px;
  height: 18px;
}

.category-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  padding: 0 8px 4px 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.category-toggle .icon {
  width: 12px;
  height: 12px;
}

.channel-button {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin: 1px 0;
  padding: 6px 8px;
  border-radius: var(--radius-small);
  color: var(--text-muted);
  font-weight: 500;
  text-align: left;
}

.channel-button .icon {
  width: 20px;
  height: 20px;
  color: var(--gray);
}

.channel-name {
  flex: 1;
}
```

Unchanged rules (`.channel-list`, `.category`, `.channel-item`, `.channel-item.is-unread .channel-button`) stay where they are.
:::

### Step 5 — The user panel

The panel at the bottom of the sidebar holds a profile button (avatar plus two lines of text) and three icon buttons.

**HTML.** Replace the words `Mute`, `Deafen` and `Settings` inside the three `icon-button`s with icons (`mic`, `headphones`, `settings`):

::: solution
```html [vanilla/index.html]
<button class="icon-button" type="button" id="mute-button" aria-label="Mute">
  <svg class="icon"><use href="assets/icons.svg#mic"></use></svg>
</button>
<button class="icon-button" type="button" id="deafen-button" aria-label="Deafen">
  <svg class="icon"><use href="assets/icons.svg#headphones"></use></svg>
</button>
<button class="icon-button" type="button" id="settings-button" aria-label="User Settings">
  <svg class="icon"><use href="assets/icons.svg#settings"></use></svg>
</button>
```
:::

**CSS.** In `vanilla/css/channels.css`:

- `.user-panel` becomes a flex row, vertically centered, with `gap: 2px`. Padding goes from `6px 8px` to `0 8px` and `flex-shrink: 0` is added.
- `.user-panel-profile` is itself a flex row (avatar + names) with `gap: 8px`, and `flex: 1`, so the profile button takes all the room the three icon buttons don't need.
- In `.user-panel-profile .avatar` remove `line-height: 32px`.
- A new `.user-panel-names` is a flex **column**: name above status text.

::: solution
```css [vanilla/css/channels.css]
.user-panel {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 52px;
  padding: 0 8px;
  background-color: var(--bg-secondary-alt);
  flex-shrink: 0;
}

.user-panel-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 4px 2px;
  border-radius: var(--radius-small);
  text-align: left;
}

.user-panel-profile .avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.user-panel-names {
  display: flex;
  flex-direction: column;
}
```
:::

Save. The sidebar now looks like the screenshot. In the user panel the text may look cut off at the bottom of the screen; that's just because the page is taller than the window for now.

### Step 6 — The chat header

**HTML.** In `vanilla/index.html`, inside `<header class="chat-header">`:

1. Add a `hash` icon *before* the `<h2>`, with two classes: `icon chat-header-icon`.
2. Inside `<div class="chat-toolbar">`, replace the old two buttons (`Pins` and `Members`) by six icon buttons plus the search box, in this order: bell, pin, members, the search `<label>` (with a `search` icon after the input), inbox, help.

::: solution
```html [vanilla/index.html]
<header class="chat-header">
  <svg class="icon chat-header-icon"><use href="assets/icons.svg#hash"></use></svg>
  <h2 class="chat-title" id="chat-title">general</h2>
  <p class="chat-topic" id="chat-topic">Chat about anything frontend: HTML, CSS, JavaScript, React.</p>
  <div class="chat-toolbar">
    <button class="icon-button" type="button" aria-label="Notification Settings">
      <svg class="icon"><use href="assets/icons.svg#bell"></use></svg>
    </button>
    <button class="icon-button" type="button" aria-label="Pinned Messages">
      <svg class="icon"><use href="assets/icons.svg#pin"></use></svg>
    </button>
    <button class="icon-button" type="button" id="members-button" aria-label="Member List">
      <svg class="icon"><use href="assets/icons.svg#members"></use></svg>
    </button>
    <label class="search">
      <input class="search-input" type="search" placeholder="Search" aria-label="Search">
      <svg class="icon"><use href="assets/icons.svg#search"></use></svg>
    </label>
    <button class="icon-button" type="button" aria-label="Inbox">
      <svg class="icon"><use href="assets/icons.svg#inbox"></use></svg>
    </button>
    <button class="icon-button" type="button" aria-label="Help">
      <svg class="icon"><use href="assets/icons.svg#help"></use></svg>
    </button>
  </div>
</header>
```
:::

**CSS.** In `vanilla/css/chat.css`:

- `.chat-header` is a flex row, vertically centered, with `gap: 8px`.
- New `.chat-header-icon` colors the `#` gray (the other classes on the same element, `icon`, still give it its size).
- `.chat-topic` gets `flex: 1`: the topic grows and takes the free space.
- New `.chat-toolbar`: a flex row with `gap: 8px` and `margin-left: auto`.
- New `.search`: a flex row, vertically centered, holding the input and the magnifier.
- New `.search .icon`: 16px, muted color, and `margin-left: -24px`. The input is 144px wide and the icon follows it in the row. A **negative** margin pulls the icon 24px to the left, so it overlaps the right end of the input. It's a quick trick: Lesson 09 replaces it with a more robust technique.

Place `.chat-header-icon` after `.chat-header`, and `.chat-toolbar` and `.search` after `.chat-topic`. Put `.search .icon` after `.search-input`.

::: solution
```css [vanilla/css/chat.css]
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--header-height);
  padding: 0 8px 0 16px;
  box-shadow: var(--header-shadow);
}

.chat-header-icon {
  color: var(--gray);
}

.chat-topic {
  flex: 1;
  padding-left: 12px;
  margin-left: 4px;
  border-left: 1px solid var(--divider);
  color: var(--text-muted);
  font-size: 14px;
}

/* Pushes the toolbar to the right end of the header */
.chat-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.search {
  display: flex;
  align-items: center;
}

.search .icon {
  width: 16px;
  height: 16px;
  margin-left: -24px;
  color: var(--text-muted);
}
```

`.chat-title` and `.search-input` are unchanged.
:::

**An experiment (do it in DevTools, nothing to save).** Right-click the page, choose **Inspect**, select the `.chat-topic` paragraph and untick `flex: 1` in the Styles pane. The toolbar jumps to the right edge thanks to `margin-left: auto`. Tick `flex: 1` again: the topic now takes all the free space, so the toolbar is *still* at the right edge, but this time because the topic grew up against it. Both rules point at the same result here; the course keeps both, so the toolbar stays right-aligned even if the topic is removed later.

### Step 7 — Messages and the composer

**HTML.** The message HTML doesn't change in this lesson. In the composer, replace the `+` and the emoji character with icons (`plus` and `emoji`):

::: solution
```html [vanilla/index.html]
<form class="composer" id="composer">
  <button class="icon-button composer-button" type="button" aria-label="Upload a file">
    <svg class="icon"><use href="assets/icons.svg#plus"></use></svg>
  </button>
  <textarea class="composer-input" id="composer-input" rows="1" placeholder="Message #general" aria-label="Message"></textarea>
  <button class="icon-button composer-button" type="button" aria-label="Choose an emoji">
    <svg class="icon"><use href="assets/icons.svg#emoji"></use></svg>
  </button>
</form>
```
:::

**CSS.** In `vanilla/css/chat.css`:

- `.date-divider` becomes a flex container with `justify-content: center`. That replaces `text-align: center` (the single `<span>` inside is the flex item, centered on the main axis).
- `.message` becomes a flex row with `gap: 16px`: the gutter (avatar or time) on the left, the body on the right.
- `.message-gutter` gets `flex-shrink: 0` so it keeps its 40px.
- New `.message-body` with `flex: 1`: the text column takes the rest of the row.
- New `.message-header` is a flex row with `align-items: baseline` and `gap: 8px`: the author name and the small time line up on the baseline of their text, which looks more natural than centering them.
- `.composer` is a flex row with `align-items: flex-start` (items stick to the top rather than stretching) and `gap: 4px`.
- New `.composer-button` has `margin-top: 6px`, so that the 32px icon buttons are centered in the first 44px line of the box. `.composer-input` gets `flex: 1`, so the text area takes the space between the two buttons.

::: solution
```css [vanilla/css/chat.css]
.date-divider {
  display: flex;
  justify-content: center;
  margin: 24px 16px 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

/* Avatar (or time) on the left, the message on the right */
.message {
  display: flex;
  gap: 16px;
  padding: 2px 48px 2px 16px;
}

.message-gutter {
  width: 40px;
  flex-shrink: 0;
}

.message-body {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.composer {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin: 0 16px 24px;
  padding: 0 8px;
  border-radius: var(--radius);
  background-color: var(--bg-input);
}

.composer-button {
  margin-top: 6px;
}

.composer-input {
  flex: 1;
  min-height: 44px;
  padding: 11px 8px;
  resize: none;
}
```

Keep `.message.is-group-start`, `.message-author`, `.message-time, .message-hover-time` and `.message-content` as they were.
:::

### Step 8 — The member list

In `vanilla/css/members.css` the member row is the same pattern as the user panel: avatar on the left, two lines of text on the right.

- `.member` becomes a flex row, vertically centered, with `gap: 12px`.
- Remove `line-height: 32px` from `.member .avatar`.
- Add `.member-names` as a flex column.

::: solution
```css [vanilla/css/members.css]
.member {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 1px 0;
  padding: 4px 8px;
  border-radius: var(--radius-small);
  text-align: left;
}

.member .avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.member-names {
  display: flex;
  flex-direction: column;
}
```
:::

### Step 9 — Inspect the flex layout in DevTools

In Chrome DevTools, open the **Elements** panel. Elements that are flex containers show a small **flex** badge next to them. Click the badge on `.chat-header` and the page draws an overlay with the layout. Then select that element and open the **Layout** pane (next to Styles) to see its flex settings. You can edit `flex-direction` live in the Styles pane to see the main axis turn.

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] `vanilla/assets/icons.svg` exists, and the page is opened through Live Server (an `http://` address).
- [ ] The server rail is one centered column: logo, separator, five servers, then a green `+`.
- [ ] Each channel has a gray icon on its left: `#` for text channels, a speaker for voice channels. The category headings have a small chevron.
- [ ] In the user panel, a circle avatar, two lines of text and three icon buttons all sit on one line.
- [ ] Scrolling down, the chat header shows `#`, `general`, the topic, and a row of icon buttons and a search box at the right end.
- [ ] Message avatars are perfectly round with the letter centered. Author name and time share one line.
- [ ] The composer shows a `+` icon, the text area and an emoji icon in one row.
- [ ] DevTools: in the **Elements** panel, `.chat-header`, `.server-list` and `.message` carry a **flex** badge.
- [ ] DevTools → **Network**, reload: `icons.svg` appears with status **200**.

## 🐛 Common mistakes

**The icons don't show up (blank space where they should be).** The `href` doesn't match the file or the symbol id. The path is relative to `index.html`, so it must read `assets/icons.svg#hash`. Check for typos in the `id` after the `#`. If the address bar starts with `file://`, switch to Live Server. In **Network**, look for a red `icons.svg` row.

**An icon is huge.** An `<svg>` without a width and height is drawn at a default size, about 300×150. Check the element has `class="icon"` and that your `.icon` rule has `width` and `height`.

**An icon is the wrong color (black or white).** `currentColor` takes the `color` of the surrounding text. Set `color` on the icon or its parent (`.icon-button`, `.channel-button .icon`...), not `fill` or `background`.

**Nothing lines up even though you wrote `align-items`.** The properties `justify-content`, `align-items`, `gap` and `flex-direction` go on the **parent**, and the parent must have `display: flex`. `flex`, `flex-shrink` and `margin-left: auto` go on the **children**. Mixing them up does nothing and shows no error.

**The `+` or a child ignores your `gap` or alignment.** Only *direct* children become flex items. If an extra wrapper element sits between the container and the thing you want to move, put `display: flex` on the wrapper instead.

**An avatar turns into an oval in a long row.** Items can shrink when the row is too narrow. Give it `flex-shrink: 0`, as `.avatar` and `.icon` now have.

## 📝 Quiz

::: quiz
A container has `display: flex; flex-direction: column; align-items: center;`. Where do its children end up?

- [ ] In a row, centered vertically
- [ ] In a column, aligned to the left edge
- [x] In a column, each one centered horizontally
- [ ] In a row, centered horizontally

> `column` makes the main axis vertical, so children are stacked top to bottom. `align-items` works on the cross axis, which is now horizontal. That's how the server rail centers its buttons.
:::

::: quiz
What does this selector match?

```css
.server-list + .server-list {
  margin-top: 8px;
}
```

- [ ] Every `.server-list` that has another `.server-list` inside it
- [ ] Only the first `.server-list` on the page
- [x] A `.server-list` that comes immediately after another `.server-list` with the same parent
- [ ] Any `.server-list` anywhere after the first one, even in other parents

> `+` is the next-sibling combinator: both elements must share a parent and be directly next to each other. The first list has no list before it, so it gets no margin.
:::

::: quiz
Predict: what happens to the three icon buttons if `.user-panel-profile` loses its `flex: 1` line?

```css
.user-panel-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px;
}
```

- [ ] Nothing changes
- [x] The profile button shrinks to its content width, and the three icon buttons move left next to it, leaving empty space at the right of the panel
- [ ] The icon buttons disappear
- [ ] The profile button grows and covers the icon buttons

> `flex: 1` is what lets the profile absorb all leftover space on the row. Without it, every item is only as wide as its content and the free space stays at the end of the row.
:::

## 💾 Commit

```sh
git add .
git commit -m "Lay out the interface with flexbox and SVG icons"
git push
```
