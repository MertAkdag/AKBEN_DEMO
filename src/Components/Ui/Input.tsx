import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  /** true ise container genişliği %100 (form ekranları için) */
  fullWidth?: boolean;
}

export const CustomInput = ({ label, error, fullWidth, style, onFocus, onBlur, ...props }: Props) => {
  const { calculateWidth, calculateHeight, calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const isMultiline = props.multiline === true;

  const dynamicStyles = {
    container: {
      marginBottom: calculateHeight(16),
      width: fullWidth ? '100%' as const : calculateWidth(300),
    },
    inputWrapper: {
      height: isMultiline ? undefined : calculateHeight(50),
      minHeight: isMultiline ? calculateHeight(96) : undefined,
      alignItems: isMultiline ? ('flex-start' as const) : undefined,
      backgroundColor: colors.input,
      borderColor: error ? colors.error : isFocused ? colors.primary : 'transparent',
      borderWidth: error || isFocused ? 1.5 : 1,
    },
    input: {
      paddingHorizontal: calculateWidth(16),
      fontSize: calculateFontSize(16),
      color: colors.text,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {label && (
        <Text style={[styles.label, { fontSize: calculateFontSize(14), marginBottom: calculateHeight(8), color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.inputWrapper, dynamicStyles.inputWrapper]}>
        <TextInput
          style={[
            styles.input,
            dynamicStyles.input,
            isMultiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={colors.subtext}
          cursorColor={colors.primary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      
      {error && (
        <Text style={[styles.errorText, { fontSize: calculateFontSize(12), marginTop: calculateHeight(4), color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: 12,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
  },
  inputMultiline: {
    height: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  errorText: {},
});
