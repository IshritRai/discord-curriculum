// The chat area: header and the message feed.

import { getActiveChannel, getMessages, getUser } from './state.js';
import { el, avatar } from './dom.js';

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const messageList = document.querySelector('#message-list');
const composerInput = document.querySelector('#composer-input');

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

export function renderChat() {
  const channel = getActiveChannel();
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;

  messageList.replaceChildren();
  for (const message of getMessages(channel.id)) {
    messageList.append(createMessage(message));
  }
}
