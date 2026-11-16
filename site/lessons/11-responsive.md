---
lesson: 11
title: Responsive design
---

# Lesson 11 — Responsive design

Hubbub looks right on a laptop, but squeeze the window and it breaks: the layout needs about 800px to fit and then scrolls sideways. In this lesson you'll teach the page to adapt, so it works from a wide monitor down to a phone, using **media queries** and a slide-in **drawer**.

This is the last lesson of the CSS phase. After it, the app looks finished. Everything from Lesson 12 on makes it *do* things.

## 🎯 Goal

On a wide window nothing changes. As you narrow the window, three things happen:

- Below about 1000px, the member list floats over the chat instead of taking a column, and the search box disappears.
- Below about 760px, the server rail and channel sidebar slide out of view, the topic text disappears, and a menu (hamburger) button appears at the left of the chat header.
- When the drawer is open (for now, because you add a class in DevTools by hand), the rail and sidebar slide in over a dark backdrop.

![The wide layout at 1280 pixels, unchanged from before: rail, sidebar, chat with messages, and the member list as a right column.](/screenshots/lesson-11.png){.screenshot}

The wide layout is identical to Lesson 10. Here is the same page at 700px wide: a hamburger button at the left of the header, no topic and no search box, and the member list floating over the right part of the chat.

![The page at 700 pixels wide: the header starts with a menu button then the channel name, the messages fill the width, and the member list is drawn over the right side of the chat with a shadow.](/screenshots/lesson-11-narrow.png){.screenshot}

And with the drawer open: the rail and sidebar cover the left, and the rest of the page is dimmed.

![The same narrow page with the server rail and channel sidebar drawn over the left side, and everything else darkened by a semi-transparent backdrop.](/screenshots/lesson-11-drawer.png){.screenshot}

## 🧠 New concepts

<ConceptList />

### What "responsive" means

People open your page on a 27-inch monitor, a laptop, a tablet and a phone, and drag windows to any width. A **responsive** page adapts its layout to the space it gets, instead of assuming one size. The tool for it is the **media query**.

You already have what the browser needs on phones: in Lesson 02 you added `<meta name="viewport" content="width=device-width, initial-scale=1">` to the `<head>`. It tells a phone browser "make the page as wide as the screen". Without it, phones pretend the screen is much wider (about 980px is common) and shrink everything, so your media queries would never trigger.

### Media queries

A **media query** wraps CSS rules in a condition. The rules inside apply only while the condition is true:

```css
@media (max-width: 760px) {
  .chat-topic {
    display: none;
  }
}
```

- `@media` starts a conditional block, like an `if`. It's an **at-rule** (it starts with `@`).
- `(max-width: 760px)` is the condition: "the window is **at most** 760px wide". It's in parentheses.
- Inside the braces you write ordinary rules, with ordinary selectors.

When the window is 760px wide or less, the `.chat-topic` is hidden. At 761px, the rule is ignored. There's also `min-width` ("at least"), which we don't use here. It's checked live: resize the window and the layout updates immediately. [MDN: `@media`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media).

::: tip Python comparison
A media query is an `if` statement for your stylesheet: `if window_width <= 760:` apply these rules. The difference: it's re-evaluated automatically every time the window size changes.
:::

### Choosing breakpoints

The widths where the layout switches are called **breakpoints**. Don't pick them from a list of device sizes. Resize the window slowly and see where the design stops working, and put the breakpoint there. In Hubbub:

| Window width | Problem | Fix |
| --- | --- | --- |
| above 1000px | none | the full four-column layout |
| 1000px and below | the chat column gets too narrow | the member list floats over the chat; search box hidden |
| 760px and below | rail + sidebar use 312px, too much on a phone | they become a hidden drawer; the header gets a menu button |

The two breakpoints build on each other. At 700px, both queries apply, since 700 is under 1000 *and* under 760.

```text
 wide (> 1000px)             medium (≤ 1000px)           small (≤ 760px)
┌────┬──────┬──────┬────┐   ┌────┬──────┬────────┐      ┌──────────────┐
│rail│side- │ chat │mem-│   │rail│side- │ chat   │      │ ☰ chat       │
│    │bar   │      │bers│   │    │bar   │ ┌─────┐│      │              │
│    │      │      │    │   │    │      │ │mem- ││      │  (the drawer │
│    │      │      │    │   │    │      │ │bers ││      │   is hidden) │
└────┴──────┴──────┴────┘   └────┴──────┴─┴─────┴┘      └──────────────┘
                              members float over chat
```

