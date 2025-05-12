
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function JumpingNinja() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Jumping Ninja</h1>
        {gameActive && <div className="text-xl">Score: {score}</div>}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Help the ninja jump between platforms. Collect power-ups and avoid obstacles to reach the highest score.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={startGame}
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground text-center p-4">
            Jumping Ninja game goes here!<br />
            Coming soon...
          </p>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
