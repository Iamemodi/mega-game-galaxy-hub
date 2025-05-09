
import { useState, useEffect } from "react";
import { GameControls } from "../components/GameControls";
import { saveScore } from "../utils/gameUtils";

// Updating the type definition to separate empty cells from tile values
type CellValue = 0 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
type Direction = "up" | "down" | "left" | "right";

export function Game2048() {
  const [grid, setGrid] = useState<CellValue[][]>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Start a new game
  const startGame = () => {
    const newGrid = createEmptyGrid();
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  // Create an empty grid
  function createEmptyGrid(): CellValue[][] {
    return Array(4).fill(null).map(() => Array(4).fill(0));
  }

  // Add random tile to the grid
  function addRandomTile(grid: CellValue[][]) {
    const emptyCells: [number, number][] = [];
    
    // Find all empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length === 0) return false;
    
    // Pick a random empty cell
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // 90% chance of 2, 10% chance of 4
    grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    
    return true;
  }

  // Check if a move is possible
  function canMove(grid: CellValue[][]) {
    // Check for any empty cell
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return true;
      }
    }
    
    // Check for possible merges horizontally
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i][j] !== 0 && grid[i][j] === grid[i][j + 1]) return true;
      }
    }
    
    // Check for possible merges vertically
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] !== 0 && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    
    return false;
  }

  // Move tiles in specified direction
  function moveTiles(direction: Direction) {
    if (gameOver || !gameStarted) return;
    
    // Create deep copy of the grid
    const newGrid: CellValue[][] = JSON.parse(JSON.stringify(grid));
    let moved = false;
    let scoreIncrease = 0;

    const moveLeft = () => {
      for (let row = 0; row < 4; row++) {
        let arr = newGrid[row].filter(val => val !== 0) as TileValue[];
        
        // Merge identical adjacent tiles
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] = (arr[i] * 2) as TileValue;
            scoreIncrease += arr[i];
            arr[i + 1] = 0 as CellValue; // This will be filtered out
          }
        }
        
        arr = arr.filter(val => val !== 0) as TileValue[];
        
        // Fill remaining cells with 0
        const filledArr: CellValue[] = [...arr];
        while (filledArr.length < 4) {
          filledArr.push(0);
        }
        
        // Check if anything changed
        for (let i = 0; i < 4; i++) {
          if (newGrid[row][i] !== filledArr[i]) {
            moved = true;
          }
        }
        
        newGrid[row] = filledArr;
      }
    };

    const moveRight = () => {
      for (let row = 0; row < 4; row++) {
        let arr = newGrid[row].filter(val => val !== 0) as TileValue[];
        
        // Merge identical adjacent tiles from right
        for (let i = arr.length - 1; i > 0; i--) {
          if (arr[i] === arr[i - 1]) {
            arr[i] = (arr[i] * 2) as TileValue;
            scoreIncrease += arr[i];
            arr[i - 1] = 0 as CellValue; // This will be filtered out
          }
        }
        
        arr = arr.filter(val => val !== 0) as TileValue[];
        
        // Fill remaining cells with 0 (from the left)
        const filledArr: CellValue[] = [];
        while (filledArr.length + arr.length < 4) {
          filledArr.push(0);
        }
        filledArr.push(...arr);
        
        // Check if anything changed
        for (let i = 0; i < 4; i++) {
          if (newGrid[row][i] !== filledArr[i]) {
            moved = true;
          }
        }
        
        newGrid[row] = filledArr;
      }
    };

    const moveUp = () => {
      for (let col = 0; col < 4; col++) {
        // Extract column
        let arr: CellValue[] = [];
        for (let row = 0; row < 4; row++) {
          arr.push(newGrid[row][col]);
        }
        
        // Filter, merge and process like moveLeft
        let filteredArr = arr.filter(val => val !== 0) as TileValue[];
        
        for (let i = 0; i < filteredArr.length - 1; i++) {
          if (filteredArr[i] === filteredArr[i + 1]) {
            filteredArr[i] = (filteredArr[i] * 2) as TileValue;
            scoreIncrease += filteredArr[i];
            filteredArr[i + 1] = 0 as CellValue;
          }
        }
        
        filteredArr = filteredArr.filter(val => val !== 0) as TileValue[];
        
        // Fill remaining cells with 0
        const filledArr: CellValue[] = [...filteredArr];
        while (filledArr.length < 4) {
          filledArr.push(0);
        }
        
        // Update column in the grid
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== filledArr[row]) {
            moved = true;
          }
          newGrid[row][col] = filledArr[row];
        }
      }
    };

    const moveDown = () => {
      for (let col = 0; col < 4; col++) {
        // Extract column
        let arr: CellValue[] = [];
        for (let row = 0; row < 4; row++) {
          arr.push(newGrid[row][col]);
        }
        
        // Filter, merge and process like moveRight
        let filteredArr = arr.filter(val => val !== 0) as TileValue[];
        
        for (let i = filteredArr.length - 1; i > 0; i--) {
          if (filteredArr[i] === filteredArr[i - 1]) {
            filteredArr[i] = (filteredArr[i] * 2) as TileValue;
            scoreIncrease += filteredArr[i];
            filteredArr[i - 1] = 0 as CellValue;
          }
        }
        
        filteredArr = filteredArr.filter(val => val !== 0) as TileValue[];
        
        // Fill remaining cells with 0 (from the top)
        const filledArr: CellValue[] = [];
        while (filledArr.length + filteredArr.length < 4) {
          filledArr.push(0);
        }
        filledArr.push(...filteredArr);
        
        // Update column in the grid
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== filledArr[row]) {
            moved = true;
          }
          newGrid[row][col] = filledArr[row];
        }
      }
    };

    // Perform the move
    switch (direction) {
      case "left": moveLeft(); break;
      case "right": moveRight(); break;
      case "up": moveUp(); break;
      case "down": moveDown(); break;
    }

    // Update state only if tiles moved
    if (moved) {
      setScore(prev => prev + scoreIncrease);
      addRandomTile(newGrid);
      setGrid(newGrid);
      
      // Check for game over
      if (!canMove(newGrid)) {
        setGameOver(true);
        saveScore("2048", score + scoreIncrease);
      }
    }
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (event.key) {
        case "ArrowLeft":
          moveTiles("left");
          event.preventDefault();
          break;
        case "ArrowRight":
          moveTiles("right");
          event.preventDefault();
          break;
        case "ArrowUp":
          moveTiles("up");
          event.preventDefault();
          break;
        case "ArrowDown":
          moveTiles("down");
          event.preventDefault();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [gameStarted, gameOver, grid, score]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameStarted || gameOver) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gameStarted || gameOver) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    const diffX = endX - touchStart.x;
    const diffY = endY - touchStart.y;
    
    // Determine swipe direction if swipe is long enough
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        moveTiles(diffX > 0 ? "right" : "left");
      } else {
        // Vertical swipe
        moveTiles(diffY > 0 ? "down" : "up");
      }
    }
  };

  // Get cell background color based on value
  function getCellBgColor(value: CellValue): string {
    switch (value) {
      case 0: return "bg-gray-200";
      case 2: return "bg-yellow-100";
      case 4: return "bg-yellow-200";
      case 8: return "bg-yellow-300";
      case 16: return "bg-orange-300";
      case 32: return "bg-orange-400";
      case 64: return "bg-orange-500";
      case 128: return "bg-amber-400";
      case 256: return "bg-amber-500";
      case 512: return "bg-amber-600 text-white";
      case 1024: return "bg-amber-700 text-white";
      case 2048: return "bg-amber-800 text-white";
      default: return "bg-gray-200";
    }
  }

  // Get cell text size based on value
  function getCellTextSize(value: CellValue): string {
    if (value < 100) return "text-2xl";
    if (value < 1000) return "text-xl";
    return "text-lg";
  }

  return (
    <div 
      className="game-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center mb-4">
        <div className="flex justify-between px-6 mb-2">
          <div className="text-xl font-bold">Score: {score}</div>
        </div>
      </div>

      {!gameStarted && (
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">2048</h1>
          <p className="mb-6">
            Combine tiles with the same number to create a tile with the number 2048.
            Use arrow keys or swipe to move tiles.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="w-full max-w-xs mx-auto">
          <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex mb-2 last:mb-0">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${getCellBgColor(cell)} ${getCellTextSize(
                      cell
                    )} w-16 h-16 flex items-center justify-center font-bold rounded mr-2 last:mr-0 transition-all duration-100`}
                  >
                    {cell !== 0 ? cell : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center mt-6 animate-pop">
          <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
          <p className="text-xl mb-4">Final Score: {score}</p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
