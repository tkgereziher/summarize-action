require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function listAll() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    console.log('Models found:', models.length);
    models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error('List Failed:', err);
  }
}

listAll();
