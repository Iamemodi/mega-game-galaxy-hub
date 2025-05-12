
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Define types for our game
type Dot = {
  id: number;
  row: number;
  col: number;
  isSelected: boolean;
  isConnected: boolean;
};

type Line = {
  start: number;
  end: number;
};

export function DotConnect() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [dots, setDots] = useState<Dot[]>([]);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [gridSize, setGridSize] = useState(5);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [currentPattern, setCurrentPattern] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(60);

  // Generate dots based on grid size
  const generateDots = (size: number) => {
    const newDots: Dot[] = [];
    let id = 0;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        newDots.push({
          id,
          row,
          col,
          isSelected: false,
          isConnected: false
        });
        id++;
      }
    }
    
    return newDots;
  };

  // Generate some example patterns (in a real game, this would be more sophisticated)
  const generatePatterns = () => {
    return [
      "Square",
      "Triangle",
      "Z-Shape",
      "Line",
      "Cross"
    ];
  };

  // Select a random pattern
  const selectRandomPattern = (patterns: string[]) => {
    const randomIndex = Math.floor(Math.random() * patterns.length);
    return patterns[randomIndex];
  };

  // Start the game
  const startGame = () => {
    const newGridSize = 5 + Math.min(level - 1, 3); // Increase grid size with level, max 8x8
    const newDots = generateDots(newGridSize);
    const newPatterns = generatePatterns();
    const newPattern = selectRandomPattern(newPatterns);
    
    setGameActive(true);
    setGameOver(false);
    setDots(newDots);
    setGridSize(newGridSize);
    setPatterns(newPatterns);
    setCurrentPattern(newPattern);
    setLines([]);
    setSelectedDot(null);
    setTimeLeft(60 - (level * 5) + 10); // Reduce time per level, min 15 seconds
    
    toast.success(`Level ${level} started! Create a ${newPattern}`);
  };

  // Handle dot clicks
  const handleDotClick = (dot: Dot) => {
    if (!gameActive || gameOver) return;
    
    // If no dot is selected, select this one
    if (!selectedDot) {
      setDots(prev => prev.map(d => 
        d.id === dot.id ? { ...d, isSelected: true } : d
      ));
      setSelectedDot(dot);
      return;
    }
    
    // Can't connect to the same dot
    if (selectedDot.id === dot.id) return;
    
    // Check if dots are connectable (adjacent horizontally, vertically or diagonally)
    const rowDiff = Math.abs(selectedDot.row - dot.row);
    const colDiff = Math.abs(selectedDot.col - dot.col);
    
    if (rowDiff > 1 || colDiff > 1) {
      toast.error("You can only connect adjacent dots!");
      return;
    }
    
    // Check if this connection already exists
    const connectionExists = lines.some(
      line => (line.start === selectedDot.id && line.end === dot.id) || 
              (line.start === dot.id && line.end === selectedDot.id)
    );
    
    if (connectionExists) {
      toast.error("This connection already exists!");
      return;
    }
    
    // Create new line
    setLines(prev => [...prev, { start: selectedDot.id, end: dot.id }]);
    
    // Mark dots as connected
    setDots(prev => prev.map(d => 
      (d.id === dot.id || d.id === selectedDot.id) ? { ...d, isConnected: true, isSelected: d.id === dot.id } : { ...d, isSelected: false }
    ));
    
    // Update score
    setScore(prev => prev + 5);
    
    // Select new dot
    setSelectedDot(dot);
    
    // Check pattern completion (simplified)
    if (lines.length + 1 >= 3) {
      // In a real game, you'd check if the actual pattern matches the requested one
      const patternComplete = Math.random() > 0.7; // 30% chance of complete for demo
      
      if (patternComplete) {
        toast.success(`${currentPattern} completed! +50 points`);
        setScore(prev => prev + 50);
        
        // Move to next level
        setLevel(prev => prev + 1);
        setTimeout(() => {
          startGame();
        }, 1500);
      }
    }
  };

  // End the game
  const endGame = () => {
    setGameOver(true);
    setGameActive(false);
    
    if (score > 0) {
      saveScore("dot-connect", score);
      toast.success(`Game over! Score: ${score} saved.`);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: number;
    
    if (gameActive && !gameOver) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [gameActive, gameOver]);

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dot Connect</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Level: {level}</div>
            <div className="text-xl">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Connect dots to form shapes and complete patterns. Plan your moves carefully to maximize your score.
          </p>
          <Button 
            onClick={() => {
              setScore(0);
              setLevel(1);
              startGame();
            }}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={() => {
              setScore(0);
              setLevel(1);
              startGame();
            }}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gray-50 p-4 mb-4 rounded">
            <p className="text-center font-medium">Create a <span className="font-bold text-game-strategy">{currentPattern}</span></p>
          </div>
          
          <div className="relative w-[300px] h-[300px] bg-white rounded-lg shadow-inner">
            {/* Lines between dots */}
            {lines.map((line, index) => {
              const startDot = dots.find(d => d.id === line.start);
              const endDot = dots.find(d => d.id === line.end);
              
              if (!startDot || !endDot) return null;
              
              // Calculate dot positions
              const dotSize = 14;
              const boardSize = 300;
              const offset = dotSize / 2;
              const cellSize = boardSize / (gridSize - 1);
              
              const x1 = startDot.col * cellSize;
              const y1 = startDot.row * cellSize;
              const x2 = endDot.col * cellSize;
              const y2 = endDot.row * cellSize;
              
              return (
                <motion.div
                  key={`line-${index}`}
                  className="absolute bg-game-strategy"
                  style={{
                    width: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                    height: 3,
                    transformOrigin: '0 0',
                    transform: `translate(${x1 + offset}px, ${y1 + offset}px) 
                               rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`,
                    zIndex: 1
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              );
            })}
            
            {/* Dots */}
            {dots.map((dot) => {
              // Calculate dot positions
              const dotSize = 14;
              const boardSize = 300;
              const offset = dotSize / 2;
              const cellSize = boardSize / (gridSize - 1);
              
              const x = dot.col * cellSize - offset;
              const y = dot.row * cellSize - offset;
              
              return (
                <motion.div
                  key={`dot-${dot.id}`}
                  className={`absolute w-3.5 h-3.5 rounded-full cursor-pointer z-10 ${
                    dot.isSelected 
                      ? 'bg-game-strategy-bright scale-125' 
                      : dot.isConnected
                        ? 'bg-game-strategy-bright' 
                        : 'bg-game-strategy'
                  }`}
                  style={{
                    left: x,
                    top: y,
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDotClick(dot)}
                />
              );
            })}
          </div>
        </div>
      )}

      <GameControls onRestart={() => {
        setScore(0);
        setLevel(1);
        startGame();
      }} />
    </div>
  );
}
