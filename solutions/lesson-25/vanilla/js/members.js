// The member list: grouped by role, then "Online", then "Offline".

import { state, getActiveServer, getUser } from './state.js';
import { el, avatar } from './dom.js';

const memberList = document.querySelector('#member-list');
const membersButton = document.querySelector('#members-button');

// Used by sort(): a negative number puts a before b, positive puts b first.
function byName(a, b) {
  return a.user.displayName.localeCompare(b.user.displayName);
}

// Returns [{ title, members: [{ user, role }] }] in display order.
export function groupMembers(server) {
  const roleGroups = server.roles.map((role) => ({ title: role.name, roleId: role.id, members: [] }));
  const online = { title: 'Online', members: [] };
  const offline = { title: 'Offline', members: [] };

  for (const member of server.members) {
    const user = getUser(member.userId);
    const role = server.roles.find((r) => r.id === member.roleId);
    const entry = { user: user, role: role };
    if (user.status === 'offline') {
      offline.members.push(entry);
    } else if (role) {
      roleGroups.find((group) => group.roleId === role.id).members.push(entry);
    } else {
      online.members.push(entry);
    }
  }

  const groups = [...roleGroups, online, offline];
  for (const group of groups) {
    group.members.sort(byName);
  }
  return groups.filter((group) => group.members.length > 0);
}

function createMember(entry) {
  const user = entry.user;
  const role = entry.role;
  const button = el('button', 'member');
  button.type = 'button';
  button.dataset.userId = user.id;
  if (user.status === 'offline') {
    button.classList.add('is-offline');
  }
  const names = el('span', 'member-names');
  const name = el('span', 'member-name', user.displayName);
  if (role) {
    name.style.setProperty('--author-color', role.color);
  }
  names.append(name);
  if (user.customStatus && user.status !== 'offline') {
    names.append(el('span', 'member-status-text', user.customStatus));
  }
  button.append(avatar(user, true), names);
  return button;
}

export function renderMembers() {
  memberList.hidden = !state.showMembers;
  membersButton.setAttribute('aria-pressed', String(state.showMembers));
  if (!state.showMembers) {
    return;
  }
  memberList.replaceChildren();
  for (const group of groupMembers(getActiveServer())) {
    memberList.append(el('h3', 'member-group-title', `${group.title} — ${group.members.length}`));
    for (const entry of group.members) {
      memberList.append(createMember(entry));
    }
  }
}
