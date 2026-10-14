// The channel sidebar: server name, categories, text and voice channels.

import { state, getActiveServer, getActiveChannel, getUser } from './state.js';
import { selectChannel, toggleCategory } from './actions.js';
import { el, icon, avatar } from './dom.js';
import { closeNav } from './layout.js';

const serverName = document.querySelector('#server-name');
const channelList = document.querySelector('#channel-list');

function createVoiceUser(userId) {
  const user = getUser(userId);
  const item = el('li', 'voice-user');
  item.dataset.userId = userId;
  const userAvatar = avatar(user);
  userAvatar.classList.add('tiny');
  item.append(userAvatar, el('span', 'voice-user-name', user.displayName));
  return item;
}

function createChannelItem(channel, isSelected) {
  const item = el('li', 'channel-item');
  item.dataset.channelId = channel.id;
  if (isSelected) {
    item.classList.add('is-selected');
  }
  if (channel.unread) {
    item.classList.add('is-unread');
  }

  const button = el('button', 'channel-button');
  button.type = 'button';
  button.append(icon(channel.type === 'voice' ? 'speaker' : 'hash'), el('span', 'channel-name', channel.name));
  if (channel.mentions > 0) {
    button.append(el('span', 'channel-mention-badge', String(channel.mentions)));
  }
  item.append(button);

  // Voice channels list the people who are connected
  if (channel.type === 'voice' && channel.voiceUserIds.length > 0) {
    const list = el('ul', 'voice-users');
    for (const userId of channel.voiceUserIds) {
      list.append(createVoiceUser(userId));
    }
    item.append(list);
  }
  return item;
}

function createCategory(category, activeChannelId) {
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
    const isSelected = channel.id === activeChannelId;
    // A collapsed category still shows the selected channel and busy voice channels.
    const isBusyVoice = channel.type === 'voice' && channel.voiceUserIds.length > 0;
    if (isCollapsed && !isSelected && !isBusyVoice) {
      continue;
    }
    list.append(createChannelItem(channel, isSelected));
  }

  section.append(heading, list);
  return section;
}

export function renderChannels() {
  const server = getActiveServer();
  const activeChannel = getActiveChannel();
  serverName.textContent = server.name;
  channelList.replaceChildren();
  for (const category of server.categories) {
    channelList.append(createCategory(category, activeChannel.id));
  }
}

export function setupChannels() {
  channelList.addEventListener('click', (event) => {
    const toggle = event.target.closest('.category-toggle');
    if (toggle) {
      toggleCategory(toggle.closest('.category').dataset.categoryId);
      return;
    }
    const button = event.target.closest('.channel-button');
    if (button) {
      selectChannel(button.closest('.channel-item').dataset.channelId);
      closeNav();
    }
  });
}
