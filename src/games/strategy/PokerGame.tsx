
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function PokerGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [chips, setChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setChips(1000);
    setCurrentBet(0);
  };
  
  const placeBet = (amount: number) => {
    if (chips >= amount) {
      setCurrentBet(prev => prev + amount);
      setChips(prev => prev - amount);
    }
  };
  
  const resetBet = () => {
    setChips(prev => prev + currentBet);
    setCurrentBet(0);
  };
  
  const endGame = (result: "win" | "lose") => {
    setGameOver(true);
    
    if (result === "win") {
      setChips(chips + currentBet * 2);
      saveScore("poker-game", chips + currentBet * 2);
    } else {
      saveScore("poker-game", chips);
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Poker</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Chips: ${chips}</div>
            <div className="text-xl">Bet: ${currentBet}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Play Texas Hold'em poker against AI opponents. Place your bets, manage your chip stack, and win big!
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
          <p className="text-xl mb-6">Your final chips: ${chips}</p>
          <Button
            onClick={startGame}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-green-800 rounded-lg p-6 mb-6 min-h-[300px]">
            <p className="text-white text-center">Poker table will appear here</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Place Bet:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => placeBet(10)}
                disabled={chips < 10}
                className="bg-game-strategy hover:bg-game-strategy/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                $10
              </Button>
              <Button 
                onClick={() => placeBet(25)}
                disabled={chips < 25}
                className="bg-game-strategy hover:bg-game-strategy/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                $25
              </Button>
              <Button 
                onClick={() => placeBet(100)}
                disabled={chips < 100}
                className="bg-game-strategy hover:bg-game-strategy/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                $100
              </Button>
              <Button 
                onClick={resetBet}
                disabled={currentBet === 0}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                Reset Bet
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => endGame("win")}
              disabled={currentBet === 0}
              className="flex-1 bg-game-strategy hover:bg-game-strategy/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50"
            >
              Demo Win
            </Button>
            <Button 
              onClick={() => endGame("lose")}
              disabled={currentBet === 0}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
            >
              Demo Lose
            </Button>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
