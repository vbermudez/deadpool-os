export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DeadpoolResponse {
  content?: string;
  mood?: string;
  error?: string;
}

export interface ImageResponse {
  url?: string;
  error?: string;
}

export type Mood = 'bored' | 'excited' | 'sarcastic' | 'chaotic' | 'hungry';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}
