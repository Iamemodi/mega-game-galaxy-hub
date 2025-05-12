
import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "../components/Header";
import { GameCard } from "../components/GameCard";

type GameItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isNew?: boolean;
};

// Game data by category
const gamesByCategory: Record<string, GameItem[]> = {
  arcade: [
    {
      id: "tap-dot",
      title: "Tap the Dot",
      description: "Test your reflexes",
      icon: "●",
      difficulty: 'easy',
    },
    {
      id: "reaction-tester",
      title: "Reaction Time Tester",
      description: "How fast can you react?",
      icon: "⚡",
      difficulty: 'easy',
    },
    {
      id: "avoid-spikes",
      title: "Avoid the Spikes",
      description: "Dodge the obstacles",
      icon: "▲",
      difficulty: 'medium',
    },
    {
      id: "tap-button",
      title: "Tap The Button",
      description: "Tap as fast as you can",
      icon: "○",
      difficulty: 'easy',
    },
    {
      id: "flappy-bird",
      title: "Flappy Bird",
      description: "Fly through pipes",
      icon: "🐦",
      difficulty: 'medium',
    },
    {
      id: "snake-game",
      title: "Snake",
      description: "Eat and grow longer",
      icon: "🐍",
      difficulty: 'medium',
    },
    {
      id: "color-switch",
      title: "Color Switch",
      description: "Match colors to advance",
      icon: "🎨",
      difficulty: 'medium',
    },
    {
      id: "rhythm-tap",
      title: "Rhythm Tap",
      description: "Tap to the beat",
      icon: "🎵",
      difficulty: 'medium',
    },
    {
      id: "bubble-shooter",
      title: "Bubble Shooter",
      description: "Pop matching bubbles",
      icon: "🫧",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "maze-runner",
      title: "Maze Runner",
      description: "Navigate through the maze",
      icon: "🧭",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "space-shooter",
      title: "Space Shooter",
      description: "Defend against alien invasion",
      icon: "🚀",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "platformer-game",
      title: "Platformer",
      description: "Jump and collect coins",
      icon: "👾",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "jumping-ninja",
      title: "Jumping Ninja",
      description: "Jump between platforms",
      icon: "🥷",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "car-racer",
      title: "Car Racer",
      description: "Race against the clock",
      icon: "🏎️",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "pinball-game",
      title: "Pinball",
      description: "Classic arcade pinball",
      icon: "🔴",
      difficulty: 'medium',
      isNew: true,
    },
  ],
  puzzle: [
    {
      id: "2048",
      title: "2048",
      description: "Merge the numbers",
      icon: "◼",
      difficulty: 'medium',
    },
    {
      id: "memory-flip",
      title: "Memory Flip",
      description: "Train your memory",
      icon: "☰",
      difficulty: 'easy',
    },
    {
      id: "sliding-puzzle",
      title: "Sliding Puzzle",
      description: "Arrange the tiles",
      icon: "◫",
      difficulty: 'medium',
    },
    {
      id: "color-match",
      title: "Color Match",
      description: "Match the right color",
      icon: "🎨",
      difficulty: 'easy',
    },
    {
      id: "math-puzzle",
      title: "Math Puzzle",
      description: "Solve math problems",
      icon: "➗",
      difficulty: 'medium',
    },
    {
      id: "tower-of-hanoi",
      title: "Tower of Hanoi",
      description: "Move the stack of disks",
      icon: "🏔️",
      difficulty: 'hard',
    },
    {
      id: "spot-difference",
      title: "Spot the Difference",
      description: "Find differences between images",
      icon: "👁️",
      difficulty: 'medium',
    },
    {
      id: "memory-match",
      title: "Memory Match",
      description: "Match pairs of cards",
      icon: "🃏",
      difficulty: 'medium',
    },
    {
      id: "code-breaker",
      title: "Code Breaker",
      description: "Crack the secret code",
      icon: "🔐",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Fill the grid with numbers",
      icon: "🔢",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "mine-hunter",
      title: "Mine Hunter",
      description: "Find mines without detonating",
      icon: "💣",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "pixel-art-maker",
      title: "Pixel Art Maker",
      description: "Create pixel masterpieces",
      icon: "🖌️",
      difficulty: 'easy',
      isNew: true,
    },
    {
      id: "math-challenge",
      title: "Math Challenge",
      description: "Advanced math problems",
      icon: "🧮",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "number-puzzle",
      title: "Number Puzzle",
      description: "Arrange numbers correctly",
      icon: "🔢",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "logic-gates",
      title: "Logic Gates",
      description: "Solve logic circuit puzzles",
      icon: "⚙️",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "picross-game",
      title: "Picross",
      description: "Reveal hidden pictures",
      icon: "🖼️",
      difficulty: 'hard',
      isNew: true,
    },
  ],
  word: [
    {
      id: "word-scramble",
      title: "Word Scramble",
      description: "Unscramble the words",
      icon: "Aa",
      difficulty: 'medium',
    },
    {
      id: "word-search",
      title: "Word Search",
      description: "Find hidden words",
      icon: "🔍",
      difficulty: 'medium',
    },
    {
      id: "hangman",
      title: "Hangman",
      description: "Guess the word",
      icon: "✎",
      difficulty: 'medium',
    },
    {
      id: "word-association",
      title: "Word Association",
      description: "Connect related words",
      icon: "🔄",
      difficulty: 'medium',
    },
    {
      id: "quote-puzzle",
      title: "Quote Puzzle",
      description: "Reconstruct famous quotes",
      icon: "💬",
      difficulty: 'medium',
    },
    {
      id: "type-racer",
      title: "Type Racer",
      description: "Test your typing speed",
      icon: "⌨️",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "word-finder",
      title: "Word Finder",
      description: "Find words in letter grid",
      icon: "📝",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "anagram-game",
      title: "Anagram Game",
      description: "Rearrange letters to form words",
      icon: "🔤",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "word-chain",
      title: "Word Chain",
      description: "Connect words by last letter",
      icon: "⛓️",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "crossword-puzzle",
      title: "Crossword Puzzle",
      description: "Fill in crossword grid",
      icon: "📰",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "word-rush",
      title: "Word Rush",
      description: "Form words against time",
      icon: "⏱️",
      difficulty: 'hard',
      isNew: true,
    },
  ],
  strategy: [
    {
      id: "tic-tac-toe",
      title: "Tic Tac Toe",
      description: "Classic 3x3 game",
      icon: "✕",
      difficulty: 'easy',
    },
    {
      id: "rock-paper-scissors",
      title: "Rock Paper Scissors",
      description: "Make your choice",
      icon: "✊",
      difficulty: 'easy',
    },
    {
      id: "connect-four",
      title: "Connect Four",
      description: "Connect 4 in a row",
      icon: "⚫️",
      difficulty: 'medium',
    },
    {
      id: "simon-says",
      title: "Simon Says",
      description: "Remember the pattern",
      icon: "🎵",
      difficulty: 'medium',
    },
    {
      id: "treasure-hunt",
      title: "Treasure Hunt",
      description: "Search for hidden treasure",
      icon: "🗺️",
      difficulty: 'medium',
    },
    {
      id: "path-finder",
      title: "Path Finder",
      description: "Find the optimal path",
      icon: "🧩",
      difficulty: 'hard',
    },
    {
      id: "chess-puzzle",
      title: "Chess Puzzle",
      description: "Solve chess challenges",
      icon: "♟️",
      difficulty: 'hard',
    },
    {
      id: "dot-connect",
      title: "Dot Connect",
      description: "Connect dots to form shapes",
      icon: "📍",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "blackjack",
      title: "Blackjack",
      description: "Get closest to 21",
      icon: "🃏",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "poker-game",
      title: "Poker",
      description: "Classic card game",
      icon: "♠️",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "checkers",
      title: "Checkers",
      description: "Classic board game",
      icon: "⚪️",
      difficulty: 'medium',
      isNew: true,
    },
    {
      id: "tower-defense",
      title: "Tower Defense",
      description: "Protect your base",
      icon: "🏰",
      difficulty: 'hard',
      isNew: true,
    },
  ],
  idle: [
    {
      id: "idle-clicker",
      title: "Idle Clicker",
      description: "Click and earn coins",
      icon: "💰",
      difficulty: 'easy',
    },
    {
      id: "cookie-clicker",
      title: "Cookie Clicker",
      description: "Bake virtual cookies",
      icon: "🍪",
      difficulty: 'easy',
    },
    {
      id: "farm-simulator",
      title: "Farm Simulator",
      description: "Manage your own farm",
      icon: "🚜",
      difficulty: 'medium',
    },
    {
      id: "mining-magnate",
      title: "Mining Magnate",
      description: "Build a mining empire",
      icon: "⛏️",
      difficulty: 'medium',
    },
    {
      id: "factory-tycoon",
      title: "Factory Tycoon",
      description: "Build and automate factories",
      icon: "🏭",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "city-builder",
      title: "City Builder",
      description: "Create your own metropolis",
      icon: "🏙️",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "space-colony",
      title: "Space Colony",
      description: "Colonize distant planets",
      icon: "🪐",
      difficulty: 'hard',
      isNew: true,
    },
    {
      id: "restaurant-tycoon",
      title: "Restaurant Tycoon",
      description: "Manage a food empire",
      icon: "🍽️",
      difficulty: 'medium',
      isNew: true,
    },
  ],
};

// Category display names and colors
const categoryInfo: Record<string, { name: string; color: string }> = {
  arcade: { name: "Arcade Games", color: "bg-game-arcade" },
  puzzle: { name: "Puzzle Games", color: "bg-game-puzzle" },
  idle: { name: "Idle Games", color: "bg-game-idle" },
  word: { name: "Word Games", color: "bg-game-word" },
  strategy: { name: "Strategy Games", color: "bg-game-strategy" },
};

const CategoryPage = () => {
  const { categoryId } = useParams();

  if (!categoryId || !gamesByCategory[categoryId]) {
    return <Navigate to="/" replace />;
  }

  const games = gamesByCategory[categoryId];
  const { name, color } = categoryInfo[categoryId];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-muted-foreground">
            {games.length} games available in this category
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              gameId={game.id}
              category={categoryId}
              bgColor={color}
              icon={game.icon}
              description={game.description}
              isNew={game.isNew}
              difficulty={game.difficulty}
            />
          ))}
          
          {games.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-muted-foreground">
                More games coming soon to this category!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
