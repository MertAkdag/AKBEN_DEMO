// AsyncStorage'ı temizlemek için bu script'i çalıştır:
// npx react-native run-ios veya run-android ile birlikte kullanılabilir
// Veya Expo Go'da: AsyncStorage.clear() yapılabilir

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

AsyncStorage.removeItem('akben_onboarding_seen').then(() => {
  console.log('Onboarding temizlendi!');
});
