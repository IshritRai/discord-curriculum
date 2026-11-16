# Lesson briefs

For lesson N: read GUIDE.md, this brief, the snapshot diff (`diff -ru solutions/lesson-(N-1) solutions/lesson-N`), and this lesson's concepts (`node -e "console.log(JSON.stringify(require('./concepts.json').concepts.filter(c=>c.lesson===N),null,1))"`). Slug/file names come from `site/.vitepress/curriculum.mjs`. Lesson 01+ work in the learner's repo `~/code/chat-clone` (folders `vanilla/`, later `react-app/`).

## 01 Git & GitHub
Diff: README.md, .gitignore at repo root. Teach version control, repository / working directory / staging / commit / history (diagram), Markdown for README, .gitignore (.DS_Store). Steps: check Git (`git --version` may prompt Apple's Command Line Tools install); `git config --global user.name/user.email/init.defaultBranch main`; `git init` in ~/code/chat-clone; README+.gitignore; `git status`; `git add .`; commit "Add hello page"; `git log --oneline`; GitHub account; create empty public repo `chat-clone` (public needed for free Pages on personal accounts: say "check GitHub's current plans"); install GitHub CLI + `gh auth login`; `git remote add origin`; `git push -u origin main`; VS Code Source Control view. Mistakes: git init in home folder, forgot `git add`, identity unknown, push rejected/auth (passwords don't work over HTTPS), nested repo. GitHub UI changes: warning box. Tokens may need adding to Lesson 1 concepts (e.g. `sh:git --version` is covered by `sh:git`).

## 02 HTML: elements, attributes & nesting
Diff: index.html becomes plain document (logo, servers, channels, messages as `ol`, members); adds assets/brand/logo.svg (starter asset; embed with `<<<`). Teach element anatomy, void elements, nesting tree (mermaid), headings, lists, a/href, img (src, alt, width, height; why alt), strong/em/code, comments, entities (`&lt;`, `&amp;`), whitespace collapsing, viewport meta, favicon link. Type a few items per list; the repetitive rest as `::: starter`.

## 03 Semantic HTML: the app skeleton
Diff: index.html rewritten into the real structure (div.app, nav.server-rail, aside.channel-sidebar, header, nav.channel-list > section.category, main.chat, header.chat-header, ol.message-list, form.composer, aside.member-list, section.user-panel; classes, ids, `button type="button"`, `time datetime`, aria-label, role). Teach landmarks vs div/span, class (many) vs id (unique), button vs a, forms/inputs/label, aria-label for icon-only buttons, class naming incl. `is-*` state classes; ASCII diagram of the 5 regions. Type the first item of each list; paste the repetition (`::: starter`). Page is unstyled: expected.

## 04 CSS basics & theme variables
Diff: css/ with theme.css, base.css, server-rail.css, channels.css, chat.css, members.css + 6 link tags. Teach linking, rule anatomy, type/class selectors, selector lists, descendant selector, combined classes, colors (hex, rgba), font properties, px/em, cascade & specificity basics, inheritance, why buttons need `font: inherit` and `background:none; border:none`, custom properties on `:root` + `var()`. `--brand-accent` is in theme.css for now (Lesson 17 moves it to brand.js). Checkpoint: Styles pane crossed-out rule; edit a variable in :root live.

## 05 The box model
Diff: sizing/spacing everywhere. Teach content/padding/border/margin (diagram), box-sizing: border-box + `*`, block/inline/inline-block, shorthand (1–4 values), %, border-radius (50% circle), box-shadow, min-width/height, default margins/lists. Checkpoint: DevTools box-model overlay; 48×48 server circles.

## 06 Flexbox and SVG icons
Diff: display:flex everywhere; assets/icons.svg sprite (starter); `<svg class="icon"><use href="assets/icons.svg#hash"></use></svg>` in HTML; .icon/.icon-button. Teach flex container/items, main vs cross axis (diagram, row and column), flex-direction, justify-content, align-items, gap, flex:1, flex-shrink:0, `margin-left:auto`, `+` combinator; SVG sprites, `<use>`, currentColor. Needs http (Live Server).

## 07 Grid: the app shell
Diff: `.nav-drawer` wrapper in HTML; css/layout.css. Teach grid container, grid-template-columns/rows, fr, auto, `auto 1fr`, grid vs flex, 100vh vs 100dvh (write both, browser ignores what it doesn't understand), nested-layout diagram. The page still scrolls as a whole (Lesson 10 fixes it; say so).

## 08 States: hover, focus, selected & transitions
Teach :hover/:focus/:focus-visible (never remove outlines), state classes vs pseudo-classes, attribute selectors (aria-pressed), ::before/::after + content, transitions, transform: rotate, opacity vs visibility vs display, cursor. Checkpoint: DevTools `:hov` force state; add `is-collapsed` to a category.

## 09 Positioning
Diff: pills, mention badges, status dots, unread classes in HTML, search icon inside input, z-index. Teach normal flow, position relative/absolute (diagram of containing block), offsets, centering with top:50%+translateY(-50%), z-index, pointer-events:none, content-box on badge (why), `var(--x, fallback)`.

## 10 Overflow, scrolling & custom scrollbars
Diff: min-height/min-width 0, overflow-y:auto on 4 columns, ellipsis, .scroller + scrollbar CSS + @supports, pre-wrap, extra static messages (starter). Teach overflow, why flex/grid children don't shrink (min-height:auto; diagram), one scroll container per column, ellipsis needs 3 properties, ::-webkit-scrollbar vs scrollbar-width/color. Hedge on macOS overlay-scrollbar behavior.

## 11 Responsive design
Diff: css/responsive.css (linked last), menu button, .drawer-backdrop, `.menu-button{display:none}`. Teach media queries (max-width), file order/cascade, DevTools device toolbar, drawer technique (fixed + translateX(-100%) + class), inset, `+` for the backdrop. JS adds the class in Lesson 15; for now add `is-nav-open` by hand in DevTools. Screenshots: lesson-11-narrow.png, lesson-11-drawer.png.

## 12 JavaScript for Python programmers
Diff: js/data.js (typed: currentUser, servers) + js/app.js console exploration + 2 `<script defer>`. Teach script/defer, Console, console.log/table, const/let, strings & template literals vs f-strings, numbers/booleans/null/undefined vs None, objects vs dicts, arrays vs lists, if/else, ===, !, &&/||, for...of, functions/return, semicolons. Python→JS comparison table. Scripts share global scope (Lesson 17 replaces with modules).

## 13 The DOM
Diff: app.js fills user panel, sets --avatar-color, swaps status class, server name, document.title; base.css avatar uses `var(--avatar-color, var(--gray))`. Teach DOM tree (diagram), querySelector, textContent, classList, style.setProperty, hidden, document.title.

## 14 Rendering lists from data
Diff: data.js = full data (embed starter with `<<<`), js/dom.js helpers (el, icon, avatar), app.js renders rail/channels/members; HTML lists emptied (ids stay). Teach createElement/className/textContent/append/replaceChildren/replaceWith/setAttribute/dataset (data-*), building UI from small functions, arrow functions, map/filter/find (vs list comprehensions), ternary, innerHTML danger (own icon markup only), aria-hidden.

## 15 Events & event delegation
Diff: clicking servers/channels, collapsing, members toggle, drawer (menu button, backdrop, Escape), `[hidden]{display:none !important}`, CSS hiding collapsed categories' channels. Teach addEventListener, event object, target, closest(), bubbling (diagram), delegation (survives re-render), classList.toggle/contains, aria-expanded/pressed, keydown/event.key, :not(). State is loose variables here: Lesson 16 explains the problem. Screenshot extra: lesson-15-drawer.png.

## 16 State, rendering & localStorage
Diff: app.js restructured: one state object, render functions, actions + update(), messages rendered, localStorage with try/catch; static messages removed. Teach the loop state→render→DOM→event→action (mermaid), single source of truth, why re-render, localStorage, JSON.stringify/parse, try/catch, `??`, includes, push; Application panel.

## 17 Modules & the brand config
Diff: app.js split into modules (main, state, actions, servers, channels, chat, members, user-panel, layout, dom, data, brand); one `<script type="module">`; --brand-accent removed from theme.css. Teach import/export, module scope, ./ paths, needs http, module graph diagram, why state.js can't import main.js (`onChange(render)` callback), brand.js as the ONE branding file.

## 18 JSON files, fetch & async/await
Diff: data/*.json (starter), data.js = loadData() with fetch + Promise.all, main.js `async function start()` + catch. Teach JSON vs JS objects, request/response, fetch, response.ok, .json(), Promises, async/await, Promise.all, array destructuring, shorthand properties, throw new Error, Network panel. Mistakes: missing await, trailing comma, 404.

## 19 Channel list: categories, voice, unread & mentions
Diff: unread/mention badges derived from channel data, voice channels list connected users, collapse done in JS (CSS rule removed), getChannels (flatMap), findChannel across servers, markChannelRead, css/voice.css, .avatar.tiny. Teach derived data, flatMap, some, continue.

## 20 Message feed
Diff: js/time.js (starter explained here: walk through it), grouping, date dividers, welcome header, avatar buttons, role colors, bot tag, scroll to bottom. Teach Date, ISO timestamps, Intl.DateTimeFormat, Today/Yesterday logic, grouping rule (same author, <7 min, same day; trace example), scrollTop/scrollHeight/clientHeight (diagram), align-self.

## 21 Markdown & links
Diff: js/markdown.js, innerHTML = renderMarkdown, mentionsMe/.is-mention, (edited) label, CSS. Teach XSS (why never innerHTML with user text; escape first), regex (literals, g flag, groups $1, lazy .+?), replace with function, split with capture group, slice, startsWith, replaceAll, code-first order, target=_blank + rel=noopener noreferrer, color-mix().

## 22 The composer
Diff: composer.js, sendMessage action, autoResize export, setupComposer, max-height. Teach submit + preventDefault, keydown + shiftKey, .value/.trim(), crypto.randomUUID(), toISOString(), auto-grow via scrollHeight; sent messages saved automatically. Checkpoint: HTML typed in a message shows as text.

## 23 Editing & deleting
Diff: hover action bar (own messages only), inline editor with draft in state, Enter/Escape, ArrowUp edits last, confirm() before delete (Shift+click skips), findMessage (Object.values), deleteMessage (Object.keys), CSS, :focus-within, :empty. Teach why the draft lives in state (re-render destroys the textarea), restoring focus (focus, setSelectionRange, document.activeElement), confirm() (Lesson 26 replaces it).

## 24 Emoji picker & reactions
Diff: data/emoji.json (starter), js/reactions.js (picker), popover markup, toggleReaction, reaction pills, react button, composer emoji button, css/overlays.css. Teach Popover API (popover attr, showPopover/hidePopover, light dismiss, :popover-open, top layer; check MDN wording), positioning with getBoundingClientRect/window sizes/offsetWidth/Math.min,max, reaction data model, setRangeText, selectionStart/End, repeat() grid, flex-wrap.

## 25 Member list
Diff: groupMembers (role groups → Online → Offline), sort by name, role colors, matchMedia to start hidden on narrow screens. Teach grouping algorithm (trace), sort with compare fn + localeCompare (vs sorted(key=)), spread arrays, matchMedia + change event.

## 26 Modals with <dialog>
Diff: 3 dialogs in HTML, js/modals.js, createServer, profile opens from members/authors/user panel, delete uses dialog, .button styles, modal CSS. Teach dialog, showModal/close, ::backdrop, Escape for free, form method="dialog" + returnValue, close event, required/maxlength, FormData, backdrop-click trick, initials via split/map/join/toUpperCase.

## 27 Context menus & tooltips
Diff: js/menus.js, js/tooltips.js, tooltip + menu elements, data-tooltip attrs, markServerRead/markRead/leaveServer/resetDemoData/clearSaved, CSS. Teach contextmenu + preventDefault, clientX/Y, keep menus in window, menus as data (functions as values), navigator.clipboard.writeText + .catch, one shared tooltip via mouseover/focusin/focusout, location.reload().

## 28 Timers
Diff: data/chatter.json (starter), js/simulation.js, typing indicator `<p aria-live>`, sendMessage marks other channels unread/mentions, replies, dots animation. Teach setTimeout (non-blocking, vs time.sleep), scheduling next from inside, Math.random/floor, @keyframes/animation/animation-delay/:nth-child, aria-live. Everything is fake: no network.

## 29 Voice channel UI
Diff: voice panel, voice state/actions, you appear in channel, mute/deafen icons, js/voice.js (renderSpeaking + setInterval), CSS. Teach modelling UI state (deafen implies mute…), setInterval, why speaking uses a targeted update not render(), querySelectorAll, CSS variable through <use> (--icon-slash-color), box-shadow rings. Say clearly: NO audio is captured or sent.

## 30 Optional: your mic, locally
Diff: js/mic.js, mic checkbox, voice.js wiring. Teach permissions/secure context (check MDN: does http://127.0.0.1 count?), getUserMedia({audio:true}), MediaStream tracks + stop(), AudioContext, createMediaStreamSource, AnalyserNode (fftSize, getFloatTimeDomainData), loudness = RMS (explain with numbers), threshold + hold time, requestAnimationFrame/cancel, performance.now(), checkbox change. Privacy section: nothing recorded/stored/sent; Network panel stays quiet. Mark optional.

## 31 Deploy to GitHub Pages
Diff: root index.html landing page, README live link. Teach static hosting, Pages "Deploy from a branch" (UI may have changed: warning), URL shape https://USER.github.io/chat-clone/vanilla/, relative paths, HTTPS, hard reload, check deployed site in Network. Free Pages needs a public repo (verify on docs.github.com).

## 32 Node, npm, Vite & JSX
Diff: new react-app/ from `npm create vite@latest react-app -- --template react`, template extras removed, CSS copied to src/styles and imported in main.jsx, icons.svg + brand/logo.svg in public/, App.jsx = Lesson 11 shell as JSX, index.html title/favicon. Teach Node/npm (LTS from nodejs.org; installers change), package.json, node_modules (never commit), npm install, npm run dev, HMR; create-vite prompts (may ask to install and start: say No to follow along; prompts may differ: warning); JSX (className, closed tags, one parent / fragments, {/* */}, dateTime), components = functions returning JSX, export default, `import './x.css'`, createRoot, StrictMode. npm ≈ pip. Paste the converted JSX as `::: starter 32` after converting a small part (user panel) yourself.

