import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NowPlaying from '@/components/NowPlaying';

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
      ease: 'ease',
    },
  };
});

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => <View testID="blur-view" {...props} />,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => <Text testID={`icon-${name}`} {...props} />,
  };
});

describe('NowPlaying', () => {
  it('shows placeholder icon when no artwork', () => {
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={false} isBuffering={false} onPlayPress={jest.fn()} />
    );
    expect(getByTestId('icon-musical-notes')).toBeTruthy();
  });

  it('renders image when artwork URL is provided', () => {
    const { UNSAFE_getByType } = render(
      <NowPlaying
        artworkUrl="https://example.com/art.jpg"
        isPlaying={false}
        isBuffering={false}
        onPlayPress={jest.fn()}
      />
    );
    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe('https://example.com/art.jpg');
  });

  it('renders play overlay with play icon when not playing', () => {
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={false} isBuffering={false} onPlayPress={jest.fn()} />
    );
    expect(getByTestId('play-overlay')).toBeTruthy();
    expect(getByTestId('icon-play')).toBeTruthy();
  });

  it('shows blur overlay when paused', () => {
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={false} isBuffering={false} onPlayPress={jest.fn()} />
    );
    expect(getByTestId('blur-view')).toBeTruthy();
  });

  it('hides blur overlay when playing', () => {
    const { queryByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={true} isBuffering={false} onPlayPress={jest.fn()} />
    );
    expect(queryByTestId('blur-view')).toBeNull();
  });

  it('renders pause icon when playing', () => {
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={true} isBuffering={false} onPlayPress={jest.fn()} />
    );
    expect(getByTestId('icon-pause')).toBeTruthy();
  });

  it('calls onPlayPress when overlay is pressed', () => {
    const onPlayPress = jest.fn();
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} isPlaying={false} isBuffering={false} onPlayPress={onPlayPress} />
    );
    fireEvent.press(getByTestId('play-overlay'));
    expect(onPlayPress).toHaveBeenCalledTimes(1);
  });
});
