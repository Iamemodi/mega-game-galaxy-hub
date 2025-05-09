import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

export function TapDot() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 });
  const [dotSize, setDotSize] = useState(40);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    moveDot();
  };

  // Restart the game
  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setDotSize(40);
  };

  // Move the dot to a random position
  const moveDot = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    const maxX = gameArea.clientWidth - dotSize;
    const maxY = gameArea.clientHeight - dotSize;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    setDotPosition({ x: newX, y: newY });
  };

  // Handle dot click
  const handleDotClick = () => {
    if (!gameStarted || gameOver) return;
    
    setScore(score + 1);
    moveDot();
    
    // Make dot smaller as score increases
    if (score > 0 && score % 5 === 0 && dotSize > 15) {
      setDotSize(prevSize => Math.max(prevSize - 3, 15));
    }
  };

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          saveScore("tap-dot", score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score]);

  // Adjust game area on window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameStarted && !gameOver) {
        moveDot();
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gameStarted, gameOver]);

  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <div className="flex justify-between px-6 mb-2">
          <div className="text-xl font-bold">Score: {score}</div>
          <div className="text-xl font-bold">Time: {timeLeft}s</div>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Tap the Dot</h1>
          <p className="mb-6">
            Test your reflexes! Tap on the moving dot as many times as you can before the time runs out.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStarted && !gameOver && (
        <div 
          ref={gameAreaRef} 
          className="relative flex-1 w-full max-w-4xl mx-auto overflow-hidden"
        >
          <div
            className="absolute rounded-full bg-game-primary transition-shadow animate-pulse-soft cursor-pointer"
            style={{
              left: `${dotPosition.x}px`,
              top: `${dotPosition.y}px`,
              width: `${dotSize}px`,
              height: `${dotSize}px`,
            }}
            onClick={handleDotClick}
          />
        </div>
      )}

      {gameOver && (
        <div className="text-center p-8 animate-pop max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Game Over!</h1>
          <p className="text-2xl mb-6">Your Score: {score}</p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <GameControls onRestart={restartGame} />
    </div>
  );
}
