
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Beat patterns (represents timing of beats in milliseconds)
const PATTERNS = [
  // Easy pattern
  [1000, 1000, 1000, 1000],
  // Medium pattern
  [500, 500, 1000, 500, 500],
  // Hard pattern
  [500, 250, 250, 500, 250, 250, 1000],
  // Expert pattern
  [250, 250, 250, 250, 500, 250, 250, 250, 250, 500]
];

export function RhythmTap() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [patternIndex, setPatternIndex] = useState(0);
  const [nextBeatTime, setNextBeatTime] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [combo, setCombo] = useState(0);
  const [accuracy, setAccuracy] = useState<number[]>([]);
  
  const beatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef(0);

  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(0);
    setCombo(0);
    setAccuracy([]);
    startLevel(0);
  };

  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    
    if (beatTimerRef.current) {
      clearTimeout(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    
    saveScore("rhythm-tap", score);
    
    if (completed) {
      toast.success(`Game completed! Final score: ${score}`);
    } else {
      toast.info(`Game over! Your score: ${score}`);
    }
  };

  // Start a new level
  const startLevel = (levelIndex: number) => {
    if (levelIndex >= PATTERNS.length) {
      endGame(true);
      return;
    }
    
    setLevel(levelIndex);
    setCurrentPattern(PATTERNS[levelIndex]);
    setPatternIndex(0);
    
    // Schedule first beat
    scheduleBeat(0);
  };

  // Schedule next beat
  const scheduleBeat = (index: number) => {
    if (index >= currentPattern.length) {
      // Pattern complete, evaluate performance and move to next level
      const avgAccuracy = accuracy.reduce((sum, val) => sum + val, 0) / accuracy.length;
      
      if (avgAccuracy > 80) {
        toast.success(`Great job! Accuracy: ${Math.round(avgAccuracy)}%`);
        setScore(score + Math.round(avgAccuracy) + (combo * 5));
        setLevel(prevLevel => prevLevel + 1);
        setAccuracy([]);
        
        // Short delay before next level
        setTimeout(() => {
          startLevel(level + 1);
        }, 1500);
      } else {
        toast.error(`Try again! Accuracy: ${Math.round(avgAccuracy)}%`);
        // Retry same level
        setAccuracy([]);
        
        // Short delay before retry
        setTimeout(() => {
          startLevel(level);
        }, 1500);
      }
      
      return;
    }
    
    // Calculate when the next beat should occur
    const delay = currentPattern[index];
    const beatTime = Date.now() + delay;
    setNextBeatTime(beatTime);
    
    // Schedule the next beat
    beatTimerRef.current = setTimeout(() => {
      // If no tap was registered, count as miss
      if (patternIndex === index) {
        setFeedback("Miss!");
        setCombo(0);
        setAccuracy([...accuracy, 0]);
        setPatternIndex(index + 1);
      }
      
      scheduleBeat(index + 1);
    }, delay);
  };

  // Handle player tap
  const handleTap = () => {
    if (!gameActive || gameOver) return;
    
    const now = Date.now();
    lastTapTimeRef.current = now;
    
    // Calculate timing accuracy
    const timeDifference = Math.abs(now - nextBeatTime);
    const beatDuration = currentPattern[patternIndex];
    
    // Convert time difference to accuracy percentage (0-100)
    let accuracyScore = 0;
    
    if (timeDifference < beatDuration * 0.1) {
      // Perfect (within 10% of beat duration)
      accuracyScore = 100;
      setFeedback("Perfect!");
      setCombo(combo + 1);
    } else if (timeDifference < beatDuration * 0.25) {
      // Good (within 25% of beat duration)
      accuracyScore = 75;
      setFeedback("Good!");
      setCombo(combo + 1);
    } else if (timeDifference < beatDuration * 0.5) {
      // OK (within 50% of beat duration)
      accuracyScore = 50;
      setFeedback("OK");
      setCombo(0);
    } else {
      // Miss (beyond 50% of beat duration)
      accuracyScore = 25;
      setFeedback("Bad");
      setCombo(0);
    }
    
    setAccuracy([...accuracy, accuracyScore]);
    setPatternIndex(patternIndex + 1);
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (beatTimerRef.current) {
        clearTimeout(beatTimerRef.current);
        beatTimerRef.current = null;
      }
    };
  }, []);

  // Beat visualization
  const beatProgress = useRef(0);
  
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const interval = setInterval(() => {
      if (nextBeatTime > 0) {
        const now = Date.now();
        const totalTime = currentPattern[patternIndex] || 1000;
        const elapsed = totalTime - Math.max(0, nextBeatTime - now);
        beatProgress.current = (elapsed / totalTime) * 100;
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [gameActive, gameOver, nextBeatTime, patternIndex, currentPattern]);

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Rhythm Tap</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Level: {level + 1}</div>
            <div className="text-xl font-bold">Combo: {combo}x</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Tap in rhythm with the beats! The closer to the beat, the higher your accuracy score.
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
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Feedback display */}
          <div className="text-3xl font-bold h-16 mb-4">{feedback}</div>
          
          {/* Beat visualization */}
          <div className="w-full h-4 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-game-arcade transition-all"
              style={{ width: `${beatProgress.current}%` }}
            />
          </div>
          
          {/* Tap button */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-40 h-40"
          >
            <button
              onClick={handleTap}
              className="w-full h-full rounded-full bg-game-arcade hover:bg-orange-300 text-black font-bold text-xl flex items-center justify-center shadow-lg"
            >
              TAP
            </button>
          </motion.div>
          
          {/* Pattern visualization */}
          <div className="flex justify-center gap-2 mt-8">
            {currentPattern.map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full ${
                  i < patternIndex ? "bg-green-500" : i === patternIndex ? "bg-game-arcade animate-pulse" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
