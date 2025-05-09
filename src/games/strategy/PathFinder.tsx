
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Cell types
type CellType = 'empty' | 'start' | 'end' | 'wall' | 'path';

interface Cell {
  type: CellType;
  x: number;
  y: number;
  visited: boolean;
  distance: number;
  parent?: { x: number, y: number };
}

interface GameLevel {
  size: number;
  walls: number; // Number of walls to place
  timeLimit: number;
}

// Game difficulty levels
const GAME_LEVELS: GameLevel[] = [
  { size: 8, walls: 12, timeLimit: 60 },
  { size: 10, walls: 20, timeLimit: 80 },
  { size: 12, walls: 30, timeLimit: 100 }
];

export function PathFinder() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [pathMode, setPathMode] = useState<'drawing' | 'solving'>('drawing');
  const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [endPosition, setEndPosition] = useState<{ x: number, y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState<'start' | 'end' | 'wall'>('start');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<{ x: number, y: number }[]>([]);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(0);
    setPathMode('drawing');
    setStartPosition(null);
    setEndPosition(null);
    setCurrentTool('start');
    setSolution([]);
    
    initializeGrid(0);
  };
  
  // Initialize the game grid for a specific level
  const initializeGrid = (levelIndex: number) => {
    const { size, timeLimit } = GAME_LEVELS[levelIndex];
    setTimeLeft(timeLimit);
    
    // Create empty grid
    const newGrid: Cell[][] = Array(size).fill(null).map((_, y) => 
      Array(size).fill(null).map((_, x) => ({
        type: 'empty',
        x,
        y,
        visited: false,
        distance: Infinity
      }))
    );
    
    setGrid(newGrid);
  };
  
  // Handle cell click in grid
  const handleCellClick = (x: number, y: number) => {
    if (!gameActive || gameOver || isSolving) return;
    
    if (pathMode === 'drawing') {
      // In drawing mode, place start, end, or walls
      if (currentTool === 'start') {
        // Remove previous start if exists
        if (startPosition) {
          setGrid(prev => {
            const newGrid = [...prev];
            newGrid[startPosition.y][startPosition.x] = {
              ...newGrid[startPosition.y][startPosition.x],
              type: 'empty'
            };
            return newGrid;
          });
        }
        
        // Set new start position
        setStartPosition({ x, y });
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[y][x] = { ...newGrid[y][x], type: 'start' };
          return newGrid;
        });
        
        // Switch to end tool if end not placed yet
        if (!endPosition) {
          setCurrentTool('end');
        }
      } else if (currentTool === 'end') {
        // Can't place end on start
        if (startPosition && startPosition.x === x && startPosition.y === y) {
          toast.error("Can't place end on start position");
          return;
        }
        
        // Remove previous end if exists
        if (endPosition) {
          setGrid(prev => {
            const newGrid = [...prev];
            newGrid[endPosition.y][endPosition.x] = {
              ...newGrid[endPosition.y][endPosition.x],
              type: 'empty'
            };
            return newGrid;
          });
        }
        
        // Set new end position
        setEndPosition({ x, y });
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[y][x] = { ...newGrid[y][x], type: 'end' };
          return newGrid;
        });
        
        // Switch to wall tool
        setCurrentTool('wall');
      } else if (currentTool === 'wall') {
        // Can't place wall on start or end
        if ((startPosition && startPosition.x === x && startPosition.y === y) ||
            (endPosition && endPosition.x === x && endPosition.y === y)) {
          return;
        }
        
        // Toggle wall
        setGrid(prev => {
          const newGrid = [...prev];
          const isWall = newGrid[y][x].type === 'wall';
          newGrid[y][x] = { 
            ...newGrid[y][x], 
            type: isWall ? 'empty' : 'wall'
          };
          return newGrid;
        });
      }
    }
  };
  
  // Find path using Breadth-First Search (BFS)
  const findPath = () => {
    if (!startPosition || !endPosition) {
      toast.error("Please set start and end positions");
      return;
    }
    
    setIsSolving(true);
    setPathMode('solving');
    
    // Reset visited state and distances
    const newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        visited: false,
        distance: Infinity,
        parent: undefined
      }))
    );
    
    // Set start cell distance to 0
    newGrid[startPosition.y][startPosition.x].distance = 0;
    
    // BFS queue
    const queue: { x: number, y: number }[] = [{ x: startPosition.x, y: startPosition.y }];
    let foundPath = false;
    
    // BFS algorithm
    while (queue.length > 0 && !foundPath) {
      const current = queue.shift()!;
      
      // Skip if already visited
      if (newGrid[current.y][current.x].visited) {
        continue;
      }
      
      // Mark as visited
      newGrid[current.y][current.x].visited = true;
      
      // Check if reached end
      if (current.x === endPosition.x && current.y === endPosition.y) {
        foundPath = true;
        break;
      }
      
      // Get neighbors (up, right, down, left)
      const neighbors = [
        { x: current.x, y: current.y - 1 }, // up
        { x: current.x + 1, y: current.y }, // right
        { x: current.x, y: current.y + 1 }, // down
        { x: current.x - 1, y: current.y }  // left
      ];
      
      // Check each neighbor
      for (const neighbor of neighbors) {
        const { x, y } = neighbor;
        
        // Skip if out of bounds
        if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
          continue;
        }
        
        // Skip walls and visited cells
        if (newGrid[y][x].type === 'wall' || newGrid[y][x].visited) {
          continue;
        }
        
        // Update distance and parent
        const newDistance = newGrid[current.y][current.x].distance + 1;
        if (newDistance < newGrid[y][x].distance) {
          newGrid[y][x].distance = newDistance;
          newGrid[y][x].parent = { x: current.x, y: current.y };
        }
        
        // Add to queue
        queue.push({ x, y });
      }
    }
    
    // Update grid with visited state
    setGrid(newGrid);
    
    // Check if path found
    if (foundPath) {
      // Reconstruct path
      const path: { x: number, y: number }[] = [];
      let current = endPosition;
      
      while (current && !(current.x === startPosition.x && current.y === startPosition.y)) {
        path.unshift(current);
        const parent = newGrid[current.y][current.x].parent;
        if (!parent) break;
        current = parent;
      }
      
      // Mark path cells
      setTimeout(() => {
        const pathGrid = [...newGrid];
        let delay = 0;
        
        // Animate path finding
        for (let i = 0; i < path.length; i++) {
          if (i === path.length - 1) continue; // Skip end position
          
          const { x, y } = path[i];
          
          setTimeout(() => {
            setGrid(prev => {
              const newGrid = [...prev];
              newGrid[y][x] = { ...newGrid[y][x], type: 'path' };
              return newGrid;
            });
            
            // If last cell, complete the level
            if (i === path.length - 2) {
              setTimeout(() => {
                completeLevel(path.length);
              }, 500);
            }
          }, delay);
          
          delay += 100;
        }
        
        setSolution(path);
      }, 500);
    } else {
      toast.error("No path found! Try removing some walls.");
      setIsSolving(false);
      setPathMode('drawing');
    }
  };
  
  // Handle level completion
  const completeLevel = (pathLength: number) => {
    setIsSolving(false);
    
    // Calculate score based on path length and time left
    // Shorter paths and more time left = higher score
    const efficiency = GAME_LEVELS[level].size * 2 - pathLength;
    const efficiencyBonus = Math.max(0, efficiency * 10);
    const timeBonus = timeLeft * 5;
    const levelScore = 100 + efficiencyBonus + timeBonus;
    
    setScore(score + levelScore);
    
    toast.success(`Level complete! Path length: ${pathLength}`);
    toast.success(`Score: +${levelScore} (Base: 100, Efficiency: ${efficiencyBonus}, Time: ${timeBonus})`);
    
    // Check if there are more levels
    if (level < GAME_LEVELS.length - 1) {
      // Move to next level after a delay
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setPathMode('drawing');
        setStartPosition(null);
        setEndPosition(null);
        setCurrentTool('start');
        setSolution([]);
        initializeGrid(nextLevel);
        
        toast.success(`Level ${nextLevel + 1}`);
      }, 2000);
    } else {
      // Game complete
      setTimeout(() => {
        endGame(true);
      }, 2000);
    }
  };
  
  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("path-finder", score);
    
    if (completed) {
      toast.success(`Game completed! Final score: ${score}`);
    } else {
      toast.info(`Time's up! Your score: ${score}`);
    }
  };
  
  // Place random walls on the grid
  const placeRandomWalls = () => {
    if (!startPosition || !endPosition) {
      toast.error("Please set start and end positions first");
      return;
    }
    
    const { walls } = GAME_LEVELS[level];
    const gridSize = grid.length;
    const newGrid = [...grid];
    let wallsPlaced = 0;
    
    while (wallsPlaced < walls) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      
      // Skip start and end positions
      if ((startPosition && startPosition.x === x && startPosition.y === y) ||
          (endPosition && endPosition.x === x && endPosition.y === y)) {
        continue;
      }
      
      // Skip already placed walls
      if (newGrid[y][x].type === 'wall') {
        continue;
      }
      
      // Place wall
      newGrid[y][x].type = 'wall';
      wallsPlaced++;
    }
    
    setGrid(newGrid);
    toast.success(`Placed ${walls} random walls`);
  };
  
  // Clear all walls
  const clearWalls = () => {
    const newGrid = grid.map(row => 
      row.map(cell => {
        if (cell.type === 'wall') {
          return { ...cell, type: 'empty' };
        }
        return cell;
      })
    );
    
    setGrid(newGrid);
    toast.info("All walls cleared");
  };
  
  // Game timer
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, gameOver]);
  
  // Get CSS class for cell
  const getCellClass = (type: CellType) => {
    switch (type) {
      case 'start': return 'bg-green-500';
      case 'end': return 'bg-red-500';
      case 'wall': return 'bg-gray-800';
      case 'path': return 'bg-blue-400';
      default: return 'bg-white hover:bg-gray-100';
    }
  };

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Path Finder</h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
            <div className="text-xl font-bold">Level: {level + 1}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Create a path from start to end by placing walls. The algorithm will find the shortest path!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-strategy hover:bg-pink-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your final score: {score}</p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={startGame}
              className="bg-game-strategy hover:bg-pink-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
          {/* Game grid */}
          <div className="flex-1">
            <div 
              className="grid gap-1 max-w-lg mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, y) => (
                row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    whileHover={{ scale: cell.type === 'wall' || pathMode === 'solving' ? 1 : 1.1 }}
                    whileTap={{ scale: cell.type === 'wall' || pathMode === 'solving' ? 1 : 0.9 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${getCellClass(cell.type)} rounded cursor-pointer border border-gray-200`}
                    onClick={() => handleCellClick(x, y)}
                  >
                    {cell.type === 'start' && <span>S</span>}
                    {cell.type === 'end' && <span>E</span>}
                  </motion.div>
                ))
              ))}
            </div>
          </div>
          
          {/* Controls panel */}
          <div className="w-full md:w-64 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Game Controls</h3>
            
            {/* Current mode indicator */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-1">Mode:</div>
              <div className={`p-2 rounded ${pathMode === 'drawing' ? 'bg-green-100' : 'bg-blue-100'}`}>
                {pathMode === 'drawing' ? 'Setup Phase' : 'Solving Phase'}
              </div>
            </div>
            
            {/* Tool selection (in drawing mode only) */}
            {pathMode === 'drawing' && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-1">Current Tool:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-2 rounded text-sm ${currentTool === 'start' ? 'bg-green-500 text-white' : 'bg-white'}`}
                    onClick={() => setCurrentTool('start')}
                    disabled={!!startPosition && !!endPosition}
                  >
                    Start
                  </button>
                  <button
                    className={`p-2 rounded text-sm ${currentTool === 'end' ? 'bg-red-500 text-white' : 'bg-white'}`}
                    onClick={() => setCurrentTool('end')}
                    disabled={!startPosition || !!endPosition}
                  >
                    End
                  </button>
                  <button
                    className={`p-2 rounded text-sm ${currentTool === 'wall' ? 'bg-gray-800 text-white' : 'bg-white'}`}
                    onClick={() => setCurrentTool('wall')}
                    disabled={!startPosition || !endPosition}
                  >
                    Wall
                  </button>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-2">
              {pathMode === 'drawing' && (
                <>
                  <Button
                    onClick={placeRandomWalls}
                    disabled={!startPosition || !endPosition}
                    className="w-full bg-purple-400 hover:bg-purple-500"
                  >
                    Random Walls
                  </Button>
                  <Button
                    onClick={clearWalls}
                    disabled={!startPosition || !endPosition}
                    className="w-full bg-gray-400 hover:bg-gray-500"
                  >
                    Clear Walls
                  </Button>
                  <Button
                    onClick={findPath}
                    disabled={!startPosition || !endPosition || isSolving}
                    className="w-full bg-game-strategy hover:bg-pink-400"
                  >
                    Find Path
                  </Button>
                </>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Legend:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs">Start Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs">End Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 rounded"></div>
                  <span className="text-xs">Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-xs">Path</span>
                </div>
              </div>
            </div>
            
            {/* Current status */}
            {solution.length > 0 && (
              <div className="mt-4 p-2 bg-blue-100 rounded">
                Path length: {solution.length} steps
              </div>
            )}
            
            {isSolving && (
              <div className="mt-4 p-2 bg-yellow-100 rounded">
                Finding path...
              </div>
            )}
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
