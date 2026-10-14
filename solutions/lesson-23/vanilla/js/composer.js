// The message box at the bottom: Enter sends, Shift+Enter adds a new line.

import { getActiveChannel, getMessages, CURRENT_USER_ID } from './state.js';
import { sendMessage, startEditing } from './actions.js';
import { autoResize, scrollToBottom } from './chat.js';

const composer = document.querySelector('#composer');
const composerInput = document.querySelector('#composer-input');

function send() {
  const text = composerInput.value.trim();
  if (text === '') {
    return; // don't send empty messages
  }
  sendMessage(getActiveChannel().id, CURRENT_USER_ID, text);
  composerInput.value = '';
  autoResize(composerInput);
  scrollToBottom();
}

export function setupComposer() {
  composer.addEventListener('submit', (event) => {
    event.preventDefault(); // stop the browser from reloading the page
    send();
  });

  composerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // don't add a new line
      send();
    }
    // Up arrow in an empty box edits your last message
    if (event.key === 'ArrowUp' && composerInput.value === '') {
      const mine = getMessages(getActiveChannel().id).filter((m) => m.authorId === CURRENT_USER_ID);
      if (mine.length > 0) {
        event.preventDefault();
        startEditing(mine[mine.length - 1].id);
      }
    }
  });

  composerInput.addEventListener('input', () => autoResize(composerInput));
}
