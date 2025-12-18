const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/summarize', async (req, res) => {
  const text = req.body.text || '';
  if (!text) return res.status(400).json({ error: 'No text provided' });

  // TODO: Replace this stub with a real LLM call (OpenAI, Anthropic, etc.)
  // Keep API keys in environment variables (process.env.OPENAI_KEY etc.)
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

  // Simulate async LLM latency
  await new Promise(r => setTimeout(r, 400));
  res.json(stubResponse);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));