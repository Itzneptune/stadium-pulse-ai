/**
 * Core application types for StadiumPulse AI
 */

/**
 * Represents a discrete physical zone or area within the stadium (e.g., a gate, concourse, or concession stand).
 */
export interface ZoneState {
  id: string;
  name: string;
  type: 'GATE' | 'CONCOURSE' | 'CONCESSION' | 'TRANSIT';
  capacity: number;
  currentOccupancy: number;
  densityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
}

/**
 * Represents the entire state of the stadium at a given point in time.
 */
export interface SimulationState {
  timestamp: string;
  matchPhase: 'PRE_MATCH' | 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'POST_MATCH';
  zones: Record<string, ZoneState>;
  activeIncidentIds: string[];
}

/**
 * Event payloads dispatched by the simulation engine.
 */
export type SimulationEvent = 
  | { type: 'UPDATE'; payload: null }
  | { type: 'INCIDENT_NEW'; payload: unknown }
  | { type: 'SURGE_TRIGGERED'; payload: { phase: string } };

/**
 * Represents a chat message in the AskPulse interface.
 */
export interface ChatMessage {
  id: string;
  sender: 'USER' | 'MODEL';
  content: string;
}

/**
 * Represents an operational incident logged by staff or volunteers.
 */
export interface Incident {
  id: string;
  title: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  aiSummary?: string;
  aiActionPlan?: string;
}
