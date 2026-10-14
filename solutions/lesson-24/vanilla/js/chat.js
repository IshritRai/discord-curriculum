// The chat area: header and the message feed (grouping, timestamps, dividers, markdown).

import { state, getActiveChannel, getActiveServer, getMessages, getUser, getRoleColor, mentionsMe, CURRENT_USER_ID } from './state.js';
import { startEditing, cancelEditing, saveEdit, deleteMessage, toggleReaction } from './actions.js';
import { el, icon, avatar } from './dom.js';
import { renderMarkdown } from './markdown.js';
import { openEmojiPicker } from './reactions.js';
import { isSameDay, minutesBetween, formatTime, formatDate, formatTimestamp } from './time.js';

const chatTitle = document.querySelector('#chat-title');
const chatTopic = document.querySelector('#chat-topic');
const messageList = document.querySelector('#message-list');
const composerInput = document.querySelector('#composer-input');

let renderedChannelId = null;
let renderedEditingId = null;

// ---------- Building one message ----------

function createActionButton(action, iconName, label, extraClass) {
  const button = el('button', 'icon-button');
  button.type = 'button';
  button.dataset.action = action;
  button.setAttribute('aria-label', label);
  if (extraClass) {
    button.classList.add(extraClass);
  }
  button.append(icon(iconName));
  return button;
}

// The reaction pills under a message: emoji + count
function createReactions(message) {
  const list = el('div', 'reactions');
  for (const reaction of message.reactions) {
    const button = el('button', 'reaction');
    button.type = 'button';
    button.dataset.emoji = reaction.emoji;
    if (reaction.userIds.includes(CURRENT_USER_ID)) {
      button.classList.add('is-mine');
    }
    button.setAttribute('aria-label', `${reaction.emoji} reaction, ${reaction.userIds.length}`);
    button.append(el('span', 'reaction-emoji', reaction.emoji), el('span', 'reaction-count', String(reaction.userIds.length)));
    list.append(button);
  }
  return list;
}

// The edit box that replaces a message's text while you edit it
function createEditor() {
  const wrapper = el('div', 'editor');
  const input = el('textarea', 'edit-input');
  input.value = state.editDraft;
  input.rows = 1;
  input.setAttribute('aria-label', 'Edit message');

  const hint = el('p', 'edit-hint', 'escape to ');
  const cancel = el('button', '', 'cancel');
  cancel.type = 'button';
  cancel.dataset.action = 'cancel-edit';
  const saveButton = el('button', '', 'save');
  saveButton.type = 'button';
  saveButton.dataset.action = 'save-edit';
  hint.append(cancel, ' • enter to ', saveButton);

  wrapper.append(input, hint);
  return wrapper;
}

function createMessage(message, startsGroup) {
  const author = getUser(message.authorId);
  const item = el('li', 'message');
  item.dataset.messageId = message.id;
  if (startsGroup) {
    item.classList.add('is-group-start');
  }
  if (mentionsMe(message.content) && message.authorId !== CURRENT_USER_ID) {
    item.classList.add('is-mention');
  }
  const isEditing = state.editingMessageId === message.id;
  if (isEditing) {
    item.classList.add('is-editing');
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

  if (isEditing) {
    body.append(createEditor());
  } else {
    const content = el('div', 'message-content');
    // renderMarkdown escapes the text first, so this innerHTML is safe.
    content.innerHTML = renderMarkdown(message.content);
    if (message.editedAt) {
      content.append(' ', el('span', 'edited-label', '(edited)'));
    }
    body.append(content);
  }

  if (message.reactions.length > 0) {
    body.append(createReactions(message));
  }

  // The toolbar that appears when you hover a message (only your own can be edited)
  const actions = el('div', 'message-actions');
  actions.append(createActionButton('react', 'reaction-add', 'Add Reaction'));
  if (message.authorId === CURRENT_USER_ID) {
    actions.append(createActionButton('edit', 'edit', 'Edit'));
    actions.append(createActionButton('delete', 'trash', 'Delete', 'danger'));
  }

  item.append(gutter, body, actions);
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
  const editorHadFocus = document.activeElement && document.activeElement.classList.contains('edit-input');

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

  // Re-rendering replaced the edit box: size it, and focus it if you were
  // typing in it or just clicked "Edit".
  const editInput = messageList.querySelector('.edit-input');
  if (editInput) {
    autoResize(editInput);
    const justStartedEditing = state.editingMessageId !== renderedEditingId;
    if (justStartedEditing || editorHadFocus) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }
  renderedEditingId = state.editingMessageId;
}

// Makes a <textarea> exactly as tall as its text.
export function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function renderChat() {
  const channel = getActiveChannel();
  chatTitle.textContent = channel.name;
  chatTopic.textContent = channel.topic;
  composerInput.placeholder = `Message #${channel.name}`;
  renderMessages(channel);
}

// ---------- Events ----------

export function setupChat() {
  messageList.addEventListener('click', (event) => {
    const messageItem = event.target.closest('.message');
    if (!messageItem) {
      return;
    }
    const messageId = messageItem.dataset.messageId;

    const reaction = event.target.closest('.reaction');
    if (reaction) {
      toggleReaction(messageId, reaction.dataset.emoji);
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }
    const action = actionButton.dataset.action;
    if (action === 'react') {
      openEmojiPicker(actionButton, { type: 'reaction', messageId: messageId });
    } else if (action === 'edit') {
      startEditing(messageId);
    } else if (action === 'delete') {
      // Shift+click deletes right away; otherwise ask first.
      // (Lesson 26 replaces confirm() with a nicer dialog.)
      if (event.shiftKey || confirm('Delete this message?')) {
        deleteMessage(messageId);
      }
    } else if (action === 'cancel-edit') {
      cancelEditing();
    } else if (action === 'save-edit') {
      saveEdit();
    }
  });

  // Typing in the edit box: remember the draft without re-rendering.
  messageList.addEventListener('input', (event) => {
    if (event.target.classList.contains('edit-input')) {
      state.editDraft = event.target.value;
      autoResize(event.target);
    }
  });

  messageList.addEventListener('keydown', (event) => {
    if (!event.target.classList.contains('edit-input')) {
      return;
    }
    if (event.key === 'Escape') {
      cancelEditing();
      composerInput.focus();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
      composerInput.focus();
    }
  });
}
