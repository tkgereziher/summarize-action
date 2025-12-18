require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
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
    ${text.slice(0, 10000)} (truncated if too long)
    `;

    console.log('Calling OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }, // json_object requires instruction in prompt
    });

    const content = completion.choices[0].message.content;
    console.log('OpenAI Response:', content);
    
    const json = JSON.parse(content);
    res.json(json);
  } catch (err) {
    console.error('Error in /summarize:', err);
    // Print full error details if it's an OpenAI error
    if (err.response) {
      console.error(err.response.status, err.response.data);
    }
    res.status(500).json({ error: 'Error generating summary: ' + err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));