// Right-click (context) menus, plus the menus behind the server name and the settings button.
// The menu is one <div popover> that we fill with buttons each time it opens.

import { state, getActiveServer, findChannel, findMessage, getUser, CURRENT_USER_ID } from './state.js';
import { markServerRead, markRead, leaveServer, startEditing, selectChannel, resetDemoData } from './actions.js';
import { el, icon } from './dom.js';
import { openEmojiPicker } from './reactions.js';
import { openProfile, confirmDelete } from './modals.js';

const menu = document.querySelector('#context-menu');
const serverList = document.querySelector('#server-list');
const channelList = document.querySelector('#channel-list');
const messageList = document.querySelector('#message-list');
const memberList = document.querySelector('#member-list');
const sidebarHeader = document.querySelector('.sidebar-header');
const settingsButton = document.querySelector('#settings-button');
const composerInput = document.querySelector('#composer-input');

// items: [{ label, icon, danger, run }] — or the string 'separator'
export function showMenu(items, x, y) {
  menu.replaceChildren();
  for (const item of items) {
    if (item === 'separator') {
      menu.append(el('div', 'menu-separator'));
      continue;
    }
    const button = el('button', 'menu-item');
    button.type = 'button';
    button.append(el('span', '', item.label));
    if (item.icon) {
      button.append(icon(item.icon));
    }
    if (item.danger) {
      button.classList.add('danger');
    }
    button.addEventListener('click', () => {
      menu.hidePopover();
      item.run();
    });
    menu.append(button);
  }

  menu.showPopover();
  // Keep the whole menu inside the window: open upwards or leftwards if needed.
  let left = x;
  let top = y;
  if (left + menu.offsetWidth > window.innerWidth - 8) {
    left = x - menu.offsetWidth;
  }
  if (top + menu.offsetHeight > window.innerHeight - 8) {
    top = y - menu.offsetHeight;
  }
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
  menu.querySelector('.menu-item').focus();
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch((error) => {
    console.warn('Could not copy to the clipboard.', error);
  });
}

// ---------- Menus for each kind of thing ----------

function serverMenu(serverId) {
  const server = state.servers.find((s) => s.id === serverId);
  return [
    { label: 'Mark As Read', icon: 'check', run: () => markServerRead(serverId) },
    { label: 'Copy Server Name', icon: 'copy', run: () => copyText(server.name) },
    'separator',
    { label: 'Leave Server', icon: 'leave', danger: true, run: () => leaveServer(serverId) },
  ];
}

function channelMenu(channelId) {
  const channel = findChannel(channelId);
  const items = [];
  if (channel.type === 'voice') {
    items.push({ label: 'Join Voice', icon: 'speaker', run: () => selectChannel(channelId) });
  } else {
    items.push({ label: 'Mark As Read', icon: 'check', run: () => markRead(channelId) });
  }
  items.push({ label: 'Copy Channel Name', icon: 'copy', run: () => copyText(channel.name) });
  return items;
}

function messageMenu(messageId, anchor) {
  const message = findMessage(messageId);
  const items = [
    { label: 'Add Reaction', icon: 'reaction-add', run: () => openEmojiPicker(anchor, { type: 'reaction', messageId: messageId }) },
    { label: 'Copy Text', icon: 'copy', run: () => copyText(message.content) },
  ];
  if (message.authorId === CURRENT_USER_ID) {
    items.push({ label: 'Edit Message', icon: 'edit', run: () => startEditing(messageId) });
    items.push('separator');
    items.push({ label: 'Delete Message', icon: 'trash', danger: true, run: () => confirmDelete(message, false) });
  }
  return items;
}

function userMenu(userId) {
  const user = getUser(userId);
  return [
    { label: 'Profile', icon: 'user', run: () => openProfile(userId) },
    {
      label: 'Mention',
      icon: 'at',
      run: () => {
        composerInput.setRangeText(`@${user.displayName} `, composerInput.selectionStart, composerInput.selectionEnd, 'end');
        composerInput.focus();
      },
    },
  ];
}

function settingsMenu() {
  return [
    { label: 'My Profile', icon: 'user', run: () => openProfile(CURRENT_USER_ID) },
    'separator',
    { label: 'Reset Demo Data', icon: 'trash', danger: true, run: resetDemoData },
  ];
}

// ---------- Setup ----------

export function setupMenus() {
  serverList.addEventListener('contextmenu', (event) => {
    const item = event.target.closest('.server-item');
    if (item) {
      event.preventDefault(); // don't show the browser's own menu
      showMenu(serverMenu(item.dataset.serverId), event.clientX, event.clientY);
    }
  });

  channelList.addEventListener('contextmenu', (event) => {
    const item = event.target.closest('.channel-item');
    if (item) {
      event.preventDefault();
      showMenu(channelMenu(item.dataset.channelId), event.clientX, event.clientY);
    }
  });

  messageList.addEventListener('contextmenu', (event) => {
    const userButton = event.target.closest('[data-user-id]');
    const item = event.target.closest('.message');
    if (userButton) {
      event.preventDefault();
      showMenu(userMenu(userButton.dataset.userId), event.clientX, event.clientY);
    } else if (item && !event.target.closest('.edit-input')) {
      event.preventDefault();
      showMenu(messageMenu(item.dataset.messageId, item), event.clientX, event.clientY);
    }
  });

  memberList.addEventListener('contextmenu', (event) => {
    const member = event.target.closest('.member');
    if (member) {
      event.preventDefault();
      showMenu(userMenu(member.dataset.userId), event.clientX, event.clientY);
    }
  });

  sidebarHeader.addEventListener('click', () => {
    const rect = sidebarHeader.getBoundingClientRect();
    showMenu(serverMenu(getActiveServer().id), rect.left + 10, rect.bottom + 4);
  });

  settingsButton.addEventListener('click', () => {
    const rect = settingsButton.getBoundingClientRect();
    showMenu(settingsMenu(), rect.left, rect.top - 4);
  });
}

