
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

interface Crop {
  id: string;
  name: string;
  icon: string;
  cost: number;
  growthTime: number; // in seconds
  yield: number;
  unlockLevel: number;
}

interface Plot {
  id: number;
  crop: string | null;
  plantedAt: number | null;
  harvestable: boolean;
  progress: number;
}

// Available crops
const CROPS: Crop[] = [
  { id: "carrot", name: "Carrot", icon: "🥕", cost: 10, growthTime: 5, yield: 20, unlockLevel: 1 },
  { id: "potato", name: "Potato", icon: "🥔", cost: 20, growthTime: 10, yield: 50, unlockLevel: 2 },
  { id: "corn", name: "Corn", icon: "🌽", cost: 50, growthTime: 20, yield: 150, unlockLevel: 3 },
  { id: "tomato", name: "Tomato", icon: "🍅", cost: 100, growthTime: 30, yield: 300, unlockLevel: 4 },
  { id: "eggplant", name: "Eggplant", icon: "🍆", cost: 250, growthTime: 60, yield: 800, unlockLevel: 5 },
  { id: "watermelon", name: "Watermelon", icon: "🍉", cost: 500, growthTime: 120, yield: 2000, unlockLevel: 6 },
];

// Upgrades
interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockLevel: number;
  purchased: boolean;
  effect: () => void;
}

