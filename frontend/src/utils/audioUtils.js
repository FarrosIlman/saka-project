export async function resampleAudio(audioData, originalSampleRate) {
  if (originalSampleRate === 16000) {
    return audioData;
  }
  
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    1, 
    Math.floor(audioData.length * 16000 / originalSampleRate), 
    16000
  );
  
  const buffer = offlineCtx.createBuffer(1, audioData.length, originalSampleRate);
  buffer.getChannelData(0).set(audioData);
  
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  
  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer.getChannelData(0);
}
