const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let supportedModel = null;

async function resolveModel() {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
  const res = await axios.get(url);
  const models = res.data.models || [];
  const pick = models.find(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'));
  if (!pick) throw new Error('No Gemini model supports generateContent for this key');
  return pick.name; 
}

async function generateText(prompt) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!supportedModel) supportedModel = await resolveModel();
  const url = `https://generativelanguage.googleapis.com/v1/${supportedModel}:generateContent?key=${GEMINI_API_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
  const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

module.exports = { generateText };
