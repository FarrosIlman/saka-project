const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const fs = require('fs');
const os = require('os');

const router = express.Router();
const upload = multer({ dest: os.tmpdir() }); // Store temp file in OS temp dir

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }

    // Read the temp file using fs stream
    const fileStream = fs.createReadStream(req.file.path);
    
    // Initialize Groq SDK (Make sure GROQ_API_KEY is in .env)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const transcription = await groq.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-large-v3", // or whisper-large-v3-turbo
      prompt: "",
      response_format: "json",
      language: "en",
      temperature: 0.0
    });

    // Clean up temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp audio file:", err);
    });

    res.json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('Groq Transcription Error:', error);
    // Clean up on error too
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, message: 'Error transcribing audio', error: error.message });
  }
});

module.exports = router;
