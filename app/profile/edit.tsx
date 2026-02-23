import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '../../src/Context/ThemeContext';
import { useAuth } from '../../src/features/auth/useAuth';
import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { lightImpact, successNotification } from '../../src/Utils/haptics';
import { Spacing } from '../../src/Constants/Spacing';

// TODO: authService.updateProfile(data) ile değiştir
// API: PUT /api/v1/profile
const mockUpdateProfile = async (_data: any): Promise<void> => {
  await new Promise((r) => setTimeout(r, 800));
};

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const nameParts = (user?.name || 'Demo Kullanıcı').trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const handleSave = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!firstName.trim()) { setError('Ad alanı zorunludur.'); return; }
    if (!email.trim().includes('@')) { setError('Geçerli bir e-posta adresi girin.'); return; }
    try {
      setLoading(true);
      await mockUpdateProfile({ firstName, lastName, email, phone, company });
      successNotification();
      router.back();
    } catch {
      setError('Bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Nav */}
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => { lightImpact(); router.back(); }}
          style={s.navBtn}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: colors.text }]}>Profil Düzenle</Text>
        <View style={s.navBtn} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar */}
            <Animated.View entering={FadeInDown.duration(500).springify()} style={s.avatarSection}>
              <View
                style={[
                  s.avatar,
                  {
                    backgroundColor: isDark ? colors.primary + '1A' : colors.primary + '14',
                    borderColor: colors.primary + (isDark ? '45' : '50'),
                    ...Platform.select({
                      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: isDark ? 0.2 : 0.12, shadowRadius: 14 },
                      android: { elevation: 6 },
                    }),
                  },
                ]}
              >
                <Text style={[s.avatarText, { color: colors.primary }]}>
                  {getInitials(fullName)}
                </Text>
              </View>
              <Text style={[s.avatarName, { color: colors.text }]}>{fullName || 'Adınız'}</Text>
            </Animated.View>

            {/* Hata */}
            {error && (
              <View style={[s.errorBox, { backgroundColor: '#EF4444' + '12', borderColor: '#EF4444' + '28' }]}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Kişisel bilgiler */}
            <Animated.View entering={FadeInDown.duration(500).delay(60).springify()}>
              <Text style={[s.sectionLabel, { color: colors.subtext }]}>KİŞİSEL BİLGİLER</Text>
              <View
                style={[
                  s.card,
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
                <CustomInput label="Ad" value={firstName} onChangeText={setFirstName} placeholder="Adınız" />
                <View style={{ height: 12 }} />
                <CustomInput label="Soyad" value={lastName} onChangeText={setLastName} placeholder="Soyadınız" />
                <View style={{ height: 12 }} />
                <CustomInput
                  label="Telefon"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="05xx xxx xx xx"
                  keyboardType="phone-pad"
                />
              </View>
            </Animated.View>

            {/* Hesap bilgileri */}
            <Animated.View entering={FadeInDown.duration(500).delay(110).springify()}>
              <Text style={[s.sectionLabel, { color: colors.subtext }]}>HESAP BİLGİLERİ</Text>
              <View
                style={[
                  s.card,
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
                <CustomInput
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@firma.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={{ height: 12 }} />
                <CustomInput
                  label="Şirket Adı"
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Şirket adı"
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(160).springify()}>
              <Button
                title="Değişiklikleri Kaydet"
                onPress={handleSave}
                loading={loading}
                fullWidth
                style={{ marginBottom: 12 }}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  content: { padding: Spacing.screenPadding, paddingBottom: 32 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  avatarName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', flex: 1 },
});
