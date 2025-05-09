
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

// Word lists by category
const WORD_LISTS = {
  easy: ["CAT", "DOG", "RUN", "JUMP", "PLAY", "BALL", "BOOK", "BLUE", "RED", "SUN"],
  medium: ["APPLE", "BANANA", "ORANGE", "GUITAR", "WINDOW", "PENCIL", "JACKET", "COFFEE", "PLANET", "MUSIC"],
  hard: ["ALGORITHM", "EXPEDITION", "SAXOPHONE", "BOULEVARD", "CHEMISTRY", "QUALIFIED", "JAVASCRIPT", "PROGRAMMING", "ADVENTURE", "RECTANGLE"],
};

type Difficulty = keyof typeof WORD_LISTS;

export function Hangman() {
  const [gameActive, setGameActive] = useState(false);
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [score, setScore] = useState(0);
  
  const MAX_WRONG_GUESSES = 6;
  
  // Get a random word based on difficulty
  const getRandomWord = (diff: Difficulty) => {
    const words = WORD_LISTS[diff];
    return words[Math.floor(Math.random() * words.length)];
  };
  
  // Check if player has guessed all letters in the word
  const checkVictory = (word: string, guessed: string[]) => {
    return [...word].every(letter => guessed.includes(letter));
  };
  
  // Handle letter guess
  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver || victory) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameOver(true);
        saveScore("hangman", score);
      }
    } else {
      // Check if all letters have been guessed
      if (checkVictory(word, newGuessedLetters)) {
        setVictory(true);
        const newScore = score + calculateWordScore();
        setScore(newScore);
        
        // Move to next word after 2 seconds
        setTimeout(() => {
          startNewRound(difficulty);
        }, 2000);
      }
    }
  };
  
  // Calculate score based on word length and difficulty
  const calculateWordScore = () => {
    let difficultyMultiplier = 1;
    if (difficulty === "medium") difficultyMultiplier = 2;
    if (difficulty === "hard") difficultyMultiplier = 3;
    
    return (word.length * 10 - wrongGuesses * 5) * difficultyMultiplier;
  };
  
  // Start a new round with a new word
  const startNewRound = (diff: Difficulty) => {
    setWord(getRandomWord(diff));
    setGuessedLetters([]);
    setWrongGuesses(0);
    setVictory(false);
  };
  
  // Start game with selected difficulty
  const startGame = (diff: Difficulty = "medium") => {
    setDifficulty(diff);
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    startNewRound(diff);
  };
  
  // Initialize game when active state changes
  useEffect(() => {
    if (gameActive && !gameOver) {
      startNewRound(difficulty);
    }
  }, [gameActive]);
  
  // Render the word with revealed and hidden letters
  const renderWord = () => {
    return [...word].map((letter, index) => (
      <div 
        key={index} 
        className="inline-block mx-1 border-b-2 border-black w-8 h-10 text-center text-2xl font-bold"
      >
        {guessedLetters.includes(letter) ? letter : ""}
      </div>
    ));
  };
  
  // Generate keyboard buttons
  const renderKeyboard = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    return (
      <div className="grid grid-cols-7 gap-2 max-w-md mx-auto mt-6">
        {[...alphabet].map((letter) => (
          <Button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || gameOver || victory}
            className={`w-10 h-10 font-bold text-lg p-0 
              ${guessedLetters.includes(letter) ? 
                word.includes(letter) ? 'bg-green-500' : 'bg-red-500' 
                : 'bg-game-word text-black'}`
            }
          >
            {letter}
          </Button>
        ))}
      </div>
    );
  };
  
  // Render hangman figure based on wrong guesses
  const renderHangman = () => {
    const parts = [
      // Base
      <line key="base" x1="20" y1="140" x2="100" y2="140" stroke="black" strokeWidth="4"/>,
      // Pole
      <line key="pole" x1="40" y1="140" x2="40" y2="20" stroke="black" strokeWidth="4"/>,
      // Top bar
      <line key="top" x1="40" y1="20" x2="100" y2="20" stroke="black" strokeWidth="4"/>,
      // Rope
      <line key="rope" x1="100" y1="20" x2="100" y2="40" stroke="black" strokeWidth="4"/>,
      // Head
      <circle key="head" cx="100" cy="50" r="10" stroke="black" strokeWidth="4" fill="none"/>,
      // Body
      <line key="body" x1="100" y1="60" x2="100" y2="100" stroke="black" strokeWidth="4"/>,
      // Arms
      <g key="arms">
        <line x1="100" y1="70" x2="80" y2="90" stroke="black" strokeWidth="4"/>
        <line x1="100" y1="70" x2="120" y2="90" stroke="black" strokeWidth="4"/>
      </g>,
      // Legs
      <g key="legs">
        <line x1="100" y1="100" x2="80" y2="130" stroke="black" strokeWidth="4"/>
        <line x1="100" y1="100" x2="120" y2="130" stroke="black" strokeWidth="4"/>
      </g>
    ];
    
    // Return parts based on wrong guesses
    return parts.slice(0, wrongGuesses);
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Hangman</h1>
        {gameActive && !gameOver && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Difficulty: {difficulty}</div>
            <div className="text-xl font-bold">Guesses Left: {MAX_WRONG_GUESSES - wrongGuesses}</div>
          </div>
        )}
      </div>
      
      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Guess the word one letter at a time, but be careful! After 6 wrong guesses, the game is over.
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button 
              onClick={() => startGame("easy")}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Easy
            </Button>
            <Button 
              onClick={() => startGame("medium")}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Medium
            </Button>
            <Button 
              onClick={() => startGame("hard")}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Hard
            </Button>
          </div>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">The word was: {word}</p>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={() => startGame(difficulty)}
            className="bg-game-word text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Hangman figure */}
          <div className="mb-6">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {renderHangman()}
            </svg>
          </div>
          
          {/* Word to guess */}
          <div className="flex justify-center mb-8">
            {renderWord()}
          </div>
          
          {/* Keyboard */}
          {renderKeyboard()}
          
          {/* Victory message */}
          {victory && (
            <div className="mt-6 text-green-600 text-xl font-bold animate-pulse">
              Good job! Next word coming...
            </div>
          )}
        </div>
      )}
      
      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
