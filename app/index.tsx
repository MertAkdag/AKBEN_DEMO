import { useEffect } from 'react';
import { ActivityIndicator, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/Context/ThemeContext';
import { ONBOARDING_KEY } from './onboarding';

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      await new Promise((r) => setTimeout(r, 1200)); // splash süresi
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (seen === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        router.replace('/onboarding');
      }
    };
    check();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Image
        source={require('../assets/images/akbenlogo.png')}
        style={{ width: 160, height: 64, marginBottom: 24 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
