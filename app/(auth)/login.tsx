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
                  width: calculateWidth(100),
                  height: calculateWidth(64),
                }}
              />
            </View>
            <Text style={[styles.title, { fontSize: calculateFontSize(24) }]}>
              Akben
            </Text>
          </View>

          <View style={styles.formCard}>
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
    marginBottom: 32,
  },
  logoWrapper: {
    width: 1530,
    height: 145,
    borderRadius: 24,
    marginTop: -120,
    alignItems: 'center',
  
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.subtext,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  errorText: {
    color: Colors.error,
  },
  footerText: {
    color: Colors.subtext,
    textAlign: 'center',
  },
});
