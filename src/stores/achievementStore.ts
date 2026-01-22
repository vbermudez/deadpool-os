import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  secret?: boolean; // Hidden until unlocked
}

interface AchievementState {
  achievements: Achievement[];
  initializeAchievements: () => void;
  unlockAchievement: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
}

const allAchievements: Achievement[] = [
  {
    id: 'first-chat',
    name: 'Breaking the Ice',
    description: 'Send your first message to Deadpool',
    icon: '💬',
    unlocked: false,
  },
  {
    id: 'made-deadpool-laugh',
    name: 'Made Deadpool Laugh',
    description: 'Tell Deadpool a joke that includes "chimichanga"',
    icon: '😂',
    unlocked: false,
  },
  {
    id: 'chimichanga-milestone-50',
    name: 'Chimichanga Collector',
    description: 'Collect 50 chimichangas',
    icon: '🌯',
    unlocked: false,
  },
  {
    id: 'chimichanga-milestone-100',
    name: 'Chimichanga Hoarder',
    description: 'Collect 100 chimichangas',
    icon: '🌮',
    unlocked: false,
  },
  {
    id: 'chimichanga-milestone-666',
    name: 'The Beast',
    description: 'Reach exactly 666 chimichangas',
    icon: '😈',
    unlocked: false,
    secret: true,
  },
  {
    id: 'first-image',
    name: 'Meme Lord',
    description: 'Generate your first AI image',
    icon: '🖼️',
    unlocked: false,
  },
  {
    id: 'heard-voice',
    name: 'Heard the Voice',
    description: 'Listen to Deadpool speak',
    icon: '🔊',
    unlocked: false,
  },
  {
    id: 'click-master',
    name: 'Click Master',
    description: 'Click 100 times in the Chimichanga Clicker',
    icon: '🖱️',
    unlocked: false,
  },
  {
    id: 'upgrade-power',
    name: 'Power Up!',
    description: 'Upgrade your click power for the first time',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'survived-mini-game',
    name: 'Survivor',
    description: 'Complete any mini-game',
    icon: '🎮',
    unlocked: false,
  },
  {
    id: 'avatar-clicked',
    name: 'Touch the Face',
    description: "Click on Deadpool's avatar",
    icon: '👆',
    unlocked: false,
    secret: true,
  },
  {
    id: 'mood-explorer',
    name: 'Mood Explorer',
    description: 'Experience all 5 of Deadpool\'s moods',
    icon: '🎭',
    unlocked: false,
  },
  {
    id: 'fourth-wall-shattered',
    name: 'Fourth Wall Shattered',
    description: 'Find all the meta references',
    icon: '🎬',
    unlocked: false,
    secret: true,
  },
  {
    id: 'ignored-deadpool',
    name: 'The Silent Treatment',
    description: "Don't interact with Deadpool for 5 minutes",
    icon: '🤐',
    unlocked: false,
  },
  {
    id: 'random-event-survived',
    name: 'Chaos Survivor',
    description: 'Experience 10 random events',
    icon: '🎲',
    unlocked: false,
  },
  {
    id: 'easter-egg-found',
    name: 'Egg Hunter',
    description: 'Find the hidden easter egg',
    icon: '🥚',
    unlocked: false,
    secret: true,
  },
  {
    id: 'konami-code',
    name: 'Old School Gamer',
    description: 'Enter the Konami Code',
    icon: '🕹️',
    unlocked: false,
    secret: true,
  },
  {
    id: 'all-tabs-visited',
    name: 'Tab Explorer',
    description: 'Visit all three tabs',
    icon: '🗂️',
    unlocked: false,
  },
];

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],

      initializeAchievements: () => {
        const currentAchievements = get().achievements;
        if (currentAchievements.length === 0) {
          set({ achievements: [...allAchievements] });
        } else {
          // Merge with new achievements if any were added
          const existingIds = new Set(currentAchievements.map((a) => a.id));
          const newAchievements = allAchievements.filter((a) => !existingIds.has(a.id));
          if (newAchievements.length > 0) {
            set({ achievements: [...currentAchievements, ...newAchievements] });
          }
        }
      },

      unlockAchievement: (id: string) => {
        const achievements = get().achievements;
        const achievement = achievements.find((a) => a.id === id);

        if (!achievement || achievement.unlocked) {
          return false; // Already unlocked or doesn't exist
        }

        set({
          achievements: achievements.map((a) =>
            a.id === id
              ? { ...a, unlocked: true, unlockedAt: new Date() }
              : a
          ),
        });

        return true; // Successfully unlocked
      },

      isUnlocked: (id: string) => {
        return get().achievements.find((a) => a.id === id)?.unlocked || false;
      },

      getUnlockedCount: () => {
        return get().achievements.filter((a) => a.unlocked).length;
      },

      getTotalCount: () => {
        return get().achievements.length;
      },
    }),
    {
      name: 'deadpool-achievements',
    }
  )
);
