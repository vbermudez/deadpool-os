import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useAchievementStore } from '../stores/achievementStore';

interface FallingObject {
  id: number;
  x: number;
  y: number;
  type: 'chimichanga' | 'bomb' | 'heart';
  speed: number;
}

const ReflexesTest: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('reflexes-high-score') || '0');
  });

  const { incrementChimichangas } = useGameStore();
  const { unlockAchievement } = useAchievementStore();

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setObjects([]);
    setGameTime(0);
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('reflexes-high-score', score.toString());
    }
    
    const reward = Math.floor(score / 10);
    if (reward > 0) {
      incrementChimichangas(reward);
    }

    unlockAchievement('survived-mini-game');
  }, [score, highScore, incrementChimichangas, unlockAchievement]);

  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(() => {
      const newObject: FallingObject = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10, // 10% to 90% of width
        y: 0,
        type: Math.random() < 0.7 ? 'chimichanga' : Math.random() < 0.8 ? 'bomb' : 'heart',
        speed: Math.random() * 2 + 2 + gameTime * 0.1, // Speed increases over time
      };

      setObjects((prev) => [...prev, newObject]);
    }, Math.max(500 - gameTime * 10, 200)); // Spawn faster over time

    return () => clearInterval(spawnInterval);
  }, [isPlaying, gameTime]);

  useEffect(() => {
    if (!isPlaying) return;

    const moveInterval = setInterval(() => {
      setObjects((prev) => {
        const updated = prev.map((obj) => ({
          ...obj,
          y: obj.y + obj.speed,
        }));

        const onScreen = updated.filter((obj) => {
          if (obj.y > 100) {
            if (obj.type === 'chimichanga') {
              // Missed a chimichanga - lose a life
              setLives((l) => Math.max(0, l - 1));
            }
            return false;
          }
          return true;
        });

        return onScreen;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  // Game timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setGameTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (lives <= 0 && isPlaying) {
      endGame();
    }
  }, [lives, isPlaying, endGame]);

  const handleObjectClick = (obj: FallingObject) => {
    if (!isPlaying) return;

    setObjects((prev) => prev.filter((o) => o.id !== obj.id));

    switch (obj.type) {
      case 'chimichanga':
        setScore((s) => s + 10);
        break;
      case 'bomb':
        setLives((l) => Math.max(0, l - 1));
        setScore((s) => Math.max(0, s - 20));
        break;
      case 'heart':
        setLives((l) => Math.min(5, l + 1));
        break;
    }
  };

  const getObjectEmoji = (type: FallingObject['type']) => {
    switch (type) {
      case 'chimichanga':
        return '🌯';
      case 'bomb':
        return '💣';
      case 'heart':
        return '❤️';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      {!isPlaying ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white comic-text mb-4">
            ⚡ Reflexes Test ⚡
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Catch the falling chimichangas! Avoid the bombs! Grab hearts for extra lives!
            <br />
            <span className="text-yellow-400 font-bold">
              Miss a chimichanga = lose a life!
            </span>
          </p>

          <div className="bg-black/50 rounded-lg p-6 mb-6 backdrop-blur">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-gray-400 text-sm">High Score</p>
                <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Last Score</p>
                <p className="text-3xl font-bold text-white">{score}</p>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-deadpool-red text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-red-700 transition-colors deadpool-glow comic-text"
          >
            START GAME
          </button>

          <p className="text-gray-500 text-sm mt-6">
            💡 Tip: Click fast! The game gets harder over time
          </p>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <div className="absolute top-4 left-0 right-0 flex justify-around z-10">
            <div className="bg-black/70 rounded-lg px-6 py-3 backdrop-blur">
              <p className="text-gray-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-yellow-400">{score}</p>
            </div>
            <div className="bg-black/70 rounded-lg px-6 py-3 backdrop-blur">
              <p className="text-gray-400 text-sm">Lives</p>
              <p className="text-3xl font-bold text-red-400 flex gap-1">
                {Array.from({ length: lives }).map((_, i) => (
                  <Heart key={i} className="w-6 h-6 fill-red-500" />
                ))}
              </p>
            </div>
            <div className="bg-black/70 rounded-lg px-6 py-3 backdrop-blur">
              <p className="text-gray-400 text-sm">Time</p>
              <p className="text-3xl font-bold text-blue-400">{gameTime}s</p>
            </div>
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence>
              {objects.map((obj) => (
                <motion.button
                  key={obj.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, rotate: 360 }}
                  className={`absolute text-5xl cursor-pointer hover:scale-125 transition-transform ${
                    obj.type === 'bomb' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                  }}
                  onClick={() => handleObjectClick(obj)}
                >
                  {getObjectEmoji(obj.type)}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="bg-deadpool-red/90 rounded-lg px-6 py-3 inline-block backdrop-blur comic-text text-white">
              {score === 0 && "Come on, catch something! My grandma has better reflexes!"}
              {score > 0 && score < 50 && "Not bad... for a beginner."}
              {score >= 50 && score < 100 && "Okay okay, you're getting the hang of it!"}
              {score >= 100 && score < 200 && "WHOA! Look at you go! 🔥"}
              {score >= 200 && "MAXIMUM EFFORT! You're on FIRE! 😱"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflexesTest;
