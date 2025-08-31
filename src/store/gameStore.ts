// Professional Game State Management with Zustand

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Player, GameSession, Achievement, ResponsibleGamingSettings } from '@/types/game';

interface GameStore {
  // Player State
  player: Player | null;
  currentSession: GameSession | null;
  achievements: Achievement[];
  
  // Game State
  isPlaying: boolean;
  currentGame: string | null;
  gameHistory: GameSession[];
  
  // UI State
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'light' | 'neon';
  showTutorials: boolean;
  
  // Responsible Gaming
  responsibleGaming: ResponsibleGamingSettings;
  sessionStartTime: Date | null;
  dailySpent: number;
  
  // Actions
  initializePlayer: (username: string) => void;
  updateCoins: (amount: number) => void;
  startGameSession: (gameId: string) => void;
  endGameSession: () => void;
  recordGameRound: (betAmount: number, winAmount: number, gameState: any) => void;
  unlockAchievement: (achievementId: string) => void;
  updatePreferences: (preferences: Partial<Player['preferences']>) => void;
  updateResponsibleGaming: (settings: Partial<ResponsibleGamingSettings>) => void;
  checkLimits: () => boolean;
  resetDailyLimits: () => void;
  
  // Statistics
  getTotalWagered: () => number;
  getTotalWon: () => number;
  getWinRate: () => number;
  getSessionTime: () => number;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        player: null,
        currentSession: null,
        achievements: [],
        isPlaying: false,
        currentGame: null,
        gameHistory: [],
        soundEnabled: true,
        animationsEnabled: true,
        theme: 'neon',
        showTutorials: true,
        responsibleGaming: {
          dailyLimit: 500,
          sessionLimit: 200,
          lossLimit: 100,
          realityCheckInterval: 30,
          isActive: true,
        },
        sessionStartTime: null,
        dailySpent: 0,

        // Actions
        initializePlayer: (username: string) => {
          const newPlayer: Player = {
            id: `player_${Date.now()}`,
            username,
            coins: 1000,
            level: 1,
            experience: 0,
            statistics: {
              totalSpins: 0,
              totalWins: 0,
              totalLosses: 0,
              biggestWin: 0,
              sessionTime: 0,
              favoriteGame: '',
              winRate: 0,
              averageBet: 0,
              lifetimeWagered: 0,
              lifetimeWon: 0,
            },
            preferences: {
              soundEnabled: true,
              animationsEnabled: true,
              theme: 'neon',
              language: 'en',
              autoPlay: false,
              quickSpin: false,
              showTutorials: true,
            },
            responsibleGaming: {
              dailyLimit: 500,
              sessionLimit: 200,
              lossLimit: 100,
              realityCheckInterval: 30,
              isActive: true,
            },
          };

          set({ player: newPlayer });
        },

        updateCoins: (amount: number) => {
          set((state) => {
            if (!state.player) return state;
            
            const newCoins = Math.max(0, state.player.coins + amount);
            const newPlayer = {
              ...state.player,
              coins: newCoins,
              statistics: {
                ...state.player.statistics,
                lifetimeWagered: amount < 0 ? state.player.statistics.lifetimeWagered + Math.abs(amount) : state.player.statistics.lifetimeWagered,
                lifetimeWon: amount > 0 ? state.player.statistics.lifetimeWon + amount : state.player.statistics.lifetimeWon,
              },
            };

            return { player: newPlayer };
          });
        },

        startGameSession: (gameId: string) => {
          const now = new Date();
          const sessionId = `session_${Date.now()}`;
          
          set((state) => {
            if (!state.player) return state;

            const newSession: GameSession = {
              id: sessionId,
              playerId: state.player.id,
              gameId,
              startTime: now,
              initialCoins: state.player.coins,
              currentCoins: state.player.coins,
              totalSpins: 0,
              totalWins: 0,
              biggestWin: 0,
              rounds: [],
              isActive: true,
            };

            return {
              currentSession: newSession,
              isPlaying: true,
              currentGame: gameId,
              sessionStartTime: now,
            };
          });
        },

        endGameSession: () => {
          set((state) => {
            if (!state.currentSession || !state.player) return state;

            const endedSession = {
              ...state.currentSession,
              endTime: new Date(),
              isActive: false,
              currentCoins: state.player.coins,
            };

            return {
              currentSession: null,
              isPlaying: false,
              currentGame: null,
              sessionStartTime: null,
              gameHistory: [...state.gameHistory, endedSession],
            };
          });
        },

