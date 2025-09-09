import React from 'react';
import { OptimizationTarget, Constraint, Hyperparameters } from '../types';

interface LeftPanelProps {
  netlist: string;
  setNetlist: (value: string) => void;
  ports: string;
  setPorts: (value: string) => void;
  onVisualizeAndOptimize: () => void;
  optimizationTarget: OptimizationTarget;
  onOptimizationChange: (target: OptimizationTarget) => void;
  constraints: Constraint;
  setConstraints: (value: Constraint) => void;
  hyperparameters: Hyperparameters;
  setHyperparameters: (value: Hyperparameters) => void;
}

const optimizationOptions: { id: OptimizationTarget; label: string }[] = [
  { id: 'balanced', label: 'Balanced Performance' },
  { id: 'gain', label: 'Maximize Gain' },
  { id: 'bandwidth', label: 'Maximize Bandwidth' },
  { id: 'power', label: 'Minimize Power' },
  { id: 'noise', label: 'Minimize Noise Figure' },
];

const LeftPanel: React.FC<LeftPanelProps> = ({
  netlist, setNetlist, ports, setPorts, onVisualizeAndOptimize,
  optimizationTarget, onOptimizationChange,
  constraints, setConstraints,
  hyperparameters, setHyperparameters
}) => {
  return (
    <aside className="lg:w-1/4 bg-gray-800 rounded-xl p-6 flex flex-col space-y-6 max-h-[95vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-white">Inputs & Controls</h2>
      
      <div>
        <label htmlFor="netlist" className="block text-sm font-medium text-gray-400 mb-2">Circuit Netlist (.cir)</label>
        <textarea id="netlist" value={netlist} onChange={(e) => setNetlist(e.target.value)} rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>

      <div>
        <label htmlFor="ports" className="block text-sm font-medium text-gray-400 mb-2">Port Definitions (port.txt)</label>
        <textarea id="ports" value={ports} onChange={(e) => setPorts(e.target.value)} rows={2}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
      </div>

      <button onClick={onVisualizeAndOptimize}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-transform transform hover:scale-105">
        Visualize & Optimize
      </button>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Optimization Target</h3>
        <div className="space-y-2">
          {optimizationOptions.map(option => (
            <label key={option.id} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700 transition">
              <input type="radio" name="optimizationTarget" value={option.id} checked={optimizationTarget === option.id} onChange={() => onOptimizationChange(option.id)}
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
        <div className='space-y-3'>
            <div>
                <label htmlFor="maxPower" className="block text-xs font-medium text-gray-400">Max Power (mW)</label>
                <input type="number" id="maxPower" value={constraints.maxPower} onChange={e => setConstraints({...constraints, maxPower: e.target.value})} placeholder="e.g. 1.8"
                 className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
                <label htmlFor="maxNoise" className="block text-xs font-medium text-gray-400">Max Noise Figure (dB)</label>
                <input type="number" id="maxNoise" value={constraints.maxNoise} onChange={e => setConstraints({...constraints, maxNoise: e.target.value})} placeholder="e.g. 2.5"
                 className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Advanced Settings</h3>
        <div className='space-y-3'>
            <div>
                <label htmlFor="algorithm" className="block text-xs font-medium text-gray-400">Algorithm</label>
                <select id="algorithm" value={hyperparameters.algorithm} onChange={e => setHyperparameters({...hyperparameters, algorithm: e.target.value as Hyperparameters['algorithm']})}
                 className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="geneticAlgorithm">Genetic Algorithm</option>
                    <option value="simulatedAnnealing">Simulated Annealing</option>
                </select>
            </div>
             <div>
                <label htmlFor="populationSize" className="block text-xs font-medium text-gray-400">Population Size</label>
                <input type="number" id="populationSize" value={hyperparameters.populationSize} onChange={e => setHyperparameters({...hyperparameters, populationSize: parseInt(e.target.value, 10) || 0})}
                 className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"/>
            </div>
        </div>
      </div>

    </aside>
  );
};

export default LeftPanel;
