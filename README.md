# Summarize & Action — Browser Extension (MVP)

A small browser extension that summarizes selected text and returns:
- a 2–3 line TL;DR
- 3 bullets of key points
- 1–2 suggested next actions

This repository contains:
- extension/ — Chrome/Edge Manifest V3 extension (popup + content)
- server/ — minimal Node/Express backend that receives text and returns JSON

MVP setup (local)
1. Clone the repo.
2. Start the server:
   - cd server
   - npm install
   - npm run start
3. Load the extension in your browser (developer mode):
   - Open Extensions > Load unpacked > select the `extension/` folder.
4. Select text on a page, open the extension popup, paste or use the selected text, and click Summarize.

Notes
- The server contains a stubbed summarize endpoint. Replace the /summarize handler with an actual LLM API call (OpenAI, Anthropic, etc.) and store API keys in environment variables.
- See the LICENSE and .gitignore files for basic settings.