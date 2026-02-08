import { Stack } from 'expo-router';
import { Colors } from '../../src/Constants/Colors';

export default function MachinesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    />
  );
}

