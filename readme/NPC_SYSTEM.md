# NPC Agent System (Google ADK)

## AI Architecture
The project's most unique feature is its AI-powered suspects, built using the **Google Agent Development Kit (ADK)** and the **Gemini 2.5 Flash** model.

### 1. The Selector Agent
Located in `npc_agents/agent.py`, the selector agent acts as the main router. When a player chooses a suspect to interrogate, the selector "transfers" the session to that specific NPC's sub-agent.

### 2. NPC Definition (The 5-Section Architecture)
Every NPC agent is defined by a structured instruction set in Python:
1. **WHO YOU ARE:** Character background, role in the case, and current emotional state.
2. **THE TRUTH / THE SECRET:** The core hidden information the NPC is hiding (guilty or not).
3. **HOW YOU SPEAK:** A strict rule banning physical narration (`*pauses*`) in favor of verbal tells (hesitation, jargon, specific phrases).
4. **STATE MACHINE:** Four emotional states: **CALM, DEFENSIVE, AGGRESSIVE, COOPERATIVE.** The AI shifts between these based on the player's interrogation style and presented evidence.
5. **EVIDENCE REACTIONS:** Specific instructions on how the NPC should respond to each named piece of evidence.

### 3. Case-Specific Agents
Agents are organized by case folders in `npc_agents/`:
- **`case_dai_006/`:** Marcus Chen, Father Moretti, Sophie Lin.
- **`case_dai_007/`:** Dr. Diane Park, Kye Harlan, and the "Daisy and Fibonacci" cast.

## Verbal Tells System
Suspects have consistent linguistic patterns that leak their hidden emotions or lies, allowing the player to "read" the suspect through their words alone.
- **Example:** A suspect might use the phrase "I assure you" before every lie.
- **Example:** An innocent but nervous suspect might become unusually brief (sparse) when questioned about their whereabouts.
