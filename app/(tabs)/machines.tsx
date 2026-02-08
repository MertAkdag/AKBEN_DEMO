import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { transactionService } from '../../src/Api/transactionService';
import { Transaction, TransactionType } from '../../src/Types/transaction';
import { ScreenHeader } from '../../src/Shared/Header';
import { SectionHeader } from '../../src/Components/Ui/SectionHeader';
import { TransactionCard } from '../../src/Components/Cards/TransactionCard';
import { MachineCardSkeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { EmptyState } from '../../src/Components/Ui/EmptyState';
import { FilterSegment } from '../../src/Components/Ui/FilterSegmented';

type FilterOption = 'Tümü' | 'Satış' | 'Alış' | 'İşçilik';

const filterOptions: FilterOption[] = ['Tümü', 'Satış', 'Alış', 'İşçilik'];

const filterToType: Record<FilterOption, TransactionType | null> = {
  'Tümü': null,
  'Satış': 'SALE',
  'Alış': 'PURCHASE',
  'İşçilik': 'LABOR',
};

export default function TransactionsScreen() {
  const router = useRouter();

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
      console.log('İşlemler fetch error:', err);
      setError(err.message || 'İşlemler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const typeFilter = filterToType[selectedFilter];
    if (!typeFilter) return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, selectedFilter]);

  const handleTransactionPress = (transaction: Transaction) => {
    router.push(`/machines/${transaction.id}`);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => handleTransactionPress(item)}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <ScreenHeader title="İşlemler" subtitle={`Toplam ${transactions.length} işlem (gram)`} />
          <SectionHeader title="İşlem tipi" showLine={false} />
          <FilterSegment
            options={filterOptions}
            selected={selectedFilter}
            onSelect={(opt) => setSelectedFilter(opt as FilterOption)}
          />
          <SectionHeader title="İşlem listesi" />
          <MachineCardSkeleton />
          <MachineCardSkeleton />
          <MachineCardSkeleton />
          <MachineCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState message={error} onRetry={fetchTransactions} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <ScreenHeader title="İşlemler" subtitle={`Toplam ${transactions.length} işlem (gram)`} />
            <SectionHeader title="İşlem tipi" showLine={false} />
            <FilterSegment
              options={filterOptions}
              selected={selectedFilter}
              onSelect={(opt) => setSelectedFilter(opt as FilterOption)}
            />
            <SectionHeader title="İşlem listesi" />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="İşlem bulunamadı"
            message={
              selectedFilter !== 'Tümü'
                ? `${selectedFilter} tipinde işlem yok`
                : 'Henüz kayıtlı işlem bulunmuyor'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
});
