// Lesson 16: one `state` object drives the whole screen.
//
//   click → action changes state → update() saves and re-renders → screen
//
// The render functions never decide WHAT is selected; they only read `state`.

const currentUser = users.find((user) => user.id === currentUserId);
const STORAGE_KEY = 'chat-clone-state-v1';

// ============================================================
//  State
// ============================================================

const state = {
  // Data
  users: users,
  servers: servers,
  messages: messages, // channel id → array of messages

  // What you're looking at
  activeServerId: servers[0].id,
  activeChannelByServer: {}, // server id → channel id
  collapsedCategoryIds: [],
  showMembers: true,
};

function getUser(userId) {
  return state.users.find((user) => user.id === userId);
}

function getActiveServer() {
  return state.servers.find((server) => server.id === state.activeServerId);
}

function findChannel(server, channelId) {
  for (const category of server.categories) {
    for (const channel of category.channels) {
      if (channel.id === channelId) {
        return channel;
      }
    }
  }
  return null;
}

// The selected channel of the active server (the first channel if none was picked yet)
function getActiveChannel() {
  const server = getActiveServer();
  const channelId = state.activeChannelByServer[server.id];
  return findChannel(server, channelId) ?? server.categories[0].channels[0];
}

// ============================================================
//  Saving and loading (localStorage)
// ============================================================

