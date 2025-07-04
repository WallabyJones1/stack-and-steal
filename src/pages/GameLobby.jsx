import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { Users, Swords, Repeat, Clipboard, Check } from 'lucide-react';

function GameLobby({ roomDetails, onStartGame }) {
    const { socket } = useSocket();
    // Initialize players state with the data passed from App.jsx
    const [players, setPlayers] = useState(roomDetails.players || []);
    const [copied, setCopied] = useState(false);

    // Listen for players joining or leaving the lobby
    useEffect(() => {
        if (!socket) return;

        const handlePlayerUpdate = ({ players: updatedPlayers }) => {
            setPlayers(updatedPlayers);
        };

        socket.on('playerJoined', handlePlayerUpdate);
        socket.on('playerLeft', handlePlayerUpdate);

        // Clean up listeners when the component unmounts
        return () => {
            socket.off('playerJoined', handlePlayerUpdate);
            socket.off('playerLeft', handlePlayerUpdate);
        };
    }, [socket]);

    // Function to copy the Room ID to the clipboard
    const copyRoomId = () => {
        if (roomDetails?.roomId) {
            navigator.clipboard.writeText(roomDetails.roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
        }
    };

    // The host is always the first player in the array
    const isHost = players.length > 0 && players[0].id === socket?.id;
    const isLobbyFull = players.length === roomDetails.gameConfig.numPlayers;

    return (
        <div className="h-screen w-screen bg-white flex flex-col justify-center items-center p-4">
            <h1 className="text-4xl font-black mb-4">Game Lobby</h1>
            <p className="text-slate-500 mb-8">Waiting for players to join... The game will start when the lobby is full.</p>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Players List */}
                <div className="md:col-span-2 bg-slate-50 p-6 rounded-lg border">
                    <h2 className="text-2xl font-bold mb-4">Players ({players.length} / {roomDetails.gameConfig.numPlayers})</h2>
                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <div key={player.id || index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                                <div className="flex items-center gap-3">
                                    <img src={player.playerAvatar} alt={player.playerName} className="w-12 h-12 rounded-full object-cover" />
                                    <span className="font-semibold">{player.playerName}</span>
                                </div>
                                {index === 0 && <span className="text-xs font-bold text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full">HOST</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Game Details */}
                <div className="bg-slate-50 p-6 rounded-lg border">
                    <h2 className="text-2xl font-bold mb-4">Game Details</h2>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-2"><Users size={16} /> Players</span>
                            <span>{players.length} / {roomDetails.gameConfig.numPlayers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-2"><Swords size={16} /> Entry Fee</span>
                            <span>{roomDetails.gameConfig.solAmount} SOL</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-2"><Repeat size={16} /> Rounds</span>
                            <span>{roomDetails.gameConfig.numRounds}</span>
                        </div>
                        <div className="pt-4 border-t">
                            <label className="font-semibold text-sm">Room ID</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input type="text" readOnly value={roomDetails.roomId} className="w-full bg-white border rounded p-2 font-mono" />
                                <button onClick={copyRoomId} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                                    {copied ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {isHost && (
                        <button
                            onClick={onStartGame}
                            disabled={!isLobbyFull}
                            className="w-full mt-6 h-12 text-white font-bold text-lg bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLobbyFull ? 'Start Game' : `Waiting for ${roomDetails.gameConfig.numPlayers - players.length} more...`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// FIX: Added the missing default export
export default GameLobby;
