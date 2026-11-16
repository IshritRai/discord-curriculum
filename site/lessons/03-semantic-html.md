---
lesson: 3
title: "Semantic HTML: the app skeleton"
---

# Lesson 03 — Semantic HTML: the app skeleton

Last lesson you wrote the *content* of the app. This time you give it a *structure*: you'll rebuild the page as the real skeleton of a chat app, with a server rail, channel sidebar, chat area and member list, using HTML elements that say what each part *is*.

## 🎯 Goal

By the end of this lesson `vanilla/index.html` contains the full structure of the Hubbub app: clickable server buttons, channel buttons, a user panel, a chat header, messages, a message box and a member list.

![An unstyled web page: bulleted lists of small server buttons, a large Frontend Friends heading, channel buttons, Mute, Deafen and Settings buttons, a general heading, Pins and Members buttons next to a search box, and the start of a numbered message list](/screenshots/lesson-03.png){.screenshot}

**The page looks unstyled and a bit ugly, and that is expected.** Bullets, default buttons and stacked blocks are what a browser does with plain structure. In the next lessons CSS will turn this into the four-column Discord look *without* changing the HTML much. Good structure is what makes that possible.

## 🧠 New concepts

<ConceptList />

### The five regions of the app

Before writing any HTML, decide what the big parts are. Here is the layout you're building (the column widths come in later lessons):

```text
┌────────┬─────────────┬──────────────────────────────┬─────────┐
│ server │ channel     │ chat header                  │ member  │
│ rail   │ sidebar     ├──────────────────────────────┤ list    │
│        │             │ messages                     │         │
│ (nav)  │ server name │                              │ (aside) │
│        │ channel list│                              │         │
│        │ (nav)       ├──────────────────────────────┤         │
│        ├─────────────┤ composer (form)              │         │
│        │ user panel  │                              │         │
└────────┴─────────────┴──────────────────────────────┴─────────┘
   1          2                    3                       4
```

Region 3 (the chat) is the `<main>` element and contains the header, the messages and the composer. Region 4 sits next to the messages inside the chat area. The user panel (account name plus mute buttons) lives at the bottom of the channel sidebar.

### Semantic landmarks versus `div` and `span`

HTML has two do-nothing containers:

- `<div>`: a generic **block** box. It has no meaning of its own.
- `<span>`: a generic **inline** box, used inside a line of text. No meaning either.

HTML also has **semantic** elements, which tell browsers, search engines and screen readers what a part of the page *is*. Screen reader users can jump straight between these **landmarks**. See [ARIA landmark roles on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/landmark_role).

| Element | Use it for | In the app |
| --- | --- | --- |
| `<nav>` | a group of navigation links or buttons | the server rail, the channel list |
| `<header>` | introductory content of its section | the server name bar, the chat header |
| `<main>` | the page's main content (once per page) | the chat |
| `<aside>` | content related to, but separate from, its surroundings | the channel sidebar, the member list |
| `<section>` | a themed group of content, usually with a heading or a label | a channel category, the user panel, the message area |

The rule of thumb: **use a semantic element if one fits, and fall back to `<div>` or `<span>` when you only need a box to group things for styling.** Your page uses both. Search the file when you're done: every `<div>` is a wrapper that exists only for layout.

