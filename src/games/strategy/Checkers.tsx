
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

type PieceType = 'regular' | 'king';
type Player = 'red' | 'black';
type Piece = {
  player: Player;
  type: PieceType;
} | null;

type Board = Piece[][];
type Position = { row: number; col: number };

export function Checkers() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  // Initialize board
  const initializeBoard = (): Board => {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place black pieces (computer)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'black', type: 'regular' };
        }
      }
    }
    
    // Place red pieces (player)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'red', type: 'regular' };
        }
      }
    }
    
    return board;
  };
  
  // Get valid moves for a piece
  const getValidMoves = (board: Board, pos: Position): Position[] => {
    const { row, col } = pos;
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves: Position[] = [];
    const directions = piece.type === 'king' 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.player === 'red' 
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      // Simple move
      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }
      
      // Jump move
      const jumpRow = row + dRow * 2;
      const jumpCol = col + dCol * 2;
      
      if (isValidPosition(jumpRow, jumpCol) && 
          board[newRow][newCol] && 
          board[newRow][newCol]!.player !== piece.player &&
          !board[jumpRow][jumpCol]) {
        moves.push({ row: jumpRow, col: jumpCol });
      }
    }
    
    return moves;
  };
  
  // Check if position is valid
  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };
  
  // Move piece
  const movePiece = (from: Position, to: Position): Board => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return newBoard;
    
    // Move piece
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    
    // Check for capture
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    
    if (Math.abs(from.row - to.row) === 2 && Number.isInteger(midRow) && Number.isInteger(midCol)) {
      newBoard[midRow][midCol] = null; // Remove captured piece
    }
    
    // Promote to king
    if ((piece.player === 'red' && to.row === 0) || 
        (piece.player === 'black' && to.row === 7)) {
      newBoard[to.row][to.col]!.type = 'king';
    }
    
    return newBoard;
  };
  
  // Check for winner
  const checkWinner = (board: Board): Player | null => {
    const redPieces = board.flat().filter(piece => piece?.player === 'red').length;
    const blackPieces = board.flat().filter(piece => piece?.player === 'black').length;
    
    if (redPieces === 0) return 'black';
    if (blackPieces === 0) return 'red';
    
    return null;
  };
  
  // Handle piece click
  const handlePieceClick = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver) return;
    
    const piece = board[row][col];
    
    if (selectedPiece) {
      // Try to move
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        const newBoard = movePiece(selectedPiece, { row, col });
        setBoard(newBoard);
        setSelectedPiece(null);
        setValidMoves([]);
        
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          if (gameWinner === 'red') {
            saveScore("checkers", 1000);
          }
        } else {
          setCurrentPlayer('black');
          setIsPlayerTurn(false);
        }
      } else {
        // Select new piece or deselect
        if (piece && piece.player === 'red') {
          setSelectedPiece({ row, col });
          setValidMoves(getValidMoves(board, { row, col }));
        } else {
          setSelectedPiece(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select piece
      if (piece && piece.player === 'red') {
        setSelectedPiece({ row, col });
        setValidMoves(getValidMoves(board, { row, col }));
      }
    }
  };
  
  // Computer move
  const makeComputerMove = () => {
    const allMoves: { from: Position; to: Position }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.player === 'black') {
          const moves = getValidMoves(board, { row, col });
          moves.forEach(move => {
            allMoves.push({ from: { row, col }, to: move });
          });
        }
      }
    }
    
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      const newBoard = movePiece(randomMove.from, randomMove.to);
      setBoard(newBoard);
      
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setGameOver(true);
      } else {
        setCurrentPlayer('red');
        setIsPlayerTurn(true);
      }
    }
  };
  
  // Computer move effect
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && gameActive) {
      const timer = setTimeout(makeComputerMove, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, gameActive, board]);
  
  // Start game
  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setBoard(initializeBoard());
    setCurrentPlayer('red');
    setSelectedPiece(null);
    setValidMoves([]);
    setWinner(null);
    setGameActive(true);
    setGameOver(false);
    setDifficulty(selectedDifficulty);
    setIsPlayerTurn(true);
  };
  
  // Get cell class
  const getCellClass = (row: number, col: number) => {
    let baseClass = "w-12 h-12 flex items-center justify-center relative";
    
    // Board pattern
    if ((row + col) % 2 === 0) {
      baseClass += " bg-amber-100";
    } else {
      baseClass += " bg-amber-800";
    }
    
    // Selected piece highlight
    if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
      baseClass += " ring-4 ring-blue-400";
    }
    
    // Valid move highlight
    if (validMoves.some(move => move.row === row && move.col === col)) {
      baseClass += " ring-2 ring-green-400";
    }
    
    return baseClass;
  };
  
  // Render piece
  const renderPiece = (piece: Piece) => {
    if (!piece) return null;
    
    const isKing = piece.type === 'king';
    const color = piece.player === 'red' ? 'bg-red-600' : 'bg-gray-800';
    
    return (
      <div className={`w-10 h-10 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center`}>
        {isKing && <span className="text-white text-xs font-bold">♔</span>}
      </div>
    );
  };

  return (
    <div className="game-container flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <motion.div 
        className="w-full max-w-2xl p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-amber-900">Checkers</h1>
          {gameActive && (
            <div className="text-xl">
              {gameOver 
                ? `${winner === 'red' ? 'You Win!' : 'Computer Wins!'}` 
                : `${isPlayerTurn ? 'Your Turn' : "Computer's Turn"}`}
            </div>
          )}
        </div>

        {!gameActive ? (
          <div className="text-center max-w-md mx-auto">
            <p className="mb-6 text-gray-600">
              Play classic Checkers against the computer. Capture all enemy pieces or block them from moving.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => startGame('easy')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Easy
              </Button>
              <Button 
                onClick={() => startGame('medium')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Medium
              </Button>
              <Button 
                onClick={() => startGame('hard')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Hard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Game Board */}
            <div className="grid grid-cols-8 gap-0 border-4 border-amber-900 mb-6">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handlePieceClick(rowIndex, colIndex)}
                  >
                    {renderPiece(piece)}
                  </div>
                ))
              )}
            </div>
            
            {/* Game Info */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                You are red pieces • Click a piece to select, then click where to move
              </p>
              {selectedPiece && (
                <p className="text-sm text-blue-600 mt-1">
                  Piece selected • Green highlights show valid moves
                </p>
              )}
            </div>
            
            {gameOver && (
              <div className="flex gap-3">
                <Button 
                  onClick={() => startGame(difficulty)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold"
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
            )}
          </div>
        )}
      </motion.div>

      <GameControls onRestart={() => setGameActive(false)} />
    </div>
  );
}