function save() {
  const saved = {
    users: state.users,
    servers: state.servers,
    messages: state.messages,
    activeServerId: state.activeServerId,
    activeChannelByServer: state.activeChannelByServer,
    collapsedCategoryIds: state.collapsedCategoryIds,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function loadSaved() {
  const text = localStorage.getItem(STORAGE_KEY);
  if (text === null) {
    return null; // nothing saved yet
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Saved state was corrupted, starting fresh.', error);
    return null;
  }
}

// ============================================================
//  Rendering: state → screen
// ============================================================

// ---------- Server rail ----------

const serverList = document.querySelector('#server-list');

function createServerItem(server) {
  const item = el('li', 'server-item');
  item.dataset.serverId = server.id;
  if (server.id === state.activeServerId) {
    item.classList.add('is-active');
  }

  const button = el('button', 'server-button', server.icon);
  button.type = 'button';
  button.setAttribute('aria-label', server.name);
  if (server.iconIsEmoji) {
    button.classList.add('is-emoji');
  }

  item.append(button);
  return item;
}

function renderServers() {
  serverList.replaceChildren();
  for (const server of state.servers) {
    serverList.append(createServerItem(server));
  }
}

// ---------- Channel list ----------

const serverName = document.querySelector('#server-name');
const channelList = document.querySelector('#channel-list');

function createChannelItem(channel, isSelected) {
  const item = el('li', 'channel-item');
  item.dataset.channelId = channel.id;
  if (isSelected) {
    item.classList.add('is-selected');
  }

  const button = el('button', 'channel-button');
  button.type = 'button';
  const iconName = channel.type === 'voice' ? 'speaker' : 'hash';
  button.append(icon(iconName), el('span', 'channel-name', channel.name));

  item.append(button);
  return item;
}

function createCategory(category, selectedChannelId) {
  const isCollapsed = state.collapsedCategoryIds.includes(category.id);
  const section = el('section', 'category');
  section.dataset.categoryId = category.id;
  if (isCollapsed) {
    section.classList.add('is-collapsed');
  }

  const heading = el('h3');
  const toggle = el('button', 'category-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', String(!isCollapsed));
  toggle.append(icon('chevron-down'), category.name);
  heading.append(toggle);

  const list = el('ul');
  for (const channel of category.channels) {
    list.append(createChannelItem(channel, channel.id === selectedChannelId));
  }

  section.append(heading, list);
  return section;
}

function renderChannels() {
  const server = getActiveServer();
  const selectedChannel = getActiveChannel();
  serverName.textContent = server.name;
  channelList.replaceChildren();
  for (const category of server.categories) {
    channelList.append(createCategory(category, selectedChannel.id));
  }
}

// ---------- Chat: header and messages ----------

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const composerInput = document.querySelector('#composer-input');
const messageList = document.querySelector('#message-list');

function createMessage(message) {
  const author = getUser(message.authorId);
  const item = el('li', 'message is-group-start');
  item.dataset.messageId = message.id;

  const gutter = el('div', 'message-gutter');
  gutter.append(avatar(author));

  const body = el('div', 'message-body');
  const header = el('h3', 'message-header');
  header.append(el('button', 'message-author', author.displayName));
  const time = el('time', 'message-time', message.timestamp);
  time.dateTime = message.timestamp;
  header.append(time);
  body.append(header, el('div', 'message-content', message.content));

  item.append(gutter, body);
  return item;
}

function renderChat() {
  const channel = getActiveChannel();
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;

  messageList.replaceChildren();
  const channelMessages = state.messages[channel.id] ?? [];
  for (const message of channelMessages) {
    messageList.append(createMessage(message));
  }
}

// ---------- Member list ----------

const memberList = document.querySelector('#member-list');
const membersButton = document.querySelector('#members-button');

function createMember(user) {
  const button = el('button', 'member');
  button.type = 'button';
  button.dataset.userId = user.id;
  if (user.status === 'offline') {
    button.classList.add('is-offline');
  }

  const names = el('span', 'member-names');
  names.append(el('span', 'member-name', user.displayName));
  if (user.customStatus) {
    names.append(el('span', 'member-status-text', user.customStatus));
  }

  button.append(avatar(user, true), names);
  return button;
}

function renderMembers() {
  memberList.hidden = !state.showMembers;
  membersButton.setAttribute('aria-pressed', String(state.showMembers));

  const server = getActiveServer();
  const memberUsers = server.members.map((member) => getUser(member.userId));
  const onlineCount = memberUsers.filter((user) => user.status !== 'offline').length;

  memberList.replaceChildren();
  memberList.append(el('h3', 'member-group-title', `Members — ${memberUsers.length} (${onlineCount} online)`));
  for (const user of memberUsers) {
    memberList.append(createMember(user));
  }
}

// ---------- User panel ----------

function renderUserPanel() {
  const newAvatar = avatar(currentUser, true);
  newAvatar.id = 'user-panel-avatar';
  document.querySelector('#user-panel-avatar').replaceWith(newAvatar);
  document.querySelector('#user-panel-name').textContent = currentUser.displayName;
  document.querySelector('#user-panel-tag').textContent = currentUser.customStatus;
}

// ---------- Everything ----------

function render() {
  renderServers();
  renderChannels();
  renderChat();
  renderMembers();
  renderUserPanel();
}

// Call this after every change to the state.
function update() {
  save();
  render();
}

// ============================================================
//  Actions: the only places that change the state
// ============================================================

function selectServer(serverId) {
  state.activeServerId = serverId;
  update();
}

function selectChannel(channelId) {
  const channel = findChannel(getActiveServer(), channelId);
  if (channel.type === 'voice') {
    return; // joining voice channels comes in Lesson 29
  }
  state.activeChannelByServer[state.activeServerId] = channelId;
  update();
}

function toggleCategory(categoryId) {
  if (state.collapsedCategoryIds.includes(categoryId)) {
    state.collapsedCategoryIds = state.collapsedCategoryIds.filter((id) => id !== categoryId);
  } else {
    state.collapsedCategoryIds.push(categoryId);
  }
  update();
}

function toggleMembers() {
  state.showMembers = !state.showMembers;
  update();
}

// ============================================================
//  Events: turn clicks into actions
// ============================================================

serverList.addEventListener('click', (event) => {
  const item = event.target.closest('.server-item');
  if (item !== null) {
    selectServer(item.dataset.serverId);
  }
});

channelList.addEventListener('click', (event) => {
  const toggle = event.target.closest('.category-toggle');
  if (toggle !== null) {
    toggleCategory(toggle.closest('.category').dataset.categoryId);
    return;
  }
  const item = event.target.closest('.channel-item');
  if (item !== null) {
    selectChannel(item.dataset.channelId);
    closeNav();
  }
});

membersButton.addEventListener('click', toggleMembers);

// ---------- The drawer on small screens (only classes, no state needed) ----------

const app = document.querySelector('.app');
const menuButton = document.querySelector('#menu-button');
const backdrop = document.querySelector('#drawer-backdrop');

function openNav() {
  app.classList.add('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  app.classList.remove('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', openNav);
backdrop.addEventListener('click', closeNav);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNav();
  }
});

// ============================================================
//  Start
// ============================================================

// Use what was saved last time, if anything
const saved = loadSaved();
if (saved !== null) {
  state.users = saved.users;
  state.servers = saved.servers;
  state.messages = saved.messages;
  state.activeServerId = saved.activeServerId;
  state.activeChannelByServer = saved.activeChannelByServer;
  state.collapsedCategoryIds = saved.collapsedCategoryIds;
}

render();
