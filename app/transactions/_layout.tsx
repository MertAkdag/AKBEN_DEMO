import { Stack } from 'expo-router';
import { useTheme } from '../../src/Context/ThemeContext';

export default function TransactionsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    />
  );
}
