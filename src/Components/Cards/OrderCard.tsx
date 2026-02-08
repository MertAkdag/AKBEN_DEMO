import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Order, statusToDisplay } from '../../Types/order';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  order: Order;
  onPress: () => void;
}

export const OrderCard = ({ order, onPress }: Props) => {
  const { calculateFontSize } = useResponsive();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return Colors.success;
      case 'IN_PROGRESS':
        return Colors.info;
      case 'PENDING':
        return Colors.warning;
      default:
        return Colors.subtext;
    }
  };

  const statusColor = getStatusColor(order.status);
  const displayStatus = statusToDisplay[order.status];


  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${order.title}, Status: ${displayStatus}`}
    >
      <View style={styles.header}>
        <Text 
          style={[styles.title, { fontSize: calculateFontSize(16) }]} 
          numberOfLines={2}
        >
          {order.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor, fontSize: calculateFontSize(12) }]}>
            {displayStatus}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color={Colors.subtext} />
        <Text style={[styles.infoLabel, { fontSize: calculateFontSize(13) }]}>
          Müşteri:{' '}
        </Text>
        <Text style={[styles.infoValue, { fontSize: calculateFontSize(13) }]}>
          {order.assignedUser.name}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="diamond-outline" size={16} color={Colors.subtext} />
        <Text style={[styles.infoLabel, { fontSize: calculateFontSize(13) }]}>
          Ürün:{' '}
        </Text>
        <Text style={[styles.infoValue, { fontSize: calculateFontSize(13) }]}>
          {order.machine.name}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={Colors.subtext} />
        <Text style={[styles.infoLabel, { fontSize: calculateFontSize(13) }]}>
          Teslim:{' '}
        </Text>
        <Text style={[styles.infoValue, { fontSize: calculateFontSize(13) }]}>
          {formatDate(order.deadline)}
        </Text>
      </View>
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  infoLabel: {
    color: Colors.subtext,
  },
  infoValue: {
    color: Colors.text,
    fontWeight: '500',
  },
});
