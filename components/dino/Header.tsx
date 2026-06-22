import { View, Text, Image, StyleSheet } from 'react-native';

interface HeaderProps {
  friendCount: number;
}

export default function Header({ friendCount }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/header.png')} style={styles.image} resizeMode="contain" />
      <View style={styles.badge}>
        <View style={styles.gloss} />
        <Text style={styles.label}>FRIENDS COUNT:</Text>
        <Text style={styles.count}>{friendCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    width: 900,
    height: 190,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  badge: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: -36,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  count: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: -4,
  },
});