### File order and the cascade

Remember the cascade: when two rules with the same specificity set the same property, the **later one wins**. A media query does *not* make its rules more specific. That's why `responsive.css` is linked **last**, after every other stylesheet: its rules come later and so override the normal ones.

Put the normal (wide) rules in the usual files and only the *differences* in the media queries. That's how this project works: for example `.menu-button` is `display: none` in `chat.css` and `display: flex` inside the small-window query.

### Testing in DevTools: the device toolbar

Chrome DevTools can simulate other screen sizes. Click the **device toolbar** icon at the top-left of the DevTools panel (a phone-and-tablet symbol), or use the keyboard shortcut <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>. The page now sits in a frame; drag its edges, or type a width and height in the boxes above it. Chrome can also show colored bars for your media queries above the page: click one to jump to that width. (Shortcuts and icons may differ a little between versions.)

### `position: fixed`

You know `relative` and `absolute` from Lesson 09. **`position: fixed`** is like `absolute`, but measured from the **browser window (the viewport)**, not from an ancestor, and it **stays there** when the page scrolls. It's also taken out of the normal flow. It suits things that stay on screen: drawers, backdrops, toolbars.

### `inset`

`inset` is a shorthand for the four offsets `top`, `right`, `bottom` and `left`. `inset: 0` means all four are `0`, so a fixed element with it stretches over the whole window:

```css
.backdrop {
  position: fixed;
  inset: 0;      /* same as top: 0; right: 0; bottom: 0; left: 0 */
}
```

### Sliding with `translateX`

`translateY` (Lesson 09) moves an element vertically. **`translateX`** moves it horizontally. Percentages in `translate` are relative to the element's own size, so:

- `translateX(-100%)` moves an element left by **its own width**: it's exactly off-screen if it started at `left: 0`.
- `translateX(0)` is "back to its normal place".

Add `transition: transform 0.25s ease` (Lesson 08) and a change of class animates it as a slide.

### The drawer technique

Put the ideas together:

1. On small windows, take the navigation out of the layout with `position: fixed`, glued to the left edge and as tall as the window.
2. Hide it by pushing it off-screen: `transform: translateX(-100%)`.
3. When its parent has the class `is-nav-open`, a more specific rule sets `transform: translateX(0)`, so it slides in.
4. A dark **backdrop** covers the rest of the page while it's open.

For step 4, the backdrop is a separate element placed **right after** `.app` in the HTML. The `+` selector (Lesson 06) lets CSS show it only when `.app` has the class:

```css
.app.is-nav-open + .drawer-backdrop {
  display: block;
}
```

"A `.drawer-backdrop` directly after an `.app` that has `is-nav-open`". It works without JavaScript touching the backdrop at all: JavaScript will later add and remove one class, `is-nav-open`, and the CSS does the rest. In Lesson 15 you'll wire the buttons. For now you'll type the class in DevTools.

### Stacking the layers

A few things float above the page here, so their `z-index` values must be in the right order:

| Layer | `z-index` |
| --- | --- |
| member list (floating) | 5 |
| backdrop | 15 |
| drawer | 20 |

The backdrop is above the member list (it dims it too), and the drawer is above the backdrop. Spacing the numbers out (5, 15, 20) leaves room to add layers in between later.

## 🛠️ Build it

### Step 1 — HTML: link the stylesheet, add a menu button and a backdrop

Three small edits in `vanilla/index.html`.

**1. Link `responsive.css` last** in the `<head>`, after `members.css`:

::: solution
```html [vanilla/index.html]
<link rel="stylesheet" href="css/channels.css">
<link rel="stylesheet" href="css/chat.css">
<link rel="stylesheet" href="css/members.css">
<link rel="stylesheet" href="css/responsive.css">
```
:::

**2. Add a menu button** as the **first child** of `<header class="chat-header">`, before the `#` icon. It uses the `menu` icon from the sprite. The `id` is for JavaScript later:

::: solution
```html [vanilla/index.html]
<header class="chat-header">
  <button class="icon-button menu-button" type="button" id="menu-button" aria-label="Open channels">
    <svg class="icon"><use href="assets/icons.svg#menu"></use></svg>
  </button>
  <svg class="icon chat-header-icon"><use href="assets/icons.svg#hash"></use></svg>
  <!-- ...title, topic and toolbar unchanged... -->
</header>
```
:::

**3. Add the backdrop** after the closing `</div>` of `<div class="app">` and before `</body>`. It must be a **sibling right after** `.app`, not inside it, so the `+` selector can find it:

