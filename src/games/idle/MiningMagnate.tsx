
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

interface Resource {
  id: string;
  name: string;
  icon: string;
  baseValue: number;
  amount: number;
  unlockLevel: number;
}

interface Miner {
  id: string;
  name: string;
  icon: string;
  cost: number;
  baseOutput: number;
  count: number;
  resource: string;
  unlockLevel: number;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  unlockLevel: number;
  effect: () => void;
}

export function MiningMagnate() {
  const [gameActive, setGameActive] = useState(false);
  const [coins, setCoins] = useState(50);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [resourceMultiplier, setResourceMultiplier] = useState(1);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  
  // Resources
  const [resources, setResources] = useState<Resource[]>([
    { id: "stone", name: "Stone", icon: "🪨", baseValue: 1, amount: 0, unlockLevel: 1 },
    { id: "coal", name: "Coal", icon: "⚫", baseValue: 3, amount: 0, unlockLevel: 2 },
    { id: "iron", name: "Iron", icon: "⚙️", baseValue: 5, amount: 0, unlockLevel: 3 },
    { id: "gold", name: "Gold", icon: "🟡", baseValue: 15, amount: 0, unlockLevel: 5 },
    { id: "diamond", name: "Diamond", icon: "💎", baseValue: 50, amount: 0, unlockLevel: 8 },
  ]);
  
  // Miners
  const [miners, setMiners] = useState<Miner[]>([
    { id: "stone_miner", name: "Stone Miner", icon: "⛏️", cost: 25, baseOutput: 0.2, count: 0, resource: "stone", unlockLevel: 1 },
    { id: "coal_miner", name: "Coal Miner", icon: "⚒️", cost: 100, baseOutput: 0.1, count: 0, resource: "coal", unlockLevel: 2 },
    { id: "iron_miner", name: "Iron Miner", icon: "🔨", cost: 250, baseOutput: 0.08, count: 0, resource: "iron", unlockLevel: 3 },
    { id: "gold_miner", name: "Gold Miner", icon: "🪓", cost: 1000, baseOutput: 0.05, count: 0, resource: "gold", unlockLevel: 5 },
    { id: "diamond_miner", name: "Diamond Miner", icon: "⚡", cost: 5000, baseOutput: 0.01, count: 0, resource: "diamond", unlockLevel: 8 },
  ]);
  
  // Upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "better_picks",
      name: "Better Pickaxes",
      description: "Increase click mining by 50%",
      cost: 200,
      purchased: false,
      unlockLevel: 2,
      effect: () => setClickMultiplier(prev => prev * 1.5)
    },
    {
      id: "mining_training",
      name: "Mining Training",
      description: "All miners produce 25% more resources",
      cost: 500,
      purchased: false,
      unlockLevel: 3,
      effect: () => setResourceMultiplier(prev => prev * 1.25)
    },
    {
      id: "efficient_smelting",
      name: "Efficient Smelting",
      description: "Resources are worth 50% more when sold",
      cost: 1000,
      purchased: false,
      unlockLevel: 4,
      effect: () => {
        setResources(prev => prev.map(resource => ({
          ...resource,
          baseValue: Math.round(resource.baseValue * 1.5)
        })));
      }
    },
  ]);
  
  // Unlock new content when leveling up
  const checkUnlocks = (newLevel: number) => {
    // Check for newly unlocked resources
    const newlyUnlockedResources = resources.filter(r => r.unlockLevel === newLevel);
    if (newlyUnlockedResources.length > 0) {
      toast.success(`Unlocked new resource: ${newlyUnlockedResources.map(r => r.name).join(", ")}`);
    }
    
    // Check for newly unlocked miners
    const newlyUnlockedMiners = miners.filter(m => m.unlockLevel === newLevel);
    if (newlyUnlockedMiners.length > 0) {
      toast.success(`Unlocked new miner: ${newlyUnlockedMiners.map(m => m.name).join(", ")}`);
    }
    
    // Check for newly unlocked upgrades
    const newlyUnlockedUpgrades = upgrades.filter(u => u.unlockLevel === newLevel);
    if (newlyUnlockedUpgrades.length > 0) {
      toast.success(`Unlocked new upgrade: ${newlyUnlockedUpgrades.map(u => u.name).join(", ")}`);
    }
  };
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setCoins(50);
    setLevel(1);
    setXp(0);
    setXpToNextLevel(100);
    setResourceMultiplier(1);
    setClickMultiplier(1);
    
    // Reset resources
    setResources(resources.map(resource => ({
      ...resource,
      amount: 0
    })));
    
    // Reset miners
    setMiners(miners.map(miner => ({
      ...miner,
      count: 0
    })));
    
    // Reset upgrades
    setUpgrades(upgrades.map(upgrade => ({
      ...upgrade,
      purchased: false
    })));
  };
  
  // Mine resource manually
  const mineResource = (resourceId: string) => {
    // Find the resource
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || resource.unlockLevel > level) return;
    
    // Add resource with click multiplier
    const newResources = [...resources];
    const resourceIndex = newResources.findIndex(r => r.id === resourceId);
    
    if (resourceIndex !== -1) {
      // Base amount is 1, multiplied by click multiplier
      const amount = 1 * clickMultiplier;
      newResources[resourceIndex].amount += amount;
      
      // Add small XP for manual mining
      addXp(0.1);
      
      setResources(newResources);
      
      // Show toast occasionally (not every click)
      if (Math.random() < 0.1) {
        toast.success(`Mined ${amount} ${resource.name}`);
      }
    }
  };
  
  // Buy a miner
  const buyMiner = (minerId: string) => {
    // Find the miner
    const miner = miners.find(m => m.id === minerId);
    if (!miner || miner.unlockLevel > level) return;
    
    // Check if player can afford the miner
    const cost = calculateMinerCost(miner);
    if (coins < cost) {
      toast.error(`Not enough coins to buy ${miner.name}`);
      return;
    }
    
    // Buy the miner
    const newMiners = [...miners];
    const minerIndex = newMiners.findIndex(m => m.id === minerId);
    
    if (minerIndex !== -1) {
      newMiners[minerIndex].count++;
      setCoins(coins - cost);
      setMiners(newMiners);
      
      // Add XP for buying a miner
      addXp(cost * 0.1);
      
      toast.success(`Purchased ${miner.name}`);
    }
  };
  
  // Calculate cost of next miner (cost increases with each purchase)
  const calculateMinerCost = (miner: Miner) => {
    return Math.round(miner.cost * Math.pow(1.15, miner.count));
  };
  
  // Sell resource
  const sellResource = (resourceId: string, amount: "all" | "1" | "10" | "half") => {
    // Find the resource
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    const newResources = [...resources];
    const resourceIndex = newResources.findIndex(r => r.id === resourceId);
    
    if (resourceIndex !== -1) {
      let amountToSell = 0;
      
      if (amount === "all") {
        amountToSell = newResources[resourceIndex].amount;
      } else if (amount === "half") {
        amountToSell = Math.floor(newResources[resourceIndex].amount / 2);
      } else {
        amountToSell = Math.min(parseInt(amount), newResources[resourceIndex].amount);
      }
      
      if (amountToSell <= 0) {
        toast.error(`No ${resource.name} to sell`);
        return;
      }
      
      // Calculate value
      const value = amountToSell * resource.baseValue;
      
      // Update resources and coins
      newResources[resourceIndex].amount -= amountToSell;
      setResources(newResources);
      setCoins(coins + value);
      
      // Add XP for selling resources
      addXp(value * 0.05);
      
      toast.success(`Sold ${amountToSell} ${resource.name} for ${value} coins`);
    }
  };
  
  // Purchase upgrade
  const purchaseUpgrade = (upgradeId: string) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    
    if (upgradeIndex !== -1) {
      const upgrade = upgrades[upgradeIndex];
      
      // Check if already purchased
      if (upgrade.purchased) {
        toast.error(`${upgrade.name} already purchased`);
        return;
      }
      
      // Check if player meets level requirement
      if (level < upgrade.unlockLevel) {
        toast.error(`Requires level ${upgrade.unlockLevel}`);
        return;
      }
      
      // Check if player can afford the upgrade
      if (coins < upgrade.cost) {
        toast.error(`Not enough coins to purchase ${upgrade.name}`);
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
      
      // Add XP for purchasing upgrade
      addXp(upgrade.cost * 0.2);
      
      toast.success(`Purchased ${upgrade.name}!`);
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
        
        // Check for unlocks at the new level
        checkUnlocks(newLevel);
        
        return 0; // Reset XP after level up
      }
      
      return newXp;
    });
  };
  
  // Auto mine resources
  useEffect(() => {
    if (!gameActive) return;
    
    const interval = setInterval(() => {
      let resourcesChanged = false;
      
      const newResources = [...resources];
      
      // For each type of miner, calculate production
      miners.forEach(miner => {
        if (miner.count > 0) {
          // Find resource for this miner
          const resourceIndex = newResources.findIndex(r => r.id === miner.resource);
          
          if (resourceIndex !== -1) {
            // Calculate production with multiplier
            const production = miner.baseOutput * miner.count * resourceMultiplier;
            newResources[resourceIndex].amount += production;
            resourcesChanged = true;
          }
        }
      });
      
      if (resourcesChanged) {
        setResources(newResources);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameActive, miners, resourceMultiplier]);
  
  // Auto save game
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!gameActive || !autoSaveEnabled) {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      return;
    }
    
    // Save game data every 30 seconds
    saveIntervalRef.current = setInterval(() => {
      saveScore("mining-magnate", Math.round(coins));
      toast.info("Game progress auto-saved");
    }, 30000);
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [gameActive, autoSaveEnabled, coins]);
  
  // Calculate total resource production per second
  const calculateProduction = (resourceId: string) => {
    let production = 0;
    
    // Find all miners that produce this resource
    const resourceMiners = miners.filter(m => m.resource === resourceId);
    
    // Sum up production
    resourceMiners.forEach(miner => {
      production += miner.baseOutput * miner.count * resourceMultiplier;
    });
    
    return production;
  };
  
  // Calculate XP progress percentage
  const xpProgressPercentage = Math.round((xp / xpToNextLevel) * 100);
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Mining Magnate</h1>
        <div className="flex justify-center gap-8">
          <div className="text-xl font-bold">Coins: {Math.floor(coins)}</div>
          <div className="text-xl font-bold">Level: {level}</div>
        </div>
      </div>

      {!gameActive ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build your mining empire! Click to mine resources, hire miners for passive income, and upgrade your operations.
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
        <div className="flex flex-col xl:flex-row gap-6 max-w-6xl mx-auto">
          {/* Left column - Resources and mining */}
          <div className="flex-1">
            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>XP: {Math.floor(xp)}/{xpToNextLevel}</span>
                <span>Level {level}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-game-idle"
                  style={{ width: `${xpProgressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Resources */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(resource => (
                  resource.unlockLevel <= level && (
                    <div 
                      key={resource.id}
                      className="bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{resource.icon}</span>
                          <div>
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-xs text-gray-500">Value: {resource.baseValue} coins each</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{Math.floor(resource.amount)}</div>
                          <div className="text-xs text-gray-500">
                            +{calculateProduction(resource.id).toFixed(1)}/s
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-game-idle hover:bg-green-300 text-sm py-1 px-2 rounded"
                          onClick={() => mineResource(resource.id)}
                        >
                          Mine 
                          {clickMultiplier > 1 && <span> (x{clickMultiplier.toFixed(1)})</span>}
                        </motion.button>
                        
                        <div className="grid grid-cols-2 gap-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-xs py-1 rounded"
                            onClick={() => sellResource(resource.id, "all")}
                            disabled={resource.amount <= 0}
                          >
                            Sell All
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-yellow-300 hover:bg-yellow-400 text-xs py-1 rounded"
                            onClick={() => sellResource(resource.id, "10")}
                            disabled={resource.amount < 10}
                          >
                            Sell 10
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column - Miners and upgrades */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Miners */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-3">Miners</h3>
              <div className="space-y-3">
                {miners.map(miner => (
                  (miner.unlockLevel <= level || level >= 50) && (
                    <div 
                      key={miner.id}
                      className="bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{miner.icon}</span>
                          <div>
                            <div className="font-medium">{miner.name}</div>
                            <div className="text-xs text-gray-500">
                              Produces {(miner.baseOutput * resourceMultiplier).toFixed(2)} {resources.find(r => r.id === miner.resource)?.name} per second
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{miner.count}</div>
                          <div className="text-xs text-gray-500">
                            Total: {(miner.baseOutput * miner.count * resourceMultiplier).toFixed(1)}/s
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-400 hover:bg-blue-500 text-white py-1 px-2 rounded"
                        onClick={() => buyMiner(miner.id)}
                        disabled={coins < calculateMinerCost(miner)}
                      >
                        Buy for {calculateMinerCost(miner)} coins
                      </motion.button>
                    </div>
                  )
                ))}
              </div>
            </div>
            
            {/* Upgrades */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-3">Upgrades</h3>
              <div className="space-y-3">
                {upgrades.map(upgrade => (
                  (upgrade.unlockLevel <= level && !upgrade.purchased) && (
                    <div 
                      key={upgrade.id}
                      className="bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="font-medium">{upgrade.name}</div>
                          <div className="text-xs text-gray-500">{upgrade.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{upgrade.cost} coins</div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-purple-400 hover:bg-purple-500 text-white py-1 px-2 rounded"
                        onClick={() => purchaseUpgrade(upgrade.id)}
                        disabled={coins < upgrade.cost}
                      >
                        Purchase
                      </motion.button>
                    </div>
                  )
                ))}
                
                {upgrades.filter(u => u.unlockLevel <= level && !u.purchased).length === 0 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    No upgrades available at your current level.
                  </div>
                )}
              </div>
            </div>
            
            {/* Settings */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold mb-3">Settings</h3>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="autosave" 
                  checked={autoSaveEnabled}
                  onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="mr-2"
                />
                <label htmlFor="autosave">Auto-save game progress (every 30s)</label>
              </div>
              
              <Button
                onClick={() => saveScore("mining-magnate", Math.round(coins))}
                className="w-full mt-3 bg-gray-400 hover:bg-gray-500"
              >
                Save Game Now
              </Button>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
