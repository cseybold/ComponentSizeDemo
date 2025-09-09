import React, { useState, useEffect, useCallback } from 'react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import { Component, Node, Link, OptimizationTarget, Constraint, Hyperparameters, TradeOffPoint, HistoryEntry } from './types';
import { createGraphData } from './services/parser';
import { runMultiObjectiveOptimization } from './services/optimizer';
import { initialNetlist, initialPorts } from './constants';

const App: React.FC = () => {
  const [netlistText, setNetlistText] = useState<string>(initialNetlist);
  const [portsText, setPortsText] = useState<string>(initialPorts);
  
  const [optimizationTarget, setOptimizationTarget] = useState<OptimizationTarget>('balanced');
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  const [constraints, setConstraints] = useState<Constraint>({ maxPower: '', maxNoise: '' });
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({
    algorithm: 'geneticAlgorithm',
    iterations: 1000,
    populationSize: 100,
  });

  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] });
  const [paretoFrontData, setParetoFrontData] = useState<{ paretoFront: TradeOffPoint[], allPoints: TradeOffPoint[] }>({ paretoFront: [], allPoints: [] });
  const [selectedPoint, setSelectedPoint] = useState<TradeOffPoint | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const runSimulation = useCallback(() => {
    const { components: baseComponents, nodes, links } = createGraphData(netlistText, portsText);
    setGraphData({ nodes, links });

    const { paretoFront, allPoints } = runMultiObjectiveOptimization(baseComponents, optimizationTarget, constraints, hyperparameters);
    setParetoFrontData({ paretoFront, allPoints });

    if (paretoFront.length > 0) {
      // Select a balanced point from the front
      const midIndex = Math.floor(paretoFront.length / 2);
      setSelectedPoint(paretoFront[midIndex]);
    } else {
      setSelectedPoint(null);
    }
    
    // Add to history
    const newHistoryEntry: HistoryEntry = {
        id: Date.now(),
        timestamp: new Date(),
        target: optimizationTarget,
        constraints: { ...constraints },
        paretoFront: paretoFront
    };
    setHistory(prev => [newHistoryEntry, ...prev].slice(0, 10)); // Keep last 10 runs

  }, [netlistText, portsText, optimizationTarget, constraints, hyperparameters]);
  
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevertHistory = (entry: HistoryEntry) => {
    setOptimizationTarget(entry.target);
    setConstraints(entry.constraints);
    setParetoFrontData(prev => ({...prev, paretoFront: entry.paretoFront}));
    if(entry.paretoFront.length > 0) {
        const midIndex = Math.floor(entry.paretoFront.length / 2);
        setSelectedPoint(entry.paretoFront[midIndex]);
    } else {
        setSelectedPoint(null);
    }
  };

  const handleLoadCircuit = (netlist: string, ports: string) => {
    setNetlistText(netlist);
    setPortsText(ports);

    // This is slightly duplicative of runSimulation but avoids stale state issues from a direct call.
    // For this use case, it's acceptable.
    const { components: baseComponents, nodes, links } = createGraphData(netlist, ports);
    setGraphData({ nodes, links });

    const { paretoFront, allPoints } = runMultiObjectiveOptimization(baseComponents, optimizationTarget, constraints, hyperparameters);
    setParetoFrontData({ paretoFront, allPoints });

    if (paretoFront.length > 0) {
      const midIndex = Math.floor(paretoFront.length / 2);
      setSelectedPoint(paretoFront[midIndex]);
    } else {
      setSelectedPoint(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col p-4 lg:flex-row lg:space-x-4">
      <LeftPanel
        netlist={netlistText}
        setNetlist={setNetlistText}
        ports={portsText}
        setPorts={setPortsText}
        onVisualizeAndOptimize={runSimulation}
        optimizationTarget={optimizationTarget}
        onOptimizationChange={setOptimizationTarget}
        constraints={constraints}
        setConstraints={setConstraints}
        hyperparameters={hyperparameters}
        setHyperparameters={setHyperparameters}
      />
      <main className="flex-grow flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mt-4 lg:mt-0">
        <CenterPanel
            graphData={graphData}
            components={selectedPoint?.components || []}
            onComponentHover={setHighlightedComponent}
            highlightedComponent={highlightedComponent}
            paretoData={paretoFrontData}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            currentNetlist={netlistText}
            onLoadCircuit={handleLoadCircuit}
        />
        <RightPanel 
            selectedPoint={selectedPoint}
            highlightedComponent={highlightedComponent}
            history={history}
            onRevertHistory={handleRevertHistory}
        />
      </main>
    </div>
  );
};

export default App;