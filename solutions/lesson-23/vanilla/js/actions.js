// Actions: every change to the app's data goes through one of these functions.
// Each one changes `state`, then calls update() to save and re-render.

import { state, update, getActiveChannel, findChannel, findMessage } from './state.js';

function markChannelRead(channel) {
  channel.unread = false;
  channel.mentions = 0;
}

export function selectServer(serverId) {
  state.activeServerId = serverId;
  state.editingMessageId = null;
  markChannelRead(getActiveChannel());
  update();
}

export function selectChannel(channelId) {
  const channel = findChannel(channelId);
  if (channel.type === 'voice') {
    return; // joining voice channels comes in Lesson 29
  }
  state.activeChannelByServer[state.activeServerId] = channelId;
  state.editingMessageId = null;
  markChannelRead(channel);
  update();
}

export function toggleCategory(categoryId) {
  if (state.collapsedCategoryIds.includes(categoryId)) {
    state.collapsedCategoryIds = state.collapsedCategoryIds.filter((id) => id !== categoryId);
  } else {
    state.collapsedCategoryIds.push(categoryId);
  }
  update();
}

export function toggleMembers() {
  state.showMembers = !state.showMembers;
  update();
}

// ---------- Messages ----------

export function sendMessage(channelId, authorId, content) {
  const message = {
    id: crypto.randomUUID(),
    authorId: authorId,
    content: content,
    timestamp: new Date().toISOString(),
    reactions: [],
  };
  if (!state.messages[channelId]) {
    state.messages[channelId] = [];
  }
  state.messages[channelId].push(message);
  update();
  return message;
}

export function startEditing(messageId) {
  state.editingMessageId = messageId;
  state.editDraft = findMessage(messageId).content;
  update();
}

export function cancelEditing() {
  state.editingMessageId = null;
  update();
}

export function saveEdit() {
  const message = findMessage(state.editingMessageId);
  const content = state.editDraft.trim();
  state.editingMessageId = null;
  if (content === '') {
    // Saving an empty message deletes it, like in the real app.
    deleteMessage(message.id);
    return;
  }
  if (content !== message.content) {
    message.content = content;
    message.editedAt = new Date().toISOString();
  }
  update();
}

export function deleteMessage(messageId) {
  for (const channelId of Object.keys(state.messages)) {
    state.messages[channelId] = state.messages[channelId].filter((m) => m.id !== messageId);
  }
  update();
}
