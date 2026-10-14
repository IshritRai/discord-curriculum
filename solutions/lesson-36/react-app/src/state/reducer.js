// The reducer: ONE pure function that takes the current state and an action,
// and returns the next state. It never changes the old state — it builds a new one.
// (Random ids and timestamps are made by the caller: a reducer must give the
// same result every time it's called with the same input.)

import { loadSaved } from './storage.js';
import { CURRENT_USER_ID, getActiveChannel, getChannels, pickChannel, findChannel } from './selectors.js';
import { updateChannel, updateMessage, toggleInList } from './updates.js';

// Builds the first state: from localStorage if something was saved, otherwise from the JSON files.
export function createInitialState(data) {
  const saved = loadSaved();
  return {
    // Data (saved in localStorage)
    users: saved?.users ?? data.users,
    servers: saved?.servers ?? data.servers,
    messages: saved?.messages ?? data.messages,
    activeServerId: saved?.activeServerId ?? data.servers[0].id,
    activeChannelByServer: saved?.activeChannelByServer ?? {},
    collapsedCategoryIds: saved?.collapsedCategoryIds ?? [],

    // Never changes
    chatter: data.chatter,

    // Temporary UI state (not saved)
    showMembers: !window.matchMedia('(max-width: 1000px)').matches,
    navOpen: false,
    editingMessageId: null,
    typing: null, // { channelId, userId } while someone is "typing"
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'selectServer': {
      const server = state.servers.find((s) => s.id === action.serverId);
      const channel = pickChannel(server, state.activeChannelByServer);
      return {
        ...state,
        activeServerId: action.serverId,
        servers: updateChannel(state.servers, channel.id, { unread: false, mentions: 0 }),
        editingMessageId: null,
      };
    }
    case 'selectChannel': {
      const server = state.servers.find((s) => s.id === state.activeServerId);
      const channel = getChannels(server).find((c) => c.id === action.channelId);
      if (channel.type === 'voice') {
        return state; // joining voice channels comes in Lesson 40
      }
      return {
        ...state,
        activeChannelByServer: { ...state.activeChannelByServer, [server.id]: channel.id },
        servers: updateChannel(state.servers, channel.id, { unread: false, mentions: 0 }),
        navOpen: false,
        editingMessageId: null,
      };
    }
    case 'toggleCategory':
      return { ...state, collapsedCategoryIds: toggleInList(state.collapsedCategoryIds, action.categoryId) };
    case 'toggleMembers':
      return { ...state, showMembers: !state.showMembers };
    case 'setNavOpen':
      return { ...state, navOpen: action.open };

    case 'sendMessage': {
      const { message, channelId, mentionsMe } = action;
      const list = state.messages[channelId] ?? [];
      let servers = state.servers;
      // A message from someone else in a channel you're not looking at
      if (message.authorId !== CURRENT_USER_ID && channelId !== getActiveChannel(state).id) {
        const channel = findChannel(state, channelId);
        servers = updateChannel(servers, channelId, { unread: true, mentions: channel.mentions + (mentionsMe ? 1 : 0) });
      }
      return {
        ...state,
        servers,
        messages: { ...state.messages, [channelId]: [...list, message] },
        // Whoever was "typing" this message is done typing
        typing: state.typing && state.typing.userId === message.authorId ? null : state.typing,
      };
    }
    case 'setTyping':
      return { ...state, typing: action.typing };
    case 'startEditing':
      return { ...state, editingMessageId: action.messageId };
    case 'cancelEditing':
      return { ...state, editingMessageId: null };
    case 'saveEdit':
      return {
        ...state,
        editingMessageId: null,
        messages: updateMessage(state.messages, action.messageId, (message) =>
          message.content === action.content ? message : { ...message, content: action.content, editedAt: action.editedAt },
        ),
      };
    case 'deleteMessage': {
      const messages = {};
      for (const [channelId, list] of Object.entries(state.messages)) {
        messages[channelId] = list.filter((m) => m.id !== action.messageId);
      }
      return { ...state, messages, editingMessageId: null };
    }

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
