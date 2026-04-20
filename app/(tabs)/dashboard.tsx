import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { catalogService } from '../../src/Api/catalogService';
import { ProductOfWeekSlider } from '../../src/Components/Cards/ProductOfWeekSlider';
import type { Product } from '../../src/Types/catalog';
import { useGoldPrice } from '../../src/Context/GoldPriceContext';
import { useTheme } from '../../src/Context/ThemeContext';
import { useFavoritesStore } from '../../src/store/favorites/favoritesStore';
import { lightImpact } from '../../src/Utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ThemeColors } from '../../src/Constants/Theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/useAuth';

// Kendi yazdığımız modern bileşeni import ediyoruz. (Dosya yolunu kendine göre ayarla)
import ModernStoryViewer from '../story/ModernStoryViewer';

/* ─── Layout & Data ─── */
const SW = Dimensions.get('window').width;
const PAD = 16;
const TAB_H = 100;
const BANNER_W = SW - PAD * 2;
const BANNER_H = 172;

const BANNERS = [
  { key: 'b1', badge: '🔥 Kampanya', title: 'Düğün Sezonuna\nÖzel Koleksiyon', subtitle: '22 Ayar Altın Set', accent: '#C9963B', bg: '#1A1108', deco1: '#C9963B22', deco2: '#C9963B10' },
  { key: 'b2', badge: '✨ Yeni Sezon', title: 'Minimal Tasarım\nYüzük Serisi', subtitle: '22 Ayar Altın', accent: '#7C6CF5', bg: '#0F0D1F', deco1: '#7C6CF540', deco2: '#7C6CF515' },
];

