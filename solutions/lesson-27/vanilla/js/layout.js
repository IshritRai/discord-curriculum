// Layout toggles: the member list and, on small screens, the channel drawer.

import { state } from './state.js';
import { toggleMembers } from './actions.js';

const app = document.querySelector('.app');
const menuButton = document.querySelector('#menu-button');
const backdrop = document.querySelector('#drawer-backdrop');
const membersButton = document.querySelector('#members-button');

// Same width as the media query in responsive.css
const narrowScreen = window.matchMedia('(max-width: 1000px)');

export function openNav() {
  app.classList.add('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'true');
}

export function closeNav() {
  app.classList.remove('is-nav-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

export function setupLayout() {
  // On narrow screens the member list starts hidden.
  state.showMembers = !narrowScreen.matches;

  menuButton.addEventListener('click', openNav);
  backdrop.addEventListener('click', closeNav);
  membersButton.addEventListener('click', toggleMembers);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  // When the window gets wider, the drawer isn't needed any more.
  narrowScreen.addEventListener('change', () => {
    closeNav();
  });
}
