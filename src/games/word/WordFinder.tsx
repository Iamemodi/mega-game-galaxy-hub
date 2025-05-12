
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function WordFinder() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(180);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Finder</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Time: {formatTime(timeLeft)}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Find as many words as possible in the letter grid. Words can be formed horizontally, vertically, or diagonally.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
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
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground text-center p-4">
            Word Finder game goes here!<br />
            Coming soon...
          </p>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
