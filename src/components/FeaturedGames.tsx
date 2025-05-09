
import { Link } from "react-router-dom";

type FeaturedGame = {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: string;
};

const featuredGames: FeaturedGame[] = [
  {
    id: "tap-dot",
    title: "Tap the Dot",
    description: "Test your reflexes",
    category: "arcade",
    color: "from-game-arcade to-game-arcade/70",
    icon: "●",
  },
  {
    id: "memory-flip",
    title: "Memory Flip",
    description: "Train your memory",
    category: "puzzle",
    color: "from-game-puzzle to-game-puzzle/70",
    icon: "☰",
  },
  {
    id: "2048",
    title: "2048",
    description: "Merge the numbers",
    category: "puzzle",
    color: "from-game-puzzle to-game-puzzle/70",
    icon: "◼",
  },
];

export function FeaturedGames() {
  return (
    <section className="my-6">
      <h2 className="text-xl font-bold mb-4">Featured Games</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featuredGames.map((game) => (
          <Link
            key={game.id}
            to={`/game/${game.id}`}
            className="game-card animate-pulse-soft"
          >
            <div className={`bg-gradient-to-br ${game.color} h-40 p-4 rounded-xl flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                <div className="text-4xl font-bold mb-2">{game.icon}</div>
                <span className="bg-white/30 text-xs px-2 py-1 rounded-full">
                  {game.category}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{game.title}</h3>
                <p className="text-sm opacity-90">{game.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
