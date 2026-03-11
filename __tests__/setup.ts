// Mock expo-av
jest.mock('expo-av', () => {
  const mockSound = {
    playAsync: jest.fn().mockResolvedValue(undefined),
    pauseAsync: jest.fn().mockResolvedValue(undefined),
    stopAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
    setVolumeAsync: jest.fn().mockResolvedValue(undefined),
    setOnPlaybackStatusUpdate: jest.fn(),
    getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
  };

  return {
    Audio: {
      Sound: {
        createAsync: jest.fn().mockResolvedValue({
          sound: mockSound,
          status: { isLoaded: true },
        }),
      },
      setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    },
    InterruptionModeIOS: {
      DoNotMix: 2,
      DuckOthers: 1,
      MixWithOthers: 0,
    },
    InterruptionModeAndroid: {
      DoNotMix: 2,
      DuckOthers: 1,
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
