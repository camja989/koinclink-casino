// Enhanced Slot Game Engine with Professional Features

import SecureRNG, { GAME_CONFIGS } from './random';
import { SlotGame, SlotSymbol, GameResult, BonusFeature } from '@/types/game';
import GameValidator from '@/utils/security/gameValidation';

export interface SlotConfiguration {
  id: string;
  name: string;
  reels: number;
  rows: number;
  paylines: PaylineConfig[];
  symbols: SlotSymbol[];
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  minBet: number;
  maxBet: number;
  bonusFeatures: BonusFeature[];
  theme: string;
}

export interface PaylineConfig {
  id: number;
  pattern: number[][];
  description: string;
}

export class SlotEngine {
  private rng: typeof SecureRNG;
  private validator: typeof GameValidator;
  private config: SlotConfiguration;
  
  constructor(config: SlotConfiguration) {
    this.rng = SecureRNG;
    this.validator = GameValidator;
    this.config = config;
  }

  // Generate slot spin result
  spin(betAmount: number): SlotSpinResult {
    // Create weighted symbol arrays for realistic frequency
    const reelArrays = this.createWeightedReels();
    
    // Generate random positions for each reel
    const reelPositions = Array(this.config.reels).fill(0).map(() => 
      this.rng.randomInt(0, reelArrays[0].length - 1)
    );

    // Extract visible symbols based on positions
    const visibleSymbols = reelPositions.map((position, reelIndex) => {
      const reel = reelArrays[reelIndex];
      return Array(this.config.rows).fill(0).map((_, rowIndex) => 
        reel[(position + rowIndex) % reel.length]
      );
    });

    // Calculate wins
    const winResult = this.calculateWins(visibleSymbols, betAmount);
    
    // Check for bonus features
    const bonusTriggered = this.checkBonusFeatures(visibleSymbols);

    return {
      reelPositions,
      visibleSymbols,
      winResult,
      bonusTriggered,
      totalWin: winResult.winAmount,
      nextState: bonusTriggered ? 'bonus' : 'idle'
    };
  }

  // Create weighted symbol arrays for each reel
  private createWeightedReels(): SlotSymbol[][] {
    return Array(this.config.reels).fill(null).map(() => {
      const reel: SlotSymbol[] = [];
      
      this.config.symbols.forEach(symbol => {
        // Add symbol to reel based on frequency
        for (let i = 0; i < symbol.frequency; i++) {
          reel.push(symbol);
        }
      });
      
      // Shuffle the reel
      return this.shuffleArray(reel);
    });
  }

  // Calculate wins from visible symbols
  private calculateWins(visibleSymbols: SlotSymbol[][], betAmount: number): GameResult {
  const winLines: import('@/types/game').WinLine[] = [];
    let totalWin = 0;

    // Check each payline
    this.config.paylines.forEach(payline => {
      const lineResult = this.checkPayline(visibleSymbols, payline, betAmount);
      if (lineResult.win > 0) {
        // Map WinLineResult to WinLine
        winLines.push({
          line: lineResult.paylineId,
          symbols: [lineResult.winSymbol],
          payout: lineResult.basePayout,
          positions: Array.isArray(lineResult.positions) ? lineResult.positions.flat() : [],
        });
        totalWin += lineResult.win;
      }
    });

    // Check for scatter wins
    const scatterWin = this.checkScatterWins(visibleSymbols, betAmount);
    totalWin += scatterWin;

    const winType = this.categorizeWin(totalWin, betAmount);

    return {
      isWin: totalWin > 0,
      winAmount: totalWin,
      winType,
      winLines,
      symbols: visibleSymbols.map(reel => reel.map(symbol => symbol.id)),
    };
  }

  // Check individual payline for wins
  private checkPayline(visibleSymbols: SlotSymbol[][], payline: PaylineConfig, betAmount: number): WinLineResult {
    const lineSymbols: SlotSymbol[] = [];
    
    // Extract symbols from payline pattern
    payline.pattern.forEach(([reelIndex, rowIndex]) => {
      if (reelIndex < visibleSymbols.length && rowIndex < visibleSymbols[reelIndex].length) {
        lineSymbols.push(visibleSymbols[reelIndex][rowIndex]);
      }
    });

    // Check for winning combinations
    let consecutiveCount = 1;
    let winSymbol = lineSymbols[0];
    let isWild = false;

    // Handle wild symbols
    for (let i = 1; i < lineSymbols.length; i++) {
      const currentSymbol = lineSymbols[i];
      
      if (currentSymbol.isWild || winSymbol.isWild || currentSymbol.id === winSymbol.id) {
        consecutiveCount++;
        if (currentSymbol.isWild) isWild = true;
      } else {
        break;
      }
    }

    // Calculate payout based on symbol value and count
    let basePayout = 0;
    if (consecutiveCount >= 3) {
      basePayout = winSymbol.value * this.getPayoutMultiplier(consecutiveCount);
      
      // Apply wild multiplier if present
      if (isWild && winSymbol.multiplier) {
        basePayout *= winSymbol.multiplier;
      }
    }

    const totalWin = basePayout * betAmount;

    return {
      paylineId: payline.id,
      symbolCount: consecutiveCount,
      winSymbol: winSymbol.id,
      basePayout,
      win: totalWin,
      isWild,
      positions: payline.pattern.slice(0, consecutiveCount)
    };
  }

