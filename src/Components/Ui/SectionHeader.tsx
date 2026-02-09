import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing } from '../../Constants/Spacing';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';

interface Props {
  title: string;
  /** Altındaki altın çizgiyi gizlemek için false */
  showLine?: boolean;
}

export const SectionHeader = ({ title, showLine = true }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { fontSize: calculateFontSize(14), color: colors.subtext }]}>{title}</Text>
      {showLine && <View style={[styles.line, { backgroundColor: colors.primary }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  title: {
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  line: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginTop: 6,
  },
});