        recordGameRound: (betAmount: number, winAmount: number, gameState: any) => {
          set((state) => {
            if (!state.currentSession || !state.player) return state;

            const roundId = `round_${Date.now()}`;
            const isWin = winAmount > 0;
            
            const newRound = {
              id: roundId,
              timestamp: new Date(),
              betAmount,
              winAmount,
              gameState,
              result: {
                isWin,
                winAmount,
                winType: winAmount === 0 ? 'none' as const : 
                         winAmount < betAmount * 2 ? 'small' as const :
                         winAmount < betAmount * 10 ? 'medium' as const :
                         winAmount < betAmount * 50 ? 'big' as const : 'jackpot' as const,
              },
            };

            const updatedSession = {
              ...state.currentSession,
              rounds: [...state.currentSession.rounds, newRound],
              totalSpins: state.currentSession.totalSpins + 1,
              totalWins: isWin ? state.currentSession.totalWins + 1 : state.currentSession.totalWins,
              biggestWin: Math.max(state.currentSession.biggestWin, winAmount),
            };

            const updatedPlayer = {
              ...state.player,
              statistics: {
                ...state.player.statistics,
                totalSpins: state.player.statistics.totalSpins + 1,
                totalWins: isWin ? state.player.statistics.totalWins + 1 : state.player.statistics.totalWins,
                totalLosses: !isWin ? state.player.statistics.totalLosses + 1 : state.player.statistics.totalLosses,
                biggestWin: Math.max(state.player.statistics.biggestWin, winAmount),
                winRate: (state.player.statistics.totalWins + (isWin ? 1 : 0)) / (state.player.statistics.totalSpins + 1),
                averageBet: ((state.player.statistics.averageBet * state.player.statistics.totalSpins) + betAmount) / (state.player.statistics.totalSpins + 1),
              },
            };

            return {
              currentSession: updatedSession,
              player: updatedPlayer,
              dailySpent: state.dailySpent + betAmount,
            };
          });
        },

        unlockAchievement: (achievementId: string) => {
          set((state) => {
            const achievement = state.achievements.find(a => a.id === achievementId);
            if (!achievement || achievement.isUnlocked) return state;

            const updatedAchievements = state.achievements.map(a =>
              a.id === achievementId ? { ...a, isUnlocked: true, unlockedAt: new Date() } : a
            );

            return { achievements: updatedAchievements };
          });
        },

        updatePreferences: (preferences) => {
          set((state) => {
            if (!state.player) return state;

            return {
              player: {
                ...state.player,
                preferences: { ...state.player.preferences, ...preferences },
              },
              soundEnabled: preferences.soundEnabled ?? state.soundEnabled,
              animationsEnabled: preferences.animationsEnabled ?? state.animationsEnabled,
              theme: preferences.theme ?? state.theme,
              showTutorials: preferences.showTutorials ?? state.showTutorials,
            };
          });
        },

        updateResponsibleGaming: (settings) => {
          set((state) => ({
            responsibleGaming: { ...state.responsibleGaming, ...settings },
          }));
        },

        checkLimits: () => {
          const state = get();
          if (!state.responsibleGaming.isActive) return true;

          const { dailyLimit, sessionLimit, lossLimit } = state.responsibleGaming;
          
          // Check daily limit
          if (state.dailySpent >= dailyLimit) return false;
          
          // Check session limit
          if (state.currentSession) {
            const sessionSpent = state.currentSession.initialCoins - (state.player?.coins || 0);
            if (sessionSpent >= sessionLimit) return false;
          }
          
          // Check loss limit
          const sessionLoss = state.currentSession ? 
            state.currentSession.initialCoins - (state.player?.coins || 0) : 0;
          if (sessionLoss >= lossLimit) return false;

          return true;
        },

        resetDailyLimits: () => {
          set({ dailySpent: 0 });
        },

        getTotalWagered: () => {
          const state = get();
          return state.player?.statistics.lifetimeWagered || 0;
        },

        getTotalWon: () => {
          const state = get();
          return state.player?.statistics.lifetimeWon || 0;
        },

        getWinRate: () => {
          const state = get();
          return state.player?.statistics.winRate || 0;
        },

        getSessionTime: () => {
          const state = get();
          if (!state.sessionStartTime) return 0;
          return Date.now() - state.sessionStartTime.getTime();
        },
      }),
      {
        name: 'koin-clink-game-store',
        partialize: (state) => ({
          player: state.player,
          gameHistory: state.gameHistory,
          achievements: state.achievements,
          responsibleGaming: state.responsibleGaming,
          soundEnabled: state.soundEnabled,
          animationsEnabled: state.animationsEnabled,
          theme: state.theme,
          showTutorials: state.showTutorials,
          dailySpent: state.dailySpent,
        }),
      }
    )
  )
);

// Selectors for common data access
export const selectPlayer = (state: GameStore) => state.player;
export const selectCurrentSession = (state: GameStore) => state.currentSession;
export const selectIsPlaying = (state: GameStore) => state.isPlaying;
export const selectCoins = (state: GameStore) => state.player?.coins || 0;
export const selectResponsibleGaming = (state: GameStore) => state.responsibleGaming;
