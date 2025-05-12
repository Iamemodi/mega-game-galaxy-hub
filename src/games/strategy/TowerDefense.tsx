
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { toast } from "sonner";

// Game entities
interface Entity {
  id: number;
  x: number;
  y: number;
}

interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  value: number;
  path: number;
  pathIndex: number;
  damage: number;
}

interface Tower extends Entity {
  type: 'basic' | 'cannon' | 'sniper' | 'laser';
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  level: number;
  target?: Enemy;
  projectiles: Projectile[];
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  active: boolean;
}

// Tower types
const TOWER_TYPES = {
  basic: {
    name: "Basic Tower",
    description: "Fast firing, low damage",
    cost: 50,
    damage: 10,
    range: 120,
    fireRate: 500, // ms between shots
    color: "#3498db"
  },
  cannon: {
    name: "Cannon Tower",
    description: "Slow firing, high damage",
    cost: 100,
    damage: 50,
    range: 100,
    fireRate: 1200,
    color: "#e74c3c"
  },
  sniper: {
    name: "Sniper Tower",
    description: "Long range, moderate damage",
    cost: 150,
    damage: 25,
    range: 200,
    fireRate: 800,
    color: "#2ecc71"
  },
  laser: {
    name: "Laser Tower",
    description: "Very fast firing, low damage",
    cost: 200,
    damage: 5,
    range: 150,
    fireRate: 200,
    color: "#9b59b6"
  }
};

type TowerType = keyof typeof TOWER_TYPES;

// Path for enemies
const PATHS = [
  [
    { x: 0, y: 250 },
    { x: 150, y: 250 },
    { x: 150, y: 100 },
    { x: 350, y: 100 },
    { x: 350, y: 300 },
    { x: 500, y: 300 }
  ],
  [
    { x: 0, y: 150 },
    { x: 200, y: 150 },
    { x: 200, y: 350 },
    { x: 400, y: 350 },
    { x: 400, y: 50 },
    { x: 500, y: 50 }
  ]
];

