
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type DailyGame = {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
};

const availableGames: DailyGame[] = [
  {
    id: "tap-dot",
    title: "Tap the Dot",
    description: "How fast can you tap? Challenge your reflexes with this simple but addictive game!",
    category: "arcade",
    color: "bg-game-arcade",
  },
  {
    id: "memory-flip",
    title: "Memory Flip",
    description: "Test your memory by matching pairs of cards. How many can you remember?",
    category: "puzzle",
    color: "bg-game-puzzle",
  },
  {
    id: "2048",
    title: "2048",
    description: "Merge tiles and reach 2048! A classic puzzle game that's easy to learn but hard to master.",
    category: "puzzle",
    color: "bg-game-puzzle",
  },
];

export function DailyPick() {
  const [dailyGame, setDailyGame] = useState<DailyGame>();

  useEffect(() => {
    // In a real app, this would be determined by date or server
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    setDailyGame(availableGames[randomIndex]);
  }, []);

  if (!dailyGame) return null;

  return (
    <section className="my-6">
      <h2 className="text-xl font-bold mb-4">Daily Pick</h2>
      <Link to={`/game/${dailyGame.id}`} className="block">
        <div className={`${dailyGame.color} animate-pulse-soft rounded-xl p-4 shadow-md`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{dailyGame.title}</h3>
              <p className="mt-1 text-sm">{dailyGame.description}</p>
              <span className="mt-2 inline-block rounded-full bg-white/30 px-2.5 py-0.5 text-xs">
                {dailyGame.category}
              </span>
            </div>
            <div className="flex sm:flex-col items-center gap-2">
              <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold">
                Play Now
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
