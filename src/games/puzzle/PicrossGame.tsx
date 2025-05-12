
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Types
type CellState = "empty" | "filled" | "marked";
type Hints = number[][];
type Grid = CellState[][];
type Level = {
  grid: boolean[][];
  name: string;
  difficulty: "easy" | "medium" | "hard";
};

// Sample puzzles (True represents filled cells)
const LEVELS: Level[] = [
  {
    name: "Heart",
    difficulty: "easy",
    grid: [
      [false, true, true, false, true, true, false],
      [true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true],
      [false, true, true, true, true, true, false],
      [false, false, true, true, true, false, false],
      [false, false, false, true, false, false, false],
    ],
  },
  {
    name: "Smiley Face",
    difficulty: "easy",
    grid: [
      [false, false, true, true, true, false, false],
      [false, true, false, false, false, true, false],
      [true, false, true, false, true, false, true],
      [true, false, false, false, false, false, true],
      [true, false, true, false, true, false, true],
      [false, true, false, true, false, true, false],
      [false, false, true, true, true, false, false],
    ],
  },
  {
    name: "Star",
    difficulty: "medium",
    grid: [
      [false, false, false, true, false, false, false],
      [false, false, true, true, true, false, false],
      [false, true, true, true, true, true, false],
      [true, true, true, true, true, true, true],
      [false, true, true, true, true, true, false],
      [false, false, true, true, true, false, false],
      [false, false, false, true, false, false, false],
    ],
  },
  {
    name: "Castle",
    difficulty: "medium",
    grid: [
      [false, true, false, true, false, true, false],
      [true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true],
      [false, true, false, true, false, true, false],
      [true, true, true, true, true, true, true],
    ],
  },
  {
    name: "Spaceship",
    difficulty: "hard",
    grid: [
      [false, false, false, true, false, false, false],
      [false, false, true, true, true, false, false],
      [false, true, false, true, false, true, false],
      [true, true, true, true, true, true, true],
      [true, false, true, true, true, false, true],
      [true, false, false, true, false, false, true],
      [false, true, true, false, true, true, false],
    ],
  },
];

// Calculate row and column hints for a puzzle
const calculateHints = (level: Level): { rowHints: number[][]; colHints: number[][] } => {
  const grid = level.grid;
  const size = grid.length;
  
  // Calculate row hints
  const rowHints = grid.map(row => {
    const hints: number[] = [];
    let count = 0;
    
    row.forEach((cell, i) => {
      if (cell) {
        count++;
      }
      
      if ((!cell || i === row.length - 1) && count > 0) {
        hints.push(count);
        count = 0;
      }
    });
    
    return hints.length ? hints : [0];
  });
  
  // Calculate column hints
  const colHints = Array(size).fill(null).map((_, colIndex) => {
    const hints: number[] = [];
    let count = 0;
    
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      const cell = grid[rowIndex][colIndex];
      
      if (cell) {
        count++;
      }
      
      if ((!cell || rowIndex === size - 1) && count > 0) {
        hints.push(count);
        count = 0;
      }
    }
    
    return hints.length ? hints : [0];
  });
  
  return { rowHints, colHints };
};

