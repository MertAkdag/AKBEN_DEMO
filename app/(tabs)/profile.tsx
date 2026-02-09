import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Spacing } from '../../src/Constants/Spacing';
import { Button } from '../../src/Components/Ui/Button';
import { ScreenHeader } from '../../src/Shared/Header';
import { useAuth } from '../../src/Context/AuthContext';
import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact } from '../../src/Utils/haptics';
import type { ThemeColors } from '../../src/Constants/Theme';

const TAB_BAR_HEIGHT = 100;
const AVATAR_SIZE = 96;
const RING_SIZE = AVATAR_SIZE + 12;
const RING_OUTER = RING_SIZE + 8;

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

/* ─── Avatar bileşeni ─── */
function ProfileAvatar({ name, colors, isDark }: { name?: string; colors: ThemeColors; isDark: boolean }) {
  return (
    <View style={av.wrap}>
      {/* Dış dekoratif halka */}
      <View style={[av.outerRing, {
        borderColor: colors.primary + (isDark ? '18' : '20'),
      }]} />

      {/* Orta halka – ince çizgi */}
      <View style={[av.middleRing, {
        borderColor: colors.primary + (isDark ? '30' : '40'),
      }]} />

      {/* Avatar gövdesi */}
      <View style={[av.body, {
        backgroundColor: isDark ? colors.primary + '1A' : colors.primary + '14',
        borderColor: colors.primary + (isDark ? '45' : '50'),
        ...Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.25 : 0.15,
            shadowRadius: 16,
          },
          android: { elevation: 8 },
        }),
      }]}>
        <Text style={[av.initials, { color: colors.primary }]}>
          {getInitials(name)}
        </Text>
      </View>

      {/* Kamera/Düzenle butonu */}
      <Pressable
        style={[av.editBtn, {
          backgroundColor: colors.primary,
          borderColor: colors.background,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            },
            android: { elevation: 4 },
          }),
        }]}
        onPress={() => lightImpact()}
        hitSlop={6}
      >
        <Ionicons name="camera" size={13} color="#FFF" />
      </Pressable>
    </View>
  );
}

/* ─── Avatar stilleri ─── */
const av = StyleSheet.create({
  wrap: {
    width: RING_OUTER,
    height: RING_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_OUTER / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  middleRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  body: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  initials: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  editBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
});

/* ─── Info satırı ─── */
function InfoRow({ icon, label, value, last, colors }: {
  icon: string; label: string; value: string; last?: boolean; colors: ThemeColors;
}) {
  return (
    <View style={[s.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <View style={[s.infoIcon, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name={icon as any} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.infoLabel, { color: colors.subtext }]}>{label}</Text>
        <Text style={[s.infoValue, { color: colors.text }]}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.subtext + '40'} />
    </View>
  );
}

/* ─── Ayar satırı ─── */
function SettingRow({ icon, label, value, onPress, trailing, last, colors }: {
  icon: string; label: string; value?: string; onPress?: () => void;
  trailing?: React.ReactNode; last?: boolean; colors: ThemeColors; isDark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.settingRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
    >
      <View style={[s.settingIcon, { backgroundColor: colors.primary + '12' }]}>
        <Ionicons name={icon as any} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.settingLabel, { color: colors.text }]}>{label}</Text>
        {value && <Text style={[s.settingValue, { color: colors.subtext }]}>{value}</Text>}
      </View>
      {trailing ?? (
        <Ionicons name="chevron-forward" size={16} color={colors.subtext + '60'} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const role = user?.role === 'ADMIN' ? 'Yönetici' : user?.role === 'TECHNICIAN' ? 'Teknisyen' : (user?.role || '-');

  const cardStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  }), [colors, isDark]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profil" />

        {/* Avatar alanı */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={s.avatarArea}>
          <ProfileAvatar name={user?.name} colors={colors} isDark={isDark} />

          <Animated.Text
            entering={FadeIn.delay(200).duration(400)}
            style={[s.name, { color: colors.text }]}
          >
            {user?.name || '-'}
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(300).duration(400)} style={[s.rolePill, {
            backgroundColor: isDark ? colors.primary + '14' : colors.primary + '10',
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }]}>
            <View style={[s.roleDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.roleText, { color: colors.primary }]}>{role}</Text>
          </Animated.View>
        </Animated.View>

        {/* Bilgi kartı */}
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} style={[s.card, cardStyle]}>
          <InfoRow icon="person" label="İsim" value={user?.name || '-'} colors={colors} />
          <InfoRow icon="mail" label="Email" value={user?.email || '-'} colors={colors} />
          <InfoRow icon="shield-checkmark" label="Rol" value={role} last colors={colors} />
        </Animated.View>

        {/* Yönetim kartı */}
        <Animated.View entering={FadeInDown.duration(500).delay(120).springify()}>
          <Text style={[s.sectionTitle, { color: colors.subtext }]}>Yönetim</Text>
          <View style={[s.card, cardStyle]}>
            <SettingRow
              icon="swap-horizontal"
              label="İşlemler"
              value="Satış, alış ve işçilik kayıtları"
              colors={colors}
              onPress={() => { lightImpact(); router.push('/transactions'); }}
              last
            />
          </View>
        </Animated.View>

        {/* Ayarlar kartı */}
        <Animated.View entering={FadeInDown.duration(500).delay(200).springify()}>
          <Text style={[s.sectionTitle, { color: colors.subtext }]}>Ayarlar</Text>
          <View style={[s.card, cardStyle]}>
            <SettingRow
              icon={isDark ? 'moon' : 'sunny'}
              label="Görünüm"
              value={isDark ? 'Koyu tema' : 'Açık tema'}
              colors={colors}
              trailing={
                <Switch
                  value={!isDark}
                  onValueChange={() => { lightImpact(); toggleTheme(); }}
                  trackColor={{ false: '#3A3A3C', true: colors.primary + '40' }}
                  thumbColor={!isDark ? colors.primary : '#808080'}
                  ios_backgroundColor="#3A3A3C"
                />
              }
            />
            <SettingRow
              icon="notifications-outline"
              label="Bildirimler"
              value="Açık"
              colors={colors}
              last
            />
          </View>
        </Animated.View>

        {/* Çıkış butonu */}
        <Animated.View entering={FadeInDown.duration(500).delay(280).springify()}>
          <Button
            title="Çıkış Yap"
            variant="danger"
            onPress={logout}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </Animated.View>

        {/* Versiyon */}
        <Animated.View entering={FadeInDown.duration(500).delay(340).springify()} style={s.versionWrap}>
          <Text style={[s.versionText, { color: colors.subtext + '60' }]}>Akben v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.screenPadding, paddingBottom: TAB_BAR_HEIGHT },

  /* Avatar */
  avatarArea: { alignItems: 'center', marginBottom: 28 },
  name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    marginTop: 10,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3 },
  roleText: { fontSize: 12, fontWeight: '700' },

  /* Section title */
  sectionTitle: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', marginTop: 24, marginBottom: 10, marginLeft: 4,
  },

  /* Card */
  card: {
    borderRadius: 22, overflow: 'hidden',
    borderWidth: 1,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  infoIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: '600' },

  /* Settings */
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingValue: { fontSize: 12, fontWeight: '400', marginTop: 1 },

  /* Version */
  versionWrap: { alignItems: 'center', marginTop: 32 },
  versionText: { fontSize: 12, fontWeight: '500' },
});
