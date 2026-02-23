import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact, successNotification } from '../../src/Utils/haptics';

// TODO: authService.forgotPassword(email) ile değiştir
// API: POST /api/v1/auth/forgot-password  { email }
const mockForgotPassword = async (email: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 1200));
  if (!email.includes('@')) throw new Error('Geçersiz e-posta adresi.');
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!email.trim()) { setError('E-posta adresinizi girin.'); return; }
    try {
      setLoading(true);
      await mockForgotPassword(email.trim().toLowerCase());
      successNotification();
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
            <Text style={[s.navTitle, { color: colors.text }]}>Şifremi Unuttum</Text>
            <View style={s.navBtn} />
          </View>

          <ScrollView
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* İkon */}
            <View style={s.iconArea}>
              <View
                style={[
                  s.iconWrap,
                  {
                    backgroundColor: colors.primary + '12',
                    borderColor: colors.primary + '25',
                    ...Platform.select({
                      ios: {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                      },
                      android: { elevation: 6 },
                    }),
                  },
                ]}
              >
                <Ionicons name="lock-open-outline" size={42} color={colors.primary} />
              </View>
            </View>

            {!sent ? (
              <>
                <Text style={[s.title, { color: colors.text }]}>Şifre Sıfırlama</Text>
                <Text style={[s.desc, { color: colors.subtext }]}>
                  Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı göndereceğiz.
                </Text>

                {/* Form kartı */}
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
                  {error && (
                    <View style={[s.errorBox, { backgroundColor: '#EF4444' + '12', borderColor: '#EF4444' + '28' }]}>
                      <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                      <Text style={s.errorText}>{error}</Text>
                    </View>
                  )}
                  <CustomInput
                    label="E-posta Adresi"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ornek@sirket.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Button
                  title="Sıfırlama Linki Gönder"
                  onPress={handleSend}
                  loading={loading}
                  fullWidth
                  style={{ marginTop: 4 }}
                />
              </>
            ) : (
              <>
                <Text style={[s.title, { color: colors.text }]}>Link Gönderildi</Text>
                <Text style={[s.desc, { color: colors.subtext }]}>
                  Aşağıdaki adrese sıfırlama bağlantısı gönderdik.
                </Text>

                <View
                  style={[
                    s.successCard,
                    {
                      backgroundColor: '#10B981' + '0C',
                      borderColor: '#10B981' + '28',
                    },
                  ]}
                >
                  <View style={[s.successIconWrap, { backgroundColor: '#10B981' + '14' }]}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  </View>
                  <Text style={[s.successEmail, { color: colors.text }]}>{email}</Text>
                  <Text style={[s.successNote, { color: colors.subtext }]}>
                    Gelen kutunuzu ve spam klasörünüzü kontrol edin.
                  </Text>
                </View>

                <Button
                  title="Giriş Ekranına Dön"
                  onPress={() => { lightImpact(); router.replace('/(auth)/login'); }}
                  fullWidth
                  style={{ marginTop: 4 }}
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
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
  content: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24 },
  iconArea: { alignItems: 'center', marginBottom: 28 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', flex: 1 },
  successCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmail: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  successNote: { fontSize: 13, fontWeight: '400', textAlign: 'center', lineHeight: 18 },
});
