
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

const PHRASES = [
  "The quick brown fox jumps over the lazy dog",
  "A journey of a thousand miles begins with a single step",
  "To be or not to be, that is the question",
  "All that glitters is not gold",
  "The early bird catches the worm"
];

export function TypeRacer() {
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [input, setInput] = useState("");
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (gameActive && !gameOver) {
      setCurrentPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
      
      const countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setGameOver(true);
            saveScore("type-racer", score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [gameActive, gameOver]);

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setTimer(60);
    setScore(0);
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Check if the input matches the current phrase
    if (e.target.value === currentPhrase) {
      setScore(prev => prev + Math.floor(currentPhrase.length * 0.5));
      setInput("");
      setCurrentPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Type Racer</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Time: {timer}s</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Test your typing speed and accuracy. Type the given phrases as quickly as possible!
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
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <div className="bg-muted p-4 rounded-lg mb-4 w-full">
            <p className="text-lg font-medium">{currentPhrase}</p>
          </div>
          
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type here..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-game-word"
            autoFocus
          />
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
