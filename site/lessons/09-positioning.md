---
lesson: 9
title: "Positioning: badges, dots & layers"
---

# Lesson 09 — Positioning: badges, dots & layers

Flexbox and grid put things next to each other. But some interface details sit **on top of** other things: the green status dot on an avatar, the red "2" on a server icon, the white pill beside an unread channel. This lesson teaches the tool for that: CSS positioning.

## 🎯 Goal

Hubbub gets its small signals: status dots on avatars (green online, a yellow crescent for idle, a gray ring for offline), red mention badges on two servers and on the `help` channel, white "unread" pills at the left edge, a highlighted message that mentions you, and a magnifier icon inside the search box.

![The Hubbub layout with new details: a tall white pill and a red "1" badge on the selected FF server, small white pills and a red "2" badge on other server icons, a red "1" badge at the right of the help channel with a small white pill at its left, a yellow-highlighted first message with a yellow line on its left edge, small colored status dots on the member avatars, and a magnifier icon inside the search box.](/screenshots/lesson-09.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### Normal flow

Until now you haven't told elements *where* to go. The browser places them in **normal flow**: block elements stack from top to bottom, inline things run left to right, and flex and grid containers arrange their children. Every element has a **position** value, and its default is `static`, meaning "just follow the normal flow".

`position` changes that default. This lesson uses two values.

### `position: relative`

An element with `position: relative` stays exactly where it would be in normal flow. Its space is kept. Two things change:

1. You *may* shift it with the offset properties `top`, `right`, `bottom` and `left` (we won't, in this lesson).
2. It becomes a **reference point** for any absolutely positioned elements inside it. This second effect is the reason we use it here.

### `position: absolute`

An element with `position: absolute` is **taken out of the normal flow**: the layout acts as if it wasn't there, and it takes no space. You place it with the offsets, measured from its **containing block**: the nearest ancestor that is itself positioned (anything other than `static`). If there is none, it's measured from the whole page.

```css
.avatar {
  position: relative;   /* the reference point */
}

.status-dot {
  position: absolute;   /* placed relative to the avatar */
  right: -2px;
  bottom: -2px;
}
```

```text
 .avatar  (position: relative)
 ┌──────────────┐
 │              │
 │              │
 │              │          .status-dot  (position: absolute)
 │              │          right: -2px  → 2px outside the right edge
 └───────────┬──┴─┐        bottom: -2px → 2px outside the bottom edge
             │ ●  │
             └────┘
```

The offsets say how far the dot's **edges** are from the matching edges of the containing block: `right: -2px` puts its right edge 2px *beyond* the avatar's right edge, and `bottom: -2px` does the same at the bottom. A negative number moves outward.

If you forget `position: relative` on the parent, the dot flies off to a different reference point, often the corner of the page. That's the most common positioning bug. See [MDN: containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block) for the full rules.

::: tip Python comparison
A relative parent is like passing the right *context* to a function: the absolute child "looks up" the nearest parent that offers a reference point, much like Python looks up a name through enclosing scopes. If no enclosing scope has it, it ends up in the outermost one, the page.
:::

### The four offsets: `top`, `right`, `bottom`, `left`

They take lengths or percentages of the containing block: `top: 10px` (10px from its top edge), `left: 50%` (half the containing block's width from its left edge). Use at most one of `top`/`bottom` and one of `left`/`right` per element, usually.

### Centering with `top: 50%` and `translateY(-50%)`

How do you center an absolutely positioned element vertically? `top: 50%` puts its **top edge** at the middle of the container: the element hangs below the middle. You'd want its *center* there. A **transform** can fix this. `transform: translateY(-50%)` moves an element up by half of **its own height**:

```css
.pill {
  position: absolute;
  top: 50%;                      /* top edge at the middle... */
  transform: translateY(-50%);   /* ...then up by half my own height */
}
```

For both directions at once, `translate(-50%, -50%)` takes two values (x then y). Percentages in `top`/`left` are relative to the **container**; percentages in `translate` are relative to the **element itself**. That difference is the whole trick.

### `z-index`: what sits on top

Positioned elements can overlap, so which one is drawn on top? As a rule, elements later in the HTML are drawn over earlier ones, and positioned elements are drawn over non-positioned ones. `z-index` is a whole number that overrides it: higher numbers are drawn above lower ones. It applies to positioned elements (and also to flex and grid items). You'll use a small value like `1`.

```css
.chat-header {
  z-index: 1;
}
```

Use `z-index` sparingly: when many numbers pile up, nobody remembers why. For one more detail on how layers group together, see [MDN: stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context).

### `pointer-events: none`

An overlaid decoration can get in the way of the mouse: you click the magnifier icon, and nothing happens in the text box beneath it. `pointer-events: none` makes the mouse **ignore** an element: clicks and hovers go to whatever is underneath it.

### `content-box` for badges

The page's global `box-sizing: border-box` makes `width` and `height` include padding and border. For a badge with a thick ring around it that isn't what we want. We write `min-width: 16px; height: 16px` for the *red part*, and then add a 4px border outside it. So the badge switches back to `box-sizing: content-box`, where the sizes describe only the content area and padding and border are added around it. With `border-box`, the 16px height would have to include two 4px borders and only 8px would be left for the number.

### `var()` with a fallback

You know `var(--name)`. It takes an optional second argument, the **fallback** used when the variable isn't defined:

```css
border: 3px solid var(--status-ring, var(--bg-secondary));
```

"Use `--status-ring` if it's set here or on an ancestor, otherwise use `--bg-secondary`." Custom properties are inherited, so you can set `--status-ring` on a container and every status dot inside it picks it up. The dot's ring should match whatever is behind the avatar. The member list uses the fallback (its background is `--bg-secondary`). The user panel, whose background is darker, sets `--status-ring` to its own color.

## 🛠️ Build it

### Step 1 — New theme variables

In `vanilla/css/theme.css`, after the `--text-link` line and before the `/* Status colors */` comment, add the colors for messages that mention you:

::: solution
```css [vanilla/css/theme.css]
  --text-link: #00a8fc;

  /* Mentions of you */
  --mention-bg: rgba(240, 178, 50, 0.1);
  --mention-border: #f0b232;

  /* Status colors */
```

The `--text-link` line and the comment are only there so you can find the place: add the three new lines between them.
:::

### Step 2 — The HTML: add the markup the styles will target

Every change below is in `vanilla/index.html`.

**Server rail.** Add `is-unread` to three server items (Pixel Art Club, Study Group, Game Night), and put a `<span class="mention-badge">` with a number *inside the button*, after the initials, on the `FF` button (1) and the `SG` button (2):

::: solution
```html [vanilla/index.html]
<ul class="server-list" id="server-list">
  <li class="server-item is-active">
    <button class="server-button" type="button" aria-label="Frontend Friends">FF<span class="mention-badge">1</span></button>
  </li>
  <li class="server-item is-unread">
    <button class="server-button is-emoji" type="button" aria-label="Pixel Art Club">🎨</button>
  </li>
  <li class="server-item">
    <button class="server-button is-emoji" type="button" aria-label="Weekend Hikers">🥾</button>
  </li>
  <li class="server-item is-unread">
    <button class="server-button" type="button" aria-label="Study Group">SG<span class="mention-badge">2</span></button>
  </li>
  <li class="server-item is-unread">
    <button class="server-button is-emoji" type="button" aria-label="Game Night">🎲</button>
  </li>
</ul>
```
:::

**Channel.** In the `help` channel button, add a badge after the channel name:

::: solution
```html [vanilla/index.html]
<li class="channel-item is-unread">
  <button class="channel-button" type="button"><svg class="icon"><use href="assets/icons.svg#hash"></use></svg><span class="channel-name">help</span><span class="channel-mention-badge">1</span></button>
</li>
```
:::

**Your avatar in the user panel.** Add the class `status-online` and an empty `<span class="status-dot">` after the letter:

::: solution
```html [vanilla/index.html]
<span class="avatar status-online" id="user-panel-avatar">S<span class="status-dot"></span></span>
```
:::

**A message that mentions you.** Add `is-mention` to Ava's message (the first one, which says "Hey @Sam"):

::: solution
```html [vanilla/index.html]
<li class="message is-group-start is-mention">
```
:::

**Members.** Each member avatar gets a status class and a status dot. Ava, Noah, Ravi and Sam are `status-online`, Leo is `status-idle`, and Kenji and Nora are `status-offline`. Edit the `<span class="avatar">` line of each of the seven members:

::: solution
```html [vanilla/index.html]
<!-- Ava -->
<span class="avatar status-online">A<span class="status-dot"></span></span>
<!-- Leo -->
<span class="avatar status-idle">L<span class="status-dot"></span></span>
<!-- Noah -->
<span class="avatar status-online">N<span class="status-dot"></span></span>
<!-- Ravi -->
<span class="avatar status-online">R<span class="status-dot"></span></span>
<!-- Sam -->
<span class="avatar status-online">S<span class="status-dot"></span></span>
<!-- Kenji -->
<span class="avatar status-offline">K<span class="status-dot"></span></span>
<!-- Nora -->
<span class="avatar status-offline">N<span class="status-dot"></span></span>
```

The HTML comments above only say which member each line belongs to; you don't need to type them. The `<span class="avatar...">` is the first line inside each `<button class="member">`.
:::

Nothing has changed visually except the red badge numbers and dots showing up as plain text. That's expected; the CSS is next.

### Step 3 — Avatars and status dots (`base.css`)

Two parts: the avatar becomes the reference point, and the dots are positioned against it.

- `.avatar` gets `position: relative` as its first declaration.
- `.status-dot`: absolutely positioned at the bottom-right corner, a 14px circle with a 3px ring in the surrounding background color (so it looks cut out of the avatar), gray by default.
- Each status picks the dot's look. `.status-online .status-dot` is green. Idle is transparent with an **inset** shadow in yellow: an inset `box-shadow` is drawn *inside* the box, and offsetting it by `-3px -1px` leaves a yellow crescent on one side. Do-not-disturb is red with a small bar made by an `::after` pseudo-element centered in the dot using the `top: 50%` + `translate(-50%, -50%)` trick. Offline is the ring color inside, with a 2px gray inset ring around it.

The page doesn't use do-not-disturb yet. To see it, change a member's class from `status-online` to `status-dnd` in DevTools.

Add these rules after `.avatar` and before the Icons section:

::: solution
```css [vanilla/css/base.css]
.avatar {
  position: relative;
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

/* The status dot sits on the bottom-right corner of an avatar.
   --status-ring is the color around it (the background behind the avatar). */
.status-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--status-ring, var(--bg-secondary));
  background-color: var(--gray);
}

.status-online .status-dot {
  background-color: var(--green);
}

/* Idle: a moon shape made from an inset shadow */
.status-idle .status-dot {
  background-color: transparent;
  box-shadow: inset -3px -1px 0 0 var(--yellow);
}

/* Do not disturb: red with a short bar in the middle */
.status-dnd .status-dot {
  background-color: var(--red);
}

.status-dnd .status-dot::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--status-ring, var(--bg-secondary));
  transform: translate(-50%, -50%);
}

/* Offline: a gray ring */
.status-offline .status-dot {
  background-color: var(--status-ring, var(--bg-secondary));
  box-shadow: inset 0 0 0 2px var(--gray);
}
```
:::

### Step 4 — Server rail pills and badges (`server-rail.css`)

- `.server-item` gets `position: relative`: the pill will be placed against it.
- `.server-item::before` is the white pill on the rail's left edge. It's absolutely positioned at `left: 0`, vertically centered with `top: 50%` and `translateY(-50%)`. It is 8px wide with `margin-left: -4px`, which slides half of it off the left edge of the window so only a rounded 4px stub shows. Its `height` starts at `0` (invisible), and a transition animates height changes.
- Three more rules give it a height depending on the state: `8px` for `is-unread`, `20px` on hover, `40px` for `is-active`. **Order matters**: they have equal specificity, so the later one wins. Selected comes last, so a selected server stays tall even when hovered.
- `.server-button` gets `position: relative` for its badge.
- `.mention-badge` goes at the end of the file: absolute at the bottom-right corner, with `box-sizing: content-box`, a 4px border colored like the rail's background (so it looks cut out of the icon) and the red fill.

::: solution
```css [vanilla/css/server-rail.css]
.server-item {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

/* The white pill on the left edge: small = unread, medium = hover, tall = selected */
.server-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 8px;
  height: 0;
  margin-left: -4px;
  border-radius: 0 4px 4px 0;
  background-color: var(--text-strong);
  transform: translateY(-50%);
  transition: height 0.15s ease;
}

.server-item.is-unread::before {
  height: 8px;
}

.server-item:hover::before {
  height: 20px;
}

.server-item.is-active::before {
  height: 40px;
}

.server-button {
  position: relative;
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
  transition: border-radius 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

/* Red badge with the number of mentions, on the icon's bottom-right corner */
.mention-badge {
  position: absolute;
  right: -4px;
  bottom: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  box-sizing: content-box;
  border: 4px solid var(--bg-tertiary);
  background-color: var(--red);
  color: white;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}
```

Only `position: relative` is new in `.server-item` and `.server-button`. `.mention-badge` goes at the very end of the file, after `.server-separator`, and `.server-item::before` plus its three state rules go right after `.server-item`.
:::

### Step 5 — Channel pill, channel badge and the user panel (`channels.css`)

- `.channel-item` gets `position: relative`.
- `.channel-item.is-unread::before` is another white pill, this time 4px wide and 8px tall, at the left edge of the channel item.
- `.channel-mention-badge` is the red badge at the right end of a channel row. It isn't absolutely positioned: `.channel-name` has `flex: 1` and pushes it to the right.
- `.user-panel` defines `--status-ring` with its own background color, so the status dot on your avatar blends in. Remember: custom properties are inherited by everything inside.

::: solution
```css [vanilla/css/channels.css]
.channel-item {
  position: relative;
  padding-left: 8px;
}

/* The small white pill for unread channels */
.channel-item.is-unread::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 8px;
  border-radius: 0 4px 4px 0;
  background-color: var(--text-strong);
  transform: translateY(-50%);
}

.channel-mention-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: var(--red);
  color: white;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 52px;
  padding: 0 8px;
  background-color: var(--bg-secondary-alt);
  flex-shrink: 0;
  --status-ring: var(--bg-secondary-alt);
}
```

`.channel-item.is-unread::before` goes right after `.channel-item`. `.channel-mention-badge` goes after `.channel-item.is-selected .channel-button` and before `.user-panel`.
:::

### Step 6 — The chat header, search box and mention (`chat.css`)

- `.chat-header` gets `z-index: 1`. Why: its shadow (the thin line under it) is a `box-shadow` drawn *outside* the header's box, over whatever is below. Positioned elements are painted above non-positioned ones, and messages are now positioned (see below), so a message's background could cover that thin shadow. `z-index` on the header (a grid item, so it counts) lifts it above. The difference is subtle, a faint line, so don't worry if you can't spot it.
- `.search` gets `position: relative`: the magnifier will be placed against the search label.
- `.search-input` gets right padding of 28px (`padding: 0 28px 0 8px`) so typed text never runs under the icon.
- `.search .icon` is now absolute, 6px from the right. We don't set `top` here: the label is a flex container with `align-items: center`, and the icon keeps its vertically centered position. Delete the old `margin-left: -24px`. `pointer-events: none` lets clicks pass through to the input.
- `.message` gets `position: relative`. It has no visible effect today; later lessons place an absolutely positioned toolbar inside each message.
- `.message.is-mention` gets the yellow tint and a 2px inset line on the left. After the `.message:hover` rule.

::: solution
```css [vanilla/css/chat.css]
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--header-height);
  padding: 0 8px 0 16px;
  box-shadow: var(--header-shadow);
  z-index: 1; /* keeps the header's shadow on top of the messages */
}

.search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 144px;
  height: 24px;
  padding: 0 28px 0 8px;
  border-radius: var(--radius-small);
  background-color: var(--bg-tertiary);
  font-size: 14px;
  transition: width 0.25s ease;
}

/* The magnifying glass sits inside the search box */
.search .icon {
  position: absolute;
  right: 6px;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none; /* clicks go through it to the input */
}

/* Avatar (or time) on the left, the message on the right */
.message {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 2px 48px 2px 16px;
}

.message:hover {
  background-color: var(--bg-message-hover);
}

/* Messages that mention you */
.message.is-mention {
  background-color: var(--mention-bg);
  box-shadow: inset 2px 0 0 var(--mention-border);
}
```

`.search-input:focus` and the other rules in the file stay as they were.
:::

### Step 7 — Break it on purpose in DevTools

1. Select an `.avatar` in the member list. In **Styles**, untick `position: relative`. The status dot leaves its avatar and jumps elsewhere (to the nearest *other* positioned ancestor, or to the page corner). Tick it again.
2. Select a `.status-dot` and change `right` and `bottom` to `10px`: the dot moves *into* the avatar. Positive numbers move inward.
3. Select the `.search .icon` and untick `pointer-events`. Click on the magnifier: when `pointer-events` is on, the click goes through to the input, and it gets focus.
4. Select Leo's `<span class="avatar status-idle">` in the Elements panel and change `status-idle` to `status-dnd`: the red do-not-disturb dot appears.

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] FF has a tall white pill on the left edge and a red `1` badge; Study Group has a small pill and a red `2`. Pixel Art Club and Game Night have small pills only.
- [ ] Hovering a server grows its pill (to a medium height); the pill grows with a short animation.
- [ ] `help` has a small white pill at its left and a red `1` at the right of its row.
- [ ] The member avatars have dots: green (Ava, Noah, Ravi, Sam), yellow crescent (Leo) and a gray ring (Kenji, Nora). Your own avatar in the user panel has a green dot with a dark ring.
- [ ] Ava's first message has a yellow tint and a yellow line on its left edge.
- [ ] The magnifier is inside the search box, at the right. Typing a long search never goes under it.
- [ ] DevTools: selecting a `.status-dot` and looking at the box-model overlay shows it extends 2px outside its avatar.

## 🐛 Common mistakes

**The dot or badge appears in the page's corner.** Its parent isn't positioned. An `absolute` element measures from the nearest positioned ancestor; add `position: relative` to the element it should sit on (`.avatar`, `.server-button`, `.server-item`).

**The pill (or the `::before` anything) is missing.** Pseudo-elements need `content`, even `content: ""`. An unread pill also needs a height (or the `height: 0` stays), so check that the HTML has the `is-unread` class.

**The pill or dot isn't centered.** `top: 50%` alone puts the *top edge* in the middle. Add `transform: translateY(-50%)`. Note the `Y`: `translateX` would move it sideways.

**The badge number is squeezed or its ring is too thin.** Check that `.mention-badge` keeps `box-sizing: content-box`. With the global `border-box`, the 4px borders eat into the 16px height.

**A selected server's pill shrinks when hovered.** Rule order. The `is-active` rule must come after the `:hover` rule, because they have the same specificity and the later one wins.

**Clicking the magnifier doesn't focus the search box.** The icon is missing `pointer-events: none`, so it catches the click instead of the input behind it.

## 📝 Quiz

::: quiz
Where is the red dot drawn?

```html
<div class="card">
  <span class="dot"></span>
</div>
```

```css
.dot {
  position: absolute;
  top: 0;
  right: 0;
}
```

- [ ] In the top-right corner of `.card`
- [x] In the top-right corner of the page (or of the nearest positioned ancestor), because `.card` is not positioned
- [ ] Inside `.card`, centered
- [ ] Nowhere, `position: absolute` needs `z-index`

> An absolute element is measured from the nearest ancestor that is positioned. `.card` has the default `position: static`, so the browser keeps looking up. Add `position: relative` to `.card` to get the corner of the card.
:::

::: quiz
You want a decorative bar centered vertically inside its container, which is `position: relative`. Which declarations do it?

- [ ] `position: absolute; top: 50%;`
- [x] `position: absolute; top: 50%; transform: translateY(-50%);`
- [ ] `position: relative; top: 50%; bottom: 50%;`
- [ ] `position: absolute; transform: translateY(50%);`

> `top: 50%` aligns the element's top edge to the middle. Pulling it back up by half its own height with `translateY(-50%)` centers it.
:::

::: quiz
What does `border: 3px solid var(--status-ring, var(--bg-secondary));` do if `--status-ring` is not defined anywhere?

- [ ] The whole declaration is invalid and the border disappears
- [ ] The border is black
- [x] The border uses `--bg-secondary`, the fallback
- [ ] The border uses `--status-ring` from the `:root`

> The second argument of `var()` is the fallback. It's used when the variable isn't set on the element or any of its ancestors.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add status dots, mention badges and unread pills with positioning"
git push
```
