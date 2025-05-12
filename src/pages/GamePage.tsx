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

// Import previously added games
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

// Import new games
import { SpotTheDifference } from "../games/puzzle/SpotTheDifference";
import { WordAssociation } from "../games/word/WordAssociation";
import { ColorSwitch } from "../games/arcade/ColorSwitch";
import { RhythmTap } from "../games/arcade/RhythmTap";
import { TreasureHunt } from "../games/strategy/TreasureHunt";
import { FarmSimulator } from "../games/idle/FarmSimulator";
import { QuotePuzzle } from "../games/word/QuotePuzzle";
import { MemoryMatch } from "../games/puzzle/MemoryMatch";
import { PathFinder } from "../games/strategy/PathFinder";
import { ChessPuzzle } from "../games/strategy/ChessPuzzle";
import { MiningMagnate } from "../games/idle/MiningMagnate";

// New batch of 30 games
import { TypeRacer } from "../games/word/TypeRacer";
import { CodeBreaker } from "../games/puzzle/CodeBreaker";
import { BubbleShooter } from "../games/arcade/BubbleShooter";
import { Sudoku } from "../games/puzzle/Sudoku";
import { MineHunter } from "../games/puzzle/MineHunter";
import { DotConnect } from "../games/strategy/DotConnect";
import { PixelArtMaker } from "../games/puzzle/PixelArtMaker";
import { MathChallenge } from "../games/puzzle/MathChallenge";
import { WordFinder } from "../games/word/WordFinder";
import { MazeRunner } from "../games/arcade/MazeRunner";
import { Blackjack } from "../games/strategy/Blackjack";
import { PokerGame } from "../games/strategy/PokerGame";
import { SpaceShooter } from "../games/arcade/SpaceShooter";
import { FactoryTycoon } from "../games/idle/FactoryTycoon";
import { CityBuilder } from "../games/idle/CityBuilder";
import { AnagramGame } from "../games/word/AnagramGame";
import { NumberPuzzle } from "../games/puzzle/NumberPuzzle";
import { PlatformerGame } from "../games/arcade/PlatformerGame";
import { WordChain } from "../games/word/WordChain";
import { JumpingNinja } from "../games/arcade/JumpingNinja";
import { Checkers } from "../games/strategy/Checkers";
import { SpaceColony } from "../games/idle/SpaceColony";
import { LogicGates } from "../games/puzzle/LogicGates";
import { CrosswordPuzzle } from "../games/word/CrosswordPuzzle";
import { CarRacer } from "../games/arcade/CarRacer";
import { RestaurantTycoon } from "../games/idle/RestaurantTycoon";
import { TowerDefense } from "../games/strategy/TowerDefense";
import { PicrossGame } from "../games/puzzle/PicrossGame";
import { WordRush } from "../games/word/WordRush";
import { PinballGame } from "../games/arcade/PinballGame";

// Map of game IDs to their components
const GAMES = {
  // Arcade games
  "tap-dot": TapDot,
  "reaction-tester": ReactTimeTester,
  "avoid-spikes": AvoidTheSpikes,
  "tap-button": TapTheButton,
  "flappy-bird": FlappyBird,
  "snake-game": SnakeGame,
  "color-switch": ColorSwitch,
  "rhythm-tap": RhythmTap,
  "bubble-shooter": BubbleShooter,
  "maze-runner": MazeRunner,
  "space-shooter": SpaceShooter,
  "platformer-game": PlatformerGame,
  "jumping-ninja": JumpingNinja,
  "car-racer": CarRacer,
  "pinball-game": PinballGame,
  
  // Puzzle games
  "2048": Game2048,
  "memory-flip": MemoryFlip,
  "sliding-puzzle": SlidingPuzzle,
  "color-match": ColorMatch,
  "math-puzzle": MathPuzzle,
  "tower-of-hanoi": TowerOfHanoi,
  "spot-difference": SpotTheDifference,
  "memory-match": MemoryMatch,
  "code-breaker": CodeBreaker,
  "sudoku": Sudoku,
  "mine-hunter": MineHunter,
  "pixel-art-maker": PixelArtMaker,
  "math-challenge": MathChallenge,
  "number-puzzle": NumberPuzzle,
  "logic-gates": LogicGates,
  "picross-game": PicrossGame,
  
  // Word games
  "word-scramble": WordScramble,
  "word-search": WordSearch,
  "hangman": Hangman,
  "word-association": WordAssociation,
  "quote-puzzle": QuotePuzzle,
  "type-racer": TypeRacer,
  "word-finder": WordFinder,
  "anagram-game": AnagramGame,
  "word-chain": WordChain,
  "crossword-puzzle": CrosswordPuzzle,
  "word-rush": WordRush,
  
  // Strategy games
  "tic-tac-toe": TicTacToe,
  "rock-paper-scissors": RockPaperScissors,
  "connect-four": ConnectFour,
  "simon-says": SimonSays,
  "treasure-hunt": TreasureHunt,
  "path-finder": PathFinder,
  "chess-puzzle": ChessPuzzle,
  "dot-connect": DotConnect,
  "blackjack": Blackjack,
  "poker-game": PokerGame,
  "checkers": Checkers,
  "tower-defense": TowerDefense,
  
  // Idle games
  "idle-clicker": IdleClicker,
  "cookie-clicker": CookieClicker,
  "farm-simulator": FarmSimulator,
  "mining-magnate": MiningMagnate,
  "factory-tycoon": FactoryTycoon,
  "city-builder": CityBuilder,
  "space-colony": SpaceColony,
  "restaurant-tycoon": RestaurantTycoon,
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
