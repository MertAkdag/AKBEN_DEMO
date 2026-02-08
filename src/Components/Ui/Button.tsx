import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { useResponsive } from '../../Hooks/UseResponsive';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'sm';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant; 
  size?: ButtonSize;       
  isLoading?: boolean;
  icon?: React.ReactNode;
  /** Form ekranları için tam genişlik */
  fullWidth?: boolean;
}

export const Button = ({ 
  title, 
  variant = 'primary', 
  size = 'default', 
  isLoading, 
  fullWidth,
  style, 
  disabled, 
  ...props 
}: Props) => {

  const { calculateHeight, calculateFontSize, calculateWidth } = useResponsive();
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: Colors.primary, borderWidth: 0 };
      case 'secondary':
        return { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary };
      case 'danger':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.error };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      default:
        return { backgroundColor: Colors.primary, borderWidth: 0 };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: '#FFF' };
      case 'secondary':
        return { color: Colors.text };
      case 'outline':
        return { color: Colors.primary };
      case 'danger':
        return { color: Colors.error };
      case 'ghost':
        return { color: Colors.subtext };
      default:
        return { color: '#FFF' };
    }
  };

  const containerHeight = calculateHeight(size === 'sm' ? 36 : 50);
  const fontSize = calculateFontSize(size === 'sm' ? 14 : 16);
  const borderRadius = calculateWidth(12);
  const horizontalPadding = calculateWidth(16);
  const BaseStyle = {
    width: fullWidth ? '100%' as const : calculateWidth(300),
    height: containerHeight,
  };
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { borderRadius, paddingHorizontal: horizontalPadding },
        BaseStyle,
        getContainerStyle(),
        disabled && styles.disabled,
        style, 
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextStyle().color} />
      ) : (
        <Text style={[styles.text, { fontSize }, getTextStyle()]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});