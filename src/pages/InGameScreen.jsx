import { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card.jsx';
import { motion, AnimatePresence } from 'framer-motion';
// --- UPDATED: Import the normal sized logo ---
import logoNormal from '../assets/STACK_N_STEAL_LOGO_trans normal.PNG';

// --- Game Constants and Setup ---
const WINNING_SCORE = 33;
const NUM_BOTS = 7;
const HAND_SIZE = 4;

const getCardValue = (card) => {
  if (!card) return 0;
  const rank = card.rank;
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 1;
  if (rank === 'ROGUE') return 13;
  if (typeof rank === 'number') return rank;
  return 0;
};

const createDeck = () => {
  let deck = [];
  let idCounter = 0;
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  
  for (let i = 0; i < 2; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ id: idCounter++, suit, rank });
      }
    }
  }

  for (let i = 0; i < 4; i++) deck.push({ id: idCounter++, suit: 'Special', rank: 'ROGUE' });
  for (let i = 0; i < 8; i++) deck.push({ id: idCounter++, suit: 'Special', rank: 'SHIELD' });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const setupGame = () => {
  const deck = createDeck();
  const createPlayer = (name, isYou = false) => ({
    id: isYou ? 1 : Math.random(),
    name,
    stack: 0,
    hand: deck.splice(0, HAND_SIZE),
    isShielded: false,
    lastStackedCard: null,
  });
  const opponents = [];
  for (let i = 0; i < NUM_BOTS; i++) {
    opponents.push({ ...createPlayer(`Bot ${i + 1}`), id: i + 2 });
  }
  return { 
    deck, 
    player: createPlayer('You', true), 
    opponents, 
    log: ["Game started! It's your turn."],
    powerCard: Math.floor(Math.random() * 9) + 2
  };
};

