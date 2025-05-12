
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

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
        <div className="w-full max-w-md">
          <div className="bg-muted p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4 text-center">{currentGate} Gate</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1">
                <div className="flex flex-col items-center gap-6">
                  <Button 
                    onClick={() => toggleInput('A')}
                    className={`w-12 h-12 rounded-full ${inputA ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    A
                  </Button>
                  
                  <Button 
                    onClick={() => toggleInput('B')}
                    className={`w-12 h-12 rounded-full ${inputB ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    B
                  </Button>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-gray-500 rounded flex items-center justify-center font-bold">
                  {currentGate}
                </div>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full ${calculateOutput() ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center justify-center font-bold`}>
                  {calculateOutput() ? 1 : 0}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">The {currentGate} gate returns {calculateOutput() ? "TRUE" : "FALSE"} for these inputs.</p>
              <Button 
                onClick={() => {
                  setScore(prev => prev + 10);
                  setLevel(prev => prev + 1);
                  // Cycle through gates
                  const gates: Array<'AND' | 'OR' | 'XOR' | 'NAND'> = ['AND', 'OR', 'XOR', 'NAND'];
                  const nextGateIndex = (gates.indexOf(currentGate) + 1) % gates.length;
                  setCurrentGate(gates[nextGateIndex]);
                }}
                className="bg-game-puzzle hover:bg-game-puzzle/90 text-black px-4 py-2 rounded-lg font-bold"
              >
                Next Gate
              </Button>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
