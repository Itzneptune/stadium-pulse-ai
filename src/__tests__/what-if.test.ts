import { simulateWhatIf } from '../lib/gemini/what-if';
import { ai } from '../lib/gemini/client';

jest.mock('@google/genai', () => ({
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY'
  }
}));

jest.mock('../lib/gemini/client', () => ({
  ai: {
    models: {
      generateContent: jest.fn()
    }
  },
  DEFAULT_MODEL: 'test-model'
}));

jest.mock('../lib/simulation/engine', () => ({
  simEngine: {
    getState: jest.fn().mockReturnValue({ zones: {} })
  }
}));

describe('simulateWhatIf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('simulates scenario successfully', async () => {
    (ai.models.generateContent as jest.Mock).mockResolvedValue({
      text: JSON.stringify({ narrative: 'Test narrative', impactedZones: ['gate-a'] })
    });

    const result = await simulateWhatIf('What if?');
    expect(result.narrative).toBe('Test narrative');
    expect(result.impactedZones).toEqual(['gate-a']);
  });

  it('handles empty response text gracefully', async () => {
    (ai.models.generateContent as jest.Mock).mockResolvedValue({
      text: null
    });

    const result = await simulateWhatIf('What if?');
    expect(result).toBeNull();
  });

  it('catches and handles API errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (ai.models.generateContent as jest.Mock).mockRejectedValue(new Error('API Error'));

    const result = await simulateWhatIf('What if?');
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