## 33 Components, props, lists & keys
Diff: components/ (Icon, Avatar, ServerRail, ChannelSidebar, ChannelList, UserPanel, ChatArea, MessageList, Message, MemberList), state/selectors.js, lib/ (markdown/time starters explained in Lessons 20/21 + classNames.js), brand.js + applyBrand() in main.jsx, data JSON in src/data. Teach components & props (component-tree diagram), destructuring, {expressions}, conditional rendering, map + key (why), `style={{ '--avatar-color': … }}`, dangerouslySetInnerHTML (safe only because renderMarkdown escapes), importing JSON, ...rest props, filter(Boolean). "Vanilla vs React" box.

## 34 State & events with useState
Diff: App.jsx holds useState state; handlers as props; Composer.jsx controlled textarea; state/updates.js. Teach useState, event props, controlled inputs, never mutate (spread, computed keys), lifting state up, prop drilling (show the chain). Vanilla vs React box.

## 35 useReducer & Context
Diff: state/reducer.js, state/AppContext.jsx (AppProvider, useApp), components read context, edit/delete with window.confirm, updateMessage. Teach reducers ((state, action) => newState, switch), actions as objects, ids/timestamps made outside the reducer, useReducer with init fn, Context (createContext, provider syntax: verify on react.dev for React 19), custom hook useApp; data-flow diagram. Local state for the edit draft vs vanilla's state.editDraft.

