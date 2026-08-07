import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are running in the browser
env.allowLocalModels = false;

let transcriber = null;

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data;

  if (type === 'load') {
    try {
      if (!transcriber) {
        // Post progress back to the main thread
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
          progress_callback: (info) => {
            self.postMessage({ type: 'progress', info });
          }
        });
      }
      self.postMessage({ type: 'loaded' });
    } catch (err) {
      console.error("Error loading model:", err);
      self.postMessage({ type: 'error', error: err.message });
    }
  } else if (type === 'transcribe') {
    try {
      if (!transcriber) {
        throw new Error('Model not loaded yet');
      }

      // Whisper requires chunk_length_s to pad short audio properly, otherwise it might output empty string
      const output = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: 'english',
        task: 'transcribe'
      });
      
      const text = (Array.isArray(output) ? output[0]?.text : output?.text) || "";
      self.postMessage({ type: 'result', text: text.trim() });
    } catch (err) {
      console.error("Error during transcription:", err);
      self.postMessage({ type: 'error', error: err.message });
    }
  }
});
