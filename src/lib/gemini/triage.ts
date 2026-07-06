import { ai, DEFAULT_MODEL } from './client';
import { Type } from '@google/genai';
import prisma from '../db';
import { simEngine } from '../simulation/engine';

/**
 * Analyzes a natural language incident description and uses Gemini's structured output
 * to generate a strongly-typed triage response including priority and action plan.
 * 
 * @param {string} incidentDescription - The natural language description of the incident from a volunteer.
 * @returns {Promise<any | null>} The parsed JSON triage object or null if it fails.
 */
export async function triageIncident(incidentDescription: string) {
  const prompt = `
You are the Operations AI for StadiumPulse.
An incident has been reported: "${incidentDescription}"
Analyze this and generate a structured triage object.
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, description: "MEDICAL, SECURITY, FACILITY, or CROWD" },
            priority: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
            summary: { type: Type.STRING },
            actionPlan: { type: Type.STRING, description: "Suggested immediate steps for the response team." }
          },
          required: ["title", "type", "priority", "summary", "actionPlan"]
        }
      }
    });

    if (response.text) return JSON.parse(response.text);
    return null;
  } catch (error) {
    console.error("Gemini API Error in triageIncident:", error);
    return null;
  }
}

/**
 * Generates a comprehensive markdown Shift Handover Report by querying the last 50 incidents
 * from the database and reading the live stadium state from the simulation engine.
 * 
 * @returns {Promise<string>} The generated markdown report or a fallback error string.
 */
export async function generateShiftReport() {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const state = simEngine.getState();

  const prompt = `
You are the Operations AI for StadiumPulse.
Generate a comprehensive, professional Shift Handover Report based on the following data.

Recent Incidents:
${JSON.stringify(incidents.map(i => ({ title: i.title, priority: i.priority, status: i.status })), null, 2)}

Current Stadium State:
${JSON.stringify(state.zones, null, 2)}

The report should be formatted in Markdown, with sections for:
1. Executive Summary
2. Notable Incidents
3. Crowd Flow Observations
4. Recommendations for Next Shift
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });
    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Gemini API Error in generateShiftReport:", error);
    return "Error generating shift report. Please try again.";
  }
}

/**
 * Simulates a hypothetical "What-If" scenario by passing the live stadium state 
 * and the user's scenario to Gemini, returning a structured prediction of the outcome.
 * 
 * @param {string} scenarioQuery - The hypothetical scenario (e.g. "What if Gate A closes?").
 * @returns {Promise<any | null>} A structured object containing a narrative and impacted zones, or null.
 */
export async function simulateWhatIf(scenarioQuery: string) {
  const state = simEngine.getState();

  const prompt = `
You are a Stadium Operations Simulator.
The user is asking a "What-If" scenario: "${scenarioQuery}"

Current Live State:
${JSON.stringify(state.zones, null, 2)}

Analyze the scenario and predict what would happen. Provide a plausible projected outcome narrative.
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "The predicted outcome narrative" },
            impactedZones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Zone IDs that would be most impacted"
            }
          },
          required: ["narrative", "impactedZones"]
        }
      }
    });

    if (response.text) return JSON.parse(response.text);
    return null;
  } catch (error) {
    console.error("Gemini API Error in simulateWhatIf:", error);
    return null;
  }
}
