export type StreamStatus = 'idle' | 'connecting' | 'live' | 'buffering' | 'error' | 'offline';

export type StreamQuality = 'low' | 'medium' | 'high';

export interface TrackMetadata {
  title: string;
  artist: string;
  artworkUrl: string | null;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
