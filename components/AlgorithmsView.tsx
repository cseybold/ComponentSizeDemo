import React from 'react';

const algorithms = [
    {
        rank: 1,
        name: 'Genetic Algorithm',
        performanceScore: 95.2,
        avgRuntime: '15.2s',
        description: 'Excellent at exploring a wide solution space to find global optima. Tends to produce superior Pareto fronts but can be computationally intensive.',
        params: 'Population Size, Iterations, Mutation Rate'
    },
    {
        rank: 2,
        name: 'Simulated Annealing',
        performanceScore: 88.5,
        avgRuntime: '8.9s',
        description: 'A faster, probabilistic technique good for finding a good-enough solution quickly. May get stuck in local optima compared to genetic algorithms.',
        params: 'Initial Temperature, Cooling Rate'
    }
];

const AlgorithmsView: React.FC = () => {
    return (
        <div className="w-full h-full p-4 overflow-y-auto bg-gray-900 rounded-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Rank</th>
                            <th scope="col" className="px-6 py-3">Algorithm</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 text-center">Avg. Runtime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {algorithms.map((algo, index) => (
                            <tr key={algo.name} className={`border-b border-gray-700 ${index === 0 ? 'bg-emerald-900/30' : ''}`}>
                                <td className="px-6 py-4 font-bold text-lg text-white">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${index === 0 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                                        #{algo.rank}
                                    </div>
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                    <div className="text-base">{algo.name}</div>
                                    <div className="font-normal text-xs text-cyan-400">Score: {algo.performanceScore}</div>
                                </th>
                                <td className="px-6 py-4">
                                    <p className="max-w-md">{algo.description}</p>
                                    <div className="text-xs mt-2 text-gray-500">
                                        <strong>Key Params:</strong> {algo.params}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-white font-mono">{algo.avgRuntime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlgorithmsView;
