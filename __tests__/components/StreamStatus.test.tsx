import React from 'react';
import { render } from '@testing-library/react-native';
import StreamStatus from '@/components/StreamStatus';

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (comp: any) => comp,
    },
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedStyle: (fn: () => any) => fn(),
    withRepeat: jest.fn(),
    withTiming: jest.fn((val: number) => val),
    withSequence: jest.fn((...args: any[]) => args[args.length - 1]),
    Easing: {
      inOut: jest.fn(() => jest.fn()),
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

describe('StreamStatus', () => {
  it('shows LIVE text when stream is live', () => {
    const { getByText } = render(
      <StreamStatus streamStatus="live" />
    );
    expect(getByText('LIVE')).toBeTruthy();
  });

  it('returns null when idle', () => {
    const { queryByText } = render(
      <StreamStatus streamStatus="idle" />
    );
    expect(queryByText('LIVE')).toBeNull();
  });

  it('shows CONNECTING when connecting', () => {
    const { getByText } = render(
      <StreamStatus streamStatus="connecting" />
    );
    expect(getByText('CONNECTING')).toBeTruthy();
  });

  it('shows OFFLINE when offline', () => {
    const { getByText } = render(
      <StreamStatus streamStatus="offline" />
    );
    expect(getByText('OFFLINE')).toBeTruthy();
  });

  it('shows ERROR when error', () => {
    const { getByText } = render(
      <StreamStatus streamStatus="error" errorCount={3} />
    );
    expect(getByText('ERROR')).toBeTruthy();
  });

  it('has glass blur background', () => {
    const { getByTestId } = render(
      <StreamStatus streamStatus="live" />
    );
    expect(getByTestId('blur-view')).toBeTruthy();
  });
});
