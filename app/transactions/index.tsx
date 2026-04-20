import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../src/Constants/Spacing';
import { transactionService } from '../../src/Api/transactionService';
import { Transaction, TransactionType } from '../../src/Types/transaction';
import { TransactionCard } from '../../src/Components/Cards/TransactionCard';
import { TransactionCardSkeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { EmptyState } from '../../src/Components/Ui/EmptyState';
import { FilterSegment } from '../../src/Components/Ui/FilterSegmented';
import { useTheme } from '../../src/Context/ThemeContext';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { lightImpact } from '../../src/Utils/haptics';

type FilterOption = 'Tümü' | 'Satış' | 'Alış' | 'İşçilik';
const filterOptions: FilterOption[] = ['Tümü', 'Satış', 'Alış', 'İşçilik'];
const filterToType: Record<FilterOption, TransactionType | null> = {
  'Tümü': null, 'Satış': 'SALE', 'Alış': 'PURCHASE', 'İşçilik': 'LABOR',
};

export default function TransactionsListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { calculateFontSize } = useResponsive();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Tümü');

  const fetchTransactions = useCallback(async () => {
    try {
      setError(null);
      const response = await transactionService.getTransactions();
      setTransactions(response.data);
    } catch (err: any) {
      setError(err.message || 'İşlemler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchTransactions(); }, [fetchTransactions]);
  const handleBack = useCallback(() => { lightImpact(); router.back(); }, [router]);

  const filtered = useMemo(() => {
    const t = filterToType[selectedFilter];
    return t ? transactions.filter((x) => x.type === t) : transactions;
  }, [transactions, selectedFilter]);

  const Nav = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <Pressable onPress={handleBack} style={s.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[s.navTitle, { fontSize: calculateFontSize(17), color: colors.text }]}>İşlemler</Text>
        <View style={s.navBtn} />
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <View style={s.content}>
          <FilterSegment options={filterOptions} selected={selectedFilter} onSelect={(o) => setSelectedFilter(o as FilterOption)} />
          <TransactionCardSkeleton /><TransactionCardSkeleton /><TransactionCardSkeleton />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <ErrorState message={error} onRetry={fetchTransactions} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Nav />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TransactionCard transaction={item} onPress={() => router.push(`/transactions/${item.id}`)} index={index} />
        )}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <FilterSegment options={filterOptions} selected={selectedFilter} onSelect={(o) => setSelectedFilter(o as FilterOption)} />
        }
        ListEmptyComponent={
          <EmptyState
            title="İşlem bulunamadı"
            message={selectedFilter !== 'Tümü' ? `${selectedFilter} tipinde işlem yok` : 'Henüz kayıtlı işlem bulunmuyor'}
          />
        }
      />
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

  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 40 },
});
