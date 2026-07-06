import { ai, DEFAULT_MODEL } from './client';
import { Type } from '@google/genai';
import { simEngine } from '../simulation/engine';

export async function generateCrowdAdvisories() {
  const currentState = simEngine.getState();
  
  const prompt = `
You are the AI Safety & Advisory module for StadiumPulse AI.
Analyze the current stadium state and generate:
1. One concise, plain-language advisory for FANS if there is congestion. If no major congestion, provide a welcoming message or tip.
2. An array of risk-ranked alerts for operations STAFF (focus on HIGH or CRITICAL zones).

Current Live Stadium State:
${JSON.stringify(currentState.zones, null, 2)}
Match Phase: ${currentState.matchPhase}
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
            fanAdvisory: {
              type: Type.STRING,
              description: "A short, friendly advisory for fans (e.g. 'Gate D is congested. Use Gate B for faster entry.')"
            },
            staffAlerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  zoneId: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, CRITICAL" },
                  message: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING }
                },
                required: ["zoneId", "severity", "message", "suggestedAction"]
              }
            }
          },
          required: ["fanAdvisory", "staffAlerts"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error in generateCrowdAdvisories:", error);
    return null;
  }
}
