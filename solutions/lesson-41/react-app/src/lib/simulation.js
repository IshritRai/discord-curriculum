// Fake activity: people "type", then messages arrive. Pure timers and randomness.
// These functions get the latest state with getState() and change it with dispatch().

import { CURRENT_USER_ID, getUser, getChannels, findServerOfChannel, mentionsMe } from '../state/selectors.js';

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function possibleAuthors(state, server) {
  return server.members
    .map((member) => getUser(state, member.userId))
    .filter((user) => user.id !== CURRENT_USER_ID && user.status !== 'offline' && !user.bot);
}

// Someone types for a moment (longer text = longer typing), then the message appears.
function typeThenSend(getState, dispatch, channelId, userId, text) {
  dispatch({ type: 'setTyping', typing: { channelId, userId } });
  const typingTime = Math.min(1000 + text.length * 50, 5000);
  return setTimeout(() => {
    const state = getState();
    dispatch({
      type: 'sendMessage',
      channelId,
      mentionsMe: mentionsMe(state, text),
      message: { id: crypto.randomUUID(), authorId: userId, content: text, timestamp: new Date().toISOString(), reactions: [] },
    });
  }, typingTime);
}

function pickLine(state) {
  if (Math.random() < 0.2) {
    return randomItem(state.chatter.mentionLines).replace('{me}', getUser(state, CURRENT_USER_ID).displayName);
  }
  return randomItem(state.chatter.lines);
}

// Starts the endless "someone writes something every 15–30 seconds" loop.
// Returns a function that stops it (for a useEffect cleanup).
export function startSimulation(getState, dispatch) {
  let timer = null;
  let typingTimer = null;
  function scheduleNext() {
    timer = setTimeout(() => {
      const state = getState();
      const viewingServer = findServerOfChannel(state, state.viewingChannelId) ?? state.servers[0];
      const server = Math.random() < 0.7 ? viewingServer : randomItem(state.servers);
      const textChannels = getChannels(server).filter((c) => c.type === 'text');
      const authors = possibleAuthors(state, server);
      if (state.typing === null && textChannels.length > 0 && authors.length > 0) {
        typingTimer = typeThenSend(getState, dispatch, randomItem(textChannels).id, randomItem(authors).id, pickLine(state));
      }
      scheduleNext();
    }, randomBetween(15000, 30000));
  }
  scheduleNext();
  return () => {
    clearTimeout(timer);
    clearTimeout(typingTimer);
  };
}

// After you send a message, someone sometimes answers.
export function scheduleReply(getState, dispatch, channelId) {
  const state = getState();
  const authors = possibleAuthors(state, findServerOfChannel(state, channelId));
  if (authors.length === 0 || Math.random() < 0.4) {
    return;
  }
  setTimeout(() => {
    if (getState().typing === null) {
      typeThenSend(getState, dispatch, channelId, randomItem(authors).id, randomItem(getState().chatter.replies));
    }
  }, randomBetween(800, 2500));
}
