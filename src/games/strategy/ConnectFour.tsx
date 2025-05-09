
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";

// Board dimensions
const ROWS = 6;
const COLS = 7;

// Player types
type Player = 1 | 2; // 1 for human, 2 for computer
type Cell = Player | null;
type Board = Cell[][];

export function ConnectFour() {
  const [gameActive, setGameActive] = useState(false);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [isPlayerVsComputer, setIsPlayerVsComputer] = useState(true);
  
  // Initialize empty board
  const initBoard = (): Board => {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  };
  
  // Start new game
  const startGame = (vsComputer: boolean = true) => {
    setBoard(initBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setIsDraw(false);
    setGameActive(true);
    setIsPlayerVsComputer(vsComputer);
  };
  
  // Drop piece in column
  const dropPiece = (col: number) => {
    if (winner || isDraw || isComputerThinking) return;
    
    // Create new board to maintain immutability
    const newBoard = [...board.map(row => [...row])];
    
    // Find the lowest empty cell in the column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === null) {
        row = r;
        break;
      }
    }
    
    // If column is full, do nothing
    if (row === -1) return;
    
    // Place piece
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    // Check for win
    if (checkForWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      return;
    }
    
    // Check for draw
    if (checkForDraw(newBoard)) {
      setIsDraw(true);
      return;
    }
    
    // Switch player
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    
    // If next player is computer, make its move after a delay
    if (isPlayerVsComputer && nextPlayer === 2) {
      setIsComputerThinking(true);
      setTimeout(() => {
        makeComputerMove(newBoard);
        setIsComputerThinking(false);
      }, 1000);
    }
  };
  
  // Computer makes a move
  const makeComputerMove = (currentBoard: Board) => {
    if (winner || isDraw) return;
    
    // Create new board
    const newBoard = [...currentBoard.map(row => [...row])];
    
    // Strategy: 
    // 1. Try to win
    // 2. Block opponent win
    // 3. Choose center columns preferentially
    // 4. Random column if nothing else works
    
    // Check for immediate win
    for (let c = 0; c < COLS; c++) {
      const row = getLowestEmptyRow(newBoard, c);
      if (row !== -1) {
        // Try this move
        newBoard[row][c] = 2;
        if (checkForWin(newBoard, row, c, 2)) {
          setBoard(newBoard);
          setWinner(2);
          return;
        }
        // Undo move
        newBoard[row][c] = null;
      }
    }
    
    // Block opponent win
    for (let c = 0; c < COLS; c++) {
      const row = getLowestEmptyRow(newBoard, c);
      if (row !== -1) {
        // Try opponent move here
        newBoard[row][c] = 1;
        if (checkForWin(newBoard, row, c, 1)) {
          // Block it
          newBoard[row][c] = 2;
          setBoard(newBoard);
          
          // Check if computer wins by blocking
          if (checkForWin(newBoard, row, c, 2)) {
            setWinner(2);
            return;
          }
          
          // Check for draw
          if (checkForDraw(newBoard)) {
            setIsDraw(true);
            return;
          }
          
          setCurrentPlayer(1);
          return;
        }
        // Undo move
        newBoard[row][c] = null;
      }
    }
    
    // Prefer center columns
    const columnPriority = [3, 2, 4, 1, 5, 0, 6]; // Center first, then radiating outward
    
    for (const c of columnPriority) {
      const row = getLowestEmptyRow(newBoard, c);
      if (row !== -1) {
        newBoard[row][c] = 2;
        setBoard(newBoard);
        
        // Check for win
        if (checkForWin(newBoard, row, c, 2)) {
          setWinner(2);
          return;
        }
        
        // Check for draw
        if (checkForDraw(newBoard)) {
          setIsDraw(true);
          return;
        }
        
        setCurrentPlayer(1);
        return;
      }
    }
    
    // Fallback to random move (shouldn't reach here often)
    const availableCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getLowestEmptyRow(newBoard, c) !== -1) {
        availableCols.push(c);
      }
    }
    
    if (availableCols.length > 0) {
      const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
      const row = getLowestEmptyRow(newBoard, randomCol);
      
      newBoard[row][randomCol] = 2;
      setBoard(newBoard);
      
      // Check for win
      if (checkForWin(newBoard, row, randomCol, 2)) {
        setWinner(2);
        return;
      }
      
      // Check for draw
      if (checkForDraw(newBoard)) {
        setIsDraw(true);
        return;
      }
      
      setCurrentPlayer(1);
    }
  };
  
  // Get the lowest empty row in a column
  const getLowestEmptyRow = (board: Board, col: number): number => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        return r;
      }
    }
    return -1; // Column is full
  };
  
  // Check for win
  const checkForWin = (board: Board, row: number, col: number, player: Player): boolean => {
    // Check horizontal
    let count = 0;
    for (let c = 0; c < COLS; c++) {
      count = (board[row][c] === player) ? count + 1 : 0;
      if (count >= 4) return true;
    }
    
    // Check vertical
    count = 0;
    for (let r = 0; r < ROWS; r++) {
      count = (board[r][col] === player) ? count + 1 : 0;
      if (count >= 4) return true;
    }
    
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && 
            board[r+1][c+1] === player && 
            board[r+2][c+2] === player && 
            board[r+3][c+3] === player) {
          return true;
        }
      }
    }
    
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && 
            board[r-1][c+1] === player && 
            board[r-2][c+2] === player && 
            board[r-3][c+3] === player) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Check for draw
  const checkForDraw = (board: Board): boolean => {
    // If any column has an empty cell, it's not a draw
    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === null) {
        return false;
      }
    }
    return true;
  };
  
  // Initialize board when game starts
  useEffect(() => {
    if (gameActive) {
      setBoard(initBoard());
    }
  }, [gameActive]);
  
  // Render a cell
  const renderCell = (value: Cell, row: number, col: number) => {
    let className = "w-10 h-10 rounded-full border-2 border-gray-300";
    
    if (value === 1) {
      className += " bg-red-500";
    } else if (value === 2) {
      className += " bg-yellow-500";
    } else {
      className += " bg-white";
    }
    
    return (
      <div key={`${row}-${col}`} className={className}></div>
    );
  };
  
  // Render column buttons
  const renderColumnButtons = () => {
    return (
      <div className="flex justify-center mb-2">
        {Array(COLS).fill(null).map((_, col) => (
          <button
            key={col}
            className="w-10 h-10 mx-1 bg-game-strategy text-black rounded-md hover:opacity-80 disabled:opacity-50"
            onClick={() => dropPiece(col)}
            disabled={winner !== null || isDraw || isComputerThinking || board[0][col] !== null}
          >
            ↓
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="game-container p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Connect Four</h1>
        {gameActive && (
          <div className="text-xl font-bold">
            {winner ? (
              `Player ${winner === 1 ? "Red" : "Yellow"} wins!`
            ) : isDraw ? (
              "It's a draw!"
            ) : (
              `Player ${currentPlayer === 1 ? "Red" : "Yellow"}'s turn ${isComputerThinking ? "(thinking...)" : ""}`
            )}
          </div>
        )}
      </div>
      
      {!gameActive ? (
        <div className="text-center max-w-sm mx-auto">
          <p className="mb-6">
            Connect four of your pieces in a row, column, or diagonal before your opponent!
          </p>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button 
              onClick={() => startGame(true)}
              className="bg-game-strategy text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Play vs Computer
            </Button>
            <Button 
              onClick={() => startGame(false)}
              className="bg-game-strategy text-black px-6 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Two Players
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Column selection buttons */}
          {!winner && !isDraw && renderColumnButtons()}
          
          {/* Game board */}
          <div className="bg-blue-700 p-2 rounded-lg">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <div key={colIdx} className="m-1">
                    {renderCell(cell, rowIdx, colIdx)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Game over buttons */}
          {(winner || isDraw) && (
            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => startGame(isPlayerVsComputer)}
                className="bg-game-strategy text-black"
              >
                Play Again
              </Button>
              <Button
                onClick={() => setGameActive(false)}
                variant="outline"
              >
                Main Menu
              </Button>
            </div>
          )}
        </div>
      )}
      
      <GameControls onRestart={() => startGame(isPlayerVsComputer)} />
    </div>
  );
}
