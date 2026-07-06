# StadiumPulse AI 🏟️⚡

> **One AI brain for every gate, every fan, every decision.**

**StadiumPulse AI** is a competition-grade smart stadium operations platform built for the **FIFA World Cup 2026** (Google Prompt Wars — Challenge 4: Smart Stadiums & Tournament Operations). It unites fans, volunteers, and operations staff under a single, real-time intelligence layer powered by the Google Gemini API.

---

## 🌟 Key Features

The platform is divided into three distinct, persona-driven portals:

### 1. Fan Experience Portal
An immersive, mobile-first interface designed to remove friction from the matchday experience.
* **AskPulse AI Assistant:** A multilingual AI concierge that understands natural language queries (e.g., *"Where is the nearest halal food near Gate B?"*) and plots real-time, animated routes on the stadium map.
* **Accessibility Routing:** One-tap toggle to ensure AI-generated routes prioritize elevators and ramps.
* **Live Advisories:** Real-time push notifications alerting fans to gate closures or crowd surges.

### 2. Ops Command Center
A mission-control dashboard for stadium operators to maintain situational awareness and anticipate bottlenecks.
* **Live Telemetry (SSE):** Real-time heatmap of stadium zone densities (Low, Medium, High, Critical) streamed directly to the client.
* **AI Incident Triage:** Automatically ingests observations from volunteers, categorizes them (Medical, Crowd, Security, Maintenance), assigns a priority, and drafts an immediate Action Plan using Gemini.
* **"What-If" Simulator:** Allows operators to query the AI with hypothetical scenarios (e.g., *"What happens if we close Gate B for 15 minutes?"*) and receive impact projections based on the live data stream.
* **Automated Shift Reports:** Generates comprehensive, markdown-formatted handover reports summarizing the shift's major incidents and crowd dynamics.

### 3. Volunteer Assist
A hyper-utilitarian, zero-friction interface for on-the-ground staff.
* **Natural Language Logging:** Volunteers simply type or dictate what they see (e.g., *"Large spill causing a slip hazard near the East Concourse"*), and the AI handles the categorization, routing, and prioritization automatically.

---

## 🛠️ Technical Architecture

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling & Motion:** [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Real-time Data:** Server-Sent Events (SSE) via custom Node.js `SimulationEngine`
* **Database (Mock):** Prisma ORM (configured for SQLite/In-memory for the prototype)

### Core Systems
1. **Simulation Engine:** A background service that ticks every second, simulating crowd movement between stadium zones and occasionally triggering organic "incidents."
2. **Gemini Structured Output:** The application heavily leverages Gemini's `responseSchema` to guarantee the AI returns strongly typed JSON (e.g., specific `route` arrays for the map, or specific `priority` enums for incidents).

---

## 🎨 UI/UX Philosophy

The application is built with a premium, bespoke aesthetic that breaks out of the standard "dashboard in a box" feel:
* **Typography:** Utilizes bold, asymmetric type scales.
* **Layout:** Features full-bleed background maps, floating glassmorphism panels (`backdrop-blur`), and asymmetric grids.
* **Motion:** Strategic micro-interactions and route-drawing animations using Framer Motion to make the application feel tactile and responsive.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
