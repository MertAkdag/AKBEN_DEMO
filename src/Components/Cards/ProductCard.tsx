import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../Types/catalog';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';
import { useFavoritesStore } from '../../store/favorites/favoritesStore';

interface Props {
  product: Product;
  onPress: () => void;
  index?: number;
}

export const ProductCard = ({ product, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [imgErr, setImgErr] = useState(false);
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const GOLD = colors.catalogGold;
  const cat = product.category?.name ?? '';
  const variant = product.variant?.name ?? '';
  const showImg = product.imageUrl && !imgErr;
  const favorited = isFavorite(product.id);

  /* Favori ikonu animasyonu */
  const favScale = useSharedValue(1);
  const favStyle = useAnimatedStyle(() => ({ transform: [{ scale: favScale.value }] }));

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    lightImpact();
    toggleFavorite(product);
    favScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(Math.min(index, 8) * 60).springify()}
      style={s.cardOuter}
    >
      <Pressable
        style={[s.card, {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.08, shadowRadius: 12 },
            android: { elevation: 5 },
          }),
        }]}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); lightImpact(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        onPress={onPress}
        accessibilityRole="button"
      >
        <Animated.View style={[s.cardScaleInner, scaleStyle]}>
        <View style={[s.imgWrap, { backgroundColor: isDark ? colors.card : '#F7F5F0' }]}>
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
        {/* Favori butonu — sol üst */}
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={[s.favBtn, {
            backgroundColor: favorited ? '#EF4444' : colors.background + (isDark ? 'E6' : 'F0'),
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: favorited ? 0.3 : 0.15, shadowRadius: 4 },
              android: { elevation: favorited ? 3 : 2 },
            }),
          }]}
          activeOpacity={0.8}
        >
          <Animated.View style={favStyle}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={16}
              color={favorited ? '#FFF' : colors.subtext}
            />
          </Animated.View>
        </TouchableOpacity>
        {/* Öne çıkan rozet (şimdilik kapalı) — API'den gelen `product.featured` görünmemeli */}
        {/* {product.featured && (
          <View style={[s.featBadge, {
            backgroundColor: GOLD,
            ...Platform.select({
              ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6 },
              android: { elevation: 4 },
            }),
          }]}>
            <Ionicons name="star" size={12} color={colors.background} />
          </View>
        )} */}
      </View>

      <View style={s.content}>
        {cat ? (
          <Text style={[s.catTag, { color: GOLD }]} numberOfLines={1}>{cat}</Text>
        ) : null}
        <Text style={[s.name, { fontSize: calculateFontSize(14), color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        {variant ? (
          <View style={[s.variantPill, { borderRadius: 20,            // pill
            borderWidth: 0.5,            // 1 yerine
            backgroundColor: 'transparent', // GOLD+'12' yerine
            }]}>
            <Text style={[s.variantText, { color: GOLD }]}>{variant}</Text>
          </View>
        ) : null}
      </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  cardOuter: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardScaleInner: { flex: 1 },
  imgWrap: { aspectRatio: 1, position: 'relative' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  favBtn: {

    position: 'absolute', top: 10, left: 10,
    width: 32, height: 32, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  featBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 14 },
  catTag: {
    fontSize: 10, fontWeight: '600',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 4, opacity: 0.8,
  },
  name: {
    fontWeight: '500',
    letterSpacing: -0.2,
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
