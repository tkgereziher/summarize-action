require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.list();
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('Error:', err.message);
  }
}
list();
