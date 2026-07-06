import { generateShiftReport } from '../lib/gemini/shift-report';
import { ai } from '../lib/gemini/client';

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

jest.mock('../lib/db', () => ({
  __esModule: true,
  default: {
    incident: {
      findMany: jest.fn().mockResolvedValue([{ title: 'Test Incident', priority: 'HIGH', status: 'OPEN' }])
    }
  }
}));

describe('generateShiftReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a report successfully', async () => {
    (ai.models.generateContent as jest.Mock).mockResolvedValue({
      text: 'Mocked Report Content'
    });

    const report = await generateShiftReport();
    expect(report).toBe('Mocked Report Content');
    expect(ai.models.generateContent).toHaveBeenCalled();
  });

  it('handles empty response gracefully', async () => {
    (ai.models.generateContent as jest.Mock).mockResolvedValue({
      text: null
    });

    const report = await generateShiftReport();
    expect(report).toBe('Report generation failed.');
  });

  it('catches and handles API errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (ai.models.generateContent as jest.Mock).mockRejectedValue(new Error('API Error'));

    const report = await generateShiftReport();
    expect(report).toBe('Error generating shift report. Please try again.');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
