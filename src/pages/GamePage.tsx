
import { useParams, Navigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { TapDot } from "../games/arcade/TapDot";
import { Game2048 } from "../games/puzzle/Game2048";
import { MemoryFlip } from "../games/puzzle/MemoryFlip";
import { ReactTimeTester } from "../games/arcade/ReactionTimeTester";
import { TicTacToe } from "../games/strategy/TicTacToe";
import { AvoidTheSpikes } from "../games/arcade/AvoidTheSpikes";
import { TapTheButton } from "../games/arcade/TapTheButton";
import { SlidingPuzzle } from "../games/puzzle/SlidingPuzzle";
import { WordScramble } from "../games/word/WordScramble";
import { RockPaperScissors } from "../games/strategy/RockPaperScissors";
import { IdleClicker } from "../games/idle/IdleClicker";

// Map of game IDs to their components
const GAMES = {
  // Arcade games
  "tap-dot": TapDot,
  "reaction-tester": ReactTimeTester,
  "avoid-spikes": AvoidTheSpikes,
  "tap-button": TapTheButton,
  
  // Puzzle games
  "2048": Game2048,
  "memory-flip": MemoryFlip,
  "sliding-puzzle": SlidingPuzzle,
  
  // Word games
  "word-scramble": WordScramble,
  
  // Strategy games
  "tic-tac-toe": TicTacToe,
  "rock-paper-scissors": RockPaperScissors,
  
  // Idle games
  "idle-clicker": IdleClicker,
};

const GamePage = () => {
  const { gameId } = useParams();

  // Render the appropriate game based on gameId
  const renderGame = () => {
    if (!gameId || !(gameId in GAMES)) {
      return <Navigate to="/" replace />;
    }
    
    const GameComponent = GAMES[gameId as keyof typeof GAMES];
    return <GameComponent />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="container px-4 py-2">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>
      </div>
      <main className="flex-1">
        {renderGame()}
      </main>
    </div>
  );
};

export default GamePage;
