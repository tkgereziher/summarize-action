require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro'
  });

  const prompt = `Hello`;
  
  try {
    console.log('Testing Gemini Pro...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Success!', response.text());
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

testGemini();
