
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Word pairs where each pair has a connection
const WORD_PAIRS = [
  { pair: ["Dog", "Cat"], connection: "Pets" },
  { pair: ["Sun", "Moon"], connection: "Celestial bodies" },
  { pair: ["Fork", "Spoon"], connection: "Cutlery" },
  { pair: ["Piano", "Guitar"], connection: "Musical instruments" },
  { pair: ["Red", "Blue"], connection: "Colors" },
  { pair: ["Winter", "Summer"], connection: "Seasons" },
  { pair: ["Car", "Bus"], connection: "Vehicles" },
  { pair: ["Apple", "Banana"], connection: "Fruits" },
  { pair: ["River", "Lake"], connection: "Bodies of water" },
  { pair: ["King", "Queen"], connection: "Royalty" },
  { pair: ["Book", "Newspaper"], connection: "Reading materials" },
  { pair: ["Soccer", "Basketball"], connection: "Sports" },
];

export function WordAssociation() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPair, setCurrentPair] = useState<typeof WORD_PAIRS[0] | null>(null);
  const [userInput, setUserInput] = useState("");
  const [usedPairs, setUsedPairs] = useState<number[]>([]);

  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setUserInput("");
    setUsedPairs([]);
    getNewPair();
  };

  // Get a new word pair
  const getNewPair = () => {
    // Get unused pairs
    const availablePairs = WORD_PAIRS.filter((_, index) => !usedPairs.includes(index));
    
    if (availablePairs.length === 0) {
      // If all pairs have been used, end the game with victory
      toast.success("You've completed all the word pairs!");
      endGame(true);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePairs.length);
    const pairIndex = WORD_PAIRS.indexOf(availablePairs[randomIndex]);
    
    setCurrentPair(availablePairs[randomIndex]);
    setUsedPairs([...usedPairs, pairIndex]);
  };

  // Check user's guess
  const checkAnswer = () => {
    if (!currentPair) return;
    
    const userGuess = userInput.trim().toLowerCase();
    const correctAnswer = currentPair.connection.toLowerCase();
    
    // Check if the user's answer is correct or similar
    if (userGuess === correctAnswer) {
      toast.success("Correct!");
      setScore(score + 10);
      setUserInput("");
      getNewPair();
    } else if (isCloseEnough(userGuess, correctAnswer)) {
      toast.success("Close enough! The connection was: " + currentPair.connection);
      setScore(score + 5);
      setUserInput("");
      getNewPair();
    } else {
      toast.error(`Incorrect. The connection was: ${currentPair.connection}`);
      setScore(Math.max(0, score - 5));
      setUserInput("");
      getNewPair();
    }
  };

  // Check if the user's answer is close enough (simple string comparison)
  const isCloseEnough = (userGuess: string, correctAnswer: string) => {
    // Check if the user's guess contains part of the correct answer or vice versa
    return userGuess.includes(correctAnswer.split(" ")[0].toLowerCase()) || 
           correctAnswer.includes(userGuess.split(" ")[0]);
  };

  // Submit on enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim()) {
      checkAnswer();
    }
  };

  // Skip current pair
  const handleSkip = () => {
    toast.info(`Skipped. The connection was: ${currentPair?.connection}`);
    getNewPair();
    setUserInput("");
  };

  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("word-association", score);
    
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
  }, [gameActive, gameOver, score]);

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Word Association</h1>
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
            Find the connection between the two words shown. Type your answer and submit!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-word hover:bg-blue-300 text-black px-6 py-3 rounded-lg font-bold"
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
              className="bg-game-word hover:bg-blue-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center max-w-lg mx-auto">
          {currentPair && (
            <>
              <div className="flex gap-8 mb-8 items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-game-word p-8 rounded-xl text-2xl font-bold"
                >
                  {currentPair.pair[0]}
                </motion.div>
                <div className="text-xl font-bold">⟷</div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-game-word p-8 rounded-xl text-2xl font-bold"
                >
                  {currentPair.pair[1]}
                </motion.div>
              </div>
              
              <p className="mb-4">What connects these words?</p>
              
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type the connection..."
                className="w-full p-3 rounded-md border mb-4 focus:outline-none focus:ring-2 focus:ring-game-word"
                autoFocus
              />
              
              <div className="flex gap-4">
                <Button
                  onClick={checkAnswer}
                  disabled={!userInput.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Submit
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                >
                  Skip
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
