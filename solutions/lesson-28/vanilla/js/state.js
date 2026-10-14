// The app's state: ONE object that holds everything the screen shows.
// Render functions read it; actions change it and then call update().

export const CURRENT_USER_ID = 'u-me';

const STORAGE_KEY = 'chat-clone-state-v1';

export const state = {
  // Data — saved in localStorage
  users: [],
  servers: [],
  messages: {}, // channel id → array of messages

  // What you're looking at — also saved
  activeServerId: null,
  activeChannelByServer: {}, // server id → channel id
  collapsedCategoryIds: [],

  // Temporary — not saved
  emojiCategories: [],
  chatter: null, // fake lines for the simulation
  showMembers: true,
  editingMessageId: null, // the message you're editing, if any
  editDraft: '', // what's in the edit box right now
  typing: null, // { channelId, userId } while someone is "typing"
};

// ---------- Saving and loading ----------

export function save() {
  const saved = {
    users: state.users,
    servers: state.servers,
    messages: state.messages,
    activeServerId: state.activeServerId,
    activeChannelByServer: state.activeChannelByServer,
    collapsedCategoryIds: state.collapsedCategoryIds,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function clearSaved() {
  localStorage.removeItem(STORAGE_KEY);
}

// Returns the saved object, or null if there's nothing (valid) saved.
export function loadSaved() {
  const text = localStorage.getItem(STORAGE_KEY);
  if (text === null) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Saved state was corrupted, starting fresh.', error);
    return null;
  }
}

// ---------- Telling the app that something changed ----------

let onChangeCallback = null;

// main.js registers its render function here.
// (state.js can't import main.js: main.js already imports state.js.)
export function onChange(callback) {
  onChangeCallback = callback;
}

// Call this after every change to the state: it saves and re-renders.
export function update() {
  save();
  if (onChangeCallback) {
    onChangeCallback();
  }
}

// ---------- Looking things up ----------

export function getUser(userId) {
  return state.users.find((user) => user.id === userId);
}

export function getCurrentUser() {
  return getUser(CURRENT_USER_ID);
}

export function getActiveServer() {
  return state.servers.find((server) => server.id === state.activeServerId);
}

// All channels of a server, without the categories around them.
export function getChannels(server) {
  return server.categories.flatMap((category) => category.channels);
}

// Finds a channel in any server.
export function findChannel(channelId) {
  for (const server of state.servers) {
    const channel = getChannels(server).find((c) => c.id === channelId);
    if (channel) {
      return channel;
    }
  }
  return null;
}

// The selected channel of the active server (its first text channel if none was picked yet)
export function getActiveChannel() {
  const server = getActiveServer();
  const channelId = state.activeChannelByServer[server.id];
  const channels = getChannels(server);
  return channels.find((c) => c.id === channelId) ?? channels.find((c) => c.type === 'text');
}

export function getMessages(channelId) {
  return state.messages[channelId] ?? [];
}

export function findMessage(messageId) {
  for (const messages of Object.values(state.messages)) {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      return message;
    }
  }
  return null;
}

export function getMember(server, userId) {
  return server.members.find((member) => member.userId === userId);
}

// The role color of a user in a server (or undefined if they have no role).
export function getRoleColor(server, userId) {
  const member = getMember(server, userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);
  return role ? role.color : undefined;
}

export function findServerOfChannel(channelId) {
  return state.servers.find((server) => getChannels(server).some((c) => c.id === channelId));
}

// ---------- Unread and mentions ----------

// A server is unread if any of its channels is.
export function isServerUnread(server) {
  return getChannels(server).some((channel) => channel.unread);
}

// True if a message's text mentions you, like "hey @Sam".
export function mentionsMe(text) {
  return text.includes(`@${getCurrentUser().displayName}`);
}

export function countServerMentions(server) {
  let total = 0;
  for (const channel of getChannels(server)) {
    total += channel.mentions ?? 0;
  }
  return total;
}
