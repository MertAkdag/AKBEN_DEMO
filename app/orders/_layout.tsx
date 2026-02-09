import { Stack } from 'expo-router';
import { useTheme } from '../../src/Context/ThemeContext';

export default function OrdersLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="add" options={{ title: 'Yeni cari' }} />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
