import { ai, DEFAULT_MODEL } from './client';
import { Type } from '@google/genai';
import { simEngine } from '../simulation/engine';
import { logger } from '../utils';

export interface WhatIfResult {
  narrative: string;
  impactedZones: string[];
}

/**
 * Simulates a hypothetical "What-If" scenario by passing the live stadium state 
 * and the user's scenario to Gemini, returning a structured prediction of the outcome.
 * 
 * @param {string} scenarioQuery - The hypothetical scenario (e.g. "What if Gate A closes?").
 * @returns {Promise<WhatIfResult | null>} A structured object containing a narrative and impacted zones, or null.
 */
export async function simulateWhatIf(scenarioQuery: string): Promise<WhatIfResult | null> {
  const state = simEngine.getState();

  const prompt = `
You are the Operations AI Simulator for StadiumPulse at the FIFA World Cup 2026.
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
    logger.error("Gemini API Error in simulateWhatIf:", error);
    return null;
  }
}
