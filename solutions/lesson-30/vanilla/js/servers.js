// The server rail: one round button per server.

import { state, isServerUnread, countServerMentions } from './state.js';
import { selectServer } from './actions.js';
import { el } from './dom.js';

const serverList = document.querySelector('#server-list');

function createServerItem(server) {
  const item = el('li', 'server-item');
  item.dataset.serverId = server.id;
  if (server.id === state.activeServerId) {
    item.classList.add('is-active');
  }
  if (isServerUnread(server)) {
    item.classList.add('is-unread');
  }

  const button = el('button', 'server-button', server.icon);
  button.type = 'button';
  button.dataset.tooltip = server.name;
  button.setAttribute('aria-label', server.name);
  if (server.iconIsEmoji) {
    button.classList.add('is-emoji');
  }

  const mentions = countServerMentions(server);
  if (mentions > 0) {
    button.append(el('span', 'mention-badge', String(mentions)));
  }

  item.append(button);
  return item;
}

export function renderServers() {
  serverList.replaceChildren();
  for (const server of state.servers) {
    serverList.append(createServerItem(server));
  }
}

export function setupServers() {
  // One listener for the whole list (event delegation)
  serverList.addEventListener('click', (event) => {
    const item = event.target.closest('.server-item');
    if (item) {
      selectServer(item.dataset.serverId);
    }
  });
}
