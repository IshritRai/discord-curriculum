// The member list on the right.

import { state, getActiveServer, getUser } from './state.js';
import { el, avatar } from './dom.js';

const memberList = document.querySelector('#member-list');
const membersButton = document.querySelector('#members-button');

function createMember(user) {
  const button = el('button', 'member');
  button.type = 'button';
  button.dataset.userId = user.id;
  if (user.status === 'offline') {
    button.classList.add('is-offline');
  }

  const names = el('span', 'member-names');
  names.append(el('span', 'member-name', user.displayName));
  if (user.customStatus) {
    names.append(el('span', 'member-status-text', user.customStatus));
  }

  button.append(avatar(user, true), names);
  return button;
}

export function renderMembers() {
  memberList.hidden = !state.showMembers;
  membersButton.setAttribute('aria-pressed', String(state.showMembers));

  const server = getActiveServer();
  const memberUsers = server.members.map((member) => getUser(member.userId));
  const onlineCount = memberUsers.filter((user) => user.status !== 'offline').length;

  memberList.replaceChildren();
  memberList.append(el('h3', 'member-group-title', `Members — ${memberUsers.length} (${onlineCount} online)`));
  for (const user of memberUsers) {
    memberList.append(createMember(user));
  }
}
