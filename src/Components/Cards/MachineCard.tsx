import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Machine } from '../../Types/machine';
import { formatRuntime, getStatusColor, getStatusText } from '../../Utils/machineHelpers';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  machine: Machine;
  onPress: () => void;
}

export const MachineCard = ({ machine, onPress }: Props) => {
  const { calculateFontSize, calculateHeight } = useResponsive();
  const statusColor = getStatusColor(machine.status);
  const statusText = getStatusText(machine.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { fontSize: calculateFontSize(16) }]} numberOfLines={1}>
            {machine.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor, fontSize: calculateFontSize(12) }]}>
              {statusText}
            </Text>
          </View>
        </View>
        <Text style={[styles.model, { fontSize: calculateFontSize(13) }]}>
          {machine.model}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color={Colors.subtext} />
          <Text style={[styles.infoText, { fontSize: calculateFontSize(13) }]}>
            {machine.location}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={Colors.subtext} />
          <Text style={[styles.infoText, { fontSize: calculateFontSize(13) }]}>
            {formatRuntime(machine.runtime)}
          </Text>
        </View>
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
    position: 'relative',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  model: {
    color: Colors.subtext,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: Colors.subtext,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});

