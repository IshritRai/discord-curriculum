// The reducer: ONE pure function that takes the current state and an action,
// and returns the next state. It never changes the old state — it builds a new one.
// (Random ids and timestamps are made by the caller: a reducer must give the
// same result every time it's called with the same input.)

import { getChannels, pickChannel } from './selectors.js';
import { updateChannel, updateMessage, toggleInList } from './updates.js';

export function createInitialState(data) {
  return {
    users: data.users,
    servers: data.servers,
    messages: data.messages,
    activeServerId: data.servers[0].id,
    activeChannelByServer: {},
    collapsedCategoryIds: [],
    showMembers: true,
    navOpen: false,
    editingMessageId: null,
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
      const list = state.messages[action.channelId] ?? [];
      return { ...state, messages: { ...state.messages, [action.channelId]: [...list, action.message] } };
    }
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