  // Check for scatter symbol wins
  private checkScatterWins(visibleSymbols: SlotSymbol[][], betAmount: number): number {
    const scatterCounts = new Map<string, number>();
    
    // Count scatter symbols
    visibleSymbols.flat().forEach(symbol => {
      if (symbol.isScatter) {
        scatterCounts.set(symbol.id, (scatterCounts.get(symbol.id) || 0) + 1);
      }
    });

    let totalScatterWin = 0;
    
    scatterCounts.forEach((count, symbolId) => {
      if (count >= 3) {
        const symbol = this.config.symbols.find(s => s.id === symbolId);
        if (symbol) {
          const scatterPayout = symbol.value * this.getScatterMultiplier(count);
          totalScatterWin += scatterPayout * betAmount;
        }
      }
    });

    return totalScatterWin;
  }

  // Check for bonus feature triggers
  private checkBonusFeatures(visibleSymbols: SlotSymbol[][]): BonusFeature | null {
    for (const bonus of this.config.bonusFeatures) {
      const triggerCount = this.countTriggerSymbols(visibleSymbols, bonus.triggerSymbols);
      
      if (triggerCount >= bonus.triggerCount) {
        return bonus;
      }
    }
    
    return null;
  }

  // Count bonus trigger symbols
  private countTriggerSymbols(visibleSymbols: SlotSymbol[][], triggerSymbols: string[]): number {
    return visibleSymbols.flat().filter(symbol => 
      triggerSymbols.includes(symbol.id)
    ).length;
  }

  // Get payout multiplier based on symbol count
  private getPayoutMultiplier(count: number): number {
    const multipliers = {
      3: 1,
      4: 5,
      5: 25
    };
    return multipliers[count as keyof typeof multipliers] || 0;
  }

  // Get scatter multiplier
  private getScatterMultiplier(count: number): number {
    const multipliers = {
      3: 2,
      4: 10,
      5: 50
    };
    return multipliers[count as keyof typeof multipliers] || 0;
  }

  // Categorize win size
  private categorizeWin(winAmount: number, betAmount: number): 'none' | 'small' | 'medium' | 'big' | 'jackpot' {
    if (winAmount === 0) return 'none';
    
    const multiplier = winAmount / betAmount;
    if (multiplier < 5) return 'small';
    if (multiplier < 20) return 'medium';
    if (multiplier < 100) return 'big';
    return 'jackpot';
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.rng.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get game configuration
  getConfig(): SlotConfiguration {
    return this.config;
  }

  // Validate spin parameters
  validateSpin(betAmount: number, playerCoins: number): boolean {
    return this.validator.validateBet(
      betAmount,
      playerCoins,
      this.config.minBet,
      this.config.maxBet
    );
  }
}

// Enhanced slot configurations
export const CLASSIC_SLOT_CONFIG: SlotConfiguration = {
  id: 'classic_777',
  name: 'Classic 777',
  reels: 3,
  rows: 3,
  paylines: [
    { id: 1, pattern: [[0,1], [1,1], [2,1]], description: 'Center Line' },
    { id: 2, pattern: [[0,0], [1,0], [2,0]], description: 'Top Line' },
    { id: 3, pattern: [[0,2], [1,2], [2,2]], description: 'Bottom Line' },
    { id: 4, pattern: [[0,0], [1,1], [2,2]], description: 'Diagonal Down' },
    { id: 5, pattern: [[0,2], [1,1], [2,0]], description: 'Diagonal Up' }
  ],
  symbols: [
    { id: 'seven', name: '7', value: 100, frequency: 2, isWild: false, isScatter: false, icon: '7️⃣' },
    { id: 'bar', name: 'BAR', value: 50, frequency: 4, isWild: false, isScatter: false, icon: '🍫' },
    { id: 'cherry', name: 'Cherry', value: 20, frequency: 8, isWild: false, isScatter: false, icon: '🍒' },
    { id: 'lemon', name: 'Lemon', value: 15, frequency: 10, isWild: false, isScatter: false, icon: '🍋' },
    { id: 'orange', name: 'Orange', value: 10, frequency: 12, isWild: false, isScatter: false, icon: '🍊' },
    { id: 'wild', name: 'Wild', value: 0, frequency: 3, isWild: true, isScatter: false, multiplier: 2, icon: '⭐' },
    { id: 'scatter', name: 'Scatter', value: 5, frequency: 5, isWild: false, isScatter: true, icon: '💎' }
  ],
  rtp: 0.96,
  volatility: 'medium',
  minBet: 1,
  maxBet: 100,
  bonusFeatures: [
    {
      id: 'free_spins',
      name: 'Free Spins',
      triggerSymbols: ['scatter'],
      triggerCount: 3,
      type: 'free_spins',
      freeSpins: 10,
      multiplier: 2
    }
  ],
  theme: 'classic'
};

// Result interfaces
export interface SlotSpinResult {
  reelPositions: number[];
  visibleSymbols: SlotSymbol[][];
  winResult: GameResult;
  bonusTriggered: BonusFeature | null;
  totalWin: number;
  nextState: 'idle' | 'bonus' | 'autoplay';
}

export interface WinLineResult {
  paylineId: number;
  symbolCount: number;
  winSymbol: string;
  basePayout: number;
  win: number;
  isWild: boolean;
  positions: number[][];
}
