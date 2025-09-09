import { initialNetlist, initialPorts } from '../constants';

export interface CircuitInfo {
  id: string;
  name: string;
  description: string;
  keyStats: { transistors: number; capacitors: number; gates: number };
  bestPerformance: string;
  netlist: string;
  ports: string;
}

const fiveTransistorOtaNetlist = `
M_IN_N (VOUT N_IN_N N_TAIL VSS) nmos4
M_IN_P (N_1 N_IN_P N_TAIL VSS) nmos4
M_LOAD_N (VOUT N_LOAD N_1 VDD) pmos4
M_LOAD_P (N_1 N_LOAD N_1 VDD) pmos4
M_TAIL (N_TAIL VBIAS VSS VSS) nmos4
`.trim();
const fiveTransistorOtaPorts = `VDD VSS N_IN_N N_IN_P VOUT VBIAS`;

const comparatorNetlist = `
M_LATCH_1 (N_OUT_P N_OUT_N N_IN_P VSS) nmos4
M_LATCH_2 (N_OUT_N N_OUT_P N_IN_N VSS) nmos4
M_RESET_1 (N_OUT_P VCLK VDD VDD) pmos4
M_RESET_2 (N_OUT_N VCLK VDD VDD) pmos4
`.trim();
const comparatorPorts = `VDD VSS N_IN_P N_IN_N N_OUT_P N_OUT_N VCLK`;

export const sampleCircuits: CircuitInfo[] = [
  {
    id: 'op_amp_folded_cascode',
    name: 'Folded-Cascode Op-Amp',
    description: 'A standard high-gain operational amplifier topology, suitable for precision applications.',
    keyStats: { transistors: 8, capacitors: 2, gates: 6 },
    bestPerformance: 'Gain: 78dB @ 1.5mW',
    netlist: initialNetlist,
    ports: initialPorts,
  },
  {
    id: 'five_transistor_ota',
    name: '5T OTA',
    description: 'A simple Five-Transistor Operational Transconductance Amplifier. Good for high-speed, low-power scenarios.',
    keyStats: { transistors: 5, capacitors: 0, gates: 0 },
    bestPerformance: 'Gain: 45dB @ 0.8mW',
    netlist: fiveTransistorOtaNetlist,
    ports: fiveTransistorOtaPorts,
  },
  {
    id: 'dynamic_comparator',
    name: 'Dynamic Latch Comparator',
    description: 'A high-speed, low-power comparator that relies on a clock signal to perform comparisons.',
    keyStats: { transistors: 4, capacitors: 0, gates: 0 },
    bestPerformance: 'Speed: 2.5GHz @ 0.5mW',
    netlist: comparatorNetlist,
    ports: comparatorPorts,
  }
];
