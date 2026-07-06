# StadiumPulse AI 🏟️⚡

**"One AI brain for every gate, every fan, every decision."**

StadiumPulse AI is a competition-grade submission for **Google Prompt Wars — Challenge 4: Smart Stadiums & Tournament Operations** (FIFA World Cup 2026 theme).

It is a comprehensive, live, AI-driven command layer for stadium operations, featuring three distinct user portals powered by the **Google Gemini API** over a simulated live stadium state engine.

## 🌟 Flagship Features & Judging Criteria Mapping

### 1. AI Navigation & Wayfinding (Fan Portal)
*   **Feature**: "Ask Pulse" chatbot + Live SVG Map.
*   **GenAI Depth**: Instead of static directions, Gemini reasons over a live JSON state stream of crowd densities to recommend the fastest, safest paths. It supports multiple languages natively and has an Accessibility Mode that biases routing toward step-free paths.
*   **Impact**: Enhances the fan experience by reducing confusion and wait times, catering to global fans and those with mobility needs.

### 2. AI Crowd Management (Fan + Ops Portals)
*   **Feature**: Live Crowd Simulation Engine + GenAI Advisories.
*   **GenAI Depth**: A backend simulation engine fluctuates zone occupancies. Gemini continuously analyzes this state to generate plain-language fan advisories ("Gate D is congested...") and risk-ranked staff alerts with suggested actions.
*   **Impact**: Proactive crowd management prevents dangerous crushes and optimizes stadium flow in real-time.

### 3. AI Operational Intelligence (Ops & Volunteer Portals)
*   **Feature**: Command Center, Volunteer Logging, Incident Triage, What-If Simulator, Shift Reports.
*   **GenAI Depth**:
    *   **Triage**: Volunteers log observations in natural language; Gemini structures, prioritizes, and categorizes them automatically.
    *   **What-If Simulator**: Ops staff can ask hypothetical questions ("What if we close Gate B?"), and Gemini projects the outcome based on the live simulation state.
    *   **Shift Reports**: One-click generation of a formatted markdown handover report summarizing all AI-triaged incidents and crowd flow data.
*   **Impact**: Massively reduces cognitive load on staff, ensuring fast response times and professional documentation.

---

## 🏗️ Technical Architecture

*   **Frontend**: Next.js (App Router), React, Tailwind CSS v4, Framer Motion, Lucide Icons.
*   **Backend**: Next.js API Routes (Serverless/Node).
*   **Real-time**: Server-Sent Events (SSE) streaming live state to clients.
*   **Simulation Engine**: A stateful in-memory loop (`src/lib/simulation/engine.ts`) that models stadium zones and fluctuates density data.
*   **Database**: SQLite via Prisma ORM for persisting incidents and chat logs.
*   **Generative AI**: `@google/genai` (Gemini 2.5 Flash) heavily utilizing `responseSchema` (Structured Output) to ensure deterministic, UI-renderable data alongside natural language narratives.

---

## 🚀 Setup & Run Instructions

### Prerequisites
*   Node.js 18+
*   npm

### Installation

1.  **Clone the repo and install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy the sample env file:
    ```bash
    cp .env.example .env
    ```
    Add your Gemini API Key in `.env`:
    ```env
    GEMINI_API_KEY="your_api_key_here"
    ```

3.  **Initialize the Database:**
    ```bash
    npx prisma db push
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the Application:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the Role Switcher Landing Page.

---

## 🎬 3-Minute Demo Script

1.  **Start at the Landing Page (http://localhost:3000)**
    *   *Say:* "Welcome to StadiumPulse AI. We've built three distinct portals: one for Fans, one for Volunteers, and one for Ops Command."
2.  **Fan Portal**
    *   *Action:* Click "Fan Experience".
    *   *Say:* "Here's the live stadium map. The colors indicate real-time crowd density driven by our backend simulation. Let's ask Pulse for directions."
    *   *Action:* Type in Ask Pulse: *"I'm at Gate A, I need food but don't want a long line."*
    *   *Say:* "Gemini reads the live state and routes us to the least congested concession stand, highlighting the path on the map."
    *   *Action:* Toggle Accessibility mode and ask for directions. "Notice how it reroutes using elevators."
3.  **Volunteer Portal**
    *   *Action:* Open a new tab to http://localhost:3000, click "Volunteer Assist".
    *   *Say:* "Volunteers don't need complex forms. They just describe what they see."
    *   *Action:* Type *"There's a massive spill near Gate B, people are slipping."* and Submit.
    *   *Say:* "Gemini automatically triages this into a structured, high-priority safety incident."
4.  **Ops Command Center**
    *   *Action:* Open a new tab to http://localhost:3000, click "Ops Command".
    *   *Say:* "This is the brain. We see the live heatmap and the incoming incident feed. Notice the spill the volunteer just reported is already triaged with an AI action plan."
    *   *Action:* Scroll to the What-If Simulator. Click "Trigger Halftime Rush".
    *   *Say:* "Let's simulate halftime. Watch the map density change." (Map flashes red in concourses/concessions).
    *   *Action:* Type in the What-If Simulator: *"What happens if we close the East Food Court right now?"* and hit Simulate.
    *   *Say:* "Gemini projects the cascading impact on the rest of the stadium."
    *   *Action:* Click "Generate Shift Report" at the top right.
    *   *Say:* "Finally, at the end of the night, one click generates a complete, formatted markdown debrief of all incidents and crowd flows, ready for export."
