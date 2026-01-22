import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  chimichangaCount: number;
  clickPower: number;
  highScore: number;
  totalClicks: number;
  achievements: string[];
  incrementChimichangas: (amount?: number) => void;
  decrementChimichangas: (amount: number) => void;
  upgradeClickPower: () => void;
  addAchievement: (achievement: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      chimichangaCount: 0,
      clickPower: 1,
      highScore: 0,
      totalClicks: 0,
      achievements: [],

      incrementChimichangas: (amount) =>
        set((state) => {
          const increment = amount || state.clickPower;
          const newCount = state.chimichangaCount + increment;
          const newHighScore = Math.max(newCount, state.highScore);
          return {
            chimichangaCount: newCount,
            highScore: newHighScore,
            totalClicks: state.totalClicks + 1,
          };
        }),

      decrementChimichangas: (amount) =>
        set((state) => ({
          chimichangaCount: Math.max(0, state.chimichangaCount - amount),
        })),

      upgradeClickPower: () =>
        set((state) => {
          const cost = state.clickPower * 10;
          if (state.chimichangaCount >= cost) {
            return {
              clickPower: state.clickPower + 1,
              chimichangaCount: state.chimichangaCount - cost,
            };
          }
          return state;
        }),

      addAchievement: (achievement) =>
        set((state) => {
          if (!state.achievements.includes(achievement)) {
            return {
              achievements: [...state.achievements, achievement],
            };
          }
          return state;
        }),

      reset: () =>
        set({
          chimichangaCount: 0,
          clickPower: 1,
          totalClicks: 0,
        }),
    }),
    {
      name: 'deadpool-game-storage',
    }
  )
);
