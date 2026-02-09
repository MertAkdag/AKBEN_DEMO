import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spacing } from '../../src/Constants/Spacing';
import { transactionService } from '../../src/Api/transactionService';
import { Transaction, TransactionType } from '../../src/Types/transaction';
import { ScreenHeader } from '../../src/Shared/Header';
import { TransactionCard } from '../../src/Components/Cards/TransactionCard';
import { MachineCardSkeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { EmptyState } from '../../src/Components/Ui/EmptyState';
import { FilterSegment } from '../../src/Components/Ui/FilterSegmented';
import { useTheme } from '../../src/Context/ThemeContext';

const TAB_BAR_HEIGHT = 100;
type FilterOption = 'Tümü' | 'Satış' | 'Alış' | 'İşçilik';
const filterOptions: FilterOption[] = ['Tümü', 'Satış', 'Alış', 'İşçilik'];
const filterToType: Record<FilterOption, TransactionType | null> = {
  'Tümü': null, 'Satış': 'SALE', 'Alış': 'PURCHASE', 'İşçilik': 'LABOR',
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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

  const filtered = useMemo(() => {
    const t = filterToType[selectedFilter];
    return t ? transactions.filter((x) => x.type === t) : transactions;
  }, [transactions, selectedFilter]);

  if (isLoading) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={s.content}>
          <ScreenHeader title="İşlemler" subtitle={`${transactions.length} işlem`} />
          <FilterSegment options={filterOptions} selected={selectedFilter} onSelect={(o) => setSelectedFilter(o as FilterOption)} />
          <MachineCardSkeleton /><MachineCardSkeleton /><MachineCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ErrorState message={error} onRetry={fetchTransactions} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TransactionCard transaction={item} onPress={() => router.push(`/machines/${item.id}`)} index={index} />
        )}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <>
            <ScreenHeader title="İşlemler" subtitle={`${transactions.length} işlem`} />
            <FilterSegment options={filterOptions} selected={selectedFilter} onSelect={(o) => setSelectedFilter(o as FilterOption)} />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="İşlem bulunamadı"
            message={selectedFilter !== 'Tümü' ? `${selectedFilter} tipinde işlem yok` : 'Henüz kayıtlı işlem bulunmuyor'}
          />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: TAB_BAR_HEIGHT },
});
