// src/App.jsx

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import LandingPage from './pages/LandingPage';
import InGameScreen from './pages/InGameScreen';
import PostGameResults from './pages/PostGameResults';

function App() {
  const { connected } = useWallet();

  // Pages: 'landing' | 'game' | 'results'
  const [screen, setScreen] = useState('landing');
  const [winner, setWinner] = useState(null);

  const handleStartGame = () => setScreen('game');
  const handleEndGame = (winnerId) => {
    setWinner(winnerId);
    setScreen('results');
  };
  const handleRestart = () => {
    setWinner(null);
    setScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white p-4">
      <div className="flex justify-end p-2">
        <WalletMultiButton className="!bg-green-700 hover:!bg-green-800 transition-all" />
      </div>

      {!connected ? (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
          <h1 className="text-3xl font-bold mb-4">Connect your wallet to begin</h1>
        </div>
      ) : screen === 'landing' ? (
        <LandingPage onStart={handleStartGame} />
      ) : screen === 'game' ? (
        <InGameScreen onGameOver={handleEndGame} />
      ) : (
        <PostGameResults winner={winner} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
