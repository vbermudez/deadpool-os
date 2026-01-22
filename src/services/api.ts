// API Service - abstracts communication with backend
// Works with both Electron IPC and HTTP fetch

// In dev: proxy forwards /api to localhost:3000
// In prod: use VITE_API_URL env var or default to /api (same domain)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ChatResponse {
  content?: string;
  mood?: string;
  error?: string;
}

interface ImageResponse {
  url?: string;
  error?: string;
}

interface VoiceResponse {
  audio?: string;
  error?: string;
}

// Check if running in Electron environment
const isElectron = () => {
  return !!(window as any).electronAPI;
};

export const apiService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    if (isElectron()) {
      return (window as any).electronAPI.sendMessage(message);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to send message' };
    }
  },

  async generateImage(prompt: string): Promise<ImageResponse> {
    if (isElectron()) {
      return (window as any).electronAPI.generateImage(prompt);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image API error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to generate image' };
    }
  },

  async synthesizeVoice(text: string): Promise<VoiceResponse> {
    if (isElectron()) {
      return (window as any).electronAPI.synthesizeVoice(text);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Voice API error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to synthesize voice' };
    }
  },
};