export function FarmSimulator() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("carrot");
  const [autosellActive, setAutosellActive] = useState(false);
  const [growthBoost, setGrowthBoost] = useState(1);
  const [yieldBoost, setYieldBoost] = useState(1);
  
  // Upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "autosell",
      name: "Auto-Sell",
      description: "Automatically sells crops when they're ready to harvest",
      cost: 500,
      unlockLevel: 2,
      purchased: false,
      effect: () => setAutosellActive(true)
    },
    {
      id: "growth_boost",
      name: "Growth Booster",
      description: "Speeds up crop growth by 25%",
      cost: 1000,
      unlockLevel: 3,
      purchased: false,
      effect: () => setGrowthBoost(prev => prev * 1.25)
    },
    {
      id: "yield_boost",
      name: "Yield Booster",
      description: "Increases crop yield by 25%",
      cost: 2000,
      unlockLevel: 4,
      purchased: false,
      effect: () => setYieldBoost(prev => prev * 1.25)
    },
  ]);
  
  // Initialize game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setCoins(100);
    setLevel(1);
    setXp(0);
    setXpToNextLevel(100);
    setAutosellActive(false);
    setGrowthBoost(1);
    setYieldBoost(1);
    
    // Initialize plots
    const initialPlots: Plot[] = Array(4).fill(null).map((_, i) => ({
      id: i,
      crop: null,
      plantedAt: null,
      harvestable: false,
      progress: 0
    }));
    
    setPlots(initialPlots);
    
    // Reset upgrades
    setUpgrades(upgrades.map(upgrade => ({
      ...upgrade,
      purchased: false
    })));
  };
  
  // Plant a crop in a plot
  const plantCrop = (plotId: number) => {
    const cropInfo = CROPS.find(c => c.id === selectedCrop);
    if (!cropInfo) return;
    
    // Check if player can afford the crop
    if (coins < cropInfo.cost) {
      toast.error(`Not enough coins to plant ${cropInfo.name}`);
      return;
    }
    
    // Update plot
    const newPlots = [...plots];
    const plotIndex = newPlots.findIndex(p => p.id === plotId);
    
    if (plotIndex !== -1) {
      newPlots[plotIndex] = {
        ...newPlots[plotIndex],
        crop: selectedCrop,
        plantedAt: Date.now(),
        harvestable: false,
        progress: 0
      };
      
      setPlots(newPlots);
      setCoins(coins - cropInfo.cost);
      toast.success(`Planted ${cropInfo.name}`);
    }
  };
  
  // Harvest a crop
  const harvestCrop = (plotId: number) => {
    const newPlots = [...plots];
    const plotIndex = newPlots.findIndex(p => p.id === plotId);
    
    if (plotIndex !== -1 && newPlots[plotIndex].harvestable && newPlots[plotIndex].crop) {
      const cropId = newPlots[plotIndex].crop!;
      const cropInfo = CROPS.find(c => c.id === cropId);
      
      if (cropInfo) {
        // Calculate yield with boost
        const calculatedYield = Math.round(cropInfo.yield * yieldBoost);
        
        // Add coins and XP
        setCoins(prev => prev + calculatedYield);
        
        // Add XP (10% of yield)
        const xpGained = Math.round(calculatedYield * 0.1);
        addXp(xpGained);
        
        toast.success(`Harvested ${cropInfo.name} for ${calculatedYield} coins (+${xpGained} XP)`);
        
        // Clear the plot
        newPlots[plotIndex] = {
          ...newPlots[plotIndex],
          crop: null,
          plantedAt: null,
          harvestable: false,
          progress: 0
        };
        
        setPlots(newPlots);
      }
    }
  };
  
  // Add XP and check for level up
  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      
      // Check for level up
      if (newXp >= xpToNextLevel) {
        const newLevel = level + 1;
        setLevel(newLevel);
        
        // Calculate new XP threshold (increases by 50% each level)
        const newXpToNextLevel = Math.round(xpToNextLevel * 1.5);
        setXpToNextLevel(newXpToNextLevel);
        
        toast.success(`Level Up! Now level ${newLevel}`, {
          icon: "🎖️",
        });
        
        // Unlock new plot every 2 levels
        if (newLevel % 2 === 0 && newLevel <= 8) {
          const plotsToAdd = Math.min(1, 8 - plots.length);
          
          if (plotsToAdd > 0) {
            const newPlots = [...plots];
            for (let i = 0; i < plotsToAdd; i++) {
              newPlots.push({
                id: newPlots.length,
                crop: null,
                plantedAt: null,
                harvestable: false,
                progress: 0
              });
            }
            setPlots(newPlots);
            toast.success(`New farming plot unlocked!`, {
              icon: "🌱",
            });
          }
        }
        
        return 0; // Reset XP after level up
      }
      
      return newXp;
    });
  };
  
  // Purchase upgrade
  const purchaseUpgrade = (upgradeId: string) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    
    if (upgradeIndex !== -1) {
      const upgrade = upgrades[upgradeIndex];
      
      // Check if player can afford the upgrade
      if (coins < upgrade.cost) {
        toast.error(`Not enough coins to purchase ${upgrade.name}`);
        return;
      }
      
      // Check if player meets level requirement
      if (level < upgrade.unlockLevel) {
        toast.error(`Requires level ${upgrade.unlockLevel}`);
        return;
      }
      
      // Apply upgrade effect
      upgrade.effect();
      
      // Update upgrades list
      const newUpgrades = [...upgrades];
      newUpgrades[upgradeIndex] = {
        ...newUpgrades[upgradeIndex],
        purchased: true
      };
      
      setUpgrades(newUpgrades);
      setCoins(coins - upgrade.cost);
      
      toast.success(`Purchased ${upgrade.name}!`);
    }
  };
  
  // Game loop - update crop growth
  useEffect(() => {
    if (!gameActive) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      
      const newPlots = plots.map(plot => {
        if (plot.crop && plot.plantedAt && !plot.harvestable) {
          const cropInfo = CROPS.find(c => c.id === plot.crop);
          
          if (cropInfo) {
            // Calculate growth time with boost
            const growthTimeMs = (cropInfo.growthTime * 1000) / growthBoost;
            const elapsed = now - plot.plantedAt;
            const progress = Math.min(100, Math.round((elapsed / growthTimeMs) * 100));
            
            // Check if crop is ready for harvest
            if (progress >= 100) {
              // Auto-harvest if enabled
              if (autosellActive) {
                const calculatedYield = Math.round(cropInfo.yield * yieldBoost);
                setCoins(prev => prev + calculatedYield);
                
                // Add XP (10% of yield)
                const xpGained = Math.round(calculatedYield * 0.1);
                addXp(xpGained);
                
                // Clear the plot
                changed = true;
                return {
                  ...plot,
                  crop: null,
                  plantedAt: null,
                  harvestable: false,
                  progress: 0
                };
              }
              
              changed = true;
              return {
                ...plot,
                harvestable: true,
                progress: 100
              };
            }
            
            if (progress !== plot.progress) {
              changed = true;
              return {
                ...plot,
                progress
              };
            }
          }
        }
        
        return plot;
      });
      
      if (changed) {
        setPlots(newPlots);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameActive, plots, autosellActive, growthBoost, yieldBoost]);
  
  // Calculate XP progress percentage
  const xpProgressPercentage = Math.round((xp / xpToNextLevel) * 100);
  
  // Get crop info
  const getCropInfo = (cropId: string | null) => {
    if (!cropId) return null;
    return CROPS.find(c => c.id === cropId);
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Farm Simulator</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Coins: {coins}</div>
            <div className="text-xl font-bold">Level: {level}</div>
          </div>
        )}
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Plant and harvest crops to earn coins. Upgrade your farm and unlock new crops as you level up!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-idle hover:bg-green-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
          {/* Main farm area */}
          <div className="flex-1">
            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>XP: {xp}/{xpToNextLevel}</span>
                <span>Level {level}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-game-idle"
                  style={{ width: `${xpProgressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Farm plots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {plots.map(plot => (
                <div 
                  key={plot.id}
                  className={`border-2 ${
                    plot.harvestable 
                      ? 'border-yellow-400 animate-pulse' 
                      : 'border-gray-300'
                  } rounded-lg p-4 h-40 flex flex-col items-center justify-center relative overflow-hidden`}
                >
                  {plot.crop ? (
                    <>
                      <div className="text-4xl mb-2">
                        {getCropInfo(plot.crop)?.icon}
                      </div>
                      <div className="text-sm font-semibold">
                        {getCropInfo(plot.crop)?.name}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${plot.progress}%` }}
                        />
                      </div>
                      
                      {plot.harvestable && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => harvestCrop(plot.id)}
                          className="mt-2 px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold"
                        >
                          Harvest
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => plantCrop(plot.id)}
                      className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-100 transition-colors rounded-md"
                    >
                      <span className="text-2xl">🌱</span>
                      <span className="text-sm">Plant</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Sidebar with crops and upgrades */}
          <div className="w-full md:w-72 flex flex-col gap-6">
            {/* Crop selection */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Crops</h3>
              <div className="space-y-2">
                {CROPS.map(crop => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    disabled={level < crop.unlockLevel}
                    className={`w-full flex items-center justify-between p-2 rounded-lg ${
                      selectedCrop === crop.id 
                        ? 'bg-game-idle' 
                        : level >= crop.unlockLevel 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{crop.icon}</span>
                      <span>{crop.name}</span>
                    </div>
                    <span className="text-sm">{crop.cost} 💰</span>
                  </button>
                ))}
              </div>
              
              {selectedCrop && (
                <div className="mt-3 text-sm">
                  <p>Growth Time: {Math.round((getCropInfo(selectedCrop)?.growthTime || 0) / growthBoost)}s</p>
                  <p>Yield: {Math.round((getCropInfo(selectedCrop)?.yield || 0) * yieldBoost)} coins</p>
                </div>
              )}
            </div>
            
            {/* Upgrades */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Upgrades</h3>
              <div className="space-y-2">
                {upgrades.map(upgrade => (
                  <button
                    key={upgrade.id}
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    disabled={upgrade.purchased || level < upgrade.unlockLevel || coins < upgrade.cost}
                    className={`w-full text-left p-3 rounded-lg ${
                      upgrade.purchased 
                        ? 'bg-green-100 opacity-70 cursor-not-allowed' 
                        : level >= upgrade.unlockLevel 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{upgrade.name}</span>
                      {upgrade.purchased ? (
                        <span className="text-green-600 text-sm">Purchased</span>
                      ) : (
                        <span className="text-sm">{upgrade.cost} 💰</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{upgrade.description}</p>
                    {level < upgrade.unlockLevel && (
                      <p className="text-xs text-orange-600 mt-1">Unlocks at level {upgrade.unlockLevel}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
