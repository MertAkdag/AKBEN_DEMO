import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
}


export const SearchInput = ({ value, onChangeText, placeholder = 'Search...', ...props }: Props) => {
  const { calculateHeight, calculateFontSize } = useResponsive();

  return (
    <View style={[styles.container, { height: calculateHeight(48) }]}>
      <Ionicons name="search-outline" size={20} color={Colors.subtext} style={styles.icon} />
      <TextInput
        style={[styles.input, { fontSize: calculateFontSize(15) }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.subtext}
        cursorColor={Colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search input"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    height: '100%',
  },
});
