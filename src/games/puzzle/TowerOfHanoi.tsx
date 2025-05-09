
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

type Disc = {
  size: number;
  color: string;
};

type Tower = Disc[];

export function TowerOfHanoi() {
  const [gameActive, setGameActive] = useState(false);
  const [towers, setTowers] = useState<Tower[]>([[], [], []]);
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [discCount, setDiscCount] = useState(3);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Color palette for discs
  const colors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];
  
  // Initialize the game with specified disc count
  const initGame = (count: number) => {
    const initialTower: Tower = [];
    for (let i = count; i > 0; i--) {
      initialTower.push({
        size: i,
        color: colors[(i - 1) % colors.length],
      });
    }
    
    setTowers([initialTower, [], []]);
    setSelectedTower(null);
    setMoves(0);
    setGameComplete(false);
    setStartTime(Date.now());
    setTimeElapsed(0);
    setGameActive(true);
  };
  
  // Handle tower click
  const handleTowerClick = (towerIndex: number) => {
    if (gameComplete) return;
    
    if (selectedTower === null) {
      // If no tower is selected and this tower has discs, select it
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      // If a tower is already selected, attempt to move
      if (selectedTower === towerIndex) {
        // Deselect if clicking the same tower
        setSelectedTower(null);
      } else {
        // Attempt to move disc from selected tower to this tower
        const sourceDisc = towers[selectedTower][0]; // Top disc of source
        const targetTower = towers[towerIndex];
        
        // Check if move is valid (can only place smaller disc on larger one)
        if (targetTower.length === 0 || sourceDisc.size < targetTower[0].size) {
          // Valid move, update towers
          const newTowers = [...towers];
          const movedDisc = newTowers[selectedTower].shift()!;
          newTowers[towerIndex].unshift(movedDisc);
          
          setTowers(newTowers);
          setMoves(moves + 1);
          setSelectedTower(null);
          
          // Check for victory (all discs moved to last tower)
          if (newTowers[2].length === discCount) {
            setGameComplete(true);
            const endTime = Date.now();
            if (startTime) {
              const elapsed = Math.floor((endTime - startTime) / 1000);
              setTimeElapsed(elapsed);
              saveScore("tower-of-hanoi", discCount * 100 - moves - elapsed);
            }
          }
        } else {
          // Invalid move, just deselect
          setSelectedTower(null);
        }
      }
    }
  };
  
  // Timer effect
  useEffect(() => {
    if (gameActive && !gameComplete && startTime) {
      const timer = setInterval(() => {
        const currentTime = Date.now();
        setTimeElapsed(Math.floor((currentTime - startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameActive, gameComplete, startTime]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render tower and discs
  const renderTower = (towerIndex: number) => {
    const tower = towers[towerIndex];
    const isSelected = selectedTower === towerIndex;
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`w-3 h-40 bg-gray-700 rounded-t-md ${isSelected ? 'bg-blue-700' : ''}`}
        ></div>
        
        <div 
          className="w-32 h-3 bg-gray-800 rounded-md"
          onClick={() => handleTowerClick(towerIndex)}
        ></div>
        
        <div className="h-40 flex flex-col-reverse items-center">
          {tower.map((disc, index) => (
            <div
              key={index}
              className={`${disc.color} flex items-center justify-center text-white text-xs h-6 rounded-md mb-1`}
              style={{ width: `${disc.size * 10 + 30}px` }}
            >
              {disc.size}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Tower of Hanoi</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Moves: {moves}</div>
            <div className="text-xl font-bold">Time: {formatTime(timeElapsed)}</div>
          </div>
        )}
      </div>
      
      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Move all discs from the first tower to the last tower. You can only place a smaller disc on top of a larger one.
          </p>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Select difficulty:</h3>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => {
                  setDiscCount(3);
                  initGame(3);
                }}
                className="bg-green-500"
              >
                Easy (3 discs)
              </Button>
              <Button 
                onClick={() => {
                  setDiscCount(4);
                  initGame(4);
                }}
                className="bg-yellow-500"
              >
                Medium (4 discs)
              </Button>
              <Button 
                onClick={() => {
                  setDiscCount(5);
                  initGame(5);
                }}
                className="bg-red-500"
              >
                Hard (5 discs)
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Game board */}
          <div className="flex justify-center gap-10 mb-8">
            {[0, 1, 2].map(towerIndex => renderTower(towerIndex))}
          </div>
          
          {/* Instructions */}
          {!gameComplete ? (
            <p className="text-lg">
              Click a tower to select it, then click another tower to move a disc.
            </p>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Puzzle Complete!</h2>
              <p className="text-xl mb-6">
                You solved it in {moves} moves and {formatTime(timeElapsed)}
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => initGame(discCount)}
                  className="bg-game-puzzle text-black"
                >
                  Play Again
                </Button>
                <Button 
                  onClick={() => setGameActive(false)}
                  variant="outline"
                >
                  Change Difficulty
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <GameControls onRestart={() => initGame(discCount)} />
    </div>
  );
}
