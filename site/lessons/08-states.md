---
lesson: 8
title: "States: hover, focus, selected & transitions"
---

# Lesson 08 — States: hover, focus, selected & transitions

A page that never reacts feels dead. In this lesson Hubbub starts responding: buttons highlight under your mouse, the selected server and channel stand out, keyboard users get a focus ring, and things animate smoothly instead of snapping.

## 🎯 Goal

Hover over any server icon, channel, member or message and it reacts. The active server (`FF`) is a rounded square in the brand color, the current channel `general` has a highlighted background, offline members are faded, and the date divider has thin lines on either side of the date.

![The full Hubbub layout. The selected server button FF is a green-teal rounded square, a second server button below it is also teal because the pointer was over it, the channel general has a lighter highlighted background, the date divider has a thin line on each side of "October 13, 2026", and the two offline members at the bottom right are faded.](/screenshots/lesson-08.png){.screenshot}

This is a hover-heavy lesson, so the best way to judge your result is to move the mouse around. In the screenshot, the pointer happened to be resting over the palette server, which is why that button looks highlighted too.

## 🧠 New concepts

<ConceptList />

### States: what the page looks like *right now*

An element can be in different **states**: the mouse is over it, it has keyboard focus, it's selected, it's disabled, it's collapsed. A good interface shows the state in the styling. CSS gives you two ways to target a state, and Hubbub uses both:

| Kind | Who decides | Example | In Hubbub |
| --- | --- | --- | --- |
| **Pseudo-class** | The **browser** | `:hover`, `:focus-visible` | the mouse is over a channel |
| **State class** | **You** (later, your JavaScript adds or removes the class) | `.is-selected`, `.is-collapsed` | the channel you've opened |

Both end up as ordinary selectors. A pseudo-class is written with a colon after the selector it applies to.

### `:hover`

`:hover` matches an element while the pointer is over it.

```css
.member:hover {
  background-color: var(--bg-hover);
}
```

Read it as "a `.member`, but only while hovered". You can also use it on an ancestor to style a *descendant*: `.member:hover .member-name` means "the name inside a hovered member". The whole row reacts, not just the name.

### `:focus` and `:focus-visible`

An element has **focus** when it's the one that will receive keyboard input. You move focus between buttons, links and fields with the <kbd>Tab</kbd> key (and <kbd>Shift</kbd>+<kbd>Tab</kbd> backwards). This is how people who can't use a mouse use a website, so it has to be visible.

- `:focus` matches whenever the element has focus, including right after a mouse click.
- `:focus-visible` matches when the browser thinks the focus ring *should be shown*. In Chrome that's keyboard navigation (and always for text fields), but not a mouse click on a button. That's what you want for a ring: it appears when you need it and not when it would just be noise. Browsers differ a little on the exact rules.

Browsers already draw a default focus ring. Hubbub replaces it with its own, in the brand color. The golden rule:

::: warning Never remove a focus outline without replacing it
Writing `outline: none` on a button or link makes your page unusable by keyboard: you can't see where you are. If you change the focus style, give it a visible new one. In this lesson there are exactly two places where the outline is removed: the search box and the message box, and both are text fields that show focus another way (the search box grows, and a text field always shows a blinking caret). Treat these as exceptions, not a habit.
:::

### Attribute selectors

A selector can also match on an **attribute**:

```css
.icon-button[aria-pressed="true"] {
  color: var(--text-strong);
}
```

`[aria-pressed="true"]` means "has the attribute `aria-pressed` with exactly this value". Combined with the class in front, it reads "an `.icon-button` that is currently pressed".

`aria-pressed` is a standard attribute for **toggle buttons**, buttons that stay on or off, like the member list button. It tells screen readers whether the button is on, and it gives CSS something to hang a style on, so one attribute serves both. Nothing sets it back and forth yet: JavaScript will do that in Lesson 15. For now you write `aria-pressed="true"` by hand in the HTML.

### Pseudo-elements: `::before` and `::after`

A **pseudo-element** is a *fake child* the browser makes and styles for you. `::before` is placed before an element's content, `::after` after it. They're written with two colons.

They only appear when you give them a `content` property. For a decorative box with no text use an empty string:

```css
.date-divider::before {
  content: "";
  height: 1px;
  background-color: var(--divider);
}
```

