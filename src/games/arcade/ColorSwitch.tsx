
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Game colors
const COLORS = ["red", "blue", "green", "yellow"];
const COLOR_CLASSES = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500"
};

export function ColorSwitch() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [ballColor, setBallColor] = useState("red");
  const [obstacleColor, setObstacleColor] = useState("blue");
  const [obstaclePosition, setObstaclePosition] = useState(100);
  const [ballPosition, setBallPosition] = useState(0);
  const [ballVelocity, setBallVelocity] = useState(3);
  const [falling, setFalling] = useState(true);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setBallPosition(0);
    setBallVelocity(3);
    setFalling(true);
    setBallColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setObstacleColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setObstaclePosition(100);
  };

  // End game
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    saveScore("color-switch", score);
    toast.info(`Game over! Your score: ${score}`);
  };

  // Handle ball color change when player taps/clicks
  const handleColorChange = () => {
    if (!gameActive || gameOver) return;
    
    const nextColorIndex = (COLORS.indexOf(ballColor) + 1) % COLORS.length;
    setBallColor(COLORS[nextColorIndex]);
    
    // Change direction of ball on tap
    setFalling(!falling);
  };

  // Game animation loop
  const gameLoop = () => {
    if (!gameActive || gameOver || !gameRef.current) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }
    
    // Update ball position
    let newPosition = ballPosition + (falling ? ballVelocity : -ballVelocity);
    
    // Check boundaries
    const gameHeight = gameRef.current.clientHeight;
    
    // Bounce off top
    if (newPosition < 0) {
      newPosition = 0;
      setFalling(true);
    }
    
    // Check if ball hits bottom
    if (newPosition > gameHeight - 40) {
      endGame();
      return;
    }
    
    // Check if ball passes through obstacle
    if (Math.abs(newPosition - obstaclePosition) < 10) {
      if (ballColor !== obstacleColor) {
        // Game over if colors don't match
        endGame();
        return;
      } else {
        // Increment score and generate new obstacle
        setScore(score + 1);
        setObstacleColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setObstaclePosition(Math.floor(Math.random() * (gameHeight - 100)) + 50);
        
        // Increase ball velocity as score increases
        if (score > 0 && score % 5 === 0) {
          setBallVelocity(Math.min(ballVelocity + 0.5, 8));
        }
      }
    }
    
    setBallPosition(newPosition);
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  // Start game loop when active
  useEffect(() => {
    if (gameActive && !gameOver) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [gameActive, gameOver, ballPosition, falling, score, ballColor, obstacleColor]);

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

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Color Switch</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Tap to change the ball color. Match the obstacle's color to pass through it!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-arcade hover:bg-orange-300 text-black px-6 py-3 rounded-lg font-bold"
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
              className="bg-game-arcade hover:bg-orange-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div 
          ref={gameRef}
          className="relative w-full max-w-md mx-auto h-[500px] border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100"
          onClick={handleColorChange}
        >
          {/* Ball */}
          <motion.div
            animate={{ y: ballPosition }}
            transition={{ type: "tween", duration: 0.05 }}
            className={`absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full ${COLOR_CLASSES[ballColor as keyof typeof COLOR_CLASSES]}`}
          />
          
          {/* Obstacle */}
          <div
            className={`absolute left-0 w-full h-4 ${COLOR_CLASSES[obstacleColor as keyof typeof COLOR_CLASSES]}`}
            style={{ top: `${obstaclePosition}px` }}
          />
          
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-bold">
            Tap to switch color
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
