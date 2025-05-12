
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameControls } from "@/components/GameControls";
import { toast } from "sonner";
import { saveScore } from "@/utils/gameUtils";
import { motion } from "framer-motion";

// Chess piece types
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

// Chess piece colors
type PieceColor = 'white' | 'black';

// Chess pieces with unicode characters
const CHESS_PIECES = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Cell {
  piece: Piece | null;
  highlight: boolean;
  selected: boolean;
  validMove: boolean;
}

interface Puzzle {
  title: string;
  description: string;
  difficulty: string;
  board: (Piece | null)[][];
  moves: { from: [number, number], to: [number, number] }[];
  timeLimit: number;
}

// Sample chess puzzles
const PUZZLES: Puzzle[] = [
  {
    title: "Queen's Capture",
    description: "Capture the opponent's piece in one move",
    difficulty: "Easy",
    timeLimit: 30,
    board: [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, { type: 'pawn', color: 'black' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, { type: 'queen', color: 'white' }, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ],
    moves: [{ from: [1, 5], to: [3, 3] }] // Queen captures pawn
  },
  {
    title: "Knight's Fork",
    description: "Use the knight to attack two pieces simultaneously",
    difficulty: "Medium",
    timeLimit: 45,
    board: [
      [null, null, null, { type: 'king', color: 'black' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { type: 'rook', color: 'black' }, null, null, null],
      [null, null, { type: 'knight', color: 'white' }, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ],
    moves: [{ from: [2, 5], to: [3, 3] }] // Knight moves to fork king and rook
  },
  {
    title: "Checkmate in One",
    description: "Find the move that delivers checkmate",
    difficulty: "Hard",
    timeLimit: 60,
    board: [
      [null, null, null, { type: 'king', color: 'black' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, { type: 'queen', color: 'white' }, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { type: 'rook', color: 'white' }, null, null, null],
      [null, null, null, null, null, null, null, null],
    ],
    moves: [{ from: [2, 4], to: [3, 3] }] // Queen moves to deliver checkmate
  }
];

export function ChessPuzzle() {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
  const [movesMade, setMovesMade] = useState<{ from: [number, number], to: [number, number] }[]>([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  
  // Start game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setPuzzleIndex(0);
    setMovesMade([]);
    setPuzzleComplete(false);
    setHelpUsed(false);
    loadPuzzle(0);
  };
  
  // Load chess puzzle
  const loadPuzzle = (index: number) => {
    if (index >= PUZZLES.length) {
      // All puzzles completed
      endGame(true);
      return;
    }
    
    const puzzle = PUZZLES[index];
    setTimeLeft(puzzle.timeLimit);
    setSelectedCell(null);
    setMovesMade([]);
    setPuzzleComplete(false);
    setHelpUsed(false);
    
    // Initialize board with puzzle pieces
    const newBoard: Cell[][] = Array(8).fill(null).map((_, y) => 
      Array(8).fill(null).map((_, x) => ({
        piece: puzzle.board[y][x],
        highlight: false,
        selected: false,
        validMove: false
      }))
    );
    
    setBoard(newBoard);
  };
  
  // Handle cell click on chess board
  const handleCellClick = (x: number, y: number) => {
    if (!gameActive || gameOver || puzzleComplete) return;
    
    // If no cell is selected and clicked cell has a piece, select it
    if (!selectedCell && board[y][x].piece?.color === 'white') {
      setSelectedCell({ x, y });
      
      // Highlight selected cell
      const newBoard = [...board];
      newBoard[y][x].selected = true;
      
      // Highlight valid moves for selected piece
      const validMoves = findValidMoves(x, y, newBoard[y][x].piece!.type);
      
      for (const [moveX, moveY] of validMoves) {
        newBoard[moveY][moveX].validMove = true;
      }
      
      setBoard(newBoard);
    } 
    // If a cell is already selected
    else if (selectedCell) {
      // If clicking the same cell, deselect it
      if (selectedCell.x === x && selectedCell.y === y) {
        deselectCell();
        return;
      }
      
      // Check if move is valid (highlighted as valid move)
      if (board[y][x].validMove) {
        // Make the move
        makeMove(selectedCell.x, selectedCell.y, x, y);
      } else {
        // If clicking another piece of same color, select that piece instead
        if (board[y][x].piece?.color === 'white') {
          deselectCell();
          handleCellClick(x, y); // Recursively call to select this cell
        } else {
          // Clicking invalid cell, deselect current
          deselectCell();
        }
      }
    }
  };
  
  // Deselect currently selected cell and clear highlights
  const deselectCell = () => {
    setSelectedCell(null);
    
    const newBoard = board.map(row => 
      row.map(cell => ({
        ...cell,
        selected: false,
        validMove: false
      }))
    );
    
    setBoard(newBoard);
  };
  
  // Make a move on the chess board
  const makeMove = (fromX: number, fromY: number, toX: number, toY: number) => {
    const newBoard = [...board];
    const piece = newBoard[fromY][fromX].piece;
    
    // Move the piece
    newBoard[toY][toX].piece = piece;
    newBoard[fromY][fromX].piece = null;
    
    // Clear selections and highlights
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        newBoard[y][x].selected = false;
        newBoard[y][x].validMove = false;
        newBoard[y][x].highlight = false;
      }
    }
    
    // Highlight the move
    newBoard[fromY][fromX].highlight = true;
    newBoard[toY][toX].highlight = true;
    
    setBoard(newBoard);
    setSelectedCell(null);
    
    // Record the move
    const move = { from: [fromX, fromY] as [number, number], to: [toX, toY] as [number, number] };
    setMovesMade([...movesMade, move]);
    
    // Check if move matches solution
    checkMove(move);
  };
  
  // Find valid moves for a piece (simplified chess rules)
  const findValidMoves = (x: number, y: number, pieceType: PieceType): [number, number][] => {
    const validMoves: [number, number][] = [];
    
    switch (pieceType) {
      case 'pawn':
        // White pawns move up (decrease y)
        if (y > 0 && !board[y-1][x].piece) {
          validMoves.push([x, y-1]);
          
          // First move can be 2 squares
          if (y === 6 && !board[y-2][x].piece) {
            validMoves.push([x, y-2]);
          }
        }
        
        // Capture diagonally
        if (y > 0 && x > 0 && board[y-1][x-1].piece?.color === 'black') {
          validMoves.push([x-1, y-1]);
        }
        if (y > 0 && x < 7 && board[y-1][x+1].piece?.color === 'black') {
          validMoves.push([x+1, y-1]);
        }
        break;
        
      case 'knight':
        // Knight's L-shaped moves
        const knightMoves = [
          [x+1, y-2], [x+2, y-1], [x+2, y+1], [x+1, y+2],
          [x-1, y+2], [x-2, y+1], [x-2, y-1], [x-1, y-2]
        ];
        
        for (const [moveX, moveY] of knightMoves) {
          if (moveX >= 0 && moveX < 8 && moveY >= 0 && moveY < 8) {
            if (!board[moveY][moveX].piece || board[moveY][moveX].piece.color === 'black') {
              validMoves.push([moveX, moveY]);
            }
          }
        }
        break;
        
      case 'bishop':
        // Bishop moves diagonally
        // Up-right
        for (let i = 1; x + i < 8 && y - i >= 0; i++) {
          if (!board[y-i][x+i].piece) {
            validMoves.push([x+i, y-i]);
          } else {
            if (board[y-i][x+i].piece?.color === 'black') {
              validMoves.push([x+i, y-i]);
            }
            break;
          }
        }
        
        // Up-left
        for (let i = 1; x - i >= 0 && y - i >= 0; i++) {
          if (!board[y-i][x-i].piece) {
            validMoves.push([x-i, y-i]);
          } else {
            if (board[y-i][x-i].piece?.color === 'black') {
              validMoves.push([x-i, y-i]);
            }
            break;
          }
        }
        
        // Down-right
        for (let i = 1; x + i < 8 && y + i < 8; i++) {
          if (!board[y+i][x+i].piece) {
            validMoves.push([x+i, y+i]);
          } else {
            if (board[y+i][x+i].piece?.color === 'black') {
              validMoves.push([x+i, y+i]);
            }
            break;
          }
        }
        
        // Down-left
        for (let i = 1; x - i >= 0 && y + i < 8; i++) {
          if (!board[y+i][x-i].piece) {
            validMoves.push([x-i, y+i]);
          } else {
            if (board[y+i][x-i].piece?.color === 'black') {
              validMoves.push([x-i, y+i]);
            }
            break;
          }
        }
        break;
        
      case 'rook':
        // Rook moves horizontally and vertically
        // Up
        for (let i = y - 1; i >= 0; i--) {
          if (!board[i][x].piece) {
            validMoves.push([x, i]);
          } else {
            if (board[i][x].piece?.color === 'black') {
              validMoves.push([x, i]);
            }
            break;
          }
        }
        
        // Right
        for (let i = x + 1; i < 8; i++) {
          if (!board[y][i].piece) {
            validMoves.push([i, y]);
          } else {
            if (board[y][i].piece?.color === 'black') {
              validMoves.push([i, y]);
            }
            break;
          }
        }
        
        // Down
        for (let i = y + 1; i < 8; i++) {
          if (!board[i][x].piece) {
            validMoves.push([x, i]);
          } else {
            if (board[i][x].piece?.color === 'black') {
              validMoves.push([x, i]);
            }
            break;
          }
        }
        
        // Left
        for (let i = x - 1; i >= 0; i--) {
          if (!board[y][i].piece) {
            validMoves.push([i, y]);
          } else {
            if (board[y][i].piece?.color === 'black') {
              validMoves.push([i, y]);
            }
            break;
          }
        }
        break;
        
      case 'queen':
        // Queen combines bishop and rook moves
        // Bishop moves (diagonals)
        // Up-right
        for (let i = 1; x + i < 8 && y - i >= 0; i++) {
          if (!board[y-i][x+i].piece) {
            validMoves.push([x+i, y-i]);
          } else {
            if (board[y-i][x+i].piece?.color === 'black') {
              validMoves.push([x+i, y-i]);
            }
            break;
          }
        }
        
        // Up-left
        for (let i = 1; x - i >= 0 && y - i >= 0; i++) {
          if (!board[y-i][x-i].piece) {
            validMoves.push([x-i, y-i]);
          } else {
            if (board[y-i][x-i].piece?.color === 'black') {
              validMoves.push([x-i, y-i]);
            }
            break;
          }
        }
        
        // Down-right
        for (let i = 1; x + i < 8 && y + i < 8; i++) {
          if (!board[y+i][x+i].piece) {
            validMoves.push([x+i, y+i]);
          } else {
            if (board[y+i][x+i].piece?.color === 'black') {
              validMoves.push([x+i, y+i]);
            }
            break;
          }
        }
        
        // Down-left
        for (let i = 1; x - i >= 0 && y + i < 8; i++) {
          if (!board[y+i][x-i].piece) {
            validMoves.push([x-i, y+i]);
          } else {
            if (board[y+i][x-i].piece?.color === 'black') {
              validMoves.push([x-i, y+i]);
            }
            break;
          }
        }
        
        // Rook moves (straight lines)
        // Up
        for (let i = y - 1; i >= 0; i--) {
          if (!board[i][x].piece) {
            validMoves.push([x, i]);
          } else {
            if (board[i][x].piece?.color === 'black') {
              validMoves.push([x, i]);
            }
            break;
          }
        }
        
        // Right
        for (let i = x + 1; i < 8; i++) {
          if (!board[y][i].piece) {
            validMoves.push([i, y]);
          } else {
            if (board[y][i].piece?.color === 'black') {
              validMoves.push([i, y]);
            }
            break;
          }
        }
        
        // Down
        for (let i = y + 1; i < 8; i++) {
          if (!board[i][x].piece) {
            validMoves.push([x, i]);
          } else {
            if (board[i][x].piece?.color === 'black') {
              validMoves.push([x, i]);
            }
            break;
          }
        }
        
        // Left
        for (let i = x - 1; i >= 0; i--) {
          if (!board[y][i].piece) {
            validMoves.push([i, y]);
          } else {
            if (board[y][i].piece?.color === 'black') {
              validMoves.push([i, y]);
            }
            break;
          }
        }
        break;
        
      case 'king':
        // King moves one square in any direction
        const kingMoves = [
          [x, y-1], [x+1, y-1], [x+1, y], [x+1, y+1],
          [x, y+1], [x-1, y+1], [x-1, y], [x-1, y-1]
        ];
        
        for (const [moveX, moveY] of kingMoves) {
          if (moveX >= 0 && moveX < 8 && moveY >= 0 && moveY < 8) {
            if (!board[moveY][moveX].piece || board[moveY][moveX].piece.color === 'black') {
              validMoves.push([moveX, moveY]);
            }
          }
        }
        break;
    }
    
    return validMoves;
  };
  
  // Check if move matches solution
  const checkMove = (move: { from: [number, number], to: [number, number] }) => {
    const solution = PUZZLES[puzzleIndex].moves;
    
    // Check if move matches any solution move
    const isCorrect = solution.some(solutionMove => 
      solutionMove.from[0] === move.from[0] &&
      solutionMove.from[1] === move.from[1] &&
      solutionMove.to[0] === move.to[0] &&
      solutionMove.to[1] === move.to[1]
    );
    
    if (isCorrect) {
      // Correct move
      const timeBonus = timeLeft * 2;
      const difficultyBonus = 
        PUZZLES[puzzleIndex].difficulty === 'Easy' ? 50 :
        PUZZLES[puzzleIndex].difficulty === 'Medium' ? 100 : 150;
      
      const moveScore = 100 + timeBonus + difficultyBonus - (helpUsed ? 50 : 0);
      setScore(score + moveScore);
      
      toast.success(`Correct! +${moveScore} points`);
      setPuzzleComplete(true);
      
      // Move to next puzzle after delay
      setTimeout(() => {
        const nextPuzzle = puzzleIndex + 1;
        
        if (nextPuzzle < PUZZLES.length) {
          setPuzzleIndex(nextPuzzle);
          loadPuzzle(nextPuzzle);
          toast.success(`Puzzle ${nextPuzzle + 1}: ${PUZZLES[nextPuzzle].title}`);
        } else {
          // All puzzles completed
          endGame(true);
        }
      }, 2000);
    } else {
      // Incorrect move
      toast.error("Incorrect move. Try again!");
      
      // Allow player to continue trying
      setTimeout(() => {
        // Reset the board to original state
        loadPuzzle(puzzleIndex);
      }, 1000);
    }
  };
  
  // Show hint
  const showHint = () => {
    if (puzzleComplete) return;
    
    setHelpUsed(true);
    toast.info("Hint activated! The correct piece is now highlighted.");
    
    const solution = PUZZLES[puzzleIndex].moves[0];
    const [fromX, fromY] = solution.from;
    
    // Highlight the piece that needs to be moved
    const newBoard = [...board];
    newBoard[fromY][fromX].highlight = true;
    setBoard(newBoard);
  };
  
  // End game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameOver(true);
    saveScore("chess-puzzle", score);
    
    if (completed) {
      toast.success(`All puzzles completed! Final score: ${score}`);
    } else {
      toast.info(`Time's up! Your score: ${score}`);
    }
  };
  
  // Game timer
  useEffect(() => {
    if (!gameActive || gameOver || puzzleComplete) return;
    
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
  }, [gameActive, gameOver, puzzleComplete]);
  
  // Get cell style
  const getCellClass = (x: number, y: number) => {
    const isBlackSquare = (x + y) % 2 === 1;
    let baseClass = isBlackSquare ? 'bg-neutral-600' : 'bg-amber-100';
    
    if (board[y][x].selected) {
      baseClass = isBlackSquare ? 'bg-blue-700' : 'bg-blue-300';
    } else if (board[y][x].highlight) {
      baseClass = isBlackSquare ? 'bg-yellow-700' : 'bg-yellow-300';
    } else if (board[y][x].validMove) {
      baseClass = board[y][x].piece 
        ? (isBlackSquare ? 'bg-red-700' : 'bg-red-300') // Can capture
        : (isBlackSquare ? 'bg-green-700' : 'bg-green-300'); // Can move to
    }
    
    return baseClass;
  };
  
  // Get notation for chess cell
  const getCellNotation = (x: number, y: number) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[x] + ranks[y];
  };

  return (
    <div className="game-container p-4 bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="text-center mb-6">
        <motion.h1 
          className="text-4xl font-bold mb-2 text-amber-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Chess Puzzle Challenge
        </motion.h1>
        {gameActive && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <motion.div 
              className="text-xl font-bold px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              Score: {score}
            </motion.div>
            <motion.div 
              className="text-xl font-bold px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Time: {timeLeft}s
            </motion.div>
            <motion.div 
              className="text-xl font-bold px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              Puzzle: {puzzleIndex + 1}/{PUZZLES.length}
            </motion.div>
          </div>
        )}
      </div>

      {!gameActive && !gameOver ? (
        <div className="text-center max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <p className="mb-6 text-lg text-gray-700">
            Test your chess skills by solving tactical puzzles. Play as white and find the best move in each position!
          </p>
          <div className="mb-6 space-y-4">
            <div className="font-medium text-amber-800">Puzzle Difficulty Levels:</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-green-100 border border-green-200 p-2 rounded-lg">Easy</div>
              <div className="bg-yellow-100 border border-yellow-200 p-2 rounded-lg">Medium</div>
              <div className="bg-red-100 border border-red-200 p-2 rounded-lg">Hard</div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md"
            >
              Start Challenge
            </Button>
          </motion.div>
        </div>
      ) : gameOver ? (
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-amber-700">Challenge Complete!</h2>
          <div className="text-7xl mb-6">♔</div>
          <p className="text-2xl mb-6">Your final score: <span className="font-bold text-amber-600">{score}</span></p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md"
            >
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
          {/* Chess board */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square max-w-md mx-auto border-4 border-amber-900 rounded-md shadow-xl overflow-hidden">
              {board.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`${getCellClass(x, y)} w-1/8 h-0 pb-[12.5%] relative cursor-pointer transition-colors duration-200`}
                      onClick={() => handleCellClick(x, y)}
                    >
                      {/* Cell notation */}
                      {((y === 7 && x === 0) || (y === 7) || (x === 0)) && (
                        <div className="absolute text-[8px] sm:text-xs opacity-60 pointer-events-none p-0.5">
                          {y === 7 && x === 0 && getCellNotation(x, y)}
                          {y === 7 && x !== 0 && getCellNotation(x, y)[0]}
                          {x === 0 && y !== 7 && getCellNotation(x, y)[1]}
                        </div>
                      )}
                      
                      {/* Chess piece */}
                      {cell.piece && (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl">
                          {CHESS_PIECES[cell.piece.color][cell.piece.type]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Puzzle info */}
          <motion.div 
            className="w-full md:w-72 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-xl mb-1 text-amber-800">{PUZZLES[puzzleIndex].title}</h3>
            <div className="text-xs mb-2 inline-block bg-amber-100 px-2 py-1 rounded">
              {PUZZLES[puzzleIndex].difficulty}
            </div>
            <p className="text-sm mb-4 text-gray-700">{PUZZLES[puzzleIndex].description}</p>
            
            <div className="mb-4 bg-amber-50 p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-1 text-amber-700">Objective:</h4>
              <p className="text-xs">Find the best move playing as White.</p>
            </div>
            
            {!puzzleComplete && (
              <Button 
                onClick={showHint}
                disabled={helpUsed}
                className={`w-full ${helpUsed 
                  ? 'bg-gray-300 text-gray-600' 
                  : 'bg-amber-400 hover:bg-amber-500 text-black'} mb-4 transition-colors`}
              >
                {helpUsed ? "Hint Used" : "Get Hint (-50 pts)"}
              </Button>
            )}
            
            {puzzleComplete && (
              <div className="bg-green-100 p-3 rounded-lg mb-4 border border-green-300">
                <p className="text-sm font-semibold text-green-700">
                  Puzzle Solved! ✓
                </p>
                <p className="text-xs text-green-600">
                  Next puzzle loading...
                </p>
              </div>
            )}
            
            {movesMade.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-amber-700">Moves Made:</h4>
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {movesMade.map((move, index) => (
                    <div key={index} className="bg-amber-50 p-2 rounded flex justify-between items-center">
                      <div>
                        {getCellNotation(move.from[0], move.from[1])} → {getCellNotation(move.to[0], move.to[1])}
                      </div>
                      <div className="text-amber-500">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
