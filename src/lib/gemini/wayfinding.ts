import { ai, DEFAULT_MODEL } from './client';
import { Type } from '@google/genai';
import { simEngine } from '../simulation/engine';

export async function askPulse(query: string, language: string = 'en', accessibilityMode: boolean = false) {
  const currentState = simEngine.getState();
  
  const prompt = `
You are "StadiumPulse AI", the official fan assistant for a World Cup 2026 stadium.
You help fans navigate the stadium, find food, and get to their seats.

User Query: "${query}"
Preferred Language: ${language}
Accessibility Mode (needs elevators/step-free): ${accessibilityMode}

Current Live Stadium State:
${JSON.stringify(currentState.zones, null, 2)}

Instructions:
1. Understand the user's intent.
2. Based on the Live Stadium State, find the best route. Avoid 'CRITICAL' or 'CLOSED' zones if possible.
3. If accessibility mode is true, explicitly mention step-free access or elevators.
4. Provide a friendly, conversational response in the requested language.
5. Provide a structured 'route' array of zone IDs that represent the path they should take.
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
            message: {
              type: Type.STRING,
              description: "The natural language response to the user."
            },
            route: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of zone IDs representing the recommended path (e.g. ['gate-a', 'concourse-1', 'concession-east'])"
            }
          },
          required: ["message", "route"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { message: "Sorry, I couldn't process that request right now.", route: [] };
  } catch (error) {
    console.error("Gemini API Error in askPulse:", error);
    return { message: "System is offline. Please try again later.", route: [] };
  }
}
