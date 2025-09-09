import { Component } from '../types';

export const exportToCir = (components: Component[]): string => {
    return components.map(comp => {
        const connectionsStr = comp.connections.join(' ');
        // This is a simplified representation. A real exporter
        // would need to handle component parameters like W/L for transistors.
        return `${comp.id} (${connectionsStr}) ${comp.type}`;
    }).join('\n');
};

export const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
}
