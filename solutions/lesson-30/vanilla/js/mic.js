// OPTIONAL (Lesson 30): light up YOUR speaking indicator using your microphone.
//
// Privacy: the sound stays inside this browser tab. We only measure how loud it
// is, many times per second. Nothing is recorded, saved, played back or sent anywhere.

const LOUDNESS_THRESHOLD = 0.02; // raise this if background noise lights you up
const HOLD_TIME = 300; // ms to stay "speaking" after the last loud moment

let stream = null;
let audioContext = null;
let frameId = null;

export function isMicOn() {
  return stream !== null;
}

// Asks for the mic, then calls onSpeakingChange(true/false) whenever you start or stop talking.
export async function startMic(onSpeakingChange) {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  // The analyser is NOT connected to the speakers, so you won't hear yourself.
  source.connect(analyser);

  const samples = new Float32Array(analyser.fftSize);
  let speaking = false;
  let lastLoudTime = 0;

  function measure() {
    analyser.getFloatTimeDomainData(samples); // the latest sound wave, values from -1 to 1
    let sumOfSquares = 0;
    for (const sample of samples) {
      sumOfSquares += sample * sample;
    }
    const loudness = Math.sqrt(sumOfSquares / samples.length); // "root mean square"

    const now = performance.now();
    if (loudness > LOUDNESS_THRESHOLD) {
      lastLoudTime = now;
    }
    const isSpeakingNow = now - lastLoudTime < HOLD_TIME;
    if (isSpeakingNow !== speaking) {
      speaking = isSpeakingNow;
      onSpeakingChange(speaking);
    }
    frameId = requestAnimationFrame(measure);
  }
  measure();
}

export function stopMic() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
  }
  if (stream !== null) {
    for (const track of stream.getTracks()) {
      track.stop(); // this turns off the browser's "recording" indicator
    }
  }
  if (audioContext !== null) {
    audioContext.close();
  }
  stream = null;
  audioContext = null;
  frameId = null;
}
