require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-3-pro-preview'];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      const res = await result.response;
      console.log(`${m}: SUCCESS - ${res.text()}`);
      break; // Stop at first success
    } catch (err) {
      console.log(`${m}: FAILED - ${err.message}`);
    }
  }
}
test();
