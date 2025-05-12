
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Cell state
type CellState = "empty" | "filled" | "marked";

// Game difficulty levels
const DIFFICULTIES = {
  easy: { size: 5, puzzles: 5 },
  medium: { size: 8, puzzles: 3 },
  hard: { size: 10, puzzles: 2 }
};

// Sample patterns for the game (true = filled cell)
const PUZZLE_PATTERNS = {
  easy: [
    // Heart
    [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false]
    ],
    // Smiley
    [
      [false, true, false, true, false],
      [false, true, false, true, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
      [false, true, true, true, false]
    ],
    // Arrow
    [
      [false, false, true, false, false],
      [false, true, true, true, false],
      [true, false, true, false, true],
      [false, false, true, false, false],
      [false, false, true, false, false]
    ],
    // Cross
    [
      [false, false, true, false, false],
      [false, false, true, false, false],
      [true, true, true, true, true],
      [false, false, true, false, false],
      [false, false, true, false, false]
    ],
    // X shape
    [
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true]
    ],
  ],
  medium: [
    // Anchor
    [
      [false, false, true, false, false, false, false, false],
      [false, false, true, false, false, false, false, false],
      [false, false, true, false, false, false, false, false],
      [true, true, true, true, true, false, false, false],
      [false, false, true, false, false, false, false, false],
      [false, true, true, true, false, false, false, false],
      [false, true, false, true, false, false, false, false],
      [false, false, true, false, false, false, false, false]
    ],
    // Duck
    [
      [false, false, false, true, true, false, false, false],
      [false, false, true, true, true, false, false, false],
      [false, false, true, true, false, false, false, false],
      [false, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, false],
      [false, true, true, true, true, false, false, false],
      [false, false, true, true, false, false, false, false]
    ],
    // Cat
    [
      [true, false, false, false, false, false, false, true],
      [true, true, false, false, false, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, true, false, true, true, false, true, true],
      [true, true, true, true, true, true, true, true],
      [true, false, true, true, true, true, false, true],
      [false, false, false, true, true, false, false, false],
      [false, false, false, true, true, false, false, false]
    ],
  ],
  hard: [
    // Ship
    [
      [false, false, false, false, false, true, false, false, false, false],
      [false, false, false, false, true, true, true, false, false, false],
      [false, false, false, true, true, true, true, true, false, false],
      [false, false, true, true, true, true, true, true, true, false],
      [false, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true]
    ],
    // Castle
    [
      [false, true, false, true, false, false, true, false, true, false],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, false, true, false, true, true, false, true, false, true],
      [true, false, true, false, true, true, false, true, false, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true],
      [true, true, true, true, true, true, true, true, true, true]
    ],
  ]
};

type Difficulty = keyof typeof DIFFICULTIES;

