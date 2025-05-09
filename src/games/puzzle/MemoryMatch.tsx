
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Card icons for different difficulties
const CARD_ICONS = {
  easy: ['🍎', '🍌', '🍇', '🍉', '🍊', '🍋', '🍍', '🥭'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄'],
  hard: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚚', '🚛', '🚜', '🛵', '🚲', '✈️', '🚀']
};

interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

interface GameLevel {
  difficulty: 'easy' | 'medium' | 'hard';
  rows: number;
  cols: number;
  timeLimit: number;
}

// Game difficulty levels
const GAME_LEVELS: GameLevel[] = [
  { difficulty: 'easy', rows: 4, cols: 4, timeLimit: 60 },
  { difficulty: 'medium', rows: 4, cols: 5, timeLimit: 90 },
  { difficulty: 'hard', rows: 5, cols: 6, timeLimit: 120 }
];

export function MemoryMatch() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setLevel(0);
    setMoves(0);
    setMatchedCount(0);
    resetBoard(0);
  };
  
  // Reset the game board for a specific level
  const resetBoard = (levelIndex: number) => {
    const gameLevel = GAME_LEVELS[levelIndex];
    const { difficulty, rows, cols, timeLimit } = gameLevel;
    
    setTimeLeft(timeLimit);
    
    // Calculate how many pairs we need
    const totalPairs = Math.floor((rows * cols) / 2);
    
    // Get random icons
    const availableIcons = CARD_ICONS[difficulty];
    const selectedIcons = [...availableIcons]
      .sort(() => 0.5 - Math.random())
      .slice(0, totalPairs);
    
    // Create pairs of cards with the same icon
    let cardPairs = selectedIcons.flatMap(icon => [
      { icon, flipped: false, matched: false, id: Math.random() },
      { icon, flipped: false, matched: false, id: Math.random() }
    ]);
    
    // Shuffle the cards
    cardPairs = cardPairs.sort(() => 0.5 - Math.random());
    
    setCards(cardPairs);
    setFlippedIndices([]);
  };
  
  // Handle card flip
  const flipCard = (index: number) => {
    if (!gameActive || gameOver) return;
    
    // Can't flip more than 2 cards at once
    if (flippedIndices.length >= 2) return;
    
    // Can't flip already matched or flipped cards
    if (cards[index].matched || cards[index].flipped) return;
    
    // Flip the card
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], flipped: true };
    setCards(updatedCards);
    
    // Add to flipped cards
    setFlippedIndices([...flippedIndices, index]);
  };
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIndices.length === 2) {
      // Increment move counter
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = flippedIndices;
      
      // Check if cards match
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Mark cards as matched
        const updatedCards = [...cards];
        updatedCards[firstIndex] = { ...updatedCards[firstIndex], matched: true };
        updatedCards[secondIndex] = { ...updatedCards[secondIndex], matched: true };
        setCards(updatedCards);
        
        // Update matched count
        setMatchedCount(matchedCount + 1);
        
        // Add score
        const difficulty = GAME_LEVELS[level].difficulty;
        const pointsPerMatch = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 50;
        setScore(score + pointsPerMatch);
        
        // Clear flipped indices
        setFlippedIndices([]);
        
        // Check if all pairs are matched
        const totalPairs = cards.length / 2;
        if (matchedCount + 1 === totalPairs) {
          // Level complete
          completedLevel();
        }
      } else {
        // Cards don't match, flip them back after a delay
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex] = { ...updatedCards[firstIndex], flipped: false };
          updatedCards[secondIndex] = { ...updatedCards[secondIndex], flipped: false };
          setCards(updatedCards);
          
          // Clear flipped indices
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices]);
  
  // Handle level completion
  const completedLevel = () => {
    // Add time bonus
    const timeBonus = timeLeft * 5;
    setScore(score + timeBonus);
    
    toast.success(`Level complete! +${timeBonus} time bonus`);
    
    // Check if there are more levels
    if (level < GAME_LEVELS.length - 1) {
      // Move to next level after a delay
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setMatchedCount(0);
        resetBoard(nextLevel);
        
        toast.success(`Level ${nextLevel + 1} - ${GAME_LEVELS[nextLevel].difficulty.toUpperCase()}`);
      }, 1500);
    } else {
      // Game complete
      setTimeout(() => {
        endGame(true);
      }, 1500);
    }
  };
  
  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("memory-match", score);
    
    if (completed) {
      toast.success(`Game completed! Final score: ${score}`);
    } else {
      toast.info(`Time's up! Your score: ${score}`);
    }
  };
  
  // Game timer
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  // Cards per row
  const currentGameLevel = GAME_LEVELS[level];
  const cardsPerRow = currentGameLevel ? currentGameLevel.cols : 4;

  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Memory Match</h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-xl font-bold">Time: {timeLeft}s</div>
            <div className="text-xl font-bold">Level: {level + 1} ({GAME_LEVELS[level].difficulty})</div>
            <div className="text-xl font-bold">Moves: {moves}</div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto">
          <p className="mb-6">
            Test your memory! Flip cards to find matching pairs. Complete all levels to win!
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="bg-game-puzzle hover:bg-purple-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Your final score: {score}</p>
          <p className="mb-6">Total moves: {moves}</p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={startGame}
              className="bg-game-puzzle hover:bg-purple-300 text-black px-6 py-3 rounded-lg font-bold"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          {/* Game board */}
          <div 
            className="grid gap-2 mb-8"
            style={{ 
              gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
              maxWidth: `${cardsPerRow * 80}px`
            }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                whileTap={{ scale: card.flipped || card.matched ? 1 : 0.95 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer flex items-center justify-center ${
                  card.flipped || card.matched 
                    ? card.matched 
                      ? 'bg-green-300'
                      : 'bg-game-puzzle'
                    : 'bg-gray-300 hover:bg-gray-200'
                } ${card.matched ? 'bounce-in' : ''}`}
                onClick={() => flipCard(index)}
              >
                {(card.flipped || card.matched) && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl"
                  >
                    {card.icon}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Progress indicator */}
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="bg-game-puzzle h-full transition-all"
              style={{ 
                width: `${cards.length > 0 ? (matchedCount / (cards.length / 2)) * 100 : 0}%` 
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pairs found: {matchedCount} / {cards.length / 2}
          </p>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
