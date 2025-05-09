
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Puzzle quotes with authors
const QUOTES = [
  {
    text: "Life is what happens when you're busy making other plans",
    author: "John Lennon"
  },
  {
    text: "The only impossible journey is the one you never begin",
    author: "Tony Robbins"
  },
  {
    text: "The purpose of our lives is to be happy",
    author: "Dalai Lama"
  },
  {
    text: "You only live once but if you do it right once is enough",
    author: "Mae West"
  },
  {
    text: "Life is really simple but we insist on making it complicated",
    author: "Confucius"
  },
  {
    text: "The way to get started is to quit talking and begin doing",
    author: "Walt Disney"
  },
  {
    text: "If life were predictable it would cease to be life",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Spread love everywhere you go",
    author: "Mother Teresa"
  },
  {
    text: "When you reach the end of your rope tie a knot in it and hang on",
    author: "Franklin D Roosevelt"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams",
    author: "Eleanor Roosevelt"
  },
];

interface RevealedState {
  [key: string]: boolean;
}

export function QuotePuzzle() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(0);
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [revealed, setRevealed] = useState<RevealedState>({});
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [hintCount, setHintCount] = useState(3);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setLevel(0);
    setGuessedLetters([]);
    setHintCount(3);
    loadQuote(0);
  };
  
  // Load quote for current level
  const loadQuote = (levelIndex: number) => {
    if (levelIndex >= QUOTES.length) {
      // Player completed all quotes
      endGame(true);
      return;
    }
    
    const quote = QUOTES[levelIndex];
    setCurrentQuote(quote.text.toLowerCase());
    setCurrentAuthor(quote.author);
    
    // Initialize revealed state - show spaces and punctuation
    const newRevealed: RevealedState = {};
    for (let i = 0; i < quote.text.length; i++) {
      const char = quote.text[i].toLowerCase();
      if (char === ' ' || char === '.' || char === ',' || char === '\'' || char === '!' || char === '?') {
        newRevealed[i] = true;
      } else {
        newRevealed[i] = false;
      }
    }
    
    setRevealed(newRevealed);
    setGuessedLetters([]);
  };
  
  // Handle letter guess
  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter.toLowerCase())) {
      toast.error("You already guessed that letter!");
      return;
    }
    
    // Add to guessed letters
    setGuessedLetters([...guessedLetters, letter.toLowerCase()]);
    
    // Check if letter exists in quote
    let found = false;
    const newRevealed = { ...revealed };
    
    for (let i = 0; i < currentQuote.length; i++) {
      if (currentQuote[i] === letter.toLowerCase()) {
        newRevealed[i] = true;
        found = true;
      }
    }
    
    setRevealed(newRevealed);
    
    // Update score
    if (found) {
      // Count occurrences of letter in quote
      const occurrences = currentQuote.split(letter.toLowerCase()).length - 1;
      const pointsEarned = 10 * occurrences;
      setScore(score + pointsEarned);
      toast.success(`+${pointsEarned} points!`);
    } else {
      // Penalty for wrong guess
      setTimeLeft(Math.max(0, timeLeft - 5));
      toast.error("Wrong guess! -5 seconds");
    }
    
    // Check if all letters are revealed
    checkCompletion(newRevealed);
  };
  
  // Check if quote is complete
  const checkCompletion = (revealedState: RevealedState) => {
    for (let i = 0; i < currentQuote.length; i++) {
      const char = currentQuote[i];
      // Skip spaces and punctuation
      if (char === ' ' || char === '.' || char === ',' || char === '\'' || char === '!' || char === '?') {
        continue;
      }
      // If any letter is not revealed, quote is not complete
      if (!revealedState[i]) {
        return false;
      }
    }
    
    // All letters are revealed
    completeLevel();
    return true;
  };
  
  // Complete current level
  const completeLevel = () => {
    // Bonus points for completing the quote
    const timeBonus = timeLeft * 5;
    setScore(score + timeBonus);
    
    toast.success(`Quote completed! +${timeBonus} bonus points`);
    
    // Move to next level
    setTimeout(() => {
      setLevel(level + 1);
      loadQuote(level + 1);
      
      // Add some time and hints for next level
      setTimeLeft(timeLeft + 30);
      setHintCount(hintCount + 1);
      
      toast.success(`Level ${level + 2}`);
    }, 1500);
  };
  
  // Use hint - reveal a random letter
  const useHint = () => {
    if (hintCount <= 0) {
      toast.error("No hints left!");
      return;
    }
    
    // Find unrevealed letters
    const unrevealed: number[] = [];
    for (let i = 0; i < currentQuote.length; i++) {
      const char = currentQuote[i];
      // Skip spaces and punctuation
      if (char === ' ' || char === '.' || char === ',' || char === '\'' || char === '!' || char === '?') {
        continue;
      }
      // If not revealed, add to list
      if (!revealed[i]) {
        unrevealed.push(i);
      }
    }
    
    if (unrevealed.length === 0) {
      toast.info("All letters are already revealed!");
      return;
    }
    
    // Pick random unrevealed letter
    const randomIndex = Math.floor(Math.random() * unrevealed.length);
    const revealIndex = unrevealed[randomIndex];
    
    // Reveal the letter
    const letter = currentQuote[revealIndex];
    
    // Add to guessed letters
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters([...guessedLetters, letter]);
    }
    
    // Update revealed state
    const newRevealed = { ...revealed };
    
    // Reveal all instances of this letter
    let count = 0;
    for (let i = 0; i < currentQuote.length; i++) {
      if (currentQuote[i] === letter) {
        newRevealed[i] = true;
        count++;
      }
    }
    
    setRevealed(newRevealed);
    setHintCount(hintCount - 1);
    
    toast.success(`Hint used! Revealed letter "${letter.toUpperCase()}" (${count} occurrences)`);
    
    // Check if all letters are revealed
    checkCompletion(newRevealed);
  };
  
  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("quote-puzzle", score);
    
    if (completed) {
      toast.success(`All quotes completed! Final score: ${score}`);
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
  
  // Get available letters (A-Z)
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Quote Puzzle</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
            <div className="text-xl font-bold">Level: {level + 1}/{QUOTES.length}</div>
            <div className="text-xl font-bold">Hints: {hintCount}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Guess the letters to reveal famous quotes. Earn points for correct guesses and complete all quotes to win!
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
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          {/* Quote display */}
          <div className="p-6 bg-gray-100 rounded-lg mb-8 min-h-24 w-full">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {currentQuote.split('').map((letter, index) => {
                if (letter === ' ') {
                  return <span key={index} className="w-4"></span>;
                } else if (letter === '.' || letter === ',' || letter === '\'' || letter === '!' || letter === '?') {
                  return (
                    <span key={index} className="w-8 h-8 flex items-center justify-center text-xl">
                      {letter}
                    </span>
                  );
                } else {
                  return (
                    <motion.span
                      key={index}
                      initial={{ scale: revealed[index] ? 1 : 0.8 }}
                      animate={{ 
                        scale: revealed[index] ? 1 : 0.8,
                        opacity: revealed[index] ? 1 : 0.7
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className={`w-8 h-8 flex items-center justify-center border-b-2 ${
                        revealed[index] ? 'border-green-500' : 'border-gray-400'
                      } text-xl font-bold`}
                    >
                      {revealed[index] ? letter.toUpperCase() : ""}
                    </motion.span>
                  );
                }
              })}
            </div>
            <div className="text-sm text-center mt-4 text-gray-500">
              — {currentAuthor}
            </div>
          </div>
          
          {/* Letter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {alphabet.map((letter) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-md font-bold ${
                  guessedLetters.includes(letter.toLowerCase()) 
                    ? currentQuote.includes(letter.toLowerCase())
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-red-500 text-white cursor-not-allowed'
                    : 'bg-game-word hover:bg-blue-300'
                }`}
                onClick={() => guessLetter(letter)}
                disabled={guessedLetters.includes(letter.toLowerCase())}
              >
                {letter}
              </motion.button>
            ))}
          </div>
          
          {/* Hint button */}
          <Button 
            onClick={useHint}
            disabled={hintCount <= 0}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            Use Hint ({hintCount} left)
          </Button>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
