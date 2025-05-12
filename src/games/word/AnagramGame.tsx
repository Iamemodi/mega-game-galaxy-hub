import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

const WORDS = [
  "REACT", "JAVASCRIPT", "TYPESCRIPT", "CODING", "DEVELOPER",
  "BROWSER", "APPLICATION", "WEBSITE", "INTERFACE", "PROGRAMMING"
];

export function AnagramGame() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [guess, setGuess] = useState("");
  
  useEffect(() => {
    if (gameActive && !gameOver) {
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            saveScore("anagram-game", score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set new word
      newWord();

      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver]);

  const newWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setGuess("");
  };

  const scrambleWord = (word: string) => {
    const letters = word.split('');
    let scrambled;
    
    // Keep scrambling until it's different from the original
    do {
      scrambled = [...letters].sort(() => Math.random() - 0.5).join('');
    } while (scrambled === word);
    
    return scrambled;
  };

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.toUpperCase() === currentWord) {
      setScore(prev => prev + 10);
      newWord();
    } else {
      // Wrong answer penalty
      setScore(prev => Math.max(0, prev - 2));
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Anagram Game</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Rearrange the scrambled letters to form the correct word. Think fast!
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="text-4xl font-bold mb-6 tracking-wide">{scrambledWord}</div>
          
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Your answer"
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-game-word"
              />
              <Button 
                type="submit"
                className="bg-game-word hover:bg-game-word/90 text-black px-4 py-2 rounded-lg font-bold"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
