
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

export function RestaurantTycoon() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [money, setMoney] = useState(0);
  const [restaurants, setRestaurants] = useState(0);
  
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setMoney(1000);
    setRestaurants(0);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Restaurant Tycoon</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl">Money: ${money.toLocaleString()}</div>
            <div className="text-xl">Restaurants: {restaurants}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build and manage your own restaurant empire. Hire staff, upgrade facilities, and become a culinary mogul.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-6">Final worth: ${money.toLocaleString()}</p>
          <Button
            onClick={startGame}
            className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-muted-foreground text-center p-4">
            Restaurant Tycoon game goes here!<br />
            Coming soon...
          </p>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