## 36 Effects & refs
Diff: persistence (storage.js, save effect), useRef, useLayoutEffect scroll, lib/simulation.js + hooks/useSimulation.js (cleanup), TypingIndicator, getState via ref, matchMedia+Escape effect, chatter.json. Teach effects = syncing with the outside world, dependency arrays, cleanup, StrictMode double-run in dev (verify wording on react.dev), useRef for DOM and non-rendering values, useLayoutEffect vs useEffect, `?.`, clearTimeout.

## 37 Routing with React Router
Diff: `npm install react-router`, HashRouter in main.jsx, Routes/Route/Navigate, ChatScreen with useParams, useNavigate, `channelOpened` action replaces selectServer/selectChannel, activeServerId removed, viewingChannelId. Teach URL as state, routes & params, HashRouter vs BrowserRouter (GitHub Pages has no rewrites), back/forward, redirects, "where should state live?". Verify APIs against reactrouter.com (declarative mode).

## 38 Reactions, emoji picker & member list
Diff: toggleReaction, EmojiPicker.jsx (popover via ref + useLayoutEffect + onToggle), emoji.json, reaction buttons, drafts in state.drafts, grouped MemberList with keyed Fragment, groupMembers selector. Teach driving browser features React doesn't model (popover) with refs/effects, callbacks stored in state (onPick), currentTarget vs target, keyed Fragment, why drafts are shared state (trade-off).

