export async function decodeAudioBuffer(blob) {
  // Read blob as array buffer
  const arrayBuffer = await blob.arrayBuffer();
  
  // Use OfflineAudioContext or AudioContext to decode and resample
  // Whisper models usually require 16000 Hz, mono
  const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Whisper requires a Float32Array containing the audio samples
  let audioData;
  if (audioBuffer.numberOfChannels === 2) {
    // If stereo, convert to mono by averaging the two channels
    const SCALING_FACTOR = Math.sqrt(2);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const length = left.length;
    audioData = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
      audioData[i] = (left[i] + right[i]) / 2;
    }
  } else {
    // If already mono, just get the data
    audioData = audioBuffer.getChannelData(0);
  }
  
  return audioData;
}