function InGameScreen({ onGameEnd }) {
  const [gameState, setGameState] = useState(setupGame());
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isTargeting, setIsTargeting] = useState(false);

  const cx = (...classNames) => classNames.filter(Boolean).join(' ');

  // --- NEW: Memoized leaderboard ---
  const leaderboard = useMemo(() => {
    const allPlayers = [gameState.player, ...gameState.opponents];
    return allPlayers.sort((a, b) => b.stack - a.stack);
  }, [gameState.player, gameState.opponents]);


  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    setIsTargeting(false);
    if (selectedCard && selectedCard.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const endPlayerTurn = (newState) => {
    newState.player.isShielded = false;
    while(newState.player.hand.length < HAND_SIZE && newState.deck.length > 0) {
        newState.player.hand.push(newState.deck.pop());
    }
    newState.powerCard = Math.floor(Math.random() * 9) + 2;
    setGameState(newState);
    setSelectedCard(null);
    setIsTargeting(false);
    setIsPlayerTurn(false);
  };

  const handlePlayerAction = (action) => {
    setGameState(currentState => {
      let newState = JSON.parse(JSON.stringify(currentState));
      action(newState);
      
      newState.player.hand = newState.player.hand.filter(c => c.id !== selectedCard.id);
      
      if (newState.player.stack === WINNING_SCORE) {
        onGameEnd(newState.player);
      } else {
        endPlayerTurn(newState);
      }
      return newState;
    });
  };

  const handleStack = () => {
    const cardValue = getCardValue(selectedCard);
    if (cardValue === 0) return;
    handlePlayerAction((newState) => {
      let totalValue = cardValue;
      let logMessage = `You stacked a ${selectedCard.rank}.`;
      
      if (selectedCard.rank === newState.powerCard) {
        totalValue += 5;
        logMessage = `You stacked a POWER CARD ${selectedCard.rank} for a +5 bonus!`;
      }

      if (newState.player.stack + totalValue > WINNING_SCORE) {
        newState.player.stack = 0;
        newState.player.lastStackedCard = null;
        newState.log.unshift(`You went bust!`);
      } else {
        newState.player.stack += totalValue;
        newState.player.lastStackedCard = selectedCard;
        newState.log.unshift(logMessage);
      }
    });
  };

  const handlePlayShield = () => {
    if (!selectedCard || selectedCard.rank !== 'SHIELD') return;
    handlePlayerAction((newState) => {
      newState.player.isShielded = true;
      newState.log.unshift(`You played a SHIELD!`);
    });
  };

  const handleInitiateSteal = () => {
    if (selectedCard === null) return;
    setIsTargeting(true);
    setGameState(currentState => ({
        ...currentState,
        log: [`Discarding ${selectedCard.rank} to steal. Select a target.`, ...currentState.log]
    }));
  };

  const handleConfirmSteal = (targetId) => {
    if (!isTargeting) return;
    handlePlayerAction((newState) => {
      const target = newState.opponents.find(o => o.id === targetId);
      if (target.isShielded) {
        newState.log.unshift(`${target.name} is shielded! Your steal failed.`);
      } else if (target.lastStackedCard) {
        const stolenValue = getCardValue(target.lastStackedCard);
        if (newState.player.stack + stolenValue > WINNING_SCORE) {
            newState.log.unshift(`Stealing the ${target.lastStackedCard.rank} would make you bust!`);
        } else {
            target.stack -= stolenValue;
            newState.player.stack += stolenValue;
            newState.log.unshift(`You stole a ${target.lastStackedCard.rank} from ${target.name}'s stack!`);
            target.lastStackedCard = null;
        }
      }
    });
  };
  
  useEffect(() => {
    if (!isPlayerTurn) {
      const botTurnTimeout = setTimeout(() => {
        setGameState(currentState => {
          let newState = JSON.parse(JSON.stringify(currentState));
          let currentLog = [];
          let winnerFound = false;
          for (const bot of newState.opponents) {
            if (winnerFound) continue;
            bot.isShielded = false;
            if (bot.hand.length === 0) continue;
            const numberCards = bot.hand.filter(c => getCardValue(c) > 0).sort((a,b) => getCardValue(b) - getCardValue(a));
            const shieldCard = bot.hand.find(c => c.rank === 'SHIELD');
            if (shieldCard) {
                bot.hand = bot.hand.filter(c => c.id !== shieldCard.id);
                bot.isShielded = true;
                currentLog.unshift(`${bot.name} played a SHIELD.`);
            } else {
                const potentialTargets = [newState.player, ...newState.opponents.filter(o => o.id !== bot.id)].filter(p => p.lastStackedCard && !p.isShielded).sort((a,b) => getCardValue(b.lastStackedCard) - getCardValue(a.lastStackedCard));
                const bestCardToStack = numberCards.find(c => bot.stack + getCardValue(c) <= WINNING_SCORE);
                const bestStealTarget = potentialTargets[0];
                let willSteal = false;
                if (bestStealTarget && bot.hand.length > 0) {
                    const stealValue = getCardValue(bestStealTarget.lastStackedCard);
                    const stackValue = bestCardToStack ? getCardValue(bestCardToStack) : 0;
                    if (stealValue > stackValue && bot.stack + stealValue <= WINNING_SCORE) willSteal = true;
                }
                if (willSteal) {
                    const cardToDiscard = bot.hand.find(c => c.rank !== 'SHIELD');
                    if(cardToDiscard){
                        bot.hand = bot.hand.filter(c => c.id !== cardToDiscard.id);
                        const stolenValue = getCardValue(bestStealTarget.lastStackedCard);
                        bestStealTarget.stack -= stolenValue;
                        bot.stack += stolenValue;
                        currentLog.unshift(`${bot.name} discarded a ${cardToDiscard.rank} and stole a ${bestStealTarget.lastStackedCard.rank} from ${bestStealTarget.name}!`);
                        bestStealTarget.lastStackedCard = null;
                    }
                } else if (bestCardToStack) {
                    let totalValue = getCardValue(bestCardToStack);
                    let logMessage = `${bot.name} stacked a ${bestCardToStack.rank}.`;
                    if(bestCardToStack.rank === newState.powerCard) {
                        totalValue += 5;
                        logMessage = `${bot.name} stacked a POWER CARD ${bestCardToStack.rank}!`;
                    }

                    if(bot.stack + totalValue > WINNING_SCORE) {
                        bot.stack = 0;
                        bot.lastStackedCard = null;
                        currentLog.unshift(`${bot.name} went bust!`);
                    } else {
                        bot.stack += totalValue;
                        bot.lastStackedCard = bestCardToStack;
                        currentLog.unshift(logMessage);
                    }
                    bot.hand = bot.hand.filter(c => c.id !== bestCardToStack.id);
                } else {
                    const lowestCard = numberCards[numberCards.length - 1];
                    if(lowestCard){
                        bot.stack = 0;
                        bot.lastStackedCard = null;
                        currentLog.unshift(`${bot.name} went bust!`);
                        bot.hand = bot.hand.filter(c => c.id !== lowestCard.id);
                    }
                }
            }
            while(bot.hand.length < HAND_SIZE && newState.deck.length > 0) {
                bot.hand.push(newState.deck.pop());
            }
            if (bot.stack === WINNING_SCORE) {
              winnerFound = true;
              onGameEnd(bot);
            }
          }
          if (!winnerFound) {
            newState.log.unshift("It's your turn again.");
            setIsPlayerTurn(true);
          }
          newState.log = [...currentLog, ...newState.log];
          return newState;
        });
      }, 1500);
      return () => clearTimeout(botTurnTimeout);
    }
  }, [isPlayerTurn, onGameEnd]);

  const isCardSelected = selectedCard !== null;
  const canStack = isCardSelected && getCardValue(selectedCard) > 0;
  const canPlayShield = isCardSelected && selectedCard.rank === 'SHIELD';
  
  const GameButton = ({ onClick, disabled, children, variant }) => {
    const baseClasses = "w-full text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 border border-transparent shadow-md hover:scale-105 hover:shadow-lg";
    const variantClasses = {
        stack: "bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400 hover:shadow-blue-400/50",
        steal: "bg-gradient-to-r from-red-600 to-red-500 border-red-400 hover:shadow-red-400/50",
        shield: "bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-400 hover:shadow-cyan-400/50",
    };
    const disabledClasses = "bg-gray-600 border-gray-500 cursor-not-allowed opacity-50 hover:scale-100";
    return <button onClick={onClick} disabled={disabled} className={cx(baseClasses, disabled ? disabledClasses : variantClasses[variant])}>{children}</button>;
  };

  const PlayerSeat = ({ player, style, isTargetable, onTarget }) => (
    <div 
      className={cx(
        "absolute w-40 flex flex-col items-center gap-1 transition-all duration-200",
        isTargetable && "cursor-pointer outline-2 outline-yellow-400 bg-yellow-500/20 rounded-lg",
        isTargeting && !isTargetable && "opacity-50 grayscale cursor-not-allowed",
        player.isShielded && "shadow-[0_0_15px_theme(colors.cyan.400)] rounded-lg relative"
      )}
      style={style}
      onClick={onTarget}
    >
      <div className="bg-black/40 px-3 py-1 rounded-md text-center border border-black/50">
        <p className="font-semibold text-sm text-slate-200">{player.name}</p>
        <p className="font-bold text-lg text-white font-slab">{player.stack}</p>
      </div>
      {player.lastStackedCard && <div className="w-9 h-12"><Card card={player.lastStackedCard} /></div>}
      {player.isShielded && <div className="absolute -top-2 -right-2 text-2xl [filter:drop-shadow(0_0_5px_theme(colors.cyan.400))]">🛡️</div>}
    </div>
  );

  const getOpponentPosition = (index, total) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    const x = 50 + 45 * Math.cos(angle);
    const y = 100 - 55 * Math.sin(angle);
    return { top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' };
  };

  return (
    <div className="grid grid-cols-[1fr_3.5fr_1fr] gap-6 w-full h-screen p-4 bg-slate-900 font-sans overflow-hidden">
      {/* --- Leaderboard Sidebar (Left) --- */}
      <div className="flex flex-col gap-6 bg-slate-800/50 border border-white/10 backdrop-blur-lg rounded-2xl p-6 overflow-hidden">
        <h3 className="shrink-0 font-bold text-indigo-300 pb-2 mb-2 border-b border-slate-700 uppercase tracking-wider">Leaderboard</h3>
        <div className="overflow-y-auto pr-2">
          {leaderboard.map((p, index) => {
              const isStealable = p.id !== 1 && p.lastStackedCard && !p.isShielded;
              return (
                <div 
                  key={p.id} 
                  className={cx(
                    "flex justify-between items-center p-3 bg-slate-700 rounded-lg border border-slate-600 transition-all mb-4",
                    isTargeting && isStealable && "cursor-pointer outline-2 outline-yellow-400 bg-yellow-500/20",
                    isTargeting && !isStealable && "opacity-50 cursor-not-allowed grayscale",
                    p.isShielded && "shadow-[0_0_15px_theme(colors.cyan.400)] relative",
                    p.id === 1 && "border-yellow-400" // Highlight player in leaderboard
                  )}
                  onClick={() => {
                    if (isTargeting && isStealable) {
                      handleConfirmSteal(p.id);
                    }
                  }}
                >
                  <span className="font-semibold text-slate-200">{index + 1}. {p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white font-slab">{p.stack}</span>
                    {p.lastStackedCard && <Card card={p.lastStackedCard} className="!w-7 !h-10" />}
                    {p.isShielded && <div className="absolute -top-1 -right-1 text-2xl [filter:drop-shadow(0_0_5px_theme(colors.cyan.400))]">🛡️</div>}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* --- Main Play Area (Center) --- */}
      <div className="relative w-full h-full">
        <div className="absolute top-1/2 left-1/2 w-full h-[90%] -translate-x-1/2 -translate-y-1/2 bg-green-800/80 [background-image:radial-gradient(ellipse_at_center,_#166534_0%,_#14532d_100%)] rounded-[125px] border-[12px] border-[#422006] shadow-[inset_0_0_25px_rgba(0,0,0,0.6),0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <img src={logoNormal} alt="Table Logo" className="w-[450px] h-auto opacity-20" />
            </div>
        </div>
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-4 z-50 p-4">
          <div className="w-full h-[250px] flex justify-center items-end relative">
              <div className="flex justify-center items-end -space-x-16">
                <AnimatePresence>
                  {gameState.player.hand.map((card) => (
                        <motion.div 
                          key={card.id} 
                          className="w-36 transition-transform duration-300 hover:-translate-y-5 hover:z-20"
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: (selectedCard && selectedCard.id === card.id) ? 1.1 : 1,
                              zIndex: (selectedCard && selectedCard.id === card.id) ? 10 : 1,
                          }}
                          exit={{ opacity: 0, scale: 0.5, y: 100 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Card 
                            card={card} 
                            isSelected={selectedCard && selectedCard.id === card.id}
                            onClick={() => handleCardClick(card)}
                          />
                        </motion.div>
                  ))}
                </AnimatePresence>
              </div>
          </div>
          <div className={cx("flex items-center gap-8 p-4 bg-slate-900/60 rounded-xl border-2 border-transparent transition-all", isPlayerTurn && "border-yellow-400 shadow-[0_0_20px_theme(colors.yellow.500)]")}>
            <div className="text-center">
                <p className="text-slate-300">Your Stack</p>
                <p className="text-7xl font-black text-white font-slab">{gameState.player.stack}</p>
            </div>
            <div className="flex flex-col gap-3 w-48">
              <GameButton onClick={handleStack} disabled={!canStack} variant="stack">Stack</GameButton>
              <GameButton onClick={handleInitiateSteal} disabled={!isCardSelected} variant="steal">Steal</GameButton>
              <GameButton onClick={handlePlayShield} disabled={!canPlayShield} variant="shield">Play Shield</GameButton>
            </div>
          </div>
        </div>
      </div>

      {/* --- Log Sidebar (Right) --- */}
      <div className="flex flex-col gap-6 bg-slate-800/50 border border-white/10 backdrop-blur-lg rounded-2xl p-6 overflow-hidden">
        <div className="shrink-0 text-center p-4 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-red-400 rounded-xl">
            <h3 className="font-bold text-yellow-400 mb-2 uppercase tracking-wider">Power Card</h3>
            <p className="text-6xl font-black text-yellow-300 [text-shadow:0_0_15px_theme(colors.amber.500)]">{gameState.powerCard}</p>
            <p className="text-lg font-semibold text-yellow-400">+5 Bonus Stack</p>
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
          <h3 className="shrink-0 font-bold text-indigo-300 pb-2 mb-2 border-b border-slate-700 uppercase tracking-wider">Game Log</h3>
          <div className="overflow-y-auto pr-2 text-slate-300 text-sm">
              {gameState.log.map((entry, i) => <p key={i} className="mb-1">{entry}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InGameScreen;
