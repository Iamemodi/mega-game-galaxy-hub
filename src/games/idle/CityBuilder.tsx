
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

type Building = {
  type: string;
  name: string;
  cost: number;
  income: number;
  count: number;
};

export function CityBuilder() {
  const [gameActive, setGameActive] = useState(false);
  const [money, setMoney] = useState(100);
  const [population, setPopulation] = useState(10);
  const [buildings, setBuildings] = useState<Building[]>([
    { type: 'residential', name: 'House', cost: 50, income: 2, count: 0 },
    { type: 'commercial', name: 'Shop', cost: 100, income: 5, count: 0 },
    { type: 'industrial', name: 'Factory', cost: 200, income: 10, count: 0 }
  ]);
  const [incomePerSecond, setIncomePerSecond] = useState(0);
  
  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        setMoney(prev => prev + incomePerSecond);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameActive, incomePerSecond]);
  
  useEffect(() => {
    // Calculate income per second based on buildings
    let total = 0;
    buildings.forEach(building => {
      total += building.income * building.count;
    });
    setIncomePerSecond(total);
    
    // Calculate population based on houses
    const houses = buildings.find(b => b.type === 'residential');
    if (houses) {
      setPopulation(10 + houses.count * 5);
    }
  }, [buildings]);

  const startGame = () => {
    setGameActive(true);
    setMoney(100);
    setPopulation(10);
    setBuildings([
      { type: 'residential', name: 'House', cost: 50, income: 2, count: 0 },
      { type: 'commercial', name: 'Shop', cost: 100, income: 5, count: 0 },
      { type: 'industrial', name: 'Factory', cost: 200, income: 10, count: 0 }
    ]);
    setIncomePerSecond(0);
  };
  
  const buildBuilding = (index: number) => {
    const updatedBuildings = [...buildings];
    const building = updatedBuildings[index];
    
    if (money >= building.cost) {
      setMoney(prev => prev - building.cost);
      building.count += 1;
      // Increase cost for next building
      building.cost = Math.floor(building.cost * 1.2);
      setBuildings(updatedBuildings);
    }
  };
  
  const handleSaveGame = () => {
    saveScore("city-builder", money);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">City Builder</h1>
        {gameActive && (
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
            <div className="text-xl">Money: ${Math.floor(money)}</div>
            <div className="text-xl">Population: {population}</div>
            <div className="text-xl">Income: ${incomePerSecond}/s</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build and manage your own city! Construct buildings, grow your population, and become a wealthy mayor.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          {buildings.map((building, index) => (
            <div key={index} className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">{building.name} (x{building.count})</h3>
                <span className="text-sm bg-muted-foreground/20 px-2 py-1 rounded-full">
                  +${building.income}/s each
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => buildBuilding(index)}
                  disabled={money < building.cost}
                  className="bg-game-idle hover:bg-game-idle/90 text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50 flex-1"
                >
                  Build (${building.cost})
                </Button>
                <span className="text-sm">Total: ${building.income * building.count}/s</span>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={handleSaveGame}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            Save Progress
          </Button>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
