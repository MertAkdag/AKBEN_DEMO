import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ScreenHeader } from '../../src/Shared/Header';
import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { Spacing } from '../../src/Constants/Spacing';
import { cariService } from '../../src/Api/cariService';
import { cariKeys } from '../../src/Hooks/useCariler';
import { useTheme } from '../../src/Context/ThemeContext';

const SECTION_SPACING = 24;
const CARD_RADIUS = 14;

export default function YeniCariEkleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKaydet = async () => {
    Keyboard.dismiss();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Cari adı gerekli.');
      return;
    }
    if (!trimmedPhone) {
      setError('Telefon numarası gerekli.');
      return;
    }

    try {
      setIsLoading(true);
      const bank =
        bankName.trim() || iban.trim()
          ? { bankName: bankName.trim(), iban: iban.trim().replace(/\s/g, '') }
          : undefined;
      const { data } = await cariService.createCari({
        name: trimmedName,
        phone: trimmedPhone,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        bank,
        notes: notes.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: cariKeys.lists() });
      router.replace(`/orders/${data.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Cari eklenirken bir hata oluştu.';
      setError(msg);
      Alert.alert('Hata', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => router.back();

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title="Yeni cari"
        showBackButton
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View style={[s.errorBanner, { backgroundColor: colors.error + '14', borderLeftColor: colors.error }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[s.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Bölüm 1: Kişi / Firma */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Kişi / Firma</Text>
              </View>
              <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CustomInput fullWidth label="Cari adı" value={name} onChangeText={setName} placeholder="Ad soyad veya firma adı" autoCapitalize="words" autoCorrect={false} />
                <CustomInput fullWidth label="Telefon" value={phone} onChangeText={setPhone} placeholder="0532 000 00 00" keyboardType="phone-pad" />
                <CustomInput fullWidth label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@email.com (opsiyonel)" keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            {/* Bölüm 2: Adres */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Adres</Text>
              </View>
              <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CustomInput fullWidth label="Adres" value={address} onChangeText={setAddress} placeholder="İlçe, şehir veya tam adres (opsiyonel)" />
              </View>
            </View>

            {/* Bölüm 3: Banka hesabı */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="card-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Banka hesabı</Text>
              </View>
              <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[s.helperText, { color: colors.subtext }]}>
                  Vadeli ödemelerde kullanılacak hesap bilgisi (opsiyonel). Cari kaydedildikten sonra detaydan ek hesap ekleyebilirsiniz.
                </Text>
                <CustomInput fullWidth label="Banka adı" value={bankName} onChangeText={setBankName} placeholder="Örn. Ziraat Bankası" />
                <CustomInput fullWidth label="IBAN" value={iban} onChangeText={setIban} placeholder="TR00 0000 0000 0000 0000 0000 00" keyboardType="default" autoCapitalize="characters" />
              </View>
            </View>

            {/* Bölüm 4: Not */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={[s.sectionIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Not</Text>
              </View>
              <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CustomInput fullWidth label="Özel not" value={notes} onChangeText={setNotes} placeholder="Tercih, hatırlatma vb. (opsiyonel)" />
              </View>
            </View>

            {/* Aksiyonlar */}
            <View style={s.actions}>
              <Button title="İptal" variant="ghost" onPress={handleBack} disabled={isLoading} style={s.btnCancel} />
              <Button title="Cari oluştur" onPress={handleKaydet} isLoading={isLoading} disabled={isLoading} style={s.btnPrimary} />
            </View>

            <View style={s.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.sm },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.lg, gap: Spacing.sm,
    borderLeftWidth: 4,
  },
  errorText: { fontSize: 14, flex: 1, fontWeight: '500' },
  section: { marginBottom: SECTION_SPACING },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.sm, paddingLeft: Spacing.xs,
  },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionCard: {
    borderRadius: CARD_RADIUS, padding: Spacing.lg,
    borderWidth: 1,
  },
  helperText: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.md },
  actions: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.md, marginTop: SECTION_SPACING,
    paddingHorizontal: Spacing.xs,
  },
  btnCancel: { flex: 0, minWidth: 0, width: undefined, paddingHorizontal: Spacing.lg },
  btnPrimary: { flex: 1, minWidth: 0 },
  bottomSpacer: { height: 48 },
});
