require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testNewSDK() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    console.log('Testing @google/genai SDK...');
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello",
    });
    console.log('Response:', response.text);
  } catch (err) {
    console.error('New SDK Test Failed:', err);
  }
}

testNewSDK();
