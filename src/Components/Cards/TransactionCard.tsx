import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Spacing } from '../../Constants/Spacing';
import { Transaction, transactionTypeLabel } from '../../Types/transaction';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  transaction: Transaction;
  onPress: () => void;
}

export const TransactionCard = ({ transaction, onPress }: Props) => {
  const { calculateFontSize } = useResponsive();

  const typeColor =
    transaction.type === 'SALE'
      ? Colors.success
      : transaction.type === 'PURCHASE'
        ? Colors.primary
        : Colors.warning;

  const typeIcon =
    transaction.type === 'SALE'
      ? 'trending-up'
      : transaction.type === 'PURCHASE'
        ? 'cart'
        : 'hammer';

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: typeColor }]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '22', borderColor: typeColor + '44' }]}>
          <Ionicons name={typeIcon as any} size={14} color={typeColor} />
          <Text style={[styles.typeText, { color: typeColor, fontSize: calculateFontSize(12) }]}>
            {transactionTypeLabel[transaction.type]}
          </Text>
        </View>
        <Text style={[styles.gram, { fontSize: calculateFontSize(18) }]}>
          {transaction.gram.toLocaleString('tr-TR')} gr
        </Text>
      </View>

      <Text style={[styles.description, { fontSize: calculateFontSize(14) }]} numberOfLines={2}>
        {transaction.description}
      </Text>

      <View style={styles.footer}>
        {transaction.customerName ? (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={Colors.subtext} />
            <Text style={[styles.infoText, { fontSize: calculateFontSize(12) }]}>
              {transaction.customerName}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.date, { fontSize: calculateFontSize(12) }]}>
          {formatDate(transaction.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusXl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
  },
  typeText: {
    fontWeight: '600',
  },
  gram: {
    color: Colors.text,
    fontWeight: '700',
  },
  description: {
    color: Colors.subtext,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: Colors.subtext,
  },
  date: {
    color: Colors.subtext,
  },
});
