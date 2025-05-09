
import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";
import { Timer } from "lucide-react";

export function TapTheButton() {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished">("waiting");
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Start the game
  const startGame = () => {
    setTaps(0);
    setTimeLeft(10);
    setGameState("playing");
    
    // Start timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState("finished");
          const finalScore = taps;
          saveScore("tap-button", finalScore);
          if (finalScore > highScore) {
            setHighScore(finalScore);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle tap/click
  const handleTap = () => {
    if (gameState === "playing") {
      setTaps(prev => prev + 1);
    }
  };
  
  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Tap The Button</h1>
        <div className="flex justify-between px-6 mb-2">
          <div className="flex items-center text-xl font-bold">
            <Timer className="mr-2" />
            {timeLeft}s
          </div>
          <div className="text-xl font-bold">
            {highScore > 0 ? `Best: ${highScore} taps` : ""}
          </div>
        </div>
      </div>
      
      {gameState === "waiting" ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Tap the button as fast as you can in 10 seconds! 
            Test your tapping speed and try to beat your high score.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : gameState === "playing" ? (
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="text-4xl font-bold mb-6">{taps}</div>
          <button
            onClick={handleTap}
            className="w-48 h-48 bg-game-primary rounded-full flex items-center justify-center text-white text-2xl font-bold transform transition-transform active:scale-95 hover:bg-game-secondary"
          >
            TAP!
          </button>
        </div>
      ) : (
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-3xl font-bold mb-4">Time's Up!</div>
          <div className="text-2xl mb-6">
            Your Score: <span className="font-bold">{taps} taps</span>
          </div>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
