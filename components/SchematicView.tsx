import React, { useRef, useEffect, useMemo } from 'react';
// Fix: Changed d3 import from a single namespace import to individual function imports from d3 submodules to resolve type errors.
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, Simulation } from 'd3-force';
import { drag } from 'd3-drag';
import 'd3-transition';
import { Node, Link, ComponentType, Component } from '../types';

interface SchematicViewProps {
    graphData: { nodes: Node[], links: Link[] };
    components: Component[];
    onComponentHover: (id: string | null) => void;
    highlightedComponent: string | null;
}

const getNodeColor = (type: ComponentType) => {
    switch (type) {
        case ComponentType.PORT: return '#0ea5e9'; // sky-500
        case ComponentType.VDD: return '#ef4444'; // red-500
        case ComponentType.VSS: return '#8b5cf6'; // violet-500
        case ComponentType.NET: return '#6b7280'; // gray-500
        default: return '#10b981'; // emerald-500
    }
};

const SchematicView: React.FC<SchematicViewProps> = ({ graphData, components, onComponentHover, highlightedComponent }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const componentMap = useMemo(() => new Map(components.map(c => [c.id, c])), [components]);
    
    useEffect(() => {
        if (!svgRef.current || graphData.nodes.length === 0) return;

        const svg = select(svgRef.current);
        const width = svg.node()?.getBoundingClientRect().width || 800;
        const height = svg.node()?.getBoundingClientRect().height || 600;

        svg.selectAll("*").remove(); // Clear previous render

        const simulation = forceSimulation<Node>(graphData.nodes)
            .force("link", forceLink<Node, Link>(graphData.links).id(d => d.id).distance(40))
            .force("charge", forceManyBody().strength(-150))
            .force("center", forceCenter(width / 2, height / 2))
            // Fix: Explicitly type the generic for forceCollide to ensure 'd' is inferred as 'Node'.
            .force("collision", forceCollide<Node>().radius(d => (d.type === ComponentType.NET ? 5 : 20)));
            
        const link = svg.append("g")
            .attr("stroke", "#4b5563") // gray-600
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("stroke-width", 1.5);
        
        const node = svg.append("g")
            .selectAll("g")
            .data(graphData.nodes)
            .join("g")
            .attr("cursor", "pointer")
            .on("mouseover", (event, d) => onComponentHover(d.id))
            .on("mouseout", () => onComponentHover(null))
            .call(createDragBehavior(simulation));

        const circles = node.append("circle")
            .attr("r", d => d.type === ComponentType.NET ? 4 : 15)
            .attr("fill", d => getNodeColor(d.type))
            .attr("stroke", "#1f2937") // gray-800
            .attr("stroke-width", 2);

        node.append("text")
            .attr("x", 18)
            .attr("y", 5)
            .text(d => d.id)
            .attr("fill", "#d1d5db") // gray-300
            .style("font-size", "12px")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as Node).x || 0)
                .attr("y1", d => (d.source as Node).y || 0)
                .attr("x2", d => (d.target as Node).x || 0)
                .attr("y2", d => (d.target as Node).y || 0);
            
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
        
        // Update scaling based on component sizes
        circles.transition().duration(300)
            .attr("transform", d => {
                const component = componentMap.get(d.id);
                if (component && component.size && d.type !== ComponentType.NET) {
                    const baseSize = d.type === ComponentType.CAPACITOR ? 5 : 10;
                    const scale = 0.5 + (component.size / baseSize) * 0.5;
                    return `scale(${Math.max(0.5, Math.min(2.0, scale))})`;
                }
                return 'scale(1)';
            });

        // This helper function creates and configures the drag behavior.
        // It was renamed from "drag" to "createDragBehavior" to avoid a name
        // collision with the imported "drag" function from d3-drag.
        function createDragBehavior(simulation: Simulation<Node, undefined>) {
            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            // This 'drag' call is now unambiguously the imported d3 function.
            return drag<SVGGElement, Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

    }, [graphData, componentMap, onComponentHover]);

    useEffect(() => {
        select(svgRef.current).selectAll<SVGCircleElement, Node>("circle")
            .transition().duration(200)
            .attr("stroke", d => d.id === highlightedComponent ? '#38bdf8' : '#1f2937') // sky-400
            .attr("stroke-width", d => d.id === highlightedComponent ? 4 : 2);
    }, [highlightedComponent]);

    return (
        <div className="w-full h-full">
            <svg ref={svgRef} className="w-full h-full rounded-lg bg-gray-900"></svg>
        </div>
    );
};

export default SchematicView;