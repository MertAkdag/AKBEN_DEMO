import {
  MachinesResponse,
  MachineDetailResponse,
  MachineLogsResponse,
  PerformanceResponse,
} from '../Types/machine';
import {
  getMockMachines,
  getMockMachineById,
  getMockMachineLogs,
  getMockPerformance,
} from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const machineService = {
  async getMachines(page = 1, pageSize = 10): Promise<MachinesResponse> {
    await delay(350);
    return getMockMachines(page, pageSize);
  },

  async getMachineById(id: string): Promise<MachineDetailResponse> {
    await delay(300);
    const result = getMockMachineById(id);
    if (!result) throw new Error('Makine bulunamadı');
    return result;
  },

  async getMachineLogs(id: string): Promise<MachineLogsResponse> {
    await delay(250);
    return getMockMachineLogs(id);
  },

  async getMachinePerformance(id: string): Promise<PerformanceResponse> {
    await delay(300);
    return getMockPerformance(id);
  },
};
