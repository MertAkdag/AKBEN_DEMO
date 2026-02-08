import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/Constants/Colors';
import { useResponsive } from '../../../src/Hooks/UseResponsive';
import { transactionService } from '../../../src/Api/transactionService';
import { Transaction, transactionTypeLabel } from '../../../src/Types/transaction';
import { MachineCardSkeleton } from '../../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../../src/Components/Ui/ErrorState';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransaction = useCallback(async () => {
    if (!id) {
      setError('İşlem ID bulunamadı');
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await transactionService.getTransactionById(id);
      setTransaction(response.data);
    } catch (err: any) {
      console.log('Transaction detail fetch error:', err);
      setError(err.message || 'İşlem bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransaction().finally(() => setRefreshing(false));
  }, [fetchTransaction]);

  const typeColor =
    transaction?.type === 'SALE'
      ? Colors.success
      : transaction?.type === 'PURCHASE'
        ? Colors.primary
        : Colors.warning;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: calculateFontSize(18) }]}>İşlem Detayı</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.content}>
          <MachineCardSkeleton />
          <MachineCardSkeleton />
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: calculateFontSize(18) }]}>İşlem Detayı</Text>
          <View style={styles.backButton} />
        </View>
        <ErrorState message={error || 'İşlem bulunamadı'} onRetry={fetchTransaction} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: calculateFontSize(18) }]}>İşlem Detayı</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
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
      >
        <View style={[styles.typeCard, { backgroundColor: typeColor + '18' }]}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '30' }]}>
            <Ionicons
              name={
                transaction.type === 'SALE'
                  ? 'trending-up'
                  : transaction.type === 'PURCHASE'
                    ? 'cart'
                    : 'hammer'
              }
              size={28}
              color={typeColor}
            />
          </View>
          <Text style={[styles.typeLabel, { fontSize: calculateFontSize(14) }]}>
            {transactionTypeLabel[transaction.type]}
          </Text>
          <Text style={[styles.gramValue, { fontSize: calculateFontSize(32) }]}>
            {transaction.gram.toLocaleString('tr-TR')} gr
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>AÇIKLAMA</Text>
          <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]}>
            {transaction.description}
          </Text>
        </View>

        {transaction.customerName ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>MÜŞTERİ</Text>
            <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]}>
              {transaction.customerName}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>TARİH</Text>
          <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]}>
            {formatDate(transaction.date)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
  },
  backText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  typeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  typeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    color: Colors.subtext,
    marginBottom: 4,
  },
  gramValue: {
    color: Colors.text,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: Colors.subtext,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionValue: {
    color: Colors.text,
    lineHeight: 22,
  },
});
