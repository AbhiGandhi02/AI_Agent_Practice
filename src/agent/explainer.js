const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}

module.exports = { explainResults };
