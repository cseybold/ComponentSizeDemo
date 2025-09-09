import React, { useState } from 'react';
import SchematicView from './SchematicView';
import ParetoChart from './ParetoChart';
import AlgorithmsView from './AlgorithmsView';
import CircuitsView from './CircuitsView';
import { Node, Link, Component, TradeOffPoint } from '../types';

interface CenterPanelProps {
    graphData: { nodes: Node[], links: Link[] };
    components: Component[];
    onComponentHover: (id: string | null) => void;
    highlightedComponent: string | null;
    paretoData: { paretoFront: TradeOffPoint[], allPoints: TradeOffPoint[] };
    selectedPoint: TradeOffPoint | null;
    onPointSelect: (point: TradeOffPoint) => void;
    currentNetlist: string;
    onLoadCircuit: (netlist: string, ports: string) => void;
}

type Tab = 'schematic' | 'pareto' | 'algorithms' | 'circuits';

const tabConfig: Record<Tab, { title: string }> = {
    schematic: { title: 'Circuit Schematic' },
    pareto: { title: 'Pareto Front (Gain vs. Power)' },
    algorithms: { title: 'Algorithm Comparison' },
    circuits: { title: 'Circuit Library' },
};


const CenterPanel: React.FC<CenterPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('schematic');

    const commonTabClass = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors whitespace-nowrap";
    const activeTabClass = "bg-blue-600 text-white";
    const inactiveTabClass = "text-gray-400 hover:bg-gray-700";

    return (
        <div className="flex-grow w-full lg:w-1/2 bg-gray-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                 <h2 className="text-xl font-bold text-white">
                    {tabConfig[activeTab].title}
                </h2>
                <div className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('schematic')} className={`${commonTabClass} ${activeTab === 'schematic' ? activeTabClass : inactiveTabClass}`}>
                        Schematic
                    </button>
                    <button onClick={() => setActiveTab('pareto')} className={`${commonTabClass} ${activeTab === 'pareto' ? activeTabClass : inactiveTabClass}`}>
                        Pareto Front
                    </button>
                    <button onClick={() => setActiveTab('algorithms')} className={`${commonTabClass} ${activeTab === 'algorithms' ? activeTabClass : inactiveTabClass}`}>
                        Algorithms
                    </button>
                    <button onClick={() => setActiveTab('circuits')} className={`${commonTabClass} ${activeTab === 'circuits' ? activeTabClass : inactiveTabClass}`}>
                        Circuits
                    </button>
                </div>
            </div>
            <div className="w-full flex-grow min-h-[400px] lg:min-h-0">
                {activeTab === 'schematic' && (
                    <SchematicView 
                        graphData={props.graphData}
                        components={props.components}
                        onComponentHover={props.onComponentHover}
                        highlightedComponent={props.highlightedComponent}
                    />
                )}
                {activeTab === 'pareto' && (
                    <ParetoChart
                        data={props.paretoData}
                        selectedPoint={props.selectedPoint}
                        onPointSelect={props.onPointSelect}
                    />
                )}
                {activeTab === 'algorithms' && (
                    <AlgorithmsView />
                )}
                {activeTab === 'circuits' && (
                    <CircuitsView
                        currentNetlist={props.currentNetlist}
                        onLoadCircuit={props.onLoadCircuit}
                    />
                )}
            </div>
        </div>
    );
};

export default CenterPanel;