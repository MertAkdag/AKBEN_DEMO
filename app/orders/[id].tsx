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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/Components/Ui/Button';
import { Skeleton } from '../../src/Components/Ui/Skeleton';

import { useCariDetail } from '../../src/Hooks/useCariler';
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { useResponsive } from '../../src/Hooks/UseResponsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

export default function CariDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();

  const { data: cari, isLoading, isError } = useCariDetail(id ?? null);

  const translateY = useRef(new Animated.Value(0)).current;

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => router.back());
  }, [router, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  if (isLoading) {
    return (
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={styles.loadingContainer}>
            <Skeleton width={200} height={28} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={60} style={{ marginBottom: 16 }} />
            <Skeleton width={150} height={20} style={{ marginBottom: 8 }} />
            <Skeleton width={150} height={20} />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (isError || !cari) {
    return (
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={styles.errorText}>Cari yüklenemedi</Text>
            <Button title="Kapat" variant="outline" onPress={handleClose} style={{ marginTop: 16 }} />
          </View>
        </Animated.View>
      </View>
    );
  }

  const isAlacak = cari.balance > 0;
  const isBorclu = cari.balance < 0;
  const balanceColor = isAlacak ? Colors.success : isBorclu ? Colors.warning : Colors.subtext;
  const balanceLabel = isAlacak ? 'Alacak' : isBorclu ? 'Borç' : 'Bakiye';

  return (
    <View style={styles.modalContainer}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: calculateFontSize(22) }]} numberOfLines={2}>
            {cari.name}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton} accessibilityLabel="Kapat">
            <Ionicons name="close" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={[styles.balanceCard, { backgroundColor: balanceColor + '18' }]}>
            <Text style={[styles.balanceLabel, { fontSize: calculateFontSize(12) }]}>
              {balanceLabel}
            </Text>
            <Text style={[styles.balanceValue, { color: balanceColor, fontSize: calculateFontSize(24) }]}>
              {Math.abs(cari.balance).toLocaleString('tr-TR')} ₺
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>TELEFON</Text>
            <View style={styles.row}>
              <Ionicons name="call-outline" size={18} color={Colors.subtext} />
              <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]} selectable>
                {cari.phone}
              </Text>
            </View>
          </View>

          {cari.email ? (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>E-POSTA</Text>
              <View style={styles.row}>
                <Ionicons name="mail-outline" size={18} color={Colors.subtext} />
                <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]} selectable>
                  {cari.email}
                </Text>
              </View>
            </View>
          ) : null}

          {cari.address ? (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>ADRES</Text>
              <Text style={[styles.sectionValue, { fontSize: calculateFontSize(15) }]}>
                {cari.address}
              </Text>
            </View>
          ) : null}

          {cari.notes ? (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>NOTLAR</Text>
              <Text style={[styles.notes, { fontSize: calculateFontSize(15) }]}>{cari.notes}</Text>
            </View>
          ) : null}

          {/* CRM: Banka Hesapları (CUSTOMER BANKS) */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>
              BANKA HESAPLARI
            </Text>
            {cari.banks && cari.banks.length > 0 ? (
              cari.banks.map((bank) => (
                <View key={bank.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Ionicons name="business-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.cardTitle, { fontSize: calculateFontSize(15) }]}>
                      {bank.bankName}
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, { fontSize: calculateFontSize(13) }]} selectable>
                    {bank.iban}
                  </Text>
                  {bank.accountName ? (
                    <Text style={[styles.cardSub, { fontSize: calculateFontSize(12) }]}>
                      Hesap: {bank.accountName}
                      {bank.branch ? ` · ${bank.branch}` : ''}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { fontSize: calculateFontSize(13) }]}>
                Kayıtlı banka hesabı yok
              </Text>
            )}
          </View>

          {/* CRM: İletişim Kişileri (CUSTOMER CONTACTS) */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { fontSize: calculateFontSize(12) }]}>
              İLETİŞİM KİŞİLERİ
            </Text>
            {cari.contacts && cari.contacts.length > 0 ? (
              cari.contacts.map((contact) => (
                <View key={contact.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Ionicons name="person-circle-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.cardTitle, { fontSize: calculateFontSize(15) }]}>
                      {contact.name}
                    </Text>
                    {contact.title ? (
                      <View style={styles.titleBadge}>
                        <Text style={[styles.titleBadgeText, { fontSize: calculateFontSize(10) }]}>
                          {contact.title}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.row}>
                    <Ionicons name="call-outline" size={14} color={Colors.subtext} />
                    <Text style={[styles.sectionValue, { fontSize: calculateFontSize(13) }]} selectable>
                      {contact.phone}
                    </Text>
                  </View>
                  {contact.email ? (
                    <View style={styles.row}>
                      <Ionicons name="mail-outline" size={14} color={Colors.subtext} />
                      <Text style={[styles.sectionValue, { fontSize: calculateFontSize(13) }]} selectable>
                        {contact.email}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { fontSize: calculateFontSize(13) }]}>
                Kayıtlı iletişim kişisi yok
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Kapat" variant="primary" onPress={handleClose} style={styles.closeBtn} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '78%',
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.subtext,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    backgroundColor: Colors.card,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    color: Colors.subtext,
    marginBottom: 4,
  },
  balanceValue: {
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: Colors.subtext,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionValue: {
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notes: {
    color: Colors.text,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cardTitle: {
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  cardValue: {
    color: Colors.text,
    marginLeft: 26,
    marginBottom: 2,
  },
  cardSub: {
    color: Colors.subtext,
    marginLeft: 26,
    marginTop: 2,
  },
  emptyText: {
    color: Colors.subtext,
    fontStyle: 'italic',
  },
  titleBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  titleBadgeText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  closeBtn: {
    width: '100%',
  },
  loadingContainer: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 12,
  },
});
