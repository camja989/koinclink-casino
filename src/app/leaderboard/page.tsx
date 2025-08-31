'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrophyIcon, 
  ChartBarIcon,
  StarIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

interface LeaderboardEntry {
  id: string
  username: string
  displayName: string
  coins: number
  level: number
  totalWins: number
  rank: number
  isCurrentUser?: boolean
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', username: 'jackpot_king', displayName: 'Jackpot King', coins: 250000, level: 15, totalWins: 1250, rank: 1 },
  { id: '2', username: 'lucky_seven', displayName: 'Lucky Seven', coins: 180000, level: 12, totalWins: 980, rank: 2 },
  { id: '3', username: 'slot_master', displayName: 'Slot Master', coins: 150000, level: 11, totalWins: 850, rank: 3 },
  { id: '4', username: 'casino_queen', displayName: 'Casino Queen', coins: 125000, level: 10, totalWins: 720, rank: 4 },
  { id: '5', username: 'high_roller', displayName: 'High Roller', coins: 95000, level: 9, totalWins: 650, rank: 5 },
  { id: '6', username: 'spin_wizard', displayName: 'Spin Wizard', coins: 75000, level: 8, totalWins: 580, rank: 6 },
  { id: '7', username: 'gold_digger', displayName: 'Gold Digger', coins: 60000, level: 7, totalWins: 420, rank: 7 },
  { id: '8', username: 'neon_player', displayName: 'Neon Player', coins: 45000, level: 6, totalWins: 380, rank: 8 },
  { id: '9', username: 'coin_collector', displayName: 'Coin Collector', coins: 35000, level: 5, totalWins: 320, rank: 9 },
  { id: '10', username: 'lucky_star', displayName: 'Lucky Star', coins: 25000, level: 4, totalWins: 250, rank: 10 }
]

export default function LeaderboardPage() {
  const { user, profile } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'coins' | 'wins' | 'level'>('coins')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchLeaderboard = async () => {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let sortedData = [...MOCK_LEADERBOARD]
      
      // Add current user if authenticated
      if (user && profile) {
        const userEntry: LeaderboardEntry = {
          id: user.id,
          username: profile.username,
          displayName: profile.display_name || profile.username,
          coins: profile.coins,
          level: profile.level,
          totalWins: profile.total_wins,
          rank: 0, // Will be calculated
          isCurrentUser: true
        }
        
        // Add user to leaderboard and re-sort
        sortedData.push(userEntry)
      }
      
      // Sort based on active tab
      switch (activeTab) {
        case 'coins':
          sortedData.sort((a, b) => b.coins - a.coins)
          break
        case 'wins':
          sortedData.sort((a, b) => b.totalWins - a.totalWins)
          break
        case 'level':
          sortedData.sort((a, b) => b.level - a.level)
          break
      }
      
      // Update ranks
      sortedData.forEach((entry, index) => {
        entry.rank = index + 1
      })
      
      setLeaderboard(sortedData.slice(0, 50)) // Top 50
      setLoading(false)
    }

    fetchLeaderboard()
  }, [activeTab, user, profile])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-400" />
      case 2:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />
      case 3:
        return <TrophyIcon className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-casino-gradient">
      {/* Header */}
      <header className="border-b border-casino-gold/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="casino-button-secondary flex items-center space-x-2">
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Casino</span>
              </Link>
              <h1 className="text-2xl font-bold neon-text">🏆 Leaderboard</h1>
            </div>
            {user && (
              <div className="text-sm text-gray-300">
                Signed in as {profile?.display_name || profile?.username || user.email}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 p-1 bg-black/40 rounded-lg border border-casino-gold/30">
            {(['coins', 'wins', 'level'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-casino-gold text-black font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'coins' && '💰 Top Coins'}
                {tab === 'wins' && '🎯 Most Wins'}
                {tab === 'level' && '⭐ Highest Level'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-black/40 border border-casino-gold/30 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-casino-gold/20">
            <h2 className="text-2xl font-bold text-center text-shadow-glow">
              {activeTab === 'coins' && '💰 Richest Players'}
              {activeTab === 'wins' && '🎯 Most Successful Players'}
              {activeTab === 'level' && '⭐ Highest Level Players'}
            </h2>
            <p className="text-center text-gray-400 mt-2">
              {user ? 'Compete with players worldwide!' : 'Sign up to see your ranking!'}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="divide-y divide-casino-gold/20">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${
                    entry.isCurrentUser ? 'bg-casino-gold/10 border-l-4 border-casino-gold' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-casino-gold/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-casino-gold" />
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {entry.displayName}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-xs bg-casino-gold text-black px-2 py-1 rounded">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">@{entry.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Coins</p>
                        <p className="font-bold text-casino-gold">
                          {formatNumber(entry.coins)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Wins</p>
                        <p className="font-bold text-green-400">
                          {formatNumber(entry.totalWins)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Level</p>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <p className="font-bold text-yellow-400">{entry.level}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {!user && (
          <motion.div 
            className="mt-8 bg-casino-gold/20 border border-casino-gold rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TrophyIcon className="w-12 h-12 text-casino-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold text-casino-gold mb-2">
              Join the Competition!
            </h3>
            <p className="text-white mb-4">
              Create a free account to see your ranking and compete with players worldwide.
            </p>
            <Link href="/" className="casino-button">
              Sign Up Now
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
