// Actions: every change to the app's data goes through one of these functions.
// Each one changes `state`, then calls update() to save and re-render.

import { state, update, clearSaved, getActiveChannel, getChannels, findChannel, findMessage, CURRENT_USER_ID } from './state.js';

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

export function markServerRead(serverId) {
  const server = state.servers.find((s) => s.id === serverId);
  for (const channel of getChannels(server)) {
    markChannelRead(channel);
  }
  update();
}

export function markRead(channelId) {
  markChannelRead(findChannel(channelId));
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

// Adds your reaction, or removes it if you already reacted with that emoji.
export function toggleReaction(messageId, emoji) {
  const message = findMessage(messageId);
  const reaction = message.reactions.find((r) => r.emoji === emoji);
  if (!reaction) {
    message.reactions.push({ emoji: emoji, userIds: [CURRENT_USER_ID] });
  } else if (reaction.userIds.includes(CURRENT_USER_ID)) {
    reaction.userIds = reaction.userIds.filter((id) => id !== CURRENT_USER_ID);
    if (reaction.userIds.length === 0) {
      message.reactions = message.reactions.filter((r) => r !== reaction);
    }
  } else {
    reaction.userIds.push(CURRENT_USER_ID);
  }
  update();
}

// ---------- Servers ----------

export function createServer(name, iconText) {
  const id = crypto.randomUUID();
  const words = name.trim().split(/\s+/);
  const initials = words.map((word) => word[0].toUpperCase()).join('').slice(0, 3);
  const server = {
    id: id,
    name: name.trim(),
    icon: iconText || initials,
    iconIsEmoji: iconText !== '',
    roles: [],
    members: [{ userId: CURRENT_USER_ID, roleId: null }],
    categories: [
      {
        id: `${id}-text`,
        name: 'Text Channels',
        channels: [{ id: `${id}-general`, name: 'general', type: 'text', topic: '', unread: false, mentions: 0 }],
      },
      {
        id: `${id}-voice`,
        name: 'Voice Channels',
        channels: [{ id: `${id}-voice-general`, name: 'General', type: 'voice', voiceUserIds: [] }],
      },
    ],
  };
  state.servers.push(server);
  state.activeServerId = id;
  update();
}

export function leaveServer(serverId) {
  if (state.servers.length === 1) {
    return; // keep at least one server on screen
  }
  state.servers = state.servers.filter((s) => s.id !== serverId);
  if (state.activeServerId === serverId) {
    state.activeServerId = state.servers[0].id;
  }
  update();
}

// ---------- Demo data ----------

// Forget everything saved and start again from the JSON files.
export function resetDemoData() {
  clearSaved();
  location.reload();
}