## 39 Modals, context menus & tooltips
Diff: Dialogs.jsx (Modal calls showModal on mount), ContextMenu.jsx, Tooltip.jsx + hooks/useTooltips.js, reducer actions for menus/dialogs/servers, onContextMenu, delete dialog. Teach mounting a dialog = opening it, onClose, forms with onSubmit + FormData, menu items from state, wrapping imperative DOM code in an effect with cleanup. Vanilla vs React box.

## 40 Voice UI & custom hooks
Diff: voice state/actions, VoicePanel.jsx (always rendered, hidden when disconnected), ToggleButtons, speaking rings, hooks/useSpeakingSimulation.js, hooks/useMicSpeaking.js wrapping lib/mic.js, peopleInVoice selector. Teach custom hooks, effects that start/stop hardware with cleanup, setInterval cleanup, why re-rendering the whole tree every 400 ms is fine here (vs vanilla's targeted renderSpeaking). Mic part optional like Lesson 30.

## 41 Vanilla vs React, and deploying React
Diff: vite.config.js `base: './'`, .github/workflows/deploy.yml (starter), root index.html links both, README. Main part: honest side-by-side comparison (list rendering, click handling, where state lives, updating the screen, forms, effects vs listeners, persistence, routing, size: measure with `wc -l` on both snapshots and quote real numbers, when to choose which). Deploy: `npm run build`/`npm run preview`, dist/, why base './', Pages "Source: GitHub Actions" (replaces Lesson 31's branch deploy), the workflow explained step by step in plain words, Actions tab, URLs. Action versions were current when written and may need updating.
