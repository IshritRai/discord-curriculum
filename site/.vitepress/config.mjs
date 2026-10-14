import { defineConfig } from 'vitepress'
import { phases, lessons, lessonLink, pad } from './curriculum.mjs'
import { courseMarkdown } from './markdown.mjs'

function sidebar() {
  return [
    {
      text: 'Start here',
      items: [
        { text: 'How this course works', link: '/' },
        { text: 'Your progress', link: '/progress' },
        { text: 'Concept index', link: '/concepts' },
      ],
    },
    ...phases.map((phase) => ({
      text: phase.title,
      collapsed: false,
      items: lessons
        .filter((l) => l.phase === phase.id)
        .map((l) => ({
          text: `<span class="lesson-num">${pad(l.n)}</span> ${l.title.replace(/</g, '&lt;')}${l.optional ? ' <span class="optional-tag">optional</span>' : ''}`,
          link: lessonLink(l),
        })),
    })),
  ]
}

export default defineConfig({
  srcDir: '.',
  title: 'Build a Chat App',
  description: 'Learn frontend development by building a Discord-style chat app, first with HTML/CSS/JS, then with React.',
  // Set SITE_BASE=/repo-name/ when deploying to GitHub Pages under a sub-path.
  base: process.env.SITE_BASE || '/',
  appearance: 'dark',
  lastUpdated: false,
  cleanUrls: false,
  srcExclude: ['README.md'],
  head: [['link', { rel: 'icon', href: `${process.env.SITE_BASE || '/'}favicon.svg` }]],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Lessons', link: '/lessons/00-toolkit' },
      { text: 'Progress', link: '/progress' },
      { text: 'Concepts', link: '/concepts' },
    ],
    sidebar: sidebar(),
    outline: { level: [2, 3], label: 'In this lesson' },
    docFooter: { prev: 'Previous lesson', next: 'Next lesson' },
    search: { provider: 'local' },
  },
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    config: courseMarkdown,
  },
  vite: {
    server: { fs: { allow: ['..'] } },
  },
})
