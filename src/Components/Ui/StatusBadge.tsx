import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

interface Props {
  status: string;
  showDot?: boolean;
}

export const StatusBadge = ({ status, showDot = true }: Props) => {
  const { colors } = useTheme();
  const normalizedStatus = status?.toLowerCase() || 'unknown';

  const getVariantColor = () => {
    if (['active', 'running', 'completed'].includes(normalizedStatus)) return colors.success;
    if (['maintenance', 'in-progress'].includes(normalizedStatus)) return colors.info;
    if (['pending', 'warning'].includes(normalizedStatus)) return colors.warning;
    if (['offline', 'deactivated', 'error'].includes(normalizedStatus)) return colors.error;
    return colors.subtext;
  };

  const color = getVariantColor();

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1, 
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