// Modern Story Veri Yapısı
const STORY_DATA = [
  {
    id: 'story1',
    name: 'Yeni Sezon',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200' },
    stories: [
      { id: 's1_1', source: { uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800' }, mediaType: 'image' },
      { id: 's1_2', source: { uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800' }, mediaType: 'image' },
    ]
  },
  {
    id: 'story2',
    name: 'Kampanya',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=200' },
    stories: [
      { id: 's2_1', source: { uri: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800' }, mediaType: 'image' },
    ]
  },
  {
    id: 'story3',
    name: 'Küpeler',
    avatarSource: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_kupe_banner.jpg' },
    stories: [
      { id: 's3_1', source: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_kupe_banner.jpg' }, mediaType: 'image' },
    ]
  },
  {
    id: 'story4',
    name: 'Yüzükler',
    avatarSource: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_yuzuk_banner.jpg' },
    stories: [
      { id: 's4_1', source: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_yuzuk_banner.jpg' }, mediaType: 'image' },
    ]
  },
  {
    id: 'story5',
    name: 'Kelepçeler',
    avatarSource: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_kelepce_banner.jpg' },
    stories: [
      { id: 's5_1', source: { uri: 'https://akbenkuyumculuk.com/wp-content/uploads/2019/06/akben_kelepce_banner.jpg' }, mediaType: 'image' },
    ]
  },
];

/* ─── Bileşenler ─── */
function PromoBanner({ item }: { item: typeof BANNERS[number] }) {
  return (
    <View style={[styles.banner, { backgroundColor: item.bg }]}>
      <View style={[styles.bannerCircle1, { backgroundColor: item.deco1 }]} />
      <View style={[styles.bannerCircle2, { backgroundColor: item.deco2 }]} />
      <View style={[styles.bannerIconWrap, { backgroundColor: item.accent + '20', borderColor: item.accent + '40' }]}>
        <Ionicons name="diamond" size={32} color={item.accent} />
      </View>
      <View style={styles.bannerTop}>
        <View style={[styles.bannerBadge, { backgroundColor: item.accent + '25', borderColor: item.accent + '50' }]}>
          <Text style={[styles.bannerBadgeText, { color: item.accent }]}>{item.badge}</Text>
        </View>
      </View>
      <View style={styles.bannerBottom}>
        <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>{item.title}</Text>
        <Text style={[styles.bannerSubtitle, { color: item.accent }]}>{item.subtitle}</Text>
        <View style={[styles.bannerBtn, { backgroundColor: item.accent }]}>
          <Text style={styles.bannerBtnText}>İncele</Text>
          <Ionicons name="arrow-forward" size={12} color="#FFF" />
        </View>
      </View>
    </View>
  );
}

// Yeni Story Avatar Bileşeni
function StoryAvatar({ story, colors, onPress }: { story: typeof STORY_DATA[0]; colors: ThemeColors; onPress: () => void; }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.storyAvatarWrap}>
      <View style={[styles.storyRing, { borderColor: '#C9963B' }]}>
        <Image source={{ uri: story.avatarSource.uri }} style={styles.storyImage} contentFit="cover" />
      </View>
      <Text style={[styles.storyName, { color: colors.text }]} numberOfLines={1}>{story.name}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const goldPrice = useGoldPrice();
  const router = useRouter();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [bannerPage, setBannerPage] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  
  // Hikaye state'i
  const [selectedStory, setSelectedStory] = useState<typeof STORY_DATA[0] | null>(null);

  const bannerRef = useRef<FlatList>(null);

  const gram = goldPrice.items.find((i) => i.key === 'gold');
  const usd = goldPrice.items.find((i) => i.key === 'usd');
  const gramSell = gram?.sell ?? 0;
  const usdSell = usd?.sell ?? 0;

  useEffect(() => {
    catalogService.getFeaturedProducts().then((res) => setFeaturedProducts(res.data)).finally(() => setFeaturedLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    goldPrice.refresh().catch(() => { }).finally(() => setRefreshing(false));
  }, [goldPrice]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── 1. Top Bar ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.text }]}>Merhaba, {user?.name?.split(' ')[0] || 'Kuyumcu'} 👋</Text>
            <View style={styles.floatingPricesWrap}>
              <Text style={[styles.floatingPriceText, { color: colors.subtext }]}>
                Has: <Text style={{ color: '#C9963B', fontWeight: '800' }}>{gramSell > 0 ? gramSell.toLocaleString('tr-TR') : '—'} ₺</Text>
              </Text>
              <Text style={[styles.floatingDivider, { color: colors.subtext }]}> • </Text>
              <Text style={[styles.floatingPriceText, { color: colors.subtext }]}>
                Dolar: <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{usdSell > 0 ? usdSell.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '—'} ₺</Text>
              </Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => { lightImpact(); router.push('/notifications'); }}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── 2. Search Bar ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.searchContainer}>
          <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} activeOpacity={0.9} onPress={() => router.push('/catalog')}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <Text style={[styles.searchText, { color: colors.subtext }]}>Koleksiyonda ara...</Text>
            <View style={[styles.searchFilterBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="options" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── 3. Hikayeler (Stories) ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.storiesContainer}>
          <FlatList
            data={STORY_DATA}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyRow}
            renderItem={({ item }) => (
              <StoryAvatar 
                story={item} 
                colors={colors} 
                onPress={() => setSelectedStory(item)} 
              />
            )}
          />
        </Animated.View>

        {/* ── 4. Promosyon Banner Carousel ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.bannerWrap}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            keyExtractor={(b) => b.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_W + 12}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12 }}
            onScroll={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12));
              if (page !== bannerPage) setBannerPage(page);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => <PromoBanner item={item} />}
          />
        </Animated.View>

        {/* ── 5. Günün Fırsatları ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Öne Çıkanlar</Text>
          <TouchableOpacity onPress={() => router.push('/catalog')}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        <ProductOfWeekSlider products={featuredProducts} isLoading={featuredLoading} />

      </Animated.ScrollView>

      {/* ── Modal Katmanı (Performans için ScrollView dışında olmalı) ── */}
      <ModernStoryViewer 
        isVisible={!!selectedStory} 
        userStory={selectedStory} 
        onClose={() => setSelectedStory(null)} 
      />

    </SafeAreaView>
  );
}

/* ═══ Styles ═══ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: PAD, paddingBottom: TAB_H },

  /* Top Bar */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 16 },
  userName: { fontSize: 22, fontWeight: '800' },
  floatingPricesWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  floatingPriceText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
  floatingDivider: { fontSize: 13, marginHorizontal: 6, opacity: 0.5 },
  topBarActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  /* Search */
  searchContainer: { marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1 },
  searchText: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },
  searchFilterBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  /* Stories */
  storiesContainer: { marginBottom: 24 },
  storyRow: { gap: 16, paddingRight: 20 },
  storyAvatarWrap: { alignItems: 'center', gap: 6, width: 72 },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 2 },
  storyImage: { width: '100%', height: '100%', borderRadius: 99 },
  storyName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  /* Banner */
  bannerWrap: { marginBottom: 28 },
  banner: { width: BANNER_W, height: BANNER_H, borderRadius: 24, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, justifyContent: 'space-between' },
  bannerTop: { flexDirection: 'row', alignItems: 'flex-start' },
  bannerBottom: { gap: 4 },
  bannerCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -50, right: -50 },
  bannerCircle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, top: 30, right: 70 },
  bannerBadge: { marginTop: -4, paddingHorizontal: 22, paddingVertical: 6, borderRadius: 999, borderWidth: 1, flexDirection: 'row', alignItems: 'center', },
  bannerBadgeText: { fontSize: 11, fontWeight: '800', marginTop: -2 },
  bannerTitle: { fontSize: 24, fontWeight: '900', lineHeight: 28, letterSpacing: -0.5 },
  bannerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  bannerBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginTop: 8 },
  bannerBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  bannerIconWrap: { position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  /* Section Header */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
});