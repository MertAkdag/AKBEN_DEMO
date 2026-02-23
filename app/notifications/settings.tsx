import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact, successNotification } from '../../src/Utils/haptics';
import { Spacing } from '../../src/Constants/Spacing';

// TODO: GET /api/v1/notifications/settings ile senkronize edilecek
const NOTIF_SETTINGS_KEY = 'akben_notif_settings';

interface NotifSettings {
  campaigns: boolean;
  orders: boolean;
  prices: boolean;
  system: boolean;
  email: boolean;
  sms: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  campaigns: true,
  orders: true,
  prices: true,
  system: true,
  email: false,
  sms: false,
};

// ─── Tek ayar satırı ─────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconColor,
  label,
  desc,
  value,
  onToggle,
  colors,
  isDark,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: any;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '12' }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.subtext }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => { lightImpact(); onToggle(v); }}
        trackColor={{ false: isDark ? '#3A3A3C' : '#E5E7EB', true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : (isDark ? '#808080' : '#CCC')}
        ios_backgroundColor={isDark ? '#3A3A3C' : '#E5E7EB'}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);

  // Kaydedilmiş ayarları yükle
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_SETTINGS_KEY).then((val) => {
      if (val) {
        try { setSettings(JSON.parse(val)); } catch { /* ignore */ }
      }
    });
  }, []);

  const toggle = (key: keyof NotifSettings) => (val: boolean) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    // TODO: PUT /api/v1/notifications/settings
    AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
  };

  const handleSave = () => {
    successNotification();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Nav */}
      <View style={[styles.nav, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => { lightImpact(); router.back(); }}
          style={styles.navBtn}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>Bildirim Ayarları</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Uygulama bildirimleri */}
        <Animated.View entering={FadeInDown.duration(450).springify()}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>UYGULAMA İÇİ</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 8 },
                  android: { elevation: 3 },
                }),
              },
            ]}
          >
            <SettingRow
              icon="sparkles-outline"
              iconColor="#F59E0B"
              label="Kampanyalar"
              desc="İndirim ve özel teklifler"
              value={settings.campaigns}
              onToggle={toggle('campaigns')}
              colors={colors}
              isDark={isDark}
            />
            <SettingRow
              icon="cube-outline"
              iconColor="#3B82F6"
              label="Sipariş Güncellemeleri"
              desc="Durum değişiklikleri ve kargo"
              value={settings.orders}
              onToggle={toggle('orders')}
              colors={colors}
              isDark={isDark}
            />
            <SettingRow
              icon="stats-chart-outline"
              iconColor="#10B981"
              label="Fiyat Uyarıları"
              desc="Altın ve döviz değişimleri"
              value={settings.prices}
              onToggle={toggle('prices')}
              colors={colors}
              isDark={isDark}
            />
            <SettingRow
              icon="shield-checkmark-outline"
              iconColor="#8B5CF6"
              label="Sistem Bildirimleri"
              desc="Güvenlik ve bakım uyarıları"
              value={settings.system}
              onToggle={toggle('system')}
              colors={colors}
              isDark={isDark}
              isLast
            />
          </View>
        </Animated.View>

        {/* E-posta & SMS */}
        <Animated.View entering={FadeInDown.duration(450).delay(80).springify()}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>E-POSTA & SMS</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 8 },
                  android: { elevation: 3 },
                }),
              },
            ]}
          >
            <SettingRow
              icon="mail-outline"
              iconColor="#3B82F6"
              label="E-posta Bildirimleri"
              desc="Kampanya ve sipariş e-postaları"
              value={settings.email}
              onToggle={toggle('email')}
              colors={colors}
              isDark={isDark}
            />
            <SettingRow
              icon="phone-portrait-outline"
              iconColor="#10B981"
              label="SMS Bildirimleri"
              desc="Kargo ve teslimat SMS'leri"
              value={settings.sms}
              onToggle={toggle('sms')}
              colors={colors}
              isDark={isDark}
              isLast
            />
          </View>
        </Animated.View>

        {/* Kaydet */}
        <Animated.View entering={FadeInDown.duration(450).delay(140).springify()}>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveBtn,
              {
                backgroundColor: colors.primary,
                ...Platform.select({
                  ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
                  android: { elevation: 4 },
                }),
              },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>Ayarları Kaydet</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { padding: Spacing.screenPadding, paddingBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 12, fontWeight: '400', marginTop: 2, lineHeight: 16 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
