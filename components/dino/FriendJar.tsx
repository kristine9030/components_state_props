import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const ROTATIONS = [-30, -20, -10, 0, 10, 20, 30, 180, -180, 170, -170, 15, -25, 5, -5];
const IMAGES: Record<number, any> = {
  1: require('../../assets/images/1.png'),
  2: require('../../assets/images/2.png'),
  3: require('../../assets/images/3.png'),
  4: require('../../assets/images/4.png'),
  5: require('../../assets/images/5.png'),
  6: require('../../assets/images/6.png'),
  7: require('../../assets/images/7.png'),
  8: require('../../assets/images/8.png'),
};

const FRIEND_SIZE = 26;
const BIG_SIZE = 36;
const CELL = 20;
const BODY_W = 200;
const BODY_H = 210;
const GRID_COLS = Math.floor(BODY_W / CELL);
const GRID_CAPACITY = 100;

const PYRAMID_ROWS = [4, 3, 2, 1];

function friendRotation(i: number): string {
  return `${ROTATIONS[i % ROTATIONS.length]}deg`;
}

function friendPosition(i: number) {
  if (i < GRID_CAPACITY) {
    const rowFromBottom = Math.floor(i / GRID_COLS);
    const col = i % GRID_COLS;
    const x = col * CELL + (CELL - FRIEND_SIZE) / 2;
    const y = BODY_H - CELL - rowFromBottom * CELL + (CELL - FRIEND_SIZE) / 2;
    return { x, y, size: FRIEND_SIZE };
  }

  const afterGrid = i - GRID_CAPACITY;

  let cursor = 0;
  for (let row = 0; row < PYRAMID_ROWS.length; row++) {
    const colsInRow = PYRAMID_ROWS[row];
    if (afterGrid < cursor + colsInRow) {
      const col = afterGrid - cursor;
      const rowSpan = (colsInRow - 1) * CELL + BIG_SIZE;
      const offset = (BODY_W - rowSpan) / 2;
      const x = offset + col * CELL;
      const y = -(row + 1) * CELL + (CELL - BIG_SIZE) / 2;
      return { x, y, size: BIG_SIZE };
    }
    cursor += colsInRow;
  }

  const fallIdx = afterGrid - cursor;
  const side = fallIdx % 2 === 0 ? -1 : 1;
  const x = side === -1 ? -BIG_SIZE - 5 - ((fallIdx * 17) % 30) : BODY_W + 5 + ((fallIdx * 13) % 30);
  const y = ((fallIdx * 29 + 7) % (BODY_H + 30)) - 15;
  return { x, y, size: FRIEND_SIZE };
}

function FriendImage({ id, x, y, size, rotate }: { id: number; x: number; y: number; size: number; rotate: string }) {
  const dropAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dropAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Image
      source={IMAGES[id]}
      style={[
        styles.friendImage,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [{ translateY: dropAnim }, { rotate }],
        },
      ]}
    />
  );
}

interface FriendJarProps {
  count: number;
  friends: number[];
}

export default function FriendJar({ count, friends }: FriendJarProps) {
  const isEmpty = count <= 0;
  const isNegative = count < 0;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 600, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [wobble]);

  const rotate = wobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

  const visibleFriends = friends;

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.jar, { transform: [{ rotate }] }]}>
        <View style={styles.jarRim} />
        <View style={styles.jarNeck} />
        <View style={styles.jarBody}>
          <View style={styles.glassLine} />
          {!isEmpty && (
            <Text style={styles.jarCount}>{count}</Text>
          )}
          {isEmpty ? (
            isNegative ? (
              <Text style={styles.sadText}>aww so sad that{'\n'}you dont have friend,{'\n'}dont worry i got you</Text>
            ) : (
              <Text style={styles.emptyText}>Your jar is empty!</Text>
            )
          ) : (
            friends.map((id, i) => {
              const { x, y, size } = friendPosition(i);
              return (
                <FriendImage
                  key={`${id}-${i}`}
                  id={id}
                  x={x}
                  y={y}
                  size={size}
                  rotate={friendRotation(i)}
                />
              );
            })
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const GLASS_BORDER = 'rgba(0, 0, 0, 0.2)';
const GLASS_BG = 'rgba(255, 255, 255, 0.08)';

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 14,
  },
  jar: {
    alignItems: 'center',
  },
  jarRim: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(200, 216, 228, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(160, 184, 200, 0.3)',
    zIndex: 3,
  },
  jarNeck: {
    width: 84,
    height: 18,
    backgroundColor: GLASS_BG,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: GLASS_BORDER,
    zIndex: 2,
  },
  jarBody: {
    width: BODY_W,
    height: BODY_H,
    backgroundColor: GLASS_BG,
    borderWidth: 2,
    borderColor: GLASS_BORDER,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'visible',
  },
  glassLine: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    zIndex: 1,
  },
  emptyText: {
    fontSize: 15,
    color: '#9AABB8',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 85,
  },
  sadText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 65,
    lineHeight: 22,
  },
  jarCount: {
    position: 'absolute',
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(107, 143, 113, 0.15)',
    zIndex: 0,
    alignSelf: 'center',
    top: 65,
  },
  friendImage: {
    position: 'absolute',
    borderRadius: 4,
  },
});
