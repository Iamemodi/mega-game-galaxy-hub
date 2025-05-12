
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";
import { motion } from "framer-motion";

type TilePosition = {
  row: number;
  col: number;
};

type Tile = {
  value: number;
  position: TilePosition;
  correctPosition: TilePosition;
};

export function NumberPuzzle() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [puzzleSize, setPuzzleSize] = useState(3); // 3x3 puzzle
  const [emptyPosition, setEmptyPosition] = useState<TilePosition>({ row: puzzleSize-1, col: puzzleSize-1 });
  
  // Initialize puzzle
  const initializePuzzle = (size: number) => {
    const newTiles: Tile[] = [];
    let value = 1;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          // Skip the last tile (empty space)
          continue;
        }
        
        newTiles.push({
          value,
          position: { row, col },
          correctPosition: { row, col }
        });
        
        value++;
      }
    }
    
    setEmptyPosition({ row: size - 1, col: size - 1 });
    return newTiles;
  };
  
  // Shuffle the tiles
  const shuffleTiles = (tiles: Tile[]) => {
    const shuffledTiles = [...tiles];
    let currentEmptyPos = { ...emptyPosition };
    
    // Perform many random moves to shuffle
    for (let i = 0; i < 200; i++) {
      const possibleMoves: TilePosition[] = [];
      
      // Find possible moves (adjacent to empty space)
      if (currentEmptyPos.row > 0) {
        possibleMoves.push({ row: currentEmptyPos.row - 1, col: currentEmptyPos.col });
      }
      if (currentEmptyPos.row < puzzleSize - 1) {
        possibleMoves.push({ row: currentEmptyPos.row + 1, col: currentEmptyPos.col });
      }
      if (currentEmptyPos.col > 0) {
        possibleMoves.push({ row: currentEmptyPos.row, col: currentEmptyPos.col - 1 });
      }
      if (currentEmptyPos.col < puzzleSize - 1) {
        possibleMoves.push({ row: currentEmptyPos.row, col: currentEmptyPos.col + 1 });
      }
      
      // Select a random move
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      // Find the tile at this position
      const tileToMove = shuffledTiles.find(
        tile => tile.position.row === randomMove.row && tile.position.col === randomMove.col
      );
      
      if (tileToMove) {
        // Swap positions
        tileToMove.position = { ...currentEmptyPos };
        currentEmptyPos = { ...randomMove };
      }
    }
    
    // Update the empty position after shuffling
    setEmptyPosition(currentEmptyPos);
    
    // Ensure puzzle is solvable
    if (!isPuzzleSolvable(shuffledTiles, currentEmptyPos)) {
      // If not solvable, swap the first two tiles to make it solvable
      if (shuffledTiles.length >= 2) {
        const temp = { ...shuffledTiles[0].position };
        shuffledTiles[0].position = { ...shuffledTiles[1].position };
        shuffledTiles[1].position = temp;
      }
    }
    
    return shuffledTiles;
  };
  
  // Check if puzzle is solvable
  const isPuzzleSolvable = (tiles: Tile[], emptyPos: TilePosition): boolean => {
    // For odd-sized puzzles, the number of inversions must be even
    // For even-sized puzzles, the number of inversions + the row of the empty tile from the bottom must be odd
    
    // Count inversions
    let inversions = 0;
    
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        // Get the values in the flattened form
        const vali = tiles[i].value;
        const valj = tiles[j].value;
        
        // For a pair, if the higher value comes first, it's an inversion
        if (vali > valj) {
          inversions++;
        }
      }
    }
    
    // For odd grid size
    if (puzzleSize % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      // For even grid size
      const emptyRowFromBottom = puzzleSize - emptyPos.row;
      return (inversions + emptyRowFromBottom) % 2 === 1;
    }
  };
  
  // Check if the puzzle is solved
  const isPuzzleSolved = () => {
    return tiles.every(tile => 
      tile.position.row === tile.correctPosition.row && 
      tile.position.col === tile.correctPosition.col
    );
  };
  
  // Handle tile click
  const handleTileClick = (tile: Tile) => {
    // Check if the tile is adjacent to the empty space
    const isAdjacent = 
      (Math.abs(tile.position.row - emptyPosition.row) === 1 && tile.position.col === emptyPosition.col) ||
      (Math.abs(tile.position.col - emptyPosition.col) === 1 && tile.position.row === emptyPosition.row);
    
    if (!isAdjacent) return;
    
    // Move the tile
    const newTiles = tiles.map(t => {
      if (t.value === tile.value) {
        return {
          ...t,
          position: { ...emptyPosition }
        };
      }
      return t;
    });
    
    // Update the empty position
    setEmptyPosition({ ...tile.position });
    
    // Update tiles and move count
    setTiles(newTiles);
    setMoves(moves + 1);
    
    // Check if puzzle is solved
    if (newTiles.every(t => 
      t.position.row === t.correctPosition.row && 
      t.position.col === t.correctPosition.col
    )) {
      // Calculate score based on time and moves
      const finalScore = calculateScore();
      setScore(finalScore);
      
      setGameOver(true);
      saveScore("number-puzzle", finalScore);
      
      toast.success("Puzzle solved!");
    }
  };
  
  // Calculate score based on time and moves
  const calculateScore = () => {
    // Base score is 10000
    // Deduct points for extra moves and time
    const baseScore = 10000;
    const movesPenalty = moves * 20;
    const timePenalty = time * 5;
    
    return Math.max(1000, baseScore - movesPenalty - timePenalty);
  };
  
  // Start game
  const startGame = () => {
    const size = puzzleSize;
    const initialTiles = initializePuzzle(size);
    const shuffledTiles = shuffleTiles(initialTiles);
    
    setTiles(shuffledTiles);
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setMoves(0);
    setTime(0);
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameActive && !gameOver) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Number Puzzle</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Moves: {moves}</div>
            <div className="text-xl">Time: {formatTime(time)}</div>
            {gameOver && <div className="text-xl">Score: {score}</div>}
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Arrange numbers in ascending order. Slide tiles to solve the puzzle as quickly as possible.
          </p>
          <div className="mb-6">
            <label className="block mb-2">Select puzzle size:</label>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setPuzzleSize(3)}
                className={`${puzzleSize === 3 ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                3x3
              </Button>
              <Button 
                onClick={() => setPuzzleSize(4)}
                className={`${puzzleSize === 4 ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                4x4
              </Button>
              <Button 
                onClick={() => setPuzzleSize(5)}
                className={`${puzzleSize === 5 ? 'bg-game-puzzle/90' : 'bg-gray-300'} text-black px-4 py-2 rounded-lg font-bold`}
              >
                5x5
              </Button>
            </div>
          </div>
          <Button 
            onClick={startGame}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Puzzle Solved!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={startGame}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Puzzle Board */}
          <div 
            className="bg-gray-100 p-2 rounded-lg shadow-lg mb-6"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${puzzleSize}, 1fr)`,
              gap: '8px',
              width: `${puzzleSize * 70}px`,
              height: `${puzzleSize * 70}px`,
              maxWidth: '100%',
              aspectRatio: '1/1',
            }}
          >
            {tiles.map(tile => (
              <motion.button
                key={tile.value}
                onClick={() => handleTileClick(tile)}
                className="bg-game-puzzle text-black font-bold text-xl rounded-lg shadow-md hover:brightness-105"
                style={{ 
                  width: '100%',
                  height: '100%',
                }}
                initial={false}
                animate={{
                  left: `${tile.position.col * (100/puzzleSize)}%`,
                  top: `${tile.position.row * (100/puzzleSize)}%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
              >
                {tile.value}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