::: solution
```html [vanilla/index.html]
    </div>

    <!-- The dark overlay behind the drawer on small screens -->
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
  </body>
</html>
```
:::

The page will probably show a new `Open channels` icon button in the header right now: you'll hide it in the next step. (The `responsive.css` file doesn't exist yet. The browser logs a failed request for it in the Console and Network panels until Step 4, which is fine for now.)

### Step 2 — Hide the menu button on wide windows

In `vanilla/css/chat.css`, add a rule right after `.chat-header`. The small-window query will show it again later:

::: solution
```css [vanilla/css/chat.css]
/* Only shown on small screens (see responsive.css) */
.menu-button {
  display: none;
}
```
:::

### Step 3 — Prepare the layout

Two additions to `vanilla/css/layout.css`:

- `.chat-body` gets `position: relative`. At medium widths the member list will be `position: absolute`, and it must be measured from the chat body (the area below the header), not from the page.
- A `.drawer-backdrop` rule with `display: none`: the backdrop is invisible unless the small-window query turns it on. Put it after `.chat-main` and before the comment about `min-height`.

::: solution
```css [vanilla/css/layout.css]
/* Below the header: messages on the left, member list on the right */
.chat-body {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  min-height: 0;
}

/* Hidden unless the drawer is open on a small screen (see responsive.css) */
.drawer-backdrop {
  display: none;
}
```

`.chat-main` stays between these two rules, as before.
:::

### Step 4 — Medium windows: the member list floats

Create `vanilla/css/responsive.css`. Start with the comment and the first media query:

- At 1000px and below, `.member-list` becomes `position: absolute`, glued to the top, right and bottom of `.chat-body` (that's why you made it `relative`). The chat then has the whole width, and the member list covers its right part. `z-index: 5` keeps it above the messages and `box-shadow` (a leftward shadow with 16px of blur) separates it from them.
- `.search { display: none }` hides the search box to save header space.

::: solution
```css [vanilla/css/responsive.css]
/* Changes for narrower windows.
   This file is loaded last, so its rules win over the other files. */

/* ---------- Medium windows: the member list floats over the chat ---------- */

@media (max-width: 1000px) {
  .member-list {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.3);
  }

  .search {
    display: none;
  }
}
```
:::

Save and drag your window narrower than 1000px: the member list lifts out of the layout and floats over the chat. The search box vanishes. There's no way to close the floating member list yet: Lesson 15 wires up the members button.

### Step 5 — Small windows: the drawer

Add the second media query to `responsive.css`, after the first. Inside it:

- `.app` goes back to one column (`grid-template-columns: 1fr`): `.nav-drawer` is about to leave the layout, so the chat should have the full width.
- `.nav-drawer` becomes `position: fixed` and sticks to the left edge, with `top: 0` and `bottom: 0` to fill the window height. `z-index: 20` puts it on top. `transform: translateX(-100%)` pushes it off the left edge. `transition: transform 0.25s ease` animates the change.
- `.app.is-nav-open .nav-drawer` resets the transform to `translateX(0)`. This is a descendant selector: "a `.nav-drawer` inside an `.app` that has `is-nav-open`".
- `.app.is-nav-open + .drawer-backdrop` shows the backdrop: `display: block`, `position: fixed`, `inset: 0` (covers everything), `z-index: 15` and a semi-transparent black background.
- `.menu-button` is shown again (`display: flex`, which is what `.icon-button` uses).
- `.chat-topic` is hidden to leave room for the toolbar icons.

::: solution
```css [vanilla/css/responsive.css]
/* ---------- Small windows: the server rail and sidebar become a drawer ---------- */

@media (max-width: 760px) {
  .app {
    grid-template-columns: 1fr;
  }

  /* Pushed off the left edge until .app gets the is-nav-open class */
  .nav-drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .app.is-nav-open .nav-drawer {
    transform: translateX(0);
  }

  /* "+" means: the element right after .app */
  .app.is-nav-open + .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 15;
    background-color: rgba(0, 0, 0, 0.6);
  }

  .menu-button {
    display: flex;
  }

  .chat-topic {
    display: none;
  }
}
```
:::

### Step 6 — Test with the device toolbar

1. Open DevTools and turn on the **device toolbar** (see above). Set the width to `1280`: the page looks like Lesson 10.
2. Drag the width down slowly. Around `1000` the member list floats and the search box disappears. At `760` the drawer disappears and the hamburger button and the topic change. Keep going to `400`: there should be no horizontal scrollbar.
3. At about 700px wide, open the **Elements** panel, select `<div class="app">` and edit its `class` attribute (double-click it) so it reads `app is-nav-open`. The rail and sidebar slide in from the left and the page behind goes dark. Remove the `is-nav-open` again: the drawer slides out.
4. The hamburger button doesn't do anything yet; Lesson 15 makes it add and remove that class for you.

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] At 1280px the page looks exactly as it did after Lesson 10: no hamburger button, four columns.
- [ ] Between about 761px and 1000px: the member list floats over the chat with a shadow; the search box is hidden; the rail and sidebar are still visible.
- [ ] At 760px and below: the rail and sidebar are gone, a hamburger button sits at the left of the header and the topic is hidden.
- [ ] Adding `is-nav-open` to `<div class="app">` in DevTools slides the drawer in with an animation and darkens the page. Removing it slides the drawer out.
- [ ] At 400px wide there's no horizontal scrollbar, and the message box is at the bottom.
- [ ] DevTools → **Network**: `responsive.css` loads with status **200**, and the **Console** shows no errors.

