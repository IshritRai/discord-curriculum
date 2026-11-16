---
lesson: 7
title: "Grid: the app shell"
---

# Lesson 07 — Grid: the app shell

Hubbub's four big regions (server rail, channel sidebar, chat, member list) are still stacked on top of each other. In this lesson you'll use **CSS grid** to put them where they belong and make the app fill the browser window.

## 🎯 Goal

The page looks like a real chat app: server rail and channel sidebar on the left, the chat in the middle with its header on top and the message box at the bottom, and the member list on the right. The user panel sits at the bottom of the sidebar.

![The complete Hubbub layout in four columns: a narrow dark rail of round server buttons, the channel sidebar with channel names and the user panel at its bottom, the chat area with a header, five messages and a message box at the bottom, and the member list on the right grouped into Admin, Online and Offline.](/screenshots/lesson-07.png){.screenshot}

You'll notice a few rough spots: the small timestamps next to grouped messages wrap onto two lines ("10:23" and "AM"), and the user panel's status text wraps. Later lessons fix those. One more limit: the page as a whole can still scroll if the content is taller than the window. Lesson 10 makes each column scroll on its own.

## 🧠 New concepts

<ConceptList />

### Grid: rows and columns you define

Flexbox lays items out along **one** line (a row *or* a column). **Grid** lays them out in **two dimensions** at once: you define the columns and rows on the parent, and the children are placed into the cells.

```css
.app {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

- `display: grid` makes the element a **grid container**. Its direct children are **grid items**.
- `grid-template-columns` lists the width of each **column track**, separated by spaces. Two values here means two columns.
- `grid-template-rows` does the same for rows. If you don't list rows, the browser creates them as needed, one per row of items, as tall as their content.

With two columns, the first two children go into row 1, the next two into row 2, and so on, filling cells left to right.

### The `fr` unit and `auto`

A track size can be a fixed length like `200px`, but usually you want "take what's left". Two tools do that:

- **`fr`** is a **fraction of the free space**. `1fr` takes one share of the space left over after the fixed and `auto` tracks are placed. With `1fr 2fr` the second column is twice as wide as the first. A single `1fr` takes all the space that's left.
- **`auto`** sizes a track to fit its content (it can also stretch if there's room).

So `grid-template-columns: auto 1fr` means: "the first column is exactly as wide as its content needs, and the second takes everything else". That is our app: the left part (rail + sidebar) has a fixed size set by its own contents, and the chat fills the rest, no matter how wide the window is.

Rows work the same way: `grid-template-rows: 48px 1fr` is a 48px row on top, with the second row filling the remaining height.

You can also use a CSS variable as a track size: `var(--header-height)` is replaced by `48px`.

See [MDN: `grid-template-columns`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns) for all the other things a track can be.

### Grid or flexbox?

They work well together. A rule of thumb:

| Use… | When… | In Hubbub |
| --- | --- | --- |
| **Flexbox** | You line items up along **one direction** and the content decides the sizes | the icon + text in a button, a row of toolbar buttons |
| **Grid** | You are laying out **regions** in two directions and want to say how big each region is | the whole app, the chat header + body, messages + member list |

Don't treat it as a contest. Often the page skeleton is a grid and the pieces inside are flex rows and columns.

### The app shell as nested layouts

A layout rarely uses one big grid. It's a set of **nested** containers, each one handling a single decision. Hubbub's:

```text
.app                      grid: columns  auto | 1fr          (height: the window)
├── .nav-drawer           flex row                           (rail + sidebar side by side)
│   ├── .server-rail
│   └── .channel-sidebar  flex column   (list grows, user panel at the bottom)
└── .chat                 grid: rows  48px | 1fr
    ├── .chat-header      (flex row, from Lesson 06)
    └── .chat-body        grid: columns  1fr | auto
        ├── .chat-main    flex column   (messages grow, composer at the bottom)
        └── .member-list  (its own fixed width)
```

Or as a picture of the screen:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ .app                                                                      │
│ ┌──── .nav-drawer ─────┐ ┌──────────────────── .chat ──────────────────┐  │
│ │ rail │ sidebar       │ │ .chat-header                      (48px)    │  │
│ │      │               │ ├────────────────────────────────┬────────────┤  │
│ │      │               │ │ .chat-main                     │ .member-   │  │
│ │      │               │ │   .message-list  (grows)       │  list      │  │
│ │      │ user panel    │ │   .composer      (bottom)      │            │  │
│ └──────────────────────┘ └────────────────────────────────┴────────────┘  │
│        auto                              1fr                              │
└───────────────────────────────────────────────────────────────────────────┘
```

::: tip Python comparison
This is the same habit as splitting a program into functions: each container does one job (put two things side by side, or stack header over body), and a complex page comes from nesting simple ones.
:::

### `vh` and `dvh`: the height of the window

