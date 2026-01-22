import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAchievementStore } from '../stores/achievementStore';
import { soundManager } from '../utils/soundManager';

const ChimichangaClicker: React.FC = () => {
  const {
    chimichangaCount,
    clickPower,
    highScore,
    totalClicks,
    incrementChimichangas,
    upgradeClickPower,
  } = useGameStore();

  const { setMood } = useConversationStore();
  const { unlockAchievement } = useAchievementStore();
  const [clickAnimation, setClickAnimation] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<
    { id: number; value: number; x: number; y: number }[]
  >([]);

  const upgradeCost = clickPower * 10;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    incrementChimichangas();
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFloat = {
      id: Date.now(),
      value: clickPower,
      x,
      y,
    };

    setFloatingNumbers((prev) => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((f) => f.id !== newFloat.id));
    }, 1000);

    // Update mood based on click count
    if (totalClicks % 10 === 0) {
      setMood('excited');
    }
  };

  const handleUpgrade = () => {
    if (chimichangaCount >= upgradeCost) {
      upgradeClickPower();
      setMood('excited');
      
      // Unlock achievement for first upgrade
      if (clickPower === 1) {
        unlockAchievement('upgrade-power');
        soundManager.playAchievement();
      }
    }
  };

  // Check milestones
  useEffect(() => {
    if (chimichangaCount === 50) {
      setMood('excited');
      unlockAchievement('chimichanga-milestone-50');
      soundManager.playAchievement();
    } else if (chimichangaCount === 100) {
      setMood('chaotic');
      unlockAchievement('chimichanga-milestone-100');
      soundManager.playAchievement();
    } else if (chimichangaCount === 666) {
      setMood('chaotic');
      unlockAchievement('chimichanga-milestone-666');
      soundManager.playDeadpoolLaugh();
    }
  }, [chimichangaCount, setMood, unlockAchievement]);

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-8">
      {/* Stats Panel */}
      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
        <div className="bg-black/50 rounded-lg p-4 text-center backdrop-blur">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">High Score</p>
          <p className="text-2xl font-bold text-white">{highScore}</p>
        </div>
        <div className="bg-black/50 rounded-lg p-4 text-center backdrop-blur">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Total Clicks</p>
          <p className="text-2xl font-bold text-white">{totalClicks}</p>
        </div>
        <div className="bg-black/50 rounded-lg p-4 text-center backdrop-blur">
          <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Click Power</p>
          <p className="text-2xl font-bold text-white">{clickPower}</p>
        </div>
      </div>

      {/* Main Clicker */}
      <div className="relative mb-8">
        <motion.button
          onClick={handleClick}
          animate={{
            scale: clickAnimation ? 0.9 : 1,
            rotate: clickAnimation ? [0, -5, 5, 0] : 0,
          }}
          whileHover={{ scale: 1.05 }}
          className="relative w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl deadpool-glow cursor-pointer border-8 border-yellow-600 overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl">🌯</span>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white font-bold text-xl comic-text drop-shadow-lg">
              CLICK ME!
            </p>
          </div>
        </motion.button>

        {/* Floating Numbers */}
        {floatingNumbers.map((float) => (
          <motion.div
            key={float.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            transition={{ duration: 1 }}
            className="absolute text-3xl font-bold text-yellow-300 pointer-events-none"
            style={{ left: float.x, top: float.y }}
          >
            +{float.value}
          </motion.div>
        ))}
      </div>

      {/* Current Count */}
      <div className="bg-black/70 rounded-lg p-6 mb-6 backdrop-blur">
        <p className="text-gray-400 text-sm text-center mb-2">Current Chimichangas</p>
        <p className="text-6xl font-bold text-center text-yellow-400 comic-text">
          {chimichangaCount}
        </p>
      </div>

      {/* Upgrade Button */}
      <div className="bg-black/50 rounded-lg p-6 backdrop-blur max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4 text-center comic-text">
          Upgrade Your Power!
        </h3>
        <button
          onClick={handleUpgrade}
          disabled={chimichangaCount < upgradeCost}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
            chimichangaCount >= upgradeCost
              ? 'bg-deadpool-red hover:bg-red-700 text-white deadpool-glow cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {chimichangaCount >= upgradeCost ? (
            <span>
              🚀 Upgrade Click Power to {clickPower + 1} (Cost: {upgradeCost})
            </span>
          ) : (
            <span>
              🔒 Need {upgradeCost - chimichangaCount} more chimichangas
            </span>
          )}
        </button>
      </div>

      {/* Fun Messages */}
      <div className="mt-6 text-center text-gray-400 text-sm max-w-lg">
        {chimichangaCount === 0 && <p>🤔 Come on, click the chimichanga! I'm hungry here!</p>}
        {chimichangaCount >= 10 && chimichangaCount < 50 && (
          <p>😏 Not bad... for a beginner.</p>
        )}
        {chimichangaCount >= 50 && chimichangaCount < 100 && (
          <p>🎉 You're getting the hang of this! Keep going!</p>
        )}
        {chimichangaCount >= 100 && chimichangaCount < 666 && (
          <p>🔥 HOLY CHIMICHANGA! You're on fire!</p>
        )}
        {chimichangaCount >= 666 && (
          <p className="text-deadpool-red font-bold">
            😈 666?! That's my kind of number! MAXIMUM EFFORT!
          </p>
        )}
      </div>
    </div>
  );
};

export default ChimichangaClicker;
