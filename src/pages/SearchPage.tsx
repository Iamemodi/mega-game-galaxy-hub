
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Search as SearchIcon } from "lucide-react";

type GameItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
};

// All available games
const allGames: GameItem[] = [
  {
    id: "tap-dot",
    title: "Tap the Dot",
    description: "Test your reflexes",
    category: "arcade",
    icon: "●",
    color: "bg-game-arcade",
  },
  {
    id: "memory-flip",
    title: "Memory Flip",
    description: "Train your memory",
    category: "puzzle",
    icon: "☰",
    color: "bg-game-puzzle",
  },
  {
    id: "2048",
    title: "2048",
    description: "Merge the numbers",
    category: "puzzle",
    icon: "◼",
    color: "bg-game-puzzle",
  },
];

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredGames = allGames.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Search Games</h1>
        
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search games by name, description or category..."
            className="w-full pl-10 py-3 rounded-lg bg-muted/50 border focus:outline-none focus:ring-2 focus:ring-game-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {searchTerm && (
          <p className="text-sm text-muted-foreground mb-4">
            Found {filteredGames.length} game(s) for "{searchTerm}"
          </p>
        )}
        
        <div className="game-grid">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="game-card animate-pop"
            >
              <div className={`${game.color} h-40 p-4 rounded-xl flex flex-col justify-between`}>
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
          
          {searchTerm && filteredGames.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-muted-foreground">
                No games found matching "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
