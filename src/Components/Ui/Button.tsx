import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

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
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderWidth: 0 };
      case 'secondary':
        return { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
      case 'danger':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.error };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      default:
        return { backgroundColor: colors.primary, borderWidth: 0 };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: '#FFF' };
      case 'secondary':
        return { color: colors.text };
      case 'outline':
        return { color: colors.primary };
      case 'danger':
        return { color: colors.error };
      case 'ghost':
        return { color: colors.subtext };
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
  const handlePressIn = (e: any) => {
    if (!disabled && !isLoading) lightImpact();
    props.onPressIn?.(e);
  };

  return (
    <TouchableOpacity
      {...props}
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
      onPressIn={handlePressIn}
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
