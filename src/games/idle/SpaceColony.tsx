
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";

// Building types with costs and resource generation
const BUILDINGS = {
  habitat: {
    name: "Habitat",
    description: "Houses colonists",
    baseCost: 50,
    population: 5,
    oxygen: -1,
    food: -1,
    energy: -2,
    research: 0
  },
  farm: {
    name: "Farm",
    description: "Produces food for colonists",
    baseCost: 100,
    population: 0,
    oxygen: 1,
    food: 5,
    energy: -2,
    research: 0
  },
  solarPanel: {
    name: "Solar Panel",
    description: "Generates energy from the sun",
    baseCost: 150,
    population: 0,
    oxygen: 0,
    food: 0,
    energy: 10,
    research: 0
  },
  oxygenGenerator: {
    name: "Oxygen Generator",
    description: "Produces oxygen for breathing",
    baseCost: 200,
    population: 0,
    oxygen: 8,
    food: 0,
    energy: -5,
    research: 0
  },
  lab: {
    name: "Research Lab",
    description: "Generates research points",
    baseCost: 250,
    population: 0,
    oxygen: -2,
    food: -1,
    energy: -3,
    research: 5
  },
  mine: {
    name: "Mining Facility",
    description: "Increases resource collection rate",
    baseCost: 300,
    population: 0,
    oxygen: -3,
    food: 0,
    energy: -5,
    research: 0
  }
};

type BuildingKey = keyof typeof BUILDINGS;

// Research upgrades
const RESEARCH_UPGRADES = {
  efficientHabitats: {
    name: "Efficient Habitats",
    description: "Habitats consume 20% less resources",
    cost: 100,
    applied: false
  },
  hydroponics: {
    name: "Hydroponics",
    description: "Farms produce 50% more food",
    cost: 200,
    applied: false
  },
  solarEfficiency: {
    name: "Solar Efficiency",
    description: "Solar panels produce 50% more energy",
    cost: 300,
    applied: false
  },
  advancedLifeSupport: {
    name: "Advanced Life Support",
    description: "Colony produces 30% more oxygen",
    cost: 400,
    applied: false
  },
  automatedMining: {
    name: "Automated Mining",
    description: "Double resource collection rate",
    cost: 500,
    applied: false
  }
};

type ResearchKey = keyof typeof RESEARCH_UPGRADES;

