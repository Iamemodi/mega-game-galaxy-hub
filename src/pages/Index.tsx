
import { Header } from "../components/Header";
import { DailyPick } from "../components/DailyPick";
import { FeaturedGames } from "../components/FeaturedGames";
import { GameCategories } from "../components/GameCategories";
import { RecentGames } from "../components/RecentGames";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { GameCard } from "../components/GameCard";

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
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recently Added Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <GameCard 
              title="Reaction Time Tester" 
              category="Arcade"
              gameId="reaction-tester" 
              bgColor="bg-game-arcade" 
            />
            <GameCard 
              title="Tic Tac Toe" 
              category="Strategy"
              gameId="tic-tac-toe" 
              bgColor="bg-game-strategy" 
            />
            <GameCard 
              title="Tap the Dot" 
              category="Arcade"
              gameId="tap-dot" 
              bgColor="bg-game-arcade" 
            />
            <GameCard 
              title="2048" 
              category="Puzzle"
              gameId="2048" 
              bgColor="bg-game-puzzle" 
            />
            <GameCard 
              title="Memory Flip" 
              category="Puzzle"
              gameId="memory-flip" 
              bgColor="bg-game-puzzle" 
            />
          </div>
        </div>
        
        <FeaturedGames />
        <RecentGames />
      </main>
    </div>
  );
};

export default Index;
