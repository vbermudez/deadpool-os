import { create } from 'zustand';
import { ChatMessage, Mood } from '../types';

interface ConversationState {
  messages: ChatMessage[];
  mood: Mood;
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setMood: (mood: Mood) => void;
  setIsTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I'm Deadpool, but I'm also an AI built for some coding contest. Yeah, META, I know. So... you gonna ask me something or just stare at this chat interface built with React and TypeScript? (Spoiler: I can see the code. It's... interesting.)",
      timestamp: new Date(),
    },
  ],
  mood: 'chaotic',
  isTyping: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMood: (mood) => set({ mood }),

  setIsTyping: (isTyping) => set({ isTyping }),

  clearMessages: () =>
    set({
      messages: [],
    }),
}));
