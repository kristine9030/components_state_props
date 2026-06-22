import { Audio } from 'expo-av';

interface Note {
  freq: number;
  startMs: number;
  durMs: number;
}

function toBase64(u8: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < u8.length; i++) {
    chars.push(String.fromCharCode(u8[i]));
  }
  return btoa(chars.join(''));
}

function generateCuteSound(notes: Note[], sampleRate = 8000): string {
  const totalMs = notes.reduce((t, n) => Math.max(t, n.startMs + n.durMs), 0);
  const numSamples = Math.floor((sampleRate * totalMs) / 1000);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const tMs = (i / sampleRate) * 1000;
    let sample = 0;

    for (const note of notes) {
      const localT = tMs - note.startMs;
      if (localT < 0 || localT > note.durMs) continue;
      const t = localT / 1000;
      const progress = localT / note.durMs;

      const envelope = progress < 0.05
        ? progress / 0.05
        : Math.max(0, 1 - (progress - 0.05) / 0.95);

      const tone = Math.sin(2 * Math.PI * note.freq * t) * 0.4
        + Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.2
        + Math.sin(2 * Math.PI * note.freq * 3 * t) * 0.1
        + Math.sin(2 * Math.PI * note.freq * 4 * t) * 0.05;

      sample += tone * envelope;
    }

    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 28000, true);
  }

  const base64 = toBase64(new Uint8Array(buffer));
  return 'data:audio/wav;base64,' + base64;
}

const SOUNDS = {
  feed: generateCuteSound([
    { freq: 1047, startMs: 0, durMs: 50 },
    { freq: 1319, startMs: 40, durMs: 50 },
    { freq: 1568, startMs: 80, durMs: 80 },
  ]),
  naptime: generateCuteSound([
    { freq: 784, startMs: 0, durMs: 60 },
    { freq: 659, startMs: 50, durMs: 60 },
    { freq: 523, startMs: 100, durMs: 100 },
  ]),
  adopt: generateCuteSound([
    { freq: 523, startMs: 0, durMs: 60 },
    { freq: 659, startMs: 50, durMs: 60 },
    { freq: 784, startMs: 100, durMs: 60 },
    { freq: 1047, startMs: 150, durMs: 60 },
    { freq: 1319, startMs: 200, durMs: 120 },
  ]),
} as const;

let cache: Record<string, Audio.Sound> = {};

export async function playSound(name: keyof typeof SOUNDS) {
  try {
    const uri = SOUNDS[name];
    let sound = cache[uri];
    if (!sound) {
      const result = await Audio.Sound.createAsync(
        { uri },
        { volume: 0.5, shouldPlay: false },
      );
      sound = result.sound;
      cache[uri] = sound;
    }
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    console.warn('playSound error:', e);
  }
}

export async function cleanupSounds() {
  try {
    const sounds = Object.values(cache);
    cache = {};
    for (const sound of sounds) {
      await sound.unloadAsync();
    }
  } catch (e) {
    console.warn('cleanupSounds error:', e);
  }
}