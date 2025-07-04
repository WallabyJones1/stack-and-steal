import { useState, useEffect } from 'react';
import { useSocket } from './context/SocketContext.jsx';

// Import all page components
import PracticeGameScreen from './pages/PracticeGameScreen.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PostGameResults from './pages/PostGameResults.jsx';
import GameLobby from './pages/GameLobby.jsx';
import LoadingScreen from './pages/LoadingScreen.jsx';
// LiveGameScreen would be created later for multiplayer
// import LiveGameScreen from './pages/LiveGameScreen.jsx'; 

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
    const { socket, isConnected } = useSocket();
    const { connected: walletConnected, publicKey } = useWallet();

    const [currentPage, setCurrentPage] = useState('landing');
    const [winner, setWinner] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [practiceGameConfig, setPracticeGameConfig] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('gameCreated', (details) => {
            setRoomDetails(details);
            setCurrentPage('lobby');
        });
        
        socket.on('playerJoined', (details) => {
            setRoomDetails(prevDetails => ({ ...prevDetails, players: details.players }));
        });
        
        socket.on('playerLeft', (details) => {
            setRoomDetails(prevDetails => ({ ...prevDetails, players: details.players }));
        });

        socket.on('gameStarted', (initialGameState) => {
            setGameState(initialGameState);
            setCurrentPage('in-game-live');
        });
        
        socket.on('gameStateUpdate', (newGameState) => {
            setGameState(newGameState);
        });

        socket.on('error', (error) => {
            alert(`Server error: ${error.message}`);
            setCurrentPage('landing');
        });

        return () => {
            socket.off('gameCreated');
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('gameStarted');
            socket.off('gameStateUpdate');
            socket.off('error');
        };
    }, [socket]);

    const handleCreateGame = (config) => {
        if (socket && walletConnected) {
            const playerInfo = {
                playerName: config.playerName,
                playerAvatar: config.playerAvatar,
                publicKey: publicKey.toBase58(),
            };
            socket.emit('createGame', { playerInfo, gameConfig: config.gameConfig });
        } else {
            alert("Please connect your wallet first.");
        }
    };

    const handleJoinGame = (config, roomId) => {
        if (socket && walletConnected) {
            const playerInfo = {
                playerName: config.playerName,
                playerAvatar: config.playerAvatar,
                publicKey: publicKey.toBase58(),
            };
            socket.emit('joinGame', { roomId, playerInfo });
        } else {
            alert("Please enter your name, avatar, and a Room ID to join.");
        }
    };
    
    const handleStartGame = () => {
        if (socket && roomDetails?.roomId) {
            socket.emit('startGame', { roomId: roomDetails.roomId });
        }
    };

    const handleStartPractice = (config) => {
        setPracticeGameConfig(config);
        setCurrentPage('in-game-practice');
    };

    const handleGameEnd = (winnerData) => {
        setWinner(winnerData);
        setCurrentPage('results');
    };

    const handlePlayAgain = () => {
        setWinner(null);
        setRoomDetails(null);
        setGameState(null);
        setPracticeGameConfig(null);
        setCurrentPage('landing'); 
    };

    const renderPage = () => {
        if (!isConnected) {
            return <LoadingScreen />;
        }

        switch (currentPage) {
            case 'lobby':
                return <GameLobby roomDetails={roomDetails} onStartGame={handleStartGame} />;
            // case 'in-game-live':
            //     return <LiveGameScreen gameState={gameState} onGameEnd={handleGameEnd} />;
            case 'in-game-practice':
                 return <PracticeGameScreen 
                          key={Date.now()} 
                          onGameEnd={handleGameEnd} 
                          playerName={practiceGameConfig.playerName}
                          playerAvatar={practiceGameConfig.playerAvatar}
                          gameConfig={practiceGameConfig.gameConfig}
                       />;
            case 'results':
                return <PostGameResults winner={winner} onPlayAgain={handlePlayAgain} />;
            case 'landing':
            default:
                return (
                    <LandingPage 
                        onCreateGame={handleCreateGame}
                        onJoinGame={handleJoinGame}
                        onStartPractice={handleStartPractice}
                        connected={walletConnected} 
                    />
                );
        }
    };

    return (
        <div className="bg-white font-['system-ui'] min-h-screen">
            <div className="absolute top-5 right-5 z-50">
                <WalletMultiButton />
            </div>
            {renderPage()}
        </div>
    );
}

export default App;
