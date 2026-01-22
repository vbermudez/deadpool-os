import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Volume2 } from 'lucide-react';
import { useConversationStore } from '../stores/conversationStore';
import { useGameStore } from '../stores/gameStore';
import { useAchievementStore } from '../stores/achievementStore';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { checkForSecretWords } from '../utils/easterEggs';
import { soundManager } from '../utils/soundManager';
import { apiService } from '../services/api';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { messages, isTyping, addMessage, setMood, setIsTyping } = useConversationStore();
  const { incrementChimichangas } = useGameStore();
  const { unlockAchievement } = useAchievementStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const playVoice = async (text: string, messageId: string) => {
    if (playingVoiceId === messageId) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(messageId);
    
    // Unlock achievement for hearing Deadpool's voice
    unlockAchievement('heard-voice');

    try {
      const response = await apiService.synthesizeVoice(text);

      if (response.error) {
        console.error('Voice synthesis error:', response.error);
        setPlayingVoiceId(null);
        return;
      }

      if (response.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.audio), (c) => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setPlayingVoiceId(null);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Failed to play voice:', error);
      setPlayingVoiceId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    
    // Unlock achievement for first chat
    if (messages.length === 0) {
      unlockAchievement('first-chat');
      soundManager.playAchievement();
    }
    
    setInput('');
    setIsTyping(true);
    incrementChimichangas(1);

    try {
      const response = await apiService.sendMessage(userMessage.content);

      if (response.error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Error: ${response.error}. Did you set up your .env file with VITE_OPENAI_API_KEY?`,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      } else if (response.content) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
        };
        addMessage(assistantMessage);

        // Check for secret words and unlock achievement
        const lowerInput = userMessage.content.toLowerCase();
        const lowerResponse = response.content.toLowerCase();
        if ((lowerInput.includes('chimichanga') || lowerInput.includes('joke')) && 
            (lowerResponse.includes('😂') || lowerResponse.includes('haha') || lowerResponse.includes('lol'))) {
          unlockAchievement('made-deadpool-laugh');
          soundManager.playDeadpoolLaugh();
        }

        if (response.mood) {
          setMood(response.mood as any);
        }
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Failed to connect. Make sure the Electron backend is running properly.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-deadpool-red text-white comic-text deadpool-glow'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap break-words flex-1">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => playVoice(message.content, message.id)}
                      className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Play voice"
                    >
                      <Volume2
                        className={`w-5 h-5 ${
                          playingVoiceId === message.id ? 'animate-pulse text-yellow-300' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-deadpool-red text-white rounded-lg p-4 deadpool-glow">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="comic-text">Deadpool is typing...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Deadpool anything... he's listening (and judging)"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deadpool-red"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-deadpool-red text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors deadpool-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 Each message earns you 1 chimichanga!
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
