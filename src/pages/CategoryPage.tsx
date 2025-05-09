
import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "../components/Header";

type GameItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// Game data by category
const gamesByCategory: Record<string, GameItem[]> = {
  arcade: [
    {
      id: "tap-dot",
      title: "Tap the Dot",
      description: "Test your reflexes",
      icon: "●",
    },
    {
      id: "reaction-tester",
      title: "Reaction Time Tester",
      description: "How fast can you react?",
      icon: "⚡",
    },
    {
      id: "avoid-spikes",
      title: "Avoid the Spikes",
      description: "Dodge the obstacles",
      icon: "▲",
    },
    {
      id: "tap-button",
      title: "Tap The Button",
      description: "Tap as fast as you can",
      icon: "○",
    },
    {
      id: "flappy-bird",
      title: "Flappy Bird",
      description: "Fly through pipes",
      icon: "🐦",
    },
    {
      id: "snake-game",
      title: "Snake",
      description: "Eat and grow longer",
      icon: "🐍",
    },
  ],
  puzzle: [
    {
      id: "2048",
      title: "2048",
      description: "Merge the numbers",
      icon: "◼",
    },
    {
      id: "memory-flip",
      title: "Memory Flip",
      description: "Train your memory",
      icon: "☰",
    },
    {
      id: "sliding-puzzle",
      title: "Sliding Puzzle",
      description: "Arrange the tiles",
      icon: "◫",
    },
    {
      id: "color-match",
      title: "Color Match",
      description: "Match the right color",
      icon: "🎨",
    },
    {
      id: "math-puzzle",
      title: "Math Puzzle",
      description: "Solve math problems",
      icon: "➗",
    },
    {
      id: "tower-of-hanoi",
      title: "Tower of Hanoi",
      description: "Move the stack of disks",
      icon: "🏔️",
    },
  ],
  idle: [
    {
      id: "idle-clicker",
      title: "Idle Clicker",
      description: "Click and earn coins",
      icon: "💰",
    },
    {
      id: "cookie-clicker",
      title: "Cookie Clicker",
      description: "Bake virtual cookies",
      icon: "🍪",
    },
  ],
  word: [
    {
      id: "word-scramble",
      title: "Word Scramble",
      description: "Unscramble the words",
      icon: "Aa",
    },
    {
      id: "word-search",
      title: "Word Search",
      description: "Find hidden words",
      icon: "🔍",
    },
    {
      id: "hangman",
      title: "Hangman",
      description: "Guess the word",
      icon: "✎",
    },
  ],
  strategy: [
    {
      id: "tic-tac-toe",
      title: "Tic Tac Toe",
      description: "Classic 3x3 game",
      icon: "✕",
    },
    {
      id: "rock-paper-scissors",
      title: "Rock Paper Scissors",
      description: "Make your choice",
      icon: "✊",
    },
    {
      id: "connect-four",
      title: "Connect Four",
      description: "Connect 4 in a row",
      icon: "⚫️",
    },
    {
      id: "simon-says",
      title: "Simon Says",
      description: "Remember the pattern",
      icon: "🎵",
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
        
        <div className="game-grid">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="game-card"
            >
              <div className={`${color} h-40 p-4 rounded-xl flex flex-col justify-between`}>
                <div className="text-4xl font-bold mb-2">{game.icon}</div>
                <div>
                  <h3 className="text-lg font-bold">{game.title}</h3>
                  <p className="text-sm opacity-90">{game.description}</p>
                </div>
              </div>
            </Link>
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
