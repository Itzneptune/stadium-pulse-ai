import { simEngine } from '../lib/simulation/engine';

jest.mock('../lib/db', () => ({
  __esModule: true,
  default: {
    incident: {
      create: jest.fn().mockResolvedValue({ id: 'test-id-1' }),
      findMany: jest.fn().mockResolvedValue([]),
    }
  }
}));

describe('SimulationEngine', () => {
  beforeEach(() => {
    // Reset state before each test
    simEngine['state'] = {
      timestamp: new Date().toISOString(),
      matchPhase: 'PRE_MATCH',
      zones: {
        'gate-a': { id: 'gate-a', name: 'Gate A (North)', type: 'GATE', capacity: 1000, currentOccupancy: 200, densityLevel: 'LOW', status: 'OPEN' },
        'gate-b': { id: 'gate-b', name: 'Gate B (East)', type: 'GATE', capacity: 1000, currentOccupancy: 800, densityLevel: 'HIGH', status: 'OPEN' },
        'concourse-1': { id: 'concourse-1', name: 'Level 1 Concourse', type: 'CONCOURSE', capacity: 5000, currentOccupancy: 1200, densityLevel: 'LOW', status: 'OPEN' },
        'concession-east': { id: 'concession-east', name: 'East Food Court', type: 'CONCESSION', capacity: 500, currentOccupancy: 480, densityLevel: 'CRITICAL', status: 'OPEN' },
        'transit-hub': { id: 'transit-hub', name: 'Metro Station Connect', type: 'TRANSIT', capacity: 2000, currentOccupancy: 300, densityLevel: 'LOW', status: 'OPEN' },
      },
      activeIncidentIds: [],
    };
  });

  it('getState returns valid initial state', () => {
    const state = simEngine.getState();
    expect(state).toHaveProperty('timestamp');
    expect(state).toHaveProperty('matchPhase');
    expect(state).toHaveProperty('zones');
    expect(state).toHaveProperty('activeIncidentIds');
    expect(state.zones).toHaveProperty('gate-a');
    expect(state.zones).toHaveProperty('gate-b');
  });

  it('subscribe calls listener with initial state', () => {
    const mockListener = jest.fn();
    const unsubscribe = simEngine.subscribe(mockListener);
    
    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(simEngine.getState());
    
    unsubscribe();
  });

  it('triggerSurge HALFTIME fills concourses and concessions', () => {
    simEngine.triggerSurge('HALFTIME');
    const state = simEngine.getState();
    
    expect(state.matchPhase).toBe('HALFTIME');
    // Concourse capacity 5000 * 0.85 = 4250
    expect(state.zones['concourse-1'].currentOccupancy).toBeGreaterThanOrEqual(4250);
    // Concession capacity 500 * 0.95 = 475
    expect(state.zones['concession-east'].currentOccupancy).toBeGreaterThanOrEqual(475);
  });

  it('triggerSurge POST_MATCH fills gates and transit', () => {
    simEngine.triggerSurge('POST_MATCH');
    const state = simEngine.getState();
    
    expect(state.matchPhase).toBe('POST_MATCH');
    // Gate capacity 1000 * 0.90 = 900
    expect(state.zones['gate-a'].currentOccupancy).toBeGreaterThanOrEqual(900);
    // Transit capacity 2000 * 0.95 = 1900
    expect(state.zones['transit-hub'].currentOccupancy).toBeGreaterThanOrEqual(1900);
  });

  it('density recalculation works correctly', () => {
    simEngine.triggerSurge('HALFTIME');
    const state = simEngine.getState();
    
    // Concessions at 95% should be CRITICAL
    expect(state.zones['concession-east'].densityLevel).toBe('CRITICAL');
    // Concourses at 85% should be HIGH
    expect(state.zones['concourse-1'].densityLevel).toBe('HIGH');
  });
});
