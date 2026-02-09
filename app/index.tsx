import { ActivityIndicator, View, Text, Image } from 'react-native';
import { useTheme } from '../src/Context/ThemeContext';

export default function Index() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Image
        source={require('../assets/images/akbenlogo.png')}
        style={{ width: 160, height: 64, marginBottom: 24 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.subtext, marginTop: 16, fontSize: 14 }}>Yükleniyor...</Text>
    </View>
  );
}
