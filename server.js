// server.js
import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { nanoid } from 'nanoid';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;
const gameRooms = {};

// --- Game Logic & State Management ---
const WINNING_SCORE = 33;
const HAND_SIZE = 4;
const TURN_DURATION = 10;

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
                deck.push({ id: idCounter++, suit, rank, code: `${rank === 10 ? '0' : rank}${suit}` });
            }
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

// --- Main Game Loop Function ---
const advanceTurn = (roomId) => {
    const room = gameRooms[roomId];
    if (!room || !room.gameState) return;

    let { gameState } = room;

    // Move to the next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.turnOrder.length;
    
    // Reset timer and other turn-specific state
    gameState.turnTimer = TURN_DURATION;
    const nextPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
    const nextPlayer = gameState.players.find(p => p.id === nextPlayerId);
    gameState.gameMessage = `It's ${nextPlayer.playerName}'s turn.`;
    
    // If it's the start of a new round (player 1's turn), get a new power card
    if (gameState.currentPlayerIndex === 0) {
        gameState.powerCard = Math.floor(Math.random() * 9) + 2;
    }

    io.to(roomId).emit('gameStateUpdate', gameState);
};


// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('createGame', ({ playerInfo, gameConfig }) => {
        const roomId = nanoid(6);
        socket.join(roomId);
        gameRooms[roomId] = {
            roomId,
            players: [{ ...playerInfo, id: socket.id, wins: 0, stack: 0, lastStackedCard: null }],
            gameConfig,
            gameState: null,
            turnTimeout: null, // To manage the turn timer
        };
        socket.emit('gameCreated', { roomId, players: gameRooms[roomId].players, gameConfig });
    });

    socket.on('joinGame', ({ roomId, playerInfo }) => {
        const room = gameRooms[roomId];
        if (room && room.players.length < room.gameConfig.numPlayers) {
            socket.join(roomId);
            room.players.push({ ...playerInfo, id: socket.id, wins: 0, stack: 0, lastStackedCard: null });
            io.to(roomId).emit('playerJoined', { players: room.players });
        } else {
            socket.emit('error', { message: "Room not found or is full." });
        }
    });

    socket.on('startGame', ({ roomId }) => {
        const room = gameRooms[roomId];
        if (room && room.players[0].id === socket.id) {
            const deck = createDeck();
            const playersWithHands = room.players.map(p => ({ ...p, hand: deck.splice(0, HAND_SIZE) }));
            const turnOrder = playersWithHands.map(p => p.id);

            room.gameState = {
                roomId, // Include roomId in gameState for convenience
                deck,
                players: playersWithHands,
                turnOrder,
                currentPlayerIndex: 0,
                powerCard: Math.floor(Math.random() * 9) + 2,
                playedCards: [],
                gameMessage: `Game started! It's ${playersWithHands[0].playerName}'s turn.`,
            };
            io.to(roomId).emit('gameStarted', room.gameState);
        }
    });

    socket.on('playerAction', (action) => {
        const { roomId } = action;
        const room = gameRooms[roomId];
        if (!room || !room.gameState) return;

        let { gameState } = room;
        const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];

        if (socket.id !== currentPlayerId) return;

        // Process Action
        let player = gameState.players.find(p => p.id === socket.id);
        
        if (action.type === 'STACK_CARD') {
            const cardToStack = player.hand.find(c => c.id === action.payload.card.id);
            if (!cardToStack) return;

            let value = getCardValue(cardToStack);
            if (cardToStack.rank === gameState.powerCard) value += 5;

            if (player.stack + value > WINNING_SCORE) {
                player.stack = 0;
                player.lastStackedCard = null;
            } else {
                player.stack += value;
                player.lastStackedCard = cardToStack;
            }
            player.hand = player.hand.filter(c => c.id !== cardToStack.id);
            gameState.playedCards.push(cardToStack);
        } else if (action.type === 'STEAL_CARD') {
            const target = gameState.players.find(p => p.id === action.payload.targetId);
            if (!target || !target.lastStackedCard) return;

            const stolenValue = getCardValue(target.lastStackedCard);
            if (player.stack + stolenValue <= WINNING_SCORE) {
                player.stack += stolenValue;
                target.stack -= stolenValue;
                target.lastStackedCard = null;
            }
        }
        
        if (gameState.deck.length > 0) {
            player.hand.push(gameState.deck.pop());
        }

        // Advance to the next turn
        advanceTurn(roomId);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // ... (disconnection logic)
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
