import { ai, DEFAULT_MODEL } from './client';
import { Type } from '@google/genai';
import { logger } from '../utils';

export interface TriageResult {
  title: string;
  type: string;
  priority: string;
  summary: string;
  actionPlan: string;
}

/**
 * Analyzes a natural language incident description and uses Gemini's structured output
 * to generate a strongly-typed triage response including priority and action plan.
 * 
 * @param {string} incidentDescription - The natural language description of the incident from a volunteer.
 * @returns {Promise<TriageResult | null>} The parsed JSON triage object or null if it fails.
 */
export async function triageIncident(incidentDescription: string): Promise<TriageResult | null> {
  const prompt = `
You are the Operations AI for StadiumPulse at the FIFA World Cup 2026.
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
    logger.error("Gemini API Error in triageIncident:", error);
    return null;
  }
}
