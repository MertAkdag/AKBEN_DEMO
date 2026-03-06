import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolateColor } from 'react-native-reanimated';

interface Props extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  // VİZYONER EKLENTİLER BURADA BAŞLIYOR
  onFilterPress?: () => void; // Filtre butonuna basıldığında tetiklenecek
  activeFilterCount?: number; // Aktif filtre sayısını gösteren rozet için
}

export const SearchInput = forwardRef<TextInput, Props>(({ 
  value, 
  onChangeText, 
  placeholder = 'Koleksiyonda ara...', 
  onClear,
  onFilterPress,
  activeFilterCount = 0,
  ...props 
}, ref) => {
  const { calculateHeight, calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  
  const focusProgress = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [colors.input, colors.primary] 
      ),
      backgroundColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [colors.input, colors.card]
      ),
    };
  });

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <Animated.View style={[
      styles.container, 
      { height: calculateHeight(48) }, 
      animatedContainerStyle
    ]}>
      {/* Sol Taraftaki Büyüteç */}
      <Ionicons 
        name="search-outline" 
        size={20} 
        color={value.length > 0 ? colors.primary : colors.subtext} 
        style={styles.icon} 
      />
      
      {/* Ana Metin Giriş Alanı */}
      <TextInput
        ref={ref}
        style={[styles.input, { fontSize: calculateFontSize(15), color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        cursorColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Arama kutusu"
        onFocus={(e) => {
          focusProgress.value = withTiming(1, { duration: 250 });
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          focusProgress.value = withTiming(0, { duration: 250 });
          props.onBlur?.(e);
        }}
        {...props}
      />

      {/* Sağ Taraf - Aksiyon Bölgesi */}
      <View style={styles.rightActions}>
        {/* Metin Varsa Temizle Butonu */}
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.actionButton}>
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </TouchableOpacity>
        )}

        {/* Filtre Prop'u Geçilmişse Filtre Butonunu Göster */}
        {onFilterPress && (
          <View style={styles.filterWrapper}>
            {/* Premium Ayıraç Çizgisi */}
            <View style={[styles.divider, { backgroundColor: colors.subtext, opacity: 0.2 }]} />
            
            <TouchableOpacity 
              onPress={onFilterPress} 
              activeOpacity={0.7} 
              style={[
                styles.actionButton, 
                // Filtre aktifse arka planı ana rengin çok saydam hali yap (örnek: altın sarısı)
                activeFilterCount > 0 && { backgroundColor: colors.primary + '15', borderRadius: 8 }
              ]}
            >
              <Ionicons 
                name="options" 
                size={20} 
                color={activeFilterCount > 0 ? colors.primary : colors.text} 
              />
              
              {/* Aktif Filtre Rozeti */}
              {activeFilterCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

    </Animated.View>
  );
});

SearchInput.displayName = 'SearchInput';

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
    ...Platform.select({
      android: {
        paddingVertical: 0, 
      }
    })
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF', // Arka planla karışmaması için
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  }
});