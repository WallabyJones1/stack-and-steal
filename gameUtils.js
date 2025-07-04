// src/lib/gameUtils.js

// === CARD GENERATION ===

const numberLabels = ['2', '3', '4', '5', '6', '7', '8', '9'];
const faceLabels = ['10', 'J', 'Q', 'K'];
const specialCards = ['A', 'SHIELD', 'ROGUE'];

export function generateShuffledDeck() {
  let deck = [];

  // Add 4 of each number/face card
  for (let label of numberLabels) {
    for (let i = 0; i < 4; i++) {
      deck.push({ label, value: parseInt(label), type: 'NUMBER' });
    }
  }

  for (let label of faceLabels) {
    for (let i = 0; i < 4; i++) {
      deck.push({ label, value: 10, type: 'NUMBER' });
    }
  }

  // Add 4 Aces (value 11)
  for (let i = 0; i < 4; i++) {
    deck.push({ label: 'A', value: 11, type: 'NUMBER' });
  }

  // Add 6 SHIELD cards (value 0)
  for (let i = 0; i < 6; i++) {
    deck.push({ label: 'SHIELD', value: 0, type: 'SHIELD' });
  }

  // Add 6 ROGUE cards (value 13)
  for (let i = 0; i < 6; i++) {
    deck.push({ label: 'ROGUE', value: 13, type: 'ROGUE' });
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// === DRAWING CARDS ===

export function drawCards(deck, count) {
  const drawn = deck.slice(0, count);
  deck.splice(0, count);
  return drawn;
}

// === POWER CARD ===

export function getPowerCard() {
  const options = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  return options[Math.floor(Math.random() * options.length)];
}

// === WIN CHECK ===

export function checkForWinner(players) {
  return players.find((p) => {
    const total = p.stack.reduce((acc, c) => acc + c.value, 0);
    return total === 33;
  });
}

// === SIMPLE BOT LOGIC ===

export function simulateBotTurn(bot, allPlayers, deck, powerCard) {
  const myIndex = allPlayers.findIndex(p => p.id === bot.id);
  const myStack = bot.stack.reduce((acc, c) => acc + c.value, 0);

  // 1. Stack if under 30
  const stackable = bot.hand.find(c => c.type === 'NUMBER' && myStack + c.value <= 33);
  if (stackable) {
    bot.stack.push(stackable);
    bot.hand = bot.hand.filter(c => c !== stackable);
    if (stackable.value === powerCard) {
      bot.stack[bot.stack.length - 1].value += 5; // power card bonus
    }
    bot.hand.push(...drawCards(deck, 1));
    return {
      updatedPlayers: updatePlayer(bot, allPlayers),
      updatedDeck: deck,
      message: `${bot.name} stacked ${stackable.label}`,
    };
  }

  // 2. Play shield if available
  const shieldCard = bot.hand.find(c => c.type === 'SHIELD');
  if (shieldCard) {
    bot.shielded = true;
    bot.hand = bot.hand.filter(c => c !== shieldCard);
    bot.hand.push(...drawCards(deck, 1));
    return {
      updatedPlayers: updatePlayer(bot, allPlayers),
      updatedDeck: deck,
      message: `${bot.name} played a shield`,
    };
  }

  // 3. Try steal if possible
  const target = allPlayers.find((p, i) => i !== myIndex && p.stack.length > 0 && !p.shielded);
  const discardCard = bot.hand.find(c => c.type === 'NUMBER');
  if (target && discardCard) {
    const stolen = target.stack[target.stack.length - 1];
    const newTotal = myStack + stolen.value;
    if (newTotal <= 33) {
      target.stack.pop();
      bot.stack.push(stolen);
      bot.hand = bot.hand.filter(c => c !== discardCard);
      bot.hand.push(...drawCards(deck, 1));
      return {
        updatedPlayers: updateMultiple([bot, target], allPlayers),
        updatedDeck: deck,
        message: `${bot.name} stole ${stolen.label} from ${target.name}`,
      };
    }
  }

  // 4. Try Rogue if possible
  const rogue = bot.hand.find(c => c.type === 'ROGUE');
  if (target && rogue) {
    const stolen = target.stack[target.stack.length - 1];
    const newTotal = myStack + stolen.value;
    if (newTotal <= 33) {
      target.stack.pop();
      bot.stack.push(stolen);
      bot.hand = bot.hand.filter(c => c !== rogue);
      bot.hand.push(...drawCards(deck, 1));
      return {
        updatedPlayers: updateMultiple([bot, target], allPlayers),
        updatedDeck: deck,
        message: `${bot.name} played ROGUE and stole ${stolen.label} from ${target.name}`,
      };
    }
  }

  // 5. Pass turn
  return {
    updatedPlayers: updatePlayer(bot, allPlayers),
    updatedDeck: deck,
    message: `${bot.name} passed.`,
  };
}

// === HELPERS ===

function updatePlayer(updated, players) {
  return players.map(p => (p.id === updated.id ? updated : p));
}

function updateMultiple(updatedList, players) {
  const map = new Map(updatedList.map(p => [p.id, p]));
  return players.map(p => map.get(p.id) || p);
}
