import { useEffect, useRef, useState } from 'react';
import { Image, View, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';

import Header from '@/components/dino/Header';
import FriendJar from '@/components/dino/FriendJar';
import ActionButtons from '@/components/dino/ActionButtons';
import { cleanupSounds } from '@/components/dino/SoundManager';

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const friendIds = useRef<number[]>([]);

  const getFriends = () => friendIds.current;

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => { cleanupSounds(); };
  }, []);

  const handleCollect = () => {
    setCount((prev) => prev + 1);
    friendIds.current = [...friendIds.current, Math.floor(Math.random() * 8) + 1];
  };

  const handleRelease = () => {
    setCount((prev) => prev - 1);
    if (friendIds.current.length > 0) {
      friendIds.current = friendIds.current.slice(0, -1);
    }
  };

  const handleReset = () => {
    setCount(0);
    friendIds.current = [];
  };

  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/images/bg.png')}
        style={styles.bgImage}
      />
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Header friendCount={count} />
            <View style={styles.jarSection}>
              <FriendJar count={count} friends={getFriends()} />
            </View>
            <ActionButtons
              onCollect={handleCollect}
              onRelease={handleRelease}
              onReset={handleReset}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 40,
    marginTop: 40,
    borderWidth: 4,
    borderColor: '#1ABC9C',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1ABC9C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  jarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
