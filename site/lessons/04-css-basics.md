---
lesson: 4
title: "Selectors, colors, text & theme variables"
---

# Lesson 04 — Selectors, colors, text & theme variables

Time to make it look like an app. You'll learn how CSS rules work and write the app's dark color theme, then colour and style the text in each part of the page. The layout still won't change: that's the job of the next lessons.

## 🎯 Goal

By the end of this lesson the page has a dark theme with the Discord-like palette: dark backgrounds that get lighter from the server rail to the chat area, light text, muted grey for secondary text, and small UPPERCASE category titles.

![The Hubbub page in a dark theme: dark grey backgrounds, light text, small uppercase TEXT CHANNELS and VOICE CHANNELS titles, an unread channel in bold white, and still stacked vertically with bullets because there is no layout yet](/screenshots/lesson-04.png){.screenshot}

It's still one long column with bullets, and the buttons are flat grey rectangles with no padding. Spacing is Lesson 05 and layout is Lessons 06 and 07. What changed is **colour and text**, and you also built a **theme file** you can restyle by changing a few lines.

## 🧠 New concepts

<ConceptList />

### Linking a stylesheet

CSS is a separate language, kept in separate files with the extension `.css`. The page loads them with `<link>` elements in the `<head>`:

```html
<link rel="stylesheet" href="css/theme.css">
```

`rel="stylesheet"` says "this file is a stylesheet", and `href` is the path, relative to the HTML file (just like the `src` of an image). The browser downloads each stylesheet, so you'll see it in the Network panel. If several stylesheets are linked, the browser reads them **in the order they appear**, and the order will matter in a moment.

### Anatomy of a rule

```css
.server-name {
  color: #f2f3f5;
  font-size: 16px;
}
```

```text
 selector          which elements?
    │
.server-name {
  color: #f2f3f5;       ← declaration: property: value;
  font-size: 16px;
}
```

- The **selector** picks which elements the rule applies to.
- Each **declaration** is a `property: value;` pair. Always end it with a semicolon.
- Everything inside `{ }` is the **declaration block**.
- `/* like this */` is a **comment**. CSS has no `#` or `//` comments.

::: tip Python comparison
Think of a rule as a loop plus an assignment: "for every element that matches the selector, set these properties." CSS is *declarative*: you describe the result you want and the browser decides how to get there.
:::

### Selectors

| Selector | Matches | Example |
| --- | --- | --- |
| **Type** selector: just a tag name | every element of that type | `body`, `button`, `a` |
| **Class** selector: a dot, then a class name | every element with that class | `.server-name` |
| **Selector list**: separated by commas | any of them: shares one rule | `button, input, textarea` |
| **Descendant** selector: separated by a space | an element inside another, at any depth | `.channel-item .channel-button` |
| **Combined classes**: no space between | an element that has *both* classes | `.server-button.is-emoji` |

The difference between a space and no space is a classic trap:

```css
/* An element with BOTH classes: */
.server-button.is-emoji { font-size: 24px; }

/* A .channel-button anywhere INSIDE a .channel-item: */
.channel-item .channel-button { color: #949ba4; }
```

You can chain them. In today's CSS, `.channel-item.is-unread .channel-button` means: "a `.channel-button` that is inside an element that has both the classes `channel-item` and `is-unread`." This is where the `is-unread` class from Lesson 03 starts to matter.

### Colors

Computers describe colour as amounts of **r**ed, **g**reen and **b**lue. CSS has several notations:

- **Hex**: `#1e1f22`. A `#` and three pairs of hexadecimal digits for red, green and blue, each from `00` (none) to `ff` (full, which is 255). `#1e1f22` is a very dark grey. `#000000` is black and `#ffffff` is white.
- **`rgba()`**: `rgba(78, 80, 88, 0.3)`. Red, green, blue (0 to 255) and **alpha**, the opacity from 0 (invisible) to 1 (solid). Use it for semi-transparent colours. See [CSS colour values on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value).
- **Names**: `white`, `red`, and the special value `transparent` (fully see-through).

The two colour properties you'll use most:

| Property | Sets |
| --- | --- |
| `color` | the colour of the **text** |
| `background-color` | the colour **behind** an element |

```css
.example {
  color: #f2f3f5;
  background-color: transparent;
}
```

### Typography: fonts, sizes, weights, spacing

| Property | Does | Example value |
| --- | --- | --- |
| `font-family` | picks the typeface, as a **fallback list** | `-apple-system, "Segoe UI", sans-serif` |
| `font-size` | text size | `16px`, `0.85em` |
| `font-weight` | boldness: `400` is normal, `700` is bold | `500`, `600` |
| `line-height` | space between lines | `1.375` |
| `letter-spacing` | space between letters | `0.02em` |
| `text-transform` | changes case without retyping | `uppercase` |

