// Voice: who is speaking right now. Speaking changes many times per second,
// so instead of re-rendering everything we only flip one class on the right elements.

import { state, getChannels, CURRENT_USER_ID } from './state.js';
import { leaveVoice } from './actions.js';

const profileButton = document.querySelector('#user-panel-profile');
const disconnectButton = document.querySelector('#disconnect-button');

export function renderSpeaking() {
  for (const item of document.querySelectorAll('.voice-user')) {
    item.classList.toggle('is-speaking', state.speakingUserIds.includes(item.dataset.userId));
  }
  profileButton.classList.toggle('is-speaking', state.speakingUserIds.includes(CURRENT_USER_ID));
}

// Everyone (except you) who is sitting in a voice channel somewhere.
function peopleInVoice() {
  const ids = [];
  for (const server of state.servers) {
    for (const channel of getChannels(server)) {
      if (channel.type === 'voice') {
        ids.push(...channel.voiceUserIds);
      }
    }
  }
  return ids;
}

// Fake speaking: every 400 ms, each person may start or stop talking.
export function startSpeakingSimulation() {
  setInterval(() => {
    const speaking = [];
    for (const userId of peopleInVoice()) {
      const wasSpeaking = state.speakingUserIds.includes(userId);
      const chance = wasSpeaking ? 0.75 : 0.25; // keep talking, or start talking
      if (Math.random() < chance) {
        speaking.push(userId);
      }
    }
    state.speakingUserIds = speaking;
    renderSpeaking();
  }, 400);
}

export function setupVoice() {
  disconnectButton.addEventListener('click', leaveVoice);
}
