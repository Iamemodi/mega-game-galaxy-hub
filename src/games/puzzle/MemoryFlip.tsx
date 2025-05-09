import { useState, useEffect } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const symbols = [
  "★", "♥", "♣", "♠", "♦", "☺", 
  "♫", "☼", "☾", "➔", "✓", "⚡"
];

export function MemoryFlip() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(symbols.length);

  // Start a new game
  const startGame = (difficulty: "easy" | "medium" | "hard" = "medium") => {
    const pairs = difficulty === "easy" ? 6 : difficulty === "medium" ? 9 : 12;
    setTotalPairs(pairs);
    
    // Create array with pairs of symbols
    const symbolsToUse = symbols.slice(0, pairs);
    let newCards: Card[] = [];
    
    symbolsToUse.forEach((symbol) => {
      // Add two of each symbol
      newCards.push(
        { id: newCards.length, symbol, isFlipped: false, isMatched: false },
        { id: newCards.length + 1, symbol, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    
    setCards(newCards);
    setFlippedCount(0);
    setFlippedIndexes([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameOver(false);
    setGameStarted(true);
  };

  // Handle card flip
  const handleCardClick = (index: number) => {
    // Prevent flipping if:
    // 1. The card is already flipped
    // 2. The card is already matched
    // 3. Two cards are already flipped
    // 4. Game is over
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedCount >= 2 ||
      gameOver
    ) {
      return;
    }
    
    // Flip the card
    setCards((prevCards) => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], isFlipped: true };
      return newCards;
    });
    
    // Update flipped indexes and count
    if (flippedCount === 0) {
      setFlippedIndexes([index]);
      setFlippedCount(1);
    } else {
      setFlippedIndexes([...flippedIndexes, index]);
      setFlippedCount(2);
      setMoves((prev) => prev + 1);
    }
  };

  // Check for matches
  useEffect(() => {
    if (flippedCount === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      
      // Check if the symbols match
      const match = cards[firstIndex].symbol === cards[secondIndex].symbol;
      
      // Wait a bit before flipping back or marking as matched
      setTimeout(() => {
        setCards((prevCards) => {
          const newCards = [...prevCards];
          
          if (match) {
            // Mark both cards as matched
            newCards[firstIndex] = { ...newCards[firstIndex], isMatched: true };
            newCards[secondIndex] = { ...newCards[secondIndex], isMatched: true };
            setMatchedPairs((prev) => prev + 1);
          } else {
            // Flip both cards back
            newCards[firstIndex] = { ...newCards[firstIndex], isFlipped: false };
            newCards[secondIndex] = { ...newCards[secondIndex], isFlipped: false };
          }
          
          return newCards;
        });
        
        // Reset flipped state
        setFlippedCount(0);
        setFlippedIndexes([]);
      }, 800);
    }
  }, [flippedCount, flippedIndexes, cards]);

  // Check for game over
  useEffect(() => {
    if (gameStarted && matchedPairs === totalPairs) {
      setGameOver(true);
      // Calculate score based on moves and total pairs
      const score = Math.max(100, Math.round((totalPairs * 100) / Math.max(1, moves - totalPairs)));
      saveScore("memory-flip", score);
    }
  }, [matchedPairs, totalPairs, moves, gameStarted]);

  return (
    <div className="game-container">
      {!gameStarted && (
        <div className="text-center p-8 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Memory Flip</h1>
          <p className="mb-6">
            Test your memory! Find all matching pairs with the fewest moves possible.
          </p>
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => startGame("easy")}
              className="bg-game-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-game-secondary transition-colors"
            >
              Easy (6 pairs)
            </button>
            <button
              onClick={() => startGame("medium")}
              className="bg-game-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-game-secondary transition-colors"
            >
              Medium (9 pairs)
            </button>
            <button
              onClick={() => startGame("hard")}
              className="bg-game-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-game-secondary transition-colors"
            >
              Hard (12 pairs)
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="text-center mb-4">
            <div className="flex justify-between px-6 mb-2">
              <div className="text-xl font-bold">Pairs: {matchedPairs}/{totalPairs}</div>
              <div className="text-xl font-bold">Moves: {moves}</div>
            </div>
          </div>

          <div className={`grid gap-2 p-2 max-w-md mx-auto ${
            totalPairs <= 6 ? "grid-cols-3" : totalPairs <= 9 ? "grid-cols-4" : "grid-cols-5"
          }`}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square flex items-center justify-center p-2 text-2xl font-bold 
                  rounded cursor-pointer transition-all duration-200 transform 
                  ${
                    card.isFlipped || card.isMatched
                      ? "bg-game-accent text-game-primary rotate-y-0"
                      : "bg-game-primary text-white rotate-y-180"
                  }
                  ${card.isMatched ? "opacity-60" : ""}
                  hover:scale-105 active:scale-95`}
              >
                {card.isFlipped || card.isMatched ? card.symbol : "?"}
              </div>
            ))}
          </div>
        </>
      )}

      {gameOver && (
        <div className="text-center mt-8 animate-pop">
          <h2 className="text-2xl font-bold mb-2">Well Done!</h2>
          <p className="text-xl mb-2">
            You found all {totalPairs} pairs in {moves} moves!
          </p>
          <p className="text-lg mb-4">
            Score: {Math.round((totalPairs * 100) / Math.max(1, moves - totalPairs))}
          </p>
          <button
            onClick={() => startGame()}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <GameControls onRestart={() => startGame()} />
    </div>
  );
}
