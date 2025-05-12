
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function MineHunter() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [cellsRevealed, setCellsRevealed] = useState(0);
  
  const getMineCount = () => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 35;
      default: return 10;
    }
  };
  
  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setGameActive(true);
    setGameOver(false);
    setDifficulty(selectedDifficulty);
    setFlagsPlaced(0);
    setCellsRevealed(0);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Mine Hunter</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Mines: {getMineCount() - flagsPlaced}</div>
            <div className="text-xl">Revealed: {cellsRevealed}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Find all mines on the field without detonating any of them. Use flag markers to identify potential mines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => startGame('easy')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Easy (9x9, 10 mines)
            </Button>
            <Button 
              onClick={() => startGame('medium')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Medium (16x16, 40 mines)
            </Button>
            <Button 
              onClick={() => startGame('hard')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Hard (16x30, 99 mines)
            </Button>
          </div>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">You revealed {cellsRevealed} cells.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => startGame('easy')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Easy
            </Button>
            <Button 
              onClick={() => startGame('medium')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Medium
            </Button>
            <Button 
              onClick={() => startGame('hard')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Hard
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground text-center p-4">
            Mine Hunter game goes here!<br />
            Coming soon...
          </p>
        </div>
      )}

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
