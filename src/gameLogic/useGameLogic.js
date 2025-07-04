import { useReducer, useEffect } from 'react';

// --- Game Constants ---
const WINNING_SCORE = 33;
const HAND_SIZE = 4;
const TURN_DURATION = 10;

const initialState = {
    deck: [],
    player: null,
    opponents: [],
    turnOrder: [],
    currentPlayerIndex: 0,
    turnTimer: TURN_DURATION,
    powerCard: null,
    playedCards: [],
    isTargeting: false,
    selectedCard: null,
    gameMessage: "Game starting...",
    isPlayerActionTaken: false, // Prevents multiple actions per turn
};

// --- Game Logic Functions ---
const getCardValue = (card) => {
    if (!card) return 0;
    const rank = card.rank;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    if (rank === 'A') return 1;
    return typeof rank === 'number' ? rank : 0;
};

const createDeck = () => {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    let deck = [];
    let idCounter = 0;
    for (let i = 0; i < 2; i++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ 
                    id: idCounter++, 
                    suit, 
                    rank,
                    code: `${rank === 10 ? '0' : rank}${suit}` 
                });
            }
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

// --- REDUCER: Manages all game state changes ---
function gameReducer(state, action) {
    switch (action.type) {
        case 'SETUP_GAME': {
            const deck = createDeck();
            const { playerAvatar, playerName, numPlayers } = action.payload;

            const createPlayer = (name, id, avatar) => ({
                id, name, avatar, wins: 0, stack: 0,
                hand: deck.splice(0, HAND_SIZE),
                lastStackedCard: null,
            });

            const player = createPlayer(playerName || 'You', 'player', playerAvatar);
            const opponents = Array.from({ length: numPlayers - 1 }, (_, i) => 
                createPlayer(`Bot ${i + 1}`, `bot_${i}`, `https://placehold.co/100x100/EEE/31343C?text=B${i+1}`)
            );

            const turnOrder = [player.id, ...opponents.map(o => o.id)];

            return {
                ...initialState, deck, player, opponents, turnOrder,
                powerCard: Math.floor(Math.random() * 9) + 2,
                gameMessage: `It's your turn, ${player.name}!`,
            };
        }

        case 'SELECT_CARD': {
            if (state.turnOrder[state.currentPlayerIndex] !== 'player') return state;
            return {
                ...state,
                selectedCard: state.selectedCard?.id === action.payload.id ? null : action.payload,
                isTargeting: false,
            };
        }

        case 'STACK_CARD': {
            if (!state.selectedCard) return state;

            let value = getCardValue(state.selectedCard);
            let message = `You stacked a ${state.selectedCard.rank}.`;
            if (state.selectedCard.rank === state.powerCard) {
                value += 5;
                message = `You stacked a POWER CARD ${state.selectedCard.rank} for a +5 bonus!`;
            }

            const newStack = state.player.stack + value;
            let newLastStackedCard = state.selectedCard;
            let finalStack = newStack;

            if (newStack > WINNING_SCORE) {
                finalStack = 0;
                newLastStackedCard = null;
                message = `You went bust! Your stack is reset.`;
            }

            const newHand = state.player.hand.filter(c => c.id !== state.selectedCard.id);
            const newDeck = [...state.deck];
            if (newDeck.length > 0) newHand.push(newDeck.pop());

            return {
                ...state,
                deck: newDeck,
                player: { ...state.player, hand: newHand, stack: finalStack, lastStackedCard: newLastStackedCard },
                playedCards: [...state.playedCards, state.selectedCard],
                gameMessage: message,
                selectedCard: null,
                isPlayerActionTaken: true, // Mark action as taken
            };
        }
        
        case 'INITIATE_STEAL': {
             if (state.turnOrder[state.currentPlayerIndex] !== 'player') return state;
             return { ...state, isTargeting: true, gameMessage: "Select an opponent to steal from." };
        }

        case 'STEAL_CARD': {
            const targetId = action.payload;
            const target = state.opponents.find(o => o.id === targetId);
            if (!target || !target.lastStackedCard) return state;
            
            const stolenValue = getCardValue(target.lastStackedCard);
            const newStack = state.player.stack + stolenValue;
            let message;
            let finalStack = state.player.stack;

            if (newStack > WINNING_SCORE) {
                message = `Stealing the ${target.lastStackedCard.rank} would make you bust! Steal failed.`;
            } else {
                finalStack = newStack;
                message = `You stole a ${target.lastStackedCard.rank} from ${target.name}!`;
            }

            const updatedOpponents = state.opponents.map(opp => {
                if (opp.id === targetId && newStack <= WINNING_SCORE) {
                    return { ...opp, stack: opp.stack - stolenValue, lastStackedCard: null };
                }
                return opp;
            });
            
            return {
                ...state,
                player: { ...state.player, stack: finalStack },
                opponents: updatedOpponents,
                gameMessage: message,
                selectedCard: null,
                isTargeting: false,
                isPlayerActionTaken: true, // Mark action as taken
            };
        }
        
        case 'BOT_ACTION': {
            const botId = action.payload;
            let bot = state.opponents.find(o => o.id === botId);
            if (!bot) return state;

            let currentBot = { ...bot };
            let player = { ...state.player };
            let opponents = [...state.opponents];
            let playedCards = [...state.playedCards];
            let message = "";

            const allTargets = [player, ...opponents.filter(o => o.id !== bot.id)];
            let bestSteal = { target: null, value: 0, card: null };
            for (const opponent of allTargets) {
                if (opponent.lastStackedCard) {
                    const potentialStealValue = getCardValue(opponent.lastStackedCard);
                    if (potentialStealValue > bestSteal.value && currentBot.stack + potentialStealValue <= WINNING_SCORE) {
                        bestSteal = { target: opponent, value: potentialStealValue, card: opponent.lastStackedCard };
                    }
                }
            }

            const bestCardToStack = currentBot.hand
                .filter(c => getCardValue(c) > 0)
                .sort((a, b) => getCardValue(b) - getCardValue(a))
                .find(c => currentBot.stack + getCardValue(c) <= WINNING_SCORE);
            const stackValue = bestCardToStack ? getCardValue(bestCardToStack) : 0;

            if (bestSteal.value > stackValue) {
                currentBot.stack += bestSteal.value;
                message = `${currentBot.name} stole a ${bestSteal.card.rank} from ${bestSteal.target.name}!`;
                if (bestSteal.target.id === 'player') {
                    player = { ...player, stack: player.stack - bestSteal.value, lastStackedCard: null };
                } else {
                    opponents = opponents.map(o => o.id === bestSteal.target.id ? { ...o, stack: o.stack - bestSteal.value, lastStackedCard: null } : o);
                }
            } else if (bestCardToStack) {
                let value = getCardValue(bestCardToStack);
                message = `${currentBot.name} stacked a ${bestCardToStack.rank}.`;
                if (bestCardToStack.rank === state.powerCard) {
                    value += 5;
                    message = `${currentBot.name} stacked a POWER CARD ${bestCardToStack.rank}!`;
                }
                currentBot.stack += value;
                currentBot.lastStackedCard = bestCardToStack;
                currentBot.hand = currentBot.hand.filter(c => c.id !== bestCardToStack.id);
                playedCards.push(bestCardToStack);
            } else if (currentBot.hand.length > 0) {
                const cardToDiscard = currentBot.hand.sort((a,b) => getCardValue(a) - getCardValue(b))[0];
                currentBot.hand = currentBot.hand.filter(c => c.id !== cardToDiscard.id);
                currentBot.stack = 0;
                currentBot.lastStackedCard = null;
                message = `${currentBot.name} couldn't make a move and went bust!`;
            }

            if (currentBot.hand.length < HAND_SIZE && state.deck.length > 0) {
                currentBot.hand.push(state.deck.pop());
            }
            
            return {
                ...state,
                player,
                opponents: opponents.map(o => o.id === botId ? currentBot : o),
                playedCards,
                gameMessage: message,
            };
        }

        case 'NEXT_TURN': {
            const nextIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
            const nextPlayerId = state.turnOrder[nextIndex];
            const nextPlayer = nextPlayerId === 'player' ? state.player : state.opponents.find(o => o.id === nextPlayerId);
            
            return {
                ...state,
                currentPlayerIndex: nextIndex,
                turnTimer: TURN_DURATION,
                isTargeting: false,
                selectedCard: null,
                gameMessage: `It's ${nextPlayer.name}'s turn!`,
                powerCard: nextIndex === 0 ? Math.floor(Math.random() * 9) + 2 : state.powerCard,
                isPlayerActionTaken: false, // Reset for the new turn
            };
        }

        case 'DECREMENT_TIMER': {
            if (state.turnTimer > 0) {
                return { ...state, turnTimer: state.turnTimer - 1 };
            }
            return state;
        }
        
        default:
            return state;
    }
}

