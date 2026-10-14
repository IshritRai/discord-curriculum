// The channel sidebar: server name, categories and channels.

import { state, getActiveServer, getActiveChannel } from './state.js';
import { selectChannel, toggleCategory } from './actions.js';
import { el, icon } from './dom.js';
import { closeNav } from './layout.js';

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
  button.append(icon(channel.type === 'voice' ? 'speaker' : 'hash'), el('span', 'channel-name', channel.name));

  item.append(button);
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
    list.append(createChannelItem(channel, channel.id === activeChannelId));
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
