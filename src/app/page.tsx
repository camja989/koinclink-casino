'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  TrophyIcon, 
  PlayIcon,
  SparklesIcon,
  ChartBarIcon,
  GiftIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/ui/AuthModal'

const gameCards = [
  {
    id: 'slots',
    title: '🎰 Slot Machines',
    description: 'Classic slots with multiple themes and jackpots',
    minBet: 10,
    maxWin: 1000,
    href: '/games/slots'
  },
  {
    id: 'blackjack',
    title: '🃏 Blackjack',
    description: 'Beat the dealer and get as close to 21 as possible',
    minBet: 25,
    maxWin: 500,
    href: '/games/blackjack'
  },
  {
    id: 'roulette',
    title: '🎲 Roulette',
    description: 'Place your bets on the spinning wheel of fortune',
    minBet: 5,
    maxWin: 1750,
    href: '/games/roulette'
  },
  {
    id: 'poker',
    title: '🃏 Video Poker',
    description: 'Five card draw poker with multiple hand rankings',
    minBet: 20,
    maxWin: 800,
    href: '/games/poker'
  }
]

export default function HomePage() {
  const { user, profile, signOut } = useAuth()
  const [coins, setCoins] = useState(1000)
  const [isNewUser, setIsNewUser] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (user && profile) {
      // User is authenticated, use profile data
      setCoins(profile.coins)
      setIsNewUser(false)
    } else {
      // Guest user, use localStorage
      const hasPlayed = localStorage.getItem('hasPlayed')
      if (hasPlayed) {
        setIsNewUser(false)
        const savedCoins = localStorage.getItem('coins')
        if (savedCoins) {
          setCoins(parseInt(savedCoins))
        }
      } else {
        localStorage.setItem('hasPlayed', 'true')
        localStorage.setItem('coins', '1000')
      }
    }
  }, [user, profile])

  const claimDailyBonus = async () => {
    const bonusAmount = 250
    const newCoins = coins + bonusAmount
    
    if (user && profile) {
      // Update in database for authenticated users
      try {
        // This would call Supabase to update coins
        setCoins(newCoins)
      } catch (error) {
        console.error('Error claiming daily bonus:', error)
      }
    } else {
      // Update localStorage for guest users
      setCoins(newCoins)
      localStorage.setItem('coins', newCoins.toString())
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-casino-gradient">
      {/* Header */}
      <header className="border-b border-casino-gold/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold neon-text">🎰 KoinClink</h1>
              <span className="text-sm text-gray-400">Free Virtual Casino</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="coin-display">
                <CurrencyDollarIcon className="w-5 h-5 inline mr-1" />
                {coins.toLocaleString()} Coins
              </div>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    Welcome, {profile?.display_name || profile?.username || user.email}!
                  </span>
                  <Link href="/profile" className="casino-button-secondary flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="casino-button-secondary flex items-center space-x-1"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">Playing as Guest</span>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="casino-button flex items-center space-x-1"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-shadow-gold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to <span className="neon-text">KoinClink</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The ultimate free online casino experience with virtual currency
          </motion.p>

          {!user && (
            <motion.div 
              className="bg-casino-gold/20 border border-casino-gold rounded-lg p-6 mb-8 max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SparklesIcon className="w-8 h-8 text-casino-gold mx-auto mb-2" />
              <h3 className="text-xl font-bold text-casino-gold mb-2">Create Account & Get Bonus!</h3>
              <p className="text-white mb-4">
                Sign up for free to save your progress and get 500 bonus coins!
              </p>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="casino-button w-full"
              >
                Create Free Account
              </button>
            </motion.div>
          )}

          {isNewUser && user && (
            <motion.div 
              className="bg-casino-gold/20 border border-casino-gold rounded-lg p-6 mb-8 max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SparklesIcon className="w-8 h-8 text-casino-gold mx-auto mb-2" />
              <h3 className="text-xl font-bold text-casino-gold mb-2">Welcome Bonus!</h3>
              <p className="text-white">You've received 1,000 free coins to start playing!</p>
            </motion.div>
          )}

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={claimDailyBonus}
              className="casino-button flex items-center space-x-2"
            >
              <GiftIcon className="w-5 h-5" />
              <span>Claim Daily Bonus (+250 Coins)</span>
            </button>
            <Link href="/leaderboard" className="casino-button-secondary flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5" />
              <span>View Leaderboard</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-shadow-glow">
            Choose Your Game
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameCards.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={game.href}>
                  <div className="game-card group">
                    <div className="text-4xl mb-4 group-hover:animate-bounce-slow">
                      {game.title.split(' ')[0]}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-casino-gold">
                      {game.title.substring(2)}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm">
                      {game.description}
                    </p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Min bet: {game.minBet}</span>
                      <span>Max win: {game.maxWin}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <PlayIcon className="w-6 h-6 text-casino-gold group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-shadow-glow">
            Why Choose KoinClink?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CurrencyDollarIcon className="w-12 h-12 text-casino-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">100% Free</h3>
              <p className="text-gray-300">
                No real money required. Play with virtual coins for pure entertainment.
              </p>
            </div>
            
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-casino-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-gray-300">
                {user ? 'Save your progress in the cloud and track detailed statistics.' : 'Monitor your wins, losses, and improvement over time.'}
              </p>
            </div>
            
            <div className="text-center">
              <TrophyIcon className="w-12 h-12 text-casino-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Compete & Win</h3>
              <p className="text-gray-300">
                {user ? 'Climb global leaderboards and unlock achievements.' : 'Sign up to compete on leaderboards and unlock achievements.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-casino-gold/30 bg-black/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            KoinClink - Free Virtual Casino for Entertainment Only
          </p>
          <p className="text-xs text-gray-500">
            This platform uses virtual currency only. No real money gambling involved.
            Must be 18+ to play. Play responsibly.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  )
}
