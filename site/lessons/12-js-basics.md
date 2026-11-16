---
lesson: 12
title: JavaScript for Python programmers
---

# Lesson 12 — JavaScript for Python programmers

Until now the page has been HTML and CSS: it looks right, but nothing on it can *think*. Today you add the third language, JavaScript. You'll learn its basics by comparing it with Python, and you'll make your first data (a user and five servers) that the chat app will use from now on.

## 🎯 Goal

By the end of this lesson the page looks **exactly the same** as before. The change is in DevTools: the **Console** prints your first JavaScript output, including a table of the five servers.

<!-- no-screenshot: nothing visible changes on the page; the result is the output in the DevTools Console -->

The Console should show something like this (the exact layout of the table depends on your Chrome version):

```text
Hello from app.js!
Hubbub 1
Sam
Logged in as Sam (sam.codes)
You have joined 5 servers
The first server is Frontend Friends
Frontend Friends
Pixel Art Club
Weekend Hikers
Study Group
Game Night
[FF] Frontend Friends
🎨 Pixel Art Club
🥾 Weekend Hikers
[SG] Study Group
🎲 Game Night
Servers with an emoji icon: 3
(a table with 5 rows: id, name, icon, iconIsEmoji)
```

## 🧠 New concepts

<ConceptList />

### What JavaScript is, and where it runs

