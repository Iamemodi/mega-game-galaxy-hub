
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function Blackjack() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [chips, setChips] = useState(1000);
  const [playerHand, setPlayerHand] = useState(0);
  const [dealerHand, setDealerHand] = useState(0);
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    // Initialize with random values for demo
    setPlayerHand(Math.floor(Math.random() * 10) + 10);
    setDealerHand(Math.floor(Math.random() * 6) + 7);
  };
  
  const hit = () => {
    const newCard = Math.floor(Math.random() * 10) + 1;
    const newTotal = playerHand + newCard;
    setPlayerHand(newTotal);
    
    if (newTotal > 21) {
      endGame("lose");
    }
  };
  
  const stand = () => {
    // Dealer draws until 17 or higher
    let dealerTotal = dealerHand;
    while (dealerTotal < 17) {
      dealerTotal += Math.floor(Math.random() * 10) + 1;
    }
    
    setDealerHand(dealerTotal);
    
    if (dealerTotal > 21 || dealerTotal < playerHand) {
      endGame("win");
    } else if (dealerTotal === playerHand) {
      endGame("tie");
    } else {
      endGame("lose");
    }
  };
  
  const endGame = (result: "win" | "lose" | "tie") => {
    setGameOver(true);
    
    if (result === "win") {
      setChips(chips + 100);
      saveScore("blackjack", chips + 100);
    } else if (result === "lose") {
      setChips(chips - 100);
      saveScore("blackjack", chips - 100);
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Blackjack</h1>
        {gameActive && <div className="text-xl">Chips: ${chips}</div>}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Play Blackjack against the dealer. Get as close to 21 as possible without going over!
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <div className="mb-6">
            <p className="text-lg">Your hand: {playerHand}</p>
            <p className="text-lg">Dealer's hand: {dealerHand}</p>
            <p className="text-xl mt-4">Your chips: ${chips}</p>
          </div>
          <Button
            onClick={startGame}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-green-800 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-white text-lg mb-2">Dealer's Hand:</h3>
              <div className="flex gap-2">
                <div className="bg-white rounded p-3 w-10 h-16 flex items-center justify-center text-xl">{dealerHand}</div>
                <div className="bg-white rounded p-3 w-10 h-16 flex items-center justify-center text-xl">?</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg mb-2">Your Hand: {playerHand}</h3>
              <div className="flex gap-2">
                <div className="bg-white rounded p-3 w-10 h-16 flex items-center justify-center text-xl">{Math.floor(playerHand/2)}</div>
                <div className="bg-white rounded p-3 w-10 h-16 flex items-center justify-center text-xl">{Math.ceil(playerHand/2)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={hit}
              className="flex-1 bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
            >
              Hit
            </Button>
            <Button 
              onClick={stand}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Stand
            </Button>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
