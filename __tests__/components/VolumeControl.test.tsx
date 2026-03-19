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
  it('shows volume-low icon on left at high volume', () => {
    const { getAllByTestId } = render(
      <VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    // Left icon is volume-low (decorative), right icon is volume-high
    expect(getAllByTestId('icon-volume-low').length).toBeGreaterThanOrEqual(1);
  });

  it('shows volume-high icon on right side', () => {
    const { getAllByTestId } = render(
      <VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={jest.fn()} />
    );
    expect(getAllByTestId('icon-volume-high').length).toBeGreaterThanOrEqual(1);
  });

  it('shows volume-mute icon on left when muted', () => {
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

  it('calls onMuteToggle when left icon pressed', () => {
    const onMuteToggle = jest.fn();
    const { getAllByTestId } = render(
      <VolumeControl volume={0.8} isMuted={false} onVolumeChange={jest.fn()} onMuteToggle={onMuteToggle} />
    );
    fireEvent.press(getAllByTestId('icon-volume-low')[0]);
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
