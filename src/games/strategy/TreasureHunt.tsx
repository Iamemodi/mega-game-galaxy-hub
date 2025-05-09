
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";
import { Map, X, CheckCircle } from "lucide-react";

export function TreasureHunt() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(15);
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState<number[][]>([]);
  const [treasurePos, setTreasurePos] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  
  // Start game
  const startGame = () => {
    const size = 5;
    setBoardSize(size);
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setMovesLeft(15);
    setHints([]);
    setHint("");
    
    // Initialize the board
    initializeBoard(size);
  };
  
  // Initialize the game board
  const initializeBoard = (size: number) => {
    // Create empty board
    const newBoard = Array(size).fill(0).map(() => Array(size).fill(0));
    const newRevealed = Array(size).fill(0).map(() => Array(size).fill(false));
    
    // Place treasure at random position
    const treasureX = Math.floor(Math.random() * size);
    const treasureY = Math.floor(Math.random() * size);
    setTreasurePos({ x: treasureX, y: treasureY });
    
    // Calculate distance values for each cell (Manhattan distance to treasure)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = Math.abs(x - treasureX) + Math.abs(y - treasureY);
        newBoard[y][x] = distance;
      }
    }
    
    setBoard(newBoard);
    setRevealed(newRevealed);
  };
  
  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    if (!gameActive || gameOver || revealed[y][x]) return;
    
    // Mark cell as revealed
    const newRevealed = [...revealed];
    newRevealed[y][x] = true;
    setRevealed(newRevealed);
    
    // Decrease moves
    const newMovesLeft = movesLeft - 1;
    setMovesLeft(newMovesLeft);
    
    // Check if treasure found
    if (x === treasurePos.x && y === treasurePos.y) {
      // Calculate score based on remaining moves
      const newScore = 1000 + (newMovesLeft * 100);
      setScore(newScore);
      toast.success("🎉 Treasure found!");
      saveScore("treasure-hunt", newScore);
      setGameOver(true);
      
      // Reveal the entire board
      const allRevealed = Array(boardSize).fill(0).map(() => Array(boardSize).fill(true));
      setRevealed(allRevealed);
      return;
    }
    
    // Game over if no moves left
    if (newMovesLeft <= 0) {
      toast.error("Out of moves!");
      setGameOver(true);
      
      // Reveal the entire board
      const allRevealed = Array(boardSize).fill(0).map(() => Array(boardSize).fill(true));
      setRevealed(allRevealed);
      return;
    }
    
    // Generate hint based on distance
    const distance = board[y][x];
    let newHint = "";
    
    if (distance === 0) {
      newHint = "You've found the treasure!";
    } else if (distance === 1) {
      newHint = "Burning hot! The treasure is just one step away!";
    } else if (distance === 2) {
      newHint = "Very hot! You're getting very close!";
    } else if (distance <= 4) {
      newHint = "Warm. You're on the right track.";
    } else if (distance <= 6) {
      newHint = "Cold. Try another direction.";
    } else {
      newHint = "Very cold. You're far away from the treasure.";
    }
    
    // Add direction hint
    let directionHint = "";
    if (x < treasurePos.x) directionHint += " Try going East.";
    if (x > treasurePos.x) directionHint += " Try going West.";
    if (y < treasurePos.y) directionHint += " Try going South.";
    if (y > treasurePos.y) directionHint += " Try going North.";
    
    newHint += directionHint;
    
    setHint(newHint);
    setHints([newHint, ...hints.slice(0, 2)]);
  };
  
  // Get cell color based on distance
  const getCellColor = (x: number, y: number) => {
    if (!revealed[y][x]) return "bg-gray-200 hover:bg-gray-300";
    
    if (x === treasurePos.x && y === treasurePos.y) {
      return "bg-yellow-400"; // Treasure
    }
    
    const distance = board[y][x];
    
    if (distance === 1) return "bg-red-500"; // Very hot
    if (distance === 2) return "bg-red-300";
    if (distance <= 4) return "bg-orange-300"; // Warm
    if (distance <= 6) return "bg-blue-300"; // Cold
    return "bg-blue-500"; // Very cold
  };
  
  // Use hint (reveals one adjacent cell to the treasure)
  const useHint = () => {
    if (movesLeft < 2) {
      toast.error("Not enough moves for a hint!");
      return;
    }
    
    // Find an adjacent cell to the treasure that hasn't been revealed
    const { x: tx, y: ty } = treasurePos;
    const adjacentCells = [
      { x: tx+1, y: ty },
      { x: tx-1, y: ty },
      { x: tx, y: ty+1 },
      { x: tx, y: ty-1 }
    ].filter(({x, y}) => 
      x >= 0 && x < boardSize && y >= 0 && y < boardSize && !revealed[y][x]
    );
    
    if (adjacentCells.length === 0) {
      toast.info("No available hints!");
      return;
    }
    
    // Pick a random adjacent cell
    const randomCell = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
    
    // Reveal the cell and use 2 moves
    handleCellClick(randomCell.x, randomCell.y);
    setMovesLeft(prev => prev - 1); // Extra move cost for the hint
    
    toast.success("Hint used - 2 moves consumed!");
  };

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Treasure Hunt</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Moves Left: {movesLeft}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Find the hidden treasure in the grid using as few moves as possible. 
            Colors will guide you - red means hot (close), blue means cold (far).
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
          <h2 className="text-2xl font-bold mb-4">
            {score > 0 ? "Treasure Found!" : "Game Over!"}
          </h2>
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
        <div className="flex flex-col md:flex-row gap-6 items-start max-w-4xl mx-auto">
          {/* Game board */}
          <div className="flex-1">
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
            >
              {board.map((row, y) => (
                row.map((_, x) => (
                  <motion.button
                    key={`${x}-${y}`}
                    whileHover={{ scale: revealed[y][x] ? 1 : 1.05 }}
                    whileTap={{ scale: revealed[y][x] ? 1 : 0.95 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg ${getCellColor(x, y)} flex items-center justify-center`}
                    onClick={() => handleCellClick(x, y)}
                    disabled={revealed[y][x]}
                  >
                    {revealed[y][x] && (
                      <>
                        {x === treasurePos.x && y === treasurePos.y ? (
                          <span className="text-2xl">💰</span>
                        ) : (
                          <span className="font-bold">{board[y][x]}</span>
                        )}
                      </>
                    )}
                  </motion.button>
                ))
              ))}
            </div>
          </div>
          
          {/* Hints panel */}
          <div className="flex-1 bg-gray-100 p-4 rounded-lg min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Captain's Log</h3>
              <Button 
                variant="outline"
                onClick={useHint}
                disabled={movesLeft < 2}
                className="flex gap-2 items-center"
              >
                <Map className="h-4 w-4" />
                Use Hint (-2 moves)
              </Button>
            </div>
            
            <div className="space-y-2">
              {hints.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-white rounded-lg shadow-sm"
                >
                  {h}
                </motion.div>
              ))}
              
              {hints.length === 0 && (
                <p className="text-muted-foreground italic">
                  Select a tile to begin your search...
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Color Guide:</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                  <span className="text-xs">Very Hot</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-300 rounded-sm"></div>
                  <span className="text-xs">Warm</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
                  <span className="text-xs">Cold</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-xs">Very Cold</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
