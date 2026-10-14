// Lessons 14–15: building the lists from data, and reacting to clicks.

const currentUser = users.find((user) => user.id === currentUserId);

function getUser(userId) {
  return users.find((user) => user.id === userId);
}

// ---------- Server rail ----------

const serverList = document.querySelector('#server-list');

function createServerItem(server, isActive) {
  const item = el('li', 'server-item');
  item.dataset.serverId = server.id;
  if (isActive) {
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

function renderServers(activeServer) {
  serverList.replaceChildren(); // remove the old items
  for (const server of servers) {
    serverList.append(createServerItem(server, server.id === activeServer.id));
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
  const section = el('section', 'category');
  section.dataset.categoryId = category.id;

  const heading = el('h3');
  const toggle = el('button', 'category-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.append(icon('chevron-down'), category.name);
  heading.append(toggle);

  const list = el('ul');
  for (const channel of category.channels) {
    list.append(createChannelItem(channel, channel.id === selectedChannelId));
  }

  section.append(heading, list);
  return section;
}

function renderChannels(server, selectedChannelId) {
  serverName.textContent = server.name;
  channelList.replaceChildren();
  for (const category of server.categories) {
    channelList.append(createCategory(category, selectedChannelId));
  }
}

// ---------- Member list ----------

const memberList = document.querySelector('#member-list');

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

function renderMembers(server) {
  // server.members only has user ids: look up each user
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

// ---------- Chat header ----------

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const composerInput = document.querySelector('#composer-input');

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

function renderChatHeader(channel) {
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;
}

// ---------- What's selected right now ----------

let activeServer = servers[0];
let selectedChannel = activeServer.categories[0].channels[0];

function showServer(server) {
  activeServer = server;
  selectedChannel = server.categories[0].channels[0];
  renderServers(activeServer);
  renderChannels(activeServer, selectedChannel.id);
  renderMembers(activeServer);
  renderChatHeader(selectedChannel);
}

// ---------- Events ----------

// One listener on the whole list handles clicks on every server (event delegation)
serverList.addEventListener('click', (event) => {
  const item = event.target.closest('.server-item');
  if (item === null) {
    return; // the click wasn't on a server
  }
  const server = servers.find((s) => s.id === item.dataset.serverId);
  showServer(server);
});

channelList.addEventListener('click', (event) => {
  // A click on a category header collapses or expands it
  const toggle = event.target.closest('.category-toggle');
  if (toggle !== null) {
    const category = toggle.closest('.category');
    category.classList.toggle('is-collapsed');
    const isExpanded = !category.classList.contains('is-collapsed');
    toggle.setAttribute('aria-expanded', String(isExpanded));
    return;
  }

  // A click on a channel selects it
  const item = event.target.closest('.channel-item');
  if (item === null) {
    return;
  }
  const channel = findChannel(activeServer, item.dataset.channelId);
  if (channel.type === 'voice') {
    return; // joining voice channels comes in Lesson 29
  }
  const previous = channelList.querySelector('.channel-item.is-selected');
  if (previous !== null) {
    previous.classList.remove('is-selected');
  }
  item.classList.add('is-selected');
  selectedChannel = channel;
  renderChatHeader(channel);
  closeNav();
});

// The member list button shows and hides the member list
const membersButton = document.querySelector('#members-button');
membersButton.addEventListener('click', () => {
  memberList.hidden = !memberList.hidden;
  membersButton.setAttribute('aria-pressed', String(!memberList.hidden));
});

// On small screens: the menu button opens the drawer, the backdrop closes it
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

// The Escape key closes the drawer too
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNav();
  }
});

// ---------- Draw everything once ----------

showServer(servers[0]);
renderUserPanel();
