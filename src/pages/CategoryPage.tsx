
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
    // Add more arcade games here
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
    // Add more puzzle games here
  ],
  idle: [],
  word: [],
  strategy: [],
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
