// Small functions that look things up in the app's data. They never change anything.


export const CURRENT_USER_ID = 'u-me';

export function getUser(state, userId) {
  return state.users.find((user) => user.id === userId);
}

// All channels of a server, without the categories around them.
export function getChannels(server) {
  return server.categories.flatMap((category) => category.channels);
}

export function findChannel(state, channelId) {
  for (const server of state.servers) {
    const channel = getChannels(server).find((c) => c.id === channelId);
    if (channel) {
      return channel;
    }
  }
  return null;
}

export function findServerOfChannel(state, channelId) {
  return state.servers.find((server) => getChannels(server).some((c) => c.id === channelId));
}

export function findServer(state, serverId) {
  return state.servers.find((server) => server.id === serverId);
}

// The channel to open for a server: the last one you looked at, or its first text channel.
export function defaultChannelId(state, server) {
  const remembered = state.activeChannelByServer[server.id];
  const channels = getChannels(server);
  if (channels.some((c) => c.id === remembered)) {
    return remembered;
  }
  return channels.find((c) => c.type === 'text').id;
}

export function getRoleColor(server, userId) {
  const member = server.members.find((m) => m.userId === userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);
  return role ? role.color : undefined;
}

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

export function mentionsMe(state, text) {
  return text.includes(`@${getUser(state, CURRENT_USER_ID).displayName}`);
}
