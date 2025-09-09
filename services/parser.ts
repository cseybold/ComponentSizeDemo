
import { Component, ComponentType, Node, Link } from '../types';

const parseNetlist = (netlistText: string): Component[] => {
  const components: Component[] = [];
  const lines = netlistText.split('\n').filter(line => line.trim() !== '');

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) return;

    const id = parts[0];
    const type = parts[parts.length - 1] as ComponentType;
    const connectionStr = line.substring(line.indexOf('(') + 1, line.lastIndexOf(')'));
    const connections = connectionStr.split(/\s+/);

    components.push({
      id,
      type,
      connections,
      size: 1, // Default size
    });
  });

  return components;
};

const parsePorts = (portsText: string): string[] => {
  return portsText.trim().split(/\s+/);
};

export const createGraphData = (netlistText: string, portsText: string) => {
  const components = parseNetlist(netlistText);
  const ports = parsePorts(portsText);

  const nodes: Node[] = [];
  const links: Link[] = [];
  const nodeSet = new Set<string>();

  const addNode = (id: string, type: ComponentType, size?: number) => {
    if (!nodeSet.has(id)) {
      nodes.push({ id, type, size });
      nodeSet.add(id);
    }
  };

  components.forEach(comp => {
    let nodeType = comp.type;
    if (ports.includes(comp.id)) {
        nodeType = ComponentType.PORT;
    }
    addNode(comp.id, nodeType, comp.size);
    
    comp.connections.forEach(net => {
      let netType = ComponentType.NET;
      if (ports.includes(net)) netType = ComponentType.PORT;
      if (net.toUpperCase() === 'VDD') netType = ComponentType.VDD;
      if (net.toUpperCase() === 'VSS') netType = ComponentType.VSS;
      
      addNode(net, netType);
      links.push({ source: comp.id, target: net });
    });
  });

  // Ensure all ports are added as nodes even if not connected
  ports.forEach(port => {
    if (!nodeSet.has(port)) {
      let portType = ComponentType.PORT;
      if (port.toUpperCase() === 'VDD') portType = ComponentType.VDD;
      if (port.toUpperCase() === 'VSS') portType = ComponentType.VSS;
      addNode(port, portType);
    }
  });


  return { components, nodes, links };
};
