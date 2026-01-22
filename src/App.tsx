import { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import ChimichangaClicker from './components/ChimichangaClicker';
import MemeGallery from './components/MemeGallery';
import ReflexesTest from './components/ReflexesTest';
import CodeTypoHunter from './components/CodeTypoHunter';
import VideoCompiler from './components/VideoCompiler';
import DeadpoolAvatar from './components/DeadpoolAvatar';
import AchievementsPanel from './components/AchievementsPanel';
import RandomEventNotification from './components/RandomEventNotification';
import { useGameStore } from './stores/gameStore';
import { useConversationStore } from './stores/conversationStore';
import { useAchievementStore } from './stores/achievementStore';
import { RandomEventGenerator, RandomEvent } from './services/randomEventGenerator';
import { useKonamiCode, useIdleDetection, showSecretConsoleMessage, triggerConfetti } from './utils/easterEggs';
import { soundManager } from './utils/soundManager';
import { Trophy, Volume2, VolumeX } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'clicker' | 'reflexes' | 'code-hunter' | 'gallery' | 'video'>('chat');
  const [achievementsPanelOpen, setAchievementsPanelOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [, setAvatarClickCount] = useState(0);
  
  const chimichangaCount = useGameStore((state) => state.chimichangaCount);
  const { incrementChimichangas, decrementChimichangas } = useGameStore();
  const mood = useConversationStore((state) => state.mood);
  const { setMood } = useConversationStore();
  const { initializeAchievements, unlockAchievement } = useAchievementStore();

  // Initialize achievements on mount
  useEffect(() => {
    initializeAchievements();
    showSecretConsoleMessage();
  }, [initializeAchievements]);

  useEffect(() => {
    initializeAchievements();
    showSecretConsoleMessage();
  }, [initializeAchievements]);

  useEffect(() => {
    const eventGenerator = new RandomEventGenerator(
      (event) => {
        setCurrentEvent(event);
        soundManager.playRandomEventSound();
        if (event.action) {
          event.action();
        }
        // Auto-dismiss after duration
        if (event.duration) {
          setTimeout(() => setCurrentEvent(null), event.duration);
        }
      },
      () => chimichangaCount,
      (amount) => {
        if (amount > 0) {
          incrementChimichangas(amount);
        } else {
          decrementChimichangas(Math.abs(amount));
        }
      },
      (newMood) => setMood(newMood as any),
      (achievementId) => unlockAchievement(achievementId)
    );

    eventGenerator.start();

    return () => {
      eventGenerator.stop();
    };
  }, [chimichangaCount, incrementChimichangas, decrementChimichangas, setMood, unlockAchievement]);

  // Konami Code Easter Egg
  useKonamiCode(() => {
    unlockAchievement('konami-code');
    triggerConfetti();
    soundManager.playDeadpoolLaugh();
    alert('🎮 KONAMI CODE ACTIVATED! Maximum effort! 🎉');
  });

  useIdleDetection(300000, () => {
    unlockAchievement('ignored-deadpool');
  });

  const handleAvatarClick = useCallback(() => {
    setAvatarClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 10) {
        unlockAchievement('avatar-clicked');
        soundManager.playDeadpoolLaugh();
        alert('🤪 Stop touching my face! Weirdo!');
        return 0;
      }
      return newCount;
    });
  }, [unlockAchievement]);

  useEffect(() => {
    const visited = new Set(JSON.parse(localStorage.getItem('visited-tabs') || '[]'));
    visited.add(activeTab);
    localStorage.setItem('visited-tabs', JSON.stringify(Array.from(visited)));
    
    if (visited.size >= 6) {
      unlockAchievement('all-tabs-visited');
    }
  }, [activeTab, unlockAchievement]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-deadpool-gray via-gray-900 to-black">
      {currentEvent && (
        <RandomEventNotification
          event={currentEvent}
          onDismiss={() => setCurrentEvent(null)}
        />
      )}

      <AchievementsPanel
        isOpen={achievementsPanelOpen}
        onClose={() => setAchievementsPanelOpen(false)}
      />

      <header className="bg-deadpool-red text-white p-4 shadow-lg deadpool-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleAvatarClick} className="hover:scale-110 transition-transform">
              <DeadpoolAvatar mood={mood} size={48} />
            </button>
            <div>
              <h1 className="text-2xl font-bold comic-text">DeadpoolOS</h1>
              <p className="text-sm opacity-80">
                Yes, I know I'm an AI. Yes, I'm judging your code.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs opacity-80">Chimichangas</p>
              <p className="text-2xl font-bold">{chimichangaCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Mood</p>
              <p className="text-sm font-semibold capitalize">{mood}</p>
            </div>
            <button
              onClick={toggleSound}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setAchievementsPanelOpen(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors relative"
              title="View Achievements"
            >
              <Trophy className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('clicker')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'clicker'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🌯 Clicker
          </button>
          <button
            onClick={() => setActiveTab('reflexes')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'reflexes'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            ⚡ Reflexes
          </button>
          <button
            onClick={() => setActiveTab('code-hunter')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'code-hunter'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🐛 Bug Hunter
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🖼️ Gallery
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-deadpool-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🎬 Video
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'clicker' && <ChimichangaClicker />}
        {activeTab === 'reflexes' && <ReflexesTest />}
        {activeTab === 'code-hunter' && <CodeTypoHunter />}
        {activeTab === 'gallery' && <MemeGallery />}
        {activeTab === 'video' && <VideoCompiler />}
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-2 text-xs border-t border-gray-800">
        <p>
          🎭 Contest Entry | Built with React, TypeScript & too much caffeine |{' '}
          <span className="text-deadpool-red">Deadpool approves... maybe</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
