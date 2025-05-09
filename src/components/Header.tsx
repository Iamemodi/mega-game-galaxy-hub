
import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-game-primary">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-game-primary text-white">
          100
        </div>
        <span>Games</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/search" className="rounded-full p-2 hover:bg-muted">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Link>
        <Link to="/" className="rounded-full p-2 hover:bg-muted">
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Link>
      </div>
    </header>
  );
}
