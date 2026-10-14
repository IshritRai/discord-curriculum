// Layout toggles: the member list and, on small screens, the channel drawer.

import { toggleMembers } from './actions.js';

const app = document.querySelector('.app');
const menuButton = document.querySelector('#menu-button');
const backdrop = document.querySelector('#drawer-backdrop');
const membersButton = document.querySelector('#members-button');

export function openNav() {
  app.classList.add('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'true');
}

export function closeNav() {
  app.classList.remove('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

export function setupLayout() {
  menuButton.addEventListener('click', openNav);
  backdrop.addEventListener('click', closeNav);
  membersButton.addEventListener('click', toggleMembers);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });
}