export function SpaceColony() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resources, setResources] = useState(100);
  const [colonies, setColonies] = useState(0);
  const [resourceRate, setResourceRate] = useState(1);
  const [population, setPopulation] = useState(0);
  const [populationCap, setPopulationCap] = useState(0);
  const [oxygen, setOxygen] = useState(10);
  const [oxygenRate, setOxygenRate] = useState(0);
  const [food, setFood] = useState(20);
  const [foodRate, setFoodRate] = useState(0);
  const [energy, setEnergy] = useState(15);
  const [energyRate, setEnergyRate] = useState(0);
  const [research, setResearch] = useState(0);
  const [researchRate, setResearchRate] = useState(0);
  const [buildings, setBuildings] = useState<Record<BuildingKey, number>>({
    habitat: 0,
    farm: 0,
    solarPanel: 0,
    oxygenGenerator: 0,
    lab: 0,
    mine: 0
  });
  const [upgrades, setUpgrades] = useState<Record<ResearchKey, boolean>>({
    efficientHabitats: false,
    hydroponics: false,
    solarEfficiency: false,
    advancedLifeSupport: false,
    automatedMining: false
  });
  const [colonizingProgress, setColonizingProgress] = useState(0);
  const [isColonizing, setIsColonizing] = useState(false);

  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setResources(100);
    setColonies(0);
    setResourceRate(1);
    setPopulation(10);
    setPopulationCap(10);
    setOxygen(20);
    setOxygenRate(0);
    setFood(50);
    setFoodRate(0);
    setEnergy(30);
    setEnergyRate(0);
    setResearch(0);
    setResearchRate(0);
    setBuildings({
      habitat: 1,
      farm: 0,
      solarPanel: 0,
      oxygenGenerator: 0,
      lab: 0,
      mine: 0
    });
    setUpgrades({
      efficientHabitats: false,
      hydroponics: false,
      solarEfficiency: false,
      advancedLifeSupport: false,
      automatedMining: false
    });
    setColonizingProgress(0);
    setIsColonizing(false);
  };
  
  // Calculate building cost with scaling
  const calculateBuildingCost = (type: BuildingKey) => {
    const count = buildings[type];
    const baseCost = BUILDINGS[type].baseCost;
    return Math.floor(baseCost * Math.pow(1.15, count));
  };
  
  // Purchase a building
  const buyBuilding = (type: BuildingKey) => {
    const cost = calculateBuildingCost(type);
    
    if (resources >= cost) {
      // Deduct resources
      setResources(prevResources => prevResources - cost);
      
      // Add building
      setBuildings(prevBuildings => ({
        ...prevBuildings,
        [type]: prevBuildings[type] + 1
      }));
      
      // Update population cap for habitats
      if (type === 'habitat') {
        setPopulationCap(prev => prev + BUILDINGS[type].population);
      }
      
      toast.success(`Built ${BUILDINGS[type].name}`);
    } else {
      toast.error("Not enough resources!");
    }
  };
  
  // Research an upgrade
  const researchUpgrade = (key: ResearchKey) => {
    const upgrade = RESEARCH_UPGRADES[key];
    
    if (!upgrades[key] && research >= upgrade.cost) {
      // Deduct research points
      setResearch(prev => prev - upgrade.cost);
      
      // Apply upgrade
      setUpgrades(prev => ({
        ...prev,
        [key]: true
      }));
      
      toast.success(`Researched ${upgrade.name}`);
    } else {
      toast.error("Not enough research points!");
    }
  };
  
  // Start colonizing a new planet
  const startColonizing = () => {
    // Check if already colonizing
    if (isColonizing) return;
    
    // Check if enough resources
    const colonizeCost = 1000 * Math.pow(2, colonies);
    
    if (resources >= colonizeCost) {
      setResources(prev => prev - colonizeCost);
      setIsColonizing(true);
      setColonizingProgress(0);
      
      toast.success("Colony ship launched!");
    } else {
      toast.error("Not enough resources to launch a colony ship!");
    }
  };
  
  // Calculate production rates based on buildings and upgrades
  useEffect(() => {
    if (!gameActive) return;
    
    let oxygenProduction = 0;
    let foodProduction = 0;
    let energyProduction = 0;
    let researchProduction = 0;
    let resourceMultiplier = 1;
    
    // Calculate base production from buildings
    Object.entries(buildings).forEach(([key, count]) => {
      const building = BUILDINGS[key as BuildingKey];
      
      // Apply upgrades
      let oxygenMod = building.oxygen;
      let foodMod = building.food;
      let energyMod = building.energy;
      
      if (key === 'habitat' && upgrades.efficientHabitats) {
        // Efficient habitats consume less
        if (oxygenMod < 0) oxygenMod *= 0.8;
        if (foodMod < 0) foodMod *= 0.8;
        if (energyMod < 0) energyMod *= 0.8;
      }
      
      if (key === 'farm' && upgrades.hydroponics) {
        // Hydroponics increases food production
        if (foodMod > 0) foodMod *= 1.5;
      }
      
      if (key === 'solarPanel' && upgrades.solarEfficiency) {
        // Solar efficiency increases energy production
        if (energyMod > 0) energyMod *= 1.5;
      }
      
      if (key === 'mine' && count > 0) {
        // Each mine increases resource collection rate
        resourceMultiplier += count * 0.5;
      }
      
      oxygenProduction += oxygenMod * count;
      foodProduction += foodMod * count;
      energyProduction += energyMod * count;
      researchProduction += building.research * count;
    });
    
    // Apply advanced life support upgrade
    if (upgrades.advancedLifeSupport) {
      oxygenProduction *= 1.3;
    }
    
    // Apply automated mining upgrade
    if (upgrades.automatedMining) {
      resourceMultiplier *= 2;
    }
    
    // Set the production rates
    setOxygenRate(oxygenProduction);
    setFoodRate(foodProduction);
    setEnergyRate(energyProduction);
    setResearchRate(researchProduction);
    setResourceRate(resourceMultiplier);
    
    // Update population based on resources
    setPopulation(prev => Math.min(prev, populationCap));
    
  }, [buildings, upgrades, populationCap, gameActive]);
  
  // Game tick (every second)
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const gameInterval = setInterval(() => {
      // Update resources
      setResources(prev => Math.max(0, prev + resourceRate));
      
      // Update oxygen
      setOxygen(prev => Math.max(0, prev + oxygenRate));
      
      // Update food
      setFood(prev => Math.max(0, prev + foodRate));
      
      // Update energy
      setEnergy(prev => Math.max(0, prev + energyRate));
      
      // Update research
      setResearch(prev => prev + researchRate);
      
      // Handle colonization progress
      if (isColonizing) {
        setColonizingProgress(prev => {
          const newValue = prev + 0.5;
          if (newValue >= 100) {
            // Colony established
            setColonies(prev => prev + 1);
            setIsColonizing(false);
            toast.success("New colony established!");
            return 0;
          }
          return newValue;
        });
      }
      
      // Check for game over conditions
      if (oxygen <= 0 || food <= 0 || energy <= 0) {
        handleGameOver();
      }
    }, 1000);
    
    return () => clearInterval(gameInterval);
  }, [gameActive, gameOver, resourceRate, oxygenRate, foodRate, energyRate, researchRate, isColonizing, oxygen, food, energy]);
  
  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    setGameActive(false);
    
    if (oxygen <= 0) {
      toast.error("Your colony ran out of oxygen!");
    } else if (food <= 0) {
      toast.error("Your colony ran out of food!");
    } else if (energy <= 0) {
      toast.error("Your colony ran out of energy!");
    }
    
    // Save score (colonies established)
    saveScore("space-colony", colonies);
  };
  
  // Format numbers
  const formatNumber = (num: number) => {
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Space Colony</h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="text-xl">Resources: {formatNumber(resources)}</div>
            <div className="text-xl">Colonies: {colonies}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build and manage colonies across planets. Gather resources, research technologies, and expand your galactic empire.
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
          <p className="text-xl mb-6">Final colonies: {colonies}</p>
          <Button
            onClick={startGame}
            className="bg-game-idle hover:bg-game-idle/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
          {/* Left column: Colony status */}
          <div className="flex-1 bg-slate-100 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Colony Status</h2>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Population:</span>
                <span>{population} / {populationCap}</span>
              </div>
              <Progress value={(population / Math.max(1, populationCap)) * 100} className="h-2" />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Oxygen:</span>
                <span>{formatNumber(oxygen)} ({oxygenRate > 0 ? '+' : ''}{formatNumber(oxygenRate)}/s)</span>
              </div>
              <Progress value={Math.min(100, (oxygen / 100) * 100)} className="h-2 bg-sky-200">
                <div className="h-full bg-sky-500" style={{ width: `${Math.min(100, (oxygen / 100) * 100)}%` }}></div>
              </Progress>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Food:</span>
                <span>{formatNumber(food)} ({foodRate > 0 ? '+' : ''}{formatNumber(foodRate)}/s)</span>
              </div>
              <Progress value={Math.min(100, (food / 100) * 100)} className="h-2 bg-green-200">
                <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (food / 100) * 100)}%` }}></div>
              </Progress>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Energy:</span>
                <span>{formatNumber(energy)} ({energyRate > 0 ? '+' : ''}{formatNumber(energyRate)}/s)</span>
              </div>
              <Progress value={Math.min(100, (energy / 100) * 100)} className="h-2 bg-yellow-200">
                <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (energy / 100) * 100)}%` }}></div>
              </Progress>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Research:</span>
                <span>{formatNumber(research)} (+{formatNumber(researchRate)}/s)</span>
              </div>
              <Progress value={Math.min(100, (research / 500) * 100)} className="h-2 bg-purple-200">
                <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (research / 500) * 100)}%` }}></div>
              </Progress>
            </div>
            
            {isColonizing && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Colony Ship:</span>
                  <span>{Math.floor(colonizingProgress)}%</span>
                </div>
                <Progress value={colonizingProgress} className="h-2" />
              </div>
            )}
            
            <div className="mt-6">
              <Button
                onClick={startColonizing}
                disabled={isColonizing || resources < 1000 * Math.pow(2, colonies)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Launch Colony Ship ({formatNumber(1000 * Math.pow(2, colonies))} resources)
              </Button>
            </div>
          </div>
          
          {/* Right column: Buildings and Research */}
          <div className="flex-1 space-y-4">
            {/* Buildings */}
            <div className="bg-slate-100 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Buildings</h2>
              
              <div className="space-y-3">
                {Object.entries(BUILDINGS).map(([key, building]) => {
                  const buildingKey = key as BuildingKey;
                  const count = buildings[buildingKey];
                  const cost = calculateBuildingCost(buildingKey);
                  
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{building.name} ({count})</div>
                        <div className="text-sm text-gray-600">{building.description}</div>
                      </div>
                      <Button
                        onClick={() => buyBuilding(buildingKey)}
                        disabled={resources < cost}
                        className="bg-game-idle hover:bg-game-idle/90 text-black"
                        size="sm"
                      >
                        Build ({formatNumber(cost)})
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Research */}
            <div className="bg-slate-100 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Research</h2>
              
              <div className="space-y-3">
                {Object.entries(RESEARCH_UPGRADES).map(([key, upgrade]) => {
                  const researchKey = key as ResearchKey;
                  const isResearched = upgrades[researchKey];
                  
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{upgrade.name}</div>
                        <div className="text-sm text-gray-600">{upgrade.description}</div>
                      </div>
                      
                      {isResearched ? (
                        <span className="text-green-600 font-medium">Researched</span>
                      ) : (
                        <Button
                          onClick={() => researchUpgrade(researchKey)}
                          disabled={research < upgrade.cost}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          size="sm"
                        >
                          Research ({upgrade.cost})
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
