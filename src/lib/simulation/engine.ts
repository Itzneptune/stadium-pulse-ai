import { SimulationState, ZoneState, SimulationEvent } from './types';
import prisma from '../db';

const INITIAL_ZONES: Record<string, ZoneState> = {
  'gate-a': { id: 'gate-a', name: 'Gate A (North - USA vs Mexico)', type: 'GATE', capacity: 1000, currentOccupancy: 200, densityLevel: 'LOW', status: 'OPEN' },
  'gate-b': { id: 'gate-b', name: 'Gate B (East - VIP/FIFA)', type: 'GATE', capacity: 1000, currentOccupancy: 800, densityLevel: 'HIGH', status: 'OPEN' },
  'gate-c': { id: 'gate-c', name: 'Gate C (South)', type: 'GATE', capacity: 1000, currentOccupancy: 150, densityLevel: 'LOW', status: 'OPEN' },
  'gate-d': { id: 'gate-d', name: 'Gate D (West)', type: 'GATE', capacity: 1000, currentOccupancy: 450, densityLevel: 'MEDIUM', status: 'OPEN' },
  'concourse-1': { id: 'concourse-1', name: 'Level 1 Concourse', type: 'CONCOURSE', capacity: 5000, currentOccupancy: 1200, densityLevel: 'LOW', status: 'OPEN' },
  'concourse-2': { id: 'concourse-2', name: 'Level 2 Concourse', type: 'CONCOURSE', capacity: 5000, currentOccupancy: 3500, densityLevel: 'HIGH', status: 'OPEN' },
  'concession-east': { id: 'concession-east', name: 'East Food Court (World Cup Special)', type: 'CONCESSION', capacity: 500, currentOccupancy: 480, densityLevel: 'CRITICAL', status: 'OPEN' },
  'concession-west': { id: 'concession-west', name: 'West Food Court', type: 'CONCESSION', capacity: 500, currentOccupancy: 150, densityLevel: 'LOW', status: 'OPEN' },
  'transit-hub': { id: 'transit-hub', name: 'Metro Station Connect', type: 'TRANSIT', capacity: 2000, currentOccupancy: 300, densityLevel: 'LOW', status: 'OPEN' },
};

type Listener = (state: SimulationState, event?: SimulationEvent) => void;

/**
 * The SimulationEngine is a singleton class that manages the live state of the stadium.
 * It simulates crowd movement, tracks active incidents, and handles manual surges.
 */
class SimulationEngine {
  private state: SimulationState;
  private listeners: Set<Listener> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      timestamp: new Date().toISOString(),
      matchPhase: 'PRE_MATCH',
      zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
      activeIncidentIds: [],
    };
  }

  /**
   * Returns the current simulation state.
   * @returns {SimulationState} The live state of the stadium.
   */
  public getState(): SimulationState {
    return this.state;
  }

  /**
   * Subscribes a listener to simulation state changes.
   * @param {Listener} listener - The callback function to invoke on updates.
   * @returns {() => void} A function to unsubscribe the listener.
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event?: SimulationEvent) {
    this.state.timestamp = new Date().toISOString();
    for (const listener of this.listeners) {
      listener(this.state, event);
    }
  }

  /**
   * Starts the simulation engine tick loop.
   */
  public start(): void {
    if (this.intervalId) return;
    if (process.env.NODE_ENV !== 'production') {
      // console.log("Simulation Engine started.");
    }
    
    // Tick every 5 seconds to fluctuate data
    this.intervalId = setInterval(() => {
      this.tick();
    }, 5000);
  }

  /**
   * Stops the simulation engine tick loop.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    let changed = false;

    // Random walk for crowd density
    for (const zoneId in this.state.zones) {
      const zone = this.state.zones[zoneId];
      if (zone.status !== 'OPEN') continue;

      // fluctuation between -5% and +5% of capacity
      const fluctuation = Math.floor((Math.random() * 0.1 - 0.05) * zone.capacity);
      let newOccupancy = zone.currentOccupancy + fluctuation;
      
      // Clamp bounds
      if (newOccupancy < 0) newOccupancy = 0;
      if (newOccupancy > zone.capacity) newOccupancy = zone.capacity;

      if (newOccupancy !== zone.currentOccupancy) {
        zone.currentOccupancy = newOccupancy;
        
        // Update density level
        const ratio = newOccupancy / zone.capacity;
        let newLevel: ZoneState['densityLevel'] = 'LOW';
        if (ratio > 0.9) newLevel = 'CRITICAL';
        else if (ratio > 0.7) newLevel = 'HIGH';
        else if (ratio > 0.4) newLevel = 'MEDIUM';

        zone.densityLevel = newLevel;
        changed = true;
      }
    }

    if (changed) {
      this.notify({ type: 'UPDATE', payload: null });
    }
  }

  // --- Manual Triggers for Demo ---

  /**
   * Manually triggers a surge in crowd density based on the match phase.
   * @param {SimulationState['matchPhase']} phase - The phase to trigger.
   */
  public triggerSurge(phase: SimulationState['matchPhase']): void {
    this.state.matchPhase = phase;
    
    if (phase === 'HALFTIME') {
      // Empty seating, fill concourses and concessions and restrooms
      for (const id in this.state.zones) {
        if (id.includes('concourse')) this.state.zones[id].currentOccupancy = this.state.zones[id].capacity * 0.85;
        if (id.includes('concession')) this.state.zones[id].currentOccupancy = this.state.zones[id].capacity * 0.95;
      }
    } else if (phase === 'POST_MATCH') {
      // Mass exit: Gates and transit hub fill up
      for (const id in this.state.zones) {
        if (id.includes('gate')) this.state.zones[id].currentOccupancy = this.state.zones[id].capacity * 0.90;
        if (id.includes('transit')) this.state.zones[id].currentOccupancy = this.state.zones[id].capacity * 0.95;
        if (id.includes('concourse')) this.state.zones[id].currentOccupancy = this.state.zones[id].capacity * 0.60;
      }
    }

    this.recalculateDensities();
    this.notify({ type: 'SURGE_TRIGGERED', payload: { phase } });
  }

  public async reportIncident(zoneId: string, type: string, description: string, reportedByRole: string) {
    const incident = await prisma.incident.create({
      data: {
        title: `Reported ${type} at ${this.state.zones[zoneId]?.name || zoneId}`,
        type,
        description,
        zoneId,
        status: 'OPEN',
        priority: 'MEDIUM',
        reportedByRole
      }
    });

    this.state.activeIncidentIds.push(incident.id);
    this.notify({ type: 'INCIDENT_NEW', payload: incident });
    return incident;
  }

  private recalculateDensities() {
    for (const zoneId in this.state.zones) {
      const zone = this.state.zones[zoneId];
      const ratio = zone.currentOccupancy / zone.capacity;
      if (ratio > 0.9) zone.densityLevel = 'CRITICAL';
      else if (ratio > 0.7) zone.densityLevel = 'HIGH';
      else if (ratio > 0.4) zone.densityLevel = 'MEDIUM';
      else zone.densityLevel = 'LOW';
    }
  }
}

// Global singleton for Next.js HMR
const globalForSim = globalThis as unknown as { simEngine: SimulationEngine };

export const simEngine = globalForSim.simEngine || new SimulationEngine();

if (process.env.NODE_ENV !== 'production') globalForSim.simEngine = simEngine;

// Start it immediately
simEngine.start();
