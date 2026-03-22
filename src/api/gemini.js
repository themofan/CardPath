import { buildSystemPrompt } from './aiPromptBuilder';

const PROXY_URL = '/api/gemini';
const GROQ_DIRECT_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function groqRequest(messages, { maxTokens = 1024, temperature = 0.7 } = {}) {
  const isDevWithKey = import.meta.env.DEV && import.meta.env.VITE_GROQ_API_KEY;

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  const response = isDevWithKey
    ? await fetch(GROQ_DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      })
    : await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  return response.json();
}

/**
 * Send a message to Groq and get a response
 */
export async function askGemini(userMessage) {
  try {
    const data = await groqRequest([
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: userMessage },
    ]);

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

/**
 * Send a message and parse the response as JSON
 */
export async function askGeminiJSON(userMessage) {
  try {
    const data = await groqRequest(
      [{ role: 'user', content: userMessage }],
      { maxTokens: 512, temperature: 0.3 }
    );

    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Groq JSON API error:', error);
    throw error;
  }
}

/**
 * Multi-turn chat (no function calling — Groq doesn't support Gemini-style tools)
 * Convert Gemini-format messages to OpenAI-format
 */
export async function chatWithTools(geminiMessages, tools) {
  try {
    // Convert Gemini message format to OpenAI format
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
    ];

    for (const msg of geminiMessages) {
      if (msg.role === 'user') {
        const text = msg.parts.map(p => p.text || '').join('');
        messages.push({ role: 'user', content: text });
      } else if (msg.role === 'model') {
        const text = msg.parts.map(p => p.text || '').join('');
        messages.push({ role: 'assistant', content: text });
      } else if (msg.role === 'function') {
        // Include function results as assistant context
        const results = msg.parts.map(p => {
          if (p.functionResponse) {
            return `[Tool result for ${p.functionResponse.name}: ${JSON.stringify(p.functionResponse.response)}]`;
          }
          return '';
        }).join('');
        messages.push({ role: 'assistant', content: results });
      }
    }

    const data = await groqRequest(messages);
    const content = data.choices[0].message.content;

    // Return in Gemini-compatible format so the rest of the app works
    return {
      parts: [{ text: content }],
    };
  } catch (error) {
    console.error('Groq chat API error:', error);
    throw error;
  }
}

/**
 * Check if API is configured
 */
export function isAPIConfigured() {
  if (!import.meta.env.DEV) return true;
  const key = import.meta.env.VITE_GROQ_API_KEY || '';
  return key.length > 0;
}