To make the app as tall as the window, you need a length that means "the window's height". CSS has **viewport units**:

- `100vh` means 100% of the viewport height (the visible part of the page). `1vh` is 1%.
- `100dvh` is "100 **dynamic** viewport height". On phones, browsers show and hide their address bar as you scroll, so the visible height changes. The plain `vh` unit is based on a fixed size that doesn't follow those changes, so `100vh` can be taller than what you can actually see. `dvh` follows the visible area. (MDN explains the viewport units on its [length page](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length).)

`dvh` is newer, and an old browser won't know it. The standard way to be safe is to write **both**, `vh` first:

```css
.app {
  height: 100vh;
  height: 100dvh;
}
```

A browser ignores a declaration whose value it doesn't understand. So an old browser throws away the `dvh` line and keeps `100vh`. A modern browser understands both, and since the later one wins, it uses `100dvh`. On a laptop both are the same.

## 🛠️ Build it

### Step 1 — Wrap the rail and sidebar in one element

The rail and the sidebar should stay together: side by side as a single unit (and in Lesson 11 they'll slide in and out together on phones). In `vanilla/index.html`, add a wrapper `<div class="nav-drawer">` around the `<nav class="server-rail">` and the `<aside class="channel-sidebar">`.

1. Right after `<div class="app">` and before the `<!-- 1. Server rail ... -->` comment, type the opening tag and a new comment.
2. Right after the `</aside>` that ends the sidebar, type `</div>`.
3. Optional but tidy: select every line between them and press <kbd>Tab</kbd> once to indent them one level. The browser doesn't care about indentation, but your future self will.

Everything inside stays exactly as it was. The structure becomes:

::: solution
```html [vanilla/index.html]
<div class="app">
  <!-- The server rail and channel sidebar together (on phones they slide in as a "drawer") -->
  <div class="nav-drawer">
    <!-- 1. Server rail: one button per server -->
    <nav class="server-rail" aria-label="Servers">
      <!-- ...rest unchanged... -->
    </nav>

    <!-- 2. Channel sidebar: server name, channels, and your user panel -->
    <aside class="channel-sidebar" aria-label="Channels">
      <!-- ...rest unchanged... -->
    </aside>
  </div>

  <!-- 3. Chat: header, messages, message box, and the member list -->
  <main class="chat">
    <!-- ...rest unchanged... -->
  </main>
</div>
```
:::

### Step 2 — Link a new stylesheet

Layout rules get their own file. In the `<head>` of `vanilla/index.html`, add one `<link>` after `base.css` and before `server-rail.css`:

::: solution
```html [vanilla/index.html]
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/server-rail.css">
<link rel="stylesheet" href="css/channels.css">
<link rel="stylesheet" href="css/chat.css">
<link rel="stylesheet" href="css/members.css">
```
:::

### Step 3 — The app grid

Create `vanilla/css/layout.css`. Start with a comment and the `.app` rule:

- `display: grid` with `grid-template-columns: auto 1fr` creates two columns. `.app` has exactly two children now (`.nav-drawer` and `.chat`), so one goes into each column.
- `height: 100vh;` then `height: 100dvh;` make the app exactly as tall as the window. With a single implicit row, that row stretches to fill the container.

::: solution
```css [vanilla/css/layout.css]
/* The big pieces of the page and how they fit together. */

/* The app fills the whole window: [server rail + channel sidebar] [chat] */
.app {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100vh;
  height: 100dvh;
}
```
:::

Save and look at the page: the chat area jumps up beside the rail and sidebar. They're still stacked *inside* the left column; the next step fixes that.

### Step 4 — Rail and sidebar side by side

Add a rule for the wrapper. It's a flexbox job, because it's a single row of two items:

::: solution
```css [vanilla/css/layout.css]
/* Server rail and channel sidebar side by side */
.nav-drawer {
  display: flex;
}
```
:::

Now the rail and the sidebar sit next to each other. They're as wide as their own `width` properties say (72px and 240px), which is why the left grid column is `auto`: it adopts the width of its content, 312px in total.

### Step 5 — The chat: header on top, body below

Add the `.chat` rule: a grid with **one column** (the default) and **two rows**. The first row is exactly `var(--header-height)` (48px); the second takes all the rest.

::: solution
```css [vanilla/css/layout.css]
/* The chat area: a header row on top, everything else below */
.chat {
  display: grid;
  grid-template-rows: var(--header-height) 1fr;
}
```
:::

### Step 6 — The chat body: messages and members

The body has two children: `.chat-main` (messages and the message box) and `.member-list`. Make them two columns: the messages take all the free space (`1fr`), and the member list is `auto` wide, so it's as wide as its own `width: var(--members-width)` (240px).

::: solution
```css [vanilla/css/layout.css]
/* Below the header: messages on the left, member list on the right */
.chat-body {
  display: grid;
  grid-template-columns: 1fr auto;
}
```
:::

### Step 7 — Message box at the bottom

`.chat-main` contains the message list and the composer. They should be stacked, with the message list growing and the composer at the bottom, which is a **column** flex job. Then one rule for two lists:

- `.chat-main` is a column flex container.
- `.channel-list` and `.message-list` get `flex: 1`. In the sidebar (also a column flex container, from Lesson 06) that pushes the user panel to the bottom. In the chat it pushes the composer to the bottom. A selector list lets one rule cover both.

::: solution
```css [vanilla/css/layout.css]
/* Messages fill the space, the composer sits at the bottom */
.chat-main {
  display: flex;
  flex-direction: column;
}

.channel-list,
.message-list {
  flex: 1;
}
```
:::

Save and compare with the screenshot at the top. The whole app should now fill the window.

### Step 8 — Look at the grid in DevTools

1. Open DevTools → **Elements**. Next to `<div class="app">` you'll see a **grid** badge. Click it: Chrome draws the grid lines and track sizes over the page.
2. Select `.app` and, in the **Styles** pane, change `grid-template-columns` to `1fr 1fr`. The rail and sidebar now take half of the window. Change it back to `auto 1fr`.
3. Resize the window (drag the DevTools edge or the browser window). The chat column absorbs every change, because it's the `1fr` track.
4. Make the window very short. When the content is taller than the window, the whole page gets a scrollbar. We said this would happen: each column scrolling alone is Lesson 10's job.

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] `vanilla/css/layout.css` exists and is linked in `index.html` between `base.css` and `server-rail.css`.
- [ ] The rail and sidebar are side by side on the left; the chat fills the middle; the member list is on the right.
- [ ] The message box is at the bottom of the chat column, and the user panel is at the bottom of the sidebar.
- [ ] Making the browser window wider or narrower only changes the width of the chat column; the rail, sidebar and member list stay the same width.
- [ ] In DevTools → **Elements**, `.app` and `.chat` have a **grid** badge and `.nav-drawer` and `.chat-main` have a **flex** badge. Clicking the grid badge shows the track lines.
- [ ] In DevTools → **Styles**, selecting `.app` shows both `height: 100vh` and `height: 100dvh`, and one of them may be crossed out (see the quiz).

