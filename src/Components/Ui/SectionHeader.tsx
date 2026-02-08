import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Spacing } from '../../Constants/Spacing';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  title: string;
  /** Altındaki altın çizgiyi gizlemek için false */
  showLine?: boolean;
}

export const SectionHeader = ({ title, showLine = true }: Props) => {
  const { calculateFontSize } = useResponsive();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { fontSize: calculateFontSize(14) }]}>{title}</Text>
      {showLine && <View style={styles.line} />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  title: {
    color: Colors.subtext,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  line: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
});
