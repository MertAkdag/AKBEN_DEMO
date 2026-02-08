import { Colors } from '../Constants/Colors';
import { MachineStatus } from '../Types/machine';

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} dk`;
  if (mins === 0) return `${hours} saat`;
  return `${hours} saat ${mins} dk`;
};

export const getStatusColor = (status: MachineStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return Colors.success;
    case 'MAINTENANCE':
      return Colors.warning;
    case 'OFFLINE':
      return Colors.error;
    default:
      return Colors.subtext;
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

