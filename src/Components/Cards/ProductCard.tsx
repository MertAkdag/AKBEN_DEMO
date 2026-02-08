import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Product } from '../../Types/catalog';
import { useResponsive } from '../../Hooks/UseResponsive';

const CATALOG_GOLD = Colors.catalogGold;

interface Props {
  product: Product;
  onPress: () => void;
}

export const ProductCard = ({ product, onPress }: Props) => {
  const { calculateFontSize } = useResponsive();
  const [imageError, setImageError] = useState(false);
  const categoryName = product.category?.name ?? '';
  const variantName = product.variant?.name ?? '';
  const showImage = product.imageUrl && !imageError;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <View style={styles.imagePlaceholder}>
        {showImage ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imageInner}>
            <Ionicons name="diamond-outline" size={36} color={CATALOG_GOLD + '99'} />
          </View>
        )}
        {product.featured ? (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={Colors.background} />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        {categoryName ? (
          <Text style={[styles.categoryTag, { fontSize: calculateFontSize(10) }]} numberOfLines={1}>
            {categoryName}
          </Text>
        ) : null}
        <Text style={[styles.name, { fontSize: calculateFontSize(14) }]} numberOfLines={2}>
          {product.name}
        </Text>
        {variantName ? (
          <View style={styles.footer}>
            <View style={styles.variantPill}>
              <Text style={[styles.variantText, { fontSize: calculateFontSize(11) }]}>
                {variantName}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imageInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.catalogGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  categoryTag: {
    color: Colors.catalogGold,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  variantPill: {
    backgroundColor: Colors.catalogGold + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  variantText: {
    color: Colors.catalogGold,
    fontWeight: '600',
  },
});
