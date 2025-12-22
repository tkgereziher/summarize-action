require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest',
  generationConfig: { responseMimeType: 'application/json' }
});

// Simple root page so GET / is friendly
app.get('/', (req, res) => {
  res.send(`<html>
    <head><title>Summarize & Action — Server</title></head>
    <body>
      <h1>Summarize & Action — Server</h1>
      <p>Use <code>POST /summarize</code> with JSON: <code>{"text":"your text here"}</code></p>
    </body>
  </html>`);
});

app.post('/summarize', async (req, res) => {
  const text = req.body.text || '';
  if (!text) return res.status(400).json({ error: 'No text provided' });
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY');
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' });
  }

  try {
    console.log('Received text length:', text.length);
    const prompt = `You are a helpful assistant. Summarize the following text.
    Return a JSON object with this key structure:
    {
      "tl_dr": "A one-sentence summary",
      "bullets": ["Array of 3-5 key points"],
      "actions": ["Array of suggested actions if applicable"]
    }
    
    Text to summarize:
    ${text.slice(0, 30000)} (truncated if too long)
    `;

    console.log('Calling Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('Gemini Response received successfully');
    
    const json = JSON.parse(content);
    res.json(json);
  } catch (err) {
    console.error('Error in /summarize:', err);
    res.status(500).json({ error: 'Error generating summary: ' + err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));