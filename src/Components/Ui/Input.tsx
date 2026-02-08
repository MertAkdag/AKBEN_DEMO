import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  /** true ise container genişliği %100 (form ekranları için) */
  fullWidth?: boolean;
}

export const CustomInput = ({ label, error, fullWidth, style, ...props }: Props) => {
  const { calculateWidth, calculateHeight, calculateFontSize } = useResponsive();
  const isMultiline = props.multiline === true;

  const dynamicStyles = {
    container: {
      marginBottom: calculateHeight(16),
      width: fullWidth ? '100%' as const : calculateWidth(300),
    },
    label: {
      fontSize: calculateFontSize(14),
      marginBottom: calculateHeight(8),
    },
    inputWrapper: {
      height: isMultiline ? undefined : calculateHeight(50),
      minHeight: isMultiline ? calculateHeight(96) : undefined,
      alignItems: isMultiline ? ('flex-start' as const) : undefined,
    },
    input: {
      paddingHorizontal: calculateWidth(16),
      fontSize: calculateFontSize(16),
    },
    errorText: {
      fontSize: calculateFontSize(12),
      marginTop: calculateHeight(4),
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {label && <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>}
      
      <View style={[styles.inputWrapper, dynamicStyles.inputWrapper, error && styles.errorBorder]}>
        <TextInput
          style={[
            styles.input,
            dynamicStyles.input,
            isMultiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={Colors.subtext}
          cursorColor={Colors.primary}
          {...props}
        />
      </View>
      
      {error && <Text style={[styles.errorText, dynamicStyles.errorText]}>{error}</Text>}
    </View>
  );
};

// Statik stiller (responsive olmayan değerler)
const styles = StyleSheet.create({
  container: {},
  label: {
    color: Colors.text,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: Colors.input,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    color: Colors.text,
    height: '100%',
  },
  inputMultiline: {
    height: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
  },
});