import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { StatusBadge } from '../Ui/StatusBadge';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../Hooks/UseResponsive';

type CardVariant = 'stat' | 'machine' | 'order' | 'profile';

interface StatData { title: string; value: string | number; }
interface MachineData { name: string; status: string; runtime: number; model: string; location: string; }
interface OrderData { title: string; status: string; assignedTo: string; deadline: string; }
interface profileData { title: string; icon: string; }

interface Props {
  variant: CardVariant;
  data: StatData | MachineData | OrderData | profileData;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card = ({ variant, data, onPress, style }: Props) => {
const { calculateWidth, calculateHeight, calculateFontSize, calculateIconSize } = useResponsive();
  
  const getCardDimensions = () => {
    switch (variant) {
      case 'stat': 
      case 'profile': 
        return { width: calculateWidth(163), height: calculateHeight(126) };
      case 'machine':
      case 'order': 
        return { width: calculateWidth(350), height: calculateHeight(114) };
      default: return {};
    }
  };

  const dimensions = getCardDimensions();
  const iconSize = calculateIconSize(14);
  const profileIconSize = calculateIconSize(24); 

  const dynamicStyles = {
    card: {
      width: dimensions.width,
      minHeight: dimensions.height,
      padding: calculateWidth(14),
      borderRadius: calculateWidth(14),
      marginBottom: calculateHeight(14),
      alignSelf: 'center',
    } as ViewStyle,
    
    titleFont: { fontSize: calculateFontSize(20), fontWeight: '700' } as TextStyle,
    largeValueFont: { fontSize: calculateFontSize(28), fontWeight: '800' } as TextStyle,
    labelFont: { fontSize: calculateFontSize(15), fontWeight: '600', color: Colors.subtext } as TextStyle,
    
    subTextFont: { fontSize: calculateFontSize(11), color: Colors.subtext } as TextStyle,
    infoFont: { fontSize: calculateFontSize(11), color: Colors.subtext } as TextStyle,
    
    profileTitleFont: { fontSize: calculateFontSize(14), fontWeight: '700', color: Colors.text } as TextStyle,

    gapTiny: { marginTop: calculateHeight(2) } as ViewStyle,
    gapSmall: { marginTop: calculateHeight(4) } as ViewStyle,
    dividerMargin: { marginVertical: calculateHeight(10) } as ViewStyle, 
    rowGap: { gap: calculateHeight(1) } as ViewStyle,
  };

  const renderStatContent = (item: StatData) => (
    <View style={styles.statContainer}>
      <Text style={[dynamicStyles.labelFont]}>{item.title}</Text>
      <View style={{ flex: 1 }} /> 
      <Text style={[styles.statValue, dynamicStyles.largeValueFont]}>
        {item.value}
      </Text>
    </View>
  );


  const renderprofileContent = (item: profileData) => (
    <View style={styles.statContainer}> 
      <Ionicons name={item.icon as any} size={profileIconSize} color={Colors.subtext} />
      
      <View style={{ flex: 1 }} /> 
      <Text style={[dynamicStyles.profileTitleFont]} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );

  const renderMachineContent = (item: MachineData) => (
    <View style={styles.flexColumn}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.titleFont]} numberOfLines={1}>
          {item.name}
        </Text>
        <StatusBadge status={item.status} />
      </View>

      <Text style={[dynamicStyles.subTextFont, dynamicStyles.gapTiny as TextStyle]}>
        Runtime: {item.runtime}h
      </Text>

      <View style={[styles.divider, dynamicStyles.dividerMargin]} />

      <View style={dynamicStyles.rowGap}>
        <Text style={[dynamicStyles.infoFont]} numberOfLines={1}>
          Model: {item.model}
        </Text>
        <Text style={[dynamicStyles.infoFont]} numberOfLines={1}>
          Location: {item.location}
        </Text>
      </View>
    </View>
  );

  const renderOrderContent = (item: OrderData) => (
    <View style={styles.flexColumn}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.titleFont]} numberOfLines={1}>
          {item.title}
        </Text>
        <StatusBadge status={item.status} showDot={false} />
      </View>

      <View style={[styles.divider, dynamicStyles.dividerMargin]} />

      <View style={dynamicStyles.rowGap}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={iconSize} color={Colors.subtext} style={{marginRight: 6}} />
          <Text style={[dynamicStyles.infoFont]}>Assigned to: {item.assignedTo}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={iconSize} color={Colors.subtext} style={{marginRight: 6}} />
          <Text style={[dynamicStyles.infoFont]}>
             Deadline: {new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'stat': return renderStatContent(data as StatData);
      case 'profile': return renderprofileContent(data as profileData);
      case 'machine': return renderMachineContent(data as MachineData);
      case 'order': return renderOrderContent(data as OrderData);
      default: return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseCard, dynamicStyles.card, style]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: Colors.card, 
    justifyContent: 'center',
  },
  flexColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statValue: {
    color: Colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border, 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});