
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    "cat", "dog", "bat", "hat", "sun", "run", "fun", "box", "fox", "sky",
    "map", "cap", "nap", "tap", "pen", "hen", "ten", "red", "bed", "fed",
    "pot", "hot", "dot", "lot", "jog", "log", "fog", "big", "pig", "wig"
  ],
  medium: [
    "black", "white", "green", "house", "mouse", "cloud", "proud", "party",
    "happy", "dance", "plant", "truck", "clock", "block", "light", "night",
    "right", "tight", "smile", "while", "frown", "crown", "beach", "peach",
    "teach", "reach", "sweet", "treat", "meat", "wheat"
  ],
  hard: [
    "elephant", "computer", "vacation", "dinosaur", "mountain", "birthday",
    "keyboard", "monitor", "exercise", "sandwich", "calendar", "question",
    "adventure", "treasure", "princess", "chocolate", "telescope", "afternoon",
    "butterfly", "beginning", "beautiful", "wonderful", "different", "important",
    "dangerous", "everyone", "together", "remember", "universe", "community"
  ]
};

// Game settings
const INITIAL_WORD_TIME = 7; // Starting time per word in seconds
const DIFFICULTY_MULTIPLIER = {
  easy: 1,
  medium: 1.3,
  hard: 1.6
};
const TIME_DECREASE_RATE = 0.1; // Seconds to decrease per correct word