- `font-family` takes a list. The browser uses the first font your computer has. Names with spaces go in quotes. The list ends with a **generic family** like `sans-serif` as a last resort. `-apple-system` and `BlinkMacSystemFont` ask for the system font on Apple devices and in Chrome on macOS, so the app looks native there. `"Segoe UI"` is the Windows system font. If none of the earlier names exist, the browser moves on down the list.
- **Units:** `px` is a pixel: a fixed size. `em` is *relative*: `1em` is the font size of the parent, so `0.85em` means "85% of the surrounding text". Use `px` for exact sizes, and `em` when something should scale with its surroundings.
- A `line-height` with **no unit** (like `1.375`) means "1.375 times the element's own font size".

### The cascade: when rules disagree

Often, several rules set the same property on the same element. The browser has a fixed procedure to choose, called the **cascade**. The basics:

1. **Specificity**: the more *specific* selector wins. To compare, count what's in the selector, and compare these columns from left to right:
   - ID selectors (not used yet), then
   - class selectors, then
   - type selectors.

   A rule with more classes beats a rule with fewer, no matter how many type selectors the other has. So `.channel-item.is-unread .channel-button` (3 classes) beats `.channel-button` (1 class).
2. **Order**: if specificity is equal, the rule that comes **later** wins. That includes later in the same file, or in a stylesheet linked later. (Lesson 11 uses this on purpose.)
3. The browser's own **default stylesheet** is at the bottom: any rule of yours overrides it. That's where bold headings and the grey buttons came from.

