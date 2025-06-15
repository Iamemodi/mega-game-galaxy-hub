import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { ComingSoon } from "@/components/ComingSoon";

export function LogicGates() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [currentGate, setCurrentGate] = useState<'AND' | 'OR' | 'XOR' | 'NAND'>('AND');
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setInputA(false);
    setInputB(false);
    setCurrentGate('AND');
  };
  
  const toggleInput = (input: 'A' | 'B') => {
    if (input === 'A') {
      setInputA(!inputA);
    } else {
      setInputB(!inputB);
    }
  };
  
  const calculateOutput = (): boolean => {
    switch (currentGate) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'XOR': return (inputA || inputB) && !(inputA && inputB);
      case 'NAND': return !(inputA && inputB);
      default: return false;
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Logic Gates</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Level: {level}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Solve digital logic circuit puzzles. Adjust the inputs to achieve the desired output for each gate.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
          <p className="text-xl mb-6">Your score: {score}</p>
          <Button
            onClick={startGame}
            className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <ComingSoon game="Logic Gates" />
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
