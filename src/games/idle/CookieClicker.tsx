
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  cookiesPerClick: number;
  cookiesPerSecond: number;
  owned: number;
}

export function CookieClicker() {
  const [cookies, setCookies] = useState(0);
  const [cookiesPerClick, setCookiesPerClick] = useState(1);
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "cursor",
      name: "Cursor",
      description: "Auto-clicks once every 10 seconds",
      cost: 15,
      cookiesPerClick: 0,
      cookiesPerSecond: 0.1,
      owned: 0,
    },
    {
      id: "grandma",
      name: "Grandma",
      description: "Bakes cookies for you",
      cost: 100,
      cookiesPerClick: 0,
      cookiesPerSecond: 1,
      owned: 0,
    },
    {
      id: "farm",
      name: "Farm",
      description: "Grows cookie plants",
      cost: 1100,
      cookiesPerClick: 0,
      cookiesPerSecond: 8,
      owned: 0,
    },
    {
      id: "mine",
      name: "Mine",
      description: "Mines cookie dough",
      cost: 12000,
      cookiesPerClick: 0,
      cookiesPerSecond: 47,
      owned: 0,
    },
    {
      id: "factory",
      name: "Factory",
      description: "Mass produces cookies",
      cost: 130000,
      cookiesPerClick: 0,
      cookiesPerSecond: 260,
      owned: 0,
    },
    {
      id: "click-upgrade",
      name: "Better Clicking",
      description: "Doubles your clicking power",
      cost: 50,
      cookiesPerClick: 1,
      cookiesPerSecond: 0,
      owned: 0,
    },
    {
      id: "super-click",
      name: "Super Clicking",
      description: "Triples your clicking power",
      cost: 500,
      cookiesPerClick: 2,
      cookiesPerSecond: 0,
      owned: 0,
    },
  ]);
  const [clickScale, setClickScale] = useState(1);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Cookie production
  useEffect(() => {
    if (cookiesPerSecond > 0) {
      const timer = setInterval(() => {
        setCookies(prev => prev + cookiesPerSecond / 10);
        setTotalEarned(prev => prev + cookiesPerSecond / 10);
      }, 100); // Update more frequently for smoother numbers
      
      return () => clearInterval(timer);
    }
  }, [cookiesPerSecond]);
  
  // Save score periodically
  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveScore("cookie-clicker", Math.floor(totalEarned));
    }, 60000); // Save every minute
    
    return () => clearInterval(saveTimer);
  }, [totalEarned]);
  
  // Format large numbers with suffixes
  const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toLocaleString();
    
    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(num) / 3);
    const suffix = suffixes[tier];
    const scaled = num / Math.pow(10, tier * 3);
    
    return scaled.toFixed(1) + suffix;
  };
  
  // Click the cookie
  const clickCookie = () => {
    setCookies(prev => prev + cookiesPerClick);
    setTotalEarned(prev => prev + cookiesPerClick);
    
    // Animation effect
    setClickScale(0.95);
    setTimeout(() => setClickScale(1), 100);
  };
  
  // Purchase an upgrade
  const purchaseUpgrade = (id: string) => {
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade) return;
    
    if (cookies >= upgrade.cost) {
      // Deduct cost
      setCookies(prev => prev - upgrade.cost);
      
      // Update upgrades
      setUpgrades(prevUpgrades => 
        prevUpgrades.map(u => {
          if (u.id === id) {
            // Increase cost for next purchase
            const newCost = Math.round(u.cost * (u.id.includes("click") ? 3 : 1.15));
            return { ...u, owned: u.owned + 1, cost: newCost };
          }
          return u;
        })
      );
      
      // Update cookies per click
      if (upgrade.cookiesPerClick > 0) {
        setCookiesPerClick(prev => prev + upgrade.cookiesPerClick);
      }
      
      // Update cookies per second
      if (upgrade.cookiesPerSecond > 0) {
        setCookiesPerSecond(prev => prev + upgrade.cookiesPerSecond);
      }
    }
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Cookie Clicker</h1>
        <div className="text-2xl font-bold mb-1">
          {formatNumber(cookies)} cookies
        </div>
        <div className="text-sm text-gray-600">
          {formatNumber(cookiesPerSecond)} per second | {cookiesPerClick} per click
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
        {/* Cookie */}
        <div className="flex-1 flex flex-col items-center">
          <button 
            onClick={clickCookie}
            className="bg-transparent border-none outline-none cursor-pointer transform transition-transform"
            style={{ transform: `scale(${clickScale})` }}
          >
            <div className="w-40 h-40 rounded-full bg-yellow-800 flex items-center justify-center hover:brightness-110">
              <div className="w-36 h-36 rounded-full bg-yellow-600 flex items-center justify-center shadow-inner">
                <div className="w-32 h-32 rounded-full bg-yellow-500 flex items-center justify-center relative">
                  {/* Cookie texture (dots) */}
                  {[...Array(10)].map((_, i) => {
                    const angle = (i / 10) * 2 * Math.PI;
                    const distance = 10 + Math.random() * 5;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    return (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-yellow-800"
                        style={{
                          top: `calc(50% + ${y}px)`,
                          left: `calc(50% + ${x}px)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </button>
          <p className="mt-4 text-lg">Click the cookie to earn cookies!</p>
        </div>
        
        {/* Upgrades */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-3">Upgrades</h2>
          <div className="space-y-2 overflow-y-auto max-h-96 pr-2">
            {upgrades.map((upgrade) => (
              <div
                key={upgrade.id}
                className="relative"
                onMouseEnter={() => setShowTooltip(upgrade.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Button 
                  onClick={() => purchaseUpgrade(upgrade.id)}
                  disabled={cookies < upgrade.cost}
                  className={`w-full text-left flex justify-between items-center ${
                    cookies >= upgrade.cost ? 'bg-game-idle text-black' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold">{upgrade.name}</div>
                    <div className="text-xs">{upgrade.owned > 0 && `Owned: ${upgrade.owned}`}</div>
                  </div>
                  <div className="text-sm">
                    {formatNumber(upgrade.cost)} cookies
                  </div>
                </Button>
                
                {showTooltip === upgrade.id && (
                  <div className="absolute left-0 bottom-full mb-2 bg-black text-white p-2 rounded-md text-sm w-64 z-10">
                    <div className="font-bold">{upgrade.name}</div>
                    <div>{upgrade.description}</div>
                    {upgrade.cookiesPerClick > 0 && (
                      <div>+{upgrade.cookiesPerClick} cookies per click</div>
                    )}
                    {upgrade.cookiesPerSecond > 0 && (
                      <div>+{upgrade.cookiesPerSecond} cookies per second</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Total cookies earned: {formatNumber(totalEarned)}
        </p>
      </div>
      
      <GameControls />
    </div>
  );
}
