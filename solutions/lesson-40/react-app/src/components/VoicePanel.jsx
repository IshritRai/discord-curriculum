import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findChannel, findServerOfChannel } from '../state/selectors.js';
import { useMicSpeaking } from '../hooks/useMicSpeaking.js';
import { Icon } from './Icon.jsx';

// The "Voice Connected" panel, shown while you're in a voice channel.
export function VoicePanel() {
  const { state, dispatch, getState } = useApp();
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState(false);
  const channelId = state.voice.channelId;

  useMicSpeaking(
    micOn && channelId !== null,
    (isSpeaking) => {
      const current = getState();
      const others = current.speakingUserIds.filter((id) => id !== CURRENT_USER_ID);
      const canSpeak = current.voice.channelId !== null && !current.voice.muted;
      dispatch({ type: 'setSpeaking', userIds: isSpeaking && canSpeak ? [...others, CURRENT_USER_ID] : others });
    },
    (error) => {
      console.warn('Microphone not available:', error);
      setMicOn(false);
      setMicError(true);
    },
  );

  const channel = channelId && findChannel(state, channelId);
  const server = channelId && findServerOfChannel(state, channelId);

  function disconnect() {
    setMicOn(false);
    dispatch({ type: 'leaveVoice' });
  }

  let micLabel = 'Light up when I talk (uses my mic)';
  if (micOn) {
    micLabel = 'Using my mic (stays on this device)';
  } else if (micError) {
    micLabel = 'Mic blocked: check the browser permission';
  }

  return (
    // Always on the page, but hidden while you're not connected
    <section className="voice-panel" id="voice-panel" aria-label="Voice connection" hidden={channelId === null}>
      <div className="voice-panel-info">
        <p className="voice-panel-status">
          <Icon name="signal" />
          Voice Connected
        </p>
        <p className="voice-panel-channel" id="voice-panel-channel">
          {channel && `${channel.name} / ${server.name}`}
        </p>
        <label className="mic-toggle">
          <input type="checkbox" id="mic-toggle" checked={micOn} onChange={(event) => setMicOn(event.target.checked)} />
          <span>{micLabel}</span>
        </label>
      </div>
      <button className="icon-button" type="button" id="disconnect-button" data-tooltip="Disconnect" aria-label="Disconnect" onClick={disconnect}>
        <Icon name="disconnect" />
      </button>
    </section>
  );
}
