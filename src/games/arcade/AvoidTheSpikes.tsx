
import { useState, useEffect, useRef } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

export function AvoidTheSpikes() {
  const [gameActive, setGameActive] = useState(false);
  const [playerPosition, setPlayerPosition] = useState(50);
  const [score, setScore] = useState(0);
  const [spikes, setSpikes] = useState<{position: number, height: number}[]>([]);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Game loop
  const gameLoop = (timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastUpdateTimeRef.current;
    
    if (deltaTime > 16) { // ~60fps
      lastUpdateTimeRef.current = timestamp;
      
      // Update game state
      if (gameActive && !gameOver) {
        // Move spikes up
        setSpikes(prevSpikes => {
          const updatedSpikes = prevSpikes.map(spike => ({
            ...spike,
            height: spike.height + gameSpeed
          }));
          
          // Remove spikes that went off screen
          const filteredSpikes = updatedSpikes.filter(spike => spike.height < 100);
          
          // Check collision
          const collision = filteredSpikes.some(spike => 
            spike.height > 75 && 
            Math.abs(spike.position - playerPosition) < 10
          );
          
          if (collision) {
            setGameOver(true);
            saveScore("avoid-spikes", score);
            return filteredSpikes;
          }
          
          // Add score for passed spikes
          const passedSpikes = updatedSpikes.filter(spike => 
            spike.height > 95 && 
            !filteredSpikes.includes(spike)
          );
          
          if (passedSpikes.length > 0) {
            setScore(s => s + passedSpikes.length);
          }
          
          // Add new spikes randomly
          if (Math.random() < 0.02) {
            const newSpikePosition = Math.floor(Math.random() * 90) + 5;
            return [...filteredSpikes, { position: newSpikePosition, height: 0 }];
          }
          
          return filteredSpikes;
        });
        
        // Increase game speed gradually
        if (score > 0 && score % 10 === 0) {
          setGameSpeed(prev => Math.min(prev + 0.1, 12));
        }
      }
    }
    
    if (gameActive && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Handle player movement
  const handleMouseMove = (e: MouseEvent) => {
    if (gameOver) return;
    
    const container = document.getElementById("game-area");
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const percentX = (relativeX / rect.width) * 100;
    
    // Clamp position
    setPlayerPosition(Math.max(5, Math.min(95, percentX)));
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (gameOver) return;
    
    const container = document.getElementById("game-area");
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const percentX = (relativeX / rect.width) * 100;
    
    // Clamp position
    setPlayerPosition(Math.max(5, Math.min(95, percentX)));
  };
  
  // React event handlers
  const handleReactMouseMove = (e: React.MouseEvent) => {
    if (gameOver) return;
    
    const container = e.currentTarget;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const percentX = (relativeX / rect.width) * 100;
    
    // Clamp position
    setPlayerPosition(Math.max(5, Math.min(95, percentX)));
  };
  
  const handleReactTouchMove = (e: React.TouchEvent) => {
    if (gameOver) return;
    
    const container = e.currentTarget;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const percentX = (relativeX / rect.width) * 100;
    
    // Clamp position
    setPlayerPosition(Math.max(5, Math.min(95, percentX)));
  };
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setSpikes([]);
    setGameSpeed(5);
    setPlayerPosition(50);
    requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Clean up game loop
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (gameActive && !gameOver) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, { passive: true });
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameActive, gameOver]);
  
  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Avoid The Spikes</h1>
        <div className="text-xl font-bold">Score: {score}</div>
      </div>
      
      {gameActive ? (
        <div 
          id="game-area"
          className="bg-game-arcade/30 w-full max-w-md mx-auto h-96 rounded-lg relative overflow-hidden"
          onMouseMove={handleReactMouseMove}
          onTouchMove={handleReactTouchMove}
        >
          {/* Player */}
          <div 
            className="w-8 h-8 bg-blue-500 rounded-full absolute bottom-10"
            style={{ left: `calc(${playerPosition}% - 1rem)` }}
          />
          
          {/* Spikes */}
          {spikes.map((spike, index) => (
            <div 
              key={index}
              className="w-5 h-5 bg-red-500 absolute bottom-0 transform rotate-45"
              style={{ 
                left: `calc(${spike.position}% - 0.75rem)`, 
                bottom: `${spike.height}%` 
              }}
            />
          ))}
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <h2 className="text-white text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-white text-xl mb-6">Final Score: {score}</p>
              <button
                onClick={startGame}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Move your mouse or finger to avoid the red spikes! 
            How long can you survive?
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}

