
import { useState, useEffect } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

type Position = { row: number; col: number };
type TileData = { value: number; position: Position };

export function SlidingPuzzle() {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [size, setSize] = useState(3);
  
  // Initialize puzzle
  const initializePuzzle = () => {
    const newTiles: TileData[] = [];
    const totalTiles = size * size;
    
    // Create tiles in solved state
    for (let i = 0; i < totalTiles - 1; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      newTiles.push({
        value: i + 1,
        position: { row, col }
      });
    }
    
    // Add empty tile
    newTiles.push({
      value: 0, // 0 represents empty space
      position: { row: size - 1, col: size - 1 }
    });
    
    // Shuffle the puzzle
    const shuffledTiles = shuffleTiles(newTiles);
    
    // Only use solvable configurations
    if (isSolvable(shuffledTiles)) {
      setTiles(shuffledTiles);
    } else {
      // Swap two non-empty tiles to make it solvable
      const tile1 = shuffledTiles.findIndex(tile => tile.value !== 0);
      const tile2 = shuffledTiles.findIndex((tile, idx) => idx !== tile1 && tile.value !== 0);
      
      const temp = shuffledTiles[tile1].value;
      shuffledTiles[tile1].value = shuffledTiles[tile2].value;
      shuffledTiles[tile2].value = temp;
      
      setTiles(shuffledTiles);
    }
    
    setMoves(0);
    setSolved(false);
  };
  
  // Shuffle tiles
  const shuffleTiles = (tiles: TileData[]) => {
    const shuffled = [...tiles];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      
      // Swap values, not positions
      const temp = shuffled[i].value;
      shuffled[i].value = shuffled[j].value;
      shuffled[j].value = temp;
    }
    
    return shuffled;
  };
  
  // Check if puzzle configuration is solvable
  const isSolvable = (tiles: TileData[]) => {
    // Extract tile values into a flat array, ignoring empty tile
    const values = tiles.map(tile => tile.value).filter(val => val !== 0);
    
    // Count inversions
    let inversions = 0;
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] > values[j]) {
          inversions++;
        }
      }
    }
    
    // Find row of empty tile from bottom
    const emptyTile = tiles.find(tile => tile.value === 0)!;
    const emptyRow = size - 1 - emptyTile.position.row;
    
    // For odd size puzzles, check if inversions is even
    // For even size puzzles, check if (inversions + emptyRow) is odd
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      return (inversions + emptyRow) % 2 === 1;
    }
  };
  
  // Check if puzzle is solved
  const checkSolved = () => {
    for (let i = 0; i < tiles.length; i++) {
      const { row, col } = tiles[i].position;
      const expectedValue = row * size + col + 1;
      
      // Last tile should be empty (0)
      if (i === tiles.length - 1) {
        if (tiles[i].value !== 0) return false;
      } else if (tiles[i].value !== expectedValue) {
        return false;
      }
    }
    return true;
  };
  
  // Handle tile click
  const handleTileClick = (clickedTile: TileData) => {
    if (solved) return;
    
    // Find empty tile
    const emptyTile = tiles.find(tile => tile.value === 0)!;
    const emptyPos = emptyTile.position;
    const tilePos = clickedTile.position;
    
    // Check if clicked tile is adjacent to empty space
    const isAdjacent = (
      (Math.abs(tilePos.row - emptyPos.row) === 1 && tilePos.col === emptyPos.col) ||
      (Math.abs(tilePos.col - emptyPos.col) === 1 && tilePos.row === emptyPos.row)
    );
    
    if (isAdjacent) {
      // Swap tile values
      const updatedTiles = tiles.map(tile => {
        if (tile.value === clickedTile.value) {
          return { ...tile, value: 0 };
        } else if (tile.value === 0) {
          return { ...tile, value: clickedTile.value };
        }
        return tile;
      });
      
      setTiles(updatedTiles);
      setMoves(moves + 1);
      
      // Check if puzzle is solved after move
      setTimeout(() => {
        if (checkSolved()) {
          setSolved(true);
          saveScore("sliding-puzzle", moves + 1);
        }
      }, 300);
    }
  };
  
  // Start/restart game
  const startGame = () => {
    initializePuzzle();
  };
  
  // Initialize game on first load
  useEffect(() => {
    initializePuzzle();
  }, [size]);
  
  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Sliding Puzzle</h1>
        <div className="flex justify-between px-6">
          <div className="text-xl font-bold">Moves: {moves}</div>
          <div>
            <select 
              className="px-2 py-1 rounded-md border"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              disabled={moves > 0 && !solved}
            >
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
              <option value={5}>5x5</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md mx-auto">
        <div 
          className="grid gap-1 mx-auto aspect-square" 
          style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            width: "100%"
          }}
        >
          {tiles.map((tile) => (
            <div
              key={`${tile.position.row}-${tile.position.col}`}
              className={`flex items-center justify-center rounded-md cursor-pointer text-xl font-bold transition-all duration-200 ${
                tile.value === 0 
                  ? "bg-transparent"
                  : "bg-game-puzzle hover:bg-game-puzzle/80"
              }`}
              onClick={() => handleTileClick(tile)}
            >
              {tile.value !== 0 && tile.value}
            </div>
          ))}
        </div>
      </div>
      
      {solved && (
        <div className="text-center my-4">
          <div className="text-2xl font-bold mb-2">Puzzle Solved!</div>
          <div className="text-xl mb-4">You did it in {moves} moves</div>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
