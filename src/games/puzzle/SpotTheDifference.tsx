
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Game data
const GAME_LEVELS = [
  {
    id: 1,
    image1: "https://placehold.co/600x400/e5deff/1a1f2c?text=Image+1",
    image2: "https://placehold.co/600x400/e5deff/1a1f2c?text=Image+2",
    differences: [
      { x: 150, y: 100, radius: 20 },
      { x: 450, y: 300, radius: 20 },
      { x: 300, y: 200, radius: 20 },
    ]
  },
  {
    id: 2,
    image1: "https://placehold.co/600x400/e5deff/1a1f2c?text=Image+3",
    image2: "https://placehold.co/600x400/e5deff/1a1f2c?text=Image+4",
    differences: [
      { x: 100, y: 150, radius: 20 },
      { x: 400, y: 250, radius: 20 },
      { x: 250, y: 350, radius: 20 },
      { x: 500, y: 100, radius: 20 },
    ]
  },
];

export function SpotTheDifference() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState<number[]>([]);
  
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);

  // Calculate relative click position
  const getRelativePosition = (e: React.MouseEvent) => {
    if (!imgContainerRef.current || !image1Ref.current) return { x: 0, y: 0 };
    
    const rect = imgContainerRef.current.getBoundingClientRect();
    const imgRect = image1Ref.current.getBoundingClientRect();
    
    // Scale factor between actual image size and displayed size
    const scaleX = imgRect.width / 600;
    const scaleY = imgRect.height / 400;
    
    return {
      x: (e.clientX - rect.left) / scaleX,
      y: (e.clientY - rect.top) / scaleY
    };
  };

  // Check if click is on a difference
  const handleImageClick = (e: React.MouseEvent) => {
    if (!gameActive || gameOver) return;
    
    const { x, y } = getRelativePosition(e);
    const currentLevel = GAME_LEVELS[level];
    
    for (let i = 0; i < currentLevel.differences.length; i++) {
      const diff = currentLevel.differences[i];
      const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      
      if (distance <= diff.radius && !foundDifferences.includes(i)) {
        // Found a new difference
        setFoundDifferences([...foundDifferences, i]);
        setScore(score + 10);
        toast.success("Difference found!");
        
        // Check if all differences are found for this level
        if (foundDifferences.length + 1 === currentLevel.differences.length) {
          // Move to next level or end game
          if (level < GAME_LEVELS.length - 1) {
            setLevel(level + 1);
            setFoundDifferences([]);
            toast.success("Level Complete!");
          } else {
            endGame(true);
          }
        }
        
        return;
      }
    }
    
    // If clicked but no difference found
    toast.error("Try again!");
    setScore(Math.max(0, score - 5));
  };

  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setLevel(0);
    setFoundDifferences([]);
  };

  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("spot-difference", score);
    
    if (completed) {
      toast.success(`Game completed! Final score: ${score}`);
    } else {
      toast.info(`Time's up! Your score: ${score}`);
    }
  };

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

  const currentLevel = GAME_LEVELS[level];

  // Check if all the differences in the current level have been found
  const checkFoundDifference = (index: number) => {
    return foundDifferences.includes(index);
  };

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Spot the Difference</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
            <div className="text-xl font-bold">Level: {level + 1}/{GAME_LEVELS.length}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Find all the differences between two similar images before time runs out!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-puzzle hover:bg-purple-400 text-black px-6 py-3 rounded-lg font-bold"
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
              className="bg-game-puzzle hover:bg-purple-400 text-black px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-center gap-4 items-center max-w-5xl mx-auto">
          <div 
            ref={imgContainerRef}
            className="relative border-4 border-game-puzzle rounded-lg overflow-hidden"
            onClick={handleImageClick}
          >
            <img 
              ref={image1Ref}
              src={currentLevel.image1} 
              alt="Spot the Difference Left" 
              className="max-w-full h-auto cursor-pointer"
            />
            
            {/* Highlight found differences */}
            {currentLevel.differences.map((diff, i) => (
              checkFoundDifference(i) && (
                <div 
                  key={`diff-${level}-${i}`}
                  className="absolute bg-green-500 bg-opacity-50 border-2 border-green-400 rounded-full animate-pulse"
                  style={{
                    width: diff.radius * 2,
                    height: diff.radius * 2,
                    left: diff.x - diff.radius,
                    top: diff.y - diff.radius,
                  }}
                />
              )
            ))}
          </div>
          
          <div 
            className="relative border-4 border-game-puzzle rounded-lg overflow-hidden"
            onClick={handleImageClick}
          >
            <img 
              src={currentLevel.image2} 
              alt="Spot the Difference Right" 
              className="max-w-full h-auto cursor-pointer"
            />
            
            {/* Highlight found differences */}
            {currentLevel.differences.map((diff, i) => (
              checkFoundDifference(i) && (
                <div 
                  key={`diff2-${level}-${i}`}
                  className="absolute bg-green-500 bg-opacity-50 border-2 border-green-400 rounded-full animate-pulse"
                  style={{
                    width: diff.radius * 2,
                    height: diff.radius * 2,
                    left: diff.x - diff.radius,
                    top: diff.y - diff.radius,
                  }}
                />
              )
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          {gameActive && `Found ${foundDifferences.length} of ${currentLevel.differences.length} differences`}
        </p>
      </div>

      <GameControls onRestart={startGame} />
    </div>
  );
}
