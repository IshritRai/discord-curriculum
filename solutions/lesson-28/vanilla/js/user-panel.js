// The user panel (bottom left).

import { getCurrentUser, CURRENT_USER_ID } from './state.js';
import { avatar } from './dom.js';
import { openProfile } from './modals.js';

export function renderUserPanel() {
  const me = getCurrentUser();
  const userAvatar = avatar(me, true);
  userAvatar.id = 'user-panel-avatar';
  document.querySelector('#user-panel-avatar').replaceWith(userAvatar);
  document.querySelector('#user-panel-name').textContent = me.displayName;
  document.querySelector('#user-panel-tag').textContent = me.customStatus;
}

export function setupUserPanel() {
  document.querySelector('#user-panel-profile').addEventListener('click', () => openProfile(CURRENT_USER_ID));
}
