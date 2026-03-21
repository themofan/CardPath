import { buildSystemPrompt } from './aiPromptBuilder';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

/**
 * Send a message to Gemini API and get a response
 */
export async function askGemini(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt() }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Send a message to Gemini and parse the response as JSON
 */
export async function askGeminiJSON(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Extract JSON from response (handles markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini JSON API error:', error);
    throw error;
  }
}

/**
 * Multi-turn chat with function calling support.
 * @param {Array} messages - Gemini-format conversation history: [{ role: 'user'|'model'|'function', parts: [...] }]
 * @param {Array} tools - Gemini tool definitions: [{ functionDeclarations: [...] }]
 * @returns {object} The response candidate's content: { parts: [...] } where parts may contain text or functionCall
 */
export async function chatWithTools(messages, tools) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt() }],
        },
        contents: messages,
        tools,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.candidates[0].content;
  } catch (error) {
    console.error('Gemini chat API error:', error);
    throw error;
  }
}

/**
 * Check if API key is configured
 */
export function isAPIConfigured() {
  return API_KEY && API_KEY.length > 0 && !API_KEY.startsWith('YOUR_');
}
