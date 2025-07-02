// src/pages/LandingPage.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button'; // assuming you're using a button wrapper

const LandingPage = ({ onStart }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      <h1 className="text-5xl font-bold text-green-400 mb-4 drop-shadow-md">Stack & Steal</h1>
      <p className="text-lg text-slate-300 max-w-xl mb-6">
        Reach exactly 33 before your opponents. Stack smart. Shield wisely. And steal like a Rogue.
      </p>

      <div className="space-y-4 mb-8">
        <Button onClick={() => onStart('play')} className="w-48 text-lg">
          ▶ Start Game
        </Button>
        <Button onClick={() => onStart('practice')} variant="outline" className="w-48 text-lg border-green-400 text-green-300">
          🧪 Practice Mode
        </Button>
        <Button onClick={() => setShowRules(true)} variant="ghost" className="w-48 text-md text-slate-400 hover:text-white">
          📜 View Rules
        </Button>
      </div>

      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl max-w-xl w-full">
              <h2 className="text-2xl font-semibold mb-4 text-green-300">Game Rules</h2>
              <ul className="text-left text-slate-300 space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-2">
                <li>🎯 Goal: Be the first to reach exactly 33 stack points.</li>
                <li>🃏 Cards:
                  <ul className="ml-4 list-disc">
                    <li>Number cards 1–9: face value.</li>
                    <li>10, J, Q, K: all count as 10.</li>
                    <li>Ace: counts as 11.</li>
                    <li>Shield: blocks steals for one turn (value 0).</li>
                    <li>Rogue: steals the last stacked card from any unshielded player (value 13).</li>
                  </ul>
                </li>
                <li>🔄 Turn Actions:
                  <ul className="ml-4 list-disc">
                    <li><strong>Stack</strong>: Add a number card to your stack. Bust if you go over 33.</li>
                    <li><strong>Steal</strong>: Discard a number card to take the last card from an unshielded opponent.</li>
                    <li><strong>Shield</strong>: Use a SHIELD card to block one steal.</li>
                    <li><strong>Rogue</strong>: Instantly steal a card without discarding.</li>
                  </ul>
                </li>
                <li>💥 Busting resets your stack to 0.</li>
                <li>🏆 First player to 33 wins the game.</li>
              </ul>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowRules(false)} variant="ghost">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
