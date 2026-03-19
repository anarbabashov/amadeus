import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VolumeControl from '@/components/VolumeControl';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => <Text testID={`icon-${name}`} {...props} />,
  };
});

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="volume-slider"
        {...props}
        accessibilityValue={{ min: 0, max: 1, now: props.value }}
      />
    ),
  };
});

describe('VolumeControl', () => {
  it('shows volume-high icon at high volume', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    expect(getByTestId('icon-volume-high')).toBeTruthy();
  });

  it('shows volume-low icon at low volume', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0.3} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    expect(getByTestId('icon-volume-low')).toBeTruthy();
  });

  it('shows volume-mute icon when muted', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0.8} isMuted={true} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    expect(getByTestId('icon-volume-mute')).toBeTruthy();
  });

  it('shows volume-mute icon when volume is 0', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    expect(getByTestId('icon-volume-mute')).toBeTruthy();
  });

  it('calls onMuteToggle when mute button pressed', () => {
    const onMuteToggle = jest.fn();
    const { getByTestId } = render(
      <VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={onMuteToggle} />
    );
    fireEvent.press(getByTestId('icon-volume-high'));
    expect(onMuteToggle).toHaveBeenCalledTimes(1);
  });

  it('shows slider value as 0 when muted', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0.8} isMuted={true} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    const slider = getByTestId('volume-slider');
    expect(slider.props.value).toBe(0);
  });

  it('shows actual volume on slider when not muted', () => {
    const { getByTestId } = render(
      <VolumeControl volume={0.6} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    const slider = getByTestId('volume-slider');
    expect(slider.props.value).toBe(0.6);
  });
});
