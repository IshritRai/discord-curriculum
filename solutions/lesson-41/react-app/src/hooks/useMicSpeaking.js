import { useEffect } from 'react';
import { startMic, stopMic } from '../lib/mic.js';

// While `enabled` is true, listens to your microphone (locally, nothing is sent
// anywhere) and calls onSpeakingChange(true/false). Turning it off, or the component
// disappearing, stops the microphone.
export function useMicSpeaking(enabled, onSpeakingChange, onError) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    startMic(onSpeakingChange).catch(onError);
    return () => {
      stopMic();
      onSpeakingChange(false);
    };
    // Only `enabled` is listed: the callbacks are new functions on every render,
    // and we don't want to restart the microphone each time.
  }, [enabled]);
}
