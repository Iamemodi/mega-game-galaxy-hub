
import { Link } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  color: string;
  count: number;
};

const categories: Category[] = [
  { id: "arcade", name: "Arcade", color: "bg-game-arcade", count: 20 },
  { id: "puzzle", name: "Puzzle", color: "bg-game-puzzle", count: 20 },
  { id: "idle", name: "Idle", color: "bg-game-idle", count: 15 },
  { id: "word", name: "Word", color: "bg-game-word", count: 15 },
  { id: "strategy", name: "Strategy", color: "bg-game-strategy", count: 15 },
];

export function GameCategories() {
  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className={`${category.color} flex-none snap-start rounded-lg px-4 py-3 min-w-[120px] font-medium shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200`}
          >
            <div className="flex flex-col">
              <span className="text-lg">{category.name}</span>
              <span className="text-sm opacity-75">{category.count} games</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