export function PicrossGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [rowHints, setRowHints] = useState<number[][]>([]);
  const [colHints, setColHints] = useState<number[][]>([]);
  const [showHint, setShowHint] = useState(false);
  
  // Initialize game
  const initializeGame = (levelIdx = 0) => {
    const level = LEVELS[levelIdx];
    const size = level.grid.length;
    
    // Create empty grid
    const emptyGrid: Grid = Array(size).fill(null)
      .map(() => Array(size).fill("empty"));
    
    // Calculate hints
    const { rowHints: rHints, colHints: cHints } = calculateHints(level);
    
    setGrid(emptyGrid);
    setRowHints(rHints);
    setColHints(cHints);
    setCurrentLevel(level);
    setLevelIndex(levelIdx);
    setGameOver(false);
    setScore(0);
    setTimer(0);
    setMistakes(0);
    setShowHint(false);
  };
  
  // Start game
  const startGame = () => {
    initializeGame(0);
    setGameActive(true);
    toast.success("Game started! Complete the puzzle by filling in the correct cells.");
  };
  
  // Handle click on cell
  const handleCellClick = (rowIndex: number, colIndex: number, rightClick = false) => {
    if (gameOver) return;
    
    // Make a copy of the grid
    const newGrid = [...grid.map(row => [...row])];
    
    if (rightClick) {
      // Right-click to mark/unmark
      newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === "marked" ? "empty" : "marked";
      setGrid(newGrid);
    } else {
      // Left-click to fill/unfill
      if (newGrid[rowIndex][colIndex] === "filled") {
        newGrid[rowIndex][colIndex] = "empty";
      } else if (newGrid[rowIndex][colIndex] === "empty") {
        newGrid[rowIndex][colIndex] = "filled";
        
        // Check if this move is correct
        const shouldBeFilled = currentLevel.grid[rowIndex][colIndex];
        
        if (!shouldBeFilled) {
          // Mistake
          setMistakes(prev => prev + 1);
          toast.error("Oops! That's not correct.");
        }
      }
      
      setGrid(newGrid);
      
      // Check if puzzle is solved
      checkPuzzleCompletion(newGrid);
    }
  };
  
  // Context menu handler (right-click)
  const handleContextMenu = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault();
    handleCellClick(rowIndex, colIndex, true);
  };
  
  // Check if puzzle is completed
  const checkPuzzleCompletion = (currentGrid: Grid) => {
    const size = currentLevel.grid.length;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const shouldBeFilled = currentLevel.grid[row][col];
        const isFilled = currentGrid[row][col] === "filled";
        
        if (shouldBeFilled !== isFilled) {
          // Puzzle not completed yet
          return;
        }
      }
    }
    
    // If we're here, the puzzle is completed
    onPuzzleComplete();
  };
  
  // Handle puzzle completion
  const onPuzzleComplete = () => {
    // Calculate score based on time, mistakes, and difficulty
    const timeFactor = Math.max(0, 300 - timer) / 3;
    const mistakesFactor = Math.max(0, 15 - mistakes) * 50;
    const difficultyMultiplier = 
      currentLevel.difficulty === "easy" ? 1 :
      currentLevel.difficulty === "medium" ? 1.5 : 2;
    
    const levelScore = Math.round((timeFactor + mistakesFactor) * difficultyMultiplier);
    
    // Update total score
    const newScore = score + levelScore;
    setScore(newScore);
    
    toast.success(`Level completed! +${levelScore} points`);
    
    // Check if there are more levels
    if (levelIndex < LEVELS.length - 1) {
      // Load next level
      setTimeout(() => {
        initializeGame(levelIndex + 1);
      }, 1500);
    } else {
      // Game completed
      setGameOver(true);
      saveScore("picross-game", newScore);
      toast.success("🎉 You've completed all puzzles!");
    }
  };
  
  // Toggle hint mode
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Reset current level
  const resetLevel = () => {
    initializeGame(levelIndex);
    toast.info("Level reset!");
  };
  
  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && !gameOver) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameActive, gameOver]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get CSS class for grid cell
  const getCellClass = (state: CellState, rowIndex: number, colIndex: number) => {
    let baseClass = "w-full h-full flex items-center justify-center transition-all duration-150";
    
    if (state === "filled") {
      baseClass += " bg-indigo-600";
    } else if (state === "marked") {
      baseClass += " bg-white";
    } else {
      baseClass += " bg-white hover:bg-indigo-100";
    }
    
    // Add border styles
    if (rowIndex % 5 === 0 && rowIndex > 0) {
      baseClass += " border-t-2 border-indigo-400";
    } else {
      baseClass += " border-t border-indigo-200";
    }
    
    if (colIndex % 5 === 0 && colIndex > 0) {
      baseClass += " border-l-2 border-indigo-400";
    } else {
      baseClass += " border-l border-indigo-200";
    }
    
    // Hint mode highlighting
    if (showHint && currentLevel.grid[rowIndex][colIndex]) {
      baseClass += " ring-2 ring-inset ring-pink-300 ring-opacity-60";
    }
    
    return baseClass;
  };

  return (
    <div className="game-container min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div 
        className="w-full max-w-4xl p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 text-indigo-900">Picross</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Fill in cells to create a pattern based on the number clues on each row and column.
          </p>
        </div>

        {!gameActive ? (
          <motion.div 
            className="text-center max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-8 p-6 bg-indigo-100 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-indigo-900">How to Play</h2>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Numbers on rows and columns indicate groups of filled cells</li>
                <li>• Left-click to fill a cell, left-click again to clear it</li>
                <li>• Right-click to mark a cell that you think should be empty</li>
                <li>• Complete the pattern by filling in all the correct cells</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-indigo-900">Puzzle Collection</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LEVELS.map((level, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-center font-medium ${
                      level.difficulty === "easy" 
                        ? "bg-green-100 text-green-800" 
                        : level.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {level.name}
                  </div>
                ))}
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md"
              >
                Start Game
              </Button>
            </motion.div>
          </motion.div>
        ) : gameOver ? (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-indigo-600">All Puzzles Completed!</h2>
            <div className="text-7xl mb-6">🎮</div>
            
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl inline-block">
              <p className="text-2xl mb-2">Final Score: <span className="font-bold text-indigo-700">{score}</span></p>
              <p>Time: {formatTime(timer)} • Mistakes: {mistakes}</p>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  initializeGame(0);
                  setGameActive(true);
                  setGameOver(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md"
              >
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Level</span>
                  <div className="text-xl font-bold text-indigo-900">{levelIndex + 1}/{LEVELS.length}</div>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Time</span>
                  <div className="text-xl font-bold text-indigo-900">{formatTime(timer)}</div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">{currentLevel.name}</span>
                <div className={`text-xs font-medium inline-block px-2 py-1 rounded-full ml-2 ${
                  currentLevel.difficulty === "easy" 
                    ? "bg-green-100 text-green-800" 
                    : currentLevel.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}>
                  {currentLevel.difficulty}
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Score</span>
                  <div className="text-xl font-bold text-indigo-900">{score}</div>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Mistakes</span>
                  <div className="text-xl font-bold text-indigo-900">{mistakes}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mb-6 gap-3">
              <Button 
                onClick={toggleHint}
                variant="outline" 
                className={showHint ? "bg-pink-100 border-pink-300" : ""}
              >
                {showHint ? "Hide Hints" : "Show Hints"}
              </Button>
              <Button 
                onClick={resetLevel}
                variant="outline"
              >
                Reset Level
              </Button>
            </div>
            
            {/* Picross Grid */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Column Hints */}
                <div 
                  className="absolute right-0"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `50px repeat(${grid.length}, 40px)`,
                    height: "50px",
                    top: "-50px",
                  }}
                >
                  <div></div> {/* Empty corner cell */}
                  
                  {colHints.map((hints, colIndex) => (
                    <div 
                      key={colIndex} 
                      className="flex flex-col items-center justify-end pb-1"
                    >
                      {hints.map((hint, hintIndex) => (
                        <div 
                          key={hintIndex}
                          className="text-sm font-medium text-indigo-900"
                        >
                          {hint}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Row Hints + Grid */}
                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: `50px repeat(${grid.length}, 40px)`,
                    gridTemplateRows: `repeat(${grid.length}, 40px)`,
                  }}
                >
                  {grid.map((row, rowIndex) => (
                    <>
                      {/* Row hint */}
                      <div 
                        key={`hint-${rowIndex}`}
                        className="flex items-center justify-end pr-1 gap-1"
                      >
                        {rowHints[rowIndex].map((hint, hintIndex) => (
                          <div 
                            key={hintIndex}
                            className="text-sm font-medium text-indigo-900"
                          >
                            {hint}
                          </div>
                        ))}
                      </div>
                      
                      {/* Row cells */}
                      {row.map((cell, colIndex) => (
                        <div 
                          key={`${rowIndex}-${colIndex}`}
                          className="relative border-r border-b border-indigo-200 overflow-hidden"
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex)}
                        >
                          <motion.div 
                            className={getCellClass(cell, rowIndex, colIndex)}
                            initial={false}
                            animate={{ 
                              scale: cell === "empty" ? 1 : [1, 1.1, 1],
                              backgroundColor: cell === "filled" ? "#4f46e5" : cell === "marked" ? "#ffffff" : "#ffffff" 
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {cell === "marked" && (
                              <div className="text-xl text-red-500 font-bold">×</div>
                            )}
                          </motion.div>
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <GameControls onRestart={startGame} />
    </div>
  );
}
