require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const res = await genAI.listModels();
    res.models.forEach(m => {
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`${m.name}`);
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}
list();
