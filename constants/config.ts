export const CONFIG = {
  STREAM_URL: 'https://bonnytone.com/stream/hls/btradio/live.m3u8',
  METADATA_API_URL: 'https://bonnytone.com/api/azuracast/nowplaying/btradio',
  METADATA_POLL_INTERVAL_MS: 15_000,
  METADATA_TIMEOUT_MS: 10_000,
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_BASE_DELAY_MS: 1_000,
  RECONNECT_MAX_DELAY_MS: 30_000,
  BUFFER_TIMEOUT_MS: 30_000,
  SHARE_MESSAGE: 'Listen to BonnyTone Radio – 24/7 House & Electronic Music\nhttps://bonnytone.com',
  SHARE_URL: 'https://bonnytone.com',
} as const;
