
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

type CellState = 'hidden' | 'revealed' | 'flagged';
type Cell = {
  isMine: boolean;
  neighborMines: number;
  state: CellState;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

export function MineHunter() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagsLeft, setFlagsLeft] = useState(0);
  const [cellsRevealed, setCellsRevealed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  
  // Create empty grid
  const createEmptyGrid = (): Cell[][] => {
    return Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        neighborMines: 0,
        state: 'hidden' as CellState
      }))
    );
  };
  
  // Place mines randomly
  const placeMines = (grid: Cell[][], avoidRow: number, avoidCol: number): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;
    
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      // Don't place mine on first click or if already has mine
      if ((row === avoidRow && col === avoidCol) || newGrid[row][col].isMine) {
        continue;
      }
      
      newGrid[row][col].isMine = true;
      minesPlaced++;
    }
    
    // Calculate neighbor mines
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newGrid[row][col].isMine) {
          newGrid[row][col].neighborMines = countNeighborMines(newGrid, row, col);
        }
      }
    }
    
    return newGrid;
  };
  
  // Count mines around a cell
  const countNeighborMines = (grid: Cell[][], row: number, col: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          if (grid[newRow][newCol].isMine) count++;
        }
      }
    }
    return count;
  };
  
  // Start game
  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGrid(createEmptyGrid());
    setFlagsLeft(DIFFICULTIES[selectedDifficulty].mines);
    setCellsRevealed(0);
    setGameActive(true);
    setGameOver(false);
    setGameWon(false);
    setTimeElapsed(0);
    setFirstClick(true);
  };
  
  // Reveal cell and neighbors if empty
  const revealCell = (grid: Cell[][], row: number, col: number): { newGrid: Cell[][], revealed: number } => {
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    let revealedCount = 0;
    
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (newGrid[r][c].state !== 'hidden') return;
      
      newGrid[r][c].state = 'revealed';
      revealedCount++;
      
      // If no neighboring mines, reveal neighbors
      if (newGrid[r][c].neighborMines === 0 && !newGrid[r][c].isMine) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            reveal(r + i, c + j);
          }
        }
      }
    };
    
    reveal(row, col);
    return { newGrid, revealed: revealedCount };
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || grid[row][col].state !== 'hidden') return;
    
    let newGrid = [...grid];
    
    // Initialize mines on first click
    if (firstClick) {
      newGrid = placeMines(newGrid, row, col);
      setFirstClick(false);
    }
    
    // Check if clicked on mine
    if (newGrid[row][col].isMine) {
      // Game over - reveal all mines
      const gameOverGrid = newGrid.map(r => r.map(c => 
        c.isMine ? { ...c, state: 'revealed' as CellState } : c
      ));
      setGrid(gameOverGrid);
      setGameOver(true);
      return;
    }
    
    // Reveal cell and neighbors
    const { newGrid: revealedGrid, revealed } = revealCell(newGrid, row, col);
    setGrid(revealedGrid);
    
    const newCellsRevealed = cellsRevealed + revealed;
    setCellsRevealed(newCellsRevealed);
    
    // Check win condition
    const totalCells = rows * cols;
    if (newCellsRevealed === totalCells - mines) {
      setGameWon(true);
      setGameOver(true);
      const score = Math.max(0, 1000 - timeElapsed + flagsLeft * 10);
      saveScore("mine-hunter", score);
    }
  };
  
  // Handle right click (flag)
  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || grid[row][col].state === 'revealed') return;
    
    const newGrid = grid.map(r => [...r]);
    
    if (newGrid[row][col].state === 'hidden') {
      if (flagsLeft > 0) {
        newGrid[row][col].state = 'flagged';
        setFlagsLeft(flagsLeft - 1);
      }
    } else if (newGrid[row][col].state === 'flagged') {
      newGrid[row][col].state = 'hidden';
      setFlagsLeft(flagsLeft + 1);
    }
    
    setGrid(newGrid);
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && !gameOver && !firstClick) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive, gameOver, firstClick]);
  
  // Get cell display
  const getCellDisplay = (cell: Cell) => {
    if (cell.state === 'flagged') return '🚩';
    if (cell.state === 'hidden') return '';
    if (cell.isMine) return '💣';
    return cell.neighborMines > 0 ? cell.neighborMines.toString() : '';
  };
  
  // Get cell class
  const getCellClass = (cell: Cell) => {
    let baseClass = "w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold cursor-pointer select-none";
    
    if (cell.state === 'hidden' || cell.state === 'flagged') {
      baseClass += " bg-gray-300 hover:bg-gray-200";
    } else {
      baseClass += " bg-gray-100";
      if (cell.isMine) {
        baseClass += " bg-red-500";
      } else if (cell.neighborMines > 0) {
        const colors = ['', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 'text-yellow-600', 'text-pink-600', 'text-black', 'text-gray-600'];
        baseClass += ` ${colors[cell.neighborMines]}`;
      }
    }
    
    return baseClass;
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <motion.div 
        className="w-full max-w-4xl p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Mine Hunter</h1>
          {gameActive && (
            <div className="flex justify-center gap-6 text-lg">
              <div>🚩 {flagsLeft}</div>
              <div>⏱️ {timeElapsed}s</div>
              <div>📊 {cellsRevealed}/{rows * cols - mines}</div>
            </div>
          )}
        </div>

        {!gameActive ? (
          <div className="text-center max-w-md mx-auto">
            <p className="mb-6 text-gray-600">
              Find all mines on the field without detonating any of them. Right-click to flag suspected mines.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => startGame('easy')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Easy (9×9, 10 mines)
              </Button>
              <Button 
                onClick={() => startGame('medium')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Medium (16×16, 40 mines)
              </Button>
              <Button 
                onClick={() => startGame('hard')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Hard (16×30, 99 mines)
              </Button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center">
            <div className="text-6xl mb-4">{gameWon ? '🎉' : '💥'}</div>
            <h2 className="text-2xl font-bold mb-4">{gameWon ? 'All Mines Found!' : 'Mine Exploded!'}</h2>
            <p className="text-xl mb-6">
              Time: {timeElapsed}s | Revealed: {cellsRevealed} cells
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => startGame(difficulty)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
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
            <div 
              className="grid gap-0 border-2 border-gray-600 mb-4 overflow-auto max-w-full"
              style={{ 
                gridTemplateColumns: `repeat(${cols}, 32px)`,
                maxHeight: '70vh'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(cell)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                  >
                    {getCellDisplay(cell)}
                  </div>
                ))
              )}
            </div>
            
            <div className="text-sm text-gray-600 text-center">
              <p>Left-click to reveal • Right-click to flag</p>
              <p>Find all {mines} mines without clicking on them!</p>
            </div>
          </div>
        )}
      </motion.div>

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