## 🐛 Common mistakes

**Everything is still stacked vertically.** `display: grid` goes on the *parent* and the layout is set with `grid-template-columns` on the same element. Check that the rule's class name matches the HTML (`.app`, not `.App`) and that `layout.css` is linked in `index.html`.

**The chat column is empty or in the wrong place.** The `.app` grid expects exactly two children, `.nav-drawer` and `.chat`. If you forgot the wrapper, the rail, the sidebar and the chat would be three children and the third would wrap to a second row. Check Step 1 and the closing `</div>`.

**The message box is not at the bottom.** Either `.chat-main` is missing `display: flex; flex-direction: column;`, or `.message-list` has no `flex: 1`. Look in DevTools to see which rule is missing, or whether the file has a typo (`flex-direction: colum`).

**The whole page is too tall and you get a scrollbar on the right edge of the window.** That's expected for now (see the Goal). Lesson 10 fixes it. Don't try to patch it with fixed heights.

**`height: 100vh` seems to be crossed out in DevTools.** It's not an error. When two declarations for the same property are both valid, the later one wins and the earlier one is shown crossed out. Same for `dvh` in a browser that understands it.

## 📝 Quiz

::: quiz
What does `grid-template-columns: auto 1fr;` produce?

- [ ] Two columns of equal width
- [ ] A fixed-width first column of 1 pixel
- [x] A first column as wide as its content, and a second column that takes all remaining width
- [ ] A single column

> `auto` fits the column to its content. `1fr` is one share of the free space; because it's the only `fr` track, it gets all of it.
:::

::: quiz
Predict the column widths in a 900px-wide container:

```css
.row {
  display: grid;
  grid-template-columns: 100px 1fr 2fr;
}
```

- [ ] 100px, 400px, 400px
- [ ] 300px, 300px, 300px
- [x] 100px, about 267px, about 533px
- [ ] 100px, 100px, 700px

> The fixed 100px column is placed first, leaving 800px. That's split into 3 shares (1 + 2): one share is about 267px and two shares are about 533px.
:::

::: quiz
Why does the `.app` rule have both `height: 100vh;` and `height: 100dvh;`?

- [ ] Browsers add the two heights together
- [ ] `vh` is for width and `dvh` is for height
- [x] An older browser ignores the line it doesn't understand and keeps `100vh`; a modern one uses the later `100dvh`
- [ ] One of them is a typo that doesn't matter

> A declaration with a value the browser doesn't know is dropped. When both are valid, the later declaration wins. Writing the older unit first gives a safe fallback.
:::

## 💾 Commit

```sh
git add .
git commit -m "Lay out the app shell with CSS grid"
git push
```
