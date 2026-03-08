/**
 * agentService.js
 * Connects InterrogationRoom.jsx to the local Google ADK agent server.
 *
 * ADK server must be running:  adk api_server --port 8000
 * Falls back to scripted dialogue automatically when the server is offline.
 */

const BASE_URL = 'http://localhost:8000';
const USER_ID  = 'uid_4578';

/** Generates a unique session ID per NPC per page load */
const generateSessionId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Creates (or re-uses) a session for the given agent.
 * Returns the session ID string on success, null on failure.
 * InterrogationRoom treats null as "server offline → use fallback".
 *
 * Agents that don't have a Python file yet (e.g. 'dsouza', 'mary')
 * will naturally fail here and drop into fallback mode.
 */
export async function createSession(agentName) {
  try {
    const sessionId = generateSessionId();
    const url = `${BASE_URL}/apps/${agentName}/users/${USER_ID}/sessions/${sessionId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key1: 'value1', key2: 42 }),
    });
    if (!response.ok) return null;
    await response.json(); // consume / validate response body
    return sessionId;
  } catch {
    // Server is offline or agent doesn't exist yet → trigger fallback
    return null;
  }
}

/**
 * sends a message to an agent and returns the text reply.
 * Returns null on any error so InterrogationRoom falls back to scripted dialogue.
 *
 * ADK may return a "thinking" part before the actual text part.
 * We use find() to grab the first part that contains text.
 */
export async function sendMessage(agentName, sessionId, message) {
  try {
    const payload = {
      appName: agentName,
      userId: USER_ID,
      sessionId: sessionId,
      newMessage: {
        role: 'user',
        parts: [{ text: message }],
      },
    };

    const response = await fetch(`${BASE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.length) return null;

    const parts = data[0]?.content?.parts;
    if (!parts || !parts.length) return null;

    // ADK sometimes prepends a thinking/tool part — find the actual text
    const text = parts.find(p => typeof p.text === 'string' && p.text.trim())?.text ?? null;
    return text;
  } catch {
    return null;
  }
}
