import { useEffect } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, peopleInVoice } from '../state/selectors.js';

// Fake speaking: every 400 ms, each person in a voice channel may start or stop talking.
export function useSpeakingSimulation() {
  const { dispatch, getState } = useApp();
  useEffect(() => {
    const timer = setInterval(() => {
      const state = getState();
      const speaking = [];
      for (const userId of peopleInVoice(state)) {
        const wasSpeaking = state.speakingUserIds.includes(userId);
        if (Math.random() < (wasSpeaking ? 0.75 : 0.25)) {
          speaking.push(userId);
        }
      }
      // Your own light is controlled by your mic, not by chance (and muting turns it off).
      const canSpeak = state.voice.channelId !== null && !state.voice.muted;
      if (state.speakingUserIds.includes(CURRENT_USER_ID) && canSpeak) {
        speaking.push(CURRENT_USER_ID);
      }
      dispatch({ type: 'setSpeaking', userIds: speaking });
    }, 400);
    return () => clearInterval(timer);
  }, [dispatch, getState]);
}
