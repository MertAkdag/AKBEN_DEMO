import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Senin veri yapına uygun tipler
type StoryItem = { id: string; source: { uri: string }; mediaType: string };
type UserStory = { id: string; name: string; avatarSource: { uri: string }; stories: StoryItem[] };

interface Props {
  isVisible: boolean;
  userStory: UserStory | null;
  onClose: () => void;
}

export default function ModernStoryViewer({ isVisible, userStory, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useSharedValue(0);
  const progress = useSharedValue(0);

  // Modal açıldığında progress bar'ı ve index'i sıfırla
  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(0);
      translateY.value = 0;
      startProgress();
    }
  }, [isVisible, userStory]);

  // Hikaye süresi dolduğunda diğerine geçme animasyonu
  const startProgress = () => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 5000, easing: Easing.linear }, (isFinished) => {
      if (isFinished) {
        runOnJS(handleNext)();
      }
    });
  };

  const handleNext = () => {
    if (!userStory) return;
    if (currentIndex < userStory.stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      startProgress(); // Yeni hikaye için barı baştan başlat
    } else {
      onClose(); // Son hikayeyse kapat
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      startProgress();
    }
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) { // Sadece aşağı kaydırmaya izin ver
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        // Yeterince aşağı kaydırıldıysa kapat
        runOnJS(onClose)();
      } else {
        // Yeterli değilse eski yerine yaylanarak geri dön (spring efekti)
        translateY.value = withSpring(0);
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!userStory) return null;

  const currentMedia = userStory.stories[currentIndex];

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.storyContainer, animatedContainerStyle]}>
            
            {/* Arka Plan Medyası */}
            <Image 
              source={{ uri: currentMedia.source.uri }} 
              style={styles.media} 
              contentFit="cover" 
            />

            {/* Üst Kısım: Progress Bar ve Kullanıcı Bilgisi */}
            <View style={styles.header}>
              <View style={styles.progressBarContainer}>
                {userStory.stories.map((_, index) => (
                  <View key={index} style={styles.progressBackground}>
                    {index === currentIndex && (
                      <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
                    )}
                    {index < currentIndex && <View style={[styles.progressFill, { width: '100%' }]} />}
                  </View>
                ))}
              </View>

              <View style={styles.userInfo}>
                <Image source={{ uri: userStory.avatarSource.uri }} style={styles.avatar} />
                <Text style={styles.userName}>{userStory.name}</Text>
                <Ionicons name="close" size={28} color="white" style={styles.closeIcon} onPress={onClose} />
              </View>
            </View>

            {/* Sağ-Sol Tıklama Alanları (GestureDetector yerine basit Touchable işimizi görür) */}
            <View style={styles.touchAreaContainer}>
              <TouchableWithoutFeedback onPress={handlePrev}>
                <View style={styles.leftTouch} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={handleNext}>
                <View style={styles.rightTouch} />
              </TouchableWithoutFeedback>
            </View>

          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  storyContainer: { flex: 1, backgroundColor: 'black', borderRadius: 10, overflow: 'hidden' },
  media: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, position: 'absolute' },
  header: { position: 'absolute', top: 50, width: '100%', paddingHorizontal: 10, zIndex: 10 },
  progressBarContainer: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  progressBackground: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'white' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, borderWidth: 1, borderColor: '#C9963B' },
  userName: { color: 'white', fontSize: 16, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  closeIcon: { marginLeft: 'auto', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  touchAreaContainer: { flex: 1, flexDirection: 'row' },
  leftTouch: { flex: 1 }, // Ekranın %50'si
  rightTouch: { flex: 1 }, // Ekranın %50'si
});