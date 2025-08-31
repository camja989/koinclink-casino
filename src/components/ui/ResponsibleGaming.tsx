// Responsible Gaming Components

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { useGameStore } from '@/store/gameStore';

export function ResponsibleGamingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { responsibleGaming, updateResponsibleGaming } = useGameStore();
  const [settings, setSettings] = useState(responsibleGaming);

  const handleSave = () => {
    updateResponsibleGaming(settings);
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShieldCheckIcon className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-amber-600/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-amber-500" />
                <h2 className="text-2xl font-bold text-white">Responsible Gaming</h2>
              </div>

              <div className="space-y-6">
                {/* Daily Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Spending Limit
                  </label>
                  <input
                    type="number"
                    value={settings.dailyLimit}
                    onChange={(e) => setSettings({...settings, dailyLimit: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    min="0"
                    max="10000"
                  />
                </div>

                {/* Session Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Spending Limit
                  </label>
                  <input
                    type="number"
                    value={settings.sessionLimit}
                    onChange={(e) => setSettings({...settings, sessionLimit: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    min="0"
                    max="5000"
                  />
                </div>

                {/* Loss Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Loss Limit
                  </label>
                  <input
                    type="number"
                    value={settings.lossLimit}
                    onChange={(e) => setSettings({...settings, lossLimit: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    min="0"
                    max="2000"
                  />
                </div>

                {/* Reality Check Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reality Check (minutes)
                  </label>
                  <select
                    value={settings.realityCheckInterval}
                    onChange={(e) => setSettings({...settings, realityCheckInterval: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Enable Responsible Gaming</span>
                  <button
                    onClick={() => setSettings({...settings, isActive: !settings.isActive})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.isActive ? 'bg-amber-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function RealityCheckModal({ isOpen, onClose, sessionTime }: {
  isOpen: boolean;
  onClose: () => void;
  sessionTime: number;
}) {
  const minutes = Math.floor(sessionTime / 60000);
  const hours = Math.floor(minutes / 60);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-amber-600/50 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Reality Check</h2>
            
            <p className="text-gray-300 mb-2">
              You've been playing for:
            </p>
            <p className="text-3xl font-bold text-amber-500 mb-6">
              {hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`}
            </p>

            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Remember to take regular breaks and only play with money you can afford to lose. 
              Gambling should be fun and entertaining.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Continue Playing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LimitWarning({ type, message, onClose }: {
  type: 'warning' | 'error';
  message: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`rounded-lg p-4 shadow-lg border ${
        type === 'error' 
          ? 'bg-red-900/90 border-red-600 text-red-100' 
          : 'bg-amber-900/90 border-amber-600 text-amber-100'
      }`}>
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className={`w-6 h-6 mt-0.5 ${
            type === 'error' ? 'text-red-400' : 'text-amber-400'
          }`} />
          <div className="flex-1">
            <h3 className="font-medium mb-1">
              {type === 'error' ? 'Limit Reached' : 'Spending Warning'}
            </h3>
            <p className="text-sm opacity-90">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function GameInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      >
        <InformationCircleIcon className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-blue-600/20 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <InformationCircleIcon className="w-8 h-8 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Game Information</h2>
              </div>

              <div className="space-y-6 text-gray-300">
                <section>
                  <h3 className="text-lg font-semibold text-white mb-3">About KoinClink</h3>
                  <p className="text-sm leading-relaxed">
                    KoinClink is a free-to-play casino game platform using virtual currency. 
                    No real money is involved, and all games are for entertainment purposes only.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white mb-3">Fair Play</h3>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>All games use cryptographically secure random number generation</li>
                    <li>Return to Player (RTP) rates are clearly displayed</li>
                    <li>Game outcomes are completely random and cannot be influenced</li>
                    <li>Anti-cheat systems monitor for suspicious activity</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white mb-3">Responsible Gaming</h3>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Set daily, session, and loss limits to control spending</li>
                    <li>Reality checks remind you of time spent playing</li>
                    <li>Self-exclusion options are available</li>
                    <li>Games are designed for entertainment, not profit</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white mb-3">Getting Help</h3>
                  <p className="text-sm leading-relaxed">
                    If you feel you may have a gambling problem, please seek help from:
                  </p>
                  <ul className="text-sm mt-2 space-y-1 text-blue-400">
                    <li>• National Council on Problem Gambling: 1-800-522-4700</li>
                    <li>• Gamblers Anonymous: www.gamblersanonymous.org</li>
                    <li>• GamCare: www.gamcare.org.uk</li>
                  </ul>
                </section>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-8 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
