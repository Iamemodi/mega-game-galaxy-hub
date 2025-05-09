
import { Header } from "../components/Header";
import { DailyPick } from "../components/DailyPick";
import { FeaturedGames } from "../components/FeaturedGames";
import { GameCategories } from "../components/GameCategories";
import { RecentGames } from "../components/RecentGames";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-4 pb-20">
        <h1 className="text-3xl font-bold mt-4 mb-6">
          <span className="text-game-primary">100 in 1</span> Games
        </h1>
        
        <DailyPick />
        <GameCategories />
        <FeaturedGames />
        <RecentGames />
      </main>
    </div>
  );
};

export default Index;