See [specificity on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity) for the details. Chrome DevTools shows the losing declaration **crossed out**, which makes this easy to debug (you'll see it in the checkpoint).

### Inheritance

Some properties are **inherited**: an element uses its parent's value unless you say otherwise. Text properties (`color`, `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform`) are inherited. Boxes are not: `background-color` and `border` are not inherited.

That's why `base.css` sets the font and text colour on `body` *once* and the whole page gets them.

There's an exception: browsers give **buttons and text fields their own font, colour, background and border**. So buttons don't pick up the page's font by default. You fix this by asking them to inherit:

```css
button,
input,
textarea {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
}
```

- `font: inherit` is the **shorthand** `font` property set to the keyword `inherit`: "use my parent's value".
- `background: none` and `border: none` remove the default grey, 3D-looking button.

Shorthand properties like `font`, `background` and `border` set several related values in one declaration.

### Custom properties (CSS variables)

The same dark grey will be used in many places. If you copy `#313338` everywhere, changing your colour scheme means searching every file. CSS has **custom properties** (often called CSS variables) for this:

```css
:root {
  --bg-primary: #313338;
}

.chat {
  background-color: var(--bg-primary);
}
```

- A name that **starts with two dashes** is a custom property you invent. You set it like any other property.
- `var(--bg-primary)` **reads** it.
- `:root` is a selector for the topmost element of the page (`<html>`). Variables defined there are available everywhere, because they're inherited by everything below.

Think of `theme.css` as a `settings.py` file: constants in one place, used by the rest. Change a variable once and every rule that uses it changes. See [using custom properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties).

## 🛠️ Build it

You'll create six CSS files inside `vanilla/css/`. Each file has one job. This is how larger projects stay organised.

### Step 1 — The theme file: colours and fonts as variables

Create the folder `vanilla/css` and the file `vanilla/css/theme.css`. It contains **only** variables on `:root`, no styling rules. Type it in groups:

- a header comment explaining the file,
- `--brand-accent`: the app's accent colour,
- five backgrounds from darkest to lightest,
- two semi-transparent backgrounds for hover and selected states (`rgba`),
- five text colours,
- four status colours,
- two font stacks.

The comments after the values are optional, but the notes help you later. One comment mentions that the brand colour will move to JavaScript in a later lesson (Lesson 17). The accent variable isn't used anywhere yet.

::: solution
<<< @/../solutions/lesson-04/vanilla/css/theme.css [vanilla/css/theme.css]
:::

Nothing changes in the browser yet, because no rule *uses* these variables yet and the file isn't linked.

### Step 2 — Link theme.css and write base.css

Open `vanilla/index.html`. Inside `<head>`, **after** the favicon `<link>`, add the first two stylesheet links. Order matters here: the theme comes first.

::: solution
```html [vanilla/index.html]
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hubbub</title>
  <link rel="icon" href="assets/brand/logo.svg">
  <link rel="stylesheet" href="css/theme.css">
  <link rel="stylesheet" href="css/base.css">
</head>
```
:::

Now create `vanilla/css/base.css`. It starts with one rule for `body`: background colour, text colour, the font and line height. Everything inside the page inherits these:

```css
body {
  background-color: var(--bg-tertiary);
  color: var(--text-normal);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.375;
}
```

Save. The page turns dark, with light text in a different typeface.

::: info Your font may look different from the screenshots
`--font-sans` lists `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `"Inter"`, `"Noto Sans"`, `Helvetica`, `Arial`, then `sans-serif`. The browser picks the first one installed on your computer, so each system shows a different default: the Apple system font on a Mac, Segoe UI on Windows, and on Linux usually Inter or Noto Sans if installed, otherwise whatever `sans-serif` maps to. The screenshots in this course were taken on a Linux machine that has Inter. Letter shapes and line widths differ a little between fonts, so your text may wrap in slightly different places. That is normal.

See [`font-family` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).
:::

The buttons stay grey, because they ignore inheritance. We'll fix that in the next step.

<!-- no-solution: the complete base.css file comes in the next step -->

### Step 3 — Make form controls inherit

Add the rule for buttons and fields from the concepts section, **below** the `body` rule. Then add two small rules: links get the theme's link colour, and `code` uses the monospace font at 85% of its surroundings.

Look at the page after you save: the buttons are now flat text with no grey background. If you comment out `font: inherit` (select it and press <Keys mac="Cmd+/" win="Ctrl+/" />), the button font changes back; then undo.

::: solution
<<< @/../solutions/lesson-04/vanilla/css/base.css [vanilla/css/base.css]
:::

### Step 4 — The server rail

Link the next stylesheet by adding one line after the `base.css` link:

```html
<link rel="stylesheet" href="css/server-rail.css">
```

Create `vanilla/css/server-rail.css`. The rail gets the darkest background. A server button gets the chat-area colour as its background, and a bigger font size. The two-class selector `.server-button.is-emoji` bumps the font size up again for emoji servers.

Notice that this file never writes a hex colour. It only uses `var()`. Also think about why `.server-button.is-emoji` wins over `.server-button`'s `font-size: 18px` for emoji buttons: two classes are more specific than one, regardless of order.

::: solution
```html [vanilla/index.html]
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/server-rail.css">
```

```css [vanilla/css/server-rail.css]
/* The column of server icons on the far left. */

.server-rail {
  background-color: var(--bg-tertiary);
}

.server-button {
  background-color: var(--bg-primary);
  color: var(--text-normal);
  font-size: 18px;
  font-weight: 500;
}

.server-button.is-emoji {
  font-size: 24px;
}
```
:::

### Step 5 — The channel sidebar

Link `css/channels.css` after `server-rail.css`, then create the file. It styles three areas:

1. The sidebar background, and the server name (`.server-name`).
2. Channel names: `.category-toggle` is the small uppercase title, and `.channel-button` is a muted grey. Then one rule with **three classes**: unread channels are white and bolder. This is the rule that beats `.channel-button`.
3. The user panel: its darker background, and the name and tag text.

::: solution
```html [vanilla/index.html]
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/server-rail.css">
<link rel="stylesheet" href="css/channels.css">
```

<<< @/../solutions/lesson-04/vanilla/css/channels.css [vanilla/css/channels.css]
:::

After saving, **help** should stand out in bold white among the greyer channel names. In the HTML it's the one with the `is-unread` class.

### Step 6 — The chat area

Link `css/chat.css` and create it. It styles the chat background, the channel title and topic, the date divider, message authors, times, the message text, the composer background and the search field. Two things to note:

- `.message-time, .message-hover-time` is a **selector list**: one rule for two classes. Each time element has the same style.
- The comment explains why `font-weight: 400` is needed: the author and time sit inside an `<h3>`, which the browser's default stylesheet makes bold, and the time inherits that. This is inheritance at work, and you're undoing it.

::: solution
```html [vanilla/index.html]
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/server-rail.css">
<link rel="stylesheet" href="css/channels.css">
<link rel="stylesheet" href="css/chat.css">
```

<<< @/../solutions/lesson-04/vanilla/css/chat.css [vanilla/css/chat.css]
:::

### Step 7 — The member list

Link the last stylesheet, `css/members.css`, and create it. The group titles ("ADMIN — 1") reuse the same small uppercase style as the channel categories. Because they're copied, you could move the repeated style into a shared rule later. For now, repeating it keeps each file easy to read.

::: solution
```html [vanilla/index.html]
<link rel="icon" href="assets/brand/logo.svg">
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/server-rail.css">
<link rel="stylesheet" href="css/channels.css">
<link rel="stylesheet" href="css/chat.css">
<link rel="stylesheet" href="css/members.css">
```

<<< @/../solutions/lesson-04/vanilla/css/members.css [vanilla/css/members.css]
:::

### Step 8 — Use the Styles pane to see the cascade, and to restyle

Open DevTools → **Elements**. This is the most useful CSS tool you have.

1. **Crossed-out rule.** Click the `help` button (the one inside `<li class="channel-item is-unread">`). In the **Styles** pane on the right, find two rules that set `color`: `.channel-item.is-unread .channel-button` and `.channel-button`. The second one's `color` is **crossed out**: it lost on specificity.
2. **Toggle a declaration.** Hover over the `button, input, textarea` rule: a checkbox appears next to each declaration. Untick `font: inherit` and watch the button font change. Tick it again.
3. **Edit a variable live.** In the Elements panel, click the `<html>` element. In the Styles pane find the `:root` rule with all your variables. Click the colour value of `--bg-primary`, or its small colour square, and pick a different colour. The chat area and the server buttons change immediately, because both use that one variable. Reload the page: your edit is gone, because DevTools doesn't change your files.
4. **Change it for real.** Change `--bg-primary` in `theme.css` to another colour, save, and watch Live Server update the page. Then change it back.

::: warning Tool UIs can change
DevTools layout and labels change between Chrome versions. If something doesn't look like this description, look for the Styles tab or pane under Elements, and the closest matching feature.
:::

<!-- no-solution: exploring DevTools, nothing to type -->

## ✅ Checkpoint

- [ ] You have six files in `vanilla/css/`: `theme.css`, `base.css`, `server-rail.css`, `channels.css`, `chat.css`, `members.css`, and six matching `<link rel="stylesheet">` lines in `<head>`, in that order.
- [ ] The page has a dark background with light text, and the category titles are small and uppercase.
- [ ] The `help` channel is bold and white, while the others are grey.
- [ ] Buttons no longer look like default grey buttons.
- [ ] DevTools → **Network** (reload) shows six `.css` files, each with status **200**.
- [ ] DevTools → **Elements → Styles**: on the `help` button's `.channel-button`, one `color` declaration is crossed out.
- [ ] Changing `--bg-primary` on `:root` in the Styles pane changes the chat background live.

## 🐛 Common mistakes

**The page has no styling at all (it's still white).** Check the Network panel: a stylesheet with status **404** means the `href` path doesn't match the file. Check the folder name (`css`, not `styles`) and the file spelling. Also check that you linked the file in `index.html`.

**One rule seems to be ignored.** Look for a missing `;` or `}` just above it: one typo can break the next declaration or the whole next rule. In DevTools, invalid lines appear crossed out with a warning icon.

**A colour doesn't apply and the Styles pane shows the variable crossed out.** The name inside `var(--...)` doesn't match the one in `theme.css` (for example `--bg-primry`). A `var()` with an unknown name makes that declaration unusable. Copy the exact name from `theme.css`.

**You wrote `channel-button` instead of `.channel-button`.** Without the dot, CSS looks for an element called `<channel-button>`, which doesn't exist. Class selectors always start with a dot.

**Your rule doesn't beat another one.** Don't guess: open the Styles pane and see which rule is crossed out. Then compare specificity, or check which comes later. Don't reach for `!important`; fix the selector instead.

**`.channel-item .is-unread` does nothing.** The space made it a descendant selector: it looks for `.is-unread` *inside* `.channel-item`. The class is on the `.channel-item` itself, so it needs to be `.channel-item.is-unread` with no space.

**You edited a file but the browser shows the old version.** The CSS may be cached. Hard reload with <Keys mac="Cmd+Shift+R" win="Ctrl+Shift+R" />, and check that the file is saved.

## 📝 Quiz

::: quiz
Two rules apply to the same button, and both set `color`:

```css
.channel-button { color: #949ba4; }
.channel-item.is-unread .channel-button { color: #f2f3f5; }
```

The button is inside an element with the classes `channel-item is-unread`. Which colour does the text get?

- [ ] `#949ba4`, because it comes first
- [x] `#f2f3f5`, because the second selector is more specific
- [ ] A mix of the two colours
- [ ] Neither, because the rules conflict

> The second selector has three classes and the first has one, so it's more specific and wins. Order only matters when specificity is equal.
:::

::: quiz
You change one line in `theme.css`:

```css
--bg-primary: #313338;
```

to `--bg-primary: #ff0000;`. Both `.chat` and `.server-button` use `background-color: var(--bg-primary);`. What happens?

- [ ] Only the first rule that uses it changes
- [ ] Nothing, because custom properties can't change at all
- [x] Both the chat area and the server buttons turn red
- [ ] The page breaks and shows an error

> A custom property is a named value that every `var()` call reads. Change it in one place and everything that uses it follows. That's why the theme lives in one file.
:::

::: quiz
What does this selector match?

```css
.server-button.is-emoji
```

- [ ] A `.is-emoji` element inside a `.server-button`
- [ ] Any element with the class `server-button` or the class `is-emoji`
- [x] An element that has both classes at once
- [ ] An element called `server-button` with the id `is-emoji`

> No space means "same element, both classes". A space would mean "inside". A comma would mean "or".
:::

## 💾 Commit

```sh
git add .
git commit -m "Add the dark theme and base styles"
git push
```
