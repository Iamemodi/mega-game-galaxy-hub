
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function Sudoku() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setGameActive(true);
    setGameOver(false);
    setDifficulty(selectedDifficulty);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sudoku</h1>
        {gameActive && <div className="text-xl">Difficulty: {difficulty}</div>}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Fill the grid with numbers so that each row, column, and 3×3 section contains all digits from 1 to 9.
          </p>
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
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Puzzle Complete!</h2>
          <p className="text-xl mb-6">Congratulations!</p>
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
            Sudoku game goes here!<br />
            Coming soon...
          </p>
        </div>
      )}

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
