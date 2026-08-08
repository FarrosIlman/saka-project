const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const { toFile } = require('groq-sdk');

const router = express.Router();
// Use memory storage for Vercel serverless compatibility (no disk writes)
const upload = multer({ storage: multer.memoryStorage() }); 

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }

    // Initialize Groq SDK with automatic retries for Rate Limiting
    const groq = new Groq({ 
      apiKey: process.env.GROQ_API_KEY,
      maxRetries: 5, // Automatically wait and retry up to 5 times if >20 students submit at once
    });
    
    // Convert Buffer to a File object compatible with Groq API
    const audioFile = await toFile(req.file.buffer, 'audio.wav', { type: 'audio/wav' });
    
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      prompt: "",
      response_format: "json",
      language: "en",
      temperature: 0.0
    });

    res.json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('Groq Transcription Error:', error);
    res.status(500).json({ success: false, message: 'Error transcribing audio', error: error.message });
  }
});

module.exports = router;
