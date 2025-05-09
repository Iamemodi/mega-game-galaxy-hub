
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPACING = 200;
const BIRD_SIZE = 30;

// Game entities
interface Bird {
  x: number;
  y: number;
  velocity: number;
  width: number;
  height: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  scored: boolean;
}

export function FlappyBird() {
  const [gameActive, setGameActive] = useState(false);
  const [bird, setBird] = useState<Bird>({
    x: 50,
    y: 150,
    velocity: 0,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
  });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastPipeTime = useRef<number>(0);
  const gameWidth = 320;
  const gameHeight = 480;
  
  // Set up game loop
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameLoop = (timestamp: number) => {
      if (!gameActive || gameOver) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create new pipes
      if (timestamp - lastPipeTime.current > PIPE_SPACING * 10) {
        const pipeGap = PIPE_GAP;
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        
        const newPipe: Pipe = {
          x: canvas.width,
          topHeight,
          bottomY: topHeight + pipeGap,
          width: PIPE_WIDTH,
          scored: false,
        };
        
        setPipes(prevPipes => [...prevPipes, newPipe]);
        lastPipeTime.current = timestamp;
      }
      
      // Update and draw pipes
      setPipes(prevPipes => {
        const newPipes = prevPipes
          .map(pipe => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED,
          }))
          .filter(pipe => pipe.x > -pipe.width);
        
        // Draw pipes
        ctx.fillStyle = '#2ecc71';
        newPipes.forEach(pipe => {
          // Top pipe
          ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
          
          // Bottom pipe
          ctx.fillRect(
            pipe.x,
            pipe.bottomY,
            pipe.width,
            canvas.height - pipe.bottomY
          );
        });
        
        return newPipes;
      });
      
      // Update bird physics
      setBird(prevBird => {
        const newVelocity = prevBird.velocity + GRAVITY;
        const newY = prevBird.y + newVelocity;
        
        // Draw bird
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(prevBird.x, newY, BIRD_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        
        return {
          ...prevBird,
          y: newY,
          velocity: newVelocity,
        };
      });
      
      // Check collisions
      const birdRect = {
        left: bird.x - bird.width/2,
        right: bird.x + bird.width/2,
        top: bird.y - bird.height/2,
        bottom: bird.y + bird.height/2,
      };
      
      // Check pipe collisions
      let collision = false;
      pipes.forEach(pipe => {
        // Check collision with top pipe
        if (
          birdRect.right > pipe.x &&
          birdRect.left < pipe.x + pipe.width &&
          birdRect.top < pipe.topHeight
        ) {
          collision = true;
        }
        
        // Check collision with bottom pipe
        if (
          birdRect.right > pipe.x &&
          birdRect.left < pipe.x + pipe.width &&
          birdRect.bottom > pipe.bottomY
        ) {
          collision = true;
        }
        
        // Check if bird passed pipe (scoring)
        if (
          !pipe.scored &&
          bird.x > pipe.x + pipe.width
        ) {
          setScore(prevScore => prevScore + 1);
          pipe.scored = true;
        }
      });
      
      // Check ceiling and floor collisions
      if (bird.y - bird.height/2 <= 0 || bird.y + bird.height/2 >= canvas.height) {
        collision = true;
      }
      
      // Handle collision
      if (collision) {
        setGameOver(true);
        saveScore("flappy-bird", score);
        
        // Update high score
        if (score > highScore) {
          setHighScore(score);
        }
        
        return;
      }
      
      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, 30);
      
      // Continue game loop
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId.current = requestAnimationFrame(gameLoop);
    
    // Clean up
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameActive, gameOver, bird.x, bird.y]);
  
  // Handle jump
  const handleJump = () => {
    if (gameOver) return;
    
    if (!gameActive) {
      startGame();
      return;
    }
    
    setBird(prevBird => ({
      ...prevBird,
      velocity: JUMP_FORCE,
    }));
  };
  
  // Handle key press for jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        handleJump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, gameOver]);
  
  // Start new game
  const startGame = () => {
    setBird({
      x: 50,
      y: 150,
      velocity: 0,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
    });
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    lastPipeTime.current = performance.now();
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Flappy Bird</h1>
        <div className="flex justify-center gap-8">
          <div className="text-xl font-bold">Score: {score}</div>
          <div className="text-xl font-bold">High Score: {highScore}</div>
        </div>
      </div>
      
      <div 
        className="relative mx-auto" 
        style={{ width: gameWidth, height: gameHeight }}
        onClick={handleJump}
      >
        <canvas 
          ref={canvasRef} 
          width={gameWidth}
          height={gameHeight}
          className="border-2 border-black rounded-md"
        />
        
        {!gameActive && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Flappy Bird</h2>
            <p className="mb-4">Click or press Space to flap</p>
            <Button 
              onClick={startGame}
              className="bg-game-arcade text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameOver && (
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
      
      <p className="text-center mt-4">
        Click or press Space to flap your wings
      </p>
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
