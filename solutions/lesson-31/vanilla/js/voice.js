// Voice: who is speaking right now. Speaking changes many times per second,
// so instead of re-rendering everything we only flip one class on the right elements.

import { state, getChannels, CURRENT_USER_ID } from './state.js';
import { leaveVoice } from './actions.js';
import { startMic, stopMic } from './mic.js';

const profileButton = document.querySelector('#user-panel-profile');
const disconnectButton = document.querySelector('#disconnect-button');
const micToggle = document.querySelector('#mic-toggle');
const micToggleText = document.querySelector('#mic-toggle-text');

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

// Turns your own speaking light on or off (used by the optional mic feature).
export function setMySpeaking(isSpeaking) {
  const others = state.speakingUserIds.filter((id) => id !== CURRENT_USER_ID);
  const canSpeak = state.voice.channelId !== null && !state.voice.muted;
  state.speakingUserIds = isSpeaking && canSpeak ? [...others, CURRENT_USER_ID] : others;
  renderSpeaking();
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
    // Your own light is controlled by your mic, not by chance (and muting turns it off).
    const canSpeak = state.voice.channelId !== null && !state.voice.muted;
    if (state.speakingUserIds.includes(CURRENT_USER_ID) && canSpeak) {
      speaking.push(CURRENT_USER_ID);
    }
    state.speakingUserIds = speaking;
    renderSpeaking();
  }, 400);
}

function turnMicOff() {
  stopMic();
  micToggle.checked = false;
  setMySpeaking(false);
}

export function setupVoice() {
  disconnectButton.addEventListener('click', () => {
    turnMicOff();
    leaveVoice();
  });

  micToggle.addEventListener('change', async () => {
    if (!micToggle.checked) {
      turnMicOff();
      return;
    }
    try {
      await startMic(setMySpeaking);
      micToggleText.textContent = 'Using my mic (stays on this device)';
    } catch (error) {
      console.warn('Microphone not available:', error);
      turnMicOff();
      micToggleText.textContent = 'Mic blocked: check the browser permission';
    }
  });
}
