'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐']
const SYMBOL_VALUES = {
  '🍒': 2,
  '🍋': 3,
  '🍊': 4, 
  '🍇': 5,
  '🔔': 10,
  '💎': 25,
  '7️⃣': 50,
  '⭐': 100
}

export default function SlotsGame() {
  const [coins, setCoins] = useState(1000)
  const [bet, setBet] = useState(25)
  const [reels, setReels] = useState(['🍒', '🍒', '🍒'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastWin, setLastWin] = useState(0)

  useEffect(() => {
    const savedCoins = localStorage.getItem('coins')
    if (savedCoins) {
      setCoins(parseInt(savedCoins))
    }
  }, [])

  const getRandomSymbol = () => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  }

  const calculateWin = (newReels: string[]) => {
    // Check for matches
    if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
      // All three match - jackpot!
      const symbol = newReels[0] as keyof typeof SYMBOL_VALUES
      return SYMBOL_VALUES[symbol] * bet
    } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2]) {
      // Two match - smaller win
      const matchedSymbol = newReels[0] === newReels[1] ? newReels[0] : 
                           newReels[1] === newReels[2] ? newReels[1] : newReels[0]
      const symbol = matchedSymbol as keyof typeof SYMBOL_VALUES
      return Math.floor(SYMBOL_VALUES[symbol] * bet * 0.3)
    }
    return 0
  }

  const spin = () => {
    if (coins < bet) {
      toast.error('Not enough coins!')
      return
    }

    setIsSpinning(true)
    setCoins(prev => prev - bet)
    
    // Simulate spinning animation
    setTimeout(() => {
      const newReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      setReels(newReels)
      
      const winAmount = calculateWin(newReels)
      setLastWin(winAmount)
      
      if (winAmount > 0) {
        const newCoins = coins - bet + winAmount
        setCoins(newCoins)
        localStorage.setItem('coins', newCoins.toString())
        
        if (winAmount >= bet * 10) {
          toast.success(`🎉 JACKPOT! Won ${winAmount} coins!`, { duration: 5000 })
        } else {
          toast.success(`🎰 Won ${winAmount} coins!`)
        }
      } else {
        localStorage.setItem('coins', (coins - bet).toString())
        toast('Try again! 🎰')
      }
      
      setIsSpinning(false)
    }, 2000)
  }

  const adjustBet = (amount: number) => {
    const newBet = Math.max(5, Math.min(coins, bet + amount))
    setBet(newBet)
  }

  return (
    <div className="min-h-screen bg-casino-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="casino-button-secondary flex items-center space-x-2">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Casino</span>
          </Link>
          <div className="coin-display">
            <CurrencyDollarIcon className="w-5 h-5 inline mr-1" />
            {coins.toLocaleString()} Coins
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-shadow-gold mb-4">
            🎰 Lucky Slots
          </h1>
          <p className="text-gray-300 text-lg">
            Match symbols to win! Three of a kind pays the jackpot!
          </p>
        </div>

        {/* Slot Machine */}
        <div className="casino-card max-w-2xl mx-auto mb-8">
          <div className="p-8">
            {/* Reels */}
            <div className="flex justify-center space-x-4 mb-8">
              {reels.map((symbol, index) => (
                <motion.div
                  key={index}
                  className={`slot-reel w-24 h-24 flex items-center justify-center text-4xl ${
                    isSpinning ? 'spinning' : ''
                  }`}
                  animate={isSpinning ? { y: [0, -20, 0] } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1, repeat: isSpinning ? 3 : 0 }}
                >
                  {isSpinning ? '❓' : symbol}
                </motion.div>
              ))}
            </div>

            {/* Win Display */}
            {lastWin > 0 && !isSpinning && (
              <motion.div
                className="text-center mb-6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-3xl font-bold text-casino-gold jackpot-animate">
                  🎉 WIN: {lastWin} COINS! 🎉
                </div>
              </motion.div>
            )}

            {/* Bet Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => adjustBet(-5)}
                className="casino-button-secondary px-3 py-1"
                disabled={bet <= 5}
              >
                -5
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-400">Bet Amount</div>
                <div className="text-2xl font-bold text-casino-gold">{bet} coins</div>
              </div>
              <button
                onClick={() => adjustBet(5)}
                className="casino-button-secondary px-3 py-1"
                disabled={bet + 5 > coins}
              >
                +5
              </button>
            </div>

            {/* Spin Button */}
            <div className="text-center">
              <button
                onClick={spin}
                disabled={isSpinning || coins < bet}
                className={`casino-button text-2xl px-8 py-4 ${
                  isSpinning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN'}
              </button>
            </div>
          </div>
        </div>

        {/* Paytable */}
        <div className="casino-card">
          <div className="p-6">
            <h3 className="text-xl font-bold text-casino-gold mb-4 text-center">
              💰 Paytable (3 of a kind)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {Object.entries(SYMBOL_VALUES).map(([symbol, value]) => (
                <div key={symbol} className="flex flex-col items-center space-y-1">
                  <div className="text-2xl">{symbol}</div>
                  <div className="text-sm text-casino-gold font-bold">
                    {value}x bet
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Two matching symbols pay 30% of the three-symbol payout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
