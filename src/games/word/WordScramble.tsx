
import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

// Word bank
const WORDS = [
  "APPLE", "BEACH", "CLOUD", "DANCE", "EARTH", 
  "FLOWER", "GUITAR", "HAPPY", "ISLAND", "JUNGLE",
  "KARATE", "LEMON", "MUSIC", "NATURE", "OXYGEN",
  "PUZZLE", "QUEEN", "RIVER", "SUMMER", "TIGER",
  "UNIQUE", "VIVID", "WATER", "XYLOPHONE", "YELLOW",
  "ZEBRA", "ANCHOR", "BRIDGE", "CAMERA", "DRAGON"
];

export function WordScramble() {
  const [word, setWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Start game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    setUsedWords([]);
    setFeedback("");
    getNewWord();
    
    // Start timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setGameActive(false);
          setGameOver(true);
          saveScore("word-scramble", score);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Focus on input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Get a new word and scramble it
  const getNewWord = () => {
    let availableWords = WORDS.filter(w => !usedWords.includes(w));
    
    // If we've used all words, reset the used words list
    if (availableWords.length === 0) {
      availableWords = [...WORDS];
      setUsedWords([]);
    }
    
    // Pick a random word
    const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setWord(newWord);
    setUsedWords([...usedWords, newWord]);
    
    // Scramble the word
    const scrambled = scrambleWord(newWord);
    setScrambledWord(scrambled);
    setGuess("");
  };
  
  // Scramble a word
  const scrambleWord = (word: string) => {
    const letters = word.split("");
    
    // Fisher-Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    const scrambled = letters.join("");
    
    // If we accidentally unscrambled the word, try again
    if (scrambled === word) {
      return scrambleWord(word);
    }
    
    return scrambled;
  };
  
  // Handle guess submission
  const submitGuess = () => {
    if (!gameActive) return;
    
    if (guess.toUpperCase() === word) {
      setFeedback("Correct! +5 seconds");
      setScore(score + 1);
      setTimeLeft(prev => Math.min(prev + 5, 60));
      getNewWord();
    } else {
      setFeedback("Try again!");
      setGuess("");
    }
  };
  
  // Clean up timer on unmount
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
        <h1 className="text-3xl font-bold mb-2">Word Scramble</h1>
        
        {gameActive && (
          <div className="flex justify-between px-6 mb-6">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
          </div>
        )}
      </div>
      
      {!gameActive && !gameOver ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Unscramble as many words as you can before time runs out!
            Each correct answer gives you 5 extra seconds.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your final score: {score}</p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="text-center max-w-md mx-auto">
          <div className="text-3xl font-bold tracking-wider mb-8">
            {scrambledWord}
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              submitGuess();
            }}
            className="mb-4"
          >
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              className="px-4 py-2 border border-gray-300 rounded-l-lg text-center text-xl uppercase"
              placeholder="Your guess"
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-game-primary text-white rounded-r-lg hover:bg-game-secondary transition-colors"
            >
              Submit
            </button>
          </form>
          
          {feedback && (
            <div className={`text-lg font-bold ${feedback.includes("Correct") ? "text-green-600" : "text-red-600"}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
