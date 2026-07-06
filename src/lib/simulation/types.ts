export type ZoneType = 'GATE' | 'CONCOURSE' | 'SEATING' | 'RESTROOM' | 'CONCESSION' | 'TRANSIT';

export interface ZoneState {
  id: string;
  name: string;
  type: ZoneType;
  capacity: number;
  currentOccupancy: number;
  densityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CLOSED' | 'RESTRICTED';
}

export interface SimulationState {
  timestamp: string;
  matchPhase: 'PRE_MATCH' | 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'POST_MATCH';
  zones: Record<string, ZoneState>;
  activeIncidentIds: string[]; // references incidents in SQLite DB
}

export interface SimulationEvent {
  type: 'UPDATE' | 'INCIDENT_NEW' | 'INCIDENT_RESOLVED' | 'SURGE_TRIGGERED';
  payload: any;
}
