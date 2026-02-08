import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  options: string[]; 
  selected: string;  
  onSelect: (option: string) => void;
}

export const FilterSegment = ({ options, selected, onSelect }: Props) => {
  const { calculateWidth, calculateFontSize } = useResponsive();

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
                isSelected ? styles.pillActive : styles.pillInactive,
                { paddingHorizontal: calculateWidth(20) }
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[
                styles.text,
                { fontSize: calculateFontSize(13) },
                isSelected ? styles.textActive : styles.textInactive
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
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  text: {
    fontWeight: '600',
  },
  textActive: {
    color: '#FFF',
  },
  textInactive: {
    color: Colors.subtext,
  },
});