In the divider, one pseudo-element is the line before the date and another is the line after it. No extra HTML needed. Because they're children of the divider, the divider's `display: flex` also lines them up with the date. (Lesson 05's `*` rule did not reach pseudo-elements; this lesson extends it with `*::before` and `*::after` so they also use `box-sizing: border-box`.)

`::placeholder` is a similar idea: it's the grey hint text inside an empty input. You'll style it with `.composer-input::placeholder`.

### Transitions

Normally a style change is instant: hover, and the color snaps. A **transition** makes the browser animate between the old and the new value:

```css
.server-button {
  border-radius: 50%;
  transition: border-radius 0.15s ease;
}
```

`transition: property duration timing` means "when `border-radius` changes, take 0.15 seconds (`0.15s`) to get there, easing in and out (`ease`)". Put it on the **normal** state (not on `:hover`), so it animates in *both* directions. To animate several properties separate them with commas.

Not every property can be animated. Numbers, lengths and colors can: you can't smoothly animate `display`.

### Transforms: `rotate`

`transform` changes how an element is **drawn** without changing the layout of anything else. `rotate()` spins it around its center by an angle; the unit is `deg` (degrees). A chevron that points down rotated `-90deg` (a quarter turn counter-clockwise) points right:

```css
.category.is-collapsed .category-toggle .icon {
  transform: rotate(-90deg);
}
```

Together with a transition on `transform`, the arrow smoothly turns when a category collapses.

### Cursor, opacity and the three ways to hide

- `cursor: pointer` changes the mouse pointer to a hand. Use it on anything clickable. Browsers don't do it for `<button>`s by default, which is why we add it.
- `text-decoration: none` / `underline` removes or adds the underline on links.
- `outline` draws a line **outside** the border and doesn't take up space; `outline-offset` moves it away from the element.
- `opacity` from `0` (invisible) to `1` (solid) fades an element, everything inside it too.
- `white-space: nowrap` stops text from wrapping onto a second line.

Three ways to make something disappear are different:

| | Still takes up space? | Clickable / seen by screen readers? | Can be animated? |
| --- | --- | --- | --- |
| `opacity: 0` | yes | **yes**, it's still there | yes |
| `visibility: hidden` | yes | no | not smoothly |
| `display: none` | **no**, it's removed from the layout | no | no |

Hubbub uses `visibility: hidden` for the little timestamp on follow-up messages: its space is kept (so nothing jumps) but nobody can see or click it until you hover. You'll use `display: none` in Lesson 10.

### Order and specificity matter

When two rules set the same property on the same element, the more *specific* selector wins, and among equals the **later** one wins (Lesson 04). Hover and selected rules depend on this. For example `.server-button:hover` and `.add-server-button:hover` have the same specificity, so the green hover for the add button works only because its rule comes **after** the generic one. If a state doesn't show, check the order first.

## 🛠️ Build it

Keep Live Server running. After each step, hover or press <kbd>Tab</kbd> to try what you wrote.

### Step 1 — A new theme variable

Open `vanilla/css/theme.css`. In the "Interactive backgrounds" group add a very light shade used when hovering a message:

::: solution
```css [vanilla/css/theme.css]
/* Interactive backgrounds (hover / selected) */
--bg-hover: rgba(78, 80, 88, 0.3);
--bg-selected: rgba(78, 80, 88, 0.6);
--bg-message-hover: rgba(2, 2, 2, 0.06);
```
:::

### Step 2 — Shared states in `base.css`

Open `vanilla/css/base.css` and make five changes:

1. The `box-sizing` rule now covers pseudo-elements too. Change its selector from `*` to a selector list of three:
2. In the `button` rule add `cursor: pointer`.
3. In the `a` rule add `text-decoration: none`, then add an `a:hover` rule that underlines.
4. Add a global `:focus-visible` rule: a 2px solid ring in the brand color, held 2px away from the element.
5. At the end of the file add the hover and pressed styles for icon buttons.

Everything else in the file stays as it was.

::: solution
```css [vanilla/css/base.css]
*,
*::before,
*::after {
  box-sizing: border-box;
}

button {
  padding: 0;
  cursor: pointer;
}

a {
  color: var(--text-link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* A visible ring around whatever you reach with the Tab key */
:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}

.icon-button:hover {
  background-color: var(--bg-hover);
  color: var(--text-normal);
}

/* A pressed toggle button (like the member list button) */
.icon-button[aria-pressed="true"] {
  color: var(--text-strong);
}
```

Place `a:hover` and `:focus-visible` right after the `a` rule, and the two `.icon-button` rules at the very end of the file (after `.icon-button .icon`).
:::

Try it: click on the page, press <kbd>Tab</kbd> a few times, and watch a green ring jump from button to button. It's drawn by the `:focus-visible` rule you just wrote.

### Step 3 — Mark the member list button as pressed

In `vanilla/index.html`, add `aria-pressed="true"` to the members button in the chat header. The member list is visible, so the toggle is "on":

::: solution
```html [vanilla/index.html]
<button class="icon-button" type="button" id="members-button" aria-label="Member List" aria-pressed="true">
  <svg class="icon"><use href="assets/icons.svg#members"></use></svg>
</button>
```
:::

The members icon gets a whiter color (`--text-strong`) from the attribute selector.

### Step 4 — The server rail

In `vanilla/css/server-rail.css`:

- On `.server-button` add the transition for three properties at once, comma-separated.
- Add a rule after it for hover **and** the active server. It's one rule with a selector list: the circle turns into a rounded square (`border-radius: 16px`), fills with the brand color and the text turns white. `.server-item.is-active .server-button` is "a server button inside an item that has the `is-active` class".
- After `.add-server-button`, add a hover rule for the green button. It must come *after* the generic hover rule so it wins when the specificity ties.

::: solution
```css [vanilla/css/server-rail.css]
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
  transition: border-radius 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

/* Hover and selected: the circle becomes a rounded square */
.server-button:hover,
.server-item.is-active .server-button {
  border-radius: 16px;
  background-color: var(--brand-accent);
  color: white;
}

.add-server-button {
  color: var(--green);
}

.add-server-button:hover {
  background-color: var(--green);
}
```

`.server-button.is-emoji`, `.brand-logo`, `.server-separator` and the rest are unchanged.
:::

Hover over a server: the circle morphs into a rounded square over a sixth of a second.

### Step 5 — The channel sidebar

In `vanilla/css/channels.css`:

- `.sidebar-header` gets `cursor: pointer` (insert it after `color`), and a `.sidebar-header:hover` rule right after it.
- `.category-toggle:hover` brightens the category title.
- `.category-toggle .icon` gets `transition: transform 0.15s ease`, and a new rule rotates it for `.is-collapsed` categories.
- `.channel-button:hover` adds a background and a brighter text.
- `.channel-item.is-selected .channel-button` shows the current channel, placed **after** the `is-unread` rule.
- `.user-panel-profile:hover` adds a background.

::: solution
```css [vanilla/css/channels.css]
.sidebar-header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 16px;
  box-shadow: var(--header-shadow);
  color: var(--text-strong);
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-header:hover {
  background-color: var(--bg-hover);
}

.category-toggle:hover {
  color: var(--text-normal);
}

.category-toggle .icon {
  width: 12px;
  height: 12px;
  transition: transform 0.15s ease;
}

/* A collapsed category points its arrow to the right */
.category.is-collapsed .category-toggle .icon {
  transform: rotate(-90deg);
}

.channel-button:hover {
  background-color: var(--bg-hover);
  color: var(--text-normal);
}

/* Two classes on the same element: an unread channel item */
.channel-item.is-unread .channel-button {
  color: var(--text-strong);
  font-weight: 600;
}

.channel-item.is-selected .channel-button {
  background-color: var(--bg-selected);
  color: white;
}

.user-panel-profile:hover {
  background-color: var(--bg-hover);
}
```

Where they go: `.category-toggle:hover` right after `.category-toggle`; `.channel-button:hover` right after `.channel-name`; `.user-panel-profile:hover` right after `.user-panel-profile`. The other rules in the file are unchanged.
:::

Hover over `help`: its name is bold and white (unread), but the background still lights up. The `.is-unread` rule is more specific than `.channel-button:hover`, so it wins for the text color; the hover rule's background has nothing competing with it.

### Step 6 — The chat: search, dividers, messages and composer

In `vanilla/css/chat.css` there are five groups of changes.

**Search box.** Add `transition: width 0.25s ease` to `.search-input`, then a `.search-input:focus` rule right after it. Clicking into the box makes it grow to 240px; the transition animates the growth. It also turns off the focus outline, because the width change already shows where you are.

**Date divider.** Replace `justify-content: center` in `.date-divider` with `align-items: center`. Then add the lines. `::before` and `::after` are two flex items on either side of the `<span>`, each with `flex: 1` so they share the free space, and `height: 1px` makes them a thin line. A small padding around the date keeps the lines from touching it.

::: solution
```css [vanilla/css/chat.css]
.search-input {
  width: 144px;
  height: 24px;
  padding: 0 8px;
  border-radius: var(--radius-small);
  background-color: var(--bg-tertiary);
  font-size: 14px;
  transition: width 0.25s ease;
}

/* The search box grows while you type in it */
.search-input:focus {
  width: 240px;
  outline: none;
}

.date-divider {
  display: flex;
  align-items: center;
  margin: 24px 16px 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

/* The lines on both sides of the date are pseudo-elements */
.date-divider::before,
.date-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background-color: var(--divider);
}

.date-divider span {
  padding: 0 4px;
}
```
:::

**Message hover.** A message gets a very light background under the pointer, and the author's name is underlined on hover:

::: solution
```css [vanilla/css/chat.css]
.message:hover {
  background-color: var(--bg-message-hover);
}

.message-author:hover {
  text-decoration: underline;
}
```

`.message:hover` goes right after the `.message` rule. `.message-author:hover` goes right after `.message-author`.
:::

**The hover timestamp.** Until now `.message-time` and `.message-hover-time` shared one rule. Split them:

- `.message-time` keeps the old declarations.
- `.message-hover-time` is the small time shown at the left of a follow-up message. It's `display: block` and 56px wide, and `margin-left: -16px` pulls its left edge into the padding so that, with `text-align: right`, its right edge lines up with the end of the 40px gutter. `visibility: hidden` hides it but keeps its place. `white-space: nowrap` keeps "10:23 AM" on one line (that's the wrapping glitch from the previous screenshot).
- On `.message:hover` its time becomes `visible`.

