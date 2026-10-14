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
  showMembers: true,
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

// ---------- Unread and mentions ----------

// A server is unread if any of its channels is.
export function isServerUnread(server) {
  return getChannels(server).some((channel) => channel.unread);
}

export function countServerMentions(server) {
  let total = 0;
  for (const channel of getChannels(server)) {
    total += channel.mentions ?? 0;
  }
  return total;
}
