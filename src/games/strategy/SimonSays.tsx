
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

// Colors for the game
const COLORS = ["red", "green", "blue", "yellow"];
const COLOR_CLASSES = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
};

// Sounds for each color
const SOUNDS = {
  red: 261.63, // C4
  green: 329.63, // E4
  blue: 392.00, // G4
  yellow: 523.25, // C5
};

export function SimonSays() {
  const [gameActive, setGameActive] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Initialize audio context on first interaction
  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };
  
  // Play sound for a color
  const playSound = (color: string, duration: number = 200) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = SOUNDS[color as keyof typeof SOUNDS];
    
    gainNode.gain.value = 0.5;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  };
  
  // Add a new color to the sequence
  const addToSequence = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, randomColor]);
  };
  
  // Show the sequence to the player
  const showSequence = async () => {
    setIsShowingSequence(true);
    setPlayerSequence([]);
    
    // Show each color in sequence with delay
    for (let i = 0; i < sequence.length; i++) {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          setActiveColor(sequence[i]);
          playSound(sequence[i]);
          
          setTimeout(() => {
            setActiveColor(null);
            resolve();
          }, 500);
        }, i === 0 ? 500 : 1000);
      });
    }
    
    setIsShowingSequence(false);
  };
  
  // Handle player clicking a color
  const handleColorClick = (color: string) => {
    if (isShowingSequence || gameOver) return;
    
    setActiveColor(color);
    playSound(color);
    
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    
    // Check if player made a mistake
    if (color !== sequence[playerSequence.length]) {
      setGameOver(true);
      saveScore("simon-says", score);
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
      }
      
      return;
    }
    
    setTimeout(() => {
      setActiveColor(null);
      
      // If player completed the sequence correctly
      if (newPlayerSequence.length === sequence.length) {
        // Increase score
        setScore(prev => prev + 1);
        
        // Move to next round after delay
        setTimeout(() => {
          addToSequence();
        }, 1000);
      }
    }, 200);
  };
  
  // Start new game
  const startGame = () => {
    initAudioContext();
    setSequence([]);
    setPlayerSequence([]);
    setIsShowingSequence(false);
    setActiveColor(null);
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    
    // Start with one random color
    setTimeout(() => {
      addToSequence();
    }, 500);
  };
  
  // Show sequence when it changes
  useEffect(() => {
    if (gameActive && !gameOver && sequence.length > 0) {
      showSequence();
    }
  }, [sequence.length]);
  
  // Render color button
  const renderColorButton = (color: string) => {
    const isActive = activeColor === color;
    const baseClasses = `w-36 h-36 md:w-40 md:h-40 m-2 rounded-md ${COLOR_CLASSES[color as keyof typeof COLOR_CLASSES]}`;
    const activeClasses = isActive ? "brightness-150 shadow-lg" : "brightness-100";
    const hoverClasses = !isShowingSequence && !gameOver ? "hover:brightness-125 cursor-pointer" : "cursor-not-allowed";
    
    return (
      <div
        className={`${baseClasses} ${activeClasses} ${hoverClasses} transition-all`}
        onClick={() => !isShowingSequence && !gameOver && handleColorClick(color)}
      ></div>
    );
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Simon Says</h1>
        {gameActive && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">High Score: {highScore}</div>
          </div>
        )}
      </div>
      
      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Watch the sequence of colors and repeat it! Each round adds a new color.
          </p>
          <Button 
            onClick={startGame}
            className="bg-game-strategy text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Status message */}
          {isShowingSequence ? (
            <div className="text-xl font-bold mb-4">Watch the sequence...</div>
          ) : gameOver ? (
            <div className="text-xl font-bold mb-4">Game Over! Your score: {score}</div>
          ) : (
            <div className="text-xl font-bold mb-4">Your turn! Repeat the sequence.</div>
          )}
          
          {/* Color buttons in a 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {renderColorButton("red")}
            {renderColorButton("green")}
            {renderColorButton("blue")}
            {renderColorButton("yellow")}
          </div>
          
          {/* Game over buttons */}
          {gameOver && (
            <Button
              onClick={startGame}
              className="mt-6 bg-game-strategy text-black"
            >
              Play Again
            </Button>
          )}
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
