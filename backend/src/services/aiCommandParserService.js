'use strict';

const crypto = require('crypto');
const axios = require('axios');

// ─── Environment (read lazily so .env is loaded before access) ────────────────
const getProvider = () => (process.env.AI_SERVICE_PROVIDER || 'gemini').toLowerCase();
const getGeminiKey = () => process.env.GEMINI_API_KEY;
const getOpenAIKey = () => process.env.OPENAI_API_KEY;
const getGroqKey = () => process.env.GROQ_API_KEY;

// ─── In-memory cache ─────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const responseCache = new Map(); // hash → { response, expiresAt }

/**
 * Return SHA-256 hex hash of the command text (used as cache key).
 */
function hashCommand(commandText) {
  return crypto.createHash('sha256').update(commandText).digest('hex');
}

/**
 * Retrieve a cached response if it exists and has not expired.
 * @param {string} hash
 * @returns {object|null}
 */
function getCachedResponse(hash) {
  const entry = responseCache.get(hash);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(hash);
    return null;
  }
  return entry.response;
}

/**
 * Store a response in the cache with a 1-hour TTL.
 * @param {string} hash
 * @param {object} response
 */
function cacheResponse(hash, response) {
  responseCache.set(hash, {
    response,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ─── Prompt template ─────────────────────────────────────────────────────────
function buildPrompt(commandText) {
  return `You are an admin command parser for a hostel management system. Parse the following natural language command into a structured JSON object.

Command: "${commandText}"

Extract the following information:
- action: one of [create_user, update_user, delete_user, deactivate_user, activate_user]
- name: full name (required for create; used as identifier for update/delete/deactivate/activate if no user_id)
- email: email address (required for create; used as identifier for update/delete/deactivate/activate if no user_id)
- role: one of [student, coordinator, warden, security, admin]
- room_number: hostel room (format: A-101, B-205, etc.)
- user_id: numeric user ID (preferred identifier for update/delete/deactivate/activate; use null if not mentioned)

For delete/deactivate/activate/update: provide user_id if mentioned, otherwise provide name or email to look up the user.

Return ONLY valid JSON with no markdown, no explanation:
{
  "action": "...",
  "name": "...",
  "email": "...",
  "role": "...",
  "room_number": "...",
  "user_id": null,
  "confidence": 0-100,
  "parsed_command": "original command text"
}`;
}

// ─── Response normaliser ──────────────────────────────────────────────────────
/**
 * Ensure all required fields are present; fill missing ones with null.
 */
function normaliseResponse(parsed, commandText) {
  const VALID_ACTIONS = [
    'create_user',
    'update_user',
    'delete_user',
    'deactivate_user',
    'activate_user',
  ];

  const action = VALID_ACTIONS.includes(parsed.action) ? parsed.action : null;
  const confidence =
    typeof parsed.confidence === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
      : 0;

  return {
    action: action ?? null,
    name: parsed.name ?? null,
    email: parsed.email ?? null,
    role: parsed.role ?? null,
    room_number: parsed.room_number ?? null,
    user_id: parsed.user_id ?? null,
    confidence,
    parsed_command: parsed.parsed_command ?? commandText,
  };
}

/**
 * Extract JSON from a raw string that may contain markdown fences.
 */
function extractJSON(text) {
  // Strip markdown code fences if present
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  return JSON.parse(stripped);
}

// ─── Provider implementations ─────────────────────────────────────────────────

/**
 * Call Google Gemini API.
 */
async function callGemini(commandText) {
  const GEMINI_API_KEY = getGeminiKey();
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  // Use gemini-1.5-flash (stable, widely available model)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: buildPrompt(commandText) }] }],
  };

  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const text =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');

  return normaliseResponse(extractJSON(text), commandText);
}

/**
 * Call OpenAI Chat Completions API.
 */
async function callOpenAI(commandText) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: buildPrompt(commandText) }],
      temperature: 0,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      timeout: 15000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned an empty response');

  return normaliseResponse(extractJSON(text), commandText);
}

/**
 * Call Groq Chat Completions API.
 */
async function callGroq(commandText) {
  const GROQ_API_KEY = getGroqKey();
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: buildPrompt(commandText) }],
      temperature: 0,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      timeout: 15000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response');

  return normaliseResponse(extractJSON(text), commandText);
}

// ─── Retry + fallback logic ───────────────────────────────────────────────────
const PROVIDER_FN = { gemini: callGemini, openai: callOpenAI, groq: callGroq };
const BACKOFF_DELAYS = [1000, 3000]; // ms — 2 retries max to avoid burning rate limits

/**
 * Call a single provider with up to 3 retries using exponential backoff.
 */
async function callWithRetry(providerName, commandText) {
  const fn = PROVIDER_FN[providerName];
  if (!fn) throw new Error(`Unknown AI provider: ${providerName}`);

  let lastError;
  for (let attempt = 0; attempt <= BACKOFF_DELAYS.length; attempt++) {
    try {
      return await fn(commandText);
    } catch (err) {
      lastError = err;
      if (attempt < BACKOFF_DELAYS.length) {
        await new Promise((resolve) => setTimeout(resolve, BACKOFF_DELAYS[attempt]));
      }
    }
  }
  throw lastError;
}

/**
 * Determine provider fallback order based on the configured primary provider.
 */
function getFallbackOrder(primary) {
  const all = ['gemini', 'openai', 'groq'];
  return [primary, ...all.filter((p) => p !== primary)];
}

/**
 * Route to the configured AI provider with retry + fallback to other providers.
 */
async function callAIService(commandText) {
  const primary = getProvider();
  const order = getFallbackOrder(primary);

  // Only try providers that have keys configured
  const configured = order.filter(p => {
    if (p === 'gemini') return !!getGeminiKey();
    if (p === 'openai') return !!getOpenAIKey();
    if (p === 'groq') return !!getGroqKey();
    return false;
  });

  if (configured.length === 0) {
    throw new Error('No AI provider API keys are configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in .env');
  }

  let lastError;
  for (const provider of configured) {
    try {
      const start = Date.now();
      const result = await callWithRetry(provider, commandText);
      const elapsed = Date.now() - start;
      console.log(`[aiCommandParserService] Provider=${provider} responseTime=${elapsed}ms`);
      return result;
    } catch (err) {
      console.warn(`[aiCommandParserService] Provider=${provider} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a natural language admin command into structured JSON.
 * Checks the in-memory cache first; calls the AI service on a cache miss.
 *
 * @param {string} commandText
 * @returns {Promise<{action, name, email, role, room_number, user_id, confidence, parsed_command}>}
 */
async function parseCommand(commandText) {
  const hash = hashCommand(commandText);

  const cached = getCachedResponse(hash);
  if (cached) {
    console.log(`[aiCommandParserService] Cache hit for command hash=${hash.slice(0, 8)}…`);
    return cached;
  }

  const result = await callAIService(commandText);
  cacheResponse(hash, result);
  return result;
}

module.exports = {
  parseCommand,
  callAIService,
  callGemini,
  callOpenAI,
  callGroq,
  getCachedResponse,
  cacheResponse,
  clearCache: () => responseCache.clear(),
  // exported for testing
  hashCommand,
  normaliseResponse,
  extractJSON,
};
