
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

// Import new games
import { ColorMatch } from "../games/puzzle/ColorMatch";
import { MathPuzzle } from "../games/puzzle/MathPuzzle";
import { WordSearch } from "../games/word/WordSearch";
import { Hangman } from "../games/word/Hangman";
import { ConnectFour } from "../games/strategy/ConnectFour";
import { SimonSays } from "../games/strategy/SimonSays";
import { FlappyBird } from "../games/arcade/FlappyBird";
import { SnakeGame } from "../games/arcade/SnakeGame";
import { CookieClicker } from "../games/idle/CookieClicker";
import { TowerOfHanoi } from "../games/puzzle/TowerOfHanoi";

// Map of game IDs to their components
const GAMES = {
  // Arcade games
  "tap-dot": TapDot,
  "reaction-tester": ReactTimeTester,
  "avoid-spikes": AvoidTheSpikes,
  "tap-button": TapTheButton,
  "flappy-bird": FlappyBird,
  "snake-game": SnakeGame,
  
  // Puzzle games
  "2048": Game2048,
  "memory-flip": MemoryFlip,
  "sliding-puzzle": SlidingPuzzle,
  "color-match": ColorMatch,
  "math-puzzle": MathPuzzle,
  "tower-of-hanoi": TowerOfHanoi,
  
  // Word games
  "word-scramble": WordScramble,
  "word-search": WordSearch,
  "hangman": Hangman,
  
  // Strategy games
  "tic-tac-toe": TicTacToe,
  "rock-paper-scissors": RockPaperScissors,
  "connect-four": ConnectFour,
  "simon-says": SimonSays,
  
  // Idle games
  "idle-clicker": IdleClicker,
  "cookie-clicker": CookieClicker,
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
