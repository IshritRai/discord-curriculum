// The user panel (bottom left) and the "Voice Connected" panel above it.

import { state, getCurrentUser, findChannel, findServerOfChannel, CURRENT_USER_ID } from './state.js';
import { toggleMute, toggleDeafen } from './actions.js';
import { avatar } from './dom.js';
import { openProfile } from './modals.js';

const profileButton = document.querySelector('#user-panel-profile');
const nameElement = document.querySelector('#user-panel-name');
const tagElement = document.querySelector('#user-panel-tag');
const muteButton = document.querySelector('#mute-button');
const deafenButton = document.querySelector('#deafen-button');
const voicePanel = document.querySelector('#voice-panel');
const voicePanelChannel = document.querySelector('#voice-panel-channel');

function setToggle(button, pressed, iconName, label) {
  button.setAttribute('aria-pressed', String(pressed));
  button.setAttribute('aria-label', label);
  button.dataset.tooltip = label;
  button.querySelector('use').setAttribute('href', `assets/icons.svg#${iconName}`);
}

export function renderUserPanel() {
  const me = getCurrentUser();
  const userAvatar = avatar(me, true);
  userAvatar.id = 'user-panel-avatar';
  document.querySelector('#user-panel-avatar').replaceWith(userAvatar);
  nameElement.textContent = me.displayName;
  tagElement.textContent = me.customStatus || me.username;

  const muted = state.voice.muted;
  const deafened = state.voice.deafened;
  const channelId = state.voice.channelId;
  setToggle(muteButton, muted, muted ? 'mic-off' : 'mic', muted ? 'Unmute' : 'Mute');
  setToggle(deafenButton, deafened, deafened ? 'headphones-off' : 'headphones', deafened ? 'Undeafen' : 'Deafen');

  voicePanel.hidden = channelId === null;
  if (channelId !== null) {
    const channel = findChannel(channelId);
    const server = findServerOfChannel(channelId);
    voicePanelChannel.textContent = `${channel.name} / ${server.name}`;
  }
}

export function setupUserPanel() {
  profileButton.addEventListener('click', () => openProfile(CURRENT_USER_ID));
  muteButton.addEventListener('click', toggleMute);
  deafenButton.addEventListener('click', toggleDeafen);
}