JavaScript (JS) is the programming language of the browser. Every browser has a JavaScript engine built in, so there is nothing to install. The browser downloads a `.js` file the same way it downloads HTML and CSS, then runs it. (JavaScript can also run outside the browser, for example in Node.js, which you'll meet in Lesson 32. For now, "JavaScript" means "JavaScript in the browser".)

Despite the name, JavaScript is unrelated to Java.

JavaScript will do three jobs in this app, one per group of lessons:

| Lessons | JavaScript's job |
| --- | --- |
| 12 – 14 | Hold data and build page content from it |
| 15 – 16 | React to clicks and remember what happened (state) |
| 17 onwards | Fetch data, handle time, text, timers and more |

### Adding a script to the page: `<script defer>`

You load a JavaScript file with a `<script>` tag, a bit like `<link>` for CSS:

```html
<script src="js/app.js" defer></script>
```

- `src` is the path to the file (relative to the HTML file, just like `href` in `<link>`).
- `defer` is a **boolean attribute**: it has no value. It tells the browser "download this file while you read the page, but only *run* it after the whole HTML has been read". That matters because soon your scripts will look for elements on the page. If the script ran before those elements existed, it would find nothing. With `defer` the page is always ready.
- Several deferred scripts run **in the order they appear** in the HTML.

### The Console and `console.log`

The **Console** is a panel in DevTools where you can see messages from your code and type JavaScript to run it right away. It's like Python's interactive prompt (`>>>`), built into the browser.

`console.log(...)` is JavaScript's `print(...)`. It writes its arguments to the Console, separated by spaces:

```js
console.log('Hello', 42);
```

`console.table(...)` prints an array of objects as a table. It is wonderful for checking data.

### JavaScript syntax for Python programmers

Here is a side-by-side overview. Don't memorise it: you'll use every row in the next few lessons and it will stick.

| | Python | JavaScript |
| --- | --- | --- |
| Print | `print(x)` | `console.log(x)` |
| Comment | `# note` | `// note` (or `/* ... */`) |
| Variable | `count = 0` | `let count = 0;` |
| Constant (never reassigned) | `MAX = 5` (just a convention) | `const MAX = 5;` |
| Text with values | `f"Hi {name}"` | `` `Hi ${name}` `` |
| Nothing | `None` | `null` (and also `undefined`) |
| True / False | `True`, `False` | `true`, `false` |
| And / or / not | `and`, `or`, `not` | `&&`, `\|\|`, `!` |
| Equal | `a == b` | `a === b` |
| Dict | `{"name": "Sam"}` | `{ name: 'Sam' }` |
| List | `[1, 2, 3]` | `[1, 2, 3]` |
| Length | `len(items)` | `items.length` |
| Loop over items | `for x in items:` | `for (const x of items) { ... }` |
| Function | `def add(a, b):` | `function add(a, b) { ... }` |
| Blocks | indentation | `{ ... }` braces |

Two things look different at first glance: **braces** and **semicolons**. JavaScript uses `{ }` to group code, and indentation is only for people. Statements end with `;`. JavaScript can often guess where statements end if you leave semicolons out, but the guessing has a few surprising corner cases, so this course always writes them.

### Variables: `const` and `let`

```js
const appName = 'Hubbub';   // can never be pointed at something else
let messageCount = 0;       // can be reassigned later
messageCount = messageCount + 1;
```

- `const` makes a variable that you can't **reassign**. Using `appName = 'Other'` later would cause an error.
- `let` makes a variable you *can* reassign.

Rule of thumb for this course: **use `const` by default**, and switch to `let` only when you really need to change the variable. (There is a third keyword, `var`, from older JavaScript. You'll see it in old tutorials. Don't use it.)

Unlike in Python, you must *declare* a variable with `const` or `let` the first time you use it. Writing `count = 0` with no keyword is a mistake.

::: info `const` does not make things frozen
`const` stops you from pointing the *name* at a different value. It does not stop you from changing what's *inside* an object or array that the name points to. You'll see that in Lesson 13. Think of it as "this label is glued to this box", not "this box is sealed".
:::

### Values: strings, numbers, booleans, `null` and `undefined`

```js
'single quotes'
"double quotes work too"
42
3.14
true
false
null
undefined
```

- **Strings** can use single or double quotes. This course uses single quotes.
- **Numbers**: there's just one kind. Python's `int` and `float` are both "number" in JavaScript. Arithmetic works as you'd expect: `+ - * /`, and `%` for the remainder. `/` always gives a regular division (`7 / 2` is `3.5`).
- **Booleans** are lowercase: `true` and `false`.
- **`null`** is a value that means "deliberately nothing". It's the closest thing to Python's `None`.
- **`undefined`** is what JavaScript gives you when something *doesn't exist yet*: a variable that was declared with no value, or a property that isn't there. Python would have raised an error (`KeyError`, `AttributeError`) in the same situations. JavaScript quietly gives you `undefined` instead. Be alert: that is the source of many bugs.

Increment shortcuts exist too: `count += 1` means `count = count + 1`, just like in Python.

### Template literals

Strings in **backticks** (the `` ` `` key, usually above <kbd>Tab</kbd>) are called **template literals**. They work like Python's f-strings: inside `${ ... }` you can put any expression.

```js
const name = 'Sam';
console.log(`Hello, ${name}! 2 + 2 = ${2 + 2}`);
```

```text
Hello, Sam! 2 + 2 = 4
```

::: tip Python comparison
`f"Hello, {name}!"` in Python is `` `Hello, ${name}!` `` in JavaScript. Template literals can also span several lines, like Python's triple-quoted strings. Normal quotes `'...'` do **not** substitute anything: `'${name}'` is just those characters.
:::

### Objects (like Python dictionaries)

An **object** groups named values. Each name is called a **property**:

```js
const currentUser = {
  displayName: 'Sam',
  username: 'sam.codes',
  status: 'online',
};

console.log(currentUser.displayName);     // dot access
console.log(currentUser['displayName']);  // bracket access: same thing
```

Compared with a Python dict:

- Keys are usually written **without quotes**: `displayName: 'Sam'`. (They're still strings underneath.)
- Read a property with a **dot**: `currentUser.displayName`. Brackets with a string work too, and you need them when the name is stored in a variable.
- Missing properties give `undefined`, not an error: `currentUser.age` is `undefined`.
- Entries are separated by commas. A comma after the last entry (a "trailing comma") is allowed, and this course uses it because it makes it easier to add lines later.

### Arrays (like Python lists)

```js
const names = ['Ava', 'Leo', 'Noah'];
console.log(names[0]);       // 'Ava': counting starts at 0, like Python
console.log(names.length);   // 3: a property, not a function like len()
```

Differences to remember:

- Length is `names.length` (no parentheses).
- `names[-1]` does **not** give the last item in JavaScript. It gives `undefined`. Use `names[names.length - 1]` instead.
- Arrays can hold anything, including objects. An array of objects is the most common shape of data in web apps, and it's what `servers` is.

### `if` / `else` and comparing values

```js
if (server.iconIsEmoji) {
  console.log('emoji icon');
} else {
  console.log('text icon');
}
```

Compared with Python: the condition goes in **parentheses**, the blocks in **braces**, and `else` replaces the colon-and-indent. (`else if (...) { ... }` replaces `elif`.)

**Always compare with `===`** (three equals signs). It checks that the values are equal *and* the same type. The shorter `==` converts types behind your back (`0 == ''` is `true`, which is rarely what you want), so we never use it. The opposite of `===` is `!==`.

For boolean logic, JavaScript uses symbols:

| Python | JavaScript |
| --- | --- |
| `a and b` | `a && b` |
| `a or b` | `a \|\| b` |
| `not a` | `!a` |

### `for...of` loops

```js
for (const server of servers) {
  console.log(server.name);
}
```

This is Python's `for server in servers:`. The word is **`of`**, not `in`. (JavaScript has a `for...in` loop too, but it does something different and surprising. We won't use it.) `const` is fine here: each time around the loop `server` is a fresh variable.

### Functions

```js
function describeServer(server) {
  return `${server.icon} ${server.name}`;
}

console.log(describeServer(servers[0]));
```

- `function` replaces `def`; the parameters go in parentheses; the body goes in braces.
- `return` sends a value back, just like Python. A function with no `return` gives back `undefined` (Python would give `None`).
- You call it with parentheses: `describeServer(servers[0])`.

### Global scope: scripts share variables (for now)

A script file's top-level `const`, `let` and `function` declarations are visible to **every other classic script** on the same page. That's why `app.js` can use `currentUser` and `servers` from `data.js` without importing anything. It works but gets messy as the app grows: any file can accidentally clash with any other. In Lesson 17 you'll replace it with **modules**, which keep each file's names private unless you share them on purpose.

Because of that sharing, the order of the `<script>` tags matters: `data.js` must come before `app.js`.

## 🛠️ Build it

### Step 1 — Create the two script files and load them

In VS Code, create a new folder `vanilla/js/`, and inside it two empty files: `data.js` and `app.js`.

Then open `vanilla/index.html`. At the end of `<head>`, right after the last `<link>` (the one for `css/responsive.css`), add a comment and the two script tags. `data.js` goes first, because `app.js` will use its variables:

::: solution
```html [vanilla/index.html]
    <link rel="stylesheet" href="css/responsive.css">
    <!-- defer: run the scripts after the whole page has been read -->
    <script src="js/data.js" defer></script>
    <script src="js/app.js" defer></script>
  </head>
```
:::

### Step 2 — Write your first script and open the Console

Put one line in `vanilla/js/app.js`:

```js
console.log('Hello from app.js!');
```

Open the page with Live Server, open DevTools (<Keys mac="Cmd+Option+I" win="Ctrl+Shift+I" />) and click the **Console** tab. You should see `Hello from app.js!`, with `app.js:1` on the right: the file and line that printed it.

Seeing nothing? Look at the **Network** tab and reload: both `data.js` and `app.js` should have status `200`. A `404` means the path in `src` doesn't match where you put the file.

::: solution
```js [vanilla/js/app.js]
console.log('Hello from app.js!');
```
:::

### Step 3 — Write the data: the current user

Open `vanilla/js/data.js` and type this. It is the chat app's first piece of data: who's logged in. (`status` is one of `online`, `idle`, `dnd` or `offline`, and later lessons will use it.)

::: solution
```js [vanilla/js/data.js]
// The app's fake data. For now it's plain JavaScript values.

const currentUser = {
  id: 'u-me',
  displayName: 'Sam',
  username: 'sam.codes',
  avatarColor: '#3b82f6',
  status: 'online',
  customStatus: 'Learning frontend 🚀',
};
```
:::

### Step 4 — Write the data: the servers

Add this to the end of `data.js`, below `currentUser`. It's an **array of objects**: one object per server. `iconIsEmoji` tells us whether `icon` is an emoji or two letters.

To type an emoji, <Os mac="press Ctrl+Cmd+Space to open the emoji picker" windows="press the Windows key and the period key together" linux="use your desktop's emoji picker if it has one" />, or copy one from the code.

::: solution
```js [vanilla/js/data.js]
const servers = [
  { id: 's-frontend', name: 'Frontend Friends', icon: 'FF', iconIsEmoji: false },
  { id: 's-pixel', name: 'Pixel Art Club', icon: '🎨', iconIsEmoji: true },
  { id: 's-hikers', name: 'Weekend Hikers', icon: '🥾', iconIsEmoji: true },
  { id: 's-study', name: 'Study Group', icon: 'SG', iconIsEmoji: false },
  { id: 's-games', name: 'Game Night', icon: '🎲', iconIsEmoji: true },
];
```
:::

### Step 5 — Variables and objects in `app.js`

Replace the contents of `app.js` with the following. The two lines at the top describe the file; the rest practises variables and reading an object.

Notice that `currentUser` is used here but defined in `data.js`: that's the shared global scope at work.

After you save, the Console should print `Hubbub 1`, then `Sam`, then `Logged in as Sam (sam.codes)`.

::: solution
```js [vanilla/js/app.js]
// Lesson 12: getting to know JavaScript in the browser's console.
// Open DevTools → Console to see what this file prints.

console.log('Hello from app.js!');

// ---------- Values and variables ----------

const appName = 'Hubbub';
let messageCount = 0;
messageCount = messageCount + 1;
console.log(appName, messageCount);

// ---------- Objects (like Python dictionaries) ----------

console.log(currentUser.displayName);
console.log(`Logged in as ${currentUser.displayName} (${currentUser.username})`);
```
:::

### Step 6 — Arrays and loops

Add this to the end of `app.js`. Predict the output before you save: how many lines will the loop print?

Expected Console output: `You have joined 5 servers`, then `The first server is Frontend Friends`, then the five server names, one per line.

::: solution
```js [vanilla/js/app.js]
// ---------- Arrays (like Python lists) ----------

console.log(`You have joined ${servers.length} servers`);
console.log('The first server is', servers[0].name);

// ---------- Loops ----------

for (const server of servers) {
  console.log(server.name);
}
```
:::

### Step 7 — Functions and `if` / `else`

Add `describeServer` and a loop that calls it. For emoji servers it prints the emoji and the name, for text servers the letters in square brackets.

::: solution
```js [vanilla/js/app.js]
// ---------- Functions and if/else ----------

function describeServer(server) {
  if (server.iconIsEmoji) {
    return `${server.icon} ${server.name}`;
  } else {
    return `[${server.icon}] ${server.name}`;
  }
}

for (const server of servers) {
  console.log(describeServer(server));
}
```
:::

### Step 8 — A function that counts

Add a second function, `countEmojiServers`. It takes a list, starts a counter at 0, adds 1 for each server with an emoji icon and returns the total. Then call it, and finish with `console.table`.

Here's the same logic in Python, for comparison:

```python
def count_emoji_servers(server_list):
    count = 0
    for server in server_list:
        if server["iconIsEmoji"] == True:
            count += 1
    return count
```

::: solution
```js [vanilla/js/app.js]
function countEmojiServers(serverList) {
  let count = 0;
  for (const server of serverList) {
    if (server.iconIsEmoji === true) {
      count += 1;
    }
  }
  return count;
}

console.log('Servers with an emoji icon:', countEmojiServers(servers));

// console.table shows an array of objects as a table
console.table(servers);
```
:::

### Step 9 — Experiment in the Console

The Console is also a prompt where you can type JavaScript. Because `data.js` declared `servers` and `currentUser` at the top level, you can use them there too. Try these, one at a time, pressing <kbd>Enter</kbd> after each:

```js
servers.length;
servers[1].name;
servers[99];
servers[0].colour;
`${currentUser.displayName} is ${currentUser.status}`;
0 === '';
0 == '';
```

Notice that `servers[99]` and `servers[0].colour` give `undefined` rather than an error, and that `0 == ''` is `true` while `0 === ''` is `false`. That is why we use `===`.

<!-- no-solution: experimenting in the Console, nothing to type into a file -->

## ✅ Checkpoint

- [ ] `vanilla/js/data.js` and `vanilla/js/app.js` exist, and `index.html` loads both with `defer`, `data.js` first.
- [ ] The page looks the same as at the end of Lesson 11.
- [ ] DevTools → **Console** prints `Hello from app.js!`, `Hubbub 1`, `Sam` and `Logged in as Sam (sam.codes)`.
- [ ] The Console shows `You have joined 5 servers` and then the five server names.
- [ ] The Console shows `Servers with an emoji icon: 3` and a table with five rows.
- [ ] The Console shows **no red errors**.
- [ ] In DevTools → **Network** (reload the page), `data.js` and `app.js` both have status **200**.
- [ ] Typing `servers.length` in the Console gives `5`.

## 🐛 Common mistakes

**Nothing appears in the Console.** The script isn't loading. Check that the `<script>` tags are in `index.html` and the paths are right (`js/app.js`, not `/js/app.js` or `app.js`). In the Network tab, a `404` row for `app.js` confirms a wrong path. Also check that the Console isn't hiding messages through a filter.

**Red error `Uncaught ReferenceError: currentUser is not defined`.** `app.js` ran, but `data.js` didn't, or it ran *after* `app.js`. Check that `data.js` is listed first and that its file name is spelled correctly. A typo inside `data.js` can also stop it from running: look for another red error above this one.

**Red error `Uncaught SyntaxError: ...`.** A brace, bracket, parenthesis or quote doesn't match. The Console shows the file and line number on the right of the message: click it to jump to the spot. Python lets you get away without closing anything on a line; JavaScript doesn't.

**Red error `Assignment to constant variable.`** You reassigned a `const`. If the variable really must change, declare it with `let`.

**An `if` is always true (or always false).** In JavaScript, a single `=` *assigns* and `===` *compares*. `if (count = 0)` doesn't compare anything. Use three equals signs.

**`undefined` appears where you expected text.** You misspelled a property name (`currentUser.displayname` instead of `displayName`). Property names are case-sensitive and JavaScript doesn't complain about missing ones. `console.log` the whole object to see its real property names.

## 📝 Quiz

::: quiz
What does this print?

```js
const user = { name: 'Sam' };
console.log(user.age);
```

- [ ] An error, like Python's `KeyError`
- [ ] `null`
- [x] `undefined`
- [ ] Nothing at all

> A property that doesn't exist on an object gives `undefined`, not an error. Python would raise `KeyError` for a missing dict key (or `AttributeError` for a missing attribute). That's why a misspelled property name can hide for a while.
:::

::: quiz
What does this print?

```js
let total = 0;
const prices = [3, 4, 5];
for (const price of prices) {
  total += price;
}
console.log(`Total: ${total}`);
```

- [ ] `Total: 0`
- [x] `Total: 12`
- [ ] `Total: ${total}`
- [ ] An error, because `total` is reassigned

> The loop adds 3, 4 and 5 to `total`, so it ends as 12. Reassigning is fine because `total` was declared with `let`. Using a `const` for `total` would fail. The `${total}` is replaced with its value because the string uses backticks.
:::

::: quiz
Which of these is the right way to write Python's `if not done and count == 3:` in JavaScript?

- [ ] `if (not done and count == 3) { }`
- [ ] `if (!done && count = 3) { }`
- [x] `if (!done && count === 3) { }`
- [ ] `if !done && count === 3 { }`

> `not` becomes `!`, `and` becomes `&&`, and equality is `===`. The whole condition sits in parentheses, and a single `=` would assign instead of compare.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add data.js and first JavaScript in app.js"
git push
```