// Word Rush game component
export function WordRush() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_WORD_TIME);
  const [wordCount, setWordCount] = useState(0);
  const [wordTimeLimit, setWordTimeLimit] = useState(INITIAL_WORD_TIME);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setWordCount(0);
    setStreak(0);
    setHighestStreak(0);
    setWordTimeLimit(INITIAL_WORD_TIME);
    setTimeLeft(INITIAL_WORD_TIME);
    setUserInput("");
    getNewWord();
    
    // Focus on input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    toast.success(`Game started! Difficulty: ${difficulty}`);
  };
  
  // Get a new random word from the word list
  const getNewWord = () => {
    const wordList = WORD_LISTS[difficulty];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const newWord = wordList[randomIndex];
    
    // Ensure we don't get the same word twice in a row
    if (newWord === currentWord && wordList.length > 1) {
      getNewWord();
    } else {
      setCurrentWord(newWord);
      setTimeLeft(wordTimeLimit);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    setUserInput(value);
    
    // Check if input matches current word
    if (value === currentWord) {
      // Correct match
      handleCorrectWord();
    }
  };
  
  // Handle correct word
  const handleCorrectWord = () => {
    const difficultyScore = currentWord.length * DIFFICULTY_MULTIPLIER[difficulty];
    const timeBonus = Math.round(timeLeft * 2);
    const streakBonus = streak * 5;
    const wordScore = Math.round(difficultyScore + timeBonus + streakBonus);
    
    // Update score
    setScore(prevScore => prevScore + wordScore);
    
    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    // Update highest streak
    if (newStreak > highestStreak) {
      setHighestStreak(newStreak);
    }
    
    // Increase word count and get new word
    setWordCount(prevCount => prevCount + 1);
    setUserInput("");
    getNewWord();
    
    // Make game slightly faster
    if (wordTimeLimit > 3) {
      setWordTimeLimit(prev => prev - TIME_DECREASE_RATE);
    }
    
    // Show toast with score info
    toast.success(
      `+${wordScore} points! ${streak > 1 ? `${newStreak}× streak` : ''}`,
      { duration: 1500 }
    );
  };
  
  // Handle timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameActive && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 0.1;
          
          if (newTime <= 0) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          
          return Number(newTime.toFixed(1));
        });
      }, 100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, gameOver, currentWord]);
  
  // Handle timeout (when time runs out for a word)
  const handleTimeout = () => {
    // Reset streak
    setStreak(0);
    
    // Shake animation
    setShake(true);
    setTimeout(() => setShake(false), 500);
    
    // Check if game over (3 strikes)
    if (wordCount >= 3) {
      setGameOver(true);
      saveScore("word-rush", score);
      toast.error("Game over! You ran out of time.");
    } else {
      // Continue game with new word
      setUserInput("");
      getNewWord();
      toast.error("Too slow! Try the next word.");
    }
  };
  
  // Focus input field when game starts
  useEffect(() => {
    if (gameActive && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameActive, gameOver]);
  
  // Calculate timer percentage for progress bar
  const timerPercentage = (timeLeft / wordTimeLimit) * 100;

  return (
    <div className="game-container min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center mb-6">
        <motion.h1 
          className="text-4xl font-bold mb-2 text-blue-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Word Rush
        </motion.h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Type the words as quickly as you can before time runs out!
        </p>
      </div>

      {!gameActive ? (
        <motion.div 
          className="text-center max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="mb-6 text-lg text-gray-700">
            Test your typing skills by typing each word before the timer runs out. 
            The game gets faster as you progress!
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-blue-800">Select Difficulty:</h3>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => setDifficulty("easy")}
                className={`px-4 py-2 rounded-lg ${difficulty === "easy" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Easy
              </Button>
              <Button 
                onClick={() => setDifficulty("medium")}
                className={`px-4 py-2 rounded-lg ${difficulty === "medium" 
                  ? "bg-yellow-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Medium
              </Button>
              <Button 
                onClick={() => setDifficulty("hard")}
                className={`px-4 py-2 rounded-lg ${difficulty === "hard" 
                  ? "bg-red-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                Hard
              </Button>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg"
            >
              Start Game
            </Button>
          </motion.div>
        </motion.div>
      ) : gameOver ? (
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-blue-600">Game Over!</h2>
          <div className="text-7xl mb-6">⌨️</div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg inline-block">
            <div className="text-2xl mb-2">Final Score: <span className="font-bold text-blue-700">{score}</span></div>
            <div className="text-lg">Words Completed: <span className="font-bold">{wordCount}</span></div>
            <div className="text-lg">Highest Streak: <span className="font-bold">{highestStreak}</span></div>
            <div className="text-sm text-gray-500 mt-1">Difficulty: {difficulty}</div>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg"
            >
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="max-w-2xl w-full bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="bg-blue-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Words: </span>
              <span className="font-bold">{wordCount}</span>
            </div>
            
            <div className="bg-blue-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Score: </span>
              <span className="font-bold">{score}</span>
            </div>
            
            <div className="bg-blue-100 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Streak: </span>
              <span className="font-bold">{streak}×</span>
            </div>
          </div>
          
          {/* Timer */}
          <div className="mb-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                timerPercentage > 65 
                  ? 'bg-green-500' 
                  : timerPercentage > 30 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`}
              initial={{ width: `${timerPercentage}%` }}
              animate={{ width: `${timerPercentage}%` }}
              transition={{ type: "tween" }}
            />
          </div>
          
          {/* Current word display */}
          <motion.div 
            className={`text-center text-4xl font-bold mb-6 text-blue-800 p-4 rounded-lg ${
              shake ? 'bg-red-100' : 'bg-blue-50'
            }`}
            animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {currentWord}
          </motion.div>
          
          {/* Input area */}
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              autoFocus
              className="w-full text-xl p-4 rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="Type the word here..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            {/* Character matching visualization */}
            <div className="mt-2 flex justify-center items-center h-6">
              {currentWord.split('').map((char, index) => {
                const userChar = userInput[index];
                const isMatch = userChar === char;
                const isTyped = index < userInput.length;
                
                return (
                  <motion.span 
                    key={index}
                    className={`inline-block w-6 mx-0.5 text-center ${
                      isTyped 
                        ? isMatch 
                          ? 'text-green-600' 
                          : 'text-red-600' 
                        : 'text-gray-400'
                    }`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {isTyped ? (isMatch ? '✓' : '✗') : '·'}
                  </motion.span>
                );
              })}
            </div>
          </div>
          
          {/* Current stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-sm text-blue-600">Time per word</div>
              <div className="font-bold">{wordTimeLimit.toFixed(1)}s</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-sm text-blue-600">Difficulty</div>
              <div className="font-bold capitalize">{difficulty}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-sm text-blue-600">Best Streak</div>
              <div className="font-bold">{highestStreak}</div>
            </div>
          </div>
        </motion.div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
