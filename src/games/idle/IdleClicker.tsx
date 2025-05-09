
import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

type Upgrade = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currentCost: number;
  count: number;
  basePerSecond: number;
  perSecond: number;
};

export function IdleClicker() {
  const [coins, setCoins] = useState(0);
  const [coinsPerSecond, setCoinsPerSecond] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "cursor",
      name: "Cursor",
      description: "Auto-clicks for you",
      baseCost: 10,
      currentCost: 10,
      count: 0,
      basePerSecond: 0.1,
      perSecond: 0.1
    },
    {
      id: "farmer",
      name: "Farmer",
      description: "Grows coins slowly",
      baseCost: 50,
      currentCost: 50,
      count: 0,
      basePerSecond: 0.5,
      perSecond: 0.5
    },
    {
      id: "miner",
      name: "Miner",
      description: "Mines coins steadily",
      baseCost: 200,
      currentCost: 200,
      count: 0,
      basePerSecond: 2,
      perSecond: 2
    },
    {
      id: "factory",
      name: "Factory",
      description: "Mass produces coins",
      baseCost: 1000,
      currentCost: 1000,
      count: 0,
      basePerSecond: 10,
      perSecond: 10
    }
  ]);
  
  const [clickUpgrades, setClickUpgrades] = useState([
    {
      id: "betterClicker",
      name: "Better Clicker",
      description: "+1 coin per click",
      baseCost: 30,
      currentCost: 30,
      count: 0
    },
    {
      id: "goldClicker",
      name: "Gold Clicker",
      description: "+5 coins per click",
      baseCost: 300,
      currentCost: 300,
      count: 0
    },
    {
      id: "diamondClicker",
      name: "Diamond Clicker",
      description: "+25 coins per click",
      baseCost: 2000,
      currentCost: 2000,
      count: 0
    }
  ]);
  
  const [clickAnimations, setClickAnimations] = useState<{ x: number; y: number; value: number; id: number }[]>([]);
  const nextAnimationId = useRef(0);
  
  // Add coins periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (coinsPerSecond > 0) {
        setCoins(prev => prev + coinsPerSecond / 10);
        setTotalEarned(prev => prev + coinsPerSecond / 10);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [coinsPerSecond]);
  
  // Save score periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveScore("idle-clicker", Math.floor(totalEarned));
    }, 60000); // Save every minute
    
    return () => clearInterval(saveInterval);
  }, [totalEarned]);
  
  // Calculate coins per second when upgrades change
  useEffect(() => {
    let total = 0;
    upgrades.forEach(upgrade => {
      total += upgrade.perSecond * upgrade.count;
    });
    setCoinsPerSecond(total);
  }, [upgrades]);
  
  // Handle coin click
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add coins
    setCoins(prev => prev + coinsPerClick);
    setTotalEarned(prev => prev + coinsPerClick);
    setTotalClicks(prev => prev + 1);
    
    // Add click animation
    const newAnimation = {
      x,
      y,
      value: coinsPerClick,
      id: nextAnimationId.current
    };
    
    nextAnimationId.current++;
    setClickAnimations(prev => [...prev, newAnimation]);
    
    // Remove animation after a delay
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
    }, 1000);
  };
  
  // Purchase upgrade
  const purchaseUpgrade = (upgradeId: string) => {
    setUpgrades(prev => prev.map(upgrade => {
      if (upgrade.id === upgradeId && coins >= upgrade.currentCost) {
        // Deduct cost
        setCoins(prev => prev - upgrade.currentCost);
        
        // Update upgrade
        const newCount = upgrade.count + 1;
        const newCost = Math.floor(upgrade.baseCost * Math.pow(1.15, newCount));
        
        return {
          ...upgrade,
          count: newCount,
          currentCost: newCost
        };
      }
      return upgrade;
    }));
  };
  
  // Purchase click upgrade
  const purchaseClickUpgrade = (upgradeId: string) => {
    setClickUpgrades(prev => prev.map(upgrade => {
      if (upgrade.id === upgradeId && coins >= upgrade.currentCost) {
        // Deduct cost
        setCoins(prev => prev - upgrade.currentCost);
        
        // Update click power
        if (upgradeId === "betterClicker") {
          setCoinsPerClick(prev => prev + 1);
        } else if (upgradeId === "goldClicker") {
          setCoinsPerClick(prev => prev + 5);
        } else if (upgradeId === "diamondClicker") {
          setCoinsPerClick(prev => prev + 25);
        }
        
        // Update upgrade
        const newCount = upgrade.count + 1;
        const newCost = Math.floor(upgrade.baseCost * Math.pow(1.15, newCount));
        
        return {
          ...upgrade,
          count: newCount,
          currentCost: newCost
        };
      }
      return upgrade;
    }));
  };
  
  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Idle Clicker</h1>
        <div className="text-xl font-bold">{Math.floor(coins)} Coins</div>
        <div className="text-sm text-gray-600">
          {coinsPerSecond.toFixed(1)} coins per second | {coinsPerClick} coins per click
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* Coin clicker area */}
        <div className="md:col-span-2">
          <div 
            className="w-full aspect-square bg-game-idle/30 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer"
            onClick={handleClick}
          >
            <div className="text-8xl animate-pulse-soft">💰</div>
            
            {/* Click animations */}
            {clickAnimations.map(anim => (
              <div 
                key={anim.id} 
                className="absolute pointer-events-none text-yellow-600 font-bold animate-float"
                style={{ 
                  left: `${anim.x}px`, 
                  top: `${anim.y}px`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                +{anim.value}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Total Clicks: {totalClicks}</div>
            <div className="text-sm text-gray-600">Total Earned: {Math.floor(totalEarned)} coins</div>
          </div>
        </div>
        
        {/* Upgrades area */}
        <div className="px-4 py-2 bg-gray-100 rounded-lg overflow-y-auto max-h-[500px]">
          <h2 className="font-bold mb-2">Click Upgrades</h2>
          {clickUpgrades.map(upgrade => (
            <div key={upgrade.id} className="mb-2 p-2 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{upgrade.name}</div>
                  <div className="text-xs text-gray-600">{upgrade.description}</div>
                </div>
                <button
                  onClick={() => purchaseClickUpgrade(upgrade.id)}
                  disabled={coins < upgrade.currentCost}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    coins >= upgrade.currentCost ? 'bg-game-primary text-white' : 'bg-gray-300'
                  }`}
                >
                  {Math.floor(upgrade.currentCost)} 🪙
                </button>
              </div>
              {upgrade.count > 0 && (
                <div className="text-xs text-gray-600 mt-1">Owned: {upgrade.count}</div>
              )}
            </div>
          ))}
          
          <h2 className="font-bold mt-4 mb-2">Production Upgrades</h2>
          {upgrades.map(upgrade => (
            <div key={upgrade.id} className="mb-2 p-2 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{upgrade.name}</div>
                  <div className="text-xs text-gray-600">{upgrade.description}</div>
                  <div className="text-xs text-gray-600">+{upgrade.perSecond} coins/sec</div>
                </div>
                <button
                  onClick={() => purchaseUpgrade(upgrade.id)}
                  disabled={coins < upgrade.currentCost}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    coins >= upgrade.currentCost ? 'bg-game-primary text-white' : 'bg-gray-300'
                  }`}
                >
                  {Math.floor(upgrade.currentCost)} 🪙
                </button>
              </div>
              {upgrade.count > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Owned: {upgrade.count} | Producing: {(upgrade.perSecond * upgrade.count).toFixed(1)}/sec
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <GameControls onRestart={() => {
        if (confirm("Reset your progress? You'll lose all your coins and upgrades.")) {
          setCoins(0);
          setCoinsPerClick(1);
          setCoinsPerSecond(0);
          setTotalClicks(0);
          setTotalEarned(0);
          setUpgrades(prev => prev.map(upgrade => ({
            ...upgrade,
            count: 0,
            currentCost: upgrade.baseCost
          })));
          setClickUpgrades(prev => prev.map(upgrade => ({
            ...upgrade,
            count: 0,
            currentCost: upgrade.baseCost
          })));
        }
      }} />
    </div>
  );
}
