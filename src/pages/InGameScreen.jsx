// src/pages/InGameScreen.jsx

import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import Card from '../components/Card'; // individual card UI
import PlayerZone from '../components/PlayerZone'; // one zone around the table
import GameLog from '../components/GameLog';
import DeckDisplay from '../components/DeckDisplay';

import { generateShuffledDeck, drawCards, getPowerCard } from '../lib/gameUtils';

const BOT_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Zeta', 'Omega', 'Sigma'];

const InGameScreen = ({ onGameOver, mode = 'play' }) => {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0); // index of active player
  const [powerCard, setPowerCard] = useState(null);
  const [log, setLog] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [turnCount, setTurnCount] = useState(0); // for powerCard updates

  const isHumanTurn = currentPlayer === 0;

  // Initialize game
  useEffect(() => {
    const newDeck = generateShuffledDeck();
    const initialPlayers = [
      {
        id: 'human',
        name: 'You',
        hand: drawCards(newDeck, 4),
        stack: [],
        shielded: false,
      },
      ...BOT_NAMES.map((bot, i) => ({
        id: `bot-${i + 1}`,
        name: bot,
        hand: drawCards(newDeck, 4),
        stack: [],
        shielded: false,
      })),
    ];

    setDeck(newDeck);
    setPlayers(initialPlayers);
    setPowerCard(getPowerCard());
    setCurrentPlayer(0);
    setLog([{ text: 'Game started. Your turn!', type: 'info' }]);
  }, []);

  // Handle bot turns
  useEffect(() => {
    if (!players.length || isHumanTurn) return;

    const bot = players[currentPlayer];

    const timeout = setTimeout(() => {
      const result = simulateBotTurn(bot, players, deck, powerCard);
      setLog((prev) => [...prev, { text: result.message, type: 'bot' }]);
      setPlayers(result.updatedPlayers);
      setDeck(result.updatedDeck);

      const winner = checkForWinner(result.updatedPlayers);
      if (winner) {
        onGameOver(winner.name);
      } else {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
        if ((turnCount + 1) % players.length === 0) {
          setPowerCard(getPowerCard());
        }
        setTurnCount((prev) => prev + 1);
      }
    }, 1300);

    return () => clearTimeout(timeout);
  }, [currentPlayer]);

  const handleAction = (actionType) => {
    // TODO: implement human move (stack/steal/shield/rogue)
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen pt-4 pb-20">
      <div className="text-center text-3xl font-bold text-green-300 mb-2">Stack: {players[0]?.stack.reduce((acc, c) => acc + c.value, 0) || 0}</div>

      {/* Top bot rows */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {players.slice(1, 4).map((bot, i) => (
          <PlayerZone key={bot.id} player={bot} isActive={currentPlayer === i + 1} />
        ))}
      </div>

      {/* Game Table Center */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center p-4 border-4 border-green-700 bg-green-950 rounded-3xl shadow-lg relative">
        <DeckDisplay deckCount={deck.length} />
        <div className="text-sm text-green-400 mt-2">Power Card: {powerCard}</div>
        <GameLog entries={log.slice(-6)} />
      </div>

      {/* Bottom bots */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {players.slice(4).map((bot, i) => (
          <PlayerZone key={bot.id} player={bot} isActive={currentPlayer === i + 4} />
        ))}
      </div>

      {/* Human Hand + Actions */}
      <div className="fixed bottom-4 w-full max-w-5xl px-6 flex flex-col items-center space-y-3">
        <div className="flex justify-center space-x-2">
          {players[0]?.hand.map((card, i) => (
            <Card
              key={i}
              card={card}
              selected={selectedCard === card}
              onClick={() => handleSelectCard(card)}
              disabled={!isHumanTurn}
            />
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={() => handleAction('stack')} disabled={!selectedCard}>Stack</Button>
          <Button onClick={() => handleAction('steal')} disabled={!selectedCard}>Steal</Button>
          <Button onClick={() => handleAction('shield')} disabled={!selectedCard?.type === 'SHIELD'}>Play Shield</Button>
          <Button onClick={() => handleAction('rogue')} disabled={!selectedCard?.type === 'ROGUE'}>Play Rogue</Button>
        </div>
      </div>
    </div>
  );
};

export default InGameScreen;
