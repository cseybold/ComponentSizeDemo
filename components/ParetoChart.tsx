import React, { useRef, useEffect } from 'react';
// Fix: Changed d3 import from a single namespace import to individual function imports from d3 submodules to resolve type errors.
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import 'd3-transition';
import { TradeOffPoint } from '../types';

interface ParetoChartProps {
    data: {
        paretoFront: TradeOffPoint[],
        allPoints: TradeOffPoint[],
    };
    selectedPoint: TradeOffPoint | null;
    onPointSelect: (point: TradeOffPoint) => void;
}

const ParetoChart: React.FC<ParetoChartProps> = ({ data, selectedPoint, onPointSelect }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data) return;
        
        // Fix: Use 'select' directly instead of 'd3.select'
        const svg = select(svgRef.current);
        const { width, height } = svg.node()!.getBoundingClientRect();
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        svg.selectAll("*").remove(); // Clear previous render

        const allMetrics = data.allPoints.map(p => p.metrics);
        if (allMetrics.length === 0) return;

        // Scales
        // Fix: Use 'scaleLinear' and 'max' directly
        const xScale = scaleLinear()
            .domain([0, max(allMetrics, d => d.power)! * 1.1])
            .range([margin.left, width - margin.right]);

        const yScale = scaleLinear()
            .domain([0, max(allMetrics, d => d.gain)! * 1.1])
            .range([height - margin.bottom, margin.top]);

        // Axes
        // Fix: Use 'axisBottom' directly
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(axisBottom(xScale))
            .attr("color", "#9ca3af");
        
        // Fix: Use 'axisLeft' directly
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(axisLeft(yScale))
            .attr("color", "#9ca3af");

        // Axis Labels
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("fill", "#d1d5db")
            .style("font-size", "12px")
            .text("Power (mW)");
        
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("x", -height / 2)
            .attr("fill", "#d1d5db")
            .style("font-size", "12px")
            .text("Gain (dB)");

        // Tooltip
        // Fix: Use 'select' directly
        const tooltip = select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "rgba(0,0,0,0.8)")
            .style("border-radius", "8px")
            .style("padding", "8px")
            .style("color", "#fff")
            .style("font-size", "12px");

        // Draw all points (the solution space)
        svg.append("g")
            .selectAll("circle")
            .data(data.allPoints)
            .join("circle")
            .attr("cx", d => xScale(d.metrics.power))
            .attr("cy", d => yScale(d.metrics.gain))
            .attr("r", 3)
            .attr("fill", "#4b5563"); // gray-600

        // Draw Pareto front points
        svg.append("g")
            .selectAll("circle")
            .data(data.paretoFront)
            .join("circle")
            .attr("cx", d => xScale(d.metrics.power))
            .attr("cy", d => yScale(d.metrics.gain))
            .attr("r", 5)
            .attr("fill", "#0ea5e9") // sky-500
            .attr("stroke", "#1f2937")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("click", (event, d) => onPointSelect(d))
            .on("mouseover", (event, d) => {
                tooltip.html(`Gain: ${d.metrics.gain} dB<br/>Power: ${d.metrics.power} mW`)
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", (event) => {
                return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                return tooltip.style("visibility", "hidden");
            });
        
        // Highlight selected point
        svg.selectAll("circle")
            .data(data.paretoFront)
            .transition().duration(200)
            .attr("r", d => d.id === selectedPoint?.id ? 8 : 5)
            .attr("fill", d => d.id === selectedPoint?.id ? '#f59e0b' : '#0ea5e9') // amber-500 for selected
            .attr("stroke", d => d.id === selectedPoint?.id ? '#fde047' : '#1f2937'); // yellow-300 stroke for selected

        // Draw line connecting Pareto points
        // Fix: Use 'line' directly
        const lineGenerator = line<TradeOffPoint>()
            .x(d => xScale(d.metrics.power))
            .y(d => yScale(d.metrics.gain));
        
        svg.append("path")
            .datum(data.paretoFront)
            .attr("fill", "none")
            .attr("stroke", "#0ea5e9")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.5)
            .attr("d", lineGenerator);


        return () => {
            tooltip.remove();
        };

    }, [data, selectedPoint, onPointSelect]);

    return (
        <div className="w-full h-full rounded-lg bg-gray-900">
            <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
    );
};

export default ParetoChart;