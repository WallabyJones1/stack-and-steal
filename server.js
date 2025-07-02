// --- Basic Server Setup (Using ES Module Syntax) ---
import express from 'express';
import http from 'http';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Allow our React app (running on a different port) to connect
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's address
    methods: ["GET", "POST"]
  }
});

const PORT = 3001; // We'll run our server on a different port

// --- Game State Management (In Memory) ---
// In a real production app, you might use a database like Redis here.
const games = {};

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Event handler for when a player wants to create a new game
  socket.on('createGame', () => {
    const gameId = `game_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`New game created with ID: ${gameId}`);
    
    // Store the game state (for now, just an empty object)
    games[gameId] = {
      id: gameId,
      players: {},
      // ... all other game state would go here
    };

    socket.join(gameId); // The creator automatically joins the room
    socket.emit('gameCreated', gameId); // Send the new ID back to the creator
  });

  // Event handler for when a player wants to join a game
  socket.on('joinGame', (gameId) => {
    if (games[gameId]) {
      console.log(`Player ${socket.id} joining game ${gameId}`);
      socket.join(gameId);
      // Here you would add the player to the game state and broadcast the update
      socket.emit('joinedGame', gameId); // Confirm to the player they joined
      io.to(gameId).emit('playerJoined', socket.id); // Tell others a player joined
    } else {
      socket.emit('error', 'Game not found');
    }
  });

  // Event handler for when a player disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Here you would handle removing the player from any game they were in
  });
});


// --- Start the Server ---
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
