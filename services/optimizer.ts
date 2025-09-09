import { Component, PerformanceMetrics, OptimizationTarget, ComponentType, TradeOffPoint, Constraint, Hyperparameters } from '../types';

const baselineMetrics: PerformanceMetrics = {
  gain: 60,
  bandwidth: 200,
  power: 1.5,
  slewRate: 100,
  noiseFigure: 2.0,
};

const baselineSizes: { [key in ComponentType]?: number } = {
  [ComponentType.PMOS]: 10,
  [ComponentType.NMOS]: 10,
  [ComponentType.CAPACITOR]: 5,
  [ComponentType.TRANSMISSION_GATE]: 1,
};

const isTransistor = (type: ComponentType) => type === ComponentType.NMOS || type === ComponentType.PMOS;

// Helper function to create a single design based on factors
const createDesignPoint = (baseComponents: Component[], transistorFactor: number, capacitorFactor: number, algorithm: string): { updatedComponents: Component[], metrics: PerformanceMetrics } => {
    let metrics = { ...baselineMetrics };
    const updatedComponents = JSON.parse(JSON.stringify(baseComponents)) as Component[];

    updatedComponents.forEach(c => {
        const baseSize = baselineSizes[c.type] || 1;
        if (isTransistor(c.type)) {
            c.size = baseSize * transistorFactor;
        } else if (c.type === ComponentType.CAPACITOR) {
            c.size = baseSize * capacitorFactor;
        } else {
            c.size = baseSize;
        }
    });

    // Recalculate metrics based on new sizes
    metrics.gain = 60 * Math.sqrt(transistorFactor);
    metrics.power = 1.5 * Math.pow(transistorFactor, 1.5);
    metrics.bandwidth = 200 / Math.sqrt(transistorFactor * capacitorFactor);
    metrics.noiseFigure = 2.0 / transistorFactor;
    metrics.slewRate = 100 * (1 / capacitorFactor);

    // Simulate algorithm difference: GA finds slightly better frontiers
    if (algorithm === 'geneticAlgorithm') {
        metrics.gain *= 1.05;
        metrics.power *= 0.95;
    }

    Object.keys(metrics).forEach(key => {
        metrics[key as keyof PerformanceMetrics] = parseFloat(metrics[key as keyof PerformanceMetrics].toFixed(2));
    });

    return { updatedComponents, metrics };
};

/**
 * This is a simulation of a more complex optimization process.
 * It generates a range of designs and then finds the "Pareto Front"
 * which represents the set of best possible trade-offs.
 */
export const runMultiObjectiveOptimization = (
  baseComponents: Component[],
  target: OptimizationTarget,
  constraints: Constraint,
  hyperparameters: Hyperparameters
): { paretoFront: TradeOffPoint[], allPoints: TradeOffPoint[] } => {
  const allPoints: TradeOffPoint[] = [];
  
  // 1. Generate a population of diverse designs
  for (let i = 0; i < hyperparameters.populationSize; i++) {
    // Introduce randomness to simulate a search algorithm
    const randomFactor = 0.5 + Math.random(); 
    let baseTransistorFactor = 1.0;
    switch(target) {
        case 'gain': baseTransistorFactor = 1.4; break;
        case 'power': baseTransistorFactor = 0.6; break;
        case 'bandwidth': baseTransistorFactor = 0.8; break;
        case 'noise': baseTransistorFactor = 1.3; break;
    }

    const transistorFactor = baseTransistorFactor * randomFactor;
    const capacitorFactor = (target === 'bandwidth' ? 0.7 : 1.0) * randomFactor;
    
    const { updatedComponents, metrics } = createDesignPoint(baseComponents, transistorFactor, capacitorFactor, hyperparameters.algorithm);
    
    allPoints.push({ id: `p${i}`, components: updatedComponents, metrics });
  }

  // 2. Filter by constraints
  const maxPower = constraints.maxPower ? parseFloat(constraints.maxPower) : null;
  const maxNoise = constraints.maxNoise ? parseFloat(constraints.maxNoise) : null;
  
  const feasiblePoints = allPoints.filter(p => {
    const powerOk = maxPower === null || isNaN(maxPower) || p.metrics.power <= maxPower;
    const noiseOk = maxNoise === null || isNaN(maxNoise) || p.metrics.noiseFigure <= maxNoise;
    return powerOk && noiseOk;
  });

  // 3. Find the Pareto Front from the feasible points
  // A point is on the Pareto Front if no other point is better in all objectives.
  // For this visualization, we define "better" as higher gain and lower power.
  const paretoFront = feasiblePoints.filter(p1 => {
    return !feasiblePoints.some(p2 => {
      if (p1 === p2) return false;
      const isStrictlyBetter = (p2.metrics.gain >= p1.metrics.gain && p2.metrics.power < p1.metrics.power) ||
                             (p2.metrics.gain > p1.metrics.gain && p2.metrics.power <= p1.metrics.power);
      return isStrictlyBetter;
    });
  }).sort((a, b) => a.metrics.power - b.metrics.power); // Sort for nice plotting

  return { paretoFront, allPoints };
};
