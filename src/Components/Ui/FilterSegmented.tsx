import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';

interface Props {
  options: string[]; 
  selected: string;  
  onSelect: (option: string) => void;
}

export const FilterSegment = ({ options, selected, onSelect }: Props) => {
  const { calculateWidth, calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.pill,
                { paddingHorizontal: calculateWidth(20) },
                isSelected
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[
                styles.text,
                { fontSize: calculateFontSize(13) },
                isSelected ? { color: '#FFF' } : { color: colors.subtext },
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    flexDirection: 'row',
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
});
