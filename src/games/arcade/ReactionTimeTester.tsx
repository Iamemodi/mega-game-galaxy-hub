
import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

export function ReactTimeTester() {
  const [state, setState] = useState<"waiting" | "ready" | "clicked" | "tooEarly">("waiting");
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const waitTimeoutRef = useRef<number | null>(null);

  // Start a new round
  const startGame = () => {
    setState("waiting");
    setReactionTime(null);
    setCountdown(3);
    setAttempts(0);
    
    // Start countdown
    const countdownInterval = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start a reaction test round
  const startRound = () => {
    // Random delay between 1-5 seconds
    const delay = Math.floor(Math.random() * 4000) + 1000;
    
    waitTimeoutRef.current = window.setTimeout(() => {
      setState("ready");
      setStartTime(Date.now());
    }, delay);
  };

  // Handle the click on the reaction area
  const handleClick = () => {
    if (state === "waiting") {
      // Clicked too early
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = null;
      }
      setState("tooEarly");
      return;
    }
    
    if (state === "ready") {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      
      // Update best time
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      
      setState("clicked");
      
      // Save score to game storage
      saveScore("reaction-tester", time, "min");
      
      // Start another round if under 5 attempts
      setAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts < 5) {
          setTimeout(startRound, 2000);
        }
        return newAttempts;
      });
    }
  };

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    };
  }, []);

  // Get the appropriate background color based on game state
  const getBackgroundColor = () => {
    switch (state) {
      case "waiting": return "bg-amber-100";
      case "ready": return "bg-green-500";
      case "clicked": return "bg-blue-100";
      case "tooEarly": return "bg-red-500";
      default: return "bg-amber-100";
    }
  };

  // Get the appropriate message based on game state
  const getMessage = () => {
    switch (state) {
      case "waiting": 
        return countdown > 0 
          ? `Get Ready... ${countdown}` 
          : "Wait for green...";
      case "ready": return "Click Now!";
      case "clicked": return `${reactionTime}ms`;
      case "tooEarly": return "Too early! Try again.";
      default: return "Click to start";
    }
  };

  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Reaction Time Test</h1>
        <div className="flex justify-between px-6 mb-2">
          <div className="text-xl font-bold">Attempts: {attempts}/5</div>
          <div className="text-xl font-bold">
            {bestTime ? `Best: ${bestTime}ms` : "Best: --"}
          </div>
        </div>
      </div>

      {(state === "waiting" && countdown === 0) || state === "ready" || state === "clicked" || state === "tooEarly" ? (
        <div 
          className={`${getBackgroundColor()} w-full max-w-md mx-auto h-64 rounded-lg flex items-center justify-center cursor-pointer transition-colors`}
          onClick={handleClick}
        >
          <div className="text-2xl font-bold text-center">
            {getMessage()}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Test your reaction time! Wait for the green color, then click as fast as you can.
            You'll get 5 attempts, and your best time will be recorded.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
