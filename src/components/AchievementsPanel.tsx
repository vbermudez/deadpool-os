import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, X } from 'lucide-react';
import { useAchievementStore } from '../stores/achievementStore';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ isOpen, onClose }) => {
  const { achievements, getUnlockedCount, getTotalCount } = useAchievementStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const visibleAchievements = filteredAchievements.filter((a) => {
    // Hide secret achievements unless unlocked
    return !a.secret || a.unlocked;
  });

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-deadpool-red to-red-700 p-6 shadow-lg z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-3xl font-bold text-white comic-text">Achievements</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white mb-2">
                  <span>Progress</span>
                  <span className="font-bold">
                    {unlockedCount} / {totalCount} ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                {(['all', 'unlocked', 'locked'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                      filter === f
                        ? 'bg-white text-deadpool-red'
                        : 'bg-black/30 text-white hover:bg-black/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements List */}
            <div className="p-6 space-y-4">
              {visibleAchievements.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No achievements found in this filter</p>
                </div>
              ) : (
                visibleAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                        : 'bg-gray-800 border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`text-5xl flex-shrink-0 ${
                          achievement.unlocked ? '' : 'grayscale opacity-40'
                        }`}
                      >
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{achievement.name}</h3>
                          {achievement.secret && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                              SECRET
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-gray-500">
                            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Status Icon */}
                      {achievement.unlocked ? (
                        <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-600 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Secret hint */}
              <div className="mt-8 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg text-center">
                <p className="text-purple-300 text-sm">
                  💡 Some achievements are hidden until you unlock them!
                  <br />
                  Explore, experiment, and break the fourth wall to find them all!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementsPanel;
