export type UserRole = 'operator' | 'manager' | 'emergency';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  lastLogin?: string;
}

export interface DrillingModule {
  id: string;
  name: string;
  currentDepth: number;
  mudPressure: number;
  weightOnBit: number;
  rotationSpeed: number;
  status: 'normal' | 'warning' | 'danger';
  footageData: { time: string; depth: number }[];
  wellStructure: {
    section: string;
    depth: number;
    diameter: number;
    casing: string;
  }[];
  kickWarning: boolean;
  bopStatus: 'open' | 'closed' | 'closing';
}

export interface Separator {
  id: string;
  name: string;
  liquidLevel: number;
  temperature: number;
  pressure: number;
  status: 'normal' | 'warning' | 'danger';
  isActive: boolean;
  isStandby: boolean;
}

export interface Helicopter {
  id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  status: 'scheduled' | 'boarding' | 'landed' | 'departed';
  passengerCount: number;
  scheduledTime: string;
}

export interface PipelinePoint {
  id: string;
  position: number;
  pressure: number;
  status: 'normal' | 'warning' | 'danger';
  leakDetected: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  length: number;
  points: PipelinePoint[];
  valveUpstream: 'open' | 'closed';
  valveDownstream: 'open' | 'closed';
}

export interface WorkOrder {
  id: string;
  type: 'maintenance' | 'repair';
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  description: string;
}

export interface SupplyShip {
  id: string;
  name: string;
  status: 'pending' | 'warehouse-approved' | 'procurement-approved' | 'safety-approved' | 'docked';
  cargo: string;
  eta: string;
  approvalProgress: number;
}

export interface ProductionPrediction {
  date: string;
  predicted: number;
  actual?: number;
}

export interface Alert {
  id: string;
  type: 'kick' | 'level' | 'leak' | 'unauthorized' | 'fire';
  severity: 'warning' | 'danger';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  moduleId?: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface DailyReport {
  date: string;
  drillingEfficiency: {
    moduleId: string;
    moduleName: string;
    footage: number;
    operatingHours: number;
    nonProductiveHours: number;
  }[];
  production: {
    oil: number;
    gas: number;
    water: number;
  };
  safetyEvents: {
    type: string;
    count: number;
  }[];
}