::: info
Each element has a short MDN page: [`<nav>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav), [`<header>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header), [`<main>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main), [`<aside>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside), [`<section>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section), [`<div>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div), [`<span>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span).
:::

### `class` and `id`

Two attributes you'll use constantly, to **name** elements so CSS and JavaScript can find them:

```html
<li class="server-item is-active">…</li>
<h1 class="server-name" id="server-name">Frontend Friends</h1>
```

| | `class` | `id` |
| --- | --- | --- |
| How many elements can share it? | **Many** | **One** only: it must be unique on the page |
| How many names per element? | Several, separated by spaces | One |
| Used for | Styling groups of things (Lesson 04 onward) | Picking out one specific element for JavaScript (Lesson 13 onward) |

Think of `class` as a *category* label (like a Python class: many instances) and `id` as a *unique name* (like a dictionary key that can appear only once).

#### How the app names things

- Class names are lowercase words joined with hyphens: `server-rail`, `message-content`. (This is called kebab-case.)
- A name says *what the thing is*, not how it looks. `server-rail` is a good name; `blue-column` is not, because you might restyle it.
- Classes starting with `is-` describe a **state**: `is-active`, `is-selected`, `is-unread`, `is-offline`. They are set on an element while that state is true. In Lesson 08 you'll style them, and JavaScript will switch them on and off later.
- `id`s are used only on elements that JavaScript will need to find later, such as `id="message-list"`.

### Buttons, and when to use them

- A **`<button>`** does something when clicked: select a channel, mute the microphone, send a message.
- An **`<a href="...">`** goes somewhere: another page or another address.

In this app, clicking a server *switches a view in the same page*, so every server and channel is a `<button>`. Buttons can be focused with the <kbd>Tab</kbd> key and pressed with <kbd>Enter</kbd> or <kbd>Space</kbd> without any extra work. Don't use a `<div>` as a button: you'd have to rebuild all of that yourself.

You'll write `type="button"` on every button here. Inside a `<form>`, a button without a type submits the form by default. `type="button"` means "just a button". Writing it always is a safe habit. See [`<button>` on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button).

### Forms, text fields and labels

A **form** collects input from the user. These are the pieces you'll use:

| Element | What it is |
| --- | --- |
| `<form>` | wraps the controls that belong together |
| `<input>` | a one-line field. Its `type` attribute picks the kind, like `type="search"` for a search box |
| `<textarea>` | a multi-line text field. `rows="1"` makes it start one line tall |
| `<label>` | the text that names a field. Wrapping a field in a `<label>` ties them together |

The `placeholder` attribute shows a grey hint inside an empty field. It disappears when you type and isn't a replacement for a real label. See [`<input type="search">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search), [`<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea), [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label) and [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form) on MDN.

The form here won't *do* anything yet. Lesson 22 makes it send messages.

### `aria-label` and `role`: names for things with no text

A button that shows only an icon has no words for a screen reader to read. **ARIA** attributes fill that gap:

- **`aria-label="Mute"`** gives an element an accessible name that screen readers read aloud. It's invisible on screen. Use it for icon-only buttons and for landmarks that appear more than once, like two `<nav>`s: `aria-label="Servers"` and `aria-label="Channel list"` let a screen reader say which is which.
- **`role="separator"`** tells assistive technology that an element is a divider line, even though it's a `<li>`.

The server buttons show "FF" or an emoji, which isn't a good spoken name, so they get an `aria-label` with the full server name. The Mute, Deafen and Settings buttons show plain words *for now*. Lesson 06 replaces the words with icons, and the `aria-label` stays, which is why you add it now. See [`aria-label` on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) and [`separator` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role).

::: tip
The first rule of ARIA is: if a native element does the job, use it and skip ARIA. You'll mostly use `aria-label` and a few other attributes in this course. Always prefer real elements such as `<button>`, `<nav>` and `<ol>`.
:::

### Machine-readable dates with `<time>`

```html
<time datetime="2026-10-13T10:15:00Z">Yesterday at 10:15 AM</time>
```

People read "Yesterday at 10:15 AM". Programs need an exact value. The `<time>` element shows human text, and its `datetime` attribute holds the precise moment in a standard format: `year-month-day`, then `T`, then `hours:minutes:seconds`, then `Z` (meaning UTC, the world reference time zone). Python's `datetime.isoformat()` produces almost the same format. See [`<time>` on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time).

### Heading levels in this app

The page's outline follows what is on screen: the **server name** is the `<h1>`, the **channel name** in the chat header is an `<h2>`, and category titles, message headers and member group titles are `<h3>`s. It's a design choice for this app. Real projects differ, but each heading level should always show how the page is organized.

## 🛠️ Build it

All of today's work is in `vanilla/index.html`. Keep the `<head>` exactly as it is. You'll replace the *contents of `<body>`*.

The finished file is about 230 lines, mostly repetition. You'll type the first item of each list yourself and **paste** the repeated items. Don't try to memorise the repetition; focus on the pattern.

::: tip Typing emoji
Some servers use emoji as icons. To type an emoji yourself, <Os mac="press Ctrl+Cmd+Space to open the emoji picker" windows="press the Windows key and the period key together to open the emoji picker" linux="use your desktop's emoji picker if it has one" />, or simply copy them from the pasted code.
:::

### Step 1 — Plan the three top-level regions

Delete everything between `<body>` and `</body>`. Then type the outer skeleton: one wrapper `<div>` called `app`, with three children: the server rail, the channel sidebar and the chat. Each one is empty for now.

The numbered comments help you navigate a long file. Remember, the browser ignores them.

::: solution
```html [vanilla/index.html]
  <body>
    <div class="app">
      <!-- 1. Server rail: one button per server -->
      <nav class="server-rail" aria-label="Servers">
      </nav>

      <!-- 2. Channel sidebar: server name, channels, and your user panel -->
      <aside class="channel-sidebar" aria-label="Channels">
      </aside>

      <!-- 3. Chat: header, messages, message box, and the member list -->
      <main class="chat">
      </main>
    </div>
  </body>
```
:::

The `<div class="app">` is there only to hold the regions together so CSS can lay them out (Lesson 07).

### Step 2 — The server rail

The server rail has three lists of buttons: the Home button with a divider, the servers, and an "add server" button. Each list item holds one `<button>`.

Type this inside `<nav class="server-rail">`. Notice:

- The home button holds an image with an **empty `alt=""`** because the button's `aria-label` already names it. An image with its own alt text would be read twice.
- `role="separator"` marks the `<li>` that will become a divider line.
- The first server has the class `is-active`, since it's the current server. The second class is added after a space.
- `id="server-list"` is on the one list that JavaScript will fill later.

```html
<ul class="server-list">
  <li class="server-item">
    <button class="server-button home-button" type="button" aria-label="Direct Messages">
      <img class="brand-logo" src="assets/brand/logo.svg" alt="">
    </button>
  </li>
  <li class="server-separator" role="separator"></li>
</ul>
```

Next type the servers list with only the first server, **Frontend Friends**, and the final list with the add button. Leave a comment where the other four servers go:

```html
<ul class="server-list" id="server-list">
  <li class="server-item is-active">
    <button class="server-button" type="button" aria-label="Frontend Friends">FF</button>
  </li>
  <!-- paste the other four servers here -->
</ul>
<ul class="server-list">
  <li class="server-item">
    <button class="server-button add-server-button" type="button" aria-label="Add a Server">+</button>
  </li>
</ul>
```

Now replace the paste comment with the other four servers. One uses letters (`SG`) and three use an emoji (`is-emoji` is an extra class for those):

::: starter
```html
<li class="server-item">
  <button class="server-button is-emoji" type="button" aria-label="Pixel Art Club">🎨</button>
</li>
<li class="server-item">
  <button class="server-button is-emoji" type="button" aria-label="Weekend Hikers">🥾</button>
</li>
<li class="server-item">
  <button class="server-button" type="button" aria-label="Study Group">SG</button>
</li>
<li class="server-item">
  <button class="server-button is-emoji" type="button" aria-label="Game Night">🎲</button>
</li>
```
:::

::: solution
```html [vanilla/index.html]
<div class="app">
      <!-- 1. Server rail: one button per server -->
      <nav class="server-rail" aria-label="Servers">
        <ul class="server-list">
          <li class="server-item">
            <button class="server-button home-button" type="button" aria-label="Direct Messages">
              <img class="brand-logo" src="assets/brand/logo.svg" alt="">
            </button>
          </li>
          <li class="server-separator" role="separator"></li>
        </ul>
        <ul class="server-list" id="server-list">
          <li class="server-item is-active">
            <button class="server-button" type="button" aria-label="Frontend Friends">FF</button>
          </li>
          <li class="server-item">
            <button class="server-button is-emoji" type="button" aria-label="Pixel Art Club">🎨</button>
          </li>
          <li class="server-item">
            <button class="server-button is-emoji" type="button" aria-label="Weekend Hikers">🥾</button>
          </li>
          <li class="server-item">
            <button class="server-button" type="button" aria-label="Study Group">SG</button>
          </li>
          <li class="server-item">
            <button class="server-button is-emoji" type="button" aria-label="Game Night">🎲</button>
          </li>
        </ul>
        <ul class="server-list">
          <li class="server-item">
            <button class="server-button add-server-button" type="button" aria-label="Add a Server">+</button>
          </li>
        </ul>
      </nav>
  <!-- ...the other two regions unchanged... -->
</div>
```
:::

Save and look at the browser: a stack of bullet points with small buttons. Press <kbd>Tab</kbd> a few times: the focus moves from button to button. You got that for free by using `<button>`.

### Step 3 — The channel sidebar: server name and channel list

Inside `<aside class="channel-sidebar">`, add a `<header>` with the server name as the page's `<h1>`, then a `<nav>` with two **categories**. Each category is a `<section>` with a `<h3>` heading, whose text is a button (a later lesson makes it fold the category), followed by a list of channels. Each channel is a `<button>` with its name in a `<span>`.

Type the header and the first category with only two channels, **general** and **help**. Notice the state classes: `general` is `is-selected`, and `help` is `is-unread`.

```html
<header class="sidebar-header">
  <h1 class="server-name" id="server-name">Frontend Friends</h1>
</header>
<nav class="channel-list" id="channel-list" aria-label="Channel list">
  <section class="category">
    <h3><button class="category-toggle" type="button">Text Channels</button></h3>
    <ul>
      <li class="channel-item is-selected">
        <button class="channel-button" type="button"><span class="channel-name">general</span></button>
      </li>
      <li class="channel-item is-unread">
        <button class="channel-button" type="button"><span class="channel-name">help</span></button>
      </li>
      <!-- paste the other two text channels here -->
    </ul>
  </section>
  <!-- paste the Voice Channels category here -->
</nav>
```

Paste the other two text channels in place of the first comment:

::: starter
```html
<li class="channel-item">
  <button class="channel-button" type="button"><span class="channel-name">showcase</span></button>
</li>
<li class="channel-item">
  <button class="channel-button" type="button"><span class="channel-name">off-topic</span></button>
</li>
```
:::

and the whole Voice Channels category in place of the second comment:

::: starter
```html
<section class="category">
  <h3><button class="category-toggle" type="button">Voice Channels</button></h3>
  <ul>
    <li class="channel-item">
      <button class="channel-button" type="button"><span class="channel-name">Lounge</span></button>
    </li>
    <li class="channel-item">
      <button class="channel-button" type="button"><span class="channel-name">Pair Programming</span></button>
    </li>
  </ul>
</section>
```
:::

::: solution
```html [vanilla/index.html]
      <!-- 2. Channel sidebar: server name, channels, and your user panel -->
      <aside class="channel-sidebar" aria-label="Channels">
        <header class="sidebar-header">
          <h1 class="server-name" id="server-name">Frontend Friends</h1>
        </header>
        <nav class="channel-list" id="channel-list" aria-label="Channel list">
          <section class="category">
            <h3><button class="category-toggle" type="button">Text Channels</button></h3>
            <ul>
              <li class="channel-item is-selected">
                <button class="channel-button" type="button"><span class="channel-name">general</span></button>
              </li>
              <li class="channel-item is-unread">
                <button class="channel-button" type="button"><span class="channel-name">help</span></button>
              </li>
              <li class="channel-item">
                <button class="channel-button" type="button"><span class="channel-name">showcase</span></button>
              </li>
              <li class="channel-item">
                <button class="channel-button" type="button"><span class="channel-name">off-topic</span></button>
              </li>
            </ul>
          </section>
          <section class="category">
            <h3><button class="category-toggle" type="button">Voice Channels</button></h3>
            <ul>
              <li class="channel-item">
                <button class="channel-button" type="button"><span class="channel-name">Lounge</span></button>
              </li>
              <li class="channel-item">
                <button class="channel-button" type="button"><span class="channel-name">Pair Programming</span></button>
              </li>
            </ul>
          </section>
        </nav>
</aside>
```
:::

### Step 4 — The user panel

Below the `</nav>` and still inside the `<aside>`, add the **user panel**: a `<section>` with an `aria-label`, a profile button, and three buttons for Mute, Deafen and Settings.

Look at the profile button. It holds several `<span>`s: an avatar placeholder (the letter "S"), and a name and a tag line stacked beside it. Those spans have `id`s because JavaScript will fill them in Lesson 13.

The three small buttons show plain words *for now*. Lesson 06 replaces them with icons, so their `aria-label`s are important.

::: solution
```html [vanilla/index.html]
      <!-- ...the nav channel-list unchanged... -->

        <section class="user-panel" aria-label="Your account">
          <button class="user-panel-profile" type="button" id="user-panel-profile">
            <span class="avatar" id="user-panel-avatar">S</span>
            <span class="user-panel-names">
              <span class="user-panel-name" id="user-panel-name">Sam</span>
              <span class="user-panel-tag" id="user-panel-tag">Learning frontend 🚀</span>
            </span>
          </button>
          <button class="icon-button" type="button" id="mute-button" aria-label="Mute">Mute</button>
          <button class="icon-button" type="button" id="deafen-button" aria-label="Deafen">Deafen</button>
          <button class="icon-button" type="button" id="settings-button" aria-label="User Settings">Settings</button>
        </section>
      </aside>
```
:::

### Step 5 — The chat header

Now fill `<main class="chat">`. Start with its `<header>`: the channel name (an `<h2>`), a topic paragraph, and a toolbar `<div>` with two buttons and a search field.

The search field is an `<input type="search">` wrapped in a `<label class="search">`. The label has no visible text, so the input also gets an `aria-label="Search"` to give it a name.

::: solution
```html [vanilla/index.html]
      <!-- 3. Chat: header, messages, message box, and the member list -->
      <main class="chat">
        <header class="chat-header">
          <h2 class="chat-title" id="chat-title">general</h2>
          <p class="chat-topic" id="chat-topic">Chat about anything frontend: HTML, CSS, JavaScript, React.</p>
          <div class="chat-toolbar">
            <button class="icon-button" type="button" aria-label="Pinned Messages">Pins</button>
            <button class="icon-button" type="button" id="members-button" aria-label="Member List">Members</button>
            <label class="search">
              <input class="search-input" type="search" placeholder="Search" aria-label="Search">
            </label>
          </div>
        </header>
  <!-- the chat body goes here (next steps) -->
</main>
```
:::

### Step 6 — The message list

Below the `</header>`, add a `<div class="chat-body">` that holds two things: the messages area (a `<section>`) and, later, the member list. Inside the section, an ordered list `<ol class="message-list" id="message-list">` holds the messages.

The list begins with a date divider, shown as a list item with `role="separator"`.

A message has a **gutter** (avatar), and a **body** with a header and the content:

```text
li.message
├── div.message-gutter      → the avatar letter (or the time, see below)
└── div.message-body
    ├── h3.message-header   → author button + <time>
    └── div.message-content → the text
```

Messages come in two shapes. The first message of a run by one author has the class **`is-group-start`**, and shows the avatar and a header. A **follow-up** message by the same author straight afterwards has no header. It shows only a small time in the gutter and the content (you'll see it in the third message below). Lesson 20 writes the rule for grouping.

Type the divider, the first message (Ava), and the follow-up message (Sam's second message), with comments where the pasted messages go:

```html
<div class="chat-body">
  <section class="chat-main" aria-label="Messages">
    <ol class="message-list" id="message-list">
      <li class="date-divider" role="separator"><span>October 13, 2026</span></li>

      <li class="message is-group-start">
        <div class="message-gutter"><span class="avatar">A</span></div>
        <div class="message-body">
          <h3 class="message-header">
            <button class="message-author" type="button">Ava</button>
            <time class="message-time" datetime="2026-10-13T10:15:00Z">Yesterday at 10:15 AM</time>
          </h3>
          <div class="message-content">Hey @Sam, how's the clone going? Did you get the grid layout working?</div>
        </div>
      </li>

      <!-- paste Sam's first message here -->

      <li class="message">
        <div class="message-gutter"><time class="message-hover-time" datetime="2026-10-13T10:23:00Z">10:23 AM</time></div>
        <div class="message-body">
          <div class="message-content"><code>min-height: 0</code> saved me 😅</div>
        </div>
      </li>

      <!-- paste the remaining messages here -->
    </ol>
  </section>
</div>
```

Sam's first message goes in the first spot, and the remaining four (Priya, Zoe, Omar, and Omar's follow-up) go in the second:

::: starter
```html
<li class="message is-group-start">
  <div class="message-gutter"><span class="avatar">S</span></div>
  <div class="message-body">
    <h3 class="message-header">
      <button class="message-author" type="button">Sam</button>
      <time class="message-time" datetime="2026-10-13T10:22:00Z">Yesterday at 10:22 AM</time>
    </h3>
    <div class="message-content">Getting there! The four columns line up now. Scrolling each column on its own was the tricky part.</div>
  </div>
</li>
```
:::

::: starter
              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">P</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Priya</button>
                    <time class="message-time" datetime="2026-10-13T10:25:00Z">Yesterday at 10:25 AM</time>
                  </h3>
                  <div class="message-content">Classic. Flex and grid children default to <code>min-height: auto</code>, so they refuse to shrink below their content.</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">Z</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Zoe</button>
                    <time class="message-time" datetime="2026-10-13T11:02:00Z">Yesterday at 11:02 AM</time>
                  </h3>
                  <div class="message-content">anyone up for game night on friday? 🎲</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">O</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Omar</button>
                    <time class="message-time" datetime="2026-10-13T11:03:00Z">Yesterday at 11:03 AM</time>
                  </h3>
                  <div class="message-content"><em>always</em></div>
                </div>
              </li>

              <li class="message">
                <div class="message-gutter"><time class="message-hover-time" datetime="2026-10-13T11:03:20Z">11:03 AM</time></div>
                <div class="message-body">
                  <div class="message-content">brb, lunch</div>
                </div>
              </li>
:::

::: solution
```html [vanilla/index.html]
        <div class="chat-body">
          <section class="chat-main" aria-label="Messages">
            <ol class="message-list" id="message-list">
              <li class="date-divider" role="separator"><span>October 13, 2026</span></li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">A</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Ava</button>
                    <time class="message-time" datetime="2026-10-13T10:15:00Z">Yesterday at 10:15 AM</time>
                  </h3>
                  <div class="message-content">Hey @Sam, how's the clone going? Did you get the grid layout working?</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">S</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Sam</button>
                    <time class="message-time" datetime="2026-10-13T10:22:00Z">Yesterday at 10:22 AM</time>
                  </h3>
                  <div class="message-content">Getting there! The four columns line up now. Scrolling each column on its own was the tricky part.</div>
                </div>
              </li>

              <li class="message">
                <div class="message-gutter"><time class="message-hover-time" datetime="2026-10-13T10:23:00Z">10:23 AM</time></div>
                <div class="message-body">
                  <div class="message-content"><code>min-height: 0</code> saved me 😅</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">P</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Priya</button>
                    <time class="message-time" datetime="2026-10-13T10:25:00Z">Yesterday at 10:25 AM</time>
                  </h3>
                  <div class="message-content">Classic. Flex and grid children default to <code>min-height: auto</code>, so they refuse to shrink below their content.</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">Z</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Zoe</button>
                    <time class="message-time" datetime="2026-10-13T11:02:00Z">Yesterday at 11:02 AM</time>
                  </h3>
                  <div class="message-content">anyone up for game night on friday? 🎲</div>
                </div>
              </li>

              <li class="message is-group-start">
                <div class="message-gutter"><span class="avatar">O</span></div>
                <div class="message-body">
                  <h3 class="message-header">
                    <button class="message-author" type="button">Omar</button>
                    <time class="message-time" datetime="2026-10-13T11:03:00Z">Yesterday at 11:03 AM</time>
                  </h3>
                  <div class="message-content"><em>always</em></div>
                </div>
              </li>

              <li class="message">
                <div class="message-gutter"><time class="message-hover-time" datetime="2026-10-13T11:03:20Z">11:03 AM</time></div>
                <div class="message-body">
                  <div class="message-content">brb, lunch</div>
                </div>
              </li>
            </ol>
          </section>
          <!-- the member list goes here (Step 8) -->
        </div>
```
:::

The `datetime` values are fixed here because this is just static HTML. The text "Yesterday at…" is typed by hand and doesn't change. In Lesson 20, JavaScript will compute that text from the `datetime` data.

### Step 7 — The composer

The **composer** is the message box at the bottom of the chat. It's a `<form>` with an upload button, a `<textarea>` and an emoji button. All three controls have an accessible name: the textarea through `aria-label`, and the buttons through their own. `rows="1"` starts the textarea one line tall.

Add it **after `</ol>`** and **before `</section>`**:

::: solution
```html [vanilla/index.html]
            </ol>

            <form class="composer" id="composer">
              <button class="icon-button composer-button" type="button" aria-label="Upload a file">+</button>
              <textarea class="composer-input" id="composer-input" rows="1" placeholder="Message #general" aria-label="Message"></textarea>
              <button class="icon-button composer-button" type="button" aria-label="Choose an emoji">😀</button>
            </form>
          </section>
```
:::

### Step 8 — The member list

Last, add the member list **after the closing `</section>`** of the chat-main area and before the `</div>` of `chat-body`. It's an `<aside>` with group titles (`<h3>`) and each person as a `<button>` containing an avatar and names.

Type the first group (Admin, with Ava) and the first member of the Online group (Leo). Ava and Sam have a second line with a status text. Leo has just a name.

```html
<aside class="member-list" id="member-list" aria-label="Members">
  <h3 class="member-group-title">Admin — 1</h3>
  <button class="member" type="button">
    <span class="avatar">A</span>
    <span class="member-names">
      <span class="member-name">Ava</span>
      <span class="member-status-text">Refactoring everything</span>
    </span>
  </button>

  <h3 class="member-group-title">Online — 4</h3>
  <button class="member" type="button">
    <span class="avatar">L</span>
    <span class="member-names"><span class="member-name">Leo</span></span>
  </button>
  <!-- paste the rest of the Online members and the Offline group here -->
</aside>
```

Then replace the comment with the rest. Note the offline members get the class `is-offline`:

::: starter
            <button class="member" type="button">
              <span class="avatar">N</span>
              <span class="member-names"><span class="member-name">Noah</span></span>
            </button>
            <button class="member" type="button">
              <span class="avatar">R</span>
              <span class="member-names"><span class="member-name">Ravi</span></span>
            </button>
            <button class="member" type="button">
              <span class="avatar">S</span>
              <span class="member-names">
                <span class="member-name">Sam</span>
                <span class="member-status-text">Learning frontend 🚀</span>
              </span>
            </button>

            <h3 class="member-group-title">Offline — 2</h3>
            <button class="member is-offline" type="button">
              <span class="avatar">K</span>
              <span class="member-names"><span class="member-name">Kenji</span></span>
            </button>
            <button class="member is-offline" type="button">
              <span class="avatar">N</span>
              <span class="member-names"><span class="member-name">Nora</span></span>
            </button>
:::

::: solution
```html [vanilla/index.html]
          </section>

          <aside class="member-list" id="member-list" aria-label="Members">
            <h3 class="member-group-title">Admin — 1</h3>
            <button class="member" type="button">
              <span class="avatar">A</span>
              <span class="member-names">
                <span class="member-name">Ava</span>
                <span class="member-status-text">Refactoring everything</span>
              </span>
            </button>

            <h3 class="member-group-title">Online — 4</h3>
            <button class="member" type="button">
              <span class="avatar">L</span>
              <span class="member-names"><span class="member-name">Leo</span></span>
            </button>
            <button class="member" type="button">
              <span class="avatar">N</span>
              <span class="member-names"><span class="member-name">Noah</span></span>
            </button>
            <button class="member" type="button">
              <span class="avatar">R</span>
              <span class="member-names"><span class="member-name">Ravi</span></span>
            </button>
            <button class="member" type="button">
              <span class="avatar">S</span>
              <span class="member-names">
                <span class="member-name">Sam</span>
                <span class="member-status-text">Learning frontend 🚀</span>
              </span>
            </button>

            <h3 class="member-group-title">Offline — 2</h3>
            <button class="member is-offline" type="button">
              <span class="avatar">K</span>
              <span class="member-names"><span class="member-name">Kenji</span></span>
            </button>
            <button class="member is-offline" type="button">
              <span class="avatar">N</span>
              <span class="member-names"><span class="member-name">Nora</span></span>
            </button>
          </aside>
        </div>
```
:::

The long dash in "Admin — 1" is an ordinary character. A plain hyphen works too, but then your page will differ slightly from the screenshot.

### Step 9 — Compare your whole file

Save and look at the page. It will be long and plain. Compare your whole file with the finished version to find any typo. Open DevTools → **Elements** and expand a few levels: you should see `div.app` with `nav`, `aside` and `main` inside.

::: solution
<<< @/../solutions/lesson-03/vanilla/index.html [vanilla/index.html]
:::

### Step 10 — Try the structure

Do these three quick experiments in the browser. They show what the effort bought you.

1. Press <kbd>Tab</kbd> repeatedly. Focus visits every button, then the search box, then the message box. Press <kbd>Enter</kbd> on a server: nothing happens yet, but it behaves as a real button.
2. In DevTools **Elements**, hover over `<nav>`, `<aside>` and `<main>`. The browser highlights the area each covers.
3. Click the search box and type something. Then click the message box and type two lines, pressing <kbd>Enter</kbd> between them. Nothing is sent, because you haven't written any JavaScript yet. In a textarea, <kbd>Enter</kbd> just makes a new line.

<!-- no-solution: experiments in the browser, nothing to type -->

## ✅ Checkpoint

- [ ] The page shows lists of buttons for servers and channels, a big **Frontend Friends** heading, a user panel with Mute / Deafen / Settings, a **general** heading, **Pins** and **Members** buttons with a search box, a numbered list of messages, a message box, and the member names.
- [ ] Pressing <kbd>Tab</kbd> moves the focus ring through every button, the search field and the message box.
- [ ] In DevTools → **Elements**, the structure is `div.app` → `nav.server-rail`, `aside.channel-sidebar`, `main.chat`.
- [ ] Each `id` appears **once** in the file. Use <Keys mac="Cmd+F" win="Ctrl+F" /> in the Elements panel to search for `id="message-list"` and check you get one match.
- [ ] No red errors in the **Console**.
- [ ] In DevTools → **Elements**, the Mute button's tag shows `aria-label="Mute"`.

## 🐛 Common mistakes

**Nothing is where the screenshot shows it, or whole parts are missing.** An element is probably nested in the wrong parent, or a closing tag is missing. In DevTools → Elements, find the first element that sits in the wrong place: the typo is right before it. Check that `<nav>`, `<aside>` and `<main>` are siblings inside `div.app`, and not inside each other.

**The `<li>`s don't line up like a list.** A list item must be directly inside a `<ul>` or `<ol>`. Check that you haven't wrapped an `<li>` in a `<div>`, and that every `<li>` sits directly inside its `<ul>` or `<ol>`.

**The same `id` is used twice.** You may have pasted a block twice. IDs must be unique. Search the file with <Keys mac="Cmd+F" win="Ctrl+F" /> for `id="` and check that every one is different.

**You wrote `class="server-item" is-active`.** Both names must be inside **one** pair of quotes: `class="server-item is-active"`.

**Clicking a button in the message box reloads the page.** A button in a form without `type="button"` submits the form. Add `type="button"` to every button inside `<form>`.

**A button shows only an emoji, and you skipped `aria-label`.** It looks fine, but a screen reader announces just the emoji or nothing. Always give icon-only buttons an `aria-label`.

## 📝 Quiz

::: quiz
Which element is the best choice for the list of channels, a group of buttons used to navigate?

- [ ] `<div class="channel-list">`
- [ ] `<span class="channel-list">`
- [x] `<nav class="channel-list" aria-label="Channel list">`
- [ ] `<main class="channel-list">`

> `<nav>` is the landmark for a group of navigation controls, and the `aria-label` tells screen reader users which navigation it is. `<main>` is for the page's main content only, and should appear once.
:::

::: quiz
What happens with this HTML?

```html
<li class="server-item" id="server">One</li>
<li class="server-item" id="server">Two</li>
```

- [ ] Nothing at all; it's perfectly fine
- [ ] The browser shows an error and refuses to render the page
- [x] The page still renders, but it's invalid: an `id` must be unique, so code looking for `server` can only rely on one of them
- [ ] Both `<li>`s are merged into one

> Browsers are forgiving and render it anyway, which makes this mistake easy to miss. The `class` is shared by both, which is fine. Only `id` has to be unique. Use a class when you need to select several elements.
:::

::: quiz
A button inside a `<form>` has no `type` attribute. A user clicks it. What happens?

- [ ] Nothing, because buttons need JavaScript
- [x] The form is submitted, and the page may reload, because the default type of a button is `submit`
- [ ] The button turns into a link
- [ ] The browser shows an alert

> The default `type` of a `<button>` is `submit`, which submits the form it's in. That's why every button in this app says `type="button"`: it's the "just a button" type.
:::

## 💾 Commit

```sh
git add .
git commit -m "Build the app skeleton with semantic HTML"
git push
```
