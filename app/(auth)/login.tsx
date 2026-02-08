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
  Alert
} from 'react-native';
import { Colors } from '../../src/Constants/Colors';
import { CustomInput } from '../../src/Components/Ui/Input';
import { Button } from '../../src/Components/Ui/Button';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useAuth } from '../../src/Context/AuthContext';

export default function LoginScreen() {
  const { calculateHeight, calculateWidth, calculateFontSize } = useResponsive();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!email || !password) {
      setError('Lütfen email ve şifrenizi girin.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      console.log('login success');
      // Yönlendirme AuthContext tarafından otomatik yapılacak
    } catch (e: any) {
      console.log(e);
      let msg = 'Giriş sırasında bir hata oluştu.';
      if (e.response?.status === 401) {
        msg = 'Email veya şifre hatalı.';
      } else if (e.message) {
        msg = e.message;
      }
      setError(msg);
      Alert.alert('Hata', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/akbenlogo.png')}
                style={{
                  width: Math.min(calculateWidth(140), 180),
                  height: Math.min(calculateWidth(56), 72),
                }}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { fontSize: calculateFontSize(26) }]}>
              Akben
            </Text>
            <Text style={styles.tagline}>Kuyumcu yönetim paneli</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formCardAccent} />
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

            {error && (
              <Text
                style={[
                  styles.errorText,
                  { marginBottom: calculateHeight(8), fontSize: calculateFontSize(12) },
                ]}
              >
                {error}
              </Text>
            )}

            <Button
              title="Giriş Yap"
              variant="primary"
              isLoading={isLoading}
              onPress={handleLogin}
              fullWidth
              style={{ marginTop: calculateHeight(4) }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
  },
  tagline: {
    color: Colors.subtext,
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  formCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingLeft: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  formCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  errorText: {
    color: Colors.error,
  },
  footerText: {
    color: Colors.subtext,
    textAlign: 'center',
  },
});
