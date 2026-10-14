// Small functions that look things up in the app's data. They never change anything.
// `state` is an object with users, servers and messages.

export const CURRENT_USER_ID = 'u-me';

export function getUser(state, userId) {
  return state.users.find((user) => user.id === userId);
}

// All channels of a server, without the categories around them.
export function getChannels(server) {
  return server.categories.flatMap((category) => category.channels);
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
