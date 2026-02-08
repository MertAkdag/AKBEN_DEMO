export type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export interface Machine {
  id: string;
  name: string;
  model: string;
  status: MachineStatus;
  location: string;
  runtime: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface MachinesResponse {
  success: boolean;
  data: Machine[];
  meta: {
    pagination: Pagination;
  };
}

export interface MachineDetailResponse {
  success: boolean;
  data: Machine;
}

//machine logs
export interface MachineLog {
  id: string;
  machineId: string;
  date: string;
  description: string;
  createdAt: string;
}

export interface PerformanceData {
  id: string;
  machineId: string;
  timestamp: string;
  metricValue: number;
  createdAt: string;
}

export interface MachineLogsResponse {
  success: boolean;
  data: MachineLog[];
}

export interface PerformanceResponse {
  success: boolean;
  data: PerformanceData[];
}

