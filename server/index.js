const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple root page so GET / is friendly
app.get('/', (req, res) => {
  res.send(`<html>
    <head><title>Summarize & Action — Server</title></head>
    <body>
      <h1>Summarize & Action — Server</h1>
      <p>Use <code>POST /summarize</code> with JSON: <code>{"text":"your text here"}</code></p>
      <p>Example: <code>curl -X POST -H "Content-Type: application/json" -d '{"text":"Hello"}' http://localhost:3000/summarize</code></p>
    </body>
  </html>`);
});

app.post('/summarize', async (req, res) => {
  const text = req.body.text || '';
  if (!text) return res.status(400).json({ error: 'No text provided' });

  // TODO: Replace this stub with a real LLM call (OpenAI, Anthropic, etc.)
  const stubResponse = {
    tl_dr: text.split('\n').slice(0, 2).join(' ').slice(0, 300) + '…',
    bullets: [
      'Key point 1 (stub)',
      'Key point 2 (stub)',
      'Key point 3 (stub)'
    ],
    actions: [
      'Create a short GitHub issue describing the problem.',
      'Save this summary to your notes.'
    ]
  };

  try {
    // Simulate async LLM latency
    await new Promise(r => setTimeout(r, 400));
    res.json(stubResponse);
  } catch (err) {
    console.error('Error in /summarize:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));