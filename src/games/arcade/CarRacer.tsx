
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function CarRacer() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  
  useEffect(() => {
    if (gameActive && !gameOver) {
      const gameLoop = setInterval(() => {
        setScore(prev => prev + speed);
        setDistance(prev => prev + speed);
      }, 100);
      
      return () => clearInterval(gameLoop);
    }
  }, [gameActive, gameOver, speed]);

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setSpeed(1);
    setDistance(0);
  };
  
  const accelerate = () => {
    setSpeed(prev => Math.min(10, prev + 1));
  };
  
  const brake = () => {
    setSpeed(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Car Racer</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Score: {score}</div>
            <div className="text-xl">Speed: {speed}x</div>
            <div className="text-xl">Distance: {distance}m</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Race your car on endless tracks, avoid obstacles, and beat your high score!
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
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
            className="bg-game-arcade hover:bg-game-arcade/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-lg p-6 mb-6 min-h-[300px] relative">
            <p className="text-white text-center">Race track will appear here</p>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              🏎️
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={brake}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Brake
            </Button>
            <Button 
              onClick={accelerate}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Accelerate
            </Button>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
