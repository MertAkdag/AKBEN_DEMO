import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../src/Context/ThemeContext';
import { lightImpact } from '../src/Utils/haptics';

const { width: SW } = Dimensions.get('window');
export const ONBOARDING_KEY = 'akben_onboarding_seen';

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'diamond-outline',
    color: '#C9963B',
    title: 'Alışveriş\nCebinizde',
    subtitle: 'Katalogu inceleyin, ürünleri seçin ve sipariş oluşturun.',
  },
  {
    id: '2',
    icon: 'trending-up-outline',
    color: '#10B981',
    title: 'Anlık Piyasa\nFiyatları',
    subtitle: 'Gram altın, ayar ve döviz kurlarını canlı takip edin. Fırsatları kaçırmayın.',
  },
  {
    id: '3',
    icon: 'car-outline',
    color: '#3B82F6',
    title: 'Sipariş ve\nKargo Takip',
    subtitle: 'Sipariş oluşturun, kargo sürecini takip edin. Müşterilerinize zamanında ulaşın.',
  },
];

// ─── Animasyonlu dot ─────────────────────────────────────────────────────────
function Dot({
  index,
  activeIndex,
  color,
}: {
  index: number;
  activeIndex: Animated.SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    return {
      width: withSpring(isActive ? 24 : 6, { damping: 15, stiffness: 200 }),
      opacity: withSpring(isActive ? 1 : 0.35, { damping: 15, stiffness: 200 }),
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIndex = useSharedValue(0);

  // Başlangıç değerini ayarla
  useEffect(() => {
    activeIndex.value = 0;
  }, [activeIndex]);

  const handleDone = useCallback(async () => {
    lightImpact();
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  }, [router]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      lightImpact();
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * SW, animated: true });
      setCurrentIndex(next);
      activeIndex.value = next;
    } else {
      handleDone();
    }
  }, [currentIndex, handleDone, activeIndex]);

  const handleScroll = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / SW);
      if (idx >= 0 && idx < SLIDES.length && idx !== currentIndex) {
        setCurrentIndex(idx);
        activeIndex.value = idx;
      }
    },
    [currentIndex, activeIndex],
  );

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / SW);
      if (idx >= 0 && idx < SLIDES.length) {
        setCurrentIndex(idx);
        activeIndex.value = idx;
      }
    },
    [activeIndex],
  );

  const isLast = currentIndex === SLIDES.length - 1;
  const currentColor = SLIDES[currentIndex].color;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          onPress={handleDone}
          style={[styles.skipBtn, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          }]}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Text style={[styles.skipText, { color: colors.subtext }]}>Geç</Text>
        </TouchableOpacity>
      )}

      {/* Slider */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        decelerationRate="fast"
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* İkon bloğu */}
            <View
              style={[
                styles.iconOuter,
                {
                  backgroundColor: slide.color + '0C',
                  borderColor: slide.color + '20',
                  ...Platform.select({
                    ios: {
                      shadowColor: slide.color,
                      shadowOffset: { width: 0, height: 16 },
                      shadowOpacity: 0.18,
                      shadowRadius: 32,
                    },
                    android: { elevation: 10 },
                  }),
                },
              ]}
            >
              <View
                style={[
                  styles.iconInner,
                  {
                    backgroundColor: slide.color + '16',
                    borderColor: slide.color + '28',
                  },
                ]}
              >
                <Ionicons name={slide.icon} size={68} color={slide.color} />
              </View>
            </View>

            {/* Metin */}
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 50 : 32 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} activeIndex={activeIndex} color={currentColor} />
          ))}
        </View>

        {/* Next / Start butonu */}
        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.nextBtn,
            {
              backgroundColor: currentColor,
              ...Platform.select({
                ios: {
                  shadowColor: currentColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                },
                android: { elevation: 8 },
              }),
            },
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? 'Başla' : 'İleri'}
          </Text>
          <Ionicons
            name={isLast ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 38,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipText: { fontSize: 13, fontWeight: '600' },

  scrollView: { flex: 1 },
  scrollContent: { alignItems: 'stretch' },

  slide: {
    width: SW,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 32,
  },

  iconOuter: {
    width: 192,
    height: 192,
    borderRadius: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52,
  },
  iconInner: {
    width: 148,
    height: 148,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 300,
  },

  footer: {
    paddingHorizontal: 24,
    gap: 28,
    alignItems: 'center',
    paddingTop: 8,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', height: 16 },
  dot: { height: 6, borderRadius: 3 },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
