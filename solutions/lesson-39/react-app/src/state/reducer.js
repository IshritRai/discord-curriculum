// The reducer: ONE pure function that takes the current state and an action,
// and returns the next state. It never changes the old state — it builds a new one.
// (Random ids and timestamps are made by the caller: a reducer must give the
// same result every time it's called with the same input.)

import { loadSaved } from './storage.js';
import { CURRENT_USER_ID, findChannel, getChannels } from './selectors.js';
import { updateChannel, updateMessage, toggleInList } from './updates.js';

// Builds the first state: from localStorage if something was saved, otherwise from the JSON files.
export function createInitialState(data) {
  const saved = loadSaved();
  return {
    // Data (saved in localStorage)
    users: saved?.users ?? data.users,
    servers: saved?.servers ?? data.servers,
    messages: saved?.messages ?? data.messages,
    activeChannelByServer: saved?.activeChannelByServer ?? {},
    collapsedCategoryIds: saved?.collapsedCategoryIds ?? [],

    // Never changes
    emojiCategories: data.emojiCategories,
    chatter: data.chatter,

    // Temporary UI state (not saved)
    viewingChannelId: null, // the channel on screen (the URL decides it; see App.jsx)
    showMembers: !window.matchMedia('(max-width: 1000px)').matches,
    navOpen: false,
    drafts: {}, // channel id → unsent text in the composer
    editingMessageId: null,
    typing: null, // { channelId, userId } while someone is "typing"
    picker: null, // { onPick, rect } while the emoji picker is open
    menu: null, // { kind, id, x, y } while a context menu is open
    dialog: null, // { kind: 'createServer' | 'profile' | 'delete', id }
  };
}

export function reducer(state, action) {
  switch (action.type) {
    // The URL changed to /channels/:serverId/:channelId (see App.jsx)
    case 'channelOpened': {
      const { serverId, channelId } = action;
      return {
        ...state,
        activeChannelByServer: { ...state.activeChannelByServer, [serverId]: channelId },
        servers: updateChannel(state.servers, channelId, { unread: false, mentions: 0 }),
        viewingChannelId: channelId,
        editingMessageId: null,
      };
    }
    case 'toggleCategory':
      return { ...state, collapsedCategoryIds: toggleInList(state.collapsedCategoryIds, action.categoryId) };
    case 'toggleMembers':
      return { ...state, showMembers: !state.showMembers };
    case 'setNavOpen':
      return { ...state, navOpen: action.open };
    case 'markRead':
      return { ...state, servers: updateChannel(state.servers, action.channelId, { unread: false, mentions: 0 }) };
    case 'markServerRead': {
      let servers = state.servers;
      const server = state.servers.find((s) => s.id === action.serverId);
      for (const channel of getChannels(server)) {
        servers = updateChannel(servers, channel.id, { unread: false, mentions: 0 });
      }
      return { ...state, servers };
    }

    case 'sendMessage': {
      const { message, channelId, mentionsMe } = action;
      const list = state.messages[channelId] ?? [];
      let servers = state.servers;
      // A message from someone else in a channel you're not looking at
      if (message.authorId !== CURRENT_USER_ID && channelId !== state.viewingChannelId) {
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
    case 'setDraft':
      return { ...state, drafts: { ...state.drafts, [action.channelId]: action.text } };
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
      return { ...state, messages, editingMessageId: null, dialog: null };
    }

    case 'toggleReaction':
      return {
        ...state,
        messages: updateMessage(state.messages, action.messageId, (message) => {
          const existing = message.reactions.find((r) => r.emoji === action.emoji);
          let reactions;
          if (!existing) {
            reactions = [...message.reactions, { emoji: action.emoji, userIds: [CURRENT_USER_ID] }];
          } else {
            reactions = message.reactions
              .map((r) => (r === existing ? { ...r, userIds: toggleInList(r.userIds, CURRENT_USER_ID) } : r))
              .filter((r) => r.userIds.length > 0);
          }
          return { ...message, reactions };
        }),
      };

    // ----- Servers -----
    case 'createServer':
      return { ...state, servers: [...state.servers, action.server], dialog: null };
    case 'leaveServer':
      if (state.servers.length === 1) {
        return state; // keep at least one server
      }
      return { ...state, servers: state.servers.filter((s) => s.id !== action.serverId) };

    // ----- The emoji picker -----
    case 'openPicker':
      return { ...state, picker: { onPick: action.onPick, rect: action.rect } };
    case 'closePicker':
      return { ...state, picker: null };

    // ----- Context menus and dialogs -----
    case 'openMenu':
      return { ...state, menu: action.menu };
    case 'closeMenu':
      return { ...state, menu: null };
    case 'openDialog':
      return { ...state, dialog: action.dialog };
    case 'closeDialog':
      return { ...state, dialog: null };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
