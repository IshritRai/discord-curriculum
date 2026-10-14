// Feature checks shared by the vanilla and React snapshots.
//
// Each check says from which lesson it applies, separately for the two apps:
//   vanilla: 19   → applies to vanilla snapshots of Lesson 19 and later
//   react: 33     → applies to React snapshots of Lesson 33 and later
//   until: { vanilla: 1 } → stops applying after that lesson
// Because the React app keeps the same class names and ids, the same checks
// prove that the React rebuild behaves like the vanilla app.

const css = (page, selector, property) =>
  page.$eval(selector, (el, prop) => getComputedStyle(el).getPropertyValue(prop), property)
const count = (page, selector) => page.$$eval(selector, (els) => els.length)
const text = (page, selector) => page.$eval(selector, (el) => el.textContent.trim())
const visibleCount = (page, selector) => page.$$eval(selector, (els) => els.filter((el) => el.getClientRects().length > 0).length)

async function sendMessage(page, message) {
  await page.click('#composer-input')
  await page.keyboard.type(message)
  await page.keyboard.press('Enter')
}

export const checks = [
  {
    id: 'hello-page',
    vanilla: 0,
    until: { vanilla: 1 },
    async run(page, { assert }) {
      assert(/hello/i.test(await text(page, 'h1')), 'expected an <h1> that says hello')
      assert((await page.title()).length > 0, 'expected a <title>')
    },
  },
  {
    id: 'plain-document',
    vanilla: 2,
    until: { vanilla: 2 },
    async run(page, { assert }) {
      assert((await count(page, 'ul > li')) >= 10, 'expected lists of servers, channels and members')
      assert((await count(page, 'img')) >= 1, 'expected the logo image')
      assert((await count(page, 'a[href]')) >= 1, 'expected a link')
    },
  },
  {
    id: 'landmarks',
    vanilla: 3,
    react: 32,
    async run(page, { assert }) {
      for (const selector of ['nav.server-rail', 'aside.channel-sidebar', 'main.chat', 'aside.member-list', 'form.composer', '.user-panel']) {
        assert((await count(page, selector)) === 1, `expected exactly one ${selector}`)
      }
    },
  },
  {
    id: 'dark-theme',
    vanilla: 4,
    react: 32,
    async run(page, { assert }) {
      assert((await css(page, 'body', 'background-color')) === 'rgb(30, 31, 34)', 'body should use the darkest theme color')
      assert((await css(page, '.chat', 'background-color')) === 'rgb(49, 51, 56)', 'the chat area should use --bg-primary')
    },
  },
  {
    id: 'round-server-icons',
    vanilla: 5,
    react: 32,
    async run(page, { assert }) {
      const box = await page.$eval('.server-button', (el) => el.getBoundingClientRect().toJSON())
      assert(Math.round(box.width) === 48 && Math.round(box.height) === 48, `server icons should be 48×48, got ${box.width}×${box.height}`)
      assert((await css(page, '.server-button', 'border-radius')) === '50%', 'server icons should be circles')
    },
  },
  {
    id: 'flex-rows-and-icons',
    vanilla: 6,
    react: 32,
    async run(page, { assert }) {
      assert((await css(page, '.server-list', 'flex-direction')) === 'column', 'the server list should be a flex column')
      assert((await css(page, '.channel-button', 'display')) === 'flex', 'channel buttons should be flex rows')
      const iconBox = await page.$eval('.channel-button .icon', (el) => el.getBoundingClientRect().toJSON())
      assert(iconBox.width === 20, 'channel icons should be 20px wide')
      assert((await count(page, 'svg.icon use')) > 5, 'expected icons from the sprite')
    },
  },
  {
    id: 'app-grid',
    vanilla: 7,
    react: 32,
    async run(page, { assert }) {
      assert((await css(page, '.app', 'display')) === 'grid', '.app should be a grid')
      const app = await page.$eval('.app', (el) => el.getBoundingClientRect().toJSON())
      assert(app.height === 800, `.app should fill the window height, got ${app.height}`)
      const chat = await page.$eval('.chat', (el) => el.getBoundingClientRect().toJSON())
      assert(Math.round(chat.left) === 312, `the chat should start at 72 + 240 = 312px, got ${chat.left}`)
      const members = await page.$eval('.member-list', (el) => el.getBoundingClientRect().toJSON())
      assert(Math.round(members.width) === 240, 'the member list should be 240px wide')
    },
  },
  {
    id: 'hover-and-selected',
    vanilla: 8,
    react: 32,
    async run(page, { assert }) {
      await page.hover('#server-list .server-button')
      await page.waitForTimeout(400)
      assert((await css(page, '#server-list .server-button', 'border-radius')) === '16px', 'hovered server icons should become rounded squares')
      const selectedBg = await css(page, '.channel-item.is-selected .channel-button', 'background-color')
      assert(selectedBg !== 'rgba(0, 0, 0, 0)', 'the selected channel should have a background')
    },
  },
  {
    id: 'static-mention-badges',
    vanilla: 9,
    until: { vanilla: 13 },
    async run(page, { assert }) {
      assert((await count(page, '.mention-badge')) >= 1, 'expected a mention badge on a server')
      assert((await css(page, '.mention-badge', 'position')) === 'absolute', 'mention badges should be positioned absolutely')
    },
  },
  {
    id: 'status-dots',
    vanilla: 9,
    react: 33,
    async run(page, { assert }) {
      assert((await css(page, '.member .status-dot', 'position')) === 'absolute', 'status dots should be positioned absolutely')
      assert((await count(page, '.user-panel .status-online')) === 1, 'your avatar should show the online status')
    },
  },
  {
    id: 'independent-scrolling',
    vanilla: 10,
    react: 33,
    async run(page, { assert }) {
      const pageScroll = await page.evaluate(() => document.scrollingElement.scrollHeight - window.innerHeight)
      assert(pageScroll <= 0, 'the page itself should not scroll; each column scrolls on its own')
      assert((await css(page, '.message-list', 'overflow-y')) === 'auto', 'the message list should scroll')
      const scrollable = await page.$eval('.message-list', (el) => el.scrollHeight > el.clientHeight)
      assert(scrollable, 'the message list should have more content than fits')
    },
  },
  {
    id: 'responsive-drawer',
    vanilla: 11,
    react: 32,
    async run(page, { assert }) {
      await page.setViewportSize({ width: 700, height: 800 })
      await page.waitForTimeout(400)
      const drawer = await page.$eval('.nav-drawer', (el) => el.getBoundingClientRect().toJSON())
      assert(drawer.right <= 1, 'on narrow screens the channel drawer should be off-screen')
      assert((await css(page, '.menu-button', 'display')) !== 'none', 'the menu button should be visible on narrow screens')
    },
  },
  {
    id: 'console-exploration',
    vanilla: 12,
    until: { vanilla: 12 },
    async run(page, { assert, url, newPage }) {
      const logs = []
      const second = await newPage()
      second.on('console', (msg) => logs.push(msg.text()))
      await second.goto(url, { waitUntil: 'networkidle' })
      assert(logs.some((l) => /Frontend Friends/.test(l)), 'expected the server names to be logged in the console')
    },
  },
  {
    id: 'user-panel-from-js',
    vanilla: 13,
    react: 33,
    async run(page, { assert }) {
      assert((await text(page, '#user-panel-name')) === 'Sam', 'the user panel should show the current user from the data')
    },
  },
  {
    id: 'lists-from-data',
    vanilla: 14,
    react: 33,
    async run(page, { assert }) {
      assert((await count(page, '#server-list .server-item')) === 5, 'expected 5 servers rendered from data')
      assert((await count(page, '.channel-item')) >= 6, 'expected channels rendered from data')
      assert((await count(page, '.member')) >= 10, 'expected members rendered from data')
    },
  },
  {
    id: 'select-server',
    vanilla: 15,
    react: 34,
    async run(page, { assert }) {
      await page.click('#server-list .server-item:nth-child(2) .server-button')
      const active = await page.$$eval('#server-list .server-item', (items) => items.findIndex((i) => i.classList.contains('is-active')))
      assert(active === 1, 'clicking a server should make it the active one')
    },
  },
  {
    id: 'collapse-category',
    vanilla: 15,
    react: 34,
    async run(page, { assert }) {
      const before = await visibleCount(page, '.channel-item')
      await page.click('.category:last-of-type .category-toggle')
      await page.waitForTimeout(100)
      assert((await count(page, '.category.is-collapsed')) === 1, 'clicking a category should collapse it')
      assert((await visibleCount(page, '.channel-item')) < before, 'a collapsed category should hide its channels')
      await page.click('.category.is-collapsed .category-toggle')
      assert((await count(page, '.category.is-collapsed')) === 0, 'clicking again should expand it')
    },
  },
  {
    id: 'toggle-member-list',
    vanilla: 15,
    react: 34,
    async run(page, { assert }) {
      await page.click('#members-button')
      assert(!(await page.isVisible('#member-list')), 'the members button should hide the member list')
      await page.click('#members-button')
      assert(await page.isVisible('#member-list'), 'clicking again should show it')
    },
  },
  {
    id: 'mobile-drawer',
    vanilla: 15,
    react: 34,
    async run(page, { assert }) {
      await page.setViewportSize({ width: 700, height: 800 })
      await page.click('#menu-button')
      await page.waitForTimeout(400)
      const open = await page.$eval('.nav-drawer', (el) => el.getBoundingClientRect().left)
      assert(open >= 0, 'the menu button should slide the drawer in')
      await page.mouse.click(650, 400)
      await page.waitForTimeout(400)
      const closed = await page.$eval('.nav-drawer', (el) => el.getBoundingClientRect().right)
      assert(closed <= 1, 'clicking the backdrop should close the drawer')
    },
  },
  {
    id: 'brand-config',
    vanilla: 17,
    react: 33,
    async run(page, { assert }) {
      assert((await page.title()) === 'Hubbub', 'the page title should come from brand.js')
      const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--brand-accent').trim())
      assert(accent === '#0f7b6c', `--brand-accent should come from brand.js, got "${accent}"`)
    },
  },
  {
    id: 'chat-header-follows-selection',
    vanilla: 16,
    react: 34,
    async run(page, { assert }) {
      await page.click('.channel-item:nth-child(2) .channel-button')
      const name = await text(page, '.channel-item.is-selected .channel-name')
      assert((await text(page, '#chat-title')) === name, 'the chat header should show the selected channel')
    },
  },
  {
    id: 'selection-survives-reload',
    vanilla: 16,
    react: 36,
    async run(page, { assert }) {
      await page.click('#server-list .server-item:nth-child(3) .server-button')
      await page.reload({ waitUntil: 'networkidle' })
      const active = await page.$$eval('#server-list .server-item', (items) => items.findIndex((i) => i.classList.contains('is-active')))
      assert(active === 2, 'the selected server should be remembered after a reload')
    },
  },
  {
    id: 'data-from-json',
    vanilla: 18,
    async run(page, { assert, url, newPage }) {
      const second = await newPage()
      const requests = []
      second.on('request', (r) => requests.push(r.url()))
      await second.goto(url, { waitUntil: 'networkidle' })
      assert(requests.some((r) => r.endsWith('data/servers.json')), 'expected data/servers.json to be fetched')
      assert(requests.some((r) => r.endsWith('data/messages.json')), 'expected data/messages.json to be fetched')
    },
  },
  {
    id: 'unread-and-mentions',
    vanilla: 19,
    react: 34,
    async run(page, { assert }) {
      assert((await count(page, '#server-list .server-item.is-unread')) >= 2, 'servers with unread channels should show the unread pill')
      const badge = await text(page, '#server-list .server-item:nth-child(4) .mention-badge')
      assert(badge === '2', `Study Group should show 2 mentions, got ${badge}`)
      await page.click('#server-list .server-item:nth-child(4) .server-button')
      await page.click('.channel-item.is-unread .channel-button')
      assert((await count(page, '#server-list .server-item:nth-child(4) .mention-badge')) === 0, 'reading the channel should clear the mention badge')
      assert((await count(page, '.channel-item svg use[href$="#speaker"]')) >= 1, 'voice channels should have a speaker icon')
    },
  },
  {
    id: 'message-feed',
    vanilla: 20,
    react: 33,
    async run(page, { assert }) {
      assert((await count(page, '.date-divider')) >= 2, 'expected date dividers')
      assert((await count(page, '.message:not(.is-group-start)')) >= 3, 'consecutive messages by the same author should be grouped')
      assert((await count(page, '.message-time')) >= 3, 'expected timestamps')
      const atBottom = await page.$eval('.message-list', (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 5)
      assert(atBottom, 'the feed should start scrolled to the newest message')
    },
  },
  {
    id: 'markdown',
    vanilla: 21,
    react: 33,
    async run(page, { assert }) {
      for (const selector of ['.message-content strong', '.message-content em', '.message-content code', '.message-content pre', '.message-content a[target="_blank"]', '.message-content .mention']) {
        assert((await count(page, selector)) >= 1, `expected markdown to produce ${selector}`)
      }
    },
  },
  {
    id: 'send-message',
    vanilla: 22,
    react: 34,
    async run(page, { assert }) {
      const before = await count(page, '.message')
      await page.click('#composer-input')
      await page.keyboard.type('first line')
      await page.keyboard.press('Shift+Enter')
      await page.keyboard.type('**second** line')
      const value = await page.inputValue('#composer-input')
      assert(value === 'first line\n**second** line', 'Shift+Enter should add a new line')
      await page.keyboard.press('Enter')
      assert((await count(page, '.message')) === before + 1, 'Enter should send the message')
      assert((await page.inputValue('#composer-input')) === '', 'the composer should be cleared after sending')
      assert((await text(page, '.message:last-child .message-content strong')) === 'second', 'sent messages should be formatted')
    },
  },
  {
    id: 'html-is-escaped',
    vanilla: 22,
    react: 34,
    async run(page, { assert }) {
      await sendMessage(page, '<img src=x onerror=alert(1)> <b>not bold</b>')
      assert((await count(page, '.message:last-child .message-content img')) === 0, 'HTML in messages must not become elements')
      assert((await text(page, '.message:last-child .message-content')).includes('<b>not bold</b>'), 'HTML in messages should show as text')
    },
  },
  {
    id: 'edit-and-delete',
    vanilla: 23,
    react: 35,
    async run(page, { assert }) {
      await sendMessage(page, 'typo here')
      await page.hover('.message:last-child')
      await page.click('.message:last-child [data-action="edit"]')
      await page.waitForSelector('.edit-input')
      await page.fill('.edit-input', 'fixed it')
      await page.press('.edit-input', 'Enter')
      assert((await text(page, '.message:last-child .message-content')).startsWith('fixed it'), 'editing should change the text')
      assert((await count(page, '.message:last-child .edited-label')) === 1, 'edited messages should say (edited)')
      const before = await count(page, '.message')
      await page.hover('.message:last-child')
      await page.click('.message:last-child [data-action="delete"]', { modifiers: ['Shift'] })
      assert((await count(page, '.message')) === before - 1, 'Shift+click on delete should delete the message')
      const othersHaveEdit = await count(page, '.message:not(:last-child) [data-action="edit"]')
      const myMessages = await page.$$eval('.message [data-action="edit"]', (els) => els.length)
      assert(myMessages <= othersHaveEdit + 1, 'only your own messages can be edited')
    },
  },
  {
    id: 'reactions',
    vanilla: 24,
    react: 38,
    async run(page, { assert }) {
      const reaction = '.message .reaction:not(.is-mine)'
      const messageId = await page.$eval(reaction, (el) => el.closest('.message').dataset.messageId)
      const sel = `.message[data-message-id="${messageId}"]`
      const before = Number(await text(page, `${sel} .reaction:not(.is-mine) .reaction-count`))
      await page.click(`${sel} .reaction:not(.is-mine)`)
      const mine = `${sel} .reaction.is-mine .reaction-count`
      assert(Number(await text(page, mine)) === before + 1, 'clicking a reaction should add yours')
      await page.hover(sel)
      await page.click(`${sel} [data-action="react"]`)
      assert(await page.isVisible('#emoji-picker'), 'the add-reaction button should open the emoji picker')
      await page.fill('#emoji-search', 'rocket')
      assert((await count(page, '.emoji-option')) === 1, 'searching should filter the emoji')
      await page.click('.emoji-option')
      assert(!(await page.isVisible('#emoji-picker')), 'choosing an emoji should close the picker')
      assert((await count(page, `${sel} .reaction[data-emoji="🚀"].is-mine`)) === 1, 'the chosen emoji should appear as your reaction')
    },
  },
  {
    id: 'member-groups',
    vanilla: 25,
    react: 38,
    async run(page, { assert }) {
      const titles = await page.$$eval('.member-group-title', (els) => els.map((e) => e.textContent))
      assert(titles.some((t) => /^Admin — 1$/.test(t)), `expected an "Admin — 1" group, got ${titles.join(', ')}`)
      assert(titles.some((t) => /^Online — \d+$/.test(t)), 'expected an Online group')
      assert(titles.some((t) => /^Offline — \d+$/.test(t)), 'expected an Offline group')
      assert((await count(page, '.member.is-offline')) >= 1, 'offline members should be marked')
    },
  },
  {
    id: 'modals',
    vanilla: 26,
    react: 39,
    async run(page, { assert }) {
      await page.click('.add-server-button')
      assert(await page.isVisible('#create-server-dialog'), 'the + button should open the create-server dialog')
      await page.fill('#create-server-dialog input[name="serverName"]', 'My Test Server')
      await page.click('#create-server-dialog button[type="submit"]')
      assert(!(await page.isVisible('#create-server-dialog')), 'creating should close the dialog')
      assert((await count(page, '#server-list .server-item')) === 6, 'a new server should appear')
      assert((await text(page, '#server-name')) === 'My Test Server', 'the new server should be selected')
      await page.click('.member')
      assert(await page.isVisible('#profile-dialog'), 'clicking a member should open their profile')
      await page.keyboard.press('Escape')
      assert(!(await page.isVisible('#profile-dialog')), 'Escape should close the profile')
    },
  },
  {
    id: 'context-menu-and-tooltip',
    vanilla: 27,
    react: 39,
    async run(page, { assert }) {
      await page.click('.message:last-child .message-content', { button: 'right' })
      assert(await page.isVisible('#context-menu'), 'right-clicking a message should open a context menu')
      assert((await count(page, '#context-menu .menu-item')) >= 2, 'the context menu should have items')
      await page.keyboard.press('Escape')
      assert(!(await page.isVisible('#context-menu')), 'Escape should close the context menu')
      await page.hover('#server-list .server-item:nth-child(2) .server-button')
      await page.waitForTimeout(100)
      assert(await page.isVisible('#tooltip'), 'hovering a server should show a tooltip')
      assert((await text(page, '#tooltip')) === 'Pixel Art Club', 'the tooltip should show the server name')
    },
  },
  {
    id: 'fake-activity',
    vanilla: 28,
    react: 36,
    async run(page, { assert }) {
      await page.clock.install()
      await page.reload({ waitUntil: 'networkidle' })
      // Count every message in every channel, using the saved state.
      const totalMessages = () =>
        page.evaluate(() => {
          const saved = JSON.parse(localStorage.getItem('chat-clone-state-v1') || '{"messages":{}}')
          return Object.values(saved.messages).reduce((sum, list) => sum + list.length, 0)
        })
      await page.click('#server-list .server-item:nth-child(1) .server-button') // makes sure the state is saved once
      const before = await totalMessages()
      await page.clock.runFor(70000)
      const after = await totalMessages()
      assert(after > before, `fake messages should arrive over time (before ${before}, after ${after})`)
    },
  },
  {
    id: 'typing-indicator',
    vanilla: 28,
    react: 36,
    async run(page, { assert }) {
      await page.clock.install()
      await page.reload({ waitUntil: 'networkidle' })
      // Sending a message makes someone reply (most of the time): try a few times.
      let sawTyping = false
      for (let attempt = 0; attempt < 8 && !sawTyping; attempt++) {
        await sendMessage(page, `hello ${attempt}`)
        for (let i = 0; i < 30 && !sawTyping; i++) {
          await page.clock.runFor(100)
          sawTyping = await page.evaluate(() => document.querySelector('#typing-indicator').textContent.includes('is typing'))
        }
        await page.clock.runFor(6000)
      }
      assert(sawTyping, 'someone should appear to be typing after you send a message')
    },
  },
  {
    id: 'voice',
    vanilla: 29,
    react: 40,
    async run(page, { assert }) {
      assert(!(await page.isVisible('#voice-panel')), 'the voice panel should start hidden')
      await page.click('.channel-item:has(use[href$="#speaker"]) .channel-button')
      assert(await page.isVisible('#voice-panel'), 'clicking a voice channel should connect you')
      assert((await page.$$eval('.voice-user-name', (els) => els.map((e) => e.textContent))).includes('Sam'), 'you should appear in the voice channel')
      await page.click('#mute-button')
      assert((await page.getAttribute('#mute-button', 'aria-pressed')) === 'true', 'mute should toggle on')
      await page.click('#deafen-button')
      assert((await page.getAttribute('#deafen-button', 'aria-pressed')) === 'true', 'deafen should toggle on')
      assert((await page.getAttribute('#mute-button', 'aria-pressed')) === 'true', 'deafen should also mute')
      await page.click('#deafen-button')
      assert((await page.getAttribute('#mute-button', 'aria-pressed')) === 'false', 'undeafen should also unmute')
      let speaking = false
      for (let i = 0; i < 50 && !speaking; i++) {
        await page.waitForTimeout(100)
        speaking = (await count(page, '.voice-user.is-speaking')) >= 1
      }
      assert(speaking, 'someone should be speaking')
      await page.click('#disconnect-button')
      assert(!(await page.isVisible('#voice-panel')), 'disconnect should hide the voice panel')
    },
  },
  {
    id: 'mic-speaking-light',
    vanilla: 30,
    react: 40,
    async run(page, { assert }) {
      await page.click('.channel-item:has(use[href$="#speaker"]) .channel-button')
      await page.check('#mic-toggle')
      let lit = false
      for (let i = 0; i < 40 && !lit; i++) {
        await page.waitForTimeout(100)
        lit = (await count(page, '.user-panel-profile.is-speaking')) === 1
      }
      assert(lit, 'your avatar should light up from the (fake) microphone')
      await page.click('#disconnect-button')
      assert(!(await page.isChecked('#mic-toggle')), 'disconnecting should turn the mic off')
    },
  },
]

// What to show in each lesson's goal screenshot (default: the page as it loads).
export const goals = {
  8: { setup: (page) => page.hover('#server-list .server-item:nth-child(2) .server-button') },
  11: {
    extra: [
      { name: 'narrow', viewport: { width: 700, height: 800 } },
      { name: 'drawer', viewport: { width: 700, height: 800 }, setup: (page) => page.evaluate(() => document.querySelector('.app').classList.add('is-nav-open')) },
    ],
  },
  15: {
    extra: [{ name: 'drawer', viewport: { width: 700, height: 800 }, setup: (page) => page.click('#menu-button') }],
  },
  22: {
    setup: async (page) => {
      await sendMessage(page, 'Look, I can send **formatted** messages now! `Enter` sends.')
      await page.click('#composer-input')
      await page.keyboard.type('Shift+Enter makes')
      await page.keyboard.press('Shift+Enter')
      await page.keyboard.type('a new line')
    },
  },
  23: {
    setup: async (page) => {
      await page.hover('.message[data-message-id="m13"]')
      await page.click('.message[data-message-id="m13"] [data-action="edit"]')
    },
  },
  24: {
    setup: async (page) => {
      await page.hover('.message[data-message-id="m14"]')
      await page.click('.message[data-message-id="m14"] [data-action="react"]')
    },
  },
  26: { setup: (page) => page.click('.add-server-button') },
  27: { setup: (page) => page.click('.message[data-message-id="m13"] .message-content', { button: 'right' }) },
  28: {
    setup: async (page) => {
      await page.clock.install()
      await page.reload({ waitUntil: 'networkidle' })
      for (let attempt = 0; attempt < 10; attempt++) {
        await sendMessage(page, attempt === 0 ? 'Is anyone around? 👀' : 'hello?')
        for (let i = 0; i < 30; i++) {
          await page.clock.runFor(100)
          if (await page.evaluate(() => document.querySelector('#typing-indicator').textContent.includes('is typing'))) return
        }
        await page.clock.runFor(6000)
      }
    },
  },
  29: {
    setup: async (page) => {
      await page.click('.channel-item:has(use[href$="#speaker"]) .channel-button')
      await page.waitForTimeout(1200)
    },
  },
  30: {
    setup: async (page) => {
      await page.click('.channel-item:has(use[href$="#speaker"]) .channel-button')
      await page.check('#mic-toggle')
      await page.waitForTimeout(1500)
    },
  },
}
