# Frontend Architecture & Structure

## Entry Points
- **`App.jsx`:** The primary entry point for the "Midnight Curator" case.
- **`DaisyApp.jsx`:** The entry point for the "Daisy and Fibonacci" case.

## Scene Management
The game uses a `scene` state variable to manage navigation between different game screens.
- **Prologue:** Introduction and narrative setup.
- **DetectiveRoom:** Central hub for case files and choosing suspects.
- **InterrogationRoom:** Interface for AI-powered dialogue.
- **EvidenceBoard:** Visual repository for collected clues.
- **DeductionBoard:** Interactive board for linking evidence and suspects.

## Core Components (`src/`)
- **`InterrogationRoom.jsx`:** Manages the chat interface, sends user input to the agent service, and renders NPC responses.
- **`DeductionBoard.jsx`:** A complex state-managed board for detective work.
- **`agentService.js`:** A utility that communicates with the local ADK server (`localhost:8000`) using the Fetch API to manage AI sessions.

## Styling and Assets
- Each major component has a corresponding `.css` file for modular styling.
- **`public/`:** Contains static assets.
    - `audio/`: Background music and sound effects.
    - `evidence/`: High-resolution imagery for investigation.
    - `images/`: Suspect portraits and UI icons.
    - `scenes/`: Background artwork for different game locations.
