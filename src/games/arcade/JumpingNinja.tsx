import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";

// Game objects
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Platform extends GameObject {
  hasPowerUp: boolean;
}

interface Player extends GameObject {
  velY: number;
  jumping: boolean;
  moving: number; // -1 left, 0 stationary, 1 right
  powerUp: boolean;
}

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;
const PLATFORM_SPEED = 2;
const POWERUP_CHANCE = 0.2;

export function JumpingNinja() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const gameStateRef = useRef({
    player: {
      x: 150,
      y: 300,
      width: 30,
      height: 50,
      velY: 0,
      jumping: false,
      moving: 0,
      powerUp: false
    } as Player,
    platforms: [] as Platform[],
    score: 0,
    gameSpeed: 1
  });
  
  // Initialize game
  const initGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Reset game state
    gameStateRef.current = {
      player: {
        x: 150,
        y: canvas.height - 150,
        width: 30,
        height: 50,
        velY: 0,
        jumping: false,
        moving: 0,
        powerUp: false
      },
      platforms: [],
      score: 0,
      gameSpeed: 1
    };
    
    // Create initial platforms
    createInitialPlatforms();
    
    setScore(0);
    setGameActive(true);
    setGameOver(false);
  };
  
  // Create initial platforms
  const createInitialPlatforms = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create base platform
    gameStateRef.current.platforms.push({
      x: 0,
      y: canvas.height - 50,
      width: canvas.width,
      height: 20,
      hasPowerUp: false
    });
    
    // Create some random platforms
    for (let i = 0; i < 7; i++) {
      createPlatform();
    }
  };
  
  // Create a new platform
  const createPlatform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const lastPlatform = gameStateRef.current.platforms[gameStateRef.current.platforms.length - 1];
    
    const minWidth = 70;
    const maxWidth = 230;
    const width = minWidth + Math.random() * (maxWidth - minWidth);
    
    const minGap = 60;
    const maxGap = 180;
    const gap = minGap + Math.random() * (maxGap - minGap);
    
    const minHeight = canvas.height - 250;
    const maxHeight = canvas.height - 150;
    const y = minHeight + Math.random() * (maxHeight - minHeight);
    
    const hasPowerUp = Math.random() < POWERUP_CHANCE;
    
    gameStateRef.current.platforms.push({
      x: lastPlatform ? lastPlatform.x + lastPlatform.width + gap : canvas.width + gap,
      y,
      width,
      height: 20,
      hasPowerUp
    });
  };
  
  // Game loop
  const gameLoop = () => {
    if (!canvasRef.current || !gameActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    updateGameState();
    
    // Draw game objects
    drawGame(ctx);
    
    // Check for game over
    if (gameStateRef.current.player.y > canvas.height) {
      endGame();
      return;
    }
    
    // Request next animation frame
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Update game state
  const updateGameState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const { player, platforms } = gameStateRef.current;
    
    // Update player position
    player.velY += GRAVITY;
    player.y += player.velY;
    player.x += player.moving * PLAYER_SPEED;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
      player.x = canvas.width - player.width;
    }
    
    // Check for collisions with platforms
    let onPlatform = false;
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      
      // Collision check
      if (player.y + player.height > p.y && 
          player.y < p.y + p.height && 
          player.x + player.width > p.x && 
          player.x < p.x + p.width) {
        
        // Only register collision if falling
        if (player.velY > 0) {
          player.y = p.y - player.height;
          player.velY = 0;
          player.jumping = false;
          onPlatform = true;
          
          // Check for power up
          if (p.hasPowerUp && !player.powerUp) {
            player.powerUp = true;
            gameStateRef.current.score += 100;
            toast.success("+100 points!");
            
            // Power up wears off after 5 seconds
            setTimeout(() => {
              if (gameActive && !gameOver) {
                gameStateRef.current.player.powerUp = false;
              }
            }, 5000);
            
            // Remove the power up
            p.hasPowerUp = false;
          }
        }
      }
    }
    
    // Move platforms left
    for (let i = 0; i < platforms.length; i++) {
      platforms[i].x -= PLATFORM_SPEED * gameStateRef.current.gameSpeed;
    }
    
    // Remove platforms that are off screen
    while (platforms.length > 0 && platforms[0].x + platforms[0].width < 0) {
      platforms.shift();
      
      // Add score when passing platforms
      gameStateRef.current.score += 10;
      setScore(gameStateRef.current.score);
      
      // Increase game speed
      gameStateRef.current.gameSpeed += 0.01;
      
      // Create a new platform
      createPlatform();
    }
  };
  
  // Draw game
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    const { player, platforms } = gameStateRef.current;
    
    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    
    // Draw platforms
    ctx.fillStyle = '#8B4513';
    for (const platform of platforms) {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Draw power up
      if (platform.hasPowerUp) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(platform.x + platform.width / 2, platform.y - 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8B4513';
      }
    }
    
    // Draw player
    if (player.powerUp) {
      ctx.fillStyle = '#FF0000';
    } else {
      ctx.fillStyle = '#000000';
    }
    
    // Basic ninja drawing
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw ninja details
    ctx.fillStyle = '#FFFFFF';
    // Eyes
    ctx.fillRect(player.x + 7, player.y + 10, 5, 5);
    ctx.fillRect(player.x + 18, player.y + 10, 5, 5);
    
    // Headband
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y + 5, player.width, 3);
    
    // Draw score
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 10, 30);
  };
  
  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || gameOver) return;
      
      const { player } = gameStateRef.current;
      
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        if (!player.jumping) {
          player.jumping = true;
          player.velY = JUMP_FORCE;
          
          // Higher jump with power up
          if (player.powerUp) {
            player.velY = JUMP_FORCE * 1.5;
          }
        }
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.moving = -1;
      }
      
      if (e.key === 'ArrowRight' || e.key === 'd') {
        player.moving = 1;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameActive || gameOver) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (gameStateRef.current.player.moving === -1) {
          gameStateRef.current.player.moving = 0;
        }
      }
      
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (gameStateRef.current.player.moving === 1) {
          gameStateRef.current.player.moving = 0;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive, gameOver]);
  
  // Start the game loop
  useEffect(() => {
    if (gameActive && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameActive, gameOver]);
  
  // Set up canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set canvas dimensions
    const updateCanvasDimensions = () => {
      if (!canvasRef.current) return;
      
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      const width = Math.min(500, container.clientWidth);
      const height = 500;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    };
    
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);
  
  // End game
  const endGame = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    setGameOver(true);
    setGameActive(false);
    
    const finalScore = gameStateRef.current.score;
    setScore(finalScore);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    
    saveScore("jumping-ninja", finalScore);
  };
  
  // Mobile controls
  const handleTap = () => {
    if (!gameActive || gameOver) return;
    
    const { player } = gameStateRef.current;
    
    if (!player.jumping) {
      player.jumping = true;
      player.velY = JUMP_FORCE;
      
      // Higher jump with power up
      if (player.powerUp) {
        player.velY = JUMP_FORCE * 1.5;
      }
    }
  };
  
  const handleMoveLeft = () => {
    if (!gameActive || gameOver) return;
    gameStateRef.current.player.moving = -1;
  };
  
  const handleMoveRight = () => {
    if (!gameActive || gameOver) return;
    gameStateRef.current.player.moving = 1;
  };
  
  const handleMoveStop = () => {
    if (!gameActive || gameOver) return;
    gameStateRef.current.player.moving = 0;
  };
  
  const startGame = () => {
    initGame();
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Jumping Ninja</h1>
        <div className="flex justify-center items-center gap-4">
          <div className="text-xl">Score: {score}</div>
          {highScore > 0 && <div className="text-xl">Best: {highScore}</div>}
        </div>
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Help the ninja jump between platforms. Collect power-ups and avoid falling to reach the highest score.
          </p>
          <div className="mb-4">
            <h3 className="font-bold mb-2">Controls:</h3>
            <p>Arrow keys or WASD to move</p>
            <p>Space or Up Arrow to jump</p>
          </div>
          <Button 
            onClick={startGame}
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={startGame}
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Game Canvas */}
          <canvas 
            ref={canvasRef} 
            className="border-2 border-gray-300 rounded-lg bg-white" 
            width="400" 
            height="500"
            onClick={handleTap}
          />
          
          {/* Mobile Controls */}
          <div className="mt-4 flex justify-between w-full">
            <div>
              <Button
                onMouseDown={handleMoveLeft}
                onMouseUp={handleMoveStop}
                onTouchStart={handleMoveLeft}
                onTouchEnd={handleMoveStop}
                className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold mr-2"
              >
                ←
              </Button>
            </div>
            <div>
              <Button
                onClick={handleTap}
                className="bg-game-arcade hover:bg-game-arcade/90 text-black px-12 py-3 rounded-lg font-bold"
              >
                JUMP
              </Button>
            </div>
            <div>
              <Button
                onMouseDown={handleMoveRight}
                onMouseUp={handleMoveStop}
                onTouchStart={handleMoveRight}
                onTouchEnd={handleMoveStop}
                className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold ml-2"
              >
                →
              </Button>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
