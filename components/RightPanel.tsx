import React from 'react';
import { ComponentType, TradeOffPoint, HistoryEntry } from '../types';
import { exportToCir, downloadFile } from '../services/exporter';

interface RightPanelProps {
  selectedPoint: TradeOffPoint | null;
  highlightedComponent: string | null;
  history: HistoryEntry[];
  onRevertHistory: (entry: HistoryEntry) => void;
}

const getComponentTypeLabel = (type: ComponentType) => {
    switch(type) {
        case ComponentType.PMOS: return "PMOS";
        case ComponentType.NMOS: return "NMOS";
        case ComponentType.CAPACITOR: return "Capacitor";
        case ComponentType.TRANSMISSION_GATE: return "T-Gate";
        default: return "Other";
    }
}

const PerformanceCard: React.FC<{ label: string; value: string | number; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-gray-900 p-4 rounded-lg text-center transition-all duration-300">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-white mt-1">
      {value} <span className="text-lg font-medium text-gray-500">{unit}</span>
    </div>
  </div>
);

const RightPanel: React.FC<RightPanelProps> = ({ selectedPoint, highlightedComponent, history, onRevertHistory }) => {
  const components = selectedPoint?.components || [];
  const performanceMetrics = selectedPoint?.metrics || null;
  const displayComponents = components.filter(c => c.type !== ComponentType.NET && c.type !== ComponentType.PORT && c.type !== ComponentType.VDD && c.type !== ComponentType.VSS);

  const handleExport = () => {
    if (!selectedPoint) return;
    const cirContent = exportToCir(selectedPoint.components);
    downloadFile(`optimized_circuit_${Date.now()}.cir`, cirContent);
  };

  return (
    <aside className="lg:w-1/4 bg-gray-800 rounded-xl p-6 flex flex-col space-y-6 max-h-[95vh] overflow-y-auto">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Optimized Sizing</h2>
          <button onClick={handleExport} disabled={!selectedPoint} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition">
            Export to .cir
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto bg-gray-900 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">Component</th>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {displayComponents.length > 0 ? displayComponents.map(comp => (
                <tr key={comp.id} className={`border-b border-gray-700 transition-colors duration-200 ${comp.id === highlightedComponent ? 'bg-blue-900/50' : ''}`}>
                  <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">{comp.id}</th>
                  <td className="px-4 py-3">{getComponentTypeLabel(comp.type)}</td>
                  <td className="px-4 py-3">{comp.type === ComponentType.CAPACITOR ? `${comp.size.toFixed(2)}fF` : `${comp.size.toFixed(2)}µm`}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center p-4 text-gray-500">No solution selected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Predicted Performance</h2>
        {performanceMetrics ? (
          <div className="grid grid-cols-2 gap-4">
            <PerformanceCard label="Gain" value={performanceMetrics.gain} unit="dB" />
            <PerformanceCard label="Bandwidth" value={performanceMetrics.bandwidth} unit="MHz" />
            <PerformanceCard label="Power" value={performanceMetrics.power} unit="mW" />
            <PerformanceCard label="Slew Rate" value={performanceMetrics.slewRate} unit="V/µs" />
            <PerformanceCard label="Noise Figure" value={performanceMetrics.noiseFigure} unit="dB" />
          </div>
        ) : (
          <div className="text-center text-gray-500 rounded-lg bg-gray-900 p-8">Select a point on the Pareto Front chart to see metrics.</div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">History</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {history.length > 0 ? history.map(entry => (
            <div key={entry.id} className="bg-gray-900 p-2 rounded-lg flex justify-between items-center">
              <div className="text-xs text-gray-400">
                {entry.timestamp.toLocaleTimeString()} - {entry.target}
              </div>
              <button onClick={() => onRevertHistory(entry)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded-md transition">
                Revert
              </button>
            </div>
          )) : <div className="text-center text-sm text-gray-500">No history yet.</div>}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
