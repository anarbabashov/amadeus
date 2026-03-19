export const colors = {
  primary: '#06b6d4',
  primaryAlt: '#14b8a6',
  backgroundStart: '#0a0a0a',
  backgroundEnd: '#1a1a1a',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  liveBadge: '#ef4444',
} as const;

export const glass = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderRadius: 16,
} as const;

export const typography = {
  heading: {
    fontWeight: '700' as const,
    fontSize: 28,
  },
  headingLg: {
    fontWeight: '700' as const,
    fontSize: 32,
  },
  body: {
    fontWeight: '400' as const,
    fontSize: 16,
  },
  metadata: {
    fontWeight: '500' as const,
    fontSize: 14,
  },
  caption: {
    fontWeight: '400' as const,
    fontSize: 12,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const sizes = {
  playButton: 80,
  playButtonIcon: 32,
  artwork: 240,
  artworkRadius: 16,
  actionButton: 44,
} as const;
