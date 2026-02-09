import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';

interface Props extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchInput = ({ value, onChangeText, placeholder = 'Search...', ...props }: Props) => {
  const { calculateHeight, calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, {
      height: calculateHeight(48),
      backgroundColor: colors.input,
      borderColor: 'transparent',
    }]}>
      <Ionicons name="search-outline" size={20} color={colors.subtext} style={styles.icon} />
      <TextInput
        style={[styles.input, { fontSize: calculateFontSize(15), color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        cursorColor={colors.primary}
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
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
});
