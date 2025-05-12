
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080"
];

export function PixelArtMaker() {
  const [gameActive, setGameActive] = useState(false);
  const [gridSize, setGridSize] = useState<8 | 16 | 32>(16);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [grid, setGrid] = useState<string[][]>([]);
  
  const startGame = (size: 8 | 16 | 32) => {
    setGameActive(true);
    setGridSize(size);
    // Initialize grid with white cells
    setGrid(Array(size).fill(null).map(() => Array(size).fill("#FFFFFF")));
  };
  
  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = selectedColor;
    setGrid(newGrid);
  };
  
  const clearCanvas = () => {
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill("#FFFFFF")));
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pixel Art Maker</h1>
        {gameActive && <div className="text-xl">Canvas: {gridSize}x{gridSize}</div>}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Create your own pixel art masterpiece! Choose your canvas size and start creating.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => startGame(8)}
              className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
            >
              Small (8x8)
            </Button>
            <Button 
              onClick={() => startGame(16)}
              className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
            >
              Medium (16x16)
            </Button>
            <Button 
              onClick={() => startGame(32)}
              className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
            >
              Large (32x32)
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full ${color === selectedColor ? 'ring-2 ring-offset-2 ring-black' : ''}`}
              />
            ))}
          </div>
          
          <div className="border border-gray-300 rounded-lg p-1 mb-4 max-w-full overflow-auto">
            <div className="grid" style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: '1px'
            }}>
              {grid.map((row, rowIndex) => 
                row.map((color, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    style={{ 
                      backgroundColor: color,
                      width: gridSize === 32 ? '8px' : gridSize === 16 ? '16px' : '32px',
                      height: gridSize === 32 ? '8px' : gridSize === 16 ? '16px' : '32px'
                    }}
                    className="cursor-pointer"
                  />
                ))
              )}
            </div>
          </div>
          
          <Button 
            onClick={clearCanvas}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Clear Canvas
          </Button>
        </div>
      )}

      <GameControls onRestart={() => setGameActive(false)} />
    </div>
  );
}
