// Fake activity, so the app feels alive: people "type", then messages arrive.
// Everything here is made up with timers and random numbers — there is no network.

import { state, getActiveServer, getActiveChannel, getChannels, getUser, getCurrentUser, findServerOfChannel, CURRENT_USER_ID } from './state.js';
import { sendMessage } from './actions.js';
import { el } from './dom.js';

const typingIndicator = document.querySelector('#typing-indicator');

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Shows "Ava is typing…" under the composer if they're typing in this channel.
export function renderTyping() {
  typingIndicator.replaceChildren();
  const typing = state.typing;
  if (typing === null || typing.channelId !== getActiveChannel().id) {
    return;
  }
  const dots = el('span', 'typing-dots');
  dots.append(el('span'), el('span'), el('span'));
  typingIndicator.append(dots, el('strong', '', getUser(typing.userId).displayName), ' is typing…');
}

// Online members of a server who could "write" something (not you, not bots).
function possibleAuthors(server) {
  return server.members
    .map((member) => getUser(member.userId))
    .filter((user) => user.id !== CURRENT_USER_ID && user.status !== 'offline' && !user.bot);
}

// Someone types for a moment (longer text = longer typing), then the message appears.
function typeThenSend(channelId, userId, text) {
  state.typing = { channelId: channelId, userId: userId };
  renderTyping();
  const typingTime = Math.min(1000 + text.length * 50, 5000);
  setTimeout(() => {
    state.typing = null;
    sendMessage(channelId, userId, text); // sendMessage re-renders, which also clears the indicator
  }, typingTime);
}

function pickLine() {
  if (Math.random() < 0.2) {
    return randomItem(state.chatter.mentionLines).replace('{me}', getCurrentUser().displayName);
  }
  return randomItem(state.chatter.lines);
}

function sendRandomMessage() {
  // Usually the server you're looking at, sometimes another one (so badges appear).
  const server = Math.random() < 0.7 ? getActiveServer() : randomItem(state.servers);
  const textChannels = getChannels(server).filter((c) => c.type === 'text');
  const authors = possibleAuthors(server);
  if (state.typing !== null || textChannels.length === 0 || authors.length === 0) {
    return;
  }
  typeThenSend(randomItem(textChannels).id, randomItem(authors).id, pickLine());
}

function scheduleNextMessage() {
  setTimeout(() => {
    sendRandomMessage();
    scheduleNextMessage();
  }, randomBetween(15000, 30000));
}

// After you send a message, someone sometimes answers.
export function scheduleReply(channelId) {
  const authors = possibleAuthors(findServerOfChannel(channelId));
  if (authors.length === 0 || Math.random() < 0.4) {
    return;
  }
  setTimeout(() => {
    if (state.typing === null) {
      typeThenSend(channelId, randomItem(authors).id, randomItem(state.chatter.replies));
    }
  }, randomBetween(800, 2500));
}

export function startSimulation() {
  scheduleNextMessage();
}
