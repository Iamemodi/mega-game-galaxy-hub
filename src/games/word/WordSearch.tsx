
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";

const GRID_SIZE = 8;

// Dictionary of words
const WORD_LISTS = {
  animals: ["CAT", "DOG", "LION", "BEAR", "WOLF", "TIGER", "FOX", "EAGLE", "SHARK", "WHALE"],
  food: ["PIZZA", "BURGER", "SALAD", "PASTA", "STEAK", "BREAD", "APPLE", "CHIPS", "TACO", "RICE"],
  colors: ["RED", "BLUE", "GREEN", "BLACK", "WHITE", "BROWN", "PURPLE", "YELLOW", "ORANGE", "PINK"],
};

type WordCategory = keyof typeof WORD_LISTS;

// Direction for word placement
type Direction = "horizontal" | "vertical" | "diagonal";

export function WordSearch() {
  const [gameActive, setGameActive] = useState(false);
  const [category, setCategory] = useState<WordCategory>("animals");
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{row: number, col: number}[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  // Create the grid with random letters
  const createGrid = () => {
    // Initialize empty grid
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill('')
    );
    
    // Select words for this game
    const wordList = [...WORD_LISTS[category]].sort(() => Math.random() - 0.5).slice(0, 5);
    setWords(wordList);
    
    // Place words in the grid
    wordList.forEach(word => {
      placeWord(newGrid, word);
    });
    
    // Fill empty spaces with random letters
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col]) {
          newGrid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    setGrid(newGrid);
  };
  
  // Place a word in the grid in a random direction
  const placeWord = (grid: string[][], word: string) => {
    const directions: Direction[] = ["horizontal", "vertical", "diagonal"];
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 50) {
      attempts++;
      
      // Pick a random direction
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      // Calculate max starting position based on direction and word length
      let maxRow = GRID_SIZE - 1;
      let maxCol = GRID_SIZE - 1;
      
      if (direction === "horizontal" || direction === "diagonal") {
        maxCol = GRID_SIZE - word.length;
      }
      
      if (direction === "vertical" || direction === "diagonal") {
        maxRow = GRID_SIZE - word.length;
      }
      
      // If word is too long for direction, try another direction
      if (maxCol < 0 || maxRow < 0) continue;
      
      // Pick a random starting position
      const startRow = Math.floor(Math.random() * (maxRow + 1));
      const startCol = Math.floor(Math.random() * (maxCol + 1));
      
      // Check if word fits without overlapping
      let canPlace = true;
      const positions: {row: number, col: number}[] = [];
      
      for (let i = 0; i < word.length; i++) {
        let row = startRow;
        let col = startCol;
        
        if (direction === "horizontal") col += i;
        if (direction === "vertical") row += i;
        if (direction === "diagonal") {
          row += i;
          col += i;
        }
        
        // Check if position is already filled with a different letter
        if (grid[row][col] && grid[row][col] !== word[i]) {
          canPlace = false;
          break;
        }
        
        positions.push({row, col});
      }
      
      // Place the word if it fits
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const { row, col } = positions[i];
          grid[row][col] = word[i];
        }
        placed = true;
      }
    }
    
    return placed;
  };
  
  // Check if selected cells form a valid word
  const checkSelection = () => {
    if (selection.length < 2) return;
    
    // Extract word from selection
    let word = "";
    selection.forEach(pos => {
      word += grid[pos.row][pos.col];
    });
    
    // Check if this is one of our words
    if (words.includes(word) && !foundWords.includes(word)) {
      setFoundWords(prev => [...prev, word]);
      
      // Check if all words are found
      if (foundWords.length + 1 === words.length) {
        endGame();
      }
    }
    
    // Clear selection
    setSelection([]);
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // If first cell selected or adjacent to last selected cell
    if (selection.length === 0) {
      setSelection([{row, col}]);
    } else {
      const lastCell = selection[selection.length - 1];
      const rowDiff = Math.abs(row - lastCell.row);
      const colDiff = Math.abs(col - lastCell.col);
      
      // If adjacent or diagonal
      if (rowDiff <= 1 && colDiff <= 1) {
        // Check if cell is already in selection
        const alreadySelected = selection.some(pos => pos.row === row && pos.col === col);
        
        if (alreadySelected) {
          // If clicking the second-to-last cell, remove the last cell
          if (selection.length >= 2 && 
              row === selection[selection.length - 2].row && 
              col === selection[selection.length - 2].col) {
            setSelection(selection.slice(0, -1));
          }
        } else {
          // Add to selection
          setSelection([...selection, {row, col}]);
        }
      }
    }
  };
  
  // End game and save score
  const endGame = () => {
    setGameOver(true);
    
    // Calculate score based on words found and time left
    const score = foundWords.length * 100 + timeLeft;
    saveScore("word-search", score);
  };
  
  // Handle category selection
  const selectCategory = (cat: WordCategory) => {
    setCategory(cat);
    startGame(cat);
  };
  
  // Start game
  const startGame = (selectedCategory?: WordCategory) => {
    const cat = selectedCategory || category;
    setCategory(cat);
    setGameActive(true);
    setFoundWords([]);
    setSelection([]);
    setGameOver(false);
    setTimeLeft(120);
  };
  
  // Timer
  useEffect(() => {
    if (gameActive && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver]);
  
  // Initialize grid when game starts
  useEffect(() => {
    if (gameActive && !gameOver) {
      createGrid();
    }
  }, [gameActive, gameOver, category]);
  
  // Check for completed word when selection changes
  useEffect(() => {
    if (selection.length >= 3) {
      checkSelection();
    }
  }, [selection]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Word Search</h1>
        {gameActive && !gameOver && (
          <div className="flex justify-center gap-8">
            <div className="text-xl font-bold">Time: {formatTime(timeLeft)}</div>
            <div className="text-xl font-bold">Found: {foundWords.length}/{words.length}</div>
          </div>
        )}
      </div>
      
      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Find all hidden words before time runs out! Choose a category:
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button 
              onClick={() => selectCategory("animals")}
              className="bg-game-word text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Animals
            </Button>
            <Button 
              onClick={() => selectCategory("food")}
              className="bg-game-word text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Food
            </Button>
            <Button 
              onClick={() => selectCategory("colors")}
              className="bg-game-word text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Colors
            </Button>
          </div>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Words found: {foundWords.length}/{words.length}</p>
          <p className="text-xl mb-6">Time remaining: {formatTime(timeLeft)}</p>
          <Button
            onClick={() => startGame()}
            className="bg-game-word text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-bold mb-2">Words to Find:</h3>
              <ul className="space-y-1">
                {words.map((word) => (
                  <li 
                    key={word} 
                    className={foundWords.includes(word) 
                      ? "line-through text-green-600" 
                      : ""
                    }
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Found Words:</h3>
              <ul className="space-y-1">
                {foundWords.map((word) => (
                  <li key={word} className="text-green-600">{word}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-rows-8 border border-gray-300 rounded-lg overflow-hidden">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-8 h-10">
                {row.map((letter, colIndex) => {
                  const isSelected = selection.some(
                    pos => pos.row === rowIndex && pos.col === colIndex
                  );
                  
                  const isFoundWord = foundWords.some(word => {
                    // Check if this cell is part of a found word
                    // This would require tracking positions of found words
                    return false; // Placeholder
                  });
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-10 h-10 flex items-center justify-center font-bold text-lg
                        ${isSelected ? 'bg-game-word text-black' : 'bg-white'}
                        ${isFoundWord ? 'bg-green-200' : ''}
                        hover:bg-gray-100 border border-gray-300`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={() => setSelection([])}
              className="mr-4"
            >
              Clear Selection
            </Button>
            <Button 
              onClick={checkSelection}
            >
              Check Word
            </Button>
          </div>
        </div>
      )}
      
      <GameControls onRestart={() => startGame()} />
    </div>
  );
}
