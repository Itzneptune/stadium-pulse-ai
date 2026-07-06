# StadiumPulse AI 🏟️⚡

**StadiumPulse AI** is a competition-grade submission for the **Google Prompt Wars — Challenge 4: Smart Stadiums & Tournament Operations**, built around the theme of the **FIFA World Cup 2026**.

## 1. Chosen Vertical
**Vertical:** Smart Stadiums & Tournament Operations (Fan Experience, Operational Intelligence, & Volunteer Management).

This project focuses on the complex, chaotic ecosystem of a massive sporting event. When 80,000 fans, 5,000 volunteers, and hundreds of operations staff converge, standard software fails. StadiumPulse AI acts as a central nervous system, connecting these three personas into a single, real-time intelligence layer powered by Google Gemini.

## 2. Approach and Logic
The logic of StadiumPulse AI revolves around **Persona-Driven AI**. Rather than building one generic dashboard, the Gemini API is contextualized for three distinct users:
1. **The Fan:** Needs immediate, low-friction answers. We use Gemini to power **AskPulse**, a mobile-first concierge that parses natural language ("Where's the closest food to Gate B?") and returns accessible, visual routing.
2. **The Volunteer:** Needs to act quickly without navigating complex forms. We built a hyper-utilitarian reporting tool where volunteers simply type or speak what they see ("Spill near East Concourse").
3. **The Ops Staff:** Needs high-level synthesis and predictive power. We use Gemini's structured outputs to automatically triage incoming volunteer reports (assigning priority and action plans), and a **What-If Simulator** to project the consequences of operational decisions (e.g., "What happens if we close Gate B?").

## 3. How the Solution Works
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma (SQLite).
- **Real-Time Telemetry:** The application uses Server-Sent Events (SSE) to broadcast live stadium crowd densities from a background simulation engine to the client without polling.
- **AI Integration (Gemini):**
  - **Structured Outputs (JSON Schema):** We heavily utilize Gemini's structured outputs via the `@google/genai` SDK to force the model to return strongly typed JSON for incidents and simulations. This prevents parsing errors and allows the React frontend to reliably render AI-generated UI components (like the Incident Feed).
  - **Context Injection:** The live state of the stadium (crowd densities, closed gates) is serialized and injected into the system prompt for every Gemini API call. This ensures the AI's advice and triage decisions are based on the *current* reality of the stadium, not generic knowledge.

## 4. Assumptions Made
- **Hardware Profile:** We assumed that fans and volunteers will be operating entirely on mobile devices on congested cellular networks. Therefore, the UI prioritizes large tap targets, high contrast (Accessibility), and minimal client-side processing (offloading heavy logic to the server/Gemini).
- **Database Architecture:** For the purposes of this prototype and ease of deployment, we are using a local Prisma SQLite database and an in-memory simulation engine. In a production environment, this would be swapped for a distributed database (like PostgreSQL/Firebase) and a dedicated telemetry stream (like Apache Kafka).
- **Security Scope:** We assume standard web security applies; we have implemented Content Security Policies (CSP) and in-memory rate limiting to protect the Gemini API endpoints from prompt injection and DDoS/abuse.

---

## Running Locally

1. `npm install`
2. Create a `.env` file and add your `GEMINI_API_KEY=your_key_here`
3. Initialize the database: `npx prisma db push`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Evaluation Focus Areas Addressed
- **Code Quality:** Centralized types, JSDoc comments, strict TypeScript enforcement.
- **Security:** CSP, HTTP Security Headers, API Rate Limiting, Input Validation.
- **Efficiency:** React.memo for heavy map components, dynamic imports for lazy loading, SSE for real-time updates.
- **Testing:** Jest + React Testing Library suites for UI components and AI logic wrappers.
- **Accessibility:** Semantic HTML (`<main>`, `<nav>`), `aria-live` for dynamic AI regions, `focus-visible` outlines, and `role` attributes.
