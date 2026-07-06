import { triageIncident } from '../lib/gemini/triage';

jest.mock('@google/genai', () => ({
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN'
  }
}));

jest.mock('../lib/gemini/client', () => ({
  ai: {
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
  }
}));

import { ai } from '../lib/gemini/client';

describe('triageIncident', () => {
  it('parses the Gemini response into a structured object', async () => {
    const result = await triageIncident('Someone fell down the stairs near Gate B');
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Test Incident');
    expect(result?.type).toBe('MEDICAL');
    expect(result?.priority).toBe('HIGH');
    expect(result?.actionPlan).toContain('Step 1');
  });

  it('returns null when Gemini response is empty', async () => {
    (ai.models.generateContent as jest.Mock).mockResolvedValueOnce({ text: null });
    
    const result = await triageIncident('Something happened');
    expect(result).toBeNull();
  });

  it('returns null on API error', async () => {
    (ai.models.generateContent as jest.Mock).mockRejectedValueOnce(new Error('API failure'));
    const result = await triageIncident('Error test');
    expect(result).toBeNull();
  });
});