::: solution
```css [vanilla/css/chat.css]
.message-time {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 400; /* the <h3> around the time would make it bold */
}

/* Follow-up messages show their time only while you hover them */
.message-hover-time {
  display: block;
  width: 56px;
  margin-left: -16px;
  visibility: hidden;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 22px;
  text-align: right;
  white-space: nowrap;
}

.message:hover .message-hover-time {
  visibility: visible;
}
```
:::

**Composer.** At the end of the file, remove the outline from the text area (the caret and the message box itself make it obvious where you're typing) and make the placeholder text a little fainter:

::: solution
```css [vanilla/css/chat.css]
.composer-input:focus {
  outline: none;
}

.composer-input::placeholder {
  color: var(--text-faint);
}
```
:::

::: info A better focus style for the composer
Removing the outline here leaves only the caret as a signal. A more complete design would give the whole rounded message box a visible ring whenever something inside it is focused. CSS has a pseudo-class for that, which you'll meet in a later lesson. For this lesson we follow the snapshot.
:::

### Step 7 — The member list

In `vanilla/css/members.css`:

- `.member:hover` adds a background.
- `.member:hover .member-name` brightens the name inside it. This is a hover rule on an ancestor, styling a descendant.
- Offline members are faded to 30% opacity, and back to full opacity when hovered.

::: solution
```css [vanilla/css/members.css]
.member:hover {
  background-color: var(--bg-hover);
}

.member:hover .member-name {
  color: var(--text-normal);
}

/* Offline members are faded */
.member.is-offline {
  opacity: 0.3;
}

.member.is-offline:hover {
  opacity: 1;
}
```

Place `.member:hover` after `.member`, and `.member:hover .member-name` after `.member-name`. The two `is-offline` rules go at the end of the file.
:::

### Step 8 — Force a state in DevTools

Some states are hard to inspect, because moving the mouse to DevTools ends the hover. DevTools can force them.

1. In **Elements**, select a `.channel-button`. In the **Styles** pane click **:hov** (next to `.cls`). A list of checkboxes appears: tick `:hover`. The button now shows its hover style until you untick it.
2. Tick `:focus-visible` to see the focus ring on the element.
3. Collapsing a category isn't wired to a click yet (Lesson 15). Simulate it: select `<section class="category">`, double-click the word `category` in the element's `class` attribute, and type `category is-collapsed`, then press <kbd>Enter</kbd>. The chevron rotates a quarter turn, animated. Remove the class again to turn it back. Your edit is only in memory; reload and it's gone.

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] Hovering a server button turns it into a rounded square in the brand color, with a short animation. `FF` is always in that shape.
- [ ] Hovering channels, members, the user profile, the server header, icon buttons and messages gives each a background change. `general` stays highlighted all the time.
- [ ] Pressing <kbd>Tab</kbd> shows a 2px ring on every button you reach.
- [ ] Clicking the search box makes it grow wider smoothly. The members icon is brighter than the other toolbar icons.
- [ ] The date divider has a line on each side of the date.
- [ ] Hovering the follow-up message ("min-height: 0 saved me") shows "10:23 AM" at its left; moving away hides it. The text doesn't wrap onto two lines.
- [ ] The offline members (Kenji, Nora) are faded and become solid on hover.
- [ ] DevTools: with `:hov` → `:hover` ticked on a channel button, you can see its hover rule in the Styles pane. Adding `is-collapsed` to a category rotates the chevron.

