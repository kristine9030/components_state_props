import { useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { playSound } from './SoundManager';

interface ActionButtonsProps {
  onCollect: () => void;
  onRelease: () => void;
  onReset: () => void;
}

const COLORS = ['#6FCF97', '#F2C94C', '#BB6BD9'];

const LABELS = ['Collect Friend', 'Release Friend', 'Empty Jar'];
const SOUNDS: ('feed' | 'naptime' | 'adopt')[] = ['feed', 'naptime', 'adopt'];

function ActionButton({
  label,
  color,
  sound,
  onPress,
  repeat,
}: {
  label: string;
  color: string;
  sound: 'feed' | 'naptime' | 'adopt';
  onPress: () => void;
  repeat?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, tension: 150, friction: 4 }).start();
    playSound(sound);
    onPress();
    if (repeat) {
      clear();
      intervalRef.current = setInterval(() => {
        playSound(sound);
        onPress();
      }, repeat);
    }
  };

  const handlePressOut = () => {
    clear();
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 4 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => {}}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.button, { backgroundColor: color }]}>
          <View style={styles.gloss} />
          <Text style={styles.buttonLabel}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ActionButtons({ onCollect, onRelease, onReset }: ActionButtonsProps) {
  const handlers = [onCollect, onRelease, onReset];
  const repeats = [120, 180, undefined];

  return (
    <View style={styles.container}>
      {LABELS.map((label, i) => (
        <ActionButton
          key={label}
          label={label}
          color={COLORS[i]}
          sound={SOUNDS[i]}
          onPress={handlers[i]}
          repeat={repeats[i]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 0,
    width: 240,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
