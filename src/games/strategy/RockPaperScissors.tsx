
import { useState, useEffect } from "react";
import { GameControls } from "../../components/GameControls";
import { saveScore } from "../../utils/gameUtils";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw" | null;

export function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const choices: Choice[] = ["rock", "paper", "scissors"];
  
  // Start game
  const startGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore({ player: 0, computer: 0 });
    setRoundsPlayed(0);
    setShowResult(false);
    setGameStarted(true);
  };
  
  // Handle player choice
  const makeChoice = (choice: Choice) => {
    if (showResult) return;
    
    setPlayerChoice(choice);
    
    // Generate computer choice
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    setComputerChoice(randomChoice);
    
    // Determine result after a short delay
    setTimeout(() => {
      const gameResult = determineResult(choice, randomChoice);
      setResult(gameResult);
      setShowResult(true);
      
      // Update score
      if (gameResult === "win") {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else if (gameResult === "lose") {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      }
      
      setRoundsPlayed(prev => prev + 1);
      
      // Check if game should end (best of 5)
      if (roundsPlayed + 1 >= 5) {
        const finalScore = gameResult === "win" 
          ? score.player + 1 
          : gameResult === "lose" 
            ? score.player 
            : score.player;
        
        // Save final score
        saveScore("rock-paper-scissors", finalScore);
      }
    }, 1000);
  };
  
  // Determine game result
  const determineResult = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "draw";
    
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win";
    }
    
    return "lose";
  };
  
  // Play next round
  const nextRound = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setShowResult(false);
  };
  
  // Get emoji for choice
  const getChoiceEmoji = (choice: Choice | null) => {
    if (!choice) return "❓";
    
    switch (choice) {
      case "rock": return "✊";
      case "paper": return "✋";
      case "scissors": return "✌️";
    }
  };
  
  // Get result message
  const getResultMessage = () => {
    if (!result) return "";
    
    switch (result) {
      case "win": return "You win!";
      case "lose": return "You lose!";
      case "draw": return "It's a draw!";
    }
  };
  
  return (
    <div className="game-container">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Rock Paper Scissors</h1>
        
        {gameStarted && (
          <div className="flex justify-between px-6 mb-2">
            <div className="text-xl font-bold">Rounds: {roundsPlayed}/5</div>
            <div className="text-xl font-bold">Score: {score.player} - {score.computer}</div>
          </div>
        )}
      </div>
      
      {!gameStarted ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <p className="mb-6">
            Classic game of Rock, Paper, Scissors!
            Play 5 rounds against the computer and see who wins.
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : roundsPlayed >= 5 ? (
        <div className="text-center p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Final Score: {score.player} - {score.computer}</p>
          <p className="text-xl mb-6 font-bold">
            {score.player > score.computer 
              ? "You win!" 
              : score.player < score.computer 
                ? "Computer wins!" 
                : "It's a tie!"}
          </p>
          <button
            onClick={startGame}
            className="bg-game-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-game-secondary transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-around text-7xl mb-8">
            <div className="flex flex-col items-center">
              <div>{getChoiceEmoji(playerChoice)}</div>
              <div className="text-sm mt-2">You</div>
            </div>
            <div className="text-xl font-bold">VS</div>
            <div className="flex flex-col items-center">
              <div>{getChoiceEmoji(computerChoice)}</div>
              <div className="text-sm mt-2">Computer</div>
            </div>
          </div>
          
          {showResult ? (
            <div className="text-center mb-8">
              <div className="text-2xl font-bold mb-4">{getResultMessage()}</div>
              <button
                onClick={nextRound}
                className="bg-game-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-game-secondary transition-colors"
              >
                Next Round
              </button>
            </div>
          ) : (
            <div className="flex justify-around">
              {choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => makeChoice(choice)}
                  className="w-20 h-20 bg-game-strategy rounded-full flex items-center justify-center text-3xl hover:bg-game-strategy/80 transition-colors"
                >
                  {getChoiceEmoji(choice)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <GameControls onRestart={startGame} />
    </div>
  );
}
