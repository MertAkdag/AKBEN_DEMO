import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/Context/ThemeContext';
import { useCart } from '../../src/Context/CartContext';
import { lightImpact } from '../../src/Utils/haptics';

/* ════════════════════════════════════════════
   Orantılı Layout Sistemi
   Pill radius = Bar radius − Pill inset (perfect nesting)
   ════════════════════════════════════════════ */
const TAB_COUNT = 5;
const SCREEN_W = Dimensions.get('window').width;
const BAR_MARGIN_H = 16;
const BAR_INNER_W = SCREEN_W - BAR_MARGIN_H * 2;
const TAB_W = BAR_INNER_W / TAB_COUNT;

const BAR_HEIGHT = 66;
const BAR_RADIUS = Math.round(BAR_HEIGHT / 3);
const PILL_INSET = 5;
const PILL_W = TAB_W - PILL_INSET * 2;
const PILL_H = BAR_HEIGHT - PILL_INSET * 2;
const PILL_RADIUS = BAR_RADIUS - PILL_INSET;

const SLIDE_SPRING = { damping: 26, stiffness: 240, mass: 0.7 };
const SNAP_SPRING = { damping: 22, stiffness: 280, mass: 0.6 };

/* ─── Tab tanımları ─── */
interface TabDef {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDef[] = [
  { name: 'dashboard', title: 'Anasayfa', icon: 'grid-outline', iconFocused: 'grid' },
  { name: 'favorites', title: 'Favoriler', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'catalog', title: 'Katalog', icon: 'diamond-outline', iconFocused: 'diamond' },
  { name: 'cart', title: 'Sepetim', icon: 'cart-outline', iconFocused: 'cart' },
  { name: 'profile', title: 'Profil', icon: 'person-outline', iconFocused: 'person' },
];

/* ─── Badge bileşeni ─── */
function TabBadge({ count, color, bgColor }: { count: number; color: string; bgColor: string }) {
  if (count <= 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

/* ─── Tek tab öğesi ─── */
function TabItem({ tab, focused, onPress, primaryColor, subtextColor, badge }: {
  tab: TabDef; focused: boolean; onPress: () => void; primaryColor: string; subtextColor: string; badge?: number;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 250 });
  }, [focused]);

  const labelAnim = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.5, 1], Extrapolation.CLAMP),
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onPress={() => {
        lightImpact();
        onPress();
      }}
      style={styles.tabItem}
      hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
    >
      <View>
        <Ionicons
          name={focused ? tab.iconFocused : tab.icon}
          size={20}
          color={focused ? primaryColor : subtextColor}
        />
        {(badge ?? 0) > 0 && (
          <TabBadge count={badge!} color="#FFF" bgColor={primaryColor} />
        )}
      </View>
      <Animated.Text
        style={[
          styles.tabLabel,
          { color: focused ? primaryColor : subtextColor },
          labelAnim,
        ]}
        numberOfLines={1}
      >
        {tab.title}
      </Animated.Text>
    </Pressable>
  );
}

/* ─── Worklet yardımcıları ─── */
function clampValue(val: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(val, min), max);
}

function calcPillX(idx: number): number {
  'worklet';
  return PILL_INSET + idx * TAB_W;
}

function calcTabIndex(touchX: number): number {
  'worklet';
  const raw = (touchX - BAR_MARGIN_H) / TAB_W - 0.5;
  return Math.round(clampValue(raw, 0, TAB_COUNT - 1));
}

function indexFromPillX(px: number): number {
  'worklet';
  const raw = (px - PILL_INSET) / TAB_W;
  return Math.round(clampValue(raw, 0, TAB_COUNT - 1));
}

/* ─── Floating glass tab bar ─── */
function GlassTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { totalCount } = useCart();
  const bottomPad = Math.max(insets.bottom, 12);

  const pillX = useSharedValue(calcPillX(state.index));
  const isDragging = useSharedValue(false);
  const lastHapticIdx = useSharedValue(state.index);

  useEffect(() => {
    if (!isDragging.value) {
      pillX.value = withSpring(calcPillX(state.index), SLIDE_SPRING);
    }
  }, [state.index]);

  /* JS thread callback'leri */
  const navigateToIndex = useCallback((idx: number) => {
    const route = state.routes[idx];
    if (route && state.index !== idx) {
      lightImpact();
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }
  }, [state, navigation]);

  const doHaptic = useCallback(() => {
    lightImpact();
  }, []);

  /* Pan gesture */
  const panGesture = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-10, 10])
      .failOffsetY([-15, 15])
      .onStart(() => {
        'worklet';
        isDragging.value = true;
      })
      .onUpdate((e) => {
        'worklet';
        const targetIdx = calcTabIndex(e.absoluteX);
        const targetX = calcPillX(targetIdx);
        pillX.value = withSpring(targetX, { damping: 30, stiffness: 350, mass: 0.5 });

        if (targetIdx !== lastHapticIdx.value) {
          lastHapticIdx.value = targetIdx;
          runOnJS(doHaptic)();
        }
      })
      .onEnd(() => {
        'worklet';
        isDragging.value = false;
        const currentIdx = indexFromPillX(pillX.value);
        const snapX = calcPillX(currentIdx);
        pillX.value = withSpring(snapX, SNAP_SPRING);
        runOnJS(navigateToIndex)(currentIdx);
      }),
    [navigateToIndex, doHaptic]
  );

  const pillAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const dynamicStyles = useMemo(() => ({
    barWrapper: {
      borderColor: isDark ? colors.text + '08' : colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: 24,
        },
        android: { elevation: 16 },
      }),
    } as any,
    glassOverlay: { backgroundColor: colors.glassOverlay },
    pillInner: {
      backgroundColor: colors.primary + '1A',
      borderColor: colors.primary + '28',
    },
    pillGlow: { backgroundColor: colors.primary },
  }), [colors, isDark]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.barWrapper, { bottom: bottomPad }, dynamicStyles.barWrapper]} collapsable={false}>
        {/* Glass arka plan */}
        <BlurView intensity={Platform.OS === 'ios' ? 60 : 0} tint={isDark ? 'dark' : 'light'} style={styles.blurFill}>
          <View style={[styles.glassOverlay, dynamicStyles.glassOverlay]} />
        </BlurView>

        {/* Kayan pill */}
        <Animated.View style={[styles.pill, pillAnim]}>
          <View style={[styles.pillInner, dynamicStyles.pillInner]} />
          <View style={[styles.pillGlow, dynamicStyles.pillGlow]} />
        </Animated.View>

        {/* Tab öğeleri */}
        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          return (
            <TabItem
              key={route.key}
              tab={tab}
              focused={state.index === index}
              primaryColor={colors.primary}
              subtextColor={colors.subtext}
              badge={tab.name === 'cart' ? totalCount : undefined}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (state.index !== index && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

/* ─── Layout ─── */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}

/* ─── Stiller ─── */
const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    left: BAR_MARGIN_H,
    right: BAR_MARGIN_H,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pill: {
    position: 'absolute',
    top: PILL_INSET,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
  },
  pillInner: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: PILL_RADIUS,
  },
  pillGlow: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    opacity: 0.25,
    borderRadius: 1,
  },
  tabItem: {
    width: TAB_W,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});
