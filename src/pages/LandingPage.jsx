import React, { useState, useRef } from 'react';
import { User, Upload, Swords, Users, Repeat, Hash } from 'lucide-react';

// --- NEW: Import all the new image assets ---
import newBackgroundImage from '../assets/STACK_N_STEAL_LANDING_BACKGROUND.jpg';
import logoImage from '../assets/STACK_N_STEAL_LOGO_trans.jpg';
import avatar1 from '../assets/6762.jpg';
import avatar2 from '../assets/Roges_Vibes_Dao_Logo_TRANS (1).png';

// --- NEW: Updated avatar options ---
const defaultAvatars = [
    avatar1, // Your new custom avatar
    avatar2, // Your second new custom avatar
    'https://placehold.co/100x100/C6F6D5/2F855A?text=C',
    'https://placehold.co/100x100/BEE3F8/2B6CB0?text=D',
];

function LandingPage({ onStartPractice, onCreateGame, onJoinGame, connected }) {
    const [playerName, setPlayerName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);
    const fileInputRef = useRef(null);
    
    const [numPlayers, setNumPlayers] = useState(4);
    const [solAmount, setSolAmount] = useState(0.1);
    const [numRounds, setNumRounds] = useState(3);
    
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageURL = URL.createObjectURL(file);
            setSelectedAvatar(imageURL);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };
    
    const handleCreate = () => {
        if (playerName && selectedAvatar) {
            const gameConfig = { numPlayers: parseInt(numPlayers), solAmount: parseFloat(solAmount), numRounds: parseInt(numRounds) };
            onCreateGame({ playerName, playerAvatar: selectedAvatar, gameConfig });
        } else {
            alert('Please enter your name and select an avatar.');
        }
    };

    const handleJoin = () => {
        if (playerName && selectedAvatar && joinRoomId) {
             const playerConfig = { playerName, playerAvatar: selectedAvatar };
             onJoinGame(playerConfig, joinRoomId);
        } else {
            alert('Please enter your name, avatar, and a Room ID to join.');
        }
    };

    const handleStartPractice = () => {
        if (playerName && selectedAvatar) {
            const gameConfig = { numPlayers: parseInt(numPlayers), solAmount: parseFloat(solAmount), numRounds: parseInt(numRounds) };
            onStartPractice({ playerName, playerAvatar: selectedAvatar, gameConfig });
        } else {
            alert('Please enter your name and select an avatar.');
        }
    };

    return (
        <div 
            className="h-screen w-screen overflow-y-auto text-white flex flex-col justify-center items-center p-4 bg-cover bg-center"
            // --- NEW: Set the background image ---
            style={{ backgroundImage: `url(${newBackgroundImage})` }}
        >
            <div className="w-full max-w-md bg-black/60 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                <div className="w-full flex flex-col items-center">
                    <div className="mb-6 flex justify-center items-center">
                        <img alt="logo" src={logoImage} className="w-[250px]" />
                    </div>
                    
                    <div className="w-full flex flex-col mb-6 p-4 bg-white/10 rounded-lg">
                        <label className="text-lg font-bold block mb-3">Your Profile</label>
                        <div className="flex items-center gap-4">
                            <img src={selectedAvatar} alt="Selected Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-blue-500" />
                            <div className="w-full">
                                <label className="text-sm font-bold block mb-1">Player Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input 
                                        placeholder="Enter your name" 
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        className="pr-4 pl-10 w-full h-11 text-md bg-black/30 text-white outline-none block relative border-slate-500 border-2 rounded-md focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                        </div>
                         <div className="grid grid-cols-5 gap-3 mt-4">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-400 hover:border-blue-500 hover:bg-white/20" onClick={handleUploadClick}>
                                <Upload size={20} className="text-slate-300" />
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                            </div>
                            {/* --- NEW: Display the new avatar options --- */}
                            {defaultAvatars.map((avatarUrl, index) => (
                                <img key={index} src={avatarUrl} alt="default avatar" onClick={() => setSelectedAvatar(avatarUrl)} className="w-16 h-16 rounded-full cursor-pointer object-cover border-4 border-transparent hover:border-blue-400"/>
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex flex-col mb-6 p-4 bg-white/10 rounded-lg">
                        <label className="text-lg font-bold block mb-3">Game Settings</label>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Users size={16} /> Players: <span className="font-black text-blue-400">{numPlayers}</span>
                                </label>
                                <input type="range" min="2" max="8" value={numPlayers} onChange={(e) => setNumPlayers(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Swords size={16} /> Entry (SOL): <span className="font-black text-green-400">{solAmount}</span>
                                </label>
                                <input type="range" min="0.05" max="1" step="0.05" value={solAmount} onChange={(e) => setSolAmount(parseFloat(e.target.value).toFixed(2))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Repeat size={16} /> Rounds: <span className="font-black text-red-400">{numRounds}</span>
                                </label>
                                <input type="range" min="1" max="5" value={numRounds} onChange={(e) => setNumRounds(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full">
                         <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full h-12 text-white font-bold text-lg bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={!playerName || !connected}
                        >
                            CREATE LIVE GAME
                        </button>
                        <div className="flex items-center my-4">
                            <hr className="flex-grow border-t border-white/20" />
                            <span className="px-2 text-slate-300 font-semibold">OR</span>
                            <hr className="flex-grow border-t border-white/20" />
                        </div>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input 
                                placeholder="Enter Room ID" 
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                className="pr-4 pl-10 w-full h-11 text-md bg-black/30 text-white outline-none block relative border-slate-500 border-2 rounded-md focus:border-blue-500" 
                            />
                        </div>
                         <button
                            type="button"
                            onClick={handleJoin}
                            className="mt-2 w-full h-12 text-white font-bold text-lg bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            disabled={!playerName || !joinRoomId || !connected}
                        >
                            JOIN LIVE GAME
                        </button>
                        <button
                            type="button"
                            onClick={handleStartPractice}
                            className="mt-4 w-full h-11 text-sm font-semibold text-white bg-white/20 rounded-lg hover:bg-white/30"
                        >
                            Practice vs Bots
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
