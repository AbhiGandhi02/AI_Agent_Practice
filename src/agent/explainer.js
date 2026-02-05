const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Explainer:
 * Turns raw tool data into business insights
 */
async function explainResults(question, intent, data) {
  const systemPrompt = `
You are a senior data analyst.

Rules:
- Use ONLY the provided data
- Do NOT invent numbers
- Do NOT assume missing data
- Explain insights clearly and concisely
- Write in business-friendly language
- If data is insufficient, say so

Return a clear analytical explanation.
`;

  const userPrompt = `
User Question:
"${question}"

Intent:
${intent}

Tool Output Data (JSON):
${JSON.stringify(data, null, 2)}

Explain the answer.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2
    }
  });

  return result.response.text();
}

module.exports = { explainResults };
