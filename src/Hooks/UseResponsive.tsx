import { Dimensions } from 'react-native';

const BASE_WIDTH = 402;
const BASE_HEIGHT = 874;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

export function useResponsive() {
  const calculateWidth = (value: number) => {
    return (DEVICE_WIDTH / BASE_WIDTH) * value;
  };

  const calculateHeight = (value: number) => {
    return (DEVICE_HEIGHT / BASE_HEIGHT) * value;
  };

  const calculateFontSize = (value: number) => { 
    return (DEVICE_WIDTH / BASE_WIDTH) * value;
  };

  const calculateIconSize = (value: number) => {
    return (DEVICE_WIDTH / BASE_WIDTH) * value;
  };

  return {
    calculateWidth,
    calculateHeight,
    calculateFontSize,
    calculateIconSize,
    DEVICE_WIDTH,
    DEVICE_HEIGHT,
  };
}