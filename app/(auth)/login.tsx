import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useAuth } from '../../src/Context/AuthContext';
import { useTheme } from '../../src/Context/ThemeContext';
import { successNotification } from '../../src/Utils/haptics';

export default function LoginScreen() {
  const { calculateHeight, calculateWidth, calculateFontSize } = useResponsive();
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!email || !password) { setError('Lütfen email ve şifrenizi girin.'); return; }
    try {
      setIsLoading(true);
      await login(email, password);
      successNotification();
    } catch (e: any) {
      const msg = e.response?.status === 401 ? 'Email veya şifre hatalı.' : (e.message || 'Giriş başarısız.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={[s.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inner}>
          {/* Logo */}
          <View style={s.logoArea}>
            <Image
              source={require('../../assets/images/akbenlogo.png')}
              style={{ width: Math.min(calculateWidth(120), 160), height: Math.min(calculateWidth(48), 64) }}
              resizeMode="contain"
            />
            <Text style={[s.brand, { fontSize: calculateFontSize(28), color: colors.text }]}>Akben</Text>
            <Text style={[s.tagline, { color: colors.subtext }]}>Kuyumcu yönetim paneli</Text>
          </View>

          {/* Form */}
          <View style={[s.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomInput
              label="Email"
              placeholder="ornek@firma.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <CustomInput
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />
            {error && <Text style={[s.error, { color: colors.error }]}>{error}</Text>}
            <Button
              title="Giriş Yap"
              variant="primary"
              isLoading={isLoading}
              onPress={handleLogin}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Gizlilik notu */}
          <Text style={[s.privacy, { color: colors.subtext + '80' }]}>
            Akben 2026 .
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  brand: { fontWeight: '800', letterSpacing: -0.5, marginTop: 12 },
  tagline: { fontSize: 14, fontWeight: '400', marginTop: 4 },
  form: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  error: { fontSize: 13, marginBottom: 8 },
  privacy: { fontSize: 12, fontWeight: '500', marginTop: 24, textAlign: 'center', letterSpacing: 0.1 },
});
