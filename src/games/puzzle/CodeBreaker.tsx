
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
type Guess = Color[];
type Feedback = ('correct' | 'close' | 'wrong')[];

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const COLOR_CLASSES = {
  red: 'bg-red-500',
  blue: 'bg-blue-500', 
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500'
};

export function CodeBreaker() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(10);
  const [secretCode, setSecretCode] = useState<Color[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Color[]>([]);
  const [guessHistory, setGuessHistory] = useState<{guess: Color[], feedback: Feedback}[]>([]);
  const [codeLength, setCodeLength] = useState(4);
  const [won, setWon] = useState(false);
  
  // Generate secret code
  const generateSecretCode = (length: number): Color[] => {
    const code: Color[] = [];
    for (let i = 0; i < length; i++) {
      code.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    return code;
  };
  
  // Check guess against secret code
  const checkGuess = (guess: Color[], secret: Color[]): Feedback => {
    const feedback: Feedback = [];
    const secretCopy = [...secret];
    const guessCopy = [...guess];
    
    // First pass: check for correct positions
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === secret[i]) {
        feedback[i] = 'correct';
        secretCopy[i] = null as any;
        guessCopy[i] = null as any;
      }
    }
    
    // Second pass: check for correct colors in wrong positions
    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] !== null) {
        const foundIndex = secretCopy.findIndex(color => color === guessCopy[i]);
        if (foundIndex !== -1) {
          feedback[i] = 'close';
          secretCopy[foundIndex] = null as any;
        } else {
          feedback[i] = 'wrong';
        }
      }
    }
    
    return feedback;
  };
  
  // Start game
  const startGame = (length: number = 4) => {
    const code = generateSecretCode(length);
    setSecretCode(code);
    setCodeLength(length);
    setCurrentGuess([]);
    setGuessHistory([]);
    setAttempts(10);
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    setWon(false);
  };
  
  // Add color to current guess
  const addColor = (color: Color) => {
    if (currentGuess.length < codeLength) {
      setCurrentGuess([...currentGuess, color]);
    }
  };
  
  // Remove last color from guess
  const removeColor = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };
  
  // Submit guess
  const submitGuess = () => {
    if (currentGuess.length !== codeLength) return;
    
    const feedback = checkGuess(currentGuess, secretCode);
    const newHistory = [...guessHistory, { guess: [...currentGuess], feedback }];
    
    setGuessHistory(newHistory);
    setCurrentGuess([]);
    setAttempts(attempts - 1);
    
    // Check if won
    if (feedback.every(f => f === 'correct')) {
      setWon(true);
      setGameOver(true);
      const finalScore = attempts * 100 + (10 - newHistory.length) * 50;
      setScore(finalScore);
      saveScore("code-breaker", finalScore);
    } else if (attempts - 1 <= 0) {
      setGameOver(true);
      setScore(0);
    }
  };
  
  // Get feedback indicator
  const getFeedbackIndicator = (feedback: 'correct' | 'close' | 'wrong') => {
    if (feedback === 'correct') return '🟢';
    if (feedback === 'close') return '🟡';
    return '⚪';
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <motion.div 
        className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-purple-900">Code Breaker</h1>
          {gameActive && (
            <div className="flex justify-center gap-4 text-lg">
              <div>Score: {score}</div>
              <div>Attempts: {attempts}</div>
            </div>
          )}
        </div>

        {!gameActive ? (
          <div className="text-center">
            <p className="mb-6 text-gray-600">
              Crack the secret code! Guess the correct combination of colors and receive feedback on your guesses.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => startGame(3)}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Easy (3 colors)
              </Button>
              <Button 
                onClick={() => startGame(4)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Medium (4 colors)
              </Button>
              <Button 
                onClick={() => startGame(5)}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Hard (5 colors)
              </Button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center">
            <div className="text-6xl mb-4">{won ? '🎉' : '💔'}</div>
            <h2 className="text-2xl font-bold mb-4">{won ? 'Code Cracked!' : 'Game Over!'}</h2>
            {!won && (
              <div className="mb-4">
                <p className="text-lg mb-2">The secret code was:</p>
                <div className="flex justify-center gap-1">
                  {secretCode.map((color, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${COLOR_CLASSES[color]} border-2 border-white shadow-md`}
                    />
                  ))}
                </div>
              </div>
            )}
            <p className="text-xl mb-6">Your score: {score}</p>
            <Button
              onClick={() => startGame(codeLength)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </div>
        ) : (
          <div>
            {/* Guess History */}
            <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
              {guessHistory.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex gap-1">
                    {entry.guess.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className={`w-6 h-6 rounded-full ${COLOR_CLASSES[color]} border border-gray-300`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {entry.feedback.map((feedback, feedbackIndex) => (
                      <span key={feedbackIndex} className="text-lg">
                        {getFeedbackIndicator(feedback)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Current Guess */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-center">Current Guess</h3>
              <div className="flex justify-center gap-1 mb-4">
                {Array(codeLength).fill(null).map((_, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 border-dashed border-gray-400 ${
                      currentGuess[index] ? `${COLOR_CLASSES[currentGuess[index]]} border-white` : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  onClick={removeColor}
                  variant="outline"
                  disabled={currentGuess.length === 0}
                  className="px-4 py-2"
                >
                  ← Remove
                </Button>
                <Button
                  onClick={submitGuess}
                  disabled={currentGuess.length !== codeLength}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                >
                  Submit Guess
                </Button>
              </div>
            </div>
            
            {/* Color Palette */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Choose Colors</h3>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map(color => (
                  <Button
                    key={color}
                    onClick={() => addColor(color)}
                    disabled={currentGuess.length >= codeLength}
                    className={`${COLOR_CLASSES[color]} hover:opacity-80 text-white border-2 border-white shadow-md h-12 capitalize`}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-semibold mb-1">Feedback:</p>
              <p>🟢 = Correct color and position</p>
              <p>🟡 = Correct color, wrong position</p>
              <p>⚪ = Wrong color</p>
            </div>
          </div>
        )}
      </motion.div>

      <GameControls onRestart={() => startGame(codeLength)} />
    </div>
  );
}
