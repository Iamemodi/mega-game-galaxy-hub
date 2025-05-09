
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED_MS = 150;
const INITIAL_SNAKE_LENGTH = 3;
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Game types
type Direction = typeof DIRECTIONS.UP | typeof DIRECTIONS.DOWN | typeof DIRECTIONS.LEFT | typeof DIRECTIONS.RIGHT;
type Position = { x: number; y: number };

export function SnakeGame() {
  const [gameActive, setGameActive] = useState(false);
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position | null>(null);
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize or reset the snake
  const initSnake = () => {
    // Start in the middle of the grid
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    
    // Create snake body segments
    const newSnake: Position[] = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      newSnake.push({ x: startX - i, y: startY });
    }
    
    setSnake(newSnake);
  };
  
  // Place food at a random position that's not occupied by the snake
  const placeFood = () => {
    if (!snake.length) return;
    
    let newFood: Position;
    let foodOnSnake = true;
    
    while (foodOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      
      // Check if food is on any part of the snake
      foodOnSnake = snake.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      );
      
      if (!foodOnSnake) {
        setFood(newFood);
        return;
      }
    }
  };
  
  // Move the snake one step in the current direction
  const moveSnake = () => {
    if (gameOver || !gameActive || !food) return;
    
    // Update direction from next direction
    setDirection(nextDirection);
    
    const head = snake[0];
    const newHead: Position = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };
    
    // Check for collisions with walls
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      saveScore("snake-game", score);
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
      }
      
      return;
    }
    
    // Check for collisions with self
    if (
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      setGameOver(true);
      saveScore("snake-game", score);
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
      }
      
      return;
    }
    
    // Create new snake with new head
    const newSnake = [newHead, ...snake];
    
    // Check if snake ate food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 1);
      setFood(null);
    } else {
      // Remove the tail if food wasn't eaten
      newSnake.pop();
    }
    
    setSnake(newSnake);
    
    // Place new food if needed
    if (!food) {
      placeFood();
    }
  };
  
  // Handle direction changes
  const changeDirection = (newDir: Direction) => {
    // Prevent 180-degree turns
    if (
      (direction === DIRECTIONS.UP && newDir === DIRECTIONS.DOWN) ||
      (direction === DIRECTIONS.DOWN && newDir === DIRECTIONS.UP) ||
      (direction === DIRECTIONS.LEFT && newDir === DIRECTIONS.RIGHT) ||
      (direction === DIRECTIONS.RIGHT && newDir === DIRECTIONS.LEFT)
    ) {
      return;
    }
    
    setNextDirection(newDir);
  };
  
  // Start a new game
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setGameActive(true);
    initSnake();
    setFood(null); // Will be placed on first move
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      
      switch (e.key) {
        case 'ArrowUp':
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
          changeDirection(DIRECTIONS.RIGHT);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, direction]);
  
  // Game loop
  useEffect(() => {
    if (!gameActive || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }
    
    // Place initial food if needed
    if (!food) {
      placeFood();
    }
    
    // Start game loop
    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, GAME_SPEED_MS);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameActive, gameOver, snake, food]);
  
  // Draw the game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
      // Draw head in a different color
      if (index === 0) {
        ctx.fillStyle = '#2E7D32';
      } else {
        ctx.fillStyle = '#4CAF50';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      
      // Add shading for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE / 2,
        CELL_SIZE / 2
      );
    });
    
    // Draw food
    if (food) {
      ctx.fillStyle = '#F44336';
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add shading for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 3,
        food.y * CELL_SIZE + CELL_SIZE / 3,
        CELL_SIZE / 6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(canvas.width, y * CELL_SIZE);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, canvas.height);
      ctx.stroke();
    }
    
  }, [snake, food, gameActive, gameOver]);
  
  // Render direction buttons
  const renderDirectionButtons = () => {
    return (
      <div className="flex flex-col items-center mt-4">
        <Button 
          onClick={() => changeDirection(DIRECTIONS.UP)}
          disabled={!gameActive || gameOver}
          className="w-16 h-16 mb-2"
        >
          ▲
        </Button>
        <div className="flex gap-2">
          <Button 
            onClick={() => changeDirection(DIRECTIONS.LEFT)}
            disabled={!gameActive || gameOver}
            className="w-16 h-16"
          >
            ◄
          </Button>
          <Button 
            onClick={() => changeDirection(DIRECTIONS.DOWN)}
            disabled={!gameActive || gameOver}
            className="w-16 h-16"
          >
            ▼
          </Button>
          <Button 
            onClick={() => changeDirection(DIRECTIONS.RIGHT)}
            disabled={!gameActive || gameOver}
            className="w-16 h-16"
          >
            ►
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Snake</h1>
        <div className="flex justify-center gap-8">
          <div className="text-xl font-bold">Score: {score}</div>
          <div className="text-xl font-bold">High Score: {highScore}</div>
        </div>
      </div>
      
      <div className="relative mx-auto" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        <canvas 
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-black rounded-md"
        />
        
        {!gameActive && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Snake</h2>
            <p className="mb-4">Use arrow keys to move</p>
            <Button 
              onClick={startGame}
              className="bg-game-arcade text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameActive && gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">Score: {score}</p>
            <Button
              onClick={startGame}
              className="bg-game-arcade text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
      
      {/* Mobile controls */}
      <div className="md:hidden">
        {renderDirectionButtons()}
      </div>
      
      <p className="text-center mt-4">
        Use arrow keys to change direction
      </p>
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
