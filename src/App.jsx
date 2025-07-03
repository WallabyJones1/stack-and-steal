import { useState } from 'react';
import InGameScreen from './pages/InGameScreen.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PostGameResults from './pages/PostGameResults.jsx';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [winner, setWinner] = useState(null);
  const { connected } = useWallet();

  const handleGameEnd = (winnerData) => {
    setWinner(winnerData);
    setCurrentPage('results');
  };

  const handlePlayAgain = () => {
    setWinner(null);
    setCurrentPage('landing'); 
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'in-game':
        return <InGameScreen key={Date.now()} onGameEnd={handleGameEnd} />;
      case 'results':
        return <PostGameResults winner={winner} onPlayAgain={handlePlayAgain} />;
      case 'landing':
      default:
        return (
          <LandingPage 
            onStartPractice={() => setCurrentPage('in-game')} 
            onNavigateToLobby={() => alert("Multiplayer Lobby Coming Soon!")}
            connected={connected} 
          />
        );
    }
  };

  return (
    <div className="bg-slate-900 font-sans min-h-screen">
      <div className="absolute top-5 right-5 z-50">
        <WalletMultiButton />
      </div>
      {renderPage()}
    </div>
  );
}

export default App;
