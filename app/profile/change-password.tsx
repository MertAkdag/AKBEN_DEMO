import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact, successNotification } from '../../src/Utils/haptics';
import { Spacing } from '../../src/Constants/Spacing';

// TODO: authService.changePassword(current, next) ile değiştir
// API: PUT /api/v1/auth/change-password  { currentPassword, newPassword }
const mockChangePassword = async (
  _current: string,
  _next: string,
): Promise<void> => {
  await new Promise((r) => setTimeout(r, 1000));
};

// Şifre güç hesaplayıcı
function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: '#E5E7EB' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Zayıf', color: '#EF4444' };
  if (score <= 2) return { level: 2, label: 'Orta', color: '#F59E0B' };
  if (score <= 3) return { level: 3, label: 'İyi', color: '#3B82F6' };
  return { level: 4, label: 'Güçlü', color: '#10B981' };
}

// ─── Şifre güç göstergesi ─────────────────────────────────────────────────────
function StrengthBar({ password, colors }: { password: string; colors: any }) {
  if (!password) return null;
  const { level, label, color } = getPasswordStrength(password);
  return (
    <View style={sb.container}>
      <View style={sb.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              sb.bar,
              {
                backgroundColor: i <= level ? color : (colors.divider),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[sb.label, { color }]}>{label}</Text>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!current) { setError('Mevcut şifrenizi girin.'); return; }
    if (!next || next.length < 6) { setError('Yeni şifre en az 6 karakter olmalı.'); return; }
    if (next !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    if (next === current) { setError('Yeni şifre mevcut şifreden farklı olmalı.'); return; }
    try {
      setLoading(true);
      await mockChangePassword(current, next);
      successNotification();
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu. Tekrar deneyin.');
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
        <Text style={[s.navTitle, { color: colors.text }]}>Şifre Değiştir</Text>
        <View style={s.navBtn} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* İkon */}
            <Animated.View entering={FadeInDown.duration(500).springify()} style={s.iconArea}>
              <View
                style={[
                  s.iconWrap,
                  {
                    backgroundColor: colors.primary + '12',
                    borderColor: colors.primary + '25',
                    ...Platform.select({
                      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16 },
                      android: { elevation: 5 },
                    }),
                  },
                ]}
              >
                <Ionicons name="key-outline" size={38} color={colors.primary} />
              </View>
            </Animated.View>

            {!done ? (
              <>
                {/* Hata */}
                {error && (
                  <View style={[s.errorBox, { backgroundColor: '#EF4444' + '12', borderColor: '#EF4444' + '28' }]}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {/* Form */}
                <Animated.View entering={FadeInDown.duration(500).delay(60).springify()}>
                  <Text style={[s.sectionLabel, { color: colors.subtext }]}>MEVCUT ŞİFRE</Text>
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
                      label="Mevcut Şifre"
                      value={current}
                      onChangeText={setCurrent}
                      placeholder="Mevcut şifreniz"
                      secureTextEntry
                    />
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(110).springify()}>
                  <Text style={[s.sectionLabel, { color: colors.subtext }]}>YENİ ŞİFRE</Text>
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
                      label="Yeni Şifre"
                      value={next}
                      onChangeText={setNext}
                      placeholder="En az 6 karakter"
                      secureTextEntry
                    />
                    <StrengthBar password={next} colors={colors} />
                    <View style={{ height: 12 }} />
                    <CustomInput
                      label="Yeni Şifre Tekrar"
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Şifrenizi tekrar girin"
                      secureTextEntry
                    />
                    {confirm.length > 0 && next !== confirm && (
                      <View style={[s.matchWarn, { backgroundColor: '#EF4444' + '0C', borderColor: '#EF4444' + '25' }]}>
                        <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
                        <Text style={s.matchWarnText}>Şifreler eşleşmiyor</Text>
                      </View>
                    )}
                    {confirm.length > 0 && next === confirm && (
                      <View style={[s.matchOk, { backgroundColor: '#10B981' + '0C', borderColor: '#10B981' + '25' }]}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
                        <Text style={s.matchOkText}>Şifreler eşleşiyor</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(160).springify()}>
                  <Button
                    title="Şifremi Güncelle"
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                  />
                </Animated.View>
              </>
            ) : (
              <Animated.View entering={FadeInDown.duration(500).springify()}>
                <View
                  style={[
                    s.successCard,
                    {
                      backgroundColor: '#10B981' + '0C',
                      borderColor: '#10B981' + '28',
                    },
                  ]}
                >
                  <View style={[s.successIcon, { backgroundColor: '#10B981' + '14' }]}>
                    <Ionicons name="shield-checkmark" size={40} color="#10B981" />
                  </View>
                  <Text style={[s.successTitle, { color: colors.text }]}>Şifre Güncellendi</Text>
                  <Text style={[s.successDesc, { color: colors.subtext }]}>
                    Hesabınız güvende. Yeni şifrenizle artık giriş yapabilirsiniz.
                  </Text>
                </View>
                <Button
                  title="Geri Dön"
                  onPress={() => { lightImpact(); router.back(); }}
                  fullWidth
                  style={{ marginTop: 4 }}
                />
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const sb = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 2,
  },
  bars: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '700', minWidth: 40, textAlign: 'right' },
});

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
  iconArea: { alignItems: 'center', marginBottom: 24 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  matchWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  matchWarnText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  matchOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  matchOkText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  successCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 18, fontWeight: '800' },
  successDesc: { fontSize: 14, fontWeight: '400', textAlign: 'center', lineHeight: 20 },
});
