
// Fix: The d3 module was not resolving SimulationNodeDatum and SimulationLinkDatum.
// The interfaces have been updated to manually include the necessary properties for the d3 simulation,
// removing the direct dependency on the imported d3 types.
// import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export enum ComponentType {
  PMOS = 'pmos4',
  NMOS = 'nmos4',
  CAPACITOR = 'capacitor',
  TRANSMISSION_GATE = 'TRANSMISSION_GATE',
  PORT = 'PORT',
  NET = 'NET',
  VDD = 'VDD',
  VSS = 'VSS',
}

export interface Component {
  id: string;
  type: ComponentType;
  connections: string[];
  size: number;
}

export interface PerformanceMetrics {
  gain: number;
  bandwidth: number;
  power: number;
  slewRate: number;
  noiseFigure: number;
}

export type OptimizationTarget = 'balanced' | 'gain' | 'bandwidth' | 'power' | 'noise';

// For D3
export interface Node {
  id: string;
  type: ComponentType;
  size?: number;
  // Manually added properties from d3-force's SimulationNodeDatum
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

// New types for advanced features
export interface Constraint {
  maxPower: string;
  maxNoise: string;
}

export interface Hyperparameters {
  algorithm: 'simulatedAnnealing' | 'geneticAlgorithm';
  iterations: number;
  populationSize: number;
}

export interface TradeOffPoint {
  id:string; // to identify the point
  components: Component[];
  metrics: PerformanceMetrics;
}

export interface HistoryEntry {
  id: number;
  timestamp: Date;
  target: OptimizationTarget;
  constraints: Constraint;
  paretoFront: TradeOffPoint[];
}
