
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

type Game = {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  lastPlayed: string;
};

// Simulated recent games data
const initialRecentGames: Game[] = [
  {
    id: "2048",
    title: "2048",
    category: "puzzle",
    icon: "◼",
    color: "bg-game-puzzle",
    lastPlayed: "Just now",
  },
  {
    id: "tap-dot",
    title: "Tap the Dot",
    category: "arcade",
    icon: "●",
    color: "bg-game-arcade",
    lastPlayed: "5m ago",
  },
];

export function RecentGames() {
  const [recentGames, setRecentGames] = useState<Game[]>(initialRecentGames);

  // In a real app, this would load from localStorage or a database
  useEffect(() => {
    const storedGames = localStorage.getItem("recentGames");
    if (storedGames) {
      setRecentGames(JSON.parse(storedGames));
    }
  }, []);

  if (recentGames.length === 0) {
    return null;
  }

  return (
    <section className="my-6">
      <h2 className="text-xl font-bold mb-4">Recently Played</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {recentGames.map((game) => (
          <Link
            key={game.id}
            to={`/game/${game.id}`}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
          >
            <div className={`${game.color} h-10 w-10 flex items-center justify-center rounded-md text-lg font-bold`}>
              {game.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{game.title}</span>
              <span className="text-xs text-muted-foreground">{game.lastPlayed}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
