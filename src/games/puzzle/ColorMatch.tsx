
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
const COLOR_CLASSES = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

export function ColorMatch() {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetColor, setTargetColor] = useState("");
  const [targetText, setTargetText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Setup game
  useEffect(() => {
    if (gameActive && !gameOver) {
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            saveScore("color-match", score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Generate new round
      newRound();

      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver]);

  const newRound = () => {
    // Pick a random color for the text
    const textColorIndex = Math.floor(Math.random() * COLORS.length);
    const textColor = COLORS[textColorIndex];
    
    // Pick a random color name to display
    const textValueIndex = Math.floor(Math.random() * COLORS.length);
    const textValue = COLORS[textValueIndex];
    
    setTargetColor(textColor);
    setTargetText(textValue);
    
    // Generate options - make sure correct answer is included
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const correctAnswer = textColor;
    
    // Make sure correct answer is included
    if (!shuffledColors.slice(0, 4).includes(correctAnswer)) {
      shuffledColors[0] = correctAnswer;
    }
    
    setOptions(shuffledColors.slice(0, 4).sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (selectedColor: string) => {
    if (selectedColor === targetColor) {
      // Correct answer
      setScore((prev) => prev + 10);
    } else {
      // Wrong answer
      setScore((prev) => Math.max(0, prev - 5));
    }
    
    newRound();
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  return (
    <div className="game-container p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Color Match</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Match the actual color of the word, not what the word says! 
            This tests your brain's ability to overcome the Stroop effect.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-puzzle text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
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
            className="bg-game-puzzle text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`text-5xl font-bold mb-8 text-${targetColor}-500`}
            style={{ color: targetColor }}
          >
            {targetText.toUpperCase()}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {options.map((color) => (
              <Button
                key={color}
                onClick={() => handleAnswer(color)}
                className={`h-16 ${COLOR_CLASSES[color as keyof typeof COLOR_CLASSES]}`}
              />
            ))}
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
