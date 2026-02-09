import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/Components/Ui/Button';
import { Skeleton } from '../../src/Components/Ui/Skeleton';

import { useCariDetail } from '../../src/Hooks/useCariler';
import { Spacing } from '../../src/Constants/Spacing';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';

const { height: SH } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

export default function CariDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();

  const { data: cari, isLoading, isError } = useCariDetail(id ?? null);

  const translateY = useRef(new Animated.Value(0)).current;

  const handleClose = useCallback(() => {
    Animated.timing(translateY, { toValue: SH, duration: 200, useNativeDriver: true }).start(() => router.back());
  }, [router, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD || g.vy > 0.5) handleClose();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
      },
    })
  ).current;

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <View style={s.modalWrap}>
        <TouchableWithoutFeedback onPress={handleClose}><View style={s.backdrop} /></TouchableWithoutFeedback>
        <Animated.View style={[s.modal, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}><View style={[s.handle, { backgroundColor: colors.subtext + '60' }]} /></View>
          <View style={{ padding: 20 }}>
            <Skeleton width={200} height={28} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={60} style={{ marginBottom: 16 }} />
            <Skeleton width={150} height={20} />
          </View>
        </Animated.View>
      </View>
    );
  }

  /* ─── Error ─── */
  if (isError || !cari) {
    return (
      <View style={s.modalWrap}>
        <TouchableWithoutFeedback onPress={handleClose}><View style={s.backdrop} /></TouchableWithoutFeedback>
        <Animated.View style={[s.modal, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}><View style={[s.handle, { backgroundColor: colors.subtext + '60' }]} /></View>
          <View style={s.errorWrap}>
            <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
            <Text style={[s.errorText, { color: colors.text }]}>Cari yüklenemedi</Text>
            <Button title="Kapat" variant="outline" onPress={handleClose} style={{ marginTop: 16 }} />
          </View>
        </Animated.View>
      </View>
    );
  }

  const isAlacak = cari.balance > 0;
  const isBorclu = cari.balance < 0;
  const accent = isAlacak ? colors.success : isBorclu ? colors.warning : colors.subtext;
  const balanceLabel = isAlacak ? 'Alacak' : isBorclu ? 'Borç' : 'Bakiye';

  const initials = cari.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <View style={s.modalWrap}>
      <TouchableWithoutFeedback onPress={handleClose}><View style={s.backdrop} /></TouchableWithoutFeedback>
      <Animated.View style={[s.modal, { backgroundColor: colors.background, transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers}><View style={[s.handle, { backgroundColor: colors.subtext + '60' }]} /></View>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: accent + '14', borderColor: accent + '25' }]}>
            <Text style={[s.avatarText, { color: accent }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { fontSize: calculateFontSize(22), color: colors.text }]} numberOfLines={2}>{cari.name}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={[s.closeBtn, { backgroundColor: colors.divider }]} accessibilityLabel="Kapat">
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollInner}>
          {/* Balance card */}
          <View style={[s.balanceCard, {
            backgroundColor: colors.card, borderColor: accent + '15',
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 10 },
              android: { elevation: 4 },
            }),
          }]}>
            <Text style={[s.balanceLabel, { color: colors.subtext }]}>{balanceLabel}</Text>
            <Text style={[s.balanceVal, { color: accent }]}>
              {Math.abs(cari.balance).toLocaleString('tr-TR')} ₺
            </Text>
          </View>

          {/* Info sections */}
          <View style={[s.infoCard, {
            backgroundColor: colors.card, borderColor: colors.cardBorder,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 8 },
              android: { elevation: 3 },
            }),
          }]}>
            <SectionRow icon="call" label="Telefon" value={cari.phone} selectable colors={colors} />
            {cari.email && <SectionRow icon="mail" label="E-posta" value={cari.email} selectable colors={colors} />}
            {cari.address && <SectionRow icon="location" label="Adres" value={cari.address} last colors={colors} />}
            {!cari.email && !cari.address && <SectionRow icon="call" label="Telefon" value={cari.phone} last colors={colors} />}
          </View>

          {cari.notes && (
            <View style={[s.notesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[s.notesLabel, { color: colors.subtext }]}>Notlar</Text>
              <Text style={[s.notesText, { color: colors.text }]}>{cari.notes}</Text>
            </View>
          )}

          {/* Banks */}
          {cari.banks && cari.banks.length > 0 && (
            <View style={s.section}>
              <Text style={[s.sectionTitle, { color: colors.subtext }]}>Banka Hesapları</Text>
              {cari.banks.map(bank => (
                <View key={bank.id} style={[s.subCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={s.subCardRow}>
                    <View style={[s.subIcon, { backgroundColor: colors.primary + '12' }]}>
                      <Ionicons name="business" size={14} color={colors.primary} />
                    </View>
                    <Text style={[s.subCardTitle, { color: colors.text }]}>{bank.bankName}</Text>
                  </View>
                  <Text style={[s.subCardVal, { color: colors.text }]} selectable>{bank.iban}</Text>
                  {bank.accountName && (
                    <Text style={[s.subCardSub, { color: colors.subtext }]}>
                      {bank.accountName}{bank.branch ? ` · ${bank.branch}` : ''}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Contacts */}
          {cari.contacts && cari.contacts.length > 0 && (
            <View style={s.section}>
              <Text style={[s.sectionTitle, { color: colors.subtext }]}>İletişim Kişileri</Text>
              {cari.contacts.map(contact => (
                <View key={contact.id} style={[s.subCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={s.subCardRow}>
                    <View style={[s.subIcon, { backgroundColor: colors.primary + '12' }]}>
                      <Ionicons name="person" size={14} color={colors.primary} />
                    </View>
                    <Text style={[s.subCardTitle, { color: colors.text }]}>{contact.name}</Text>
                    {contact.title && (
                      <View style={[s.titleBadge, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[s.titleBadgeText, { color: colors.primary }]}>{contact.title}</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.contactInfo}>
                    <Ionicons name="call" size={12} color={colors.subtext} />
                    <Text style={[s.contactText, { color: colors.subtext }]} selectable>{contact.phone}</Text>
                  </View>
                  {contact.email && (
                    <View style={s.contactInfo}>
                      <Ionicons name="mail" size={12} color={colors.subtext} />
                      <Text style={[s.contactText, { color: colors.subtext }]} selectable>{contact.email}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[s.footer, { borderTopColor: colors.divider, backgroundColor: colors.card }]}>
          <Button title="Kapat" variant="primary" onPress={handleClose} fullWidth />
        </View>
      </Animated.View>
    </View>
  );
}

function SectionRow({ icon, label, value, selectable, last, colors }: {
  icon: string; label: string; value: string; selectable?: boolean; last?: boolean; colors: any;
}) {
  return (
    <View style={[s.sRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <View style={[s.sRowIcon, { backgroundColor: colors.divider }]}>
        <Ionicons name={icon as any} size={15} color={colors.subtext} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.sRowLabel, { color: colors.subtext }]}>{label}</Text>
        <Text style={[s.sRowValue, { color: colors.text }]} selectable={selectable}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  modal: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    minHeight: '78%', maxHeight: '92%',
  },
  handle: {
    width: 36, height: 4,
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16, gap: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  avatarText: { fontSize: 17, fontWeight: '800' },
  title: { fontWeight: '700', flex: 1 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  scrollInner: { paddingHorizontal: 20, paddingBottom: 20 },

  balanceCard: {
    borderRadius: 20, padding: 22,
    alignItems: 'center', marginBottom: 16, overflow: 'hidden',
    borderWidth: 1,
  },
  balanceLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  balanceVal: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

  infoCard: {
    borderRadius: 20, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1,
  },
  sRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sRowIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sRowLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  sRowValue: { fontSize: 15, fontWeight: '600' },

  notesCard: {
    borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1,
  },
  notesLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesText: { fontSize: 14, lineHeight: 22 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  subCard: {
    borderRadius: 16, padding: 14,
    marginBottom: 8, overflow: 'hidden',
    borderWidth: 1,
  },
  subCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  subIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  subCardTitle: { fontWeight: '600', fontSize: 14, flex: 1 },
  subCardVal: { fontSize: 13, marginLeft: 36, marginBottom: 2 },
  subCardSub: { fontSize: 12, marginLeft: 36 },

  titleBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  titleBadgeText: { fontWeight: '600', fontSize: 10 },

  contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 36, marginBottom: 4 },
  contactText: { fontSize: 13 },

  footer: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1,
  },

  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, marginTop: 12 },
});