// --- Custom Hook ---
export const useGameLogic = ({ onGameEnd, playerAvatar, playerName, gameConfig }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        dispatch({ type: 'SETUP_GAME', payload: { playerAvatar, playerName, ...gameConfig } });
    }, [playerAvatar, playerName, gameConfig]);

    useEffect(() => {
        if (!state.player) return;

        const allPlayers = [state.player, ...state.opponents];
        const winner = allPlayers.find(p => p && p.stack === WINNING_SCORE);
        if (winner) {
            onGameEnd(winner);
            return;
        }

        const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
        
        if (currentPlayerId !== 'player') {
            const botTimer = setTimeout(() => {
                dispatch({ type: 'BOT_ACTION', payload: currentPlayerId });
                setTimeout(() => dispatch({ type: 'NEXT_TURN' }), 1000);
            }, 1500);
            return () => clearTimeout(botTimer);
        }

        // If player has taken an action, move to the next turn
        if (state.isPlayerActionTaken) {
            const nextTurnTimer = setTimeout(() => {
                dispatch({ type: 'NEXT_TURN' });
            }, 500);
            return () => clearTimeout(nextTurnTimer);
        }

        // Otherwise, run the countdown timer
        const interval = setInterval(() => {
            dispatch({ type: 'DECREMENT_TIMER' });
        }, 1000);

        if (state.turnTimer <= 0) {
            dispatch({ type: 'NEXT_TURN' });
        }

        return () => clearInterval(interval);

    }, [state.currentPlayerIndex, state.turnTimer, state.player, state.isPlayerActionTaken, onGameEnd]);

    return { state, dispatch };
};
