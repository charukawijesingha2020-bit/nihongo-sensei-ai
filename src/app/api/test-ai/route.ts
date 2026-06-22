/**
 * src/app/api/test-ai/route.ts
 * Test AI endpoint for Next.js App Router
 *
 * - POST { prompt: string } -> { text: string }
 * - Uses generateResponse from src/services/gemini.service
 * - TypeScript compatible, with try/catch error handling
 */

import generateResponse from '../../../services/gemini.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body === 'string' ? body : body?.prompt;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Missing or invalid "prompt" in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = await generateResponse(prompt);

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/test-ai] error:', err);
    const message = (err as Error)?.message || String(err);
    return new Response(JSON.stringify({ error: 'AI service error', detail: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, message: 'test-ai endpoint' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
