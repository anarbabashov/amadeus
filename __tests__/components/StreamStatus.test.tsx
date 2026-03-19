import React from 'react';
import { render } from '@testing-library/react-native';
import StreamStatus from '@/components/StreamStatus';

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
    Easing: {
      inOut: jest.fn(() => jest.fn()),
      ease: 'ease',
    },
  };
});

describe('StreamStatus', () => {
  it('shows LIVE badge when live and status is live', () => {
    const { getByText } = render(
      <StreamStatus isLive={true} listenerCount={42} streamStatus="live" />
    );
    expect(getByText('LIVE')).toBeTruthy();
  });

  it('shows listener count when live', () => {
    const { getByText } = render(
      <StreamStatus isLive={true} listenerCount={42} streamStatus="live" />
    );
    expect(getByText('42 listening')).toBeTruthy();
  });

  it('hides LIVE badge when not live', () => {
    const { queryByText } = render(
      <StreamStatus isLive={false} listenerCount={42} streamStatus="live" />
    );
    expect(queryByText('LIVE')).toBeNull();
  });

  it('shows Connecting text', () => {
    const { getByText } = render(
      <StreamStatus isLive={false} listenerCount={null} streamStatus="connecting" />
    );
    expect(getByText('Connecting...')).toBeTruthy();
  });

  it('shows Buffering text', () => {
    const { getByText } = render(
      <StreamStatus isLive={false} listenerCount={null} streamStatus="buffering" />
    );
    expect(getByText('Buffering...')).toBeTruthy();
  });

  it('shows reconnecting with error count', () => {
    const { getByText } = render(
      <StreamStatus isLive={false} listenerCount={null} streamStatus="error" errorCount={3} />
    );
    expect(getByText('Reconnecting (3/10)...')).toBeTruthy();
  });

  it('shows Offline text', () => {
    const { getByText } = render(
      <StreamStatus isLive={false} listenerCount={null} streamStatus="offline" />
    );
    expect(getByText('Offline')).toBeTruthy();
  });

  it('shows nothing in idle state', () => {
    const { queryByText } = render(
      <StreamStatus isLive={false} listenerCount={null} streamStatus="idle" />
    );
    expect(queryByText('LIVE')).toBeNull();
    expect(queryByText('Connecting...')).toBeNull();
    expect(queryByText('Offline')).toBeNull();
  });
});
