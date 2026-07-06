import { triageIncident } from '../lib/gemini/triage';

// We need to mock the google genai module
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            title: 'Test Incident',
            type: 'MEDICAL',
            priority: 'HIGH',
            summary: 'Mock summary',
            actionPlan: ['Step 1'],
            confidenceScore: 0.9
          })
        })
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      NUMBER: 'NUMBER',
      BOOLEAN: 'BOOLEAN'
    }
  };
});

describe('triageIncident', () => {
  it('parses the Gemini response into a structured object', async () => {
    const result = await triageIncident('Someone fell down the stairs near Gate B');
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Test Incident');
    expect(result?.type).toBe('MEDICAL');
    expect(result?.priority).toBe('HIGH');
    expect(result?.actionPlan).toContain('Step 1');
  });
});
