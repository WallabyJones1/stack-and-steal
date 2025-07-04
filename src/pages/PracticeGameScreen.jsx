import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from '../gameLogic/useGameLogic.js';
import Card from '../components/Card.jsx';
import logoImage from '../assets/STACK_N_STEAL_LOGO_trans.jpg';
import { ShieldCheck } from 'lucide-react';

// FIX: Added the missing TurnTimer component definition
const TurnTimer = ({ timeLeft, isMyTurn }) => {
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (timeLeft / 10) * circumference;
  
    return (
      <div className="absolute -top-3 -right-3 w-10 h-10">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle className="text-gray-200" strokeWidth="4" stroke="currentColor" fill="transparent" r="18" cx="20" cy="20" />
          <circle
            className={isMyTurn ? "text-green-500" : "text-gray-400"}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">{timeLeft}s</span>
      </div>
    );
};

function PracticeGameScreen({ onGameEnd, playerName, playerAvatar, gameConfig }) {
    const { state, dispatch } = useGameLogic({ onGameEnd, playerAvatar, playerName, gameConfig });
    const { player, opponents, selectedCard, turnOrder, currentPlayerIndex, turnTimer, isTargeting, gameMessage, powerCard, playedCards } = state;

    if (!player) {
        return <div className="min-h-screen bg-white flex justify-center items-center">Loading Practice Game...</div>;
    }
    
    const isMyTurn = turnOrder[currentPlayerIndex] === 'player';
    const canStack = selectedCard && isMyTurn;
    const canInitiateSteal = isMyTurn && !isTargeting;
    const layout = opponentLayouts[opponents.length] || opponentLayouts[7];

    return (
        <div className="h-screen w-screen overflow-hidden bg-white flex justify-center items-center p-4 font-['system-ui']">
            <div className="w-full max-w-7xl h-full flex relative text-center flex-col justify-center items-center">
                <div className="w-auto px-6 py-2 top-4 shadow-lg flex absolute flex-col justify-center items-center rounded-2xl bg-white border-2 border-yellow-300 z-10">
                    <p className="font-bold text-yellow-500 uppercase tracking-wider text-sm">Power Card</p>
                    <p className="text-4xl font-black text-yellow-400 [text-shadow:0_0_10px_rgba(251,191,36,0.5)]">{powerCard}</p>
                </div>
                <div className="w-[95%] h-[85%] bg-zinc-50 shadow-lg p-4 md:p-8 rounded-[120px]">
                    <div className="bg-white shadow-[inset_10px_10px_15px_-10px_rgb(195,195,195)] w-full h-full flex p-4 md:p-8 rounded-[100px]">
                        <div className="relative w-full h-full">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                                <img src={logoImage} alt="Game Logo" className="w-[350px] opacity-10" />
                                <div className="relative w-24 h-36">
                                    <AnimatePresence>
                                    {playedCards.slice(-5).map((card, index) => (
                                        <motion.div key={card.id} className="absolute top-0 left-0" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, y: index * -1, x: index * 1 }} transition={{ duration: 0.3 }}>
                                            <Card cardCode={card.code} className="!w-20 !h-28" />
                                        </motion.div>
                                    ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                            {opponents.map((opp, index) => {
                                const isStealable = isTargeting && opp.lastStackedCard;
                                const isActive = turnOrder[currentPlayerIndex] === opp.id;
                                const positionStyle = layout[index];
                                return (
                                <div key={opp.id} onClick={() => isStealable && dispatch({ type: 'STEAL_CARD', payload: opp.id })} style={positionStyle} className={`absolute flex flex-col items-center gap-1 transition-all duration-200 ${isStealable ? 'cursor-pointer scale-110 z-10' : 'z-0'} ${isTargeting && !isStealable ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="relative">
                                        <img src={opp.avatar} alt={`${opp.name} avatar`} className={`w-20 h-20 rounded-full border-4 shadow-md object-cover ${isStealable ? 'border-yellow-400' : 'border-white'} ${isActive ? 'shadow-green-500/50 shadow-lg' : ''}`} />
                                        {isActive && <TurnTimer timeLeft={turnTimer} isMyTurn={false} />}
                                    </div>
                                    <p className="font-semibold text-sm">{opp.name}</p>
                                    <div className="bg-gray-100 px-3 py-1 rounded-md text-center border border-gray-200"><p className="font-bold text-md">{opp.stack}</p></div>
                                    <div className="h-16 mt-1">{opp.lastStackedCard && <Card cardCode={opp.lastStackedCard.code} className="!w-12 !h-16" />}</div>
                                    <div className="flex items-center gap-1 text-yellow-500"><ShieldCheck size={14} /><span>{opp.wins}</span></div>
                                </div>
                            )})}
                            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-2">
                                <div className="flex justify-center items-end -space-x-12 h-32">
                                    <AnimatePresence>
                                        {player.hand.map((card) => (
                                            <div key={card.id} className={`transition-transform duration-300 ${selectedCard?.id === card.id ? 'scale-110 -translate-y-12 z-20' : 'z-0'}`}>
                                                <Card className="!w-24 !h-36" layoutId={card.id} cardCode={card.code} onClick={() => dispatch({ type: 'SELECT_CARD', payload: card })} />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <div className="flex items-center gap-6 p-3 bg-white rounded-2xl shadow-lg border z-10 -mt-8">
                                    <div className="text-center"><p className="text-slate-500 text-sm">Your Stack</p><p className="text-5xl font-black">{player.stack}</p></div>
                                    <div className="flex flex-col gap-2 w-40">
                                      <button onClick={() => dispatch({ type: 'STACK_CARD' })} disabled={!canStack} className="w-full text-white font-bold py-2 px-4 rounded-lg text-md bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Stack</button>
                                      <button onClick={() => dispatch({ type: 'INITIATE_STEAL' })} disabled={!canInitiateSteal} className="w-full text-white font-bold py-2 px-4 rounded-lg text-md bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Steal</button>
                                    </div>
                                    <div className="flex flex-col items-center relative">
                                      <img src={player.avatar} alt="Your avatar" className={`w-16 h-16 rounded-full border-4 shadow-md object-cover ${isMyTurn ? 'border-green-500 shadow-green-500/50 shadow-lg' : 'border-blue-500'}`} />
                                      {isMyTurn && <TurnTimer timeLeft={turnTimer} isMyTurn={true} />}
                                      <p className="font-semibold text-sm mt-1">{player.name}</p>
                                      <div className="flex items-center gap-1 text-yellow-500"><ShieldCheck size={14} /><span>{player.wins}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-auto h-auto px-4 py-2 bottom-4 left-4 shadow-md flex absolute justify-center items-center rounded-lg bg-black/50 text-white transition-all duration-300 z-20">
                                <span className="text-md opacity-90">{gameMessage}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const opponentLayouts = {
    1: [{ top: '-5%', left: '50%', transform: 'translate(-50%, 0)' }],
    2: [{ top: '50%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '50%', right: '0', transform: 'translate(105%, -50%)' }],
    3: [{ top: '50%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '-5%', left: '50%', transform: 'translate(-50%, 0)' }, { top: '50%', right: '0', transform: 'translate(105%, -50%)' }],
    4: [{ top: '50%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '15%', left: '20%', transform: 'translate(-50%, -50%)' }, { top: '15%', right: '20%', transform: 'translate(50%, -50%)' }, { top: '50%', right: '0', transform: 'translate(105%, -50%)' }],
    5: [{ top: '50%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '15%', left: '20%', transform: 'translate(-50%, -50%)' }, { top: '-5%', left: '50%', transform: 'translate(-50%, 0)' }, { top: '15%', right: '20%', transform: 'translate(50%, -50%)' }, { top: '50%', right: '0', transform: 'translate(105%, -50%)' }],
    6: [{ top: '60%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '20%', left: '15%', transform: 'translate(-50%, -50%)' }, { top: '-5%', left: '35%', transform: 'translate(-50%, 0)' }, { top: '-5%', right: '35%', transform: 'translate(50%, 0)' }, { top: '20%', right: '15%', transform: 'translate(50%, -50%)' }, { top: '60%', right: '0', transform: 'translate(105%, -50%)' }],
    7: [{ top: '60%', left: '0', transform: 'translate(-105%, -50%)' }, { top: '20%', left: '15%', transform: 'translate(-50%, -50%)' }, { top: '-5%', left: '35%', transform: 'translate(-50%, 0)' }, { top: '-5%', left: '50%', transform: 'translate(-50%, 0)' }, { top: '-5%', right: '35%', transform: 'translate(50%, 0)' }, { top: '20%', right: '15%', transform: 'translate(50%, -50%)' }, { top: '60%', right: '0', transform: 'translate(105%, -50%)' }],
};

export default PracticeGameScreen;
