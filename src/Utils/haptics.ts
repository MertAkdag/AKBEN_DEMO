import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/** Buton / sekmeler için hafif dokunma geri bildirimi */
export function lightImpact() {
  if (isNative) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  }
}

/** Başarı / onay için kısa titreşim */
export function successNotification() {
  if (isNative) {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
  }
}

/** Uyarı / hata için */
export function warningNotification() {
  if (isNative) {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (_) {}
  }
}
