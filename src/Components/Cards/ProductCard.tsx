import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../Types/catalog';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  product: Product;
  onPress: () => void;
  index?: number;
}

export const ProductCard = ({ product, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const [imgErr, setImgErr] = useState(false);
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const GOLD = colors.catalogGold;
  const cat = product.category?.name ?? '';
  const variant = product.variant?.name ?? '';
  const showImg = product.imageUrl && !imgErr;

  return (
    <AnimPressable
      entering={FadeInDown.duration(400).delay(index * 60).springify()}
      style={[s.card, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.08, shadowRadius: 12 },
          android: { elevation: 5 },
        }),
      }, scaleStyle]}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); lightImpact(); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[s.imgWrap, { backgroundColor: colors.background }]}>
        {showImg ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={s.img}
            contentFit="cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <View style={s.placeholder}>
            <View style={[s.placeholderIcon, { backgroundColor: GOLD + '08' }]}>
              <Ionicons name="diamond-outline" size={32} color={GOLD + '50'} />
            </View>
          </View>
        )}
        {product.featured && (
          <View style={[s.featBadge, {
            backgroundColor: GOLD,
            ...Platform.select({
              ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6 },
              android: { elevation: 4 },
            }),
          }]}>
            <Ionicons name="star" size={10} color={colors.background} />
          </View>
        )}
      </View>

      <View style={s.content}>
        {cat ? (
          <Text style={[s.catTag, { color: GOLD }]} numberOfLines={1}>{cat}</Text>
        ) : null}
        <Text style={[s.name, { fontSize: calculateFontSize(14), color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        {variant ? (
          <View style={[s.variantPill, { backgroundColor: GOLD + '12', borderColor: GOLD + '18' }]}>
            <Text style={[s.variantText, { color: GOLD }]}>{variant}</Text>
          </View>
        ) : null}
      </View>
    </AnimPressable>
  );
};

const s = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  imgWrap: { aspectRatio: 1, position: 'relative' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  featBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 14 },
  catTag: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 4, opacity: 0.8,
  },
  name: {
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
  },
  variantPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  variantText: { fontSize: 11, fontWeight: '600' },
});
