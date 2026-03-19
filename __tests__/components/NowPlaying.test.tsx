import React from 'react';
import { render } from '@testing-library/react-native';
import NowPlaying from '@/components/NowPlaying';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => <Text testID={`icon-${name}`} {...props} />,
  };
});

describe('NowPlaying', () => {
  it('renders title and artist', () => {
    const { getByText } = render(
      <NowPlaying artworkUrl={null} title="Deep House Mix" artist="DJ Name" />
    );
    expect(getByText('Deep House Mix')).toBeTruthy();
    expect(getByText('DJ Name')).toBeTruthy();
  });

  it('shows placeholder icon when no artwork', () => {
    const { getByTestId } = render(
      <NowPlaying artworkUrl={null} title="Test" artist="Test" />
    );
    expect(getByTestId('icon-musical-notes')).toBeTruthy();
  });

  it('renders image when artwork URL is provided', () => {
    const { UNSAFE_getByType } = render(
      <NowPlaying
        artworkUrl="https://example.com/art.jpg"
        title="Test"
        artist="Test"
      />
    );
    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe('https://example.com/art.jpg');
  });

  it('truncates long titles to 2 lines', () => {
    const { getByText } = render(
      <NowPlaying
        artworkUrl={null}
        title="A Very Long Title That Should Be Truncated After Two Lines"
        artist="Artist"
      />
    );
    const titleEl = getByText('A Very Long Title That Should Be Truncated After Two Lines');
    expect(titleEl.props.numberOfLines).toBe(2);
  });

  it('truncates artist to 1 line', () => {
    const { getByText } = render(
      <NowPlaying artworkUrl={null} title="Title" artist="Long Artist Name" />
    );
    const artistEl = getByText('Long Artist Name');
    expect(artistEl.props.numberOfLines).toBe(1);
  });
});
