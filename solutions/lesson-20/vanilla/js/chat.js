// The chat area: header and the message feed (grouping, timestamps, date dividers).

import { getActiveChannel, getActiveServer, getMessages, getUser, getRoleColor } from './state.js';
import { el, icon, avatar } from './dom.js';
import { isSameDay, minutesBetween, formatTime, formatDate, formatTimestamp } from './time.js';

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const messageList = document.querySelector('#message-list');
const composerInput = document.querySelector('#composer-input');

let renderedChannelId = null;

// ---------- Building one message ----------

function createMessage(message, startsGroup) {
  const author = getUser(message.authorId);
  const item = el('li', 'message');
  item.dataset.messageId = message.id;
  if (startsGroup) {
    item.classList.add('is-group-start');
  }

  // Left column: avatar for the first message of a group, otherwise the time on hover
  const gutter = el('div', 'message-gutter');
  if (startsGroup) {
    const avatarButton = el('button', 'avatar-button');
    avatarButton.type = 'button';
    avatarButton.dataset.userId = author.id;
    avatarButton.setAttribute('aria-label', `${author.displayName}'s profile`);
    avatarButton.append(avatar(author));
    gutter.append(avatarButton);
  } else {
    const time = el('time', 'message-hover-time', formatTime(message.timestamp));
    time.dateTime = message.timestamp;
    gutter.append(time);
  }

  const body = el('div', 'message-body');
  if (startsGroup) {
    const header = el('h3', 'message-header');
    const name = el('button', 'message-author', author.displayName);
    name.type = 'button';
    name.dataset.userId = author.id;
    const roleColor = getRoleColor(getActiveServer(), author.id);
    if (roleColor) {
      name.style.setProperty('--author-color', roleColor);
    }
    header.append(name);
    if (author.bot) {
      header.append(el('span', 'bot-tag', 'Bot'));
    }
    const time = el('time', 'message-time', formatTimestamp(message.timestamp));
    time.dateTime = message.timestamp;
    header.append(time);
    body.append(header);
  }

  body.append(el('div', 'message-content', message.content));

  item.append(gutter, body);
  return item;
}

// ---------- The whole feed ----------

function createChannelWelcome(channel) {
  const welcome = el('li', 'channel-welcome');
  const iconCircle = el('div', 'channel-welcome-icon');
  iconCircle.append(icon('hash'));
  welcome.append(
    iconCircle,
    el('h3', 'channel-welcome-title', `Welcome to #${channel.name}!`),
    el('p', 'channel-welcome-text', `This is the start of the #${channel.name} channel.`),
  );
  return welcome;
}

function createDateDivider(timestamp) {
  const divider = el('li', 'date-divider');
  divider.setAttribute('role', 'separator');
  divider.append(el('span', '', formatDate(timestamp)));
  return divider;
}

// A new group starts when the author changes, after 7 minutes, or on a new day.
function startsNewGroup(previous, message) {
  return (
    !previous ||
    previous.authorId !== message.authorId ||
    minutesBetween(previous.timestamp, message.timestamp) > 7 ||
    !isSameDay(previous.timestamp, message.timestamp)
  );
}

function isNearBottom() {
  return messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 80;
}

export function scrollToBottom() {
  messageList.scrollTop = messageList.scrollHeight;
}

function renderMessages(channel) {
  const channelChanged = channel.id !== renderedChannelId;
  const wasNearBottom = isNearBottom();
  const previousScrollTop = messageList.scrollTop;

  messageList.replaceChildren(createChannelWelcome(channel));
  let previous = null;
  for (const message of getMessages(channel.id)) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      messageList.append(createDateDivider(message.timestamp));
    }
    messageList.append(createMessage(message, startsNewGroup(previous, message)));
    previous = message;
  }

  // Stay at the bottom (newest messages) unless you had scrolled up to read.
  if (channelChanged || wasNearBottom) {
    scrollToBottom();
  } else {
    messageList.scrollTop = previousScrollTop;
  }
  renderedChannelId = channel.id;
}

export function renderChat() {
  const channel = getActiveChannel();
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;
  renderMessages(channel);
}
