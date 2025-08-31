// Professional Game Type Definitions

export interface Player {
  id: string;
  username: string;
  coins: number;
  level: number;
  experience: number;
  statistics: PlayerStatistics;
  preferences: PlayerPreferences;
  responsibleGaming: ResponsibleGamingSettings;
}

export interface PlayerStatistics {
  totalSpins: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  sessionTime: number;
  favoriteGame: string;
  winRate: number;
  averageBet: number;
  lifetimeWagered: number;
  lifetimeWon: number;
}

export interface PlayerPreferences {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'dark' | 'light' | 'neon';
  language: string;
  autoPlay: boolean;
  quickSpin: boolean;
  showTutorials: boolean;
}

export interface ResponsibleGamingSettings {
  dailyLimit: number;
  sessionLimit: number;
  lossLimit: number;
  selfExclusionUntil?: Date;
  realityCheckInterval: number; // minutes
  coolingOffPeriod?: Date;
  isActive: boolean;
}

export interface GameBase {
  id: string;
  name: string;
  type: GameType;
  category: GameCategory;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  minBet: number;
  maxBet: number;
  isActive: boolean;
  theme: string;
  features: string[];
}

export type GameType = 'slots' | 'blackjack' | 'roulette' | 'poker' | 'baccarat';
export type GameCategory = 'slots' | 'table' | 'live' | 'specialty';

export interface SlotGame extends GameBase {
  type: 'slots';
  reels: number;
  rows: number;
  paylines: number;
  symbols: SlotSymbol[];
  paytable: PaytableEntry[];
  bonusFeatures: BonusFeature[];
  jackpots: Jackpot[];
}

export interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  frequency: number;
  isWild: boolean;
  isScatter: boolean;
  multiplier?: number;
  icon: string;
}

export interface PaytableEntry {
  symbolId: string;
  count: number;
  payout: number;
}

export interface BonusFeature {
  id: string;
  name: string;
  triggerSymbols: string[];
  triggerCount: number;
  type: 'free_spins' | 'pick_bonus' | 'wheel' | 'progressive';
  multiplier?: number;
  freeSpins?: number;
}

export interface Jackpot {
  id: string;
  name: string;
  type: 'fixed' | 'progressive';
  currentAmount: number;
  baseAmount: number;
  contributionRate: number;
  winCondition: string;
}

export interface GameSession {
  id: string;
  playerId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  initialCoins: number;
  currentCoins: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  rounds: GameRound[];
  isActive: boolean;
}

export interface GameRound {
  id: string;
  timestamp: Date;
  betAmount: number;
  winAmount: number;
  gameState: any;
  result: GameResult;
  features?: BonusFeature[];
}

export interface GameResult {
  isWin: boolean;
  winAmount: number;
  winType: 'none' | 'small' | 'medium' | 'big' | 'jackpot' | 'bonus';
  winLines?: WinLine[];
  symbols?: any[];
  multiplier?: number;
}

export interface WinLine {
  line: number;
  symbols: string[];
  payout: number;
  positions: number[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  reward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  category: 'wins' | 'spins' | 'games' | 'special';
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'all_time';
  metric: 'biggest_win' | 'total_wins' | 'win_rate' | 'level';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  value: number;
  change: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  rules: TournamentRule[];
  prizes: TournamentPrize[];
}

export interface TournamentRule {
  id: string;
  description: string;
  type: 'gameplay' | 'eligibility' | 'scoring';
}

export interface TournamentPrize {
  rank: number;
  amount: number;
  type: 'coins' | 'item' | 'badge';
}

export interface GameError {
  code: string;
  message: string;
  type: 'network' | 'game_logic' | 'insufficient_funds' | 'session_expired';
  recoverable: boolean;
  timestamp: Date;
}

export interface GameConfig {
  maxBetPercentage: number;
  minSessionDuration: number;
  maxSessionDuration: number;
  realityCheckIntervals: number[];
  defaultRTP: number;
  maintenanceMode: boolean;
  featuredGames: string[];
  newPlayerBonus: number;
  dailyBonusAmount: number;
}
