
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function FactoryTycoon() {
  const [resources, setResources] = useState(100);
  const [factories, setFactories] = useState(0);
  const [resourcesPerSecond, setResourcesPerSecond] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  
  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        setResources(prev => prev + resourcesPerSecond);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameActive, resourcesPerSecond]);
  
  useEffect(() => {
    setResourcesPerSecond(factories * 2);
  }, [factories]);

  const startGame = () => {
    setGameActive(true);
    setResources(100);
    setFactories(0);
    setResourcesPerSecond(0);
  };
  
  const buildFactory = () => {
    if (resources >= 50) {
      setResources(prev => prev - 50);
      setFactories(prev => prev + 1);
    }
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Factory Tycoon</h1>
        {gameActive && (
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
            <div className="text-xl">Resources: {Math.floor(resources)}</div>
            <div className="text-xl">Factories: {factories}</div>
            <div className="text-xl">Per second: +{resourcesPerSecond}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build and manage your factory empire. Automate production, manage resources, and grow your industrial empire.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="w-full p-4 bg-muted rounded-lg mb-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Factory Management</h2>
              <p>Build factories to generate resources automatically.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={buildFactory}
                disabled={resources < 50}
                className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold disabled:opacity-50"
              >
                Build Factory (50 resources)
              </Button>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
