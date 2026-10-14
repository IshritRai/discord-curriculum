// Single source of truth for the course structure.
// The sidebar, prev/next links, lesson headers, progress page and the
// concept checker all read this file.

export const phases = [
  { id: 'setup', title: 'Phase 0 — Setup' },
  { id: 'git', title: 'Phase 1 — Git & GitHub' },
  { id: 'html', title: 'Phase 2 — HTML' },
  { id: 'css', title: 'Phase 3 — CSS' },
  { id: 'js', title: 'Phase 4 — JavaScript in the browser' },
  { id: 'features', title: 'Phase 5 — Features' },
  { id: 'voice', title: 'Phase 6 — Voice UI' },
  { id: 'deploy', title: 'Phase 7 — Deploy' },
  { id: 'react', title: 'Phase 8 — React' },
  { id: 'wrapup', title: 'Phase 9 — Compare & deploy React' },
]

// app: which version of the app the lesson works on ('vanilla' | 'react').
// The React version lives in the react-app/ folder, so the project's package name
// isn't the same as the "react" library it depends on.
export const lessons = [
  { n: 0, slug: '00-toolkit', phase: 'setup', title: 'Your toolkit & how the web works', minutes: 55, app: 'vanilla' },
  { n: 1, slug: '01-git', phase: 'git', title: 'Git & GitHub: save and share your work', minutes: 55, app: 'vanilla' },
  { n: 2, slug: '02-html-basics', phase: 'html', title: 'Elements, attributes & nesting', minutes: 50, app: 'vanilla' },
  { n: 3, slug: '03-semantic-html', phase: 'html', title: 'Semantic HTML: the app skeleton', minutes: 60, app: 'vanilla' },
  { n: 4, slug: '04-css-basics', phase: 'css', title: 'Selectors, colors, text & theme variables', minutes: 55, app: 'vanilla' },
  { n: 5, slug: '05-box-model', phase: 'css', title: 'The box model', minutes: 55, app: 'vanilla' },
  { n: 6, slug: '06-flexbox', phase: 'css', title: 'Flexbox and SVG icons', minutes: 60, app: 'vanilla' },
  { n: 7, slug: '07-grid', phase: 'css', title: 'Grid: the app shell', minutes: 50, app: 'vanilla' },
  { n: 8, slug: '08-states', phase: 'css', title: 'States: hover, focus, selected & transitions', minutes: 55, app: 'vanilla' },
  { n: 9, slug: '09-positioning', phase: 'css', title: 'Positioning: badges, dots & layers', minutes: 50, app: 'vanilla' },
  { n: 10, slug: '10-scrolling', phase: 'css', title: 'Overflow, scrolling & custom scrollbars', minutes: 50, app: 'vanilla' },
  { n: 11, slug: '11-responsive', phase: 'css', title: 'Responsive design', minutes: 55, app: 'vanilla' },
  { n: 12, slug: '12-js-basics', phase: 'js', title: 'JavaScript for Python programmers', minutes: 60, app: 'vanilla' },
  { n: 13, slug: '13-dom', phase: 'js', title: 'The DOM: find and change elements', minutes: 50, app: 'vanilla' },
  { n: 14, slug: '14-rendering-lists', phase: 'js', title: 'Rendering lists from data', minutes: 60, app: 'vanilla' },
  { n: 15, slug: '15-events', phase: 'js', title: 'Events & event delegation', minutes: 60, app: 'vanilla' },
  { n: 16, slug: '16-state', phase: 'js', title: 'State, rendering & localStorage', minutes: 60, app: 'vanilla' },
  { n: 17, slug: '17-modules', phase: 'js', title: 'Modules & the brand config', minutes: 55, app: 'vanilla' },
  { n: 18, slug: '18-fetch-json', phase: 'js', title: 'JSON files, fetch & async/await', minutes: 55, app: 'vanilla' },
  { n: 19, slug: '19-channel-list', phase: 'features', title: 'Channel list: categories, voice, unread & mentions', minutes: 60, app: 'vanilla' },
  { n: 20, slug: '20-message-feed', phase: 'features', title: 'Message feed: grouping, timestamps & dividers', minutes: 60, app: 'vanilla' },
  { n: 21, slug: '21-markdown', phase: 'features', title: 'Markdown & links: regex and safe HTML', minutes: 60, app: 'vanilla' },
  { n: 22, slug: '22-composer', phase: 'features', title: 'The composer: sending messages', minutes: 55, app: 'vanilla' },
  { n: 23, slug: '23-edit-delete', phase: 'features', title: 'Editing & deleting your messages', minutes: 60, app: 'vanilla' },
  { n: 24, slug: '24-reactions', phase: 'features', title: 'Emoji picker & reactions', minutes: 60, app: 'vanilla' },
  { n: 25, slug: '25-member-list', phase: 'features', title: 'Member list: roles & online status', minutes: 50, app: 'vanilla' },
  { n: 26, slug: '26-modals', phase: 'features', title: 'Modals with <dialog>', minutes: 60, app: 'vanilla' },
  { n: 27, slug: '27-menus-tooltips', phase: 'features', title: 'Context menus & tooltips', minutes: 60, app: 'vanilla' },
  { n: 28, slug: '28-timers', phase: 'features', title: 'Timers: typing indicator & fake messages', minutes: 55, app: 'vanilla' },
  { n: 29, slug: '29-voice-ui', phase: 'voice', title: 'Voice channel UI', minutes: 60, app: 'vanilla' },
  { n: 30, slug: '30-web-audio', phase: 'voice', title: 'Optional: your mic, locally, with Web Audio', minutes: 55, app: 'vanilla', optional: true },
  { n: 31, slug: '31-deploy-pages', phase: 'deploy', title: 'Deploy to GitHub Pages', minutes: 45, app: 'vanilla' },
  { n: 32, slug: '32-vite-jsx', phase: 'react', title: 'Node, npm, Vite & JSX', minutes: 60, app: 'react' },
  { n: 33, slug: '33-components-props', phase: 'react', title: 'Components, props, lists & keys', minutes: 60, app: 'react' },
  { n: 34, slug: '34-usestate', phase: 'react', title: 'State & events with useState', minutes: 60, app: 'react' },
  { n: 35, slug: '35-reducer-context', phase: 'react', title: 'useReducer & Context', minutes: 60, app: 'react' },
  { n: 36, slug: '36-effects-refs', phase: 'react', title: 'Effects & refs', minutes: 60, app: 'react' },
  { n: 37, slug: '37-routing', phase: 'react', title: 'Routing with React Router', minutes: 55, app: 'react' },
  { n: 38, slug: '38-react-chat-features', phase: 'react', title: 'Reactions, emoji picker & member list', minutes: 60, app: 'react' },
  { n: 39, slug: '39-react-overlays', phase: 'react', title: 'Modals, context menus & tooltips', minutes: 60, app: 'react' },
  { n: 40, slug: '40-react-voice', phase: 'react', title: 'Voice UI & custom hooks', minutes: 60, app: 'react' },
  { n: 41, slug: '41-compare-deploy', phase: 'wrapup', title: 'Vanilla vs React, and deploying React', minutes: 60, app: 'react' },
]

export const pad = (n) => String(n).padStart(2, '0')
export const appFolder = (app) => (app === 'react' ? 'react-app' : app)
export const lessonLink = (lesson) => `/lessons/${lesson.slug}`
export const lessonByNumber = (n) => lessons.find((l) => l.n === n)
