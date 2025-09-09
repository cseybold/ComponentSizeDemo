import React from 'react';
import { sampleCircuits, CircuitInfo } from '../services/circuits';

interface CircuitsViewProps {
    currentNetlist: string;
    onLoadCircuit: (netlist: string, ports: string) => void;
}

const CircuitCard: React.FC<{ circuit: CircuitInfo; isActive: boolean; onLoad: () => void; }> = ({ circuit, isActive, onLoad }) => (
    <div className={`bg-gray-900 rounded-xl p-4 border-2 transition-all ${isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-white">{circuit.name}</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">{circuit.description}</p>
            </div>
            <button
                onClick={onLoad}
                disabled={isActive}
                className="ml-4 flex-shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-transform transform enabled:hover:scale-105"
            >
                {isActive ? 'Loaded' : 'Load'}
            </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
            <div className="flex space-x-4 text-gray-300">
                <span><span className="font-bold text-white">{circuit.keyStats.transistors}</span> T</span>
                <span><span className="font-bold text-white">{circuit.keyStats.capacitors}</span> C</span>
                <span><span className="font-bold text-white">{circuit.keyStats.gates}</span> G</span>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-400">Best Case</div>
                <div className="font-semibold text-cyan-400">{circuit.bestPerformance}</div>
            </div>
        </div>
    </div>
);


const CircuitsView: React.FC<CircuitsViewProps> = ({ currentNetlist, onLoadCircuit }) => {
    return (
        <div className="w-full h-full p-2 overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sampleCircuits.map(circuit => (
                    <CircuitCard
                        key={circuit.id}
                        circuit={circuit}
                        isActive={currentNetlist.trim() === circuit.netlist.trim()}
                        onLoad={() => onLoadCircuit(circuit.netlist, circuit.ports)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CircuitsView;
