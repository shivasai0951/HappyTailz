const express = require('express');
const upload = require('../middleware/upload');
const OpenAI = require('openai');

const router = express.Router();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY });

router.post('/breed', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const base64 = req.file.buffer.toString('base64');
    const mime = req.file.mimetype || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;

    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify the pet breed. Return just the breed name.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 100
    });

    const breed = (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content)
      ? result.choices[0].message.content.trim()
      : 'Unknown';

    res.json({ breed });
  } catch (err) {
    res.status(500).json({ error: 'AI request failed', message: err.message });
  }
});

module.exports = router;
