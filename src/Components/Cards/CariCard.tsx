import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Cari } from '../../Types/cari';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  cari: Cari;
  onPress: () => void;
}

export const CariCard = ({ cari, onPress }: Props) => {
  const { calculateFontSize } = useResponsive();

  const isAlacak = cari.balance > 0;
  const isBorclu = cari.balance < 0;
  const balanceColor = isAlacak ? Colors.success : isBorclu ? Colors.warning : Colors.subtext;
  const balanceLabel = isAlacak ? 'Alacak' : isBorclu ? 'Borç' : 'Bakiye';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Ionicons name="person-outline" size={18} color={Colors.primary} />
          <Text style={[styles.name, { fontSize: calculateFontSize(16) }]} numberOfLines={1}>
            {cari.name}
          </Text>
        </View>
        <View style={[styles.balanceBadge, { backgroundColor: balanceColor + '20' }]}>
          <Text style={[styles.balanceText, { color: balanceColor, fontSize: calculateFontSize(13) }]}>
            {balanceLabel}: {Math.abs(cari.balance).toLocaleString('tr-TR')} ₺
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={14} color={Colors.subtext} />
        <Text style={[styles.infoText, { fontSize: calculateFontSize(13) }]} numberOfLines={1}>
          {cari.phone}
        </Text>
      </View>
      {cari.address ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.subtext} />
          <Text style={[styles.infoText, { fontSize: calculateFontSize(13) }]} numberOfLines={1}>
            {cari.address}
          </Text>
        </View>
      ) : null}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceText: {
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
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    color: Colors.subtext,
    flex: 1,
  },
});
