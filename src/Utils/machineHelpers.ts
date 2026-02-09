import { MachineStatus } from '../Types/machine';
import type { ThemeColors } from '../Constants/Theme';
import { DarkTheme } from '../Constants/Theme';

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} dk`;
  if (mins === 0) return `${hours} saat`;
  return `${hours} saat ${mins} dk`;
};

export const getStatusColor = (status: MachineStatus, colors: ThemeColors = DarkTheme): string => {
  switch (status) {
    case 'ACTIVE':
      return colors.success;
    case 'MAINTENANCE':
      return colors.warning;
    case 'OFFLINE':
      return colors.error;
    default:
      return colors.subtext;
  }
};

export const getStatusText = (status: MachineStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Çalışıyor';
    case 'MAINTENANCE':
      return 'Bakımda';
    case 'OFFLINE':
      return 'Kapalı';
    default:
      return 'Bilinmiyor';
  }
};
