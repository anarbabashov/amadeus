import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlayButton from '@/components/PlayButton';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (comp: any) => comp,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withRepeat: jest.fn(),
    withTiming: jest.fn((val: number) => val),
    withSpring: jest.fn((val: number) => val),
    Easing: {
      out: jest.fn(() => jest.fn()),
      inOut: jest.fn(() => jest.fn()),
      ease: 'ease',
    },
  };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => <Text testID={`icon-${name}`} {...props} />,
  };
});

describe('PlayButton', () => {
  it('renders play icon when not playing', () => {
    const { getByTestId } = render(
      <PlayButton isPlaying={false} isBuffering={false} onPress={jest.fn()} />
    );
    expect(getByTestId('icon-play')).toBeTruthy();
  });

  it('renders pause icon when playing', () => {
    const { getByTestId } = render(
      <PlayButton isPlaying={true} isBuffering={false} onPress={jest.fn()} />
    );
    expect(getByTestId('icon-pause')).toBeTruthy();
  });

  it('renders spinner when buffering', () => {
    const { queryByTestId, UNSAFE_getByType } = render(
      <PlayButton isPlaying={false} isBuffering={true} onPress={jest.fn()} />
    );
    // Should not show play or pause icons
    expect(queryByTestId('icon-play')).toBeNull();
    expect(queryByTestId('icon-pause')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <PlayButton isPlaying={false} isBuffering={false} onPress={onPress} />
    );
    fireEvent.press(getByTestId('icon-play'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
