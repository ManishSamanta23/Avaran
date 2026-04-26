const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function generateFraudRiskInsight(payload) {
  if (!GEMINI_API_KEY) return null;

  const prompt = [
    'You are a fraud-risk analyst for insurance claims.',
    'Given the structured input below, return JSON only with no markdown:',
    '{"riskSummary":"string","reviewNotes":["string","string"],"recommendation":"string"}',
    'Keep riskSummary under 25 words and each review note under 20 words.',
    '',
    `Input: ${JSON.stringify(payload)}`
  ].join('\n');

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 220,
          responseMimeType: 'application/json'
        }
      },
      {
        timeout: 5000
      }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = safeJsonParse(rawText);
    if (!parsed) return null;

    return {
      model: GEMINI_MODEL,
      riskSummary: parsed.riskSummary || 'AI insight generated',
      reviewNotes: Array.isArray(parsed.reviewNotes) ? parsed.reviewNotes.slice(0, 3) : [],
      recommendation: parsed.recommendation || 'Manual review recommended',
      generatedAt: new Date()
    };
  } catch (err) {
    console.error('Gemini insight generation failed:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { generateFraudRiskInsight };