## 🐛 Common mistakes

**The hover effect snaps instead of animating.** The `transition` has to be on the normal state (e.g. `.server-button`), not only on `:hover`, and it must name a property that actually changes. Check the spelling of the property (`border-radius`, not `border-radious`).

**A hover or selected style doesn't show.** Another rule with equal or higher specificity is overriding it, or yours comes *earlier* in the file. In DevTools → Styles, look for your declaration crossed out, and see which rule is above it.

**`.date-divider::before` draws nothing.** A pseudo-element needs the `content` property, even if it's an empty `""`. Without it the browser doesn't create the box at all.

**The pseudo-element rule has no effect on the page at all.** Pseudo-elements use two colons and attach to an element: `.date-divider::before`, not `.date-divider ::before` (with a space, you'd be selecting the pseudo-element of every *descendant* instead).

**No focus ring appears when you click a button.** That's `:focus-visible` working as designed: mouse clicks on buttons don't need a ring. Press <kbd>Tab</kbd> to see it.

**The `aria-pressed` styling does nothing.** The attribute must be exactly `aria-pressed="true"` in the HTML, and the selector must match it character for character, including the quotes around `"true"` and no space before the `[`.

## 📝 Quiz

::: quiz
What is the difference between `:hover` and `.is-selected`?

- [ ] `:hover` is for buttons and `.is-selected` is for links
- [x] The browser decides when `:hover` applies; `.is-selected` applies only when someone (later, your JavaScript) adds the class
- [ ] `.is-selected` is faster to render
- [ ] There is no difference

> A pseudo-class reflects a state the browser tracks by itself. A state class is a name you put on an element on purpose, so your code is in control.
:::

::: quiz
Predict what happens when you hover the button:

```css
.tile {
  background-color: gray;
}

.tile:hover {
  background-color: teal;
  transition: background-color 1s ease;
}
```

- [ ] It fades to teal over 1 second and fades back over 1 second
- [x] It fades to teal over 1 second, but snaps back to gray instantly when the pointer leaves
- [ ] It snaps to teal and fades back over 1 second
- [ ] Nothing changes

> A transition applies using the declaration that is active in the *new* state. On hover, `.tile:hover` is active and has the transition, so the way in is animated. When the pointer leaves, `.tile:hover` no longer matches, so the normal `.tile` rule (with no transition) applies and the color changes instantly. Put `transition` on the normal state to animate both directions.
:::

::: quiz
You want an element to be invisible but still take up its space, and not be clickable. Which one?

- [ ] `display: none`
- [ ] `opacity: 0`
- [x] `visibility: hidden`
- [ ] `outline: none`

> `display: none` removes the element and its space. `opacity: 0` keeps the space but the element can still be clicked. `visibility: hidden` keeps the space and the element can't be interacted with.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add hover, focus and selected states with transitions"
git push
```
