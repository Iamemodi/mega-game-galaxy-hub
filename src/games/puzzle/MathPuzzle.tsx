
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

// Operation types
type Operation = "+" | "-" | "×" | "÷";
type Problem = {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
};

export function MathPuzzle() {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  // Generate a math problem based on difficulty
  const generateProblem = () => {
    let num1: number, num2: number, answer: number;
    const operations: Operation[] = ["+", "-", "×"];
    
    // Add division for medium and hard difficulties
    if (difficulty !== "easy") {
      operations.push("÷");
    }
    
    // Random operation
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Generate numbers based on difficulty
    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
      case "medium":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        break;
      case "hard":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 30) + 1;
        break;
    }
    
    // Make sure num1 is larger for subtraction
    if (operation === "-" && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    
    // For division, ensure clean division
    if (operation === "÷") {
      // Ensure num2 isn't 0
      if (num2 === 0) num2 = 1;
      
      // Make num1 a multiple of num2 for clean division
      num1 = num2 * (Math.floor(Math.random() * 10) + 1);
    }
    
    // Calculate answer
    switch (operation) {
      case "+":
        answer = num1 + num2;
        break;
      case "-":
        answer = num1 - num2;
        break;
      case "×":
        answer = num1 * num2;
        break;
      case "÷":
        answer = num1 / num2;
        break;
      default:
        answer = 0;
    }
    
    // Generate answer options
    const options = [answer];
    
    // Add 3 wrong answers
    while (options.length < 4) {
      // Generate wrong answer within reasonable range of correct answer
      let wrongAnswer;
      
      if (operation === "+" || operation === "-") {
        // For addition/subtraction, off by up to ±10
        wrongAnswer = answer + (Math.floor(Math.random() * 10) + 1) * (Math.random() < 0.5 ? 1 : -1);
      } else if (operation === "×") {
        // For multiplication, off by up to ±num2
        wrongAnswer = answer + (Math.floor(Math.random() * num2) + 1) * (Math.random() < 0.5 ? 1 : -1);
      } else {
        // For division, off by up to ±2
        wrongAnswer = answer + (Math.random() < 0.5 ? 1 : 2) * (Math.random() < 0.5 ? 1 : -1);
      }
      
      // Ensure no duplicates and no negative answers
      if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      num1,
      num2,
      operation,
      answer,
      options: shuffledOptions,
    };
  };

  // Setup game
  useEffect(() => {
    if (gameActive && !gameOver) {
      // Start countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            saveScore("math-puzzle", score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Generate first problem
      setCurrentProblem(generateProblem());

      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver, difficulty]);

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentProblem) return;
    
    if (selectedAnswer === currentProblem.answer) {
      // Correct answer
      let points = 10;
      if (difficulty === "medium") points = 20;
      if (difficulty === "hard") points = 30;
      
      setScore((prev) => prev + points);
    }
    
    // Generate new problem
    setCurrentProblem(generateProblem());
  };

  const startGame = (level: "easy" | "medium" | "hard" = "easy") => {
    setDifficulty(level);
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setCurrentProblem(null);
  };

  return (
    <div className="game-container p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Math Puzzle</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
            <div className="text-xl font-bold">Level: {difficulty}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Test your math skills! Solve as many problems as you can before time runs out.
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
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={() => startGame(difficulty)}
            className="bg-game-puzzle text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            Play Again
          </Button>
        </div>
      ) : currentProblem ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold mb-8 flex items-center gap-3">
            <span>{currentProblem.num1}</span>
            <span>{currentProblem.operation}</span>
            <span>{currentProblem.num2}</span>
            <span>=</span>
            <span>?</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {currentProblem.options.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                className="h-16 bg-game-puzzle text-black text-xl font-bold"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl">Loading problem...</p>
        </div>
      )}

      <GameControls onRestart={() => startGame(difficulty)} />
    </div>
  );
}
