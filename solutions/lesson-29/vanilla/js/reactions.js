// The emoji picker. It's used for two things:
//  - adding a reaction to a message ({ type: 'reaction', messageId })
//  - inserting an emoji into the composer ({ type: 'composer' })

import { state } from './state.js';
import { toggleReaction } from './actions.js';
import { el } from './dom.js';

const picker = document.querySelector('#emoji-picker');
const search = document.querySelector('#emoji-search');
const grid = document.querySelector('#emoji-grid');
const composerInput = document.querySelector('#composer-input');

// What the picker is open for (see the comment at the top)
let target = null;

function renderEmojiGrid(filter) {
  grid.replaceChildren();
  const query = filter.trim().toLowerCase();
  let found = 0;
  for (const category of state.emojiCategories) {
    const matches = category.emoji.filter((e) => e.name.includes(query));
    if (matches.length === 0) {
      continue;
    }
    found += matches.length;
    grid.append(el('h3', 'emoji-category', category.category));
    const options = el('div', 'emoji-options');
    for (const emoji of matches) {
      const button = el('button', 'emoji-option', emoji.char);
      button.type = 'button';
      button.dataset.emoji = emoji.char;
      button.title = `:${emoji.name.split(' ')[0]}:`;
      options.append(button);
    }
    grid.append(options);
  }
  if (found === 0) {
    grid.append(el('p', 'emoji-empty', 'No emoji match that search.'));
  }
}

// Places the picker next to the button that opened it, inside the window.
function positionPicker(anchor) {
  const rect = anchor.getBoundingClientRect();
  const width = picker.offsetWidth;
  const height = picker.offsetHeight;
  let left = rect.right - width;
  let top = rect.top - height - 8;
  if (top < 8) {
    top = rect.bottom + 8; // not enough room above: open below
  }
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  top = Math.min(top, window.innerHeight - height - 8);
  picker.style.left = `${left}px`;
  picker.style.top = `${top}px`;
}

export function openEmojiPicker(anchor, newTarget) {
  target = newTarget;
  search.value = '';
  renderEmojiGrid('');
  picker.showPopover();
  positionPicker(anchor);
  search.focus();
}

export function setupEmojiPicker() {
  search.addEventListener('input', () => renderEmojiGrid(search.value));

  grid.addEventListener('click', (event) => {
    const option = event.target.closest('.emoji-option');
    if (!option) {
      return;
    }
    const emoji = option.dataset.emoji;
    picker.hidePopover();
    if (target.type === 'reaction') {
      toggleReaction(target.messageId, emoji);
    } else {
      composerInput.setRangeText(emoji, composerInput.selectionStart, composerInput.selectionEnd, 'end');
      composerInput.focus();
    }
  });
}
