// Lesson 14: building the server rail, channel list and member list from data.

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

// ---------- Draw everything once ----------

const firstServer = servers[0];
const firstChannel = firstServer.categories[0].channels[0];

renderServers(firstServer);
renderChannels(firstServer, firstChannel.id);
renderMembers(firstServer);
renderUserPanel();
