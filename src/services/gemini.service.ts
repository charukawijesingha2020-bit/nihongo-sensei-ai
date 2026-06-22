/**
 * src/services/gemini.service.ts
 * Gemini service wrapper using @google/generative-ai
 *
 * - Reads API key from environment (GEMINI_API_KEY or GOOGLE_API_KEY)
 * - Exports async generateResponse(prompt: string): Promise<string>
 * - Uses latest Gemini model by default (can be overridden with GEMINI_MODEL)
 * - Proper try/catch error handling
 * - TypeScript compatible
 */

import {TextServiceClient} from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5'; // override via env if needed

if (!API_KEY) {
  throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.');
}

// Create a single client instance to reuse across requests
const client = new TextServiceClient({ apiKey: API_KEY } as any);

/**
 * generateResponse
 * Send a prompt to Gemini and return the text output.
 * @param prompt - user prompt string
 * @returns AI response text
 */
export async function generateResponse(prompt: string): Promise<string> {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt must be a non-empty string.');
  }

  try {
    const request = {
      model: MODEL,
      input: prompt,
      // Add options like temperature, maxOutputTokens here if needed
    } as any;

    // Preferred method name is generate; adapt if your client version differs
    const res = await (client as any).generate?.(request) ?? await (client as any).predict?.(request) ?? await (client as any).create?.(request);

    // Attempt to extract text from several possible response shapes
    let text = '';

    if (!res) {
      throw new Error('No response from Gemini client');
    }

    if (typeof res === 'string') {
      text = res;
    } else if (res?.data?.[0]?.content) {
      text = res.data[0].content;
    } else if (res?.output?.[0]?.content) {
      text = res.output[0].content;
    } else if (res?.content) {
      text = res.content;
    } else if (res?.results?.[0]?.output) {
      const out = res.results[0].output;
      if (Array.isArray(out)) {
        text = out.map((o: any) => o.text || o.content || '').join('');
      } else {
        text = out.text || out.content || '';
      }
    } else if (res?.candidates?.[0]?.content) {
      text = res.candidates[0].content;
    }

    text = (text ?? '').toString();

    if (!text) {
      throw new Error('Empty response from Gemini. Raw response: ' + JSON.stringify(res));
    }

    return text;
  } catch (err) {
    console.error('[gemini] generateResponse error:', err);
    throw new Error(`Gemini generate error: ${(err as Error)?.message || String(err)}`);
  }
}

export default generateResponse;
