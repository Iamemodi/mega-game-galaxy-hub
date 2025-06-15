
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

type SudokuGrid = (number | null)[][];
type Difficulty = 'easy' | 'medium' | 'hard';

const SUDOKU_SIZE = 9;

export function Sudoku() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<SudokuGrid>([]);
  const [solution, setSolution] = useState<SudokuGrid>([]);
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Generate empty grid
  const createEmptyGrid = (): SudokuGrid => {
    return Array(SUDOKU_SIZE).fill(null).map(() => Array(SUDOKU_SIZE).fill(null));
  };
  
  // Check if number is valid in position
  const isValidMove = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < SUDOKU_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < SUDOKU_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    
    return true;
  };
  
  // Generate complete Sudoku solution
  const generateSolution = (): SudokuGrid => {
    const grid = createEmptyGrid();
    
    const fillGrid = (grid: SudokuGrid): boolean => {
      for (let row = 0; row < SUDOKU_SIZE; row++) {
        for (let col = 0; col < SUDOKU_SIZE; col++) {
          if (grid[row][col] === null) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            
            for (const num of numbers) {
              if (isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (fillGrid(grid)) {
                  return true;
                }
                
                grid[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    fillGrid(grid);
    return grid;
  };
  
  // Remove numbers to create puzzle
  const createPuzzle = (solution: SudokuGrid, difficulty: Difficulty): SudokuGrid => {
    const puzzle = solution.map(row => [...row]);
    
    const cellsToRemove = {
      easy: 40,
      medium: 50,
      hard: 60
    }[difficulty];
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * SUDOKU_SIZE);
      const col = Math.floor(Math.random() * SUDOKU_SIZE);
      
      if (puzzle[row][col] !== null) {
        puzzle[row][col] = null;
        removed++;
      }
    }
    
    return puzzle;
  };
  
  // Start game
  const startGame = (selectedDifficulty: Difficulty) => {
    const newSolution = generateSolution();
    const newPuzzle = createPuzzle(newSolution, selectedDifficulty);
    
    setSolution(newSolution);
    setGrid(newPuzzle);
    setInitialGrid(newPuzzle.map(row => [...row]));
    setDifficulty(selectedDifficulty);
    setGameActive(true);
    setGameOver(false);
    setSelectedCell(null);
    setMistakes(0);
    setTimeElapsed(0);
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] !== null) return; // Can't edit pre-filled cells
    setSelectedCell({ row, col });
  };
  
  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameOver) return;
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== null) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    
    // Check if it's correct
    if (solution[row][col] !== num) {
      setMistakes(mistakes + 1);
    }
    
    setGrid(newGrid);
    
    // Check if puzzle is complete
    const isComplete = newGrid.every(row => 
      row.every(cell => cell !== null)
    );
    
    if (isComplete) {
      setGameOver(true);
      const score = Math.max(0, 1000 - mistakes * 50 - Math.floor(timeElapsed / 10));
      saveScore("sudoku", score);
    }
  };
  
  // Clear cell
  const clearCell = () => {
    if (!selectedCell || gameOver) return;
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== null) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && !gameOver) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive, gameOver]);
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get cell class
  const getCellClass = (row: number, col: number) => {
    let baseClass = "w-10 h-10 border border-gray-400 flex items-center justify-center cursor-pointer text-lg font-semibold";
    
    // Initial cells are read-only
    if (initialGrid[row][col] !== null) {
      baseClass += " bg-gray-100 text-gray-800";
    } else {
      baseClass += " bg-white hover:bg-blue-50";
    }
    
    // Selected cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      baseClass += " bg-blue-200 ring-2 ring-blue-500";
    }
    
    // Thick borders for 3x3 sections
    if (row % 3 === 0 && row > 0) baseClass += " border-t-2 border-t-black";
    if (col % 3 === 0 && col > 0) baseClass += " border-l-2 border-l-black";
    if (row === 8) baseClass += " border-b-2 border-b-black";
    if (col === 8) baseClass += " border-r-2 border-r-black";
    
    return baseClass;
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        className="w-full max-w-2xl p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-indigo-900">Sudoku</h1>
          {gameActive && (
            <div className="flex justify-center gap-6 text-lg">
              <div>Time: {formatTime(timeElapsed)}</div>
              <div>Mistakes: {mistakes}</div>
              <div className="capitalize">{difficulty}</div>
            </div>
          )}
        </div>

        {!gameActive ? (
          <div className="text-center max-w-md mx-auto">
            <p className="mb-6 text-gray-600">
              Fill the grid with numbers so that each row, column, and 3×3 section contains all digits from 1 to 9.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => startGame('easy')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Easy (40 clues)
              </Button>
              <Button 
                onClick={() => startGame('medium')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Medium (30 clues)
              </Button>
              <Button 
                onClick={() => startGame('hard')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Hard (20 clues)
              </Button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Puzzle Complete!</h2>
            <p className="text-xl mb-6">
              Time: {formatTime(timeElapsed)} | Mistakes: {mistakes}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => startGame(difficulty)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold"
              >
                Play Again
              </Button>
              <Button 
                onClick={() => setGameActive(false)}
                variant="outline"
              >
                Change Difficulty
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Sudoku Grid */}
            <div className="grid grid-cols-9 gap-0 border-2 border-black mb-6">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell || ''}
                  </div>
                ))
              )}
            </div>
            
            {/* Number Input */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="w-10 h-10 p-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!selectedCell}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={clearCell}
              variant="outline"
              disabled={!selectedCell}
              className="mb-4"
            >
              Clear Cell
            </Button>
          </div>
        )}
      </motion.div>

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
