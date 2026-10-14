// Helpers that return CHANGED COPIES of nested data. React only notices a change
// when it gets a new object or array, so we never modify the old ones.

// Returns new servers where one channel has some fields changed.
export function updateChannel(servers, channelId, changes) {
  return servers.map((server) => ({
    ...server,
    categories: server.categories.map((category) => ({
      ...category,
      channels: category.channels.map((channel) => (channel.id === channelId ? { ...channel, ...changes } : channel)),
    })),
  }));
}

// Adds the item if it isn't in the list, removes it if it is.
export function toggleInList(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

// Returns new messages where one message is replaced by update(message).
export function updateMessage(messages, messageId, update) {
  const result = {};
  for (const [channelId, list] of Object.entries(messages)) {
    result[channelId] = list.map((message) => (message.id === messageId ? update(message) : message));
  }
  return result;
}
