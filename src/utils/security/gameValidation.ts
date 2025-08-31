// Professional Game Validation and Security

import SecureRNG from '@/lib/games/random';
import { GameResult, SlotSymbol } from '@/types/game';

export class GameValidator {
  private static instance: GameValidator;
  private rng: typeof SecureRNG;

  private constructor() {
    this.rng = SecureRNG;
  }

  static getInstance(): GameValidator {
    if (!GameValidator.instance) {
      GameValidator.instance = new GameValidator();
    }
    return GameValidator.instance;
  }

  // Validate bet amount
  validateBet(betAmount: number, playerCoins: number, minBet: number, maxBet: number): boolean {
    // Check bet bounds
    if (betAmount < minBet || betAmount > maxBet) {
      return false;
    }

    // Check sufficient funds
    if (betAmount > playerCoins) {
      return false;
    }

    // Check reasonable bet size (max 25% of coins)
    if (betAmount > playerCoins * 0.25) {
      return false;
    }

    return true;
  }

  // Validate slot game result
  validateSlotResult(result: number[][], paytable: any, betAmount: number): GameResult {
    const winLines = this.calculateWinLines(result, paytable);
    const totalWin = winLines.reduce((sum, line) => sum + line.payout, 0) * betAmount;
    
    return {
      isWin: totalWin > 0,
      winAmount: totalWin,
      winType: this.categorizeWin(totalWin, betAmount),
      winLines,
      symbols: result,
    };
  }

  // Calculate winning lines for slot machine
  private calculateWinLines(result: number[][], paytable: any) {
    const winLines = [];
    const paylines = [
      [0, 0, 0], // Top row
      [1, 1, 1], // Middle row  
      [2, 2, 2], // Bottom row
      [0, 1, 2], // Diagonal down
      [2, 1, 0], // Diagonal up
    ];

    paylines.forEach((line, lineIndex) => {
      const symbols = line.map((row, col) => result[col][row]);
      const firstSymbol = symbols[0];
      
      // Check for three of a kind
      if (symbols.every(symbol => symbol === firstSymbol)) {
        const payout = paytable[firstSymbol]?.threeOfKind || 0;
        if (payout > 0) {
          winLines.push({
            line: lineIndex,
            symbols: symbols.map(s => s.toString()),
            payout,
            positions: line.map((row, col) => col * 3 + row),
          });
        }
      }
    });

    return winLines;
  }

  // Categorize win size
  private categorizeWin(winAmount: number, betAmount: number): 'none' | 'small' | 'medium' | 'big' | 'jackpot' {
    if (winAmount === 0) return 'none';
    
    const multiplier = winAmount / betAmount;
    if (multiplier < 2) return 'small';
    if (multiplier < 10) return 'medium';
    if (multiplier < 50) return 'big';
    return 'jackpot';
  }

  // Verify game session integrity
  verifySessionIntegrity(sessionData: any): boolean {
    // Check for impossible wins
    const totalBets = sessionData.rounds?.reduce((sum: number, round: any) => sum + round.betAmount, 0) || 0;
    const totalWins = sessionData.rounds?.reduce((sum: number, round: any) => sum + round.winAmount, 0) || 0;
    
    // RTP should be within reasonable bounds (50% - 150%)
    const rtp = totalBets > 0 ? totalWins / totalBets : 0;
    if (rtp < 0.5 || rtp > 1.5) {
      return false;
    }

    // Check for sequential impossible results
    const consecutiveWins = this.checkConsecutiveWins(sessionData.rounds || []);
    if (consecutiveWins > 10) {
      return false;
    }

    return true;
  }

  // Check for too many consecutive wins (anti-cheating)
  private checkConsecutiveWins(rounds: any[]): number {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    rounds.forEach(round => {
      if (round.winAmount > 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    return maxConsecutive;
  }

  // Rate limiting for game actions
  validateActionRate(lastActions: number[], maxActionsPerMinute: number = 60): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Filter recent actions
    const recentActions = lastActions.filter(timestamp => timestamp > oneMinuteAgo);
    
    return recentActions.length < maxActionsPerMinute;
  }

  // Validate responsible gaming limits
  validateResponsibleGaming(
    betAmount: number,
    currentSpent: number,
    limits: {
      dailyLimit: number;
      sessionLimit: number;
      lossLimit: number;
    }
  ): { allowed: boolean; reason?: string } {
    if (currentSpent + betAmount > limits.dailyLimit) {
      return { allowed: false, reason: 'Daily spending limit exceeded' };
    }

    if (currentSpent + betAmount > limits.sessionLimit) {
      return { allowed: false, reason: 'Session spending limit exceeded' };
    }

    if (currentSpent + betAmount > limits.lossLimit) {
      return { allowed: false, reason: 'Loss limit exceeded' };
    }

    return { allowed: true };
  }

  // Generate cryptographically secure game seed
  generateGameSeed(): string {
    const timestamp = Date.now().toString();
    const random = this.rng.randomInt(100000, 999999).toString();
    return `${timestamp}_${random}`;
  }

  // Verify game seed integrity
  verifyGameSeed(seed: string, expectedFormat: RegExp = /^\d{13}_\d{6}$/): boolean {
    return expectedFormat.test(seed);
  }
}

// Anti-cheat detection
export class AntiCheatDetector {
  private static suspiciousPatterns = {
    maxConsecutiveWins: 15,
    maxWinMultiplier: 1000,
    maxWinRateDeviation: 0.3, // 30% above expected
    minTimeBetweenActions: 100, // milliseconds
  };

  static detectSuspiciousActivity(sessionData: any): string[] {
    const warnings = [];

    // Check win patterns
    const consecutiveWins = this.getConsecutiveWins(sessionData.rounds || []);
    if (consecutiveWins > this.suspiciousPatterns.maxConsecutiveWins) {
      warnings.push(`Suspicious: ${consecutiveWins} consecutive wins`);
    }

    // Check win multipliers
    const maxMultiplier = this.getMaxWinMultiplier(sessionData.rounds || []);
    if (maxMultiplier > this.suspiciousPatterns.maxWinMultiplier) {
      warnings.push(`Suspicious: Win multiplier of ${maxMultiplier}x`);
    }

    // Check action timing
    const fastActions = this.detectFastActions(sessionData.rounds || []);
    if (fastActions > 0) {
      warnings.push(`Suspicious: ${fastActions} actions faster than ${this.suspiciousPatterns.minTimeBetweenActions}ms`);
    }

    return warnings;
  }

  private static getConsecutiveWins(rounds: any[]): number {
    let maxConsecutive = 0;
    let current = 0;

    rounds.forEach(round => {
      if (round.winAmount > 0) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    });

    return maxConsecutive;
  }

  private static getMaxWinMultiplier(rounds: any[]): number {
    return rounds.reduce((max, round) => {
      const multiplier = round.betAmount > 0 ? round.winAmount / round.betAmount : 0;
      return Math.max(max, multiplier);
    }, 0);
  }

  private static detectFastActions(rounds: any[]): number {
    let fastCount = 0;
    
    for (let i = 1; i < rounds.length; i++) {
      const timeDiff = new Date(rounds[i].timestamp).getTime() - new Date(rounds[i-1].timestamp).getTime();
      if (timeDiff < this.suspiciousPatterns.minTimeBetweenActions) {
        fastCount++;
      }
    }

    return fastCount;
  }
}

export default GameValidator.getInstance();
