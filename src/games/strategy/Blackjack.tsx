
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

type Card = {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
};

type GameState = 'betting' | 'playing' | 'dealer' | 'finished';

export function Blackjack() {
  const [gameActive, setGameActive] = useState(false);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [chips, setChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [message, setMessage] = useState('');
  
  // Create deck
  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        const numValue = value === 'A' ? 11 : ['J', 'Q', 'K'].includes(value) ? 10 : parseInt(value);
        deck.push({ suit, value, numValue });
      }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };
  
  // Calculate hand value
  const calculateHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else {
        value += card.numValue;
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };
  
  // Deal card
  const dealCard = (currentDeck: Card[]): { card: Card; newDeck: Card[] } => {
    const newDeck = [...currentDeck];
    const card = newDeck.pop()!;
    return { card, newDeck };
  };
  
  // Start new hand
  const startHand = () => {
    if (bet <= 0 || bet > chips) return;
    
    const newDeck = createDeck();
    let currentDeck = newDeck;
    
    // Deal initial cards
    const { card: playerCard1, newDeck: deck1 } = dealCard(currentDeck);
    const { card: dealerCard1, newDeck: deck2 } = dealCard(deck1);
    const { card: playerCard2, newDeck: deck3 } = dealCard(deck2);
    const { card: dealerCard2, newDeck: finalDeck } = dealCard(deck3);
    
    const newPlayerHand = [playerCard1, playerCard2];
    const newDealerHand = [dealerCard1, dealerCard2];
    
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(finalDeck);
    
    const playerValue = calculateHandValue(newPlayerHand);
    const dealerValue = calculateHandValue(newDealerHand);
    
    // Check for blackjack
    if (playerValue === 21) {
      if (dealerValue === 21) {
        endHand('push');
      } else {
        endHand('blackjack');
      }
    } else {
      setGameState('playing');
      setMessage('Hit or Stand?');
    }
  };
  
  // Player hits
  const hit = () => {
    const { card, newDeck } = dealCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);
    
    const value = calculateHandValue(newHand);
    if (value > 21) {
      endHand('bust');
    } else if (value === 21) {
      stand();
    }
  };
  
  // Player stands
  const stand = () => {
    setGameState('dealer');
    dealerPlay();
  };
  
  // Dealer plays
  const dealerPlay = () => {
    let currentHand = [...dealerHand];
    let currentDeck = [...deck];
    
    const dealerInterval = setInterval(() => {
      const dealerValue = calculateHandValue(currentHand);
      
      if (dealerValue < 17) {
        const { card, newDeck } = dealCard(currentDeck);
        currentHand = [...currentHand, card];
        currentDeck = newDeck;
        setDealerHand([...currentHand]);
        setDeck([...currentDeck]);
      } else {
        clearInterval(dealerInterval);
        
        const finalDealerValue = calculateHandValue(currentHand);
        const playerValue = calculateHandValue(playerHand);
        
        if (finalDealerValue > 21) {
          endHand('dealer-bust');
        } else if (finalDealerValue > playerValue) {
          endHand('dealer-wins');
        } else if (finalDealerValue < playerValue) {
          endHand('player-wins');
        } else {
          endHand('push');
        }
      }
    }, 1000);
  };
  
  // End hand
  const endHand = (result: string) => {
    setGameState('finished');
    let newChips = chips;
    
    switch (result) {
      case 'blackjack':
        newChips += Math.floor(bet * 1.5);
        setMessage('Blackjack! You win!');
        break;
      case 'player-wins':
      case 'dealer-bust':
        newChips += bet;
        setMessage('You win!');
        break;
      case 'dealer-wins':
      case 'bust':
        newChips -= bet;
        setMessage('You lose!');
        break;
      case 'push':
        setMessage('Push! It\'s a tie!');
        break;
    }
    
    setChips(newChips);
    saveScore("blackjack", newChips);
    
    setTimeout(() => {
      setGameState('betting');
      setPlayerHand([]);
      setDealerHand([]);
      setBet(0);
      setMessage('');
    }, 3000);
  };
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameState('betting');
    setChips(1000);
    setBet(0);
    setMessage('Place your bet!');
  };
  
  // Render card
  const renderCard = (card: Card, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-900 border-2 border-white rounded-lg flex items-center justify-center">
          <div className="text-white text-2xl">?</div>
        </div>
      );
    }
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className={`w-16 h-24 bg-white border-2 border-gray-400 rounded-lg flex flex-col justify-between p-1 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-xs font-bold">{card.value}</div>
        <div className="text-2xl text-center">{card.suit}</div>
        <div className="text-xs font-bold transform rotate-180 self-end">{card.value}</div>
      </div>
    );
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-green-800 to-green-900">
      <motion.div 
        className="w-full max-w-2xl p-6 bg-green-700 rounded-2xl shadow-xl border-4 border-yellow-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white">Blackjack</h1>
          {gameActive && <div className="text-xl text-yellow-300">Chips: ${chips}</div>}
        </div>

        {!gameActive ? (
          <div className="text-center max-w-md mx-auto">
            <p className="mb-6 text-white">
              Play Blackjack against the dealer. Get as close to 21 as possible without going over!
            </p>
            <Button 
              onClick={startGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg"
            >
              Start Game
            </Button>
          </div>
        ) : (
          <div>
            {/* Dealer's Hand */}
            <div className="mb-8">
              <h3 className="text-white text-lg mb-2">Dealer's Hand</h3>
              <div className="flex gap-2 mb-2">
                {dealerHand.map((card, index) => (
                  <div key={index}>
                    {renderCard(card, gameState === 'playing' && index === 1)}
                  </div>
                ))}
              </div>
              {gameState !== 'playing' && (
                <div className="text-white">
                  Value: {calculateHandValue(dealerHand)}
                </div>
              )}
            </div>
            
            {/* Player's Hand */}
            <div className="mb-8">
              <h3 className="text-white text-lg mb-2">Your Hand</h3>
              <div className="flex gap-2 mb-2">
                {playerHand.map((card, index) => (
                  <div key={index}>
                    {renderCard(card)}
                  </div>
                ))}
              </div>
              {playerHand.length > 0 && (
                <div className="text-white">
                  Value: {calculateHandValue(playerHand)}
                </div>
              )}
            </div>
            
            {/* Game Controls */}
            <div className="text-center">
              {gameState === 'betting' && (
                <div className="space-y-4">
                  <div className="text-white text-lg">Place your bet:</div>
                  <div className="flex gap-2 justify-center">
                    {[10, 25, 50, 100].map(amount => (
                      <Button
                        key={amount}
                        onClick={() => setBet(amount)}
                        className={`px-4 py-2 rounded ${bet === amount ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
                        disabled={amount > chips}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="text-white">Current bet: ${bet}</div>
                  <Button
                    onClick={startHand}
                    disabled={bet <= 0 || bet > chips}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Deal Cards
                  </Button>
                </div>
              )}
              
              {gameState === 'playing' && (
                <div className="space-y-4">
                  <div className="text-white text-lg">{message}</div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={hit}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
                    >
                      Hit
                    </Button>
                    <Button
                      onClick={stand}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
                    >
                      Stand
                    </Button>
                  </div>
                </div>
              )}
              
              {gameState === 'dealer' && (
                <div className="text-white text-lg">
                  Dealer is playing...
                </div>
              )}
              
              {gameState === 'finished' && (
                <div className="text-white text-xl">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <GameControls onRestart={startGame} />
    </div>
  );
}