export function TowerDefense() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [money, setMoney] = useState(150);
  const [lives, setLives] = useState(10);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [isPlacingTower, setIsPlacingTower] = useState(false);
  const [currentWave, setCurrentWave] = useState(0);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [waveCompleted, setWaveCompleted] = useState(false);
  const [boardWidth, setBoardWidth] = useState(500);
  const [boardHeight, setBoardHeight] = useState(400);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const nextEnemyIdRef = useRef(1);
  const nextTowerIdRef = useRef(1);
  const nextProjectileIdRef = useRef(1);
  
  // Generate enemy wave
  const generateWave = (waveNumber: number) => {
    const enemyCount = 5 + waveNumber * 3;
    const health = 50 + waveNumber * 20;
    const speed = 1 + waveNumber * 0.1;
    const value = 5 + waveNumber;
    const damage = 1; // 1 life per enemy that reaches the end
    
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      const pathChoice = i % 2; // Alternate between paths
      
      newEnemies.push({
        id: nextEnemyIdRef.current++,
        x: PATHS[pathChoice][0].x,
        y: PATHS[pathChoice][0].y,
        health: health,
        maxHealth: health,
        speed: speed,
        value: value,
        path: pathChoice,
        pathIndex: 0,
        damage: damage
      });
    }
    
    // Space out the enemies
    return newEnemies.map((enemy, index) => ({
      ...enemy,
      x: enemy.x - (index * 60) // Offset each enemy's starting position
    }));
  };
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setMoney(150);
    setLives(10);
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setSelectedTowerType(null);
    setSelectedTower(null);
    setIsPlacingTower(false);
    setCurrentWave(0);
    setWaveInProgress(false);
    setWaveCompleted(true); // Ready to start first wave
    
    nextEnemyIdRef.current = 1;
    nextTowerIdRef.current = 1;
    nextProjectileIdRef.current = 1;
    
    // Start game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Select tower to place
  const selectTowerToPlace = (type: TowerType) => {
    const cost = TOWER_TYPES[type].cost;
    
    if (money >= cost) {
      setSelectedTowerType(type);
      setIsPlacingTower(true);
      setSelectedTower(null);
    } else {
      toast.error("Not enough money!");
    }
  };
  
  // Handle canvas click for tower placement or selection
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || gameOver) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (isPlacingTower && selectedTowerType) {
      // Check if we can place a tower at this location
      if (canPlaceTower(x, y)) {
        placeTower(selectedTowerType, x, y);
        setIsPlacingTower(false);
        setSelectedTowerType(null);
      } else {
        toast.error("Cannot place tower here!");
      }
    } else {
      // Select a tower if it's clicked
      const clickedTower = towers.find(tower => {
        const dx = tower.x - x;
        const dy = tower.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 20; // 20px radius for selection
      });
      
      setSelectedTower(clickedTower || null);
    }
  };
  
  // Check if a tower can be placed at the given location
  const canPlaceTower = (x: number, y: number) => {
    // Check if too close to path
    for (const path of PATHS) {
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        
        // Check if point is too close to line segment
        const dist = distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < 30) {
          return false;
        }
      }
    }
    
    // Check if too close to other towers
    for (const tower of towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distSquared = dx * dx + dy * dy;
      if (distSquared < 40 * 40) {
        return false;
      }
    }
    
    return true;
  };
  
  // Place a tower at the given location
  const placeTower = (type: TowerType, x: number, y: number) => {
    const towerType = TOWER_TYPES[type];
    
    // Check if we have enough money
    if (money < towerType.cost) {
      toast.error("Not enough money!");
      return;
    }
    
    // Deduct money
    setMoney(prev => prev - towerType.cost);
    
    // Create new tower
    const newTower: Tower = {
      id: nextTowerIdRef.current++,
      x,
      y,
      type,
      damage: towerType.damage,
      range: towerType.range,
      fireRate: towerType.fireRate,
      lastFired: 0,
      level: 1,
      projectiles: []
    };
    
    // Add tower
    setTowers(prev => [...prev, newTower]);
    toast.success(`Placed ${towerType.name}!`);
  };
  
  // Upgrade selected tower
  const upgradeSelectedTower = () => {
    if (!selectedTower) return;
    
    const upgradeCost = TOWER_TYPES[selectedTower.type].cost * 0.75 * selectedTower.level;
    
    if (money >= upgradeCost) {
      setMoney(prev => prev - upgradeCost);
      
      // Update tower stats
      setTowers(prev => prev.map(tower => {
        if (tower.id === selectedTower.id) {
          return {
            ...tower,
            damage: tower.damage * 1.5,
            range: tower.range * 1.2,
            fireRate: tower.fireRate * 0.8, // Faster firing
            level: tower.level + 1
          };
        }
        return tower;
      }));
      
      toast.success("Tower upgraded!");
    } else {
      toast.error("Not enough money for upgrade!");
    }
  };
  
  // Sell selected tower
  const sellSelectedTower = () => {
    if (!selectedTower) return;
    
    // Calculate refund (50% of total cost)
    const baseCost = TOWER_TYPES[selectedTower.type].cost;
    let refund = baseCost * 0.5;
    
    // Add upgrade costs
    for (let i = 1; i < selectedTower.level; i++) {
      refund += baseCost * 0.75 * i * 0.5;
    }
    
    // Add money
    setMoney(prev => prev + Math.floor(refund));
    
    // Remove tower
    setTowers(prev => prev.filter(tower => tower.id !== selectedTower.id));
    
    // Clear selection
    setSelectedTower(null);
    
    toast.success(`Tower sold for $${Math.floor(refund)}!`);
  };
  
  // Start the next wave
  const startNextWave = () => {
    if (waveInProgress) return;
    
    setCurrentWave(prev => prev + 1);
    const newEnemies = generateWave(currentWave + 1);
    setEnemies(newEnemies);
    setWaveInProgress(true);
    setWaveCompleted(false);
    
    toast.info(`Wave ${currentWave + 1} started!`);
  };
  
  // Game loop
  const gameLoop = (timestamp: number) => {
    if (!gameActive || gameOver) return;
    
    updateGameState(timestamp);
    renderGame();
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Update game state
  const updateGameState = (timestamp: number) => {
    // Move enemies along paths
    const updatedEnemies = [...enemies];
    
    // Track enemies that reached the end
    const enemiesReachedEnd: Enemy[] = [];
    
    for (const enemy of updatedEnemies) {
      if (enemy.health <= 0) continue;
      
      const path = PATHS[enemy.path];
      const targetPoint = path[enemy.pathIndex];
      
      // Calculate direction towards next point
      const dx = targetPoint.x - enemy.x;
      const dy = targetPoint.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < enemy.speed) {
        // Reached current target point
        enemy.x = targetPoint.x;
        enemy.y = targetPoint.y;
        
        // Move to next point
        if (enemy.pathIndex < path.length - 1) {
          enemy.pathIndex++;
        } else {
          // Reached end of path
          enemiesReachedEnd.push(enemy);
        }
      } else {
        // Move towards target point
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
      }
    }
    
    // Remove enemies that reached the end and reduce lives
    let livesLost = 0;
    setEnemies(
      updatedEnemies.filter(enemy => {
        if (enemiesReachedEnd.includes(enemy)) {
          livesLost += enemy.damage;
          return false;
        }
        return enemy.health > 0; // Also remove dead enemies
      })
    );
    
    if (livesLost > 0) {
      setLives(prev => {
        const newLives = prev - livesLost;
        if (newLives <= 0) {
          // Game over
          setGameOver(true);
          saveScore("tower-defense", score);
          cancelAnimationFrame(gameLoopRef.current as number);
          toast.error("Game Over! You lost all your lives.");
        }
        return Math.max(0, newLives);
      });
    }
    
    // Check if wave is completed
    if (waveInProgress && enemies.length === 0) {
      setWaveInProgress(false);
      setWaveCompleted(true);
      
      // Award bonus for completing wave
      const bonus = 50 + currentWave * 10;
      setScore(prev => prev + bonus);
      setMoney(prev => prev + bonus);
      
      toast.success(`Wave ${currentWave} completed! +$${bonus} bonus`);
      
      // Increase level after every 5 waves
      if (currentWave % 5 === 0) {
        setLevel(prev => prev + 1);
        toast.info(`Level increased to ${level + 1}!`);
      }
    }
    
    // Tower targeting and firing
    const updatedTowers = [...towers];
    const newProjectiles: Projectile[] = [...projectiles];
    
    for (const tower of updatedTowers) {
      // Find enemies in range
      const enemiesInRange = updatedEnemies
        .filter(enemy => enemy.health > 0)
        .filter(enemy => {
          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          return dx * dx + dy * dy <= tower.range * tower.range;
        });
      
      if (enemiesInRange.length > 0) {
        // Target first enemy
        const target = enemiesInRange[0];
        tower.target = target;
        
        // Check if tower can fire
        if (timestamp - tower.lastFired >= tower.fireRate) {
          tower.lastFired = timestamp;
          
          // Create projectile
          const projectile: Projectile = {
            id: nextProjectileIdRef.current++,
            x: tower.x,
            y: tower.y,
            targetId: target.id,
            targetX: target.x,
            targetY: target.y,
            damage: tower.damage,
            speed: 5,
            active: true
          };
          
          newProjectiles.push(projectile);
        }
      } else {
        tower.target = undefined;
      }
    }
    
    // Update projectiles
    const updatedProjectiles = newProjectiles
      .filter(projectile => projectile.active)
      .map(projectile => {
        // Find target
        const target = updatedEnemies.find(enemy => enemy.id === projectile.targetId);
        
        if (target) {
          // Update target position
          projectile.targetX = target.x;
          projectile.targetY = target.y;
        }
        
        // Calculate direction towards target
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < projectile.speed) {
          // Hit target
          projectile.active = false;
          
          // Apply damage to enemy
          if (target) {
            target.health -= projectile.damage;
            
            if (target.health <= 0) {
              // Enemy killed
              setMoney(prev => prev + target.value);
              setScore(prev => prev + target.value);
            }
          }
        } else {
          // Move towards target
          projectile.x += (dx / distance) * projectile.speed;
          projectile.y += (dy / distance) * projectile.speed;
        }
        
        return projectile;
      });
    
    setProjectiles(updatedProjectiles);
    setTowers(updatedTowers);
  };
  
  // Render game
  const renderGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw paths
    drawPaths(ctx);
    
    // Draw tower placement preview
    if (isPlacingTower && selectedTowerType) {
      drawTowerPlacementPreview(ctx);
    }
    
    // Draw towers
    drawTowers(ctx);
    
    // Draw enemies
    drawEnemies(ctx);
    
    // Draw projectiles
    drawProjectiles(ctx);
    
    // Draw selected tower range
    if (selectedTower) {
      drawTowerRange(ctx, selectedTower);
    }
  };
  
  // Draw paths
  const drawPaths = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#a67c52'; // Brown path
    
    for (const path of PATHS) {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      
      ctx.stroke();
    }
  };
  
  // Draw towers
  const drawTowers = (ctx: CanvasRenderingContext2D) => {
    for (const tower of towers) {
      const towerType = TOWER_TYPES[tower.type];
      
      // Draw tower base
      ctx.fillStyle = towerType.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw tower details based on type
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      
      if (tower.type === 'basic') {
        // Small circle on top
        ctx.arc(tower.x, tower.y, 8, 0, Math.PI * 2);
      } else if (tower.type === 'cannon') {
        // Rectangle on top
        ctx.fillRect(tower.x - 7, tower.y - 7, 14, 14);
      } else if (tower.type === 'sniper') {
        // Cross on top
        ctx.fillRect(tower.x - 8, tower.y - 2, 16, 4);
        ctx.fillRect(tower.x - 2, tower.y - 8, 4, 16);
      } else if (tower.type === 'laser') {
        // Diamond shape
        ctx.moveTo(tower.x, tower.y - 8);
        ctx.lineTo(tower.x + 8, tower.y);
        ctx.lineTo(tower.x, tower.y + 8);
        ctx.lineTo(tower.x - 8, tower.y);
        ctx.closePath();
      }
      
      ctx.fill();
      
      // Draw level indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tower.level.toString(), tower.x, tower.y);
      
      // Draw line to target if tower is targeting an enemy
      if (tower.target) {
        ctx.strokeStyle = towerType.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tower.x, tower.y);
        ctx.lineTo(tower.target.x, tower.target.y);
        ctx.stroke();
      }
      
      // Highlight selected tower
      if (selectedTower && tower.id === selectedTower.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
  
  // Draw tower placement preview
  const drawTowerPlacementPreview = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current || !selectedTowerType) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(canvas.width, mouse.x - rect.left));
    const mouseY = Math.max(0, Math.min(canvas.height, mouse.y - rect.top));
    
    const towerType = TOWER_TYPES[selectedTowerType];
    const canPlace = canPlaceTower(mouseX, mouseY);
    
    // Draw tower range
    ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
    ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, towerType.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw tower preview
    ctx.fillStyle = canPlace ? towerType.color : 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Draw tower range
  const drawTowerRange = (ctx: CanvasRenderingContext2D, tower: Tower) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  
  // Draw enemies
  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    for (const enemy of enemies) {
      if (enemy.health <= 0) continue;
      
      // Draw enemy
      ctx.fillStyle = `hsl(${(enemy.id * 30) % 360}, 70%, 50%)`;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? 'green' : healthPercent > 0.2 ? 'orange' : 'red';
      ctx.fillRect(enemy.x - 10, enemy.y - 15, 20 * healthPercent, 3);
      
      // Draw health bar background
      ctx.strokeStyle = 'black';
      ctx.strokeRect(enemy.x - 10, enemy.y - 15, 20, 3);
    }
  };
  
  // Draw projectiles
  const drawProjectiles = (ctx: CanvasRenderingContext2D) => {
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Track mouse position for tower placement
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };
  
  // Calculate distance from point to line segment
  const distanceToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
      param = dot / len_sq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Set up canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set canvas size
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      const width = Math.min(boardWidth, container.clientWidth);
      const height = boardHeight;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      renderGame();
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Clean up game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="game-container flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Tower Defense</h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="text-xl">Money: ${money}</div>
            <div className="text-xl">Lives: {lives}</div>
            <div className="text-xl">Wave: {currentWave}</div>
            <div className="text-xl">Score: {score}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Build defensive towers to protect your base from waves of enemies. Upgrade your defenses and survive as long as possible.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
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
            className="bg-game-strategy hover:bg-game-strategy/90 text-black px-6 py-3 rounded-lg font-bold"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Game Board */}
            <div className="flex-1 bg-green-800 rounded-lg overflow-hidden">
              <canvas 
                ref={canvasRef}
                className="w-full cursor-pointer"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                width={boardWidth}
                height={boardHeight}
              />
            </div>
            
            {/* Controls */}
            <div className="w-full md:w-64 space-y-4">
              {/* Tower Selection */}
              <div className="bg-slate-100 rounded-lg p-4">
                <h3 className="font-bold mb-2">Towers</h3>
                <div className="space-y-2">
                  {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                    <Button 
                      key={key}
                      onClick={() => selectTowerToPlace(key as TowerType)}
                      disabled={money < tower.cost}
                      className={`w-full justify-between ${
                        selectedTowerType === key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-black'
                      }`}
                      size="sm"
                    >
                      <span>{tower.name}</span>
                      <span>${tower.cost}</span>
                    </Button>
                  ))}
                </div>
                
                {isPlacingTower && (
                  <Button
                    onClick={() => {
                      setIsPlacingTower(false);
                      setSelectedTowerType(null);
                    }}
                    className="w-full mt-2 bg-red-500 text-white"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {/* Tower Details */}
              {selectedTower && (
                <div className="bg-slate-100 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Selected Tower</h3>
                  <div className="space-y-1 mb-4">
                    <p>Type: {TOWER_TYPES[selectedTower.type].name}</p>
                    <p>Level: {selectedTower.level}</p>
                    <p>Damage: {selectedTower.damage}</p>
                    <p>Range: {selectedTower.range}</p>
                    <p>Fire Rate: {(1000 / selectedTower.fireRate).toFixed(1)}/s</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={upgradeSelectedTower}
                      disabled={money < TOWER_TYPES[selectedTower.type].cost * 0.75 * selectedTower.level}
                      className="w-full bg-blue-600 text-white"
                      size="sm"
                    >
                      Upgrade (${Math.floor(TOWER_TYPES[selectedTower.type].cost * 0.75 * selectedTower.level)})
                    </Button>
                    <Button
                      onClick={sellSelectedTower}
                      className="w-full bg-red-500 text-white"
                      size="sm"
                    >
                      Sell (${Math.floor(TOWER_TYPES[selectedTower.type].cost * 0.5)})
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Wave Control */}
              <div className="bg-slate-100 rounded-lg p-4">
                {waveCompleted ? (
                  <Button
                    onClick={startNextWave}
                    className="w-full bg-green-600 text-white"
                  >
                    Start Wave {currentWave + 1}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="font-bold mb-1">Wave {currentWave} in progress</p>
                    <p>Enemies: {enemies.length}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="text-sm text-gray-600">Tip: Build towers along the path to stop enemies!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