export function PicrossGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [pattern, setPattern] = useState<boolean[][]>([]);
  const [rowClues, setRowClues] = useState<number[][]>([]);
  const [colClues, setColClues] = useState<number[][]>([]);
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completedPuzzles, setCompletedPuzzles] = useState<number>(0);
  
  // Start game with selected difficulty
  const startGame = (diff: Difficulty = "easy") => {
    setDifficulty(diff);
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setMistakes(0);
    setTimer(0);
    setCompletedPuzzles(0);
    
    initializeLevel(diff, 0);
  };
  
  // Initialize a level
  const initializeLevel = (diff: Difficulty, puzzleIndex: number) => {
    const size = DIFFICULTIES[diff].size;
    const pattern = PUZZLE_PATTERNS[diff][puzzleIndex];
    
    setPattern(pattern);
    
    // Create empty grid
    const emptyGrid: CellState[][] = Array(size).fill(null).map(() => 
      Array(size).fill("empty")
    );
    setGrid(emptyGrid);
    
    // Calculate row clues
    const rowClues: number[][] = [];
    for (let i = 0; i < size; i++) {
      const clues: number[] = [];
      let count = 0;
      
      for (let j = 0; j < size; j++) {
        if (pattern[i][j]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      
      if (count > 0) {
        clues.push(count);
      }
      
      if (clues.length === 0) {
        clues.push(0);
      }
      
      rowClues.push(clues);
    }
    setRowClues(rowClues);
    
    // Calculate column clues
    const colClues: number[][] = [];
    for (let j = 0; j < size; j++) {
      const clues: number[] = [];
      let count = 0;
      
      for (let i = 0; i < size; i++) {
        if (pattern[i][j]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      
      if (count > 0) {
        clues.push(count);
      }
      
      if (clues.length === 0) {
        clues.push(0);
      }
      
      colClues.push(clues);
    }
    setColClues(colClues);
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number, rightClick: boolean = false) => {
    if (gameOver) return;
    
    // Create a new grid with the updated cell
    const newGrid = [...grid];
    
    if (rightClick) {
      // Right click cycles between empty and marked
      if (newGrid[row][col] === "empty") {
        newGrid[row][col] = "marked";
      } else if (newGrid[row][col] === "marked") {
        newGrid[row][col] = "empty";
      }
    } else {
      // Left click fills the cell
      if (newGrid[row][col] === "empty") {
        newGrid[row][col] = "filled";
        
        // Check if the move was correct
        if (!pattern[row][col]) {
          // Wrong move
          setMistakes(prev => prev + 1);
          toast.error("Incorrect cell!");
        }
      } else if (newGrid[row][col] === "filled") {
        newGrid[row][col] = "empty";
      }
    }
    
    setGrid(newGrid);
    
    // Check if the puzzle is solved
    if (isPuzzleSolved(newGrid)) {
      completePuzzle();
    }
  };
  
  // Handle cell right-click
  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    handleCellClick(row, col, true);
  };
  
  // Check if the puzzle is solved
  const isPuzzleSolved = (currentGrid: CellState[][]) => {
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if ((pattern[i][j] && currentGrid[i][j] !== "filled") || 
            (!pattern[i][j] && currentGrid[i][j] === "filled")) {
          return false;
        }
      }
    }
    return true;
  };
  
  // Complete current puzzle
  const completePuzzle = () => {
    const newCompletedPuzzles = completedPuzzles + 1;
    setCompletedPuzzles(newCompletedPuzzles);
    
    // Calculate score based on time, mistakes, and difficulty
    const timeBonus = Math.max(0, 300 - timer) * 2;
    const mistakePenalty = mistakes * 50;
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    const puzzleScore = (1000 + timeBonus - mistakePenalty) * difficultyMultiplier;
    
    const newScore = score + Math.max(100, puzzleScore);
    setScore(newScore);
    
    // Show completion message
    toast.success(`Puzzle completed! +${puzzleScore} points`);
    
    // Check if all puzzles are completed
    if (newCompletedPuzzles >= DIFFICULTIES[difficulty].puzzles) {
      endGame(newScore);
    } else {
      // Load next puzzle
      initializeLevel(difficulty, newCompletedPuzzles);
      setLevel(newCompletedPuzzles + 1);
      setMistakes(0);
      setTimer(0);
    }
  };
  
  // End the game
  const endGame = (finalScore: number) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("picross-game", finalScore);
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && !gameOver) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
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

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Picross</h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="text-xl">Time: {formatTime(timer)}</div>
            <div className="text-xl">Level: {level}/{DIFFICULTIES[difficulty].puzzles}</div>
            <div className="text-xl">Mistakes: {mistakes}</div>
            <div className="text-xl">Score: {score}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Reveal hidden pictures by filling in cells based on number clues. 
            Test your logical thinking and pattern recognition.
          </p>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">Select difficulty:</h3>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setDifficulty("easy")}
                className={`${difficulty === "easy" ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                Easy (5×5)
              </Button>
              <Button 
                onClick={() => setDifficulty("medium")}
                className={`${difficulty === "medium" ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                Medium (8×8)
              </Button>
              <Button 
                onClick={() => setDifficulty("hard")}
                className={`${difficulty === "hard" ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                Hard (10×10)
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={() => startGame(difficulty)}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={() => startGame(difficulty)}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-6 text-sm text-gray-600">
            Left click to fill, right click to mark
          </div>
          
          {/* Game Grid */}
          <div className="relative bg-white rounded-lg shadow-md p-2 overflow-auto max-w-full">
            <div className="grid" 
              style={{
                display: 'grid',
                gridTemplateColumns: `auto repeat(${grid[0]?.length || 0}, 35px)`,
                gridTemplateRows: `auto repeat(${grid.length || 0}, 35px)`,
                gap: '2px'
              }}
            >
              {/* Empty top-left corner */}
              <div className="w-12 h-12"></div>
              
              {/* Column clues */}
              {colClues.map((clues, j) => (
                <div 
                  key={`col-${j}`} 
                  className="flex flex-col items-center justify-end pb-1 text-xs font-medium"
                  style={{ height: '60px' }}
                >
                  {clues.map((clue, i) => (
                    <div key={`col-${j}-${i}`}>{clue}</div>
                  ))}
                </div>
              ))}
              
              {/* Row clues and grid cells */}
              {grid.map((row, i) => (
                <>
                  {/* Row clue */}
                  <div 
                    key={`row-${i}`} 
                    className="flex items-center justify-end pr-1 text-xs font-medium"
                    style={{ width: '60px' }}
                  >
                    {rowClues[i].map((clue, j) => (
                      <div key={`row-${i}-${j}`} className="mx-1">{clue}</div>
                    ))}
                  </div>
                  
                  {/* Grid cells */}
                  {row.map((cell, j) => (
                    <motion.div
                      key={`cell-${i}-${j}`}
                      className={`
                        w-8 h-8 border border-gray-400 
                        ${cell === "filled" ? "bg-black" : "bg-white"}
                        ${cell === "marked" ? "bg-red-200" : ""}
                        ${(i + j) % 2 === 0 ? "border-opacity-30" : "border-opacity-10"}
                        ${(i % 5 === 0) ? "border-t-2" : ""}
                        ${(j % 5 === 0) ? "border-l-2" : ""}
                      `}
                      onClick={() => handleCellClick(i, j)}
                      onContextMenu={(e) => handleContextMenu(e, i, j)}
                      whileHover={{ scale: 0.95 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {cell === "marked" && (
                        <div className="flex items-center justify-center h-full text-red-500 font-bold">
                          X
                        </div>
                      )}
                    </motion.div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
