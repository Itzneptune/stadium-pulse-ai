import { ai, DEFAULT_MODEL } from './client';
import prisma from '../db';
import { simEngine } from '../simulation/engine';

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
You are the Operations AI for StadiumPulse at the FIFA World Cup 2026.
Generate a comprehensive, professional Shift Handover Report based on the following data.

Recent Incidents:
${JSON.stringify(incidents.map(i => ({ title: i.title, priority: i.priority, status: i.status })), null, 2)}

Current Stadium State:
${JSON.stringify(state.zones, null, 2)}

The report should be formatted in Markdown, with sections for:
1. Executive Summary (Highlighting overall readiness for the FIFA World Cup match)
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
