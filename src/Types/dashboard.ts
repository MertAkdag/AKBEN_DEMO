export interface DashboardStats {
  dailyProduction: number;
  activeMachines: number;
  stoppedMachines: number;
  dailyOrders: number;
}

export interface WeeklyProduction {
  day: string;
  production: number;
}

export interface DashboardData {
  stats: DashboardStats;
  weeklyProduction: WeeklyProduction[];
}
