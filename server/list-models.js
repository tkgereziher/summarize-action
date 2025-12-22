require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const list = await genAI.listModels();
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    console.error('LIST FAILED', e.message);
  }
}
run();
