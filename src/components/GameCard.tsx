
import { Link } from "react-router-dom";

interface GameCardProps {
  title: string;
  gameId: string;
  category: string;
  bgColor: string;
}

export function GameCard({ title, gameId, category, bgColor }: GameCardProps) {
  return (
    <Link to={`/game/${gameId}`} className="block group">
      <div className={`${bgColor} rounded-lg p-6 transform transition-transform group-hover:scale-105 hover:shadow-lg`}>
        <span className="px-2 py-1 text-xs uppercase tracking-wide bg-white bg-opacity-30 rounded-full">
          {category}
        </span>
        <h3 className="text-lg font-bold mt-2">{title}</h3>
      </div>
    </Link>
  );
}
