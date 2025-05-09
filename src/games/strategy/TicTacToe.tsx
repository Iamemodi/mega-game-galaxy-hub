
import { useState, useEffect } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

type Player = "X" | "O";
type BoardState = (Player | null)[][];
type GameStatus = "playing" | "won" | "draw" | "idle";

export function TicTacToe() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [winner, setWinner] = useState<Player | null>(null);
  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [draws, setDraws] = useState(0);

  // Create an empty 3x3 board
  function createEmptyBoard(): BoardState {
    return Array(3).fill(null).map(() => Array(3).fill(null));
  }

  // Start a new game
  const startGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer("X"); // Player always starts as X
    setGameStatus("playing");
    setWinner(null);
  };

  // Handle a cell click
  const handleCellClick = (row: number, col: number) => {
    // Ignore clicks if game is not in playing status or cell is already occupied
    if (gameStatus !== "playing" || board[row][col] !== null) {
      return;
    }

    // Player move
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for win or draw after player move
    const { winner: playerWinner, isDraw: playerDraw } = checkGameStatus(newBoard);
    
    if (playerWinner) {
      handleWin(playerWinner);
      return;
    }
    
    if (playerDraw) {
      handleDraw();
      return;
    }

    // Toggle player
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    
    // Computer move (after a short delay)
    setTimeout(() => {
      if (currentPlayer === "X") {
        makeComputerMove(newBoard);
      }
    }, 500);
  };

  // Make a computer move
  const makeComputerMove = (currentBoard: BoardState) => {
    // Find all empty cells
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (currentBoard[i][j] === null) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    // Return if no empty cells (should not happen, but just in case)
    if (emptyCells.length === 0) return;
    
    // Pick a random empty cell for the computer move
    const [computerRow, computerCol] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Make the computer move
    const newBoard = [...currentBoard.map(row => [...row])];
    newBoard[computerRow][computerCol] = "O";
    setBoard(newBoard);
    
    // Check for win or draw after computer move
    const { winner: computerWinner, isDraw: computerDraw } = checkGameStatus(newBoard);
    
    if (computerWinner) {
      handleWin(computerWinner);
      return;
    }
    
    if (computerDraw) {
      handleDraw();
      return;
    }
    
    // Switch back to player
    setCurrentPlayer("X");
  };

  // Check if any player has won or if it's a draw
  const checkGameStatus = (board: BoardState) => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return { winner: board[i][0], isDraw: false };
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        return { winner: board[0][j], isDraw: false };
      }
    }
    
    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return { winner: board[0][0], isDraw: false };
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return { winner: board[0][2], isDraw: false };
    }
    
    // Check for draw (all cells filled)
    let isBoardFull = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          isBoardFull = false;
          break;
        }
      }
      if (!isBoardFull) break;
    }
    
    return { winner: null, isDraw: isBoardFull };
  };

  // Handle a win
  const handleWin = (player: Player) => {
    setGameStatus("won");
    setWinner(player);
    
    if (player === "X") {
      setPlayerWins(prev => prev + 1);
      saveScore("tic-tac-toe", 1); // Player win
    } else {
      setComputerWins(prev => prev + 1);
      saveScore("tic-tac-toe", 0); // Computer win
    }
  };

  // Handle a draw
  const handleDraw = () => {
    setGameStatus("draw");
    setDraws(prev => prev + 1);
    saveScore("tic-tac-toe", 0.5); // Draw
  };

  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Tic Tac Toe</h1>
        <div className="flex justify-between px-6 mb-2">
          <div className="text-lg font-semibold">Player (X): {playerWins}</div>
          <div className="text-lg font-semibold">Draws: {draws}</div>
          <div className="text-lg font-semibold">Computer (O): {computerWins}</div>
        </div>
      </div>

      {gameStatus === "idle" ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Classic game of Tic Tac Toe. Get three of your symbols in a row, column, or diagonal to win!
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            {gameStatus === "won" && (
              <div className="text-xl font-bold mb-2">
                {winner === "X" ? "You Won!" : "Computer Won!"}
              </div>
            )}
            {gameStatus === "draw" && (
              <div className="text-xl font-bold mb-2">Draw!</div>
            )}
            {gameStatus === "playing" && (
              <div className="text-xl font-bold mb-2">
                {currentPlayer === "X" ? "Your Turn" : "Computer's Turn..."}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-lg">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-20 h-20 border-2 border-gray-300 flex items-center justify-center
                      text-3xl font-bold cursor-pointer hover:bg-gray-100 transition-colors
                      ${cell === "X" ? "text-blue-600" : "text-red-600"}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {(gameStatus === "won" || gameStatus === "draw") && (
            <button
              onClick={startGame}
              className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors mt-6"
            >
              Play Again
            </button>
          )}
        </div>
      )}

      <GameControls onRestart={startGame} />
    </div>
  );
}
