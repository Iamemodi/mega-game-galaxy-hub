
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

const STARTER_WORDS = ["apple", "elephant", "table", "computer", "keyboard", "mountain"];

export function WordChain() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    if (gameActive && !gameOver && chain.length === 0) {
      // Start with a random word
      const startWord = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
      setChain([startWord]);
    }
  }, [gameActive, gameOver]);

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setChain([]);
    setCurrentWord("");
    setErrorMessage("");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const word = currentWord.trim().toLowerCase();
    const lastWord = chain[chain.length - 1];
    
    // Check if the word starts with the last letter of the previous word
    if (word.charAt(0) !== lastWord.charAt(lastWord.length - 1)) {
      setErrorMessage(`Word must start with "${lastWord.charAt(lastWord.length - 1)}"`);
      return;
    }
    
    // Check if the word has already been used
    if (chain.includes(word)) {
      setErrorMessage("Word already used in this chain");
      return;
    }
    
    // Valid word, add to chain
    setChain([...chain, word]);
    setScore(prev => prev + word.length);
    setCurrentWord("");
    setErrorMessage("");
    
    // Demo purposes only: end game after 10 words
    if (chain.length >= 9) {
      setGameOver(true);
      saveScore("word-chain", score + word.length);
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Chain</h1>
        {gameActive && <div className="text-xl">Score: {score}</div>}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Create a chain of words where each word begins with the last letter of the previous word.
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
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Your Word Chain:</h3>
            <p>{chain.join(" → ")}</p>
          </div>
          <Button
            onClick={startGame}
            className="bg-game-word hover:bg-game-word/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Current Chain:</h3>
            <div className="bg-muted p-3 rounded-lg">
              {chain.length > 0 ? (
                <p>{chain.join(" → ")}</p>
              ) : (
                <p className="text-muted-foreground">Starting a new chain...</p>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex flex-col gap-2">
              {chain.length > 0 && (
                <p className="text-sm">
                  Next word must start with "{chain[chain.length-1].charAt(chain[chain.length-1].length-1)}"
                </p>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  placeholder="Enter word"
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-game-word"
                />
                <Button 
                  type="submit"
                  disabled={currentWord.trim().length === 0}
                  className="bg-game-word hover:bg-game-word/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                >
                  Submit
                </Button>
              </div>
              
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
          </form>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
