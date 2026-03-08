# Setup & Development Guide

## Prerequisites
- **Node.js (v18+)**
- **npm** (comes with Node.js)
- **Python (v3.10+)** for the AI Agent backend.
- **Google ADK (Agent Development Kit)**
- **Gemini API Key** from Google AI Studio.

## 1. Frontend Setup
1. Open a terminal in the project root: `daisy and fibonacci (1)\daisy and fibonacci`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. The game will be available at: `http://localhost:5173`

## 2. AI Backend Setup (Optional but Required for Full Interrogation)
The game uses a local server to run the AI NPC agents.
1. Install the Google ADK: `pip install google-adk`
2. Set your Google API Key: `export GOOGLE_API_KEY="your_key_here"` (or use a `.env` file).
3. Start the ADK API server from the `npc_agents` directory:
   `adk api_server --port 8000 npc_agents/agent.py`

## 3. Connecting Frontend to Backend
The frontend's `agentService.js` is configured to connect to `http://localhost:8000`. Ensure the ADK server is running on this port for the Interrogation Room to function correctly.

If the ADK server is not running, the game will still load, but the AI interrogation features will be unavailable.
