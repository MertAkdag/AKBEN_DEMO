import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../../src/Hooks/UseResponsive';
import { useTheme } from '../../../src/Context/ThemeContext';
import { transactionService } from '../../../src/Api/transactionService';
import { Transaction, transactionTypeLabel } from '../../../src/Types/transaction';
import { TransactionCardSkeleton } from '../../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../../src/Components/Ui/ErrorState';
import { lightImpact } from '../../../src/Utils/haptics';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();

  const TYPE_CONF: Record<string, { color: string; icon: string }> = {
    SALE: { color: colors.success, icon: 'trending-up' },
    PURCHASE: { color: '#60A5FA', icon: 'cart' },
    LABOR: { color: colors.warning, icon: 'construct' },
  };

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransaction = useCallback(async () => {
    if (!id) { setError('İşlem ID bulunamadı'); setIsLoading(false); return; }
    try {
      setError(null);
      const response = await transactionService.getTransactionById(id);
      setTransaction(response.data);
    } catch (err: any) {
      setError(err.message || 'İşlem bilgileri yüklenirken bir hata oluştu');
    } finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { fetchTransaction(); }, [fetchTransaction]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchTransaction().finally(() => setRefreshing(false)); }, [fetchTransaction]);
  const handleBack = useCallback(() => { lightImpact(); router.back(); }, [router]);

  const t = transaction ? (TYPE_CONF[transaction.type] ?? TYPE_CONF.LABOR) : null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const Nav = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <Pressable onPress={handleBack} style={s.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[s.navTitle, { fontSize: calculateFontSize(17), color: colors.text }]}>İşlem Detayı</Text>
        <View style={s.navBtn} />
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <View style={s.content}><TransactionCardSkeleton /><TransactionCardSkeleton /></View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <ErrorState message={error || 'İşlem bulunamadı'} onRetry={fetchTransaction} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Nav />

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Hero type card */}
        <View style={[s.heroCard, {
          backgroundColor: colors.card, borderColor: t!.color + '15',
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.08, shadowRadius: 14 },
            android: { elevation: 6 },
          }),
        }]}>
          <View style={[s.heroBadge, { backgroundColor: t!.color + '14', borderColor: t!.color + '20' }]}>
            <Ionicons name={t!.icon as any} size={26} color={t!.color} />
          </View>
          <Text style={[s.heroType, { color: colors.subtext }]}>{transactionTypeLabel[transaction.type]}</Text>
          <Text style={[s.heroGram, { color: t!.color }]}>
            {transaction.gram.toLocaleString('tr-TR')} <Text style={s.heroUnit}>gr</Text>
          </Text>
        </View>

        {/* Detail sections */}
        <View style={[s.detailCard, {
          backgroundColor: colors.card, borderColor: colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10 },
            android: { elevation: 4 },
          }),
        }]}>
          <DetailRow icon="document-text" label="Açıklama" value={transaction.description} colors={colors} />
          {transaction.customerName && (
            <DetailRow icon="person" label="Müşteri" value={transaction.customerName} colors={colors} />
          )}
          <DetailRow icon="calendar" label="Tarih" value={formatDate(transaction.date)} last colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, last, colors }: {
  icon: string; label: string; value: string; last?: boolean; colors: any;
}) {
  return (
    <View style={[s.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <View style={[s.detailIcon, { backgroundColor: colors.divider }]}>
        <Ionicons name={icon as any} size={16} color={colors.subtext} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.detailLabel, { color: colors.subtext }]}>{label}</Text>
        <Text style={[s.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  nav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  navTitle: { flex: 1, textAlign: 'center', fontWeight: '600' },

  content: { padding: 20, paddingBottom: 60 },

  heroCard: {
    borderRadius: 24, padding: 28,
    alignItems: 'center', marginBottom: 20, overflow: 'hidden',
    borderWidth: 1,
  },
  heroBadge: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1,
  },
  heroType: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroGram: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  heroUnit: { fontSize: 18, fontWeight: '600' },

  detailCard: {
    borderRadius: 22, padding: 4,
    overflow: 'hidden',
    borderWidth: 1,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  detailIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontWeight: '600' },
});