## 🐛 Common mistakes

**Nothing changes when you resize the window.** Check that `responsive.css` is linked in `index.html`, and the media query syntax: `@media (max-width: 760px) { ... }`, with the parentheses, the colon, the unit and a closing brace for both the query and the rule inside. A missing `}` makes everything after it be ignored.

**Your responsive rules are ignored.** Equal specificity: the later rule wins, so `responsive.css` must come *after* the other stylesheets. Also a rule inside a media query doesn't become stronger. If the normal rule has a more specific selector, repeat that selector inside the query.

**The drawer is always visible, or never appears.** It needs `position: fixed` plus `transform: translateX(-100%)` for hidden, and the `.app.is-nav-open .nav-drawer` rule to set `translateX(0)`. Check the class on `<div class="app">` itself: it's `is-nav-open` with hyphens, and the DevTools edit must land on `.app`, not on `.nav-drawer`.

**The backdrop never shows.** The `+` selector needs the backdrop to be the element *immediately* after `.app` (not inside it, and not with another element in between), and the rule only exists inside the 760px query.

**The backdrop covers the drawer, so you can't click it.** The drawer needs the higher `z-index` (20 vs 15).

**The floating member list jumps to the corner of the whole page or covers the header.** `.chat-body` needs `position: relative` so the `absolute` member list is measured from it.

**Everything looks tiny on a real phone.** The `viewport` meta tag is missing or typed wrong in the `<head>`. It must be exactly `<meta name="viewport" content="width=device-width, initial-scale=1">`.

**A known gap.** The drawer is hidden visually, but its buttons are still reachable with the <kbd>Tab</kbd> key, so a keyboard user can tab into things they can't see. This course doesn't fix that, so be aware of it if you build a drawer for a real project.

## 📝 Quiz

::: quiz
Which rule applies when the browser window is 800px wide?

```css
@media (max-width: 760px) {
  .menu-button { display: flex; }
}
```

- [ ] The rule applies, because 800 is bigger than 760
- [x] The rule does not apply, because the window is wider than 760px
- [ ] The rule applies only on phones
- [ ] The rule applies only when the window is exactly 760px

> `max-width: 760px` means "760px or narrower". At 800px the condition is false and the rules inside are ignored.
:::

::: quiz
Predict: `.menu-button` is `display: none` in `chat.css`, and `display: flex` inside a media query in `responsive.css`. At 500px wide, what is its `display` if `responsive.css` is linked **before** `chat.css`?

- [ ] `flex`, because the media query is always stronger
- [x] `none`, because both rules have the same specificity and the later file (`chat.css`) wins
- [ ] `flex`, because `responsive.css` has a longer name
- [ ] It's `block`

> A media query doesn't add specificity. For equal specificity, the rule that comes later in the cascade wins, so the stylesheet order matters. That's why `responsive.css` is linked last.
:::

::: quiz
What does `transform: translateX(-100%)` do to a fixed element whose `left` is `0`?

- [ ] Moves it 100px to the left
- [x] Moves it left by its own width, so it's just off the left edge of the window
- [ ] Moves it to the middle of the window
- [ ] Flips it so it's mirrored

> Percentages in `translate` refer to the element's own size. A shift of `-100%` on the x axis moves the element exactly its width to the left.
:::

## 💾 Commit

```sh
git add .
git commit -m "Make the layout responsive with a drawer and media queries"
git push
